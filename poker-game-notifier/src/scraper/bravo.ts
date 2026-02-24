import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { GameData } from './types';
import { logger } from '../logger';

const BASE_URL = 'https://www.bravopokerlive.com';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

let browser: Browser | null = null;
let context: BrowserContext | null = null;

// Per-venue backoff state
const venueBackoff: Map<string, { delay: number; lastFailure: number }> = new Map();
const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes
const INITIAL_BACKOFF_MS = 2000;

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getJitter(): number {
  return Math.floor(Math.random() * 10000) - 5000; // ±5 seconds in ms
}

export async function initBrowser(): Promise<void> {
  if (browser) return;

  logger.info('Launching Playwright browser...');
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
  });

  logger.info('Browser initialized');
}

export async function closeBrowser(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
  logger.info('Browser closed');
}

function shouldBackoff(venueSlug: string): boolean {
  const state = venueBackoff.get(venueSlug);
  if (!state) return false;

  const elapsed = Date.now() - state.lastFailure;
  return elapsed < state.delay;
}

function recordFailure(venueSlug: string): void {
  const state = venueBackoff.get(venueSlug);
  const currentDelay = state ? Math.min(state.delay * 2, MAX_BACKOFF_MS) : INITIAL_BACKOFF_MS;
  venueBackoff.set(venueSlug, { delay: currentDelay, lastFailure: Date.now() });
}

function clearBackoff(venueSlug: string): void {
  venueBackoff.delete(venueSlug);
}

export async function scrapeVenue(venueSlug: string, venueName: string): Promise<GameData[]> {
  if (!context) {
    throw new Error('Browser not initialized. Call initBrowser() first.');
  }

  if (shouldBackoff(venueSlug)) {
    const state = venueBackoff.get(venueSlug)!;
    const remainingMs = state.delay - (Date.now() - state.lastFailure);
    logger.warn(`Venue "${venueName}" is in backoff, skipping for ${Math.round(remainingMs / 1000)}s`, {
      venueSlug,
    });
    return [];
  }

  // Add jitter to avoid synchronized requests
  const jitter = getJitter();
  if (jitter > 0) {
    await new Promise((resolve) => setTimeout(resolve, jitter));
  }

  let page: Page | null = null;

  try {
    // Rotate user agent per request
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    page = await context.newPage();

    const url = `${BASE_URL}/venues/${venueSlug}/`;
    logger.info(`Scraping venue: ${venueName}`, { url });

    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load venue page: HTTP ${response?.status() || 'unknown'}`);
    }

    // Wait for dynamic content to render
    // Bravo Poker Live loads game data via JavaScript
    await page.waitForTimeout(3000);

    // Try to find game data in the page
    // Strategy 1: Look for structured game data in tables or list elements
    const games = await extractGameData(page, venueName, venueSlug);

    clearBackoff(venueSlug);
    logger.info(`Scraped ${games.length} games from ${venueName}`, {
      venueSlug,
      gameCount: games.length,
    });

    return games;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to scrape venue: ${venueName}`, {
      venueSlug,
      error: errorMessage,
    });
    recordFailure(venueSlug);
    return [];
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

async function extractGameData(page: Page, venueName: string, venueSlug: string): Promise<GameData[]> {
  const games: GameData[] = [];
  const now = new Date().toISOString();

  // Strategy 1: Intercept API/XHR responses that contain game data
  // Check if there's JSON data embedded in the page or loaded via fetch
  const jsonData = await page.evaluate(() => {
    // Look for game data in common patterns:
    // 1. Check window/global variables
    const win = window as unknown as Record<string, unknown>;
    if (win.__NEXT_DATA__) return win.__NEXT_DATA__;
    if (win.__INITIAL_STATE__) return win.__INITIAL_STATE__;
    if (win.gameData) return win.gameData;
    if (win.pokerData) return win.pokerData;

    // 2. Look for JSON-LD structured data
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLdScripts.length > 0) {
      return Array.from(jsonLdScripts).map((s) => {
        try {
          return JSON.parse(s.textContent || '');
        } catch {
          return null;
        }
      });
    }

    return null;
  });

  if (jsonData) {
    logger.debug('Found embedded JSON data in page', { venueSlug });
    // Parse the JSON data if it matches expected game format
    const parsed = parseJsonGameData(jsonData, venueName, now);
    if (parsed.length > 0) return parsed;
  }

  // Strategy 2: Parse DOM elements for game table data
  // Look for common table/list patterns showing poker games
  const domGames = await page.evaluate(() => {
    const results: Array<{
      gameType: string;
      stakes: string;
      tables: string;
      players: string;
      waitlist: string;
      status: string;
    }> = [];

    // Look for table rows containing game data
    const rows = Array.from(document.querySelectorAll('table tr, .game-row, .game-item, [class*="game"], [class*="cash"]'));
    for (const row of rows) {
      const text = row.textContent || '';

      // Look for patterns like "NL Hold'em", "1/2", "2/5", etc.
      const stakesMatch = text.match(/(\d+\/\d+(?:\/\d+)?)/);
      const gameTypeMatch = text.match(/(NL Hold'em|No Limit Hold'em|PLO|Pot Limit Omaha|Omaha Hi-Lo|Mixed)/i);

      if (stakesMatch && gameTypeMatch) {
        // Try to extract table count, player count, waitlist
        const tablesMatch = text.match(/(\d+)\s*(?:table|tbl)/i);
        const playersMatch = text.match(/(\d+)\s*(?:player|seat|plyr)/i);
        const waitlistMatch = text.match(/(\d+)\s*(?:wait|wl)/i);

        results.push({
          gameType: gameTypeMatch[1],
          stakes: stakesMatch[1],
          tables: tablesMatch?.[1] || '0',
          players: playersMatch?.[1] || '0',
          waitlist: waitlistMatch?.[1] || '0',
          status: text.includes('Running') || tablesMatch ? 'Running' : 'Interest List',
        });
      }
    }

    // Strategy 3: Look for any elements with data attributes
    const dataElements = Array.from(document.querySelectorAll('[data-game-type], [data-stakes], [data-tables]'));
    for (const el of dataElements) {
      const gameType = el.getAttribute('data-game-type') || '';
      const stakes = el.getAttribute('data-stakes') || '';
      const tables = el.getAttribute('data-tables') || '0';
      const players = el.getAttribute('data-players') || '0';
      const waitlist = el.getAttribute('data-waitlist') || '0';

      if (gameType && stakes) {
        results.push({
          gameType,
          stakes,
          tables,
          players,
          waitlist,
          status: parseInt(tables, 10) > 0 ? 'Running' : 'Interest List',
        });
      }
    }

    return results;
  });

  for (const g of domGames) {
    const normalizedType = normalizeGameType(g.gameType);
    games.push({
      venue_name: venueName,
      game_type: normalizedType,
      stakes: g.stakes,
      tables_running: parseInt(g.tables, 10) || 0,
      players_seated: parseInt(g.players, 10) || 0,
      waitlist_count: parseInt(g.waitlist, 10) || 0,
      game_status: g.status,
      data_source: 'bravo',
      timestamp: now,
    });
  }

  // Strategy 4: Full page text parsing as last resort
  if (games.length === 0) {
    const pageText = await page.textContent('body');
    if (pageText) {
      const textGames = parsePageText(pageText, venueName, now);
      games.push(...textGames);
    }
  }

  // Deduplicate games by (game_type + stakes)
  const seen = new Set<string>();
  return games.filter((g) => {
    const key = `${g.game_type}|${g.stakes}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeGameType(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes('no limit') || lower.includes('nl') || lower === 'nlh') {
    return 'NL Hold\'em';
  }
  if (lower.includes('pot limit omaha') || lower === 'plo') {
    return 'PLO';
  }
  if (lower.includes('omaha hi-lo') || lower.includes('omaha hi/lo') || lower === 'o8') {
    return 'Omaha Hi-Lo';
  }
  if (lower.includes('mixed')) {
    return 'Mixed';
  }
  return raw;
}

function parseJsonGameData(data: unknown, venueName: string, timestamp: string): GameData[] {
  const games: GameData[] = [];

  if (!data || typeof data !== 'object') return games;

  // Recursively search for game-like objects in the JSON
  const searchForGames = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        searchForGames(item);
      }
      return;
    }

    const record = obj as Record<string, unknown>;

    // Check if this object looks like game data
    const hasGameType = 'game_type' in record || 'gameType' in record || 'game' in record;
    const hasStakes = 'stakes' in record || 'blinds' in record || 'limit' in record;

    if (hasGameType && hasStakes) {
      const gameType = String(record.game_type || record.gameType || record.game || '');
      const stakes = String(record.stakes || record.blinds || record.limit || '');

      games.push({
        venue_name: venueName,
        game_type: normalizeGameType(gameType),
        stakes,
        tables_running: Number(record.tables_running || record.tables || record.tableCount || 0),
        players_seated: Number(record.players_seated || record.players || record.playerCount || 0),
        waitlist_count: Number(record.waitlist_count || record.waitlist || record.waitlistCount || 0),
        game_status: String(record.game_status || record.status || 'Unknown'),
        data_source: 'bravo',
        timestamp,
      });
    }

    // Recurse into nested objects
    for (const value of Object.values(record)) {
      if (typeof value === 'object') {
        searchForGames(value);
      }
    }
  };

  searchForGames(data);
  return games;
}

function parsePageText(text: string, venueName: string, timestamp: string): GameData[] {
  const games: GameData[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const stakesMatch = line.match(/(\d+\/\d+(?:\/\d+)?)/);
    const gameTypeMatch = line.match(/(NL Hold'em|No Limit Hold'em|PLO|Pot Limit Omaha|Omaha Hi-Lo|Mixed|NLH)/i);

    if (stakesMatch && gameTypeMatch) {
      const tablesMatch = line.match(/(\d+)\s*(?:table|tbl)/i);

      games.push({
        venue_name: venueName,
        game_type: normalizeGameType(gameTypeMatch[1]),
        stakes: stakesMatch[1],
        tables_running: tablesMatch ? parseInt(tablesMatch[1], 10) : 0,
        players_seated: 0,
        waitlist_count: 0,
        game_status: tablesMatch ? 'Running' : 'Unknown',
        data_source: 'bravo',
        timestamp,
      });
    }
  }

  return games;
}
