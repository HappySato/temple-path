import { describe, expect, it } from "vitest"
import { PlanError, planTrip } from "@/lib/agent/plan"
import type { LlmClient } from "@/lib/llm/client"
import { MockQlooClient } from "@/lib/qloo/mock"
import type { Itinerary } from "@/lib/domain"

const deps = { qloo: new MockQlooClient(), llm: null }

function names(itinerary: Itinerary): string[] {
  return itinerary.days.flatMap((day) => day.stops.map((stop) => stop.name))
}

describe("planTrip", () => {
  it("grounds a quiet, tea-leaning trip and leaves the guidebook unchanged", async () => {
    const quiet = await planTrip(
      { likes: "Ryuichi Sakamoto, matcha", days: 2, regionId: "izumo-matsue" },
      deps,
    )
    const seafood = await planTrip(
      { likes: "seafood, sake", days: 2, regionId: "izumo-matsue" },
      deps,
    )

    expect(quiet.qlooMode).toBe("mock")
    expect(quiet.llm.mode).toBe("baseline")
    expect(quiet.qloo.mode).toBe("qloo")
    expect(quiet.comparison.mode).toBe("baseline")
    expect(quiet.qloo.days).toHaveLength(2)
    expect(quiet.profile.entities.map((entity) => entity.name)).toContain("Ryuichi Sakamoto")
    expect(quiet.profile.tags.map((tag) => tag.name)).toContain("Matcha")
    expect(quiet.profile.unresolved).not.toContain("matcha")

    expect(quiet.trail.map((step) => step.tool)).toEqual(
      expect.arrayContaining([
        "search_entities",
        "get_tags",
        "get_insights",
        "build_itinerary",
      ]),
    )

    for (const day of quiet.qloo.days) {
      expect(day.stops.length).toBeGreaterThanOrEqual(3)
      for (const stop of day.stops) {
        expect(stop.reason).toMatch(/Because you like/)
      }
    }

    expect(names(quiet.qloo).join(" ")).toContain("Meimei-an")
    expect(names(seafood.qloo).join(" ")).toMatch(/Miho Shrine|Minami-kan|Shijimi|Hinomisaki/)
    expect(names(quiet.qloo)).not.toEqual(names(seafood.qloo))
    expect(names(quiet.comparison)).toEqual(names(seafood.comparison))
    expect(JSON.stringify(quiet.comparison)).not.toMatch(/Because you like|MOCK-/)
    expect(quiet.comparison.days[1]?.stops[0]?.name).toBe("Matsue Castle")
  })

  it("rejects an empty list of likes", async () => {
    await expect(
      planTrip({ likes: "   ", days: 2, regionId: "izumo-matsue" }, deps),
    ).rejects.toBeInstanceOf(PlanError)
  })

  it("uses a model reply when one is configured, and the prompt never carries Qloo ids", async () => {
    let prompt = ""
    const llm: LlmClient = {
      mode: "llm",
      provider: "test",
      model: "fake-model",
      async complete(system, user) {
        prompt = `${system}\n${user}`
        return JSON.stringify({
          title: "Model path",
          days: [
            {
              day: 1,
              title: "A guessed day",
              stops: [
                {
                  time: "09:00",
                  kind: "shrine",
                  name: "Izumo Taisha",
                  nameJa: "出雲大社",
                  area: "izumo",
                  summary: "The shrine most models name first.",
                  reason: "It is the famous one.",
                },
                {
                  time: "12:00",
                  kind: "meal",
                  name: "Soba near the shrine",
                  nameJa: "",
                  area: "izumo",
                  summary: "Noodles.",
                  reason: "Lunch.",
                },
              ],
            },
          ],
        })
      },
    }

    const plan = await planTrip(
      { likes: "Ryuichi Sakamoto", days: 2, regionId: "izumo-matsue" },
      { qloo: new MockQlooClient(), llm },
    )
    expect(plan.comparison.mode).toBe("llm")
    expect(plan.llm).toMatchObject({ mode: "llm", model: "fake-model" })
    expect(plan.comparison.days[0]?.stops[0]?.grounding).toBe("llm")
    expect(prompt).not.toMatch(/Qloo|MOCK-|urn:entity|entity_id/)
    expect(prompt).toContain("Ryuichi Sakamoto")
  })

  it("falls back to the guidebook when the model reply is not usable", async () => {
    const llm: LlmClient = {
      mode: "llm",
      provider: "test",
      model: "fake-model",
      async complete() {
        return "I cannot help with that."
      },
    }
    const plan = await planTrip(
      { likes: "Miles Davis", days: 1, regionId: "matsue-shinji" },
      { qloo: new MockQlooClient(), llm },
    )
    expect(plan.comparison.mode).toBe("baseline")
    expect(plan.comparison.banner).toMatch(/guidebook baseline/)
    expect(plan.llm.note).toMatch(/not usable/)
  })
})
