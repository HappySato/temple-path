import { composeGrounded } from "@/lib/agent/compose"
import { parseLikes } from "@/lib/agent/likes"
import { getRegion } from "@/lib/content/regions"
import { signalFromEntity, signalFromTag } from "@/lib/content/signals"
import type { PlanInput, PlanResult, TasteSignal, TrailStep } from "@/lib/domain"
import { buildComparison } from "@/lib/llm/compare"
import type { LlmClient } from "@/lib/llm/client"
import {
  QlooError,
  type InsightsParams,
  type InsightsResult,
  type QlooClient,
  type QlooEntity,
  type QlooTag,
} from "@/lib/qloo/types"

export class PlanError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PlanError"
  }
}

export function validatePlanInput(
  body: unknown,
): { ok: true; value: PlanInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Send the things you love, a trip length, and a region." }
  }
  const record = body as Record<string, unknown>
  const likes = typeof record.likes === "string" ? record.likes.trim() : ""
  if (!likes) return { ok: false, error: "Name a few things you already love." }
  if (likes.length > 500) return { ok: false, error: "Keep the list under 500 characters." }
  const days = typeof record.days === "number" ? record.days : Number(record.days)
  if (days !== 1 && days !== 2 && days !== 3) {
    return { ok: false, error: "Trip length is one, two, or three days." }
  }
  const regionId = typeof record.regionId === "string" ? record.regionId : ""
  if (!getRegion(regionId)) {
    return {
      ok: false,
      error: "Choose Izumo & Matsue, Matsue & the lake, or the Izumo coast.",
    }
  }
  return { ok: true, value: { likes, days, regionId } }
}

function tagCovers(tagName: string, word: string): boolean {
  const left = word.toLowerCase()
  const right = tagName.toLowerCase()
  if (left.length < 3 || right.length < 3) return false
  return right.includes(left) || left.includes(right)
}

function dedupeTags(tags: QlooTag[]): QlooTag[] {
  const seen = new Map<string, QlooTag>()
  for (const tag of tags) {
    const existing = seen.get(tag.id)
    if (!existing) {
      seen.set(tag.id, tag)
      continue
    }
    if (existing.affinity == null) continue
    if (tag.affinity == null || (tag.affinity ?? 0) > (existing.affinity ?? 0)) {
      seen.set(tag.id, tag)
    }
  }
  return [...seen.values()]
}

async function loadInsights(
  qloo: QlooClient,
  params: InsightsParams,
  trail: TrailStep[],
  detail: string,
): Promise<InsightsResult> {
  const step: TrailStep = { tool: "get_insights", detail, ok: true }
  trail.push(step)
  try {
    return await qloo.insights(params)
  } catch (error) {
    step.ok = false
    if (error instanceof QlooError) {
      step.detail = `${detail} — ${error.message}`
      if (error.status === 401 || error.status === 403) throw error
      return { entities: [], tags: [] }
    }
    step.detail = `${detail} — failed`
    return { entities: [], tags: [] }
  }
}

export async function planTrip(
  input: PlanInput,
  deps: { qloo: QlooClient; llm: LlmClient | null },
): Promise<PlanResult> {
  const region = getRegion(input.regionId)
  if (!region) throw new PlanError("Choose a region in Shimane.")
  const days = input.days
  if (days !== 1 && days !== 2 && days !== 3) {
    throw new PlanError("Trip length is one, two, or three days.")
  }
  const likes = parseLikes(input.likes)
  if (!likes.length) throw new PlanError("Name a few things you already love.")

  const trail: TrailStep[] = []
  const entities: QlooEntity[] = []
  const unresolved: string[] = []

  for (const like of likes) {
    const detail = `GET /search query="${like}"`
    try {
      const found = await deps.qloo.search({ query: like, take: 5 })
      trail.push({ tool: "search_entities", detail, ok: true })
      if (found[0]) entities.push(found[0])
      else unresolved.push(like)
    } catch (error) {
      trail.push({
        tool: "search_entities",
        detail: error instanceof QlooError ? `${detail} — ${error.message}` : `${detail} — failed`,
        ok: false,
      })
      if (error instanceof QlooError && (error.status === 401 || error.status === 403)) {
        throw error
      }
      unresolved.push(like)
    }
  }

  let tags: QlooTag[] = []
  try {
    const query = likes.join(" ")
    tags = await deps.qloo.tags({ query, take: 8 })
    trail.push({ tool: "get_tags", detail: `GET /v2/tags filter.query="${query}"`, ok: true })
  } catch (error) {
    trail.push({
      tool: "get_tags",
      detail: error instanceof QlooError ? error.message : "GET /v2/tags failed",
      ok: false,
    })
    if (error instanceof QlooError && (error.status === 401 || error.status === 403)) throw error
  }

  const stillUnresolved = unresolved.filter(
    (word) => !tags.some((tag) => tagCovers(tag.name, word)),
  )

  const directTags = tags
  const entityIds = [...new Set(entities.map((entity) => entity.entityId))]
  if (entityIds.length) {
    const taste = await loadInsights(
      deps.qloo,
      { filterType: "urn:tag", entityIds, take: 8 },
      trail,
      "GET /v2/insights filter.type=urn:tag",
    )
    const related = taste.tags.filter((tag) => (tag.affinity ?? 0) >= 0.45)
    tags = dedupeTags([...directTags, ...related])
  }

  const tagIds = tags.map((tag) => tag.id).slice(0, 8)
  let meals: QlooEntity[] = []
  let destinations: QlooEntity[] = []

  if (entityIds.length || tagIds.length) {
    const placeParams: InsightsParams = {
      filterType: "urn:entity:place",
      entityIds,
      tagIds,
      locationQuery: region.locationQuery,
      location: region.point,
      radiusMeters: region.radiusMeters,
      geocodeCountry: "JP",
      geocodeAdmin1: "Shimane",
      take: 8,
    }
    const places = await loadInsights(
      deps.qloo,
      placeParams,
      trail,
      `GET /v2/insights filter.type=urn:entity:place location=${region.locationQuery}`,
    )
    meals = places.entities
    if (!meals.length && deps.qloo.mode === "live") {
      const wider = await loadInsights(
        deps.qloo,
        {
          ...placeParams,
          locationQuery: "Shimane",
          location: undefined,
          radiusMeters: 80000,
        },
        trail,
        "GET /v2/insights filter.type=urn:entity:place location=Shimane",
      )
      meals = wider.entities
    }

    const destinationResult = await loadInsights(
      deps.qloo,
      {
        filterType: "urn:entity:destination",
        entityIds,
        tagIds,
        locationQuery: region.locationQuery,
        geocodeCountry: "JP",
        geocodeAdmin1: "Shimane",
        take: 6,
      },
      trail,
      `GET /v2/insights filter.type=urn:entity:destination location=${region.locationQuery}`,
    )
    destinations = destinationResult.entities
  }

  const signals: TasteSignal[] = []
  const seen = new Set<string>()
  for (const entity of entities) {
    const signal = signalFromEntity(entity)
    if (!Object.keys(signal.tastes).length) continue
    const key = signal.id ?? signal.name
    if (seen.has(key)) continue
    seen.add(key)
    signals.push(signal)
  }
  for (const tag of tags) {
    const signal = signalFromTag(tag)
    if (!Object.keys(signal.tastes).length) continue
    const key = signal.id ?? signal.name
    if (seen.has(key)) continue
    seen.add(key)
    signals.push(signal)
  }

  trail.push({
    tool: "build_itinerary",
    detail: `${days} day${days === 1 ? "" : "s"} in ${region.name}`,
    ok: true,
  })

  const qloo = composeGrounded({
    days,
    region,
    signals,
    qlooMeals: meals,
    qlooDestinations: destinations,
  })

  const comparison = await buildComparison({
    likes,
    days,
    region,
    llm: deps.llm,
  })

  return {
    qlooMode: deps.qloo.mode,
    llm: comparison.llm,
    profile: {
      likes,
      entities: entities.map((entity) => ({
        id: entity.entityId,
        name: entity.name,
        type: entity.type,
        description: entity.description,
      })),
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        affinity: tag.affinity,
      })),
      unresolved: stillUnresolved,
    },
    trail,
    qloo,
    comparison: comparison.itinerary,
  }
}
