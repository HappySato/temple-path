import type { TasteSignal, Tastes } from "@/lib/domain"

export function scoreTastes(item: Tastes, signals: TasteSignal[]): number {
  let total = 0
  for (const signal of signals) {
    for (const [key, weight] of Object.entries(signal.tastes)) {
      total += (item[key] ?? 0) * weight
    }
  }
  return total
}

export function bestSignal(
  item: Tastes,
  signals: TasteSignal[],
): { name: string; id?: string; key: string } | null {
  let best: { name: string; id?: string; key: string; contrib: number } | null = null
  for (const signal of signals) {
    for (const [key, weight] of Object.entries(signal.tastes)) {
      const contrib = (item[key] ?? 0) * weight
      if (!best || contrib > best.contrib) {
        best = { name: signal.name, id: signal.id, key, contrib }
      }
    }
  }
  if (!best || best.contrib < 0.25) return null
  return { name: best.name, id: best.id, key: best.key }
}
