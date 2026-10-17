"use client"

import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ItineraryView } from "@/components/itinerary-view"
import { REGIONS } from "@/lib/content/regions"
import type { PlanResult } from "@/lib/domain"

const SAMPLES = [
  { label: "Quiet music and tea", likes: "Ryuichi Sakamoto, matcha" },
  { label: "Forests and Ghibli", likes: "Spirited Away, My Neighbor Totoro" },
  { label: "Jazz and a novel", likes: "Miles Davis, Norwegian Wood" },
  { label: "Plain objects", likes: "MUJI, Brian Eno" },
  { label: "Seafood and sake", likes: "seafood, sake" },
]

export function Planner() {
  const likesId = useId()
  const regionId = useId()
  const [likes, setLikes] = useState("")
  const [days, setDays] = useState<1 | 2 | 3>(2)
  const [region, setRegion] = useState(REGIONS[0].id)
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle")
  const [error, setError] = useState("")
  const [plan, setPlan] = useState<PlanResult | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus("loading")
    setError("")
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ likes, days, regionId: region }),
      })
      const body = (await response.json()) as PlanResult & { error?: string }
      if (!response.ok) {
        setStatus("error")
        setError(body.error || "The path could not be composed.")
        return
      }
      setPlan(body)
      setStatus("ready")
    } catch {
      setStatus("error")
      setError("The request did not finish. Check your connection and try again.")
    }
  }

  const regionBlurb = REGIONS.find((item) => item.id === region)?.blurb

  return (
    <div>
      <form onSubmit={onSubmit} className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-[0_24px_60px_-36px_rgba(70,32,12,0.55)] md:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <div>
            <Label htmlFor={likesId} className="text-base">
              Things you already love
            </Label>
            <p id={`${likesId}-help`} className="mt-1 text-sm text-muted-foreground">
              A few names are enough. Artists, films, books, foods, brands.
            </p>
            <Textarea
              id={likesId}
              value={likes}
              onChange={(event) => setLikes(event.target.value)}
              required
              maxLength={500}
              rows={4}
              aria-describedby={`${likesId}-help`}
              placeholder="for example: Ryuichi Sakamoto, Spirited Away, matcha"
              className="mt-3 min-h-28 bg-background text-base placeholder:text-foreground/35 md:text-base"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setLikes(sample.likes)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground/80 hover:border-primary hover:text-foreground"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <fieldset>
              <legend className="text-sm font-medium">Days</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([1, 2, 3] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={days === value}
                    onClick={() => setDays(value)}
                    className={`h-11 rounded-xl border text-sm ${days === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground/30"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <Label htmlFor={regionId}>Region</Label>
              <select
                id={regionId}
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {REGIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {regionBlurb ? <p className="mt-2 text-sm text-muted-foreground">{regionBlurb}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" disabled={status === "loading"} className="h-12 px-6 text-base">
            {status === "loading" ? "Composing the path…" : "Compose the path"}
          </Button>
          <p className="text-sm text-muted-foreground">
            No account. The taste graph runs on the server.
          </p>
        </div>

        {status === "loading" ? (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            Resolving what you named, then asking Qloo for tags, places, and destinations.
          </p>
        ) : null}
        {status === "error" ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      {plan ? <ItineraryView plan={plan} /> : null}
    </div>
  )
}
