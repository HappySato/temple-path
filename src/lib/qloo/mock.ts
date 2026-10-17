import { DESTINATIONS, MEALS } from "@/lib/content/places"
import {
  DEMO_ENTITIES,
  DEMO_TAGS,
  normalizeText,
  type DemoEntity,
  type DemoTag,
} from "@/lib/content/signals"
import type { CatalogPlace, Tastes } from "@/lib/domain"
import type {
  InsightsParams,
  InsightsResult,
  QlooClient,
  QlooEntity,
  QlooTag,
} from "@/lib/qloo/types"

function tokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 2)
}

function entityScore(entity: DemoEntity, query: string): number {
  const q = normalizeText(query)
  if (!q) return 0
  const names = [entity.name, ...entity.aliases].map((name) => normalizeText(name))
  if (names.some((name) => name === q)) return 1
  const qTokens = tokens(query)
  if (!qTokens.length) return 0
  for (const name of names) {
    const nameTokens = new Set(tokens(name))
    if (qTokens.every((token) => nameTokens.has(token))) return 0.92
  }
  if (qTokens.length === 1 && names.some((name) => tokens(name).includes(qTokens[0]))) {
    return 0.84
  }
  return 0
}

function tagScore(tag: DemoTag, query: string): number {
  const q = normalizeText(query)
  for (const alias of [tag.name, ...tag.aliases]) {
    const normalized = normalizeText(alias)
    if (normalized.length >= 3 && q.includes(normalized)) return 1
  }
  return 0
}

function dot(item: Tastes, signals: { tastes: Tastes }[]): number {
  let score = 0
  for (const signal of signals) {
    for (const [key, weight] of Object.entries(signal.tastes)) {
      score += (item[key] ?? 0) * weight
    }
  }
  return score
}

function toEntity(entity: DemoEntity): QlooEntity {
  return {
    entityId: entity.entityId,
    name: entity.name,
    type: entity.type,
    description: entity.description,
    tags: entity.tags,
    popularity: entity.popularity,
    tastes: entity.tastes,
  }
}

function placeEntity(place: CatalogPlace, prefix: "MOCK-PLACE" | "MOCK-DEST", affinity: number): QlooEntity {
  const tags: QlooTag[] = Object.entries(place.tastes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => ({
      id: `MOCK-TAG-DERIVED-${name}`,
      name,
      type: "urn:tag:demo:derived",
    }))
  return {
    entityId: `${prefix}-${place.id}`,
    name: place.name,
    type: prefix === "MOCK-PLACE" ? "urn:entity:place" : "urn:entity:destination",
    description: place.summary,
    address: place.address,
    tags,
    affinity: Number(affinity.toFixed(3)),
    tastes: place.tastes,
  }
}

function locationAllowed(params: InsightsParams): boolean {
  const blob = `${params.locationQuery ?? ""} ${params.geocodeAdmin1 ?? ""} ${params.location ?? ""}`.toLowerCase()
  if (!blob.trim()) return true
  return ["izumo", "matsue", "shimane", "hinomisaki", "miho", "132.", "133."].some((key) =>
    blob.includes(key),
  )
}

function signalsFor(params: InsightsParams): { tastes: Tastes }[] {
  const entities = DEMO_ENTITIES.filter((entity) => params.entityIds?.includes(entity.entityId))
  const tags = DEMO_TAGS.filter((tag) => params.tagIds?.includes(tag.id))
  return [...entities, ...tags]
}

function rankPlaces(
  places: CatalogPlace[],
  prefix: "MOCK-PLACE" | "MOCK-DEST",
  params: InsightsParams,
): QlooEntity[] {
  if (!locationAllowed(params)) return []
  const signals = signalsFor(params)
  const take = params.take ?? 8
  if (!signals.length) return []
  const ranked = places
    .map((place) => ({ place, score: dot(place.tastes, signals) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.place.id.localeCompare(b.place.id))
  const max = ranked[0]?.score ?? 1
  return ranked.slice(0, take).map((item) => placeEntity(item.place, prefix, item.score / max))
}

function rankTags(params: InsightsParams): QlooTag[] {
  const signals = signalsFor(params)
  if (!signals.length) return []
  const take = params.take ?? 8
  const ranked = DEMO_TAGS.map((tag) => ({ tag, score: dot(tag.tastes, signals) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tag.id.localeCompare(b.tag.id))
    .slice(0, take)
  const max = ranked[0]?.score ?? 1
  return ranked.map((item) => ({
    id: item.tag.id,
    name: item.tag.name,
    type: item.tag.type,
    affinity: Number((item.score / max).toFixed(3)),
    tastes: item.tag.tastes,
  }))
}

export class MockQlooClient implements QlooClient {
  readonly mode = "mock" as const

  async search(params: { query: string; take?: number }): Promise<QlooEntity[]> {
    const take = params.take ?? 5
    return DEMO_ENTITIES.map((entity) => ({ entity, score: entityScore(entity, params.query) }))
      .filter((item) => item.score >= 0.8)
      .sort((a, b) => b.score - a.score || b.entity.popularity - a.entity.popularity)
      .slice(0, take)
      .map((item) => toEntity(item.entity))
  }

  async tags(params: { query: string; take?: number }): Promise<QlooTag[]> {
    const take = params.take ?? 8
    return DEMO_TAGS.map((tag) => ({ tag, score: tagScore(tag, params.query) }))
      .filter((item) => item.score > 0)
      .slice(0, take)
      .map((item) => ({
        id: item.tag.id,
        name: item.tag.name,
        type: item.tag.type,
        tastes: item.tag.tastes,
      }))
  }

  async insights(params: InsightsParams): Promise<InsightsResult> {
    if (params.filterType === "urn:tag") {
      return { entities: [], tags: rankTags(params) }
    }
    if (params.filterType === "urn:entity:place") {
      return { entities: rankPlaces(MEALS, "MOCK-PLACE", params), tags: [] }
    }
    if (params.filterType === "urn:entity:destination") {
      return { entities: rankPlaces(DESTINATIONS, "MOCK-DEST", params), tags: [] }
    }
    return { entities: [], tags: [] }
  }
}
