import { Target, TrendingUp, Crosshair } from 'lucide-react'
import { useSearch, SearchResult } from '../hooks/useSearch'

function OddsBadge({ result }: { result: SearchResult }) {
  const { draw_odds: odds } = result

  if (odds === null) return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-400">
      No data
    </span>
  )

  if (odds > 100) {
    return (
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-odds-backup border border-sky-200/60">
        Backup OK
      </span>
    )
  }

  if (odds > 50) return (
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-odds-great border border-emerald-200/60">
      {odds}%
    </span>
  )

  if (odds > 10) return (
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-odds-moderate border border-amber-200/60">
      {odds}%
    </span>
  )

  return (
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-odds-tough border border-red-200/60">
      {odds}%
    </span>
  )
}

function ResultCard({ result, onSelect, index }: { result: SearchResult; onSelect: (code: string) => void; index: number }) {
  const isBackup = result.draw_odds !== null && result.draw_odds > 100

  return (
    <button
      onClick={() => onSelect(result.code)}
      className={`w-full text-left px-5 py-4 bg-white border border-paper-200 rounded-xl hover:border-copper-300 hover:shadow-md hover:shadow-copper-500/8 transition-all duration-200 group animate-fade-up stagger-${Math.min(index + 1, 10)}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-olive-600 tracking-wide group-hover:text-copper-600">
              {result.code}
            </span>
            <OddsBadge result={result} />
          </div>
          <p className="mt-1.5 text-[13px] text-ink-500">
            {result.sex_name} {result.species_name}
            <span className="text-ink-200 mx-1.5">/</span>
            GMU {result.gmu}
            <span className="text-ink-200 mx-1.5">/</span>
            {result.season_name}
            <span className="text-ink-200 mx-1.5">/</span>
            {result.method_name}
          </p>
          {isBackup && result.first_choice !== null && result.total_quota !== null && (
            <p className="mt-1 text-[11px] text-odds-backup">
              {result.first_choice} applied 1st choice for {result.total_quota} tags — good 2nd/3rd/4th choice
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {result.drawn_out_at !== null && (
            <span className="text-xs text-ink-500 tabular-nums font-medium">
              {result.drawn_out_at}+ pts
            </span>
          )}
          {result.latest_year && (
            <span className="text-[11px] text-ink-400">{result.latest_year}</span>
          )}
        </div>
      </div>
    </button>
  )
}

export function SearchResults({ onSelect }: { onSelect: (code: string) => void }) {
  const { results, query, loading } = useSearch()

  if (!query.trim()) {
    return (
      <div className="mt-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-6 text-ink-200 mb-8">
          <Target className="w-8 h-8" strokeWidth={1} />
          <Crosshair className="w-6 h-6" strokeWidth={1} />
          <TrendingUp className="w-7 h-7" strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <p className="text-ink-400 text-sm">Elk, deer, bear, antelope, moose, goat, sheep</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['cow elk 61', 'deer rifle 48', 'bear 85', 'EE201O1A'].map(ex => (
              <button
                key={ex}
                onClick={() => {
                  const input = document.querySelector('input')
                  if (input) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
                    nativeInputValueSetter?.call(input, ex)
                    input.dispatchEvent(new Event('input', { bubbles: true }))
                  }
                }}
                className="px-3 py-1.5 text-xs text-ink-500 bg-white border border-paper-300 rounded-lg hover:border-copper-300 hover:text-copper-600 transition-colors shadow-sm"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!loading && results.length === 0) {
    return (
      <div className="mt-12 text-center animate-fade-in">
        <p className="text-ink-500 text-sm">No results for "{query}"</p>
        <p className="text-ink-400 text-xs mt-1">Try a different species, GMU number, or hunt code</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {!loading && (
        <p className="text-xs text-ink-400 mb-3 px-1">{results.length} result{results.length !== 1 ? 's' : ''}</p>
      )}
      {results.map((r, i) => (
        <ResultCard key={r.code} result={r} onSelect={onSelect} index={i} />
      ))}
    </div>
  )
}
