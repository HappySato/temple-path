import { MemoryCache } from "@/lib/qloo/cache"
import { parseEntities, parseInsights, parseTags } from "@/lib/qloo/parse"
import {
  QlooError,
  type InsightsParams,
  type InsightsResult,
  type QlooClient,
  type QlooEntity,
  type QlooTag,
} from "@/lib/qloo/types"

const SEARCH_TYPES = [
  "urn:entity:artist",
  "urn:entity:movie",
  "urn:entity:tv_show",
  "urn:entity:book",
  "urn:entity:brand",
  "urn:entity:podcast",
].join(",")

type LiveOptions = {
  apiKey: string
  baseUrl: string
  fetchImpl?: typeof fetch
  cache?: MemoryCache<unknown>
}

export class LiveQlooClient implements QlooClient {
  readonly mode = "live" as const
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch
  private readonly cache: MemoryCache<unknown>

  constructor(options: LiveOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl.replace(/\/$/, "")
    this.fetchImpl = options.fetchImpl ?? fetch
    this.cache = options.cache ?? new MemoryCache()
  }

  async search(params: { query: string; take?: number }): Promise<QlooEntity[]> {
    const payload = await this.get("/search", {
      query: params.query,
      types: SEARCH_TYPES,
      take: String(params.take ?? 5),
    })
    return parseEntities(payload)
  }

  async tags(params: { query: string; take?: number }): Promise<QlooTag[]> {
    const payload = await this.get("/v2/tags", {
      "filter.query": params.query,
      take: String(params.take ?? 8),
      "feature.typo_tolerance": "true",
    })
    return parseTags(payload)
  }

  async insights(params: InsightsParams): Promise<InsightsResult> {
    const query: Record<string, string> = {
      "filter.type": params.filterType,
      take: String(Math.min(params.take ?? 8, 20)),
    }
    if (params.entityIds?.length) {
      query["signal.interests.entities"] = params.entityIds.join(",")
    }
    if (params.tagIds?.length) {
      query["signal.interests.tags"] = params.tagIds.join(",")
    }
    if (params.locationQuery) query["filter.location.query"] = params.locationQuery
    if (params.location) query["filter.location"] = params.location
    if (params.radiusMeters != null) {
      query["filter.location.radius"] = String(params.radiusMeters)
    }
    if (params.geocodeCountry) query["filter.geocode.country_code"] = params.geocodeCountry
    if (params.geocodeAdmin1) query["filter.geocode.admin1_region"] = params.geocodeAdmin1

    const payload = await this.get("/v2/insights", query)
    return parseInsights(payload)
  }

  private async get(path: string, query: Record<string, string>): Promise<unknown> {
    if (path.includes("recommendation") || path === "/recs" || path.startsWith("/recs")) {
      throw new QlooError("Legacy recommendation routes are not used.", 400)
    }
    const url = new URL(path, `${this.baseUrl}/`)
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value)
    }
    const cacheKey = `GET ${url.pathname}?${url.searchParams.toString()}`
    const cached = this.cache.get(cacheKey)
    if (cached !== undefined) return cached

    let response: Response
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Api-Key": this.apiKey,
        },
        signal: AbortSignal.timeout(12_000),
      })
    } catch {
      throw new QlooError("Qloo did not respond in time.", 0)
    }

    if (response.status === 404 && path === "/search") {
      const empty = { results: [] }
      this.cache.set(cacheKey, empty)
      return empty
    }
    if (!response.ok) {
      throw new QlooError(liveErrorMessage(path, response.status), response.status)
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new QlooError(`Qloo ${path} returned an unreadable response.`, 502)
    }
    this.cache.set(cacheKey, payload)
    return payload
  }
}

function liveErrorMessage(path: string, status: number): string {
  if (status === 401 || status === 403) {
    return `Qloo refused the key (${status}). Check QLOO_API_KEY.`
  }
  return `Qloo ${path} failed (${status}).`
}

export const SEARCH_TYPE_PARAM = SEARCH_TYPES
