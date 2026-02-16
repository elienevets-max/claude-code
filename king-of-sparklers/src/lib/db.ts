// =============================================================================
// King of Sparklers Growth Operating System - Database Module
// =============================================================================

import Database, { type Database as DatabaseType } from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'sparklers.db');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Returns the singleton database instance.
 * Used by API routes that import { getDb } from '@/lib/db'.
 */
export function getDb(): DatabaseType {
  return db;
}

/**
 * Initialize all database tables.
 * Uses CREATE TABLE IF NOT EXISTS so it is safe to call multiple times.
 */
export function initDb(): void {
  db.exec(`
    -- Dream 100 CRM Contacts
    CREATE TABLE IF NOT EXISTS contacts (
      id              TEXT PRIMARY KEY,
      company         TEXT NOT NULL,
      contact_name    TEXT NOT NULL,
      email           TEXT NOT NULL,
      phone           TEXT NOT NULL DEFAULT '',
      linkedin        TEXT NOT NULL DEFAULT '',
      category        TEXT NOT NULL CHECK (category IN ('nightclub','hotel','wedding','event')),
      status          TEXT NOT NULL DEFAULT 'prospect'
                        CHECK (status IN ('prospect','contacted','sample_sent','meeting','proposal','won','lost')),
      touches         TEXT NOT NULL DEFAULT '[]',   -- JSON array
      notes           TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Quarterly Rocks
    CREATE TABLE IF NOT EXISTS rocks (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      quarter     TEXT NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
      year        INTEGER NOT NULL,
      progress    INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      status      TEXT NOT NULL DEFAULT 'on_track'
                    CHECK (status IN ('on_track','behind','at_risk','completed')),
      owner       TEXT NOT NULL DEFAULT '',
      due_date    TEXT NOT NULL
    );

    -- Key Performance Indicators
    CREATE TABLE IF NOT EXISTS kpis (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      value     REAL NOT NULL DEFAULT 0,
      target    REAL NOT NULL DEFAULT 0,
      unit      TEXT NOT NULL DEFAULT '',
      period    TEXT NOT NULL DEFAULT '',
      category  TEXT NOT NULL DEFAULT ''
    );

    -- StoryBrand BrandScript
    CREATE TABLE IF NOT EXISTS brand_scripts (
      id                    TEXT PRIMARY KEY,
      hero                  TEXT NOT NULL DEFAULT '',
      external_problem      TEXT NOT NULL DEFAULT '',
      internal_problem      TEXT NOT NULL DEFAULT '',
      philosophical_problem TEXT NOT NULL DEFAULT '',
      guide                 TEXT NOT NULL DEFAULT '',
      empathy               TEXT NOT NULL DEFAULT '',
      authority             TEXT NOT NULL DEFAULT '',
      plan                  TEXT NOT NULL DEFAULT '[]',   -- JSON array
      direct_cta            TEXT NOT NULL DEFAULT '',
      transitional_cta      TEXT NOT NULL DEFAULT '',
      failure               TEXT NOT NULL DEFAULT '',
      success               TEXT NOT NULL DEFAULT '',
      created_at            TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Seasonal Peaks
    CREATE TABLE IF NOT EXISTS seasonal_peaks (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      peak_start      TEXT NOT NULL,
      peak_end        TEXT NOT NULL,
      preload_weeks   INTEGER NOT NULL DEFAULT 4,
      checklist_items TEXT NOT NULL DEFAULT '[]'   -- JSON array
    );

    -- Customer Value Journey
    CREATE TABLE IF NOT EXISTS journey_customers (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      company     TEXT NOT NULL DEFAULT '',
      stage       TEXT NOT NULL DEFAULT 'aware'
                    CHECK (stage IN ('aware','engage','subscribe','convert','excite','ascend','advocate','promote')),
      notes       TEXT NOT NULL DEFAULT '',
      last_action TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Safety Certifications
    CREATE TABLE IF NOT EXISTS safety_certifications (
      id                    TEXT PRIMARY KEY,
      venue_name            TEXT NOT NULL,
      venue_address         TEXT NOT NULL DEFAULT '',
      contact_name          TEXT NOT NULL DEFAULT '',
      contact_email         TEXT NOT NULL DEFAULT '',
      contact_phone         TEXT NOT NULL DEFAULT '',
      certification_number  TEXT NOT NULL DEFAULT '',
      certified_date        TEXT NOT NULL DEFAULT '',
      expiry_date           TEXT NOT NULL DEFAULT '',
      status                TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','audit','certified','expired')),
      checklist_items       TEXT NOT NULL DEFAULT '[]'   -- JSON array
    );

    -- Content Calendar
    CREATE TABLE IF NOT EXISTS content_items (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      pillar          TEXT NOT NULL CHECK (pillar IN ('safety','inspiration','education')),
      platform        TEXT NOT NULL DEFAULT '',
      audience        TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'idea'
                        CHECK (status IN ('idea','drafted','scheduled','published')),
      scheduled_date  TEXT NOT NULL DEFAULT '',
      brief           TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Standard Operating Procedures
    CREATE TABLE IF NOT EXISTS sops (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      category      TEXT NOT NULL CHECK (category IN ('fulfillment','customer_service','b2b_outreach','inventory','social_media','general')),
      steps         TEXT NOT NULL DEFAULT '[]',   -- JSON array
      version       TEXT NOT NULL DEFAULT '1.0',
      last_updated  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Dream 100 Outreach Templates
    CREATE TABLE IF NOT EXISTS outreach_templates (
      id            TEXT PRIMARY KEY,
      touch_number  INTEGER NOT NULL,
      subject       TEXT NOT NULL DEFAULT '',
      body          TEXT NOT NULL DEFAULT '',
      channel       TEXT NOT NULL CHECK (channel IN ('email','phone','linkedin','mail'))
    );

    -- TikTok Shop Products
    CREATE TABLE IF NOT EXISTS tiktok_shop_products (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      sku             TEXT NOT NULL DEFAULT '',
      category        TEXT NOT NULL CHECK (category IN ('wedding','nightclub','event','holiday','vip','starter')),
      price           REAL NOT NULL DEFAULT 0,
      commission_rate REAL NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','active','paused','out_of_stock')),
      sample_status   TEXT NOT NULL DEFAULT 'none'
                        CHECK (sample_status IN ('none','requested','received','filming')),
      tiktok_url      TEXT NOT NULL DEFAULT '',
      notes           TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- TikTok Shop Videos
    CREATE TABLE IF NOT EXISTS tiktok_shop_videos (
      id                TEXT PRIMARY KEY,
      product_id        TEXT NOT NULL REFERENCES tiktok_shop_products(id),
      title             TEXT NOT NULL,
      hook              TEXT NOT NULL DEFAULT '',
      format            TEXT NOT NULL CHECK (format IN ('showcase','tutorial','unboxing','behind_scenes','testimonial','trending')),
      status            TEXT NOT NULL DEFAULT 'idea'
                          CHECK (status IN ('idea','scripted','filmed','editing','posted')),
      views             INTEGER NOT NULL DEFAULT 0,
      likes             INTEGER NOT NULL DEFAULT 0,
      comments          INTEGER NOT NULL DEFAULT 0,
      shares            INTEGER NOT NULL DEFAULT 0,
      orders_generated  INTEGER NOT NULL DEFAULT 0,
      gmv_generated     REAL NOT NULL DEFAULT 0,
      posted_date       TEXT NOT NULL DEFAULT '',
      notes             TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- TikTok Shop Metrics (daily/weekly/monthly snapshots)
    CREATE TABLE IF NOT EXISTS tiktok_shop_metrics (
      id                  TEXT PRIMARY KEY,
      date                TEXT NOT NULL,
      period              TEXT NOT NULL CHECK (period IN ('daily','weekly','monthly')),
      total_gmv           REAL NOT NULL DEFAULT 0,
      total_orders        INTEGER NOT NULL DEFAULT 0,
      total_views         INTEGER NOT NULL DEFAULT 0,
      total_videos_posted INTEGER NOT NULL DEFAULT 0,
      commission_earned   REAL NOT NULL DEFAULT 0,
      top_product         TEXT NOT NULL DEFAULT '',
      notes               TEXT NOT NULL DEFAULT ''
    );
  `);
}

export default db;
