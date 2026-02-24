import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

let db: Database.Database | null = null;

function getDbPath(): string {
  return process.env.DB_PATH || path.resolve(__dirname, '..', '..', '..', 'data', 'poker.db');
}

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found at ${dbPath}. Is the poller running?`);
  }

  db = new Database(dbPath, { readonly: true });
  db.pragma('journal_mode = WAL');
  return db;
}

export interface LiveGameRow {
  venue_name: string;
  game_type: string;
  stakes: string;
  tables_running: number;
  players_seated: number;
  waitlist_count: number;
  game_status: string;
  data_source: string;
  polled_at: string;
}

/**
 * Returns the latest game state for every (venue, game_type, stakes) combination.
 */
export function getLatestGameStates(): LiveGameRow[] {
  const sql = `
    SELECT gs.*
    FROM game_states gs
    INNER JOIN (
      SELECT venue_name, game_type, stakes, MAX(polled_at) AS max_polled
      FROM game_states
      GROUP BY venue_name, game_type, stakes
    ) latest
      ON gs.venue_name = latest.venue_name
      AND gs.game_type = latest.game_type
      AND gs.stakes = latest.stakes
      AND gs.polled_at = latest.max_polled
    ORDER BY gs.venue_name, gs.stakes
  `;

  return getDb().prepare(sql).all() as LiveGameRow[];
}

/**
 * Returns the most recent poll timestamp across all games.
 */
export function getLastPollTime(): string | null {
  const row = getDb()
    .prepare('SELECT MAX(polled_at) AS last_poll FROM game_states')
    .get() as { last_poll: string | null };
  return row?.last_poll ?? null;
}
