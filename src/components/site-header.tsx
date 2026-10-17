import Link from "next/link"
import { Torii } from "@/components/torii"

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Torii className="size-8 text-primary" />
          <span className="font-serif text-lg tracking-tight">Temple Path</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-foreground/80 hover:text-foreground">
            Plan
          </Link>
          <Link href="/about" className="text-foreground/80 hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}
