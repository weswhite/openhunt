import { initDb } from '../db/index.js'
import { pdfSources, getSourcesForFilter, PdfSource } from './pdfUrls.js'
import { parseRecapText } from './parseRecap.js'
import { insertParseResult } from './insertData.js'
import { sqlite } from '../db/index.js'

async function fetchAndParsePdf(source: PdfSource): Promise<void> {
  // Check if already ingested
  const existing = sqlite.prepare('SELECT id FROM ingest_log WHERE file_name = ?').get(source.fileName)
  if (existing) {
    console.log(`  Skipping ${source.fileName} (already ingested)`)
    return
  }

  console.log(`  Fetching ${source.url}...`)

  const response = await fetch(source.url)
  if (!response.ok) {
    console.error(`  Failed to fetch ${source.fileName}: HTTP ${response.status}`)
    return
  }

  // Check if we got a PDF or a redirect/HTML page
  const contentType = response.headers.get('content-type') || ''

  let buffer: Buffer
  if (contentType.includes('pdf')) {
    buffer = Buffer.from(await response.arrayBuffer())
  } else {
    // cpw.widen.net returns an HTML page with an embedded PDF viewer
    // The actual PDF URL is in: window.viewerPdfUrl = '...'
    const html = await response.text()
    const viewerMatch = html.match(/viewerPdfUrl\s*=\s*'([^']+)'/)
    const pdfUrl = viewerMatch?.[1]

    if (!pdfUrl) {
      console.error(`  Could not find PDF viewer URL in ${source.fileName}`)
      // Dump some context for debugging
      const titleMatch = html.match(/<title>([^<]+)</)
      console.error(`  Page title: ${titleMatch?.[1] || 'unknown'}`)
      return
    }

    console.log(`  Downloading PDF from CDN...`)
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      console.error(`  Failed to fetch PDF: HTTP ${pdfResponse.status}`)
      return
    }
    buffer = Buffer.from(await pdfResponse.arrayBuffer())
  }

  // Parse PDF
  const pdfParse = (await import('pdf-parse')).default
  const pdf = await pdfParse(buffer)
  console.log(`  Parsed ${pdf.numpages} pages, ${pdf.text.length} chars`)

  // Parse the text
  const result = parseRecapText(pdf.text, source)
  console.log(`  Found ${result.huntCodes.length} hunt codes, ${result.drawResults.length} draw results, ${result.pointDistributions.length} point distributions`)

  if (result.huntCodes.length === 0) {
    console.warn(`  WARNING: No hunt codes found in ${source.fileName}. PDF format may need parser adjustment.`)
    // Dump first 2000 chars for debugging
    console.log('  First 2000 chars of PDF text:')
    console.log(pdf.text.substring(0, 2000))
    return
  }

  // Insert into database
  const counts = insertParseResult(result, source.fileName, source.species, source.year)
  console.log(`  Inserted: ${counts.huntCodes} codes, ${counts.drawResults} results, ${counts.pointDistributions} point dists`)
}

async function main() {
  const args = process.argv.slice(2)
  let species: string | undefined
  let year: number | undefined
  let forceRerun = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--species' && args[i + 1]) {
      species = args[++i]
    } else if (args[i] === '--year' && args[i + 1]) {
      year = parseInt(args[++i], 10)
    } else if (args[i] === '--all') {
      // No filter
    } else if (args[i] === '--force') {
      forceRerun = true
    }
  }

  console.log('OpenHunt PDF Ingestion')
  console.log('======================')

  initDb()

  if (forceRerun) {
    console.log('Force mode: clearing ingest log')
    sqlite.prepare('DELETE FROM ingest_log').run()
  }

  const sources = species || year
    ? getSourcesForFilter({ species, year })
    : pdfSources

  console.log(`\nProcessing ${sources.length} PDF(s)...\n`)

  for (const source of sources) {
    console.log(`[${source.year} ${source.species}]`)
    try {
      await fetchAndParsePdf(source)
    } catch (err: any) {
      console.error(`  Error: ${err.message}`)
    }
    console.log()
  }

  // Print summary
  const totalCodes = sqlite.prepare('SELECT COUNT(*) as count FROM hunt_codes').get() as any
  const totalResults = sqlite.prepare('SELECT COUNT(*) as count FROM draw_results').get() as any
  const totalDists = sqlite.prepare('SELECT COUNT(*) as count FROM point_distributions').get() as any

  console.log('======================')
  console.log(`Total hunt codes: ${totalCodes.count}`)
  console.log(`Total draw results: ${totalResults.count}`)
  console.log(`Total point distributions: ${totalDists.count}`)
}

main().catch(console.error)
