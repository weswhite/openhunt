import { Router } from 'express'
import { sqlite } from '../db/index.js'

const router = Router()

router.get('/:code', (req, res) => {
  const { code } = req.params

  const hunt = sqlite.prepare('SELECT * FROM hunt_codes WHERE code = ?').get(code)
  if (!hunt) {
    return res.status(404).json({ error: 'Hunt code not found' })
  }

  const drawResults = sqlite.prepare(
    'SELECT * FROM draw_results WHERE hunt_code = ? ORDER BY year DESC, residency'
  ).all(code)

  const pointDistributions = sqlite.prepare(
    'SELECT * FROM point_distributions WHERE hunt_code = ? ORDER BY year DESC, residency, points'
  ).all(code)

  res.json({
    hunt,
    drawResults,
    pointDistributions,
  })
})

export default router
