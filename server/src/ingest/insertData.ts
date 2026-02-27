import { sqlite } from '../db/index.js'
import { ParseResult } from './parseRecap.js'

export function insertParseResult(result: ParseResult, fileName: string, species: string, year: number) {
  const insertHuntCode = sqlite.prepare(`
    INSERT OR REPLACE INTO hunt_codes (code, species, species_name, sex, sex_name, gmu, season, season_name, method, method_name, search_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertDrawResult = sqlite.prepare(`
    INSERT OR REPLACE INTO draw_results (hunt_code, year, residency, total_quota, resident_quota, landowner_quota, nonresident_quota, youth_quota, first_choice, second_choice, third_choice, fourth_choice, total_drawn, drawn_out_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertPointDist = sqlite.prepare(`
    INSERT OR REPLACE INTO point_distributions (hunt_code, year, residency, points, applicants, drawn)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertLog = sqlite.prepare(`
    INSERT OR REPLACE INTO ingest_log (file_name, species, year, ingested_at, row_count)
    VALUES (?, ?, ?, ?, ?)
  `)

  // Delete existing data for this file to allow re-ingestion
  const deleteDrawResults = sqlite.prepare(
    'DELETE FROM draw_results WHERE hunt_code IN (SELECT code FROM hunt_codes WHERE species = ?) AND year = ?'
  )
  const deletePointDists = sqlite.prepare(
    'DELETE FROM point_distributions WHERE hunt_code IN (SELECT code FROM hunt_codes WHERE species = ?) AND year = ?'
  )

  const speciesCode = result.huntCodes[0]?.species || species[0].toUpperCase()

  const transaction = sqlite.transaction(() => {
    // Clear old data for this species/year
    deleteDrawResults.run(speciesCode, year)
    deletePointDists.run(speciesCode, year)

    // Insert hunt codes
    for (const hc of result.huntCodes) {
      insertHuntCode.run(
        hc.code, hc.species, hc.speciesName, hc.sex, hc.sexName,
        hc.gmu, hc.season, hc.seasonName, hc.method, hc.methodName, hc.searchText
      )
    }

    // Insert draw results
    for (const dr of result.drawResults) {
      insertDrawResult.run(
        dr.huntCode, dr.year, dr.residency,
        dr.totalQuota, dr.residentQuota, dr.landownerQuota, dr.nonresidentQuota, dr.youthQuota,
        dr.firstChoice, dr.secondChoice, dr.thirdChoice, dr.fourthChoice,
        dr.totalDrawn, dr.drawnOutAt
      )
    }

    // Insert point distributions
    for (const pd of result.pointDistributions) {
      insertPointDist.run(pd.huntCode, pd.year, pd.residency, pd.points, pd.applicants, pd.drawn)
    }

    // Log the ingestion
    insertLog.run(fileName, species, year, new Date().toISOString(), result.drawResults.length)
  })

  transaction()

  return {
    huntCodes: result.huntCodes.length,
    drawResults: result.drawResults.length,
    pointDistributions: result.pointDistributions.length,
  }
}
