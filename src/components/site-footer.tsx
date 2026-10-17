import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Temple Path · Izumo and Matsue. Not affiliated with the shrines or with Qloo.</p>
        <p>
          <Link href="/about#license" className="underline-offset-4 hover:underline">
            MIT license
          </Link>
        </p>
      </div>
    </footer>
  )
}
