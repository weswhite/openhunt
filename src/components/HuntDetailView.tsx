import { ArrowLeft, MapPin, Calendar, Crosshair, Tag } from 'lucide-react'
import { useHuntDetail } from '../hooks/useHuntDetail'
import { DrawOddsTable } from './DrawOddsTable'
import { PointDistribution } from './PointDistribution'

export function HuntDetailView({ code, onBack }: { code: string; onBack: () => void }) {
  const { data, loading, error } = useHuntDetail(code)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-copper-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-copper-500 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-odds-tough text-sm">{error || 'Hunt code not found'}</p>
      </div>
    )
  }

  const { hunt, drawResults, pointDistributions } = data
  const latestResult = drawResults[0]
  const odds = latestResult?.first_choice && latestResult.first_choice > 0
    ? Math.round((latestResult.total_drawn || 0) / latestResult.first_choice * 1000) / 10
    : null

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20">
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #84461A 0%, #C26E2A 30%, #D4852F 50%, #5A7A5F 80%, #3D5542 100%)' }} />
        <div className="bg-white/70 backdrop-blur-md border-b border-paper-200">
          <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-copper-500 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to search
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3D5542 0%, #2E4032 100%)' }}>
                <Crosshair className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-ink-800 tracking-tight" style={{ fontFamily: '"Source Sans 3", system-ui' }}>
                Open<span className="text-copper-500">Hunt</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* Hunt hero */}
        <div className="animate-fade-up">
          <h1 className="font-mono text-2xl font-bold text-olive-700 tracking-wide">{hunt.code}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-copper-400" />
              {hunt.sex_name} {hunt.species_name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-copper-400" />
              GMU {hunt.gmu}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-copper-400" />
              {hunt.season_name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-copper-400" />
              {hunt.method_name}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        {latestResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <StatCard
              label="Draw Odds"
              value={odds !== null ? (odds > 100 ? '100%+' : `${odds}%`) : '—'}
              sub={odds !== null && odds > 100 ? 'Backup friendly' : undefined}
              color={odds === null ? 'default' : odds > 100 ? 'backup' : odds > 50 ? 'green' : odds > 10 ? 'amber' : 'red'}
            />
            <StatCard
              label="Min Points"
              value={latestResult.drawn_out_at !== null ? `${latestResult.drawn_out_at}` : '—'}
              sub={latestResult.year.toString()}
            />
            <StatCard
              label="Quota"
              value={latestResult.total_quota?.toString() || '—'}
              sub="Tags available"
            />
            <StatCard
              label="1st Choice Apps"
              value={latestResult.first_choice?.toString() || '—'}
              sub={latestResult.total_drawn ? `${latestResult.total_drawn} drawn` : undefined}
            />
          </div>
        )}

        {/* Draw Results Table */}
        <section className="mt-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-xl text-ink-800 mb-4">Draw History</h2>
          <div className="bg-white border border-paper-200 rounded-xl overflow-hidden shadow-sm">
            <DrawOddsTable results={drawResults} />
          </div>
        </section>

        {/* Point Distribution */}
        {pointDistributions.length > 0 && (
          <section className="mt-10 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="font-display text-xl text-ink-800 mb-4">Preference Point Breakdown</h2>
            <div className="bg-white border border-paper-200 rounded-xl overflow-hidden shadow-sm">
              <PointDistribution distributions={pointDistributions} />
            </div>
          </section>
        )}
      </main>

    </>
  )
}

function StatCard({ label, value, sub, color = 'default' }: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  const colorMap: Record<string, string> = {
    green: 'text-odds-great',
    amber: 'text-odds-moderate',
    red: 'text-odds-tough',
    backup: 'text-odds-backup',
    default: 'text-ink-700',
  }

  return (
    <div className="bg-white border border-paper-200 rounded-xl px-4 py-3.5 shadow-sm">
      <p className="text-[11px] text-ink-400 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 tabular-nums ${colorMap[color] || colorMap.default}`}>{value}</p>
      {sub && <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p>}
    </div>
  )
}
