import { Search } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'

export function SearchBar() {
  const { query, setQuery, loading } = useSearch()

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300 group-focus-within:text-copper-500 transition-colors" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="cow elk 61, deer rifle 48, GMU 85..."
        className="w-full pl-12 pr-12 py-4 bg-white border border-paper-300 rounded-xl text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-copper-400 focus:ring-2 focus:ring-copper-200/40 shadow-lg shadow-ink-900/[0.06] transition-all text-[15px]"
        autoFocus
      />
      {loading && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-copper-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
