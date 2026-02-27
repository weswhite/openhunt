import { Heart } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="border-t border-paper-200 bg-white/40 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <span className="text-xs text-ink-300">
          Data from CPW public draw recaps
        </span>

        <a
          href="https://ko-fi.com/openhunt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #C26E2A 0%, #D4852F 100%)' }}
        >
          <Heart className="w-4 h-4" fill="white" strokeWidth={0} />
          <span>Support on Ko-fi</span>
        </a>
      </div>
    </footer>
  )
}
