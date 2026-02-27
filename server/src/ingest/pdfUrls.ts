// CPW Draw Recap PDF URLs from cpw.widen.net
// These are the public draw recap reports published by Colorado Parks & Wildlife
// Sourced from cpw.state.co.us/hunting/big-game/{species}/statistics

export interface PdfSource {
  url: string
  species: string
  speciesCode: string
  year: number
  fileName: string
}

// Verified PDF URLs from CPW website
export const pdfSources: PdfSource[] = [
  // Deer - from cpw.state.co.us/hunting/big-game/deer/statistics
  { url: 'https://cpw.widen.net/s/r9bjfnqlbc/postdrawrecapreport_deer-25_05102025_1540', species: 'Deer', speciesCode: 'D', year: 2025, fileName: '2025-deer-draw-recap' },
  { url: 'https://cpw.widen.net/s/drbww92qtk/2024-primary-deer-post-draw-report', species: 'Deer', speciesCode: 'D', year: 2024, fileName: '2024-deer-draw-recap' },
  { url: 'https://cpw.widen.net/s/7bcmqkddrn/2023deerdrawrecap', species: 'Deer', speciesCode: 'D', year: 2023, fileName: '2023-deer-draw-recap' },
  { url: 'https://cpw.widen.net/s/srqhwvssqn/2022deerdrawrecap', species: 'Deer', speciesCode: 'D', year: 2022, fileName: '2022-deer-draw-recap' },
  { url: 'https://cpw.widen.net/s/t5dp6nvfrv/2021deerdrawrecap', species: 'Deer', speciesCode: 'D', year: 2021, fileName: '2021-deer-draw-recap' },
  { url: 'https://cpw.widen.net/s/dgkfhz2cvp/2020deerdrawrecap', species: 'Deer', speciesCode: 'D', year: 2020, fileName: '2020-deer-draw-recap' },

  // Bear - from cpw.state.co.us/hunting/big-game/bear/statistics
  { url: 'https://cpw.widen.net/s/szwnfghlfp/postdrawrecapreport_bear-25_05072025_1542', species: 'Bear', speciesCode: 'B', year: 2025, fileName: '2025-bear-draw-recap' },
  { url: 'https://cpw.widen.net/s/zjbcxkchlh/2024-primary-bear-post-draw-report', species: 'Bear', speciesCode: 'B', year: 2024, fileName: '2024-bear-draw-recap' },
  { url: 'https://cpw.widen.net/s/dvwvpclrd5/2023beardrawrecap', species: 'Bear', speciesCode: 'B', year: 2023, fileName: '2023-bear-draw-recap' },
  { url: 'https://cpw.widen.net/s/m6vqw2jctl/2022beardrawrecap', species: 'Bear', speciesCode: 'B', year: 2022, fileName: '2022-bear-draw-recap' },
  { url: 'https://cpw.widen.net/s/whd2cbqknk/2021beardrawrecap', species: 'Bear', speciesCode: 'B', year: 2021, fileName: '2021-bear-draw-recap' },
  { url: 'https://cpw.widen.net/s/hcfkjqxhqx/2020beardrawrecap', species: 'Bear', speciesCode: 'B', year: 2020, fileName: '2020-bear-draw-recap' },

  // Elk
  { url: 'https://cpw.widen.net/s/qh6nqttnnz/postdrawrecapreport_elk-25_05172025_0612', species: 'Elk', speciesCode: 'E', year: 2025, fileName: '2025-elk-draw-recap' },
]

export function getSourcesForFilter(options: { species?: string; year?: number }): PdfSource[] {
  return pdfSources.filter(s => {
    if (options.species && s.species.toLowerCase() !== options.species.toLowerCase()) return false
    if (options.year && s.year !== options.year) return false
    return true
  })
}
