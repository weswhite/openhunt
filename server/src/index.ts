import express from 'express'
import cors from 'cors'
import { initDb } from './db/index.js'
import searchRoutes from './routes/search.js'
import huntsRoutes from './routes/hunts.js'

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.use('/api/search', searchRoutes)
app.use('/api/hunts', huntsRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

initDb()

app.listen(PORT, () => {
  console.log(`OpenHunt server running on port ${PORT}`)
})
