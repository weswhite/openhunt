import { Router } from 'express'
import { db, sqlite } from '../db/index.js'

const router = Router()

// Token classification for fuzzy search
const speciesMap: Record<string, string> = {
  deer: 'D', mule: 'D', muledeer: 'D',
  elk: 'E',
  antelope: 'A', pronghorn: 'A',
  moose: 'M',
  bear: 'B',
  goat: 'G', mountaingoat: 'G',
  sheep: 'S', bighorn: 'S',
  'mountain lion': 'C', lion: 'C', cougar: 'C',
}

const sexMap: Record<string, string> = {
  male: 'M', buck: 'M', bull: 'M', ram: 'M', tom: 'M',
  female: 'F', doe: 'F', cow: 'F', ewe: 'F', nanny: 'F',
  either: 'E', eithersex: 'E',
}

const methodMap: Record<string, string> = {
  rifle: 'R',
  muzzleloader: 'M', muzzle: 'M',
  archery: 'A', bow: 'A',
}

router.get('/', (req, res) => {
  const q = (req.query.q as string || '').trim().toLowerCase()
  if (!q) return res.json([])

  const tokens = q.split(/\s+/)
  const conditions: string[] = []
  const params: any[] = []

  // Filter out the word "gmu" — it's just a label, the number is what matters
  const filtered = tokens.filter(t => t !== 'gmu')

  for (const token of filtered) {
    // 1-3 digit number → GMU (zero-pad to 3 digits to match DB)
    if (/^\d{1,3}$/.test(token)) {
      conditions.push('h.gmu = ?')
      params.push(token.padStart(3, '0'))
      continue
    }

    // Species match
    if (speciesMap[token]) {
      conditions.push('h.species = ?')
      params.push(speciesMap[token])
      continue
    }

    // Sex match
    if (sexMap[token]) {
      conditions.push('h.sex = ?')
      params.push(sexMap[token])
      continue
    }

    // Method match
    if (methodMap[token]) {
      conditions.push('h.method = ?')
      params.push(methodMap[token])
      continue
    }

    // Hunt code exact/prefix match
    if (/^[EDAMBGSC]/i.test(token) && token.length >= 4) {
      conditions.push('h.code LIKE ?')
      params.push(token.toUpperCase() + '%')
      continue
    }

    // Fallback: LIKE on search_text
    conditions.push('h.search_text LIKE ?')
    params.push(`%${token}%`)
  }

  const where = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : ''

  const sql = `
    SELECT h.*,
      dr.year as latest_year,
      dr.total_drawn,
      dr.first_choice,
      dr.drawn_out_at,
      dr.total_quota,
      CASE WHEN dr.first_choice > 0
        THEN ROUND(CAST(dr.total_drawn AS REAL) / dr.first_choice * 100, 1)
        ELSE NULL
      END as draw_odds
    FROM hunt_codes h
    LEFT JOIN draw_results dr ON dr.hunt_code = h.code
      AND dr.year = (SELECT MAX(year) FROM draw_results WHERE hunt_code = h.code)
      AND dr.residency = 'R'
    ${where}
    ORDER BY h.code
    LIMIT 50
  `

  try {
    const rows = sqlite.prepare(sql).all(...params)
    res.json(rows)
  } catch (err: any) {
    console.error('Search error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
