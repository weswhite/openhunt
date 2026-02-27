import { PdfSource } from './pdfUrls.js'

// Hunt code format: [Species][Sex][GMU 3-digit][SeasonType][SeasonNum][Method]
// E.g., DM048O1M = Deer Male GMU-048 Regular 1st-Season Muzzleloader
// Source: https://www.hunter-ed.com/colorado/studyGuide/Hunt-Codes-cont./20300601_166219/
const HUNT_CODE_RE = /^[EDAMBGSC][MFE]\d{3}[A-Z]\d[RAMX]$/

const SPECIES_NAMES: Record<string, string> = {
  E: 'Elk', D: 'Deer', A: 'Antelope', M: 'Moose',
  B: 'Bear', G: 'Mountain Goat', S: 'Bighorn Sheep', C: 'Mountain Lion',
}

const SEX_NAMES: Record<string, string> = {
  M: 'Male', F: 'Female', E: 'Either Sex',
}

// Season type (position 5) + season number (position 6) together define the season
// E.g., O1 = 1st Regular season, O2 = 2nd Regular season, P1 = Private Land Only, etc.
const SEASON_TYPE_NAMES: Record<string, string> = {
  E: 'Early', K: 'Youth', L: 'Plains', N: 'Late',
  O: '', P: 'Private Land', S: 'Special', W: 'Ranching for Wildlife',
  J: 'Ranching for Wildlife',
}

// Method of take (last character)
const METHOD_NAMES: Record<string, string> = {
  R: 'Rifle',
  M: 'Muzzleloader',
  A: 'Archery',
  X: 'Season Choice',
}

export interface ParsedHuntCode {
  code: string
  species: string
  speciesName: string
  sex: string
  sexName: string
  gmu: string
  season: string
  seasonName: string
  method: string
  methodName: string
  residency: string
  searchText: string
}

export interface ParsedDrawResult {
  huntCode: string
  year: number
  residency: string
  totalQuota: number | null
  residentQuota: number | null
  landownerQuota: number | null
  nonresidentQuota: number | null
  youthQuota: number | null
  firstChoice: number | null
  secondChoice: number | null
  thirdChoice: number | null
  fourthChoice: number | null
  totalDrawn: number | null
  drawnOutAt: number | null
}

export interface ParsedPointDist {
  huntCode: string
  year: number
  residency: string
  points: number
  applicants: number
  drawn: number
}

export interface ParseResult {
  huntCodes: ParsedHuntCode[]
  drawResults: ParsedDrawResult[]
  pointDistributions: ParsedPointDist[]
}

function getSuffix(n: string): string {
  switch (n) {
    case '1': return 'st'
    case '2': return 'nd'
    case '3': return 'rd'
    default: return 'th'
  }
}

export function decodeHuntCode(code: string): ParsedHuntCode | null {
  if (!HUNT_CODE_RE.test(code)) return null

  const species = code[0]
  const sex = code[1]
  const gmu = code.substring(2, 5)
  const seasonType = code[5]
  const seasonNum = code[6]
  const method = code[7]

  const speciesName = SPECIES_NAMES[species] || species
  const sexName = SEX_NAMES[sex] || sex
  const methodName = METHOD_NAMES[method] || `Method ${method}`

  // Build season name from type + number
  const typePrefix = SEASON_TYPE_NAMES[seasonType]
  const seasonName = typePrefix !== undefined
    ? `${typePrefix}${typePrefix ? ' ' : ''}${seasonNum}${getSuffix(seasonNum)} Season`.trim()
    : `Season ${seasonType}${seasonNum}`

  const season = `${seasonType}${seasonNum}`

  const searchText = [
    code, speciesName, sexName, `GMU ${gmu}`, gmu,
    seasonName, methodName,
  ].join(' ').toLowerCase()

  return {
    code,
    species,
    speciesName,
    sex,
    sexName,
    gmu,
    season,
    seasonName,
    method,
    methodName,
    residency: 'R', // Draw recap PDFs are resident data
    searchText,
  }
}

// Split text into sections, one per hunt code
// Each section starts with `# DrawnHunt CodeList` followed by `<digits><huntcode>`
function splitIntoSections(text: string): string[] {
  // Split on the page headers that contain hunt code data
  const sections: string[] = []
  const marker = '# DrawnHunt CodeList'
  let pos = text.indexOf(marker)

  while (pos !== -1) {
    const nextPos = text.indexOf(marker, pos + marker.length)
    const section = nextPos !== -1
      ? text.substring(pos, nextPos)
      : text.substring(pos)
    sections.push(section)
    pos = nextPos
  }

  return sections
}

// Extract hunt code and total drawn from section header
// Pattern: `<digits><8-char-huntcode><trailing>`
function extractHuntCodeFromSection(section: string): { code: string; totalDrawn: number } | null {
  // Look for a line with digits followed by a hunt code
  const lines = section.split('\n')
  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim()
    // Match: digits + 8-char hunt code
    const match = trimmed.match(/^(\d+)([EDAMBGSC][MFE]\d{3}[A-Z]\d[RAM])/)
    if (match) {
      return { code: match[2], totalDrawn: parseInt(match[1], 10) }
    }
  }
  return null
}

// Extract total quota from section
function extractTotalQuota(section: string): number | null {
  const match = section.match(/Total Quota\s*\n?\s*Amount\s*\n?\s*(\d+)/i)
  return match ? parseInt(match[1], 10) : null
}

// Extract drawn out at (minimum preference points needed)
function extractDrawnOutAt(section: string): number | null {
  const match = section.match(/Drawn Out At\s*\n?\s*(\d+)\s*Pref/i)
  return match ? parseInt(match[1], 10) : null
}

// Extract "Total Choice N" values from the header summary section
// These appear between "General Apps/LPP Apps" and "Pre-Draw Applicants"
function extractTotalChoiceValues(section: string): number[] {
  const values: number[] = []
  // Find the FIRST set of "Total Choice" lines (header summary)
  // They appear after "General AppsLPP Apps" and before "Pre-Draw Applicants"
  const headerEnd = section.indexOf('Pre-Draw Applicants')
  const headerSection = headerEnd > 0 ? section.substring(0, headerEnd) : section.substring(0, 2000)

  for (let choice = 1; choice <= 4; choice++) {
    const re = new RegExp(`Total Choice ${choice}\\s+(\\d+)`)
    const match = headerSection.match(re)
    if (match) {
      values.push(parseInt(match[1], 10))
    }
  }
  return values
}

// Determine the LPP column width and extract general apps from concatenated values.
// CPW PDF text concatenates "General Apps" and "LPP Apps" columns.
// Try splitting with LPP width 1 and 2, pick the best fit.
function splitGeneralApps(totalChoiceValues: number[], totalDrawn: number): number[] {
  if (totalChoiceValues.length === 0) return []

  let bestWidth = 0 // fallback: use full number
  let bestScore = Infinity

  // Try larger widths first; on tie, prefer larger width (smaller Gen = more realistic)
  for (const width of [2, 1]) {
    const gens: number[] = []
    const lpps: number[] = []
    let valid = true

    for (const val of totalChoiceValues) {
      const str = val.toString()
      if (str.length <= width) { valid = false; break }
      const gen = parseInt(str.substring(0, str.length - width), 10)
      const lpp = parseInt(str.substring(str.length - width), 10)
      gens.push(gen)
      lpps.push(lpp)
    }

    if (!valid) continue

    let violations = 0

    // Critical check: total Gen across all choices must be >= totalDrawn
    // (you can't draw more people than applied)
    const totalGenApps = gens.reduce((a, b) => a + b, 0)
    if (totalGenApps < totalDrawn) {
      violations += 100 // impossible — wrong width
    }

    // Check Gen is decreasing (Choice 1 >= Choice 2 >= ...)
    for (let i = 1; i < gens.length; i++) {
      if (gens[i] > gens[i - 1]) violations += 2
    }

    // Penalize if LPP shows increasing trend (first to last)
    if (lpps.length >= 2 && lpps[lpps.length - 1] > lpps[0] * 1.5) {
      violations += 3
    }

    // Prefer width where Gen Choice 1 is reasonable relative to totalDrawn
    const ratio = gens[0] / totalDrawn
    if (ratio < 0.1) violations += 10 // Gen way too small
    if (ratio > 20) violations += 3  // Gen unreasonably large

    if (violations < bestScore) {
      bestScore = violations
      bestWidth = width
    }
  }

  if (bestWidth === 0) return totalChoiceValues

  return totalChoiceValues.map(val => {
    const str = val.toString()
    if (str.length <= bestWidth) return val
    return parseInt(str.substring(0, str.length - bestWidth), 10)
  })
}

// Extract preference point distributions by using the Grand Total lines
// from Pre-Draw and Post-Draw sections.
// The row-level data has concatenated columns that can't be reliably split,
// so we use a two-pass approach: for each point level, count applicants and drawn
// from rows where columns are dash-separated (unambiguous) only.
function extractPointDistributions(
  section: string, huntCode: string, year: number, residency: string
): ParsedPointDist[] {
  const dists: ParsedPointDist[] = []

  const preDrawStart = section.indexOf('Pre-Draw Applicants')
  const postDrawStart = section.indexOf('Post-Draw Successful')
  if (preDrawStart < 0 || postDrawStart < 0) return dists

  const preDrawSection = section.substring(preDrawStart, postDrawStart)
  const postDrawSection = section.substring(postDrawStart)

  const preDrawRows = extractPPRows(preDrawSection)
  const postDrawRows = extractPPRows(postDrawSection)

  for (const preRow of preDrawRows) {
    const postRow = postDrawRows.find(r => r.points === preRow.points)
    dists.push({
      huntCode,
      year,
      residency,
      points: preRow.points,
      applicants: preRow.total,
      drawn: postRow?.total || 0,
    })
  }

  return dists
}

interface PPRow {
  points: number
  total: number
}

// Parse PP rows from the Choice 1 block.
// Each row is: <pointLevel><col1><col2><col3><col4><col5><col6>
// where columns are either numbers or dashes (zeros).
// We can only reliably parse rows where dashes separate the numbers,
// so we use a conservative approach.
function extractPPRows(text: string): PPRow[] {
  const rows: PPRow[] = []
  const lines = text.split('\n')

  let inBlock = false
  let foundChoiceHeader = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^1$/.test(trimmed) && !foundChoiceHeader) {
      foundChoiceHeader = true
      inBlock = true
      continue
    }

    if (trimmed.startsWith('Total Choice')) {
      if (inBlock) break
      continue
    }

    if (!inBlock) continue
    if (!trimmed || /^[A-Z]/.test(trimmed)) continue

    // Match: point level (1-2 digits) followed by data
    const match = trimmed.match(/^(\d{1,2})([\d\-]+)$/)
    if (!match) continue

    const points = parseInt(match[1], 10)
    if (points > 30) continue

    const rest = match[2]

    // Split on dashes to get individual number segments
    // E.g., "52-----" → rest = "2-----" → segments = ["2", "", "", "", "", ""]
    // E.g., "210103---" → rest = "10103---" → segments = ["10103", "", "", ""]
    // For rows with dashes, we can identify individual numbers more reliably
    const segments = rest.split('-')

    // Count how many dashes vs digits
    const dashCount = (rest.match(/-/g) || []).length
    const digitCount = rest.replace(/-/g, '').length

    let total: number

    if (dashCount >= 3) {
      // Most columns are zero (dashes) — we can sum the digit segments reliably
      total = 0
      for (const seg of segments) {
        if (seg) total += parseInt(seg, 10)
      }
    } else if (dashCount === 0 && digitCount <= 6) {
      // All columns have values, concatenated. Can't reliably split.
      // Skip this row for now — we'll miss PP level 0 (most populated) but
      // the drawn-out-at value captures the key info
      continue
    } else {
      // Mix of dashes and numbers — try to sum segments
      total = 0
      for (const seg of segments) {
        if (seg) total += parseInt(seg, 10)
      }
    }

    if (total >= 0) {
      rows.push({ points, total })
    }
  }

  return rows
}

// Main parse function
export function parseRecapText(text: string, source: PdfSource): ParseResult {
  const huntCodes: ParsedHuntCode[] = []
  const drawResults: ParsedDrawResult[] = []
  const pointDistributions: ParsedPointDist[] = []

  const sections = splitIntoSections(text)

  for (const section of sections) {
    const header = extractHuntCodeFromSection(section)
    if (!header) continue

    const decoded = decodeHuntCode(header.code)
    if (!decoded) continue

    // Only add if not already present
    if (!huntCodes.find(h => h.code === decoded.code)) {
      huntCodes.push(decoded)
    }

    const totalQuota = extractTotalQuota(section)
    const totalDrawn = header.totalDrawn
    const drawnOutAt = extractDrawnOutAt(section)

    // Extract first choice applicants
    const totalChoiceValues = extractTotalChoiceValues(section)
    const generalApps = totalDrawn > 0
      ? splitGeneralApps(totalChoiceValues, totalDrawn)
      : totalChoiceValues

    const firstChoice = generalApps[0] || null
    const secondChoice = generalApps[1] || null
    const thirdChoice = generalApps[2] || null
    const fourthChoice = generalApps[3] || null

    // Create draw result for resident view
    // The section combines R and NR data; we store as the hunt code's residency
    drawResults.push({
      huntCode: header.code,
      year: source.year,
      residency: decoded.residency,
      totalQuota,
      residentQuota: null,
      landownerQuota: null,
      nonresidentQuota: null,
      youthQuota: null,
      firstChoice,
      secondChoice,
      thirdChoice,
      fourthChoice,
      totalDrawn,
      drawnOutAt,
    })

    // Extract preference point distributions
    const ppDists = extractPointDistributions(
      section, header.code, source.year, decoded.residency
    )
    pointDistributions.push(...ppDists)
  }

  return { huntCodes, drawResults, pointDistributions }
}
