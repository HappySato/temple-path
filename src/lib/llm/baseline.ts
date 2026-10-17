import type { CatalogPlace, Itinerary, Stop, StopKind } from "@/lib/domain"
import { DESTINATIONS, MEALS, TEMPLES } from "@/lib/content/places"
import type { Region } from "@/lib/content/regions"

const ALL = [...TEMPLES, ...MEALS, ...DESTINATIONS]

const DEFAULT_BANNER =
  "No LLM key is set. This column is a local guidebook baseline — the shape of answer a model gives without a taste graph. It does not change when your tastes change."

type Seed = {
  time: string
  placeId?: string
  reason: string
  custom?: {
    name: string
    nameJa: string
    kind: StopKind
    area: string
    summary: string
    monksNote?: string
  }
}

type DayTemplate = {
  title: string
  note?: string
  stops: Seed[]
}

function catalogStop(seed: Seed, day: number, index: number): Stop {
  if (seed.custom) {
    return {
      id: `guide-${day}-${index}`,
      time: seed.time,
      kind: seed.custom.kind,
      name: seed.custom.name,
      nameJa: seed.custom.nameJa,
      area: seed.custom.area,
      summary: seed.custom.summary,
      reason: seed.reason,
      monksNote: seed.custom.monksNote,
      grounding: "guidebook",
      signals: [],
    }
  }
  const place = ALL.find((item) => item.id === seed.placeId)
  if (!place) {
    throw new Error(`Unknown guidebook place: ${seed.placeId}`)
  }
  return stopFromPlace(place, day, index, seed.time, seed.reason)
}

function stopFromPlace(
  place: CatalogPlace,
  day: number,
  index: number,
  time: string,
  reason: string,
): Stop {
  return {
    id: `guide-${day}-${place.id}-${index}`,
    time,
    kind: place.kind,
    name: place.name,
    nameJa: place.nameJa,
    area: place.area,
    summary: place.summary,
    reason,
    monksNote: place.monksNote,
    grounding: "guidebook",
    signals: [],
  }
}

const WEST: DayTemplate = {
  title: "Izumo, as the guidebook opens it",
  stops: [
    {
      time: "09:00",
      placeId: "izumo-taisha",
      reason: "Listed in nearly every Shimane guidebook.",
    },
    {
      time: "11:30",
      placeId: "taisha-soba",
      reason: "The usual lunch on the shrine approach.",
    },
    {
      time: "14:30",
      placeId: "hinomisaki",
      reason: "The standard coastal stop, independent of what you love.",
    },
  ],
}

const WEST_ALT: DayTemplate = {
  title: "The same coast, still from the guidebook",
  note: "Stay on this side of the peninsula. Matsue is a different day.",
  stops: [
    {
      time: "08:40",
      placeId: "gakuenji",
      reason: "A famous mountain temple near the shrine, recommended to everyone.",
    },
    {
      time: "12:00",
      placeId: "taisha-yakisoba",
      reason: "The local noodle the guidebook mentions after the shrine.",
    },
    {
      time: "15:00",
      placeId: "inasa",
      reason: "The beach every Izumo itinerary adds for the myth.",
    },
  ],
}

const LIGHTHOUSE: DayTemplate = {
  title: "The lighthouse, because the guidebook pairs it",
  stops: [
    {
      time: "09:30",
      reason: "A standard pairing with the shrine, independent of what you love.",
      custom: {
        name: "Hinomisaki lighthouse",
        nameJa: "出雲日御碕灯台",
        kind: "walk",
        area: "coast",
        summary:
          "The white lighthouse on the same cliff as Hinomisaki Shrine. Guidebooks treat the two as one outing.",
        monksNote: "The cliff path is windy. Keep back from the edge when the spray is up.",
      },
    },
    {
      time: "12:00",
      placeId: "hinomisaki-bowl",
      reason: "The usual lunch once you are already at the port.",
    },
    {
      time: "15:30",
      placeId: "izumo-taisha",
      reason: "Guidebooks send you back to the shrine for the late light.",
    },
  ],
}

const EAST: DayTemplate = {
  title: "Matsue, as the guidebook opens it",
  note: "The Ichibata Electric Railway follows the north shore of Lake Shinji between Izumo Taisha-mae and Matsue, about an hour. Sit on the lake side.",
  stops: [
    {
      time: "09:00",
      reason: "Listed in nearly every Shimane guidebook.",
      custom: {
        name: "Matsue Castle",
        nameJa: "松江城",
        kind: "walk",
        area: "matsue",
        summary:
          "The black castle in the middle of the city. Most one-page itineraries start here and walk the moat.",
        monksNote: "It is a castle, not a shrine. The quiet precincts are elsewhere.",
      },
    },
    {
      time: "11:10",
      placeId: "yakumoan",
      reason: "The usual soba stop in the samurai district.",
    },
    {
      time: "14:00",
      placeId: "hearn",
      reason: "A standard literary stop, whether or not you read Hearn.",
    },
    {
      time: "16:30",
      placeId: "shinji-sunset",
      reason: "The sunset the guidebook tells everyone to watch.",
    },
  ],
}

const EAST_ALT: DayTemplate = {
  title: "Another Matsue page from the guidebook",
  stops: [
    {
      time: "09:00",
      placeId: "kamosu",
      reason: "Included because it is old and famous, not because it matches a taste.",
    },
    {
      time: "11:20",
      placeId: "matsumoto",
      reason: "Another soba shop the guidebook lists.",
    },
    {
      time: "14:30",
      placeId: "gesshoji",
      reason: "The family temple that appears on every Matsue map.",
    },
    {
      time: "16:10",
      placeId: "meimeian",
      reason: "Tea, because Matsue is known for tea — not because you asked for it.",
    },
  ],
}

const LAKE: DayTemplate = {
  title: "The lake, as the guidebook opens it",
  note: "Ichibata Yakushi is a stop on the lakeside railway, between the two towns.",
  stops: [
    {
      time: "09:30",
      placeId: "ichibata-yakushi",
      reason: "The lakeside temple every rail itinerary includes.",
    },
    {
      time: "12:10",
      placeId: "shijimi",
      reason: "Shijimi, because that is the dish the guidebook names for the lake.",
    },
    {
      time: "15:00",
      placeId: "yuushien",
      reason: "A famous garden added regardless of the season you travel.",
    },
  ],
}

function templatesFor(regionId: string, days: number): DayTemplate[] {
  if (regionId === "matsue-shinji") {
    if (days <= 1) return [stripTransit(EAST)]
    if (days === 2) return [stripTransit(EAST), LAKE]
    return [stripTransit(EAST), LAKE, EAST_ALT]
  }
  if (regionId === "izumo-coast") {
    if (days <= 1) return [WEST]
    if (days === 2) return [WEST, WEST_ALT]
    return [WEST, WEST_ALT, LIGHTHOUSE]
  }
  if (days <= 1) return [WEST]
  if (days === 2) return [WEST, EAST]
  return [WEST, LAKE, EAST]
}

function stripTransit(day: DayTemplate): DayTemplate {
  return { ...day, note: undefined }
}

export function guidebookItinerary(
  region: Region,
  days: number,
  banner = DEFAULT_BANNER,
): Itinerary {
  const templates = templatesFor(region.id, days).slice(0, days)
  return {
    title: `${region.name}, ungrounded`,
    mode: "baseline",
    banner,
    days: templates.map((template, index) => ({
      day: index + 1,
      title: template.title,
      note: template.note,
      stops: template.stops.map((seed, stopIndex) =>
        catalogStop(seed, index + 1, stopIndex),
      ),
    })),
  }
}
