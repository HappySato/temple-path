import type { Tastes } from "@/lib/domain"

export type QlooTag = {
  id: string
  name: string
  type?: string
  affinity?: number
  /** Present only on the in-memory demo catalog, never persisted. */
  tastes?: Tastes
}

export type QlooEntity = {
  entityId: string
  name: string
  type: string
  description?: string
  tags: QlooTag[]
  popularity?: number
  affinity?: number
  address?: string
  /** Present only when the demo catalog built the entity. */
  tastes?: Tastes
}

export type InsightsParams = {
  filterType: string
  entityIds?: string[]
  tagIds?: string[]
  locationQuery?: string
  location?: string
  radiusMeters?: number
  geocodeCountry?: string
  geocodeAdmin1?: string
  take?: number
}

export type InsightsResult = {
  entities: QlooEntity[]
  tags: QlooTag[]
}

export interface QlooClient {
  readonly mode: "mock" | "live"
  search(params: { query: string; take?: number }): Promise<QlooEntity[]>
  tags(params: { query: string; take?: number }): Promise<QlooTag[]>
  insights(params: InsightsParams): Promise<InsightsResult>
}

export class QlooError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "QlooError"
    this.status = status
  }
}
