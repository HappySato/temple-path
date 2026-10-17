import { becauseYouLike } from "@/lib/agent/reasons"
import { scoreTastes } from "@/lib/agent/score"
import { areasForCluster, type Region } from "@/lib/content/regions"
import { DESTINATIONS, findCatalogPlace, MEALS, TEMPLES } from "@/lib/content/places"
import type {
  CatalogPlace,
  Cluster,
  DayPlan,
  Grounding,
  Itinerary,
  Stop,
  StopKind,
  TasteSignal,
  Tastes,
} from "@/lib/domain"
import type { QlooEntity } from "@/lib/qloo/types"
import { inferTastes } from "@/lib/content/signals"

type Candidate = {
  place: CatalogPlace
  score: number
  affinity?: number
  grounding: Grounding
}

const FOOD: StopKind[] = ["meal", "tea", "cafe", "sake"]

function byScore(a: Candidate, b: Candidate): number {
  return b.score - a.score || a.place.id.localeCompare(b.place.id)
}

function classifyKind(entity: QlooEntity): StopKind {
  const blob = `${entity.name} ${entity.description ?? ""} ${entity.tags.map((tag) => tag.name).join(" ")}`.toLowerCase()
  if (/tea|matcha|wagashi/.test(blob)) return "tea"
  if (/coffee|cafe|kissaten/.test(blob)) return "cafe"
  if (/sake|brewery|winery/.test(blob)) return "sake"
  if (/shrine|jinja|taisha/.test(blob)) return "shrine"
  if (/temple|\btera\b|\bji\b/.test(blob)) return "temple"
  if (/restaurant|soba|ramen|sushi|seafood|dining|izakaya|food|noodle|bowl/.test(blob)) {
    return "meal"
  }
  return "walk"
}

function tastesOf(entity: QlooEntity, known?: CatalogPlace): Tastes {
  if (known) return known.tastes
  if (entity.tastes && Object.keys(entity.tastes).length) return entity.tastes
  const tastes: Tastes = {}
  for (const tag of entity.tags) {
    const part = tag.tastes ?? inferTastes(tag.name)
    for (const [key, weight] of Object.entries(part)) {
      tastes[key] = Math.max(tastes[key] ?? 0, weight)
    }
  }
  if (!Object.keys(tastes).length) Object.assign(tastes, inferTastes(entity.name))
  return tastes
}

function fromEntity(entity: QlooEntity, grounding: Grounding): Candidate {
  const known = findCatalogPlace(entity.entityId, entity.name)
  const place: CatalogPlace = known
    ? known
    : {
        id: entity.entityId,
        name: entity.name,
        nameJa: "",
        kind: classifyKind(entity),
        area: "any",
        summary:
          entity.description ||
          "Qloo returned this place near the region for the tastes you named.",
        address: entity.address,
        tastes: {},
      }
  const tastes = tastesOf(entity, known)
  return {
    place: { ...place, tastes },
    score: 0,
    affinity: entity.affinity,
    grounding,
  }
}

function fromCatalog(place: CatalogPlace, grounding: Grounding, signals: TasteSignal[]): Candidate {
  return {
    place,
    score: scoreTastes(place.tastes, signals),
    grounding,
  }
}

function withScores(candidates: Candidate[], signals: TasteSignal[]): Candidate[] {
  return candidates
    .map((candidate) => ({
      ...candidate,
      score: scoreTastes(candidate.place.tastes, signals),
    }))
    .sort(byScore)
}

export function chooseClusters(
  days: number,
  region: Region,
  temples: Candidate[],
): Cluster[] {
  const allowed = region.clusters
  const scoreOf = (cluster: Cluster) => {
    const areas = new Set(areasForCluster(cluster))
    const scores = temples.filter((temple) => areas.has(temple.place.area)).map((temple) => temple.score)
    return scores.length ? Math.max(...scores) : 0
  }
  const ranked = [...allowed].sort(
    (a, b) => scoreOf(b) - scoreOf(a) || allowed.indexOf(a) - allowed.indexOf(b),
  )
  const first = ranked[0] ?? allowed[0]
  if (days <= 1 || !first) return [first]
  if (allowed.length === 1) return Array.from({ length: days }, () => allowed[0])

  const otherCity =
    allowed.find((cluster) => cluster !== first && cluster !== "lake") ??
    allowed.find((cluster) => cluster !== first) ??
    first

  if (days === 2) return [first, otherCity]

  if (allowed.includes("lake") && first !== "lake" && otherCity !== "lake") {
    return [first, "lake", otherCity]
  }
  const middle = allowed.find((cluster) => cluster !== first) ?? first
  return [first, middle, otherCity]
}

function poolFor(
  candidates: Candidate[],
  areas: string[],
  used: Set<string>,
  allowOutside = false,
): Candidate[] {
  const fresh = candidates.filter((candidate) => !used.has(candidate.place.id))
  const inArea = fresh.filter((candidate) => areas.includes(candidate.place.area))
  const pool = inArea.length ? inArea : allowOutside ? fresh : []
  return pool.slice().sort(byScore)
}

function firstUseful(ranked: Candidate[], candidates: Candidate[]): Candidate | undefined {
  if (!ranked.length) return undefined
  const positive = ranked.filter((candidate) => candidate.score > 0)
  if (positive.length) return positive[0]
  const anyPositive = candidates.some((candidate) => candidate.score > 0)
  return anyPositive ? undefined : ranked[0]
}

function takeTemple(candidates: Candidate[], areas: string[], used: Set<string>): Candidate | undefined {
  return firstUseful(poolFor(candidates, areas, used), candidates)
}

function takeFood(
  candidates: Candidate[],
  areas: string[],
  used: Set<string>,
  prefer: StopKind[],
  allowOutside: boolean,
): Candidate | undefined {
  const fresh = candidates.filter(
    (candidate) => !used.has(candidate.place.id) && FOOD.includes(candidate.place.kind),
  )
  const inArea = fresh.filter((candidate) => areas.includes(candidate.place.area)).sort(byScore)
  const pool = inArea.length ? inArea : allowOutside ? fresh.slice().sort(byScore) : []
  if (!pool.length) return undefined
  const best = pool[0]
  const preferred = pool
    .filter((candidate) => prefer.includes(candidate.place.kind))
    .sort(byScore)[0]
  if (preferred && preferred.score >= best.score * 0.65) return preferred
  return best
}

function takeWalk(candidates: Candidate[], areas: string[], used: Set<string>): Candidate | undefined {
  return firstUseful(poolFor(candidates, areas, used), candidates)
}

function toStop(candidate: Candidate, day: number, time: string, signals: TasteSignal[]): Stop {
  const reason = becauseYouLike(candidate.place, signals)
  return {
    id: `d${day}-${candidate.place.id}`,
    time,
    kind: candidate.place.kind,
    name: candidate.place.name,
    nameJa: candidate.place.nameJa,
    area: candidate.place.area,
    summary: candidate.place.summary,
    reason: reason.reason,
    monksNote: candidate.place.monksNote,
    grounding: candidate.grounding,
    signals: reason.signals,
    affinity: candidate.affinity,
  }
}

const DAY_TITLES: Record<Cluster, string> = {
  west: "West of the lake",
  east: "Matsue, with less of the castle",
  lake: "Along the water",
}

function transitNote(previous: Cluster | undefined, cluster: Cluster): string | undefined {
  if (!previous || previous === cluster) {
    if (previous === cluster && cluster === "west") {
      return "Stay on this side of the peninsula. Matsue is a different day."
    }
    return undefined
  }
  return "The Ichibata Electric Railway follows the north shore of Lake Shinji between Izumo Taisha-mae and Matsue, about an hour. Sit on the lake side."
}

function buildDay(
  day: number,
  cluster: Cluster,
  previous: Cluster | undefined,
  temples: Candidate[],
  meals: Candidate[],
  walks: Candidate[],
  signals: TasteSignal[],
  used: Set<string>,
): DayPlan {
  const areas = areasForCluster(cluster)
  const morning = takeTemple(temples, areas, used)
  if (morning) used.add(morning.place.id)
  const lunch = takeFood(meals, areas, used, ["meal", "cafe"], true)
  if (lunch) used.add(lunch.place.id)
  const secondTemple = takeTemple(temples, areas, used)
  const walk = takeWalk(walks, areas, used)
  let afternoon = secondTemple
  if (walk && (!secondTemple || walk.score > secondTemple.score * 1.05)) {
    afternoon = walk
  }
  if (afternoon) used.add(afternoon.place.id)

  let late = takeFood(meals, areas, used, ["tea", "cafe", "sake"], false)
  if (late && lunch && late.place.kind === lunch.place.kind) {
    const different = poolFor(meals, areas, new Set([...used, late.place.id])).find(
      (candidate) => candidate.place.kind !== lunch.place.kind && FOOD.includes(candidate.place.kind),
    )
    if (different && different.score >= late.score * 0.5) late = different
    else if (morning && (secondTemple || walk)) late = undefined
  }
  if (!late) {
    const leftover = secondTemple && !used.has(secondTemple.place.id) ? secondTemple : walk && !used.has(walk.place.id) ? walk : undefined
    if (leftover) late = leftover
  }
  if (late) used.add(late.place.id)

  const stops: Stop[] = []
  if (morning) stops.push(toStop(morning, day, "08:30", signals))
  if (lunch) stops.push(toStop(lunch, day, "11:20", signals))
  if (afternoon) stops.push(toStop(afternoon, day, "14:00", signals))
  if (late) stops.push(toStop(late, day, "16:10", signals))

  if (stops.length < 3) {
    const remaining = [...temples, ...meals, ...walks]
      .filter(
        (candidate) => !used.has(candidate.place.id) && areas.includes(candidate.place.area),
      )
      .sort(byScore)
    const positive = remaining.filter((candidate) => candidate.score > 0)
    const fillers = positive.length ? positive : remaining
    for (const filler of fillers) {
      if (stops.length >= 3) break
      used.add(filler.place.id)
      const time = stops.length === 0 ? "08:30" : stops.length === 1 ? "11:20" : "15:00"
      stops.push(toStop(filler, day, time, signals))
    }
  }

  return {
    day,
    title: DAY_TITLES[cluster],
    note: transitNote(previous, cluster),
    stops,
  }
}

export function composeGrounded(args: {
  days: number
  region: Region
  signals: TasteSignal[]
  qlooMeals: QlooEntity[]
  qlooDestinations: QlooEntity[]
}): Itinerary {
  const templeCandidates = withScores(
    TEMPLES.map((place) => fromCatalog(place, "temple-list", args.signals)),
    args.signals,
  )

  let mealCandidates = withScores(
    args.qlooMeals.map((entity) => fromEntity(entity, "qloo")),
    args.signals,
  )
  const mealsFromQloo = mealCandidates.length > 0
  if (!mealsFromQloo) {
    mealCandidates = withScores(
      MEALS.map((place) => fromCatalog(place, "local-list", args.signals)),
      args.signals,
    )
  } else if (mealCandidates.length < args.days) {
    const seen = new Set(mealCandidates.map((candidate) => candidate.place.id))
    const extra = MEALS.filter((place) => !seen.has(place.id)).map((place) =>
      fromCatalog(place, "local-list", args.signals),
    )
    mealCandidates = withScores([...mealCandidates, ...extra], args.signals)
  }

  let walkCandidates = withScores(
    args.qlooDestinations.map((entity) => fromEntity(entity, "qloo")),
    args.signals,
  )
  if (!walkCandidates.length) {
    walkCandidates = withScores(
      DESTINATIONS.map((place) => fromCatalog(place, "local-list", args.signals)),
      args.signals,
    )
  }

  const clusters = chooseClusters(args.days, args.region, templeCandidates)
  const used = new Set<string>()
  const days = clusters.map((cluster, index) =>
    buildDay(
      index + 1,
      cluster,
      clusters[index - 1],
      templeCandidates,
      mealCandidates,
      walkCandidates,
      args.signals,
      used,
    ),
  )

  const banner = !args.signals.length
    ? "Nothing you named resolved to a taste signal, so this path is the regional list without a because-you-like line."
    : !mealsFromQloo
      ? "Qloo returned no dining places for this signal in Shimane, so the meals are from Temple Path's local list. The temple order still follows your taste signals, and each local-list meal is labeled."
      : undefined

  return {
    title: `${args.region.name}, grounded`,
    mode: "qloo",
    banner,
    days,
  }
}
