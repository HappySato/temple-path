export function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true">
      <rect x="6" y="7" width="36" height="3.2" fill="currentColor" />
      <rect x="9" y="3.2" width="30" height="2.4" fill="currentColor" />
      <path d="M6 7c6-4 30-4 36 0" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="10.2" width="2.6" height="26" fill="currentColor" />
      <rect x="32.4" y="10.2" width="2.6" height="26" fill="currentColor" />
      <rect x="13" y="18" width="22" height="2" fill="currentColor" />
    </svg>
  )
}
