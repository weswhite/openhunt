import { useState, useEffect } from 'react'
import { Crosshair, Heart } from 'lucide-react'
import { SearchBar } from './components/SearchBar'
import { SearchResults } from './components/SearchResults'
import { HuntDetailView } from './components/HuntDetailView'
import { AppFooter } from './components/AppFooter'

function AppHeader() {
  return (
    <header className="sticky top-0 z-20">
      {/* Accent line */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #84461A 0%, #C26E2A 30%, #D4852F 50%, #5A7A5F 80%, #3D5542 100%)' }} />

      <div className="bg-white/70 backdrop-blur-md border-b border-paper-200">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3D5542 0%, #2E4032 100%)' }}>
              <Crosshair className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-ink-800 tracking-tight" style={{ fontFamily: 'Barlow, system-ui' }}>
                Open<span className="text-copper-500">Hunt</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-olive-50 text-olive-500 text-[10px] font-semibold tracking-wider uppercase border border-olive-100">
                Colorado
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[12px] text-ink-300">
              Draw odds & preference points
            </span>
            <a
              href="https://github.com/weswhite/openhunt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-ink-500 hover:text-ink-800 hover:bg-paper-100 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              <span className="hidden sm:inline">Open Source</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [selectedCode, setSelectedCode] = useState<string | null>(() => {
    const hash = window.location.hash.slice(1)
    return hash || null
  })

  useEffect(() => {
    function onHash() {
      const hash = window.location.hash.slice(1)
      setSelectedCode(hash || null)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function handleSelect(code: string) {
    setSelectedCode(code)
    window.location.hash = code
  }

  function handleBack() {
    setSelectedCode(null)
    history.pushState(null, '', window.location.pathname)
  }

  if (selectedCode) {
    return (
      <div className="topo-bg grain min-h-screen flex flex-col">
        <HuntDetailView code={selectedCode} onBack={handleBack} />
        <div className="flex-1" />
        <AppFooter />
      </div>
    )
  }

  return (
    <div className="topo-bg grain min-h-screen flex flex-col">
      <AppHeader />

      {/* Search */}
      <main className="max-w-5xl mx-auto px-5 pt-12 pb-20 w-full flex-1">
        <div className="max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-4xl text-ink-800 text-center mb-2 animate-fade-up">
            Find your hunt
          </h2>
          <p className="text-center text-ink-400 text-sm mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            Search by species, GMU, method, or hunt code
          </p>
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <SearchBar />
          </div>
        </div>

        <SearchResults onSelect={handleSelect} />
      </main>

      <AppFooter />
    </div>
  )
}
