import { describe, expect, it } from "vitest"
import { MemoryCache } from "@/lib/qloo/cache"
import { createQlooClient } from "@/lib/qloo"
import { LiveQlooClient } from "@/lib/qloo/live"
import { MockQlooClient } from "@/lib/qloo/mock"

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

describe("Qloo client switch", () => {
  it("uses the mock catalog without a key and the live client with one", () => {
    expect(createQlooClient({}).mode).toBe("mock")
    expect(createQlooClient({ QLOO_API_KEY: " " }).mode).toBe("mock")
    expect(createQlooClient({ QLOO_API_KEY: "test-key" }).mode).toBe("live")
    expect(new MockQlooClient().mode).toBe("mock")
  })
})

describe("LiveQlooClient", () => {
  it("calls GET /search, /v2/tags, and /v2/insights with the key header", async () => {
    const urls: URL[] = []
    const headers: Headers[] = []
    const client = new LiveQlooClient({
      apiKey: "test-key",
      baseUrl: "https://hackathon.api.qloo.com",
      cache: new MemoryCache(),
      fetchImpl: async (input, init) => {
        const url = new URL(String(input))
        urls.push(url)
        headers.push(new Headers(init?.headers))
        expect(init?.method).toBe("GET")
        if (url.pathname === "/search") {
          return jsonResponse({ results: [] })
        }
        if (url.pathname === "/v2/tags") {
          return jsonResponse({ results: { tags: [] } })
        }
        return jsonResponse({ results: { entities: [] } })
      },
    })

    await client.search({ query: "Brian Eno", take: 4 })
    await client.tags({ query: "matcha" })
    await client.insights({
      filterType: "urn:entity:place",
      entityIds: ["MOCK-ENT-ENO"],
      tagIds: ["MOCK-TAG-MATCHA"],
      locationQuery: "Izumo",
      location: "POINT(132.685 35.402)",
      radiusMeters: 40000,
      geocodeCountry: "JP",
      geocodeAdmin1: "Shimane",
      take: 8,
    })
    await client.insights({
      filterType: "urn:entity:destination",
      entityIds: ["MOCK-ENT-ENO"],
      locationQuery: "Izumo",
      geocodeCountry: "JP",
      geocodeAdmin1: "Shimane",
    })

    expect(urls.map((url) => url.pathname)).toEqual([
      "/search",
      "/v2/tags",
      "/v2/insights",
      "/v2/insights",
    ])
    expect(urls.every((url) => !url.pathname.includes("recommendation") && url.pathname !== "/recs")).toBe(true)
    expect(urls.every((url) => !url.toString().includes("test-key"))).toBe(true)
    expect(headers.every((header) => header.get("X-Api-Key") === "test-key")).toBe(true)

    const search = urls[0]
    expect(search?.searchParams.get("query")).toBe("Brian Eno")
    expect(search?.searchParams.get("types")).toContain("urn:entity:artist")

    const tags = urls[1]
    expect(tags?.searchParams.get("filter.query")).toBe("matcha")

    const places = urls[2]
    expect(places?.searchParams.get("filter.type")).toBe("urn:entity:place")
    expect(places?.searchParams.get("signal.interests.entities")).toBe("MOCK-ENT-ENO")
    expect(places?.searchParams.get("signal.interests.tags")).toBe("MOCK-TAG-MATCHA")
    expect(places?.searchParams.get("filter.location.query")).toBe("Izumo")
    expect(places?.searchParams.get("filter.location")).toBe("POINT(132.685 35.402)")
    expect(places?.searchParams.get("filter.location.radius")).toBe("40000")
    expect(places?.searchParams.get("filter.geocode.country_code")).toBe("JP")

    const destinations = urls[3]
    expect(destinations?.searchParams.get("filter.type")).toBe("urn:entity:destination")
  })

  it("treats a search 404 as an empty result and caches the next identical call", async () => {
    let calls = 0
    const cache = new MemoryCache()
    const client = new LiveQlooClient({
      apiKey: "test-key",
      baseUrl: "https://hackathon.api.qloo.com",
      cache,
      fetchImpl: async () => {
        calls += 1
        return jsonResponse({ message: "missing" }, 404)
      },
    })
    await expect(client.search({ query: "nobody" })).resolves.toEqual([])
    await expect(client.search({ query: "nobody" })).resolves.toEqual([])
    expect(calls).toBe(1)
  })

  it("refuses legacy recommendation paths", async () => {
    const client = new LiveQlooClient({
      apiKey: "test-key",
      baseUrl: "https://hackathon.api.qloo.com",
      fetchImpl: async () => jsonResponse({}),
    })
    await expect(
      client.insights({ filterType: "urn:entity:place" }),
    ).resolves.toBeTruthy()
    const forbidden = client as unknown as {
      get: (path: string, query: Record<string, string>) => Promise<unknown>
    }
    await expect(forbidden.get("/recommendations", {})).rejects.toThrow(/Legacy/)
  })
})

describe("MockQlooClient", () => {
  const mock = new MockQlooClient()

  it("resolves a known artist and returns nothing for a place outside Shimane", async () => {
    const found = await mock.search({ query: "Brian Eno" })
    expect(found[0]?.entityId).toBe("MOCK-ENT-ENO")
    expect(found[0]?.entityId.startsWith("MOCK-")).toBe(true)

    const empty = await mock.search({ query: "zzzz-not-a-thing" })
    expect(empty).toEqual([])

    const far = await mock.insights({
      filterType: "urn:entity:place",
      entityIds: ["MOCK-ENT-ENO"],
      locationQuery: "New York",
      take: 5,
    })
    expect(far.entities).toEqual([])

    const near = await mock.insights({
      filterType: "urn:entity:place",
      entityIds: ["MOCK-ENT-ENO"],
      locationQuery: "Izumo",
      take: 5,
    })
    expect(near.entities.length).toBeGreaterThan(0)
    expect(near.entities.every((entity) => entity.entityId.startsWith("MOCK-"))).toBe(true)
  })
})
