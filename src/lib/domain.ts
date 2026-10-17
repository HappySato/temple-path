export type Area = "izumo" | "coast" | "matsue" | "miho" | "lake" | "any"

export type Cluster = "west" | "east" | "lake"

export type StopKind =
  | "shrine"
  | "temple"
  | "meal"
  | "tea"
  | "cafe"
  | "walk"
  | "sake"

export type Tastes = Record<string, number>

export type CatalogPlace = {
  id: string
  name: string
  nameJa: string
  kind: StopKind
  area: Area
  summary: string
  monksNote?: string
  tastes: Tastes
  address?: string
}

export type Grounding =
  | "qloo"
  | "temple-list"
  | "local-list"
  | "guidebook"
  | "llm"

export type Stop = {
  id: string
  time: string
  kind: StopKind
  name: string
  nameJa: string
  area: string
  summary: string
  reason: string
  monksNote?: string
  grounding: Grounding
  signals: { name: string; id?: string }[]
  affinity?: number
}

export type DayPlan = {
  day: number
  title: string
  note?: string
  stops: Stop[]
}

export type Itinerary = {
  title: string
  mode: "qloo" | "baseline" | "llm"
  banner?: string
  days: DayPlan[]
}

export type TasteSignal = {
  id?: string
  name: string
  tastes: Tastes
}

export type PlanInput = {
  likes: string
  days: number
  regionId: string
}

export type TrailStep = {
  tool: "search_entities" | "get_tags" | "get_insights" | "build_itinerary"
  detail: string
  ok: boolean
}

export type PlanResult = {
  qlooMode: "mock" | "live"
  llm: {
    mode: "baseline" | "llm"
    provider?: string
    model?: string
    note?: string
  }
  profile: {
    likes: string[]
    entities: {
      id: string
      name: string
      type: string
      description?: string
    }[]
    tags: { id: string; name: string; affinity?: number }[]
    unresolved: string[]
  }
  trail: TrailStep[]
  qloo: Itinerary
  comparison: Itinerary
}
