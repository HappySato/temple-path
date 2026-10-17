"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import type { Grounding, Itinerary, PlanResult, Stop, StopKind } from "@/lib/domain"

const KIND_LABEL: Record<StopKind, string> = {
  shrine: "Shrine",
  temple: "Temple",
  meal: "Meal",
  tea: "Tea",
  cafe: "Cafe",
  walk: "Walk",
  sake: "Sake",
}

const GROUNDING_LABEL: Record<Grounding, string> = {
  qloo: "Qloo",
  "temple-list": "Temple list",
  "local-list": "Local list",
  guidebook: "Guidebook",
  llm: "Model",
}

function typeLabel(type: string): string {
  return (type.split(":").pop() ?? type).replaceAll("_", " ")
}

export function ItineraryView({ plan }: { plan: PlanResult }) {
  const [view, setView] = useState<"both" | "qloo" | "plain">("both")

  useEffect(() => {
    document.getElementById("result-heading")?.focus()
  }, [plan])

  return (
    <section className="mt-10" aria-labelledby="result-heading">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="result-heading" tabIndex={-1} className="font-serif text-3xl tracking-tight outline-none">
            Two ways of answering
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The grounded path moves when your tastes move. The other path does not, unless a model is configured — and even then it never sees Qloo.
          </p>
        </div>
        <div className="flex rounded-full border border-border bg-card p-1 text-sm" role="group" aria-label="Comparison view">
          {(
            [
              ["both", "Side by side"],
              ["qloo", "Grounded"],
              ["plain", "Ungrounded"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={`rounded-full px-3 py-1.5 ${view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Profile plan={plan} />

      <div className={`mt-6 grid gap-5 ${view === "both" ? "lg:grid-cols-2" : ""}`}>
        {view !== "plain" ? (
          <Column
            itinerary={plan.qloo}
            qlooMode={plan.qlooMode}
            eyebrow="Grounded"
            tone="qloo"
          />
        ) : null}
        {view !== "qloo" ? (
          <Column
            itinerary={plan.comparison}
            qlooMode={plan.qlooMode}
            eyebrow="Ungrounded"
            tone="plain"
          />
        ) : null}
      </div>

      <details className="mt-6 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">What the agent called</summary>
        <ol className="mt-3 space-y-1.5 text-muted-foreground">
          {plan.trail.map((step, index) => (
            <li key={`${step.tool}-${index}`}>
              <span className="text-foreground">{step.tool}</span>
              {" · "}
              {step.detail}
              {step.ok ? "" : " · failed"}
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}

function Profile({ plan }: { plan: PlanResult }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{plan.qlooMode === "live" ? "Qloo live" : "Demo catalog"}</Badge>
        <Badge variant="outline">
          {plan.llm.mode === "llm"
            ? `Model · ${plan.llm.model}`
            : "Guidebook baseline"}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {plan.qlooMode === "live"
          ? "Names below came back from Qloo for this request. They are not stored in the repo."
          : "No QLOO_API_KEY is set, so search, tags, and insights are answered by a hand-written demo catalog. The ids are synthetic."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {plan.profile.entities.map((entity) => (
          <span key={entity.id} className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground" title={entity.description}>
            {entity.name}
            <span className="ml-1 text-xs opacity-70">{typeLabel(entity.type)}</span>
          </span>
        ))}
        {plan.profile.tags.map((tag) => (
          <span key={tag.id} className="rounded-full border border-border px-3 py-1 text-sm">
            {tag.name}
          </span>
        ))}
      </div>
      {plan.profile.unresolved.length ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Not resolved: {plan.profile.unresolved.join(", ")}.
        </p>
      ) : null}
    </div>
  )
}

function Column({
  itinerary,
  qlooMode,
  eyebrow,
  tone,
}: {
  itinerary: Itinerary
  qlooMode: PlanResult["qlooMode"]
  eyebrow: string
  tone: "qloo" | "plain"
}) {
  return (
    <article className={`rounded-2xl border border-border bg-card p-4 md:p-5 ${tone === "qloo" ? "border-t-4 border-t-primary" : "border-t-4 border-t-foreground/20"}`}>
      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{eyebrow}</p>
      <h3 className="mt-1 font-serif text-2xl tracking-tight">{itinerary.title}</h3>
      {itinerary.banner ? (
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          {itinerary.banner}
        </p>
      ) : null}
      <div className="mt-5 space-y-8">
        {itinerary.days.map((day) => (
          <section key={day.day} aria-label={`Day ${day.day}`}>
            <h4 className="font-serif text-xl">
              Day {day.day}
              <span className="ml-2 text-base text-muted-foreground">{day.title}</span>
            </h4>
            {day.note ? <p className="mt-1 text-sm text-muted-foreground">{day.note}</p> : null}
            <ol className="relative mt-4 space-y-5 border-l border-border pl-5">
              {day.stops.map((stop) => (
                <StopCard key={stop.id} stop={stop} qlooMode={qlooMode} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </article>
  )
}

function StopCard({ stop, qlooMode }: { stop: Stop; qlooMode: PlanResult["qlooMode"] }) {
  return (
    <li className="relative">
      <span className="absolute -left-[1.45rem] top-1.5 size-2.5 rounded-full bg-primary" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
        <span className="tabular-nums">{stop.time}</span>
        <span>{KIND_LABEL[stop.kind]}</span>
        <Badge variant="outline">{GROUNDING_LABEL[stop.grounding]}</Badge>
        {stop.grounding === "qloo" && stop.affinity != null ? (
          <span>
            {qlooMode === "live" ? "Qloo affinity" : "Demo match"} {stop.affinity.toFixed(2)}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-lg leading-tight">
        {stop.name}
        {stop.nameJa ? <span className="ml-2 font-mincho text-base text-muted-foreground">{stop.nameJa}</span> : null}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{stop.summary}</p>
      <p className="mt-2 rounded-xl bg-accent/70 px-3 py-2 text-sm leading-relaxed text-accent-foreground">
        {stop.reason}
      </p>
      {stop.monksNote ? (
        <p className="mt-2 border-l-2 border-primary/50 pl-3 text-sm leading-relaxed text-muted-foreground">
          <span className="mr-1 font-medium text-foreground">Monk&apos;s note.</span>
          {stop.monksNote}
        </p>
      ) : null}
    </li>
  )
}
