import { Etiquette } from "@/components/etiquette"
import { Planner } from "@/components/planner"

export default function HomePage() {
  return (
    <main>
      <section className="hero-wash border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <p className="text-xs tracking-[0.22em] text-primary uppercase">Izumo / Matsue</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight md:text-6xl">
            A path through the shrines, fitted to what you already love.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Visitors get the same top-ten list. Temple Path asks Qloo what your tastes sit near, then walks Izumo and Matsue as shrines, temple halls, and a meal — each with a reason.
          </p>
          <p className="mt-3 font-mincho text-lg">出雲の道</p>
          <Planner />
        </div>
      </section>
      <Etiquette />
    </main>
  )
}
