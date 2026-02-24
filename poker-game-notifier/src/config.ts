import * as fs from 'fs';
import * as path from 'path';
import { AppConfig, VenueConfig } from './scraper/types';

const CONFIG_PATH = path.resolve(__dirname, '..', 'config.json');

export function loadConfig(): AppConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at ${CONFIG_PATH}`);
  }

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse config.json: invalid JSON`);
  }

  const config = parsed as AppConfig;
  validateConfig(config);
  return config;
}

function validateConfig(config: AppConfig): void {
  if (!config.watchlist || !Array.isArray(config.watchlist)) {
    throw new Error('Config must contain a "watchlist" array');
  }

  if (config.watchlist.length === 0) {
    throw new Error('Watchlist must contain at least one venue');
  }

  for (const venue of config.watchlist) {
    validateVenueConfig(venue);
  }
}

function validateVenueConfig(venue: VenueConfig): void {
  if (!venue.venue || typeof venue.venue !== 'string') {
    throw new Error('Each watchlist entry must have a "venue" name');
  }

  if (!venue.location || typeof venue.location !== 'string') {
    throw new Error(`Venue "${venue.venue}" must have a "location"`);
  }

  if (!venue.games || !Array.isArray(venue.games) || venue.games.length === 0) {
    throw new Error(`Venue "${venue.venue}" must have at least one game in "games" array`);
  }

  for (const game of venue.games) {
    if (!game.type || typeof game.type !== 'string') {
      throw new Error(`Each game in venue "${venue.venue}" must have a "type"`);
    }
    if (!game.stakes || typeof game.stakes !== 'string') {
      throw new Error(`Each game in venue "${venue.venue}" must have "stakes"`);
    }
  }

  const validTriggers = ['game_starts', 'game_stops', 'waitlist_threshold', 'tables_added'];
  if (venue.notify_when && !validTriggers.includes(venue.notify_when)) {
    throw new Error(
      `Venue "${venue.venue}" has invalid notify_when: "${venue.notify_when}". Must be one of: ${validTriggers.join(', ')}`
    );
  }

  const validMethods = ['sms', 'call', 'push'];
  if (venue.notification_methods) {
    for (const method of venue.notification_methods) {
      if (!validMethods.includes(method)) {
        throw new Error(
          `Venue "${venue.venue}" has invalid notification method: "${method}". Must be one of: ${validMethods.join(', ')}`
        );
      }
    }
  }

  if (venue.quiet_hours) {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(venue.quiet_hours.start) || !timeRegex.test(venue.quiet_hours.end)) {
      throw new Error(
        `Venue "${venue.venue}" quiet_hours must be in HH:MM format`
      );
    }
  }
}
