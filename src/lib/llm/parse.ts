import type { Itinerary, Stop, StopKind } from "@/lib/domain"

const KINDS = new Set<StopKind>(["shrine", "temple", "meal", "tea", "cafe", "walk", "sake"])

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") return ""
  return value.replace(/\s+/g, " ").trim().slice(0, max)
}

export function extractJson(text: string): unknown {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

export function parseLlmItinerary(text: string): Itinerary | null {
  const payload = extractJson(text)
  if (!payload || typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  if (!Array.isArray(record.days)) return null

  const days = record.days.flatMap((day, index) => {
    if (!day || typeof day !== "object") return []
    const dayRecord = day as Record<string, unknown>
    if (!Array.isArray(dayRecord.stops)) return []
    const stops: Stop[] = []
    for (const [stopIndex, raw] of dayRecord.stops.entries()) {
      if (!raw || typeof raw !== "object") continue
      const stop = raw as Record<string, unknown>
      const name = clip(stop.name, 120)
      const reason = clip(stop.reason, 280)
      if (!name || !reason) continue
      const kindRaw = clip(stop.kind, 20) as StopKind
      const kind = KINDS.has(kindRaw) ? kindRaw : "walk"
      const monksNote = clip(stop.monksNote, 320)
      stops.push({
        id: `llm-${index + 1}-${stopIndex}`,
        time: /^\d{2}:\d{2}$/.test(clip(stop.time, 5)) ? clip(stop.time, 5) : "09:00",
        kind,
        name,
        nameJa: clip(stop.nameJa, 40),
        area: clip(stop.area, 40) || "shimane",
        summary: clip(stop.summary, 320) || "Suggested from general knowledge.",
        reason,
        monksNote: monksNote || undefined,
        grounding: "llm",
        signals: [],
      })
      if (stops.length >= 6) break
    }
    if (stops.length < 2) return []
    return [
      {
        day: index + 1,
        title: clip(dayRecord.title, 80) || `Day ${index + 1}`,
        note: clip(dayRecord.note, 240) || undefined,
        stops,
      },
    ]
  })

  if (!days.length) return null
  return {
    title: clip(record.title, 80) || "Ungrounded itinerary",
    mode: "llm",
    days: days.map((day, index) => ({ ...day, day: index + 1 })),
  }
}
