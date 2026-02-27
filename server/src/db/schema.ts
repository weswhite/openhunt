import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ============================================================
// HUNT CODES
// ============================================================
export const huntCodes = sqliteTable('hunt_codes', {
  code: text('code').primaryKey(),
  species: text('species').notNull(),       // E, D, A, M, B, G, S, C
  speciesName: text('species_name').notNull(), // Elk, Deer, Antelope, etc.
  sex: text('sex').notNull(),               // M, F, E
  sexName: text('sex_name').notNull(),       // Male, Female, Either Sex
  gmu: text('gmu').notNull(),               // e.g. "481"
  season: text('season').notNull(),          // e.g. "O" for Oct
  seasonName: text('season_name').notNull(),
  method: text('method').notNull(),          // 1=Rifle, 2=Muzzle, etc.
  methodName: text('method_name').notNull(),
  searchText: text('search_text').notNull(), // concatenated for LIKE
})

// ============================================================
// DRAW RESULTS
// ============================================================
export const drawResults = sqliteTable('draw_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  huntCode: text('hunt_code').notNull().references(() => huntCodes.code),
  year: integer('year').notNull(),
  residency: text('residency').notNull(),    // R or NR
  totalQuota: integer('total_quota'),
  residentQuota: integer('resident_quota'),
  landownerQuota: integer('landowner_quota'),
  nonresidentQuota: integer('nonresident_quota'),
  youthQuota: integer('youth_quota'),
  firstChoice: integer('first_choice'),
  secondChoice: integer('second_choice'),
  thirdChoice: integer('third_choice'),
  fourthChoice: integer('fourth_choice'),
  totalDrawn: integer('total_drawn'),
  drawnOutAt: integer('drawn_out_at'),       // min PP level to draw
})

// ============================================================
// POINT DISTRIBUTIONS
// ============================================================
export const pointDistributions = sqliteTable('point_distributions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  huntCode: text('hunt_code').notNull().references(() => huntCodes.code),
  year: integer('year').notNull(),
  residency: text('residency').notNull(),
  points: integer('points').notNull(),       // 0-25+
  applicants: integer('applicants').notNull(),
  drawn: integer('drawn').notNull(),
})

// ============================================================
// INGEST LOG
// ============================================================
export const ingestLog = sqliteTable('ingest_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileName: text('file_name').notNull().unique(),
  species: text('species').notNull(),
  year: integer('year').notNull(),
  ingestedAt: text('ingested_at').notNull(),
  rowCount: integer('row_count').notNull(),
})
