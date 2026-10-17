import type { CatalogPlace } from "@/lib/domain"

/** Curated sacred places. These are not Qloo records. */
export const TEMPLES: CatalogPlace[] = [
  {
    id: "izumo-taisha",
    name: "Izumo Taisha",
    nameJa: "出雲大社",
    kind: "shrine",
    area: "izumo",
    address: "195 Kizukihigashi, Taisha-cho, Izumo",
    summary:
      "The grand shrine of Izumo. Come in from the copper torii, not the car park. The hall is taisha-zukuri, and the shimenawa on the kagura-den is enormous. You pray at the designated place, not inside the sanctuary.",
    monksNote:
      "Bow once at the torii and keep to the side. Do not touch the shimenawa. If a rite is underway, wait it out. The scale is the sermon; you do not need to narrate it.",
    tastes: {
      myth: 1,
      ritual: 0.95,
      grandeur: 0.85,
      spirits: 0.75,
      relationship: 0.55,
      quiet: 0.35,
    },
  },
  {
    id: "gakuenji",
    name: "Gakuenji",
    nameJa: "鰐淵寺",
    kind: "temple",
    area: "izumo",
    summary:
      "A Tendai temple in the cedar valley west of Izumo Taisha, traditionally dated to 594. Old stories say the timber for the great shrine was prayed for here. The walk under the trees is the visit. A taxi from Taisha is the simple way in.",
    monksNote:
      "This is a working hall. Voices drop at the gate. Shoes come off before the boards. The path is slick after rain, and the valley is not a viewpoint with a railing.",
    tastes: {
      forest: 1,
      quiet: 1,
      dawn: 0.85,
      moss: 0.8,
      mountain: 0.75,
      restraint: 0.7,
      spirits: 0.4,
    },
  },
  {
    id: "ichibata-yakushi",
    name: "Ichibata Yakushi",
    nameJa: "一畑薬師",
    kind: "temple",
    area: "lake",
    summary:
      "A temple on the hill above Lake Shinji, on the Ichibata Electric Railway. People have long come to pray for their eyes. The water is the view, and also the reason to sit still before you photograph it.",
    monksNote:
      "Let someone else have the hall before you frame the lake. Shoes off inside. The slow train along the shore is part of arriving.",
    tastes: {
      lake: 1,
      healing: 0.8,
      quiet: 0.65,
      pilgrimage: 0.55,
      spirits: 0.3,
    },
  },
  {
    id: "yaegaki",
    name: "Yaegaki Shrine",
    nameJa: "八重垣神社",
    kind: "shrine",
    area: "matsue",
    summary:
      "A wooded shrine of Susanoo and Inata-hime, a short ride from central Matsue. The pond is used for a paper-fortune ritual.",
    monksNote:
      "If you float the paper, follow the stall's instructions. Do not step into the pond, and do not photograph someone else's fortune. The trees are part of the shrine.",
    tastes: {
      forest: 0.7,
      myth: 0.75,
      relationship: 0.85,
      quiet: 0.55,
      spirits: 0.6,
    },
  },
  {
    id: "kamosu",
    name: "Kamosu Shrine",
    nameJa: "神魂神社",
    kind: "shrine",
    area: "matsue",
    summary:
      "In the Oba district of Matsue, often called the oldest taisha-zukuri shrine hall still standing. It is small, dark, and almost without ornament. A bus or taxi from the castle; it is not a stop on the moat walk.",
    monksNote:
      "There is very little to see, which is the recommendation. Bow, look once, and do not fill the court with a group.",
    tastes: {
      ancient: 1,
      architecture: 0.9,
      minimal: 0.9,
      restraint: 0.85,
      quiet: 0.75,
      craft: 0.4,
    },
  },
  {
    id: "hinomisaki",
    name: "Hinomisaki Shrine",
    nameJa: "日御碕神社",
    kind: "shrine",
    area: "coast",
    summary:
      "Vermillion halls on the cliff at the western end of the Shimane peninsula, near the lighthouse. The sea is loud. Buses from Izumo Taisha take about twenty minutes.",
    monksNote:
      "Hold onto loose paper; the wind is part of the visit. Walk the precincts that are open, and do not cross a rope because the view is better from the wrong side.",
    tastes: {
      coast: 1,
      sunset: 0.9,
      grandeur: 0.55,
      walk: 0.6,
      myth: 0.45,
    },
  },
  {
    id: "miho",
    name: "Miho Shrine",
    nameJa: "美保神社",
    kind: "shrine",
    area: "miho",
    summary:
      "At Mihonoseki the paired halls face a working fishing port. The Ebisu and Miho traditions live here, and the town still smells like the boats.",
    monksNote:
      "This is a port that holds a shrine. Let the trucks and the gear pass. If you eat afterward, eat what came in on the boats.",
    tastes: {
      seafood: 0.9,
      coast: 0.85,
      myth: 0.65,
      walk: 0.4,
    },
  },
  {
    id: "gesshoji",
    name: "Gessho-ji",
    nameJa: "月照寺",
    kind: "temple",
    area: "matsue",
    summary:
      "The family temple of the Matsudaira lords, a short walk from the castle town. Moss, a pond of stone turtles, and hydrangeas in June. Rain is a better day than sun.",
    monksNote:
      "It is a graveyard that receives visitors, which is not the same thing as a park. Do not tap the turtles, and do not eat among the graves.",
    tastes: {
      moss: 1,
      rain: 0.8,
      quiet: 0.85,
      garden: 0.65,
      literature: 0.4,
      restraint: 0.45,
    },
  },
  {
    id: "kumano-taisha",
    name: "Kumano Taisha",
    nameJa: "熊野大社",
    kind: "shrine",
    area: "matsue",
    summary:
      "An old shrine in the south of Matsue, tied to Izanami. The precinct stays quiet on days when the castle town does not.",
    monksNote:
      "Bow at the gate and keep to the side. There is no need to retell the myth while other people are praying.",
    tastes: {
      myth: 0.85,
      ancient: 0.75,
      forest: 0.4,
      ritual: 0.6,
      quiet: 0.5,
    },
  },
  {
    id: "sada",
    name: "Sada Shrine",
    nameJa: "佐太神社",
    kind: "shrine",
    area: "matsue",
    summary:
      "North of the lake, known for Sada Shinno, a ritual performance still held on the calendar. The lane up to it is ordinary, which is a compliment.",
    monksNote:
      "If a performance is posted, that night is the visit. Otherwise come in the morning, stay briefly, and do not treat the hall as a stage.",
    tastes: {
      ritual: 0.95,
      myth: 0.6,
      night: 0.4,
      ancient: 0.45,
    },
  },
  {
    id: "tamatsukuri",
    name: "Tamatsukuri Yu Shrine",
    nameJa: "玉作湯神社",
    kind: "shrine",
    area: "matsue",
    summary:
      "A shrine at the Tamatsukuri hot springs, east of Matsue, associated with the old jewel-makers and with the waters.",
    monksNote:
      "The baths and the shrine share a town and not a gate. Rinse and dress before you go up to pray. Do not photograph people on the bathhouse approach.",
    tastes: {
      craft: 0.7,
      onsen: 0.9,
      healing: 0.6,
      ritual: 0.4,
      quiet: 0.35,
    },
  },
]

/** Real dining rooms and honest dish-led stops. Not Qloo records. */
export const MEALS: CatalogPlace[] = [
  {
    id: "yakumoan",
    name: "Yakumoan",
    nameJa: "八雲庵",
    kind: "meal",
    area: "matsue",
    address: "308 Kitahori-cho, Matsue",
    summary:
      "Warigo soba in a samurai house beside a garden. The noodles are dark, stacked in round lacquer boxes, and you pour the dashi over them. They stop serving when the dough is gone.",
    monksNote:
      "Slurping is welcome. Say itadakimasu. If the noren is down, the day is over — do not ask them to improvise a table.",
    tastes: {
      soba: 1,
      quiet: 0.55,
      restraint: 0.7,
      garden: 0.5,
      craft: 0.45,
    },
  },
  {
    id: "meimeian",
    name: "Meimei-an",
    nameJa: "明々庵",
    kind: "tea",
    area: "matsue",
    summary:
      "A historic tea house in Kitahori-cho, a minute from Yakumoan. Matcha and a wagashi. Matsue takes sweets seriously because its lords took tea seriously.",
    monksNote:
      "The sweet comes before the tea. Sit as you are invited. The phone stays in a pocket while someone is whisking.",
    tastes: {
      tea: 1,
      sweets: 0.8,
      quiet: 0.9,
      restraint: 0.85,
      craft: 0.6,
      minimal: 0.4,
    },
  },
  {
    id: "taisha-soba",
    name: "Warigo soba on the approach",
    nameJa: "神門通りの出雲そば",
    kind: "meal",
    area: "izumo",
    summary:
      "Shinmon-dori, the approach to Izumo Taisha, is lined with soba shops. The noodles are dark buckwheat in stacked warigo. Choose a room already full of locals that still has dough; the good ones close when it runs out.",
    monksNote:
      "Eat before you are hungry-angry. You do not have to finish every tray, but you do not abandon a whole one. The broth is for pouring, not for leaving in the pot.",
    tastes: {
      soba: 0.95,
      ritual: 0.3,
      myth: 0.25,
      restraint: 0.45,
    },
  },
  {
    id: "matsumoto",
    name: "Matsumoto Soba",
    nameJa: "松本",
    kind: "meal",
    area: "matsue",
    address: "43 Shirakata Honmachi, Matsue",
    summary:
      "Izumo soba with a lineage from the old domain rest-house. Matsue's dashi runs darker and drier than the sweeter broth served in Izumo. Closed Tuesday and the second Wednesday.",
    monksNote:
      "Go near opening if you want a seat. This is a short meal, not a place to spread out maps.",
    tastes: {
      soba: 0.9,
      literature: 0.35,
      craft: 0.5,
      restraint: 0.55,
    },
  },
  {
    id: "minamikan",
    name: "Minami-kan",
    nameJa: "皆美館",
    kind: "meal",
    area: "matsue",
    summary:
      "A historic ryokan on the castle side of Matsue. The kitchen serves a formal course of lake and sea fish. Reserve; guest dining comes first, and this is not a walk-in noodle counter.",
    monksNote:
      "Let them set the order and the pace. If you only have an hour, eat soba instead and do not pretend a ryokan is a cafe.",
    tastes: {
      seafood: 1,
      lake: 0.6,
      restraint: 0.5,
      night: 0.35,
      craft: 0.4,
    },
  },
  {
    id: "kissa-mg",
    name: "Kissa MG",
    nameJa: "喫茶MG",
    kind: "cafe",
    area: "matsue",
    summary:
      "A Showa-era kissaten in Matsue. Coffee, a cutlet, and a room that has not been turned into a counter for laptops.",
    monksNote:
      "Order, sit, and let the room be. One cup is enough. It is not a place to take a call.",
    tastes: {
      coffee: 1,
      jazz: 0.8,
      night: 0.6,
      rain: 0.45,
      quiet: 0.4,
    },
  },
  {
    id: "taisha-yakisoba",
    name: "Taisha yakisoba",
    nameJa: "大社焼そば",
    kind: "meal",
    area: "izumo",
    summary:
      "Salted yakisoba from the diners between Inasa beach and the shrine: thin noodles, fish cake, and pork. It is town food after a formal visit, and it should taste like a diner.",
    monksNote:
      "Eat, thank them, and go. Do not ask for it to be anything other than what the shop has always made.",
    tastes: {
      walk: 0.35,
      myth: 0.2,
      coast: 0.25,
      night: 0.25,
    },
  },
  {
    id: "hinomisaki-bowl",
    name: "A seafood bowl at Hinomisaki",
    nameJa: "日御碕の海鮮丼",
    kind: "meal",
    area: "coast",
    summary:
      "The port under the lighthouse serves rice bowls from the Taisha boats. Shops change hands. Eat where the morning's fish is written on a board, not where the sign has the most English.",
    monksNote:
      "Look at the eyes and the ice, then order one thing. The port is not a tasting menu.",
    tastes: {
      seafood: 1,
      coast: 0.95,
      sunset: 0.35,
    },
  },
  {
    id: "shijimi",
    name: "Shijimi on the lake shore",
    nameJa: "宍道湖のしじみ",
    kind: "meal",
    area: "lake",
    summary:
      "Yamato shijimi from Lake Shinji are larger than river clams. Small rooms along the north shore serve the soup, or a bowl of rice buried under them. Ask for the shiru.",
    monksNote:
      "The broth is the dish. Drink it. Winter meat is fuller; the rest of the year it is still the lake.",
    tastes: {
      seafood: 0.85,
      lake: 0.95,
      quiet: 0.3,
    },
  },
  {
    id: "rihaku",
    name: "A glass of Rihaku",
    nameJa: "李白",
    kind: "sake",
    area: "matsue",
    summary:
      "Rihaku is one of Matsue's three local breweries, with Kokki and Yoneda. Take a small pour where a shop is actually open. Do not plan to drive afterward.",
    monksNote:
      "One cup, then water. The lanes between the moat and the samurai district are dark, and sake is not a test of nerve.",
    tastes: {
      sake: 1,
      craft: 0.55,
      night: 0.5,
      restraint: 0.35,
    },
  },
]

export const DESTINATIONS: CatalogPlace[] = [
  {
    id: "hearn",
    name: "Lafcadio Hearn's residence",
    nameJa: "小泉八雲旧居",
    kind: "walk",
    area: "matsue",
    summary:
      "The small house in the samurai district where Hearn lived, with the memorial museum beside it. The rooms are low and the garden is a pocket.",
    monksNote:
      "It is a house. Speak as you would in anyone's rooms. The street outside is the better place to linger, especially if Yakumoan still has noodles.",
    tastes: {
      literature: 1,
      rain: 0.7,
      night: 0.45,
      spirits: 0.55,
      quiet: 0.5,
    },
  },
  {
    id: "yuushien",
    name: "Yuushien",
    nameJa: "由志園",
    kind: "walk",
    area: "lake",
    summary:
      "A peony garden on Daikonshima, a little east of Matsue. Spring is the famous season. The rest of the year it is still a composed walk, not a theme park.",
    monksNote:
      "Stay on the paths. The garden is someone's arrangement, not a picnic ground.",
    tastes: {
      garden: 1,
      quiet: 0.55,
      restraint: 0.45,
      rain: 0.3,
    },
  },
  {
    id: "shinji-sunset",
    name: "Lake Shinji at dusk",
    nameJa: "宍道湖の夕景",
    kind: "walk",
    area: "lake",
    summary:
      "The west shore and the river side both face the sunset. In late October the light goes around half past five. Shijimi boats, when you see them, are a morning event.",
    monksNote:
      "Stand and watch it finish. You do not need a commentary, and you do not need to stand in front of someone who got there first.",
    tastes: {
      lake: 1,
      sunset: 0.95,
      quiet: 0.55,
      rain: 0.3,
    },
  },
  {
    id: "inasa",
    name: "Inasa-no-hama",
    nameJa: "稲佐の浜",
    kind: "walk",
    area: "izumo",
    summary:
      "The beach just west of Izumo Taisha. In the tenth lunar month the old telling says the gods come ashore here. It is a walk, not a swimming beach, and the wind is serious.",
    monksNote:
      "Do not climb the shrine rocks, and do not turn a myth into a costume. The gravel and the wind are enough.",
    tastes: {
      myth: 0.85,
      coast: 0.75,
      spirits: 0.65,
      walk: 0.7,
      sunset: 0.4,
    },
  },
]

export const CATALOG: CatalogPlace[] = [...TEMPLES, ...MEALS, ...DESTINATIONS]

export function findCatalogPlace(entityId: string, name: string): CatalogPlace | undefined {
  const byId = CATALOG.find(
    (place) =>
      entityId === `MOCK-PLACE-${place.id}` || entityId === `MOCK-DEST-${place.id}`,
  )
  if (byId) return byId
  const normalized = name.trim().toLowerCase()
  return CATALOG.find((place) => place.name.toLowerCase() === normalized)
}
