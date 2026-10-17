import { ETIQUETTE } from "@/lib/content/etiquette"

export function Etiquette() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="etiquette-heading">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.18em] text-primary uppercase">Before you bow</p>
        <h2 id="etiquette-heading" className="mt-2 font-serif text-3xl tracking-tight">
          A short note on how to be there
        </h2>
        <p className="mt-3 text-muted-foreground">
          The itinerary is a taste-made order of visits, not a booking. Hours change, and soba shops close when the noodles are gone.
        </p>
      </div>
      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {ETIQUETTE.map((note, index) => (
          <li key={note.title} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-serif text-lg">
              <span className="mr-2 text-primary">{index + 1}</span>
              {note.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
