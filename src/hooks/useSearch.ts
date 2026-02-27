import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'

export interface SearchResult {
  code: string
  species: string
  species_name: string
  sex_name: string
  gmu: string
  season_name: string
  method_name: string
  search_text: string
  latest_year: number | null
  total_quota: number | null
  total_drawn: number | null
  first_choice: number | null
  drawn_out_at: number | null
  draw_odds: number | null
}

let searchState = {
  query: '',
  results: [] as SearchResult[],
  loading: false,
  listeners: new Set<() => void>(),
}

function notify() {
  searchState.listeners.forEach(fn => fn())
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function setSearchQuery(q: string) {
  searchState.query = q
  searchState.loading = true
  notify()

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!q.trim()) {
      searchState.results = []
      searchState.loading = false
      notify()
      return
    }

    try {
      const results = await api<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`)
      searchState.results = results
    } catch (err) {
      console.error('Search error:', err)
      searchState.results = []
    }
    searchState.loading = false
    notify()
  }, 250)
}

export function useSearch() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1)
    searchState.listeners.add(listener)
    return () => { searchState.listeners.delete(listener) }
  }, [])

  return {
    query: searchState.query,
    results: searchState.results,
    loading: searchState.loading,
    setQuery: setSearchQuery,
  }
}
