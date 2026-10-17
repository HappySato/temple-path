import type { QlooEntity, QlooTag } from "@/lib/qloo/types"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function tagList(value: unknown): QlooTag[] {
  if (!Array.isArray(value)) return []
  const tags: QlooTag[] = []
  for (const item of value) {
    const record = asRecord(item)
    if (!record) continue
    const id = asString(record.id) ?? asString(record.tag_id)
    const name = asString(record.name) ?? id
    if (!id || !name) continue
    const query = asRecord(record.query)
    tags.push({
      id,
      name,
      type: asString(record.type),
      affinity: asNumber(query?.affinity) ?? asNumber(record.affinity),
    })
  }
  return tags
}

export function parseTags(payload: unknown): QlooTag[] {
  const root = asRecord(payload)
  const results = asRecord(root?.results)
  const fromResults = tagList(results?.tags)
  if (fromResults.length) return fromResults
  return tagList(root?.results)
}

export function parseEntity(raw: unknown): QlooEntity | null {
  const record = asRecord(raw)
  if (!record) return null
  const name = asString(record.name)
  const entityId =
    asString(record.entity_id) ?? asString(record.entityId) ?? asString(record.id)
  if (!name || !entityId) return null

  const properties = asRecord(record.properties)
  const types = Array.isArray(record.types)
    ? record.types.filter((item): item is string => typeof item === "string")
    : []
  const type =
    asString(record.subtype) ??
    types[0] ??
    asString(record.type) ??
    "urn:entity"

  const short = Array.isArray(properties?.short_descriptions)
    ? asString(asRecord(properties.short_descriptions[0])?.value)
    : undefined
  const description =
    asString(properties?.description) ??
    short ??
    asString(record.disambiguation)

  const query = asRecord(record.query)
  const location = asRecord(properties?.location)
  const address =
    asString(properties?.address) ??
    asString(asRecord(properties?.geocode)?.address)

  return {
    entityId,
    name,
    type,
    description,
    tags: tagList(record.tags ?? properties?.tags),
    popularity: asNumber(record.popularity) ?? asNumber(properties?.popularity),
    affinity: asNumber(query?.affinity) ?? asNumber(record.affinity),
    address: address ?? formatLatLon(location),
  }
}

function formatLatLon(location: Record<string, unknown> | null): string | undefined {
  const lat = asNumber(location?.lat)
  const lon = asNumber(location?.lon)
  if (lat == null || lon == null) return undefined
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
}

export function parseEntities(payload: unknown): QlooEntity[] {
  const root = asRecord(payload)
  const results = root?.results
  const list = Array.isArray(results)
    ? results
    : Array.isArray(asRecord(results)?.entities)
      ? (asRecord(results)?.entities as unknown[])
      : []
  return list
    .map((item) => parseEntity(item))
    .filter((item): item is QlooEntity => item !== null)
}

export function parseInsights(payload: unknown): { entities: QlooEntity[]; tags: QlooTag[] } {
  return {
    entities: parseEntities(payload),
    tags: parseTags(payload),
  }
}
