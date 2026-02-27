import { DrawResult } from '../hooks/useHuntDetail'

function oddsColor(odds: number | null): string {
  if (odds === null) return 'text-ink-400'
  if (odds > 100) return 'text-odds-backup'
  if (odds > 50) return 'text-odds-great'
  if (odds > 10) return 'text-odds-moderate'
  return 'text-odds-tough'
}

function oddsBg(odds: number | null): string {
  if (odds === null) return ''
  if (odds > 100) return 'bg-sky-50/60'
  if (odds > 50) return 'bg-emerald-50/60'
  if (odds > 10) return 'bg-amber-50/60'
  return 'bg-red-50/60'
}

export function DrawOddsTable({ results }: { results: DrawResult[] }) {
  if (results.length === 0) {
    return <p className="text-ink-400 text-sm px-5 py-4">No draw data available</p>
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-paper-200">
              <th className="text-left py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Year</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Quota</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">1st Choice</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium hidden sm:table-cell">2nd</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium hidden sm:table-cell">3rd</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium hidden md:table-cell">4th</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Drawn</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Odds</th>
              <th className="text-right py-3 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Min Pts</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const odds = r.first_choice && r.first_choice > 0
                ? Math.round((r.total_drawn || 0) / r.first_choice * 1000) / 10
                : null
              const isBackup = odds !== null && odds > 100

              return (
                <tr
                  key={`${r.year}-${r.residency}`}
                  className={`border-b border-paper-100 transition-colors hover:bg-paper-50 ${i === 0 ? 'bg-copper-50/30' : ''}`}
                >
                  <td className="py-2.5 px-4 font-medium text-ink-700 tabular-nums">{r.year}</td>
                  <td className="py-2.5 px-4 text-right text-ink-500 tabular-nums">{r.total_quota ?? '—'}</td>
                  <td className="py-2.5 px-4 text-right text-ink-600 font-medium tabular-nums">{r.first_choice ?? '—'}</td>
                  <td className="py-2.5 px-4 text-right text-ink-400 tabular-nums hidden sm:table-cell">{r.second_choice ?? '—'}</td>
                  <td className="py-2.5 px-4 text-right text-ink-400 tabular-nums hidden sm:table-cell">{r.third_choice ?? '—'}</td>
                  <td className="py-2.5 px-4 text-right text-ink-400 tabular-nums hidden md:table-cell">{r.fourth_choice ?? '—'}</td>
                  <td className="py-2.5 px-4 text-right text-ink-600 tabular-nums">{r.total_drawn ?? '—'}</td>
                  <td className={`py-2.5 px-4 text-right font-semibold tabular-nums ${oddsColor(odds)}`}>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${oddsBg(odds)}`}>
                      {odds === null ? '—' : odds > 100 ? '100%+' : `${odds}%`}
                      {isBackup && (
                        <span className="text-[10px] font-normal text-odds-backup">backup</span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-ink-700 tabular-nums">
                    {r.drawn_out_at !== null ? `${r.drawn_out_at}+` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-paper-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-odds-backup" /> 100%+ backup friendly
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-odds-great" /> &gt;50% good
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-odds-moderate" /> 10–50% moderate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-odds-tough" /> &lt;10% competitive
        </span>
      </div>
    </div>
  )
}
