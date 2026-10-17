import type { QlooEntity, QlooTag } from "@/lib/qloo/types"
import type { Tastes, TasteSignal } from "@/lib/domain"

export type DemoEntity = {
  entityId: string
  name: string
  aliases: string[]
  type: string
  description: string
  popularity: number
  tastes: Tastes
  tags: QlooTag[]
}

export type DemoTag = QlooTag & {
  aliases: string[]
  tastes: Tastes
}

/**
 * Hand-written demo catalog. Ids are prefixed MOCK- so they cannot be
 * mistaken for stored Qloo responses.
 */
export const DEMO_ENTITIES: DemoEntity[] = [
  {
    entityId: "MOCK-ENT-ENO",
    name: "Brian Eno",
    aliases: ["brian eno", "eno"],
    type: "urn:entity:artist",
    description: "Ambient and minimal music, built from rooms and patience.",
    popularity: 0.8,
    tastes: { quiet: 1, dawn: 0.8, minimal: 0.9, restraint: 0.75, garden: 0.35 },
    tags: [
      { id: "MOCK-TAG-AMBIENT", name: "Ambient", type: "urn:tag:demo:music" },
    ],
  },
  {
    entityId: "MOCK-ENT-SAKAMOTO",
    name: "Ryuichi Sakamoto",
    aliases: ["ryuichi sakamoto", "sakamoto", "坂本龍一"],
    type: "urn:entity:artist",
    description: "Piano, film scores, and a late style of almost nothing.",
    popularity: 0.86,
    tastes: {
      quiet: 0.95,
      minimal: 0.85,
      restraint: 0.8,
      tea: 0.55,
      lake: 0.35,
      dawn: 0.4,
    },
    tags: [
      { id: "MOCK-TAG-AMBIENT", name: "Ambient", type: "urn:tag:demo:music" },
    ],
  },
  {
    entityId: "MOCK-ENT-YOSHIMURA",
    name: "Hiroshi Yoshimura",
    aliases: ["hiroshi yoshimura", "yoshimura", "吉村弘"],
    type: "urn:entity:artist",
    description: "Environmental music that behaves like a quiet building.",
    popularity: 0.62,
    tastes: { quiet: 1, garden: 0.8, dawn: 0.6, minimal: 0.7, restraint: 0.6 },
    tags: [
      { id: "MOCK-TAG-AMBIENT", name: "Ambient", type: "urn:tag:demo:music" },
    ],
  },
  {
    entityId: "MOCK-ENT-MILES",
    name: "Miles Davis",
    aliases: ["miles davis", "miles"],
    type: "urn:entity:artist",
    description: "Jazz that changed temperature several times.",
    popularity: 0.9,
    tastes: { jazz: 1, night: 0.8, coffee: 0.65, rain: 0.35 },
    tags: [{ id: "MOCK-TAG-JAZZ", name: "Jazz", type: "urn:tag:demo:music" }],
  },
  {
    entityId: "MOCK-ENT-EVANS",
    name: "Bill Evans",
    aliases: ["bill evans"],
    type: "urn:entity:artist",
    description: "Piano trio jazz, quiet even when it swings.",
    popularity: 0.7,
    tastes: { jazz: 0.9, night: 0.55, quiet: 0.7, rain: 0.5, coffee: 0.4 },
    tags: [{ id: "MOCK-TAG-JAZZ", name: "Jazz", type: "urn:tag:demo:music" }],
  },
  {
    entityId: "MOCK-ENT-SPIRITED",
    name: "Spirited Away",
    aliases: ["spirited away", "sen to chihiro", "千と千尋の神隠し"],
    type: "urn:entity:movie",
    description: "A bathhouse of spirits, food, and work.",
    popularity: 0.95,
    tastes: { spirits: 1, myth: 0.7, forest: 0.45, onsen: 0.55, sweets: 0.35 },
    tags: [{ id: "MOCK-TAG-FOREST", name: "Forest", type: "urn:tag:demo:place" }],
  },
  {
    entityId: "MOCK-ENT-TOTORO",
    name: "My Neighbor Totoro",
    aliases: ["my neighbor totoro", "totoro", "となりのトトロ"],
    type: "urn:entity:movie",
    description: "A rural forest, rain, and a bus stop.",
    popularity: 0.92,
    tastes: { forest: 1, moss: 0.8, quiet: 0.55, rain: 0.6, spirits: 0.45 },
    tags: [{ id: "MOCK-TAG-FOREST", name: "Forest", type: "urn:tag:demo:place" }],
  },
  {
    entityId: "MOCK-ENT-GHIBLI",
    name: "Studio Ghibli",
    aliases: ["studio ghibli", "ghibli"],
    type: "urn:entity:brand",
    description: "Films of forests, work, and food.",
    popularity: 0.9,
    tastes: { forest: 0.85, spirits: 0.8, sweets: 0.4, quiet: 0.35, myth: 0.4 },
    tags: [{ id: "MOCK-TAG-FOREST", name: "Forest", type: "urn:tag:demo:place" }],
  },
  {
    entityId: "MOCK-ENT-NORWEGIAN",
    name: "Norwegian Wood",
    aliases: ["norwegian wood", "haruki murakami", "murakami", "村上春樹"],
    type: "urn:entity:book",
    description: "A novel of rain, records, and rooms.",
    popularity: 0.84,
    tastes: { literature: 1, rain: 0.75, jazz: 0.45, night: 0.5, coffee: 0.4 },
    tags: [
      {
        id: "MOCK-TAG-LITERATURE",
        name: "Literature",
        type: "urn:tag:demo:books",
      },
    ],
  },
  {
    entityId: "MOCK-ENT-KAFKA",
    name: "Kafka on the Shore",
    aliases: ["kafka on the shore"],
    type: "urn:entity:book",
    description: "A novel of libraries, forests, and things that should not speak.",
    popularity: 0.8,
    tastes: { literature: 0.85, spirits: 0.7, forest: 0.55, rain: 0.5 },
    tags: [
      {
        id: "MOCK-TAG-LITERATURE",
        name: "Literature",
        type: "urn:tag:demo:books",
      },
    ],
  },
  {
    entityId: "MOCK-ENT-KWAIDAN",
    name: "Kwaidan",
    aliases: ["kwaidan", "lafcadio hearn", "hearn", "小泉八雲", "yakumo"],
    type: "urn:entity:book",
    description: "Ghost stories Hearn set down in Japan, several of them from this coast.",
    popularity: 0.66,
    tastes: { literature: 1, spirits: 0.9, rain: 0.6, night: 0.55, myth: 0.6 },
    tags: [
      {
        id: "MOCK-TAG-LITERATURE",
        name: "Literature",
        type: "urn:tag:demo:books",
      },
    ],
  },
  {
    entityId: "MOCK-ENT-MUJI",
    name: "MUJI",
    aliases: ["muji", "無印良品", "muji ryohin"],
    type: "urn:entity:brand",
    description: "Plain goods, empty shelves, very little logo.",
    popularity: 0.88,
    tastes: { minimal: 1, restraint: 0.9, craft: 0.55, quiet: 0.5 },
    tags: [],
  },
  {
    entityId: "MOCK-ENT-AESOP",
    name: "Aesop",
    aliases: ["aesop"],
    type: "urn:entity:brand",
    description: "A retail ritual of scent and brown bottles.",
    popularity: 0.6,
    tastes: { ritual: 0.7, restraint: 0.65, quiet: 0.5, craft: 0.45 },
    tags: [],
  },
]

export const DEMO_TAGS: DemoTag[] = [
  {
    id: "MOCK-TAG-MATCHA",
    name: "Matcha",
    type: "urn:tag:demo:tea",
    aliases: ["matcha", "green tea", "tea ceremony", "抹茶"],
    tastes: { tea: 1, sweets: 0.65, quiet: 0.55, restraint: 0.5 },
  },
  {
    id: "MOCK-TAG-SOBA",
    name: "Soba",
    type: "urn:tag:demo:food",
    aliases: ["soba", "buckwheat", "izumo soba", "出雲そば"],
    tastes: { soba: 1, restraint: 0.4, craft: 0.35 },
  },
  {
    id: "MOCK-TAG-SEAFOOD",
    name: "Seafood",
    type: "urn:tag:demo:food",
    aliases: ["seafood", "sashimi", "sushi", "fish", "oyster"],
    tastes: { seafood: 1, coast: 0.85, lake: 0.25 },
  },
  {
    id: "MOCK-TAG-SAKE",
    name: "Sake",
    type: "urn:tag:demo:drink",
    aliases: ["sake", "nihonshu", "日本酒"],
    tastes: { sake: 1, night: 0.4, craft: 0.5 },
  },
  {
    id: "MOCK-TAG-COFFEE",
    name: "Coffee",
    type: "urn:tag:demo:drink",
    aliases: ["coffee", "kissaten", "espresso"],
    tastes: { coffee: 1, jazz: 0.35, night: 0.3 },
  },
  {
    id: "MOCK-TAG-JAZZ",
    name: "Jazz",
    type: "urn:tag:demo:music",
    aliases: ["jazz", "bebop"],
    tastes: { jazz: 1, night: 0.6, coffee: 0.4 },
  },
  {
    id: "MOCK-TAG-AMBIENT",
    name: "Ambient",
    type: "urn:tag:demo:music",
    aliases: ["ambient", "minimalism", "minimal music", "environmental music"],
    tastes: { quiet: 0.9, minimal: 0.8, dawn: 0.55, restraint: 0.5 },
  },
  {
    id: "MOCK-TAG-FOREST",
    name: "Forest",
    type: "urn:tag:demo:place",
    aliases: ["forest", "moss", "woods", "nature"],
    tastes: { forest: 0.9, moss: 0.6, quiet: 0.4 },
  },
  {
    id: "MOCK-TAG-LITERATURE",
    name: "Literature",
    type: "urn:tag:demo:books",
    aliases: ["literature", "novels", "books", "reading"],
    tastes: { literature: 0.85, rain: 0.35, night: 0.25 },
  },
]

const GENERIC: { pattern: RegExp; tastes: Tastes }[] = [
  { pattern: /ambient|minimal|instrumental|piano/, tastes: { quiet: 0.8, minimal: 0.7, dawn: 0.4 } },
  { pattern: /jazz|blues/, tastes: { jazz: 0.9, night: 0.6, coffee: 0.4 } },
  { pattern: /tea|matcha/, tastes: { tea: 1, quiet: 0.4, sweets: 0.4 } },
  { pattern: /seafood|sushi|sashimi|fish|oyster/, tastes: { seafood: 0.85, coast: 0.4 } },
  { pattern: /soba|noodle|buckwheat/, tastes: { soba: 0.9 } },
  { pattern: /ghibli|anime|animation|totoro/, tastes: { spirits: 0.6, forest: 0.55 } },
  { pattern: /ghost|horror|folk|shrine/, tastes: { spirits: 0.7, myth: 0.5, night: 0.35 } },
  { pattern: /design|wabi|muji|minimalism/, tastes: { minimal: 0.8, restraint: 0.7, craft: 0.4 } },
  { pattern: /forest|garden|nature|moss/, tastes: { forest: 0.7, garden: 0.55, quiet: 0.4 } },
  { pattern: /novel|literature|poetry|book/, tastes: { literature: 0.7, rain: 0.3 } },
  { pattern: /coffee|cafe|kissaten/, tastes: { coffee: 0.85, night: 0.3 } },
  { pattern: /sake|wine|brewery/, tastes: { sake: 0.75, night: 0.4 } },
  { pattern: /onsen|bath|hot spring/, tastes: { onsen: 0.8, quiet: 0.3 } },
]

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, " ")
    .trim()
}

export function inferTastes(name: string): Tastes {
  const normalized = normalizeText(name)
  const known = DEMO_TAGS.find((tag) =>
    [tag.name, ...tag.aliases].some((alias) => normalizeText(alias) === normalized),
  )
  if (known) return { ...known.tastes }

  const tastes: Tastes = {}
  for (const rule of GENERIC) {
    if (rule.pattern.test(normalized)) {
      for (const [key, weight] of Object.entries(rule.tastes)) {
        tastes[key] = Math.max(tastes[key] ?? 0, weight)
      }
    }
  }
  return tastes
}

export function signalFromEntity(entity: QlooEntity): TasteSignal {
  const tastes: Tastes = { ...(entity.tastes ?? {}) }
  for (const tag of entity.tags) {
    const part = tag.tastes ?? inferTastes(tag.name)
    for (const [key, weight] of Object.entries(part)) {
      tastes[key] = Math.max(tastes[key] ?? 0, weight)
    }
  }
  if (Object.keys(tastes).length === 0) {
    Object.assign(tastes, inferTastes(entity.name))
  }
  return { id: entity.entityId, name: entity.name, tastes }
}

export function signalFromTag(tag: QlooTag): TasteSignal {
  const base = tag.tastes ?? inferTastes(tag.name)
  const scale = tag.affinity == null ? 1 : tag.affinity
  const tastes: Tastes = {}
  for (const [key, weight] of Object.entries(base)) {
    tastes[key] = weight * scale
  }
  return { id: tag.id, name: tag.name, tastes }
}
