import { describe, expect, it } from "vitest"
import { parseEntities, parseInsights, parseTags } from "@/lib/qloo/parse"

describe("Qloo payload parser", () => {
  it("reads a hand-written search list and an insights entity", () => {
    const search = parseEntities({
      results: [
        {
          entity_id: "MOCK-PARSE-2",
          name: "Sample Artist",
          types: ["urn:entity:artist"],
          popularity: 0.4,
        },
      ],
    })
    expect(search[0]).toMatchObject({
      entityId: "MOCK-PARSE-2",
      name: "Sample Artist",
      type: "urn:entity:artist",
      popularity: 0.4,
    })

    const insights = parseInsights({
      results: {
        entities: [
          {
            name: "Sample Place",
            entity_id: "MOCK-PARSE-1",
            subtype: "urn:entity:place",
            properties: {
              description: "A synthetic parse fixture.",
              address: "1 Demo Lane",
            },
            tags: [{ id: "urn:tag:demo:tea", name: "Tea", type: "urn:tag:demo" }],
            query: { affinity: 0.42 },
          },
        ],
      },
    })
    expect(insights.entities[0]).toMatchObject({
      entityId: "MOCK-PARSE-1",
      name: "Sample Place",
      description: "A synthetic parse fixture.",
      address: "1 Demo Lane",
      affinity: 0.42,
    })
    expect(insights.entities[0]?.tags[0]?.name).toBe("Tea")
  })

  it("reads tag ids from either id or tag_id", () => {
    const tags = parseTags({
      results: {
        tags: [
          { tag_id: "urn:tag:demo:music:ambient", name: "Ambient", type: "urn:tag:demo:music" },
        ],
      },
    })
    expect(tags[0]).toMatchObject({ id: "urn:tag:demo:music:ambient", name: "Ambient" })
  })
})
