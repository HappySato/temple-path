import { bestSignal } from "@/lib/agent/score"
import type { CatalogPlace, TasteSignal } from "@/lib/domain"

const PLACE: Record<string, string> = {
  quiet: "the precinct is worth the hour when it is almost empty",
  dawn: "the gates and the trees come before the buses",
  forest: "the path under the cedars is the visit, more than the hall",
  moss: "the ground is the garden; walk as if the moss is listening",
  tea: "Matsue still treats tea as a daily art, not a souvenir",
  restraint: "there is almost nothing extra here, which is the recommendation",
  minimal: "the building is old joinery and very little ornament",
  craft: "the hands that made the place are still the point",
  myth: "the story on this ground is older than the present buildings",
  ritual: "come for the form of the visit: bow, side path, a brief prayer",
  spirits: "this is a place that asks you to arrive as a guest",
  grandeur: "the scale is the sermon; you do not need a longer speech",
  relationship: "Izumo's old business is ties between people, and this stop is part of that",
  lake: "the water beside you is brackish Lake Shinji",
  coast: "the hall faces open water, not a shopping street",
  sunset: "in late October the light goes around half past five; be there before it leaves",
  seafood: "the port, not a photograph, decides what belongs on the plate",
  soba: "Izumo soba is dark, aromatic, and stacked in warigo",
  sweets: "the wagashi comes before the tea, which is the local order",
  jazz: "the room is small and a record is the decoration",
  night: "this town is better after the day-trippers have taken the train",
  literature: "this is the town Lafcadio Hearn walked in the rain",
  rain: "do not wait for clear weather; the moss and the lake prefer cloud",
  coffee: "a kissaten, not a queue for a latte",
  healing: "people come here with a specific prayer; give them the room",
  ancient: "the hall is old enough that hurry looks ridiculous",
  architecture: "look at the joinery, then stop looking and bow",
  mountain: "the valley is the approach; leave time for the taxi back",
  walk: "the moving is the point, not a checklist of buildings",
  onsen: "the waters and the shrine share a town and not a gate",
  sake: "a small pour from a Matsue brewery, then the walk back",
  pilgrimage: "arrive on the local train and let the last part be uphill",
  garden: "a composed garden, not a scenic overlook",
}

const MEAL: Record<string, string> = {
  quiet: "a room where the meal can be quiet, which is rarer than the view",
  tea: "the stop is a tea room, not a viewpoint",
  soba: "dark buckwheat in stacked warigo, with the dashi poured over",
  seafood: "the lake or the port is actually on the plate",
  sweets: "wagashi first, then the matcha",
  jazz: "a kissaten that still behaves like a room",
  coffee: "one proper cup, then you leave the seat for someone else",
  literature: "eat in the district Hearn lived in, not at the station",
  rain: "a counter and a hot bowl are the right answer to lake weather",
  sake: "one glass of a local brew, not a crawl",
  restraint: "a short menu, done carefully",
  minimal: "nothing on the table that is not the meal",
  coast: "eat within sight of the water you just stood beside",
  lake: "shijimi or lake fish, while you are actually beside the lake",
  sunset: "a late seat, so the light on the water is part of the meal",
  forest: "something plain after the cedar valley",
  myth: "a town bowl after the shrine, which is an old order of events",
  craft: "it is made here, not reheated for a tour group",
  night: "the later sitting, when the room gets quieter",
  garden: "a seat that looks at a garden while you eat",
  quietude: "a room, not a performance",
}

const WALK: Record<string, string> = {
  coast: "this is the shore itself, not another hall",
  myth: "the old telling puts the gods on this beach in the tenth month",
  lake: "stay for the water, not for another ticketed building",
  sunset: "in late October the light goes around half past five",
  literature: "a house and a short street, which is enough",
  quiet: "a short walk where you do not have to talk",
  garden: "a composed garden, then you leave",
  spirits: "arrive as a guest and do not narrate it",
}

function lineFor(place: CatalogPlace, key: string): string {
  if (
    place.id === "izumo-taisha" &&
    (key === "quiet" || key === "dawn" || key === "minimal")
  ) {
    return "go when the gates open, before the groups fill the approach, and leave the noise behind"
  }
  if (place.kind === "walk" && WALK[key]) return WALK[key]
  const table =
    place.kind === "meal" || place.kind === "tea" || place.kind === "cafe" || place.kind === "sake"
      ? MEAL
      : PLACE
  return table[key] ?? PLACE[key] ?? "the taste signals sit this stop near that interest"
}

export function becauseYouLike(
  place: CatalogPlace,
  signals: TasteSignal[],
): { reason: string; signals: { name: string; id?: string }[] } {
  const best = bestSignal(place.tastes, signals)
  if (!best) {
    return {
      reason: "No taste signal matched. Kept as a regional anchor.",
      signals: [],
    }
  }
  return {
    reason: `Because you like ${best.name} — ${lineFor(place, best.key)}`,
    signals: [{ name: best.name, id: best.id }],
  }
}
