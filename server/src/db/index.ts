import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

const DB_PATH = process.env.DATABASE_URL || './data/openhunt.db'

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export { sqlite }

export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS hunt_codes (
      code TEXT PRIMARY KEY,
      species TEXT NOT NULL,
      species_name TEXT NOT NULL,
      sex TEXT NOT NULL,
      sex_name TEXT NOT NULL,
      gmu TEXT NOT NULL,
      season TEXT NOT NULL,
      season_name TEXT NOT NULL,
      method TEXT NOT NULL,
      method_name TEXT NOT NULL,
      search_text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS draw_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hunt_code TEXT NOT NULL REFERENCES hunt_codes(code),
      year INTEGER NOT NULL,
      residency TEXT NOT NULL,
      total_quota INTEGER,
      resident_quota INTEGER,
      landowner_quota INTEGER,
      nonresident_quota INTEGER,
      youth_quota INTEGER,
      first_choice INTEGER,
      second_choice INTEGER,
      third_choice INTEGER,
      fourth_choice INTEGER,
      total_drawn INTEGER,
      drawn_out_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS point_distributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hunt_code TEXT NOT NULL REFERENCES hunt_codes(code),
      year INTEGER NOT NULL,
      residency TEXT NOT NULL,
      points INTEGER NOT NULL,
      applicants INTEGER NOT NULL,
      drawn INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ingest_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL UNIQUE,
      species TEXT NOT NULL,
      year INTEGER NOT NULL,
      ingested_at TEXT NOT NULL,
      row_count INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_draw_results_hunt_code ON draw_results(hunt_code);
    CREATE INDEX IF NOT EXISTS idx_draw_results_year ON draw_results(year);
    CREATE INDEX IF NOT EXISTS idx_point_distributions_hunt_code ON point_distributions(hunt_code);
    CREATE INDEX IF NOT EXISTS idx_hunt_codes_search ON hunt_codes(search_text);
    CREATE INDEX IF NOT EXISTS idx_hunt_codes_species ON hunt_codes(species);
    CREATE INDEX IF NOT EXISTS idx_hunt_codes_gmu ON hunt_codes(gmu);
  `)

  console.log('Database initialized')
}
