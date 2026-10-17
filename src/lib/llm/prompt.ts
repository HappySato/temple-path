import type { Region } from "@/lib/content/regions"

export function buildUngroundedPrompt(args: {
  likes: string[]
  days: number
  region: Region
}): { system: string; user: string } {
  const system = [
    "You are a careful travel writer for Izumo and Matsue in Shimane, Japan.",
    "You do not have a taste graph. Use only general knowledge.",
    "Do not invent restaurant names. Use well-known public places, or describe the dish without naming a shop.",
    "Prefer shrines, temples, and meals a visitor can actually reach in a day.",
    "Return JSON only, no markdown.",
  ].join(" ")

  const user = [
    `Region: ${args.region.name}, ${args.region.prefecture}.`,
    `Days: ${args.days}.`,
    `The traveler likes: ${args.likes.join(", ")}.`,
    "Write a day-by-day itinerary. Each stop needs time (HH:MM), kind (shrine, temple, meal, tea, cafe, walk, or sake), name, nameJa (Japanese, or an empty string), area, summary, reason, and an optional monksNote.",
    "The reason may mention their likes from general knowledge, but you have no affinity scores and no entity ids.",
    'JSON shape: {"title": string, "days": [{"day": number, "title": string, "note": string, "stops": [{"time": string, "kind": string, "name": string, "nameJa": string, "area": string, "summary": string, "reason": string, "monksNote": string}]}]}',
  ].join("\n")

  return { system, user }
}
