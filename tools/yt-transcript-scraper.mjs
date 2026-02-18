#!/usr/bin/env node
/**
 * yt-transcript-scraper.mjs
 *
 * Uses Playwright to open each YouTube video, click "Show transcript",
 * and extract the text. No audio recording or Whisper needed.
 *
 * Usage:
 *   node tools/yt-transcript-scraper.mjs [--start N] [--count N] [--headed]
 *   node tools/yt-transcript-scraper.mjs --login
 *
 * Options:
 *   --start N    Start from video index N (0-based, default: 0)
 *   --count N    Process N videos in this batch (default: 10)
 *   --headed     Run with visible browser (default: headless)
 *   --slow       Add delays for slower connections
 *   --login      Open browser so you can sign into YouTube. Saves your
 *                session so future runs can access members-only videos.
 *   --logout     Delete saved YouTube session
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

// Dynamic import — works with both local and global playwright installs
let chromium;
try {
    ({ chromium } = await import('playwright'));
} catch {
    try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        ({ chromium } = require('playwright'));
    } catch {
        console.error('ERROR: Playwright not found. Install it with:');
        console.error('  npm install playwright');
        console.error('  npx playwright install chromium');
        process.exit(1);
    }
}

// ===== Configuration =====
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PL3KSApovQlbnOM2QWLWQgg_Bd_qhPusxR';
const OUTPUT_DIR = join(process.cwd(), 'transcripts');
const PROGRESS_FILE = join(process.cwd(), 'transcripts', '.progress.json');
const AUTH_FILE = join(process.cwd(), 'transcripts', '.yt-auth.json');

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (flag, def) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
};
const START_INDEX = parseInt(getArg('--start', '0'));
const BATCH_COUNT = parseInt(getArg('--count', '10'));
const HEADED = args.includes('--headed');
const SLOW = args.includes('--slow');
const LOGIN_MODE = args.includes('--login');
const LOGOUT_MODE = args.includes('--logout');

mkdirSync(OUTPUT_DIR, { recursive: true });

// Load progress
function loadProgress() {
    try {
        return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch {
        return { completed: [], failed: [], videoList: [] };
    }
}

function saveProgress(progress) {
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Sanitize filename
function sanitizeFilename(title) {
    return title
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 80);
}

async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// Helper: wait for user to press Enter in the terminal
function waitForEnter(prompt) {
    return new Promise(resolve => {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        rl.question(prompt, () => { rl.close(); resolve(); });
    });
}

// ===== Login Mode =====
async function loginFlow() {
    console.log('\n========================================');
    console.log('  YouTube Login');
    console.log('========================================');
    console.log('A browser window will open to YouTube.');
    console.log('Sign in with your Google account that has the membership.');
    console.log('Once you are fully signed in, come back here and press Enter.\n');

    // Try real Chrome first (Google blocks Playwright's bundled Chromium),
    // then Edge, then fall back to Chromium with a warning.
    let browser;
    let channelUsed = 'chromium';
    for (const ch of ['chrome', 'msedge', null]) {
        try {
            browser = await chromium.launch({
                headless: false,
                ...(ch ? { channel: ch } : {}),
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
            channelUsed = ch || 'chromium';
            break;
        } catch {
            // channel not installed, try next
        }
    }
    if (!browser) {
        console.error('ERROR: Could not launch any browser. Install Chrome or run: npx playwright install chromium');
        process.exit(1);
    }

    if (channelUsed === 'chromium') {
        console.log('  NOTE: Using Playwright Chromium — Google may block sign-in.');
        console.log('  Install Chrome or Edge for a smoother login experience.\n');
    } else {
        console.log(`  Using ${channelUsed} browser.\n`);
    }

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 900 }
    });

    const page = await context.newPage();

    // Hide automation indicators so Google doesn't block sign-in
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        // Remove Playwright-injected properties
        delete window.__playwright;
        delete window.__pw_manual;
    });

    await page.goto('https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    });

    await waitForEnter('>>> Press ENTER here after you have signed into YouTube in the browser... ');

    // Give YouTube a moment to settle after login
    await delay(2000);

    // Verify login by checking the YouTube page
    await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);

    const isLoggedIn = await page.evaluate(() => {
        // Check for avatar button (signed-in indicator)
        const avatar = document.querySelector('#avatar-btn, button#avatar-btn, img.yt-spec-avatar-shape__image');
        return !!avatar;
    });

    if (isLoggedIn) {
        // Save the full browser state (cookies + localStorage)
        const state = await context.storageState();
        writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
        console.log('\n  Login SAVED successfully!');
        console.log(`  Auth file: ${AUTH_FILE}`);
        console.log('  Future runs will automatically use this session.');
        console.log('  Run with --logout to clear saved login.\n');
    } else {
        console.log('\n  WARNING: Could not verify login.');
        console.log('  Saving session state anyway...');
        const state = await context.storageState();
        writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
        console.log(`  Auth file: ${AUTH_FILE}`);
        console.log('  Try running the scraper — if videos still fail, run --login again.\n');
    }

    await browser.close();
    return;
}

// ===== Logout Mode =====
function logoutFlow() {
    if (existsSync(AUTH_FILE)) {
        unlinkSync(AUTH_FILE);
        console.log('\n  YouTube session cleared. You will need to --login again for members-only videos.\n');
    } else {
        console.log('\n  No saved session found. Nothing to clear.\n');
    }
}

// ===== Main =====
async function main() {
    // Handle --login and --logout before anything else
    if (LOGOUT_MODE) { logoutFlow(); return; }
    if (LOGIN_MODE) { await loginFlow(); return; }

    const progress = loadProgress();
    const hasAuth = existsSync(AUTH_FILE);

    // If we have auth now, clear the failed list so those videos get retried
    if (hasAuth && progress.failed.length > 0) {
        console.log(`  Clearing ${progress.failed.length} previously failed videos (will retry with login)...`);
        progress.failed = [];
        saveProgress(progress);
    }

    console.log('\n========================================');
    console.log('  YouTube Transcript Scraper');
    console.log('========================================');
    console.log(`Batch: videos ${START_INDEX + 1} to ${START_INDEX + BATCH_COUNT}`);
    console.log(`Mode: ${HEADED ? 'visible browser' : 'headless'}`);
    console.log(`Auth: ${hasAuth ? 'LOGGED IN (saved session)' : 'not logged in (run --login for members-only videos)'}`);
    console.log(`Output: ${OUTPUT_DIR}/`);
    console.log('');

    // Try real Chrome first, then Edge, then Playwright Chromium
    let browser;
    for (const ch of ['chrome', 'msedge', null]) {
        try {
            browser = await chromium.launch({
                headless: !HEADED,
                ...(ch ? { channel: ch } : {}),
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
            break;
        } catch {
            // channel not installed, try next
        }
    }
    if (!browser) {
        console.error('ERROR: Could not launch any browser.');
        process.exit(1);
    }

    // Load saved auth state if available
    const contextOptions = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 900 }
    };
    if (hasAuth) {
        try {
            contextOptions.storageState = JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
        } catch (err) {
            console.log('  WARNING: Could not load saved auth. Running without login.');
        }
    }

    const context = await browser.newContext(contextOptions);

    const page = await context.newPage();

    // Hide automation indicators
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // Step 1: Get playlist video list
    console.log('[1/3] Loading playlist page...');
    await page.goto(PLAYLIST_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);

    // Dismiss cookie/consent dialog if present
    try {
        const consentBtn = page.locator('button:has-text("Accept"), button:has-text("Reject all"), button:has-text("I agree")');
        if (await consentBtn.count() > 0) {
            await consentBtn.first().click();
            await delay(1000);
        }
    } catch {}

    // Extract video links from playlist page
    console.log('[2/3] Extracting video list...');
    await delay(2000);

    // Scroll to load all videos
    for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await delay(800);
    }

    const videos = await page.evaluate(() => {
        const items = document.querySelectorAll('ytd-playlist-video-renderer, a#video-title');
        const results = [];
        const seen = new Set();
        items.forEach(item => {
            let link, title;
            if (item.tagName === 'A') {
                link = item.href;
                title = item.textContent.trim();
            } else {
                const a = item.querySelector('a#video-title');
                if (!a) return;
                link = a.href;
                title = a.textContent.trim();
            }
            if (link && link.includes('watch') && !seen.has(link)) {
                seen.add(link);
                // Extract video ID
                const match = link.match(/[?&]v=([^&]+)/);
                if (match) {
                    results.push({ id: match[1], title, url: link });
                }
            }
        });
        return results;
    });

    if (videos.length === 0) {
        console.error('ERROR: Could not find any videos in the playlist.');
        console.error('The page might require login or the playlist may be private.');
        await browser.close();
        process.exit(1);
    }

    console.log(`Found ${videos.length} videos in playlist.`);
    progress.videoList = videos;
    saveProgress(progress);

    // Step 2: Process each video in the batch
    const endIndex = Math.min(START_INDEX + BATCH_COUNT, videos.length);
    console.log(`\n[3/3] Processing videos ${START_INDEX + 1} to ${endIndex}...\n`);

    let succeeded = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = START_INDEX; i < endIndex; i++) {
        const video = videos[i];
        const padded = String(i + 1).padStart(3, '0');
        const safeName = sanitizeFilename(video.title);
        const filename = `${padded}_-_${safeName}.txt`;
        const filepath = join(OUTPUT_DIR, filename);

        // Skip if already completed
        if (existsSync(filepath) && readFileSync(filepath, 'utf-8').trim().length > 50) {
            console.log(`  [${i + 1}/${videos.length}] SKIP (already done): ${video.title.substring(0, 60)}`);
            skipped++;
            if (!progress.completed.includes(i)) progress.completed.push(i);
            continue;
        }

        console.log(`  [${i + 1}/${videos.length}] Processing: ${video.title.substring(0, 60)}...`);

        try {
            const transcript = await extractTranscript(page, video.url);

            if (transcript && transcript.length > 50) {
                writeFileSync(filepath, transcript);
                console.log(`    -> Saved: ${filename} (${transcript.length} chars)`);
                succeeded++;
                if (!progress.completed.includes(i)) progress.completed.push(i);
            } else {
                console.log(`    -> WARNING: Transcript too short or empty, trying alternative method...`);
                const altTranscript = await extractFromCaptions(page, video.url);
                if (altTranscript && altTranscript.length > 50) {
                    writeFileSync(filepath, altTranscript);
                    console.log(`    -> Saved (from captions): ${filename} (${altTranscript.length} chars)`);
                    succeeded++;
                    if (!progress.completed.includes(i)) progress.completed.push(i);
                } else {
                    console.log(`    -> FAILED: No transcript available`);
                    failed++;
                    if (!progress.failed.includes(i)) progress.failed.push(i);
                }
            }
        } catch (err) {
            console.error(`    -> ERROR: ${err.message}`);
            failed++;
            if (!progress.failed.includes(i)) progress.failed.push(i);
        }

        saveProgress(progress);

        // Delay between videos
        if (SLOW) await delay(3000);
        else await delay(1500);
    }

    await browser.close();

    // Summary
    console.log('\n========================================');
    console.log('  Batch Complete');
    console.log('========================================');
    console.log(`  Succeeded: ${succeeded}`);
    console.log(`  Skipped:   ${skipped} (already done)`);
    console.log(`  Failed:    ${failed}`);
    console.log(`  Total done: ${progress.completed.length} / ${videos.length}`);
    console.log(`  Transcripts: ${OUTPUT_DIR}/`);

    if (endIndex < videos.length) {
        console.log(`\n  Next batch: node tools/yt-transcript-scraper.mjs --start ${endIndex} --count ${BATCH_COUNT}`);
    } else {
        console.log('\n  All videos processed!');
    }
    console.log('');
}

/**
 * Method 1: Click "Show transcript" in YouTube's UI
 */
async function extractTranscript(page, videoUrl) {
    await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);

    // Dismiss any dialogs
    try {
        const dismissBtn = page.locator('button:has-text("Dismiss"), button:has-text("No thanks"), #dismiss-button');
        if (await dismissBtn.count() > 0) await dismissBtn.first().click({ timeout: 2000 });
    } catch {}

    // Scroll down to load the description area
    await page.evaluate(() => window.scrollBy(0, 400));
    await delay(1500);

    // Try to click the "...more" button to expand description
    try {
        const moreBtn = page.locator('tp-yt-paper-button#expand, #description-inline-expander #expand');
        if (await moreBtn.count() > 0) {
            await moreBtn.first().click({ timeout: 3000 });
            await delay(1000);
        }
    } catch {}

    // Try clicking "Show transcript" button
    try {
        const showTranscriptBtn = page.locator('button:has-text("Show transcript"), [aria-label="Show transcript"]');
        if (await showTranscriptBtn.count() > 0) {
            await showTranscriptBtn.first().click({ timeout: 5000 });
            await delay(2500);

            // Extract transcript segments
            const segments = await page.evaluate(() => {
                const container = document.querySelector('ytd-transcript-renderer, ytd-transcript-search-panel-renderer');
                if (!container) return null;

                const segmentEls = container.querySelectorAll('ytd-transcript-segment-renderer, .segment');
                if (segmentEls.length === 0) return null;

                return Array.from(segmentEls).map(seg => {
                    const text = seg.querySelector('.segment-text, yt-formatted-string.segment-text, [class*="segment-text"]');
                    return text ? text.textContent.trim() : seg.textContent.trim();
                }).filter(t => t.length > 0);
            });

            if (segments && segments.length > 0) {
                return segments.join('\n');
            }
        }
    } catch (err) {
        // Transcript panel not available, will try alternative
    }

    // Try the three-dot menu approach
    try {
        const menuBtn = page.locator('#button-shape button[aria-label="More actions"], button.yt-spec-button-shape-next[aria-label="More actions"]');
        if (await menuBtn.count() > 0) {
            await menuBtn.first().click({ timeout: 3000 });
            await delay(1000);

            const transcriptItem = page.locator('tp-yt-paper-listbox ytd-menu-service-item-renderer:has-text("Show transcript")');
            if (await transcriptItem.count() > 0) {
                await transcriptItem.first().click({ timeout: 3000 });
                await delay(2500);

                const segments = await page.evaluate(() => {
                    const segs = document.querySelectorAll('ytd-transcript-segment-renderer');
                    return Array.from(segs).map(seg => {
                        const text = seg.querySelector('.segment-text, yt-formatted-string');
                        return text ? text.textContent.trim() : '';
                    }).filter(t => t.length > 0);
                });

                if (segments && segments.length > 0) {
                    return segments.join('\n');
                }
            }
        }
    } catch {}

    return null;
}

/**
 * Method 2: Extract from YouTube's timed text API (captions)
 */
async function extractFromCaptions(page, videoUrl) {
    try {
        // Navigate to the video page
        await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await delay(2000);

        // Extract caption track URL from page source
        const captionUrl = await page.evaluate(() => {
            // Look in ytInitialPlayerResponse
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const text = script.textContent;
                if (text.includes('captionTracks')) {
                    const match = text.match(/"captionTracks":\s*(\[.*?\])/);
                    if (match) {
                        try {
                            const tracks = JSON.parse(match[1]);
                            // Prefer English auto-generated
                            const enTrack = tracks.find(t =>
                                t.languageCode === 'en' ||
                                (t.name && t.name.simpleText && t.name.simpleText.includes('English'))
                            ) || tracks[0];
                            return enTrack ? enTrack.baseUrl : null;
                        } catch { return null; }
                    }
                }
            }

            // Try from ytInitialPlayerResponse global
            try {
                const pr = window.ytInitialPlayerResponse;
                if (pr && pr.captions && pr.captions.playerCaptionsTracklistRenderer) {
                    const tracks = pr.captions.playerCaptionsTracklistRenderer.captionTracks;
                    if (tracks && tracks.length > 0) {
                        const enTrack = tracks.find(t => t.languageCode === 'en') || tracks[0];
                        return enTrack.baseUrl;
                    }
                }
            } catch {}

            return null;
        });

        if (!captionUrl) return null;

        // Fetch the caption XML
        const response = await page.evaluate(async (url) => {
            const resp = await fetch(url);
            return await resp.text();
        }, captionUrl);

        if (!response) return null;

        // Parse XML captions - extract text content
        const lines = response
            .match(/<text[^>]*>(.*?)<\/text>/gs)
            ?.map(m => {
                const textMatch = m.match(/<text[^>]*>(.*?)<\/text>/s);
                return textMatch ? textMatch[1]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/<[^>]+>/g, '')
                    .trim() : '';
            })
            .filter(t => t.length > 0);

        if (lines && lines.length > 0) {
            return lines.join('\n');
        }

        return null;
    } catch (err) {
        return null;
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
