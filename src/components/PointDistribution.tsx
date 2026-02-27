import { useState } from 'react'
import { PointDist } from '../hooks/useHuntDetail'

export function PointDistribution({ distributions }: { distributions: PointDist[] }) {
  const years = [...new Set(distributions.map(d => d.year))].sort((a, b) => b - a)
  const [selectedYear, setSelectedYear] = useState(years[0] || 0)
  const [residency, setResidency] = useState<'R' | 'NR'>('R')

  if (distributions.length === 0) {
    return <p className="text-ink-400 text-sm px-5 py-4">No preference point data available</p>
  }

  const filtered = distributions
    .filter(d => d.year === selectedYear && d.residency === residency)
    .sort((a, b) => a.points - b.points)

  const totalApplicants = filtered.reduce((sum, d) => sum + d.applicants, 0)
  const totalDrawn = filtered.reduce((sum, d) => sum + d.drawn, 0)
  const maxApplicants = Math.max(...filtered.map(d => d.applicants), 1)

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-paper-200">
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-paper-50 border border-paper-300 rounded-lg px-3 py-1.5 text-sm text-ink-700 focus:outline-none focus:border-copper-400 focus:ring-1 focus:ring-copper-200/40"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <div className="flex rounded-lg border border-paper-300 overflow-hidden">
          {(['R', 'NR'] as const).map(r => (
            <button
              key={r}
              onClick={() => setResidency(r)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                residency === r
                  ? 'bg-olive-600 text-white'
                  : 'bg-white text-ink-500 hover:bg-paper-100'
              }`}
            >
              {r === 'R' ? 'Resident' : 'Non-Res'}
            </button>
          ))}
        </div>

        {totalApplicants > 0 && (
          <span className="ml-auto text-[11px] text-ink-400">
            {totalDrawn} drawn / {totalApplicants} applied
          </span>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-ink-400 text-sm px-4 py-6 text-center">No data for this selection</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-paper-200">
              <th className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium w-16">Points</th>
              <th className="text-right py-2.5 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Applied</th>
              <th className="text-right py-2.5 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Drawn</th>
              <th className="text-right py-2.5 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium">Success</th>
              <th className="py-2.5 px-4 text-[11px] uppercase tracking-wider text-ink-400 font-medium text-left" style={{ width: '40%' }}>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => {
              const pct = d.applicants > 0 ? (d.drawn / d.applicants * 100) : 0
              const barWidth = (d.applicants / maxApplicants * 100)
              const drawnWidth = d.drawn > 0 ? (d.drawn / maxApplicants * 100) : 0
              const allDrawn = d.applicants > 0 && d.drawn >= d.applicants

              return (
                <tr key={d.points} className="border-b border-paper-100 hover:bg-paper-50 transition-colors">
                  <td className="py-2 px-4 font-mono font-medium text-ink-700">{d.points}</td>
                  <td className="py-2 px-4 text-right text-ink-500 tabular-nums">{d.applicants}</td>
                  <td className={`py-2 px-4 text-right tabular-nums font-medium ${d.drawn > 0 ? 'text-olive-500' : 'text-ink-300'}`}>
                    {d.drawn > 0 ? d.drawn : '—'}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums">
                    {d.applicants > 0 && d.drawn > 0 ? (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        allDrawn
                          ? 'bg-emerald-50 text-odds-great'
                          : pct > 50
                            ? 'text-odds-good'
                            : pct > 0
                              ? 'text-odds-moderate'
                              : 'text-ink-400'
                      }`}>
                        {allDrawn ? '100%' : `${pct.toFixed(0)}%`}
                      </span>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <div className="relative h-4 rounded-full bg-paper-100 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-paper-300 transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                      {drawnWidth > 0 && (
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                            allDrawn ? 'bg-olive-300/60' : 'bg-olive-200/60'
                          }`}
                          style={{ width: `${drawnWidth}%` }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-paper-100 flex items-center gap-4 text-[11px] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-6 h-2 rounded-full bg-paper-300" /> Applied
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-6 h-2 rounded-full bg-olive-200/60" /> Drawn
        </span>
      </div>
    </div>
  )
}
