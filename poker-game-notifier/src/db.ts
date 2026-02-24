import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { GameStateRecord, NotificationRecord } from './scraper/types';

let db: Database.Database;

export function initDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath || process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'poker.db');

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();
  seedVenues();

  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      bravo_slug TEXT,
      poker_atlas_slug TEXT,
      timezone TEXT DEFAULT 'America/Los_Angeles',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_name TEXT NOT NULL,
      game_type TEXT NOT NULL,
      stakes TEXT NOT NULL,
      tables_running INTEGER DEFAULT 0,
      players_seated INTEGER DEFAULT 0,
      waitlist_count INTEGER DEFAULT 0,
      game_status TEXT,
      data_source TEXT,
      polled_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_name TEXT NOT NULL,
      game_type TEXT NOT NULL,
      stakes TEXT NOT NULL,
      trigger_type TEXT,
      channel TEXT,
      message_body TEXT,
      twilio_sid TEXT,
      status TEXT DEFAULT 'sent',
      sent_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_game_states_lookup
      ON game_states (venue_name, game_type, stakes, polled_at);

    CREATE INDEX IF NOT EXISTS idx_notification_log_cooldown
      ON notification_log (venue_name, game_type, stakes, trigger_type, sent_at);
  `);
}

function seedVenues(): void {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM venues').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insert = db.prepare(
    'INSERT INTO venues (name, location, bravo_slug, poker_atlas_slug) VALUES (?, ?, ?, ?)'
  );

  const venues = [
    ['Green Valley Ranch', 'Henderson, NV', 'green-valley-ranch', 'green-valley-ranch-henderson'],
    ['Bellagio', 'Las Vegas, NV', 'bellagio', 'bellagio-las-vegas'],
    ['Aria', 'Las Vegas, NV', 'aria', 'aria-las-vegas'],
    ['Wynn', 'Las Vegas, NV', 'wynn-las-vegas', 'wynn-las-vegas'],
    ['The Venetian', 'Las Vegas, NV', 'the-venetian', 'the-venetian-las-vegas'],
    ['South Point', 'Las Vegas, NV', 'south-point', 'south-point-las-vegas'],
    ['Red Rock Casino', 'Las Vegas, NV', 'red-rock-casino', 'red-rock-casino-las-vegas'],
    ['Resorts World', 'Las Vegas, NV', 'resorts-world', 'resorts-world-las-vegas'],
  ];

  const insertMany = db.transaction(() => {
    for (const v of venues) {
      insert.run(v[0], v[1], v[2], v[3]);
    }
  });

  insertMany();
}

export function getLatestGameState(
  venueName: string,
  gameType: string,
  stakes: string
): GameStateRecord | undefined {
  return db.prepare(`
    SELECT * FROM game_states
    WHERE venue_name = ? AND game_type = ? AND stakes = ?
    ORDER BY polled_at DESC
    LIMIT 1
  `).get(venueName, gameType, stakes) as GameStateRecord | undefined;
}

export function insertGameState(record: Omit<GameStateRecord, 'id'>): void {
  db.prepare(`
    INSERT INTO game_states (venue_name, game_type, stakes, tables_running, players_seated, waitlist_count, game_status, data_source, polled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.venue_name,
    record.game_type,
    record.stakes,
    record.tables_running,
    record.players_seated,
    record.waitlist_count,
    record.game_status,
    record.data_source,
    record.polled_at
  );
}

export function logNotification(record: Omit<NotificationRecord, 'id'>): void {
  db.prepare(`
    INSERT INTO notification_log (venue_name, game_type, stakes, trigger_type, channel, message_body, twilio_sid, status, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.venue_name,
    record.game_type,
    record.stakes,
    record.trigger_type,
    record.channel,
    record.message_body,
    record.twilio_sid || null,
    record.status,
    record.sent_at
  );
}

export function isInCooldown(
  venueName: string,
  gameType: string,
  stakes: string,
  triggerType: string,
  cooldownMinutes: number = 15
): boolean {
  const result = db.prepare(`
    SELECT COUNT(*) as cnt FROM notification_log
    WHERE venue_name = ? AND game_type = ? AND stakes = ? AND trigger_type = ?
      AND sent_at > datetime('now', ? || ' minutes')
      AND status = 'sent'
  `).get(venueName, gameType, stakes, triggerType, `-${cooldownMinutes}`) as { cnt: number };

  return result.cnt > 0;
}
