import { describe, expect, it } from "vitest"
import { POST } from "@/app/api/itinerary/route"

describe("POST /api/itinerary", () => {
  it("returns a mock-backed plan without a Qloo key", async () => {
    const response = await POST(
      new Request("http://localhost/api/itinerary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          likes: "Brian Eno",
          days: 1,
          regionId: "izumo-matsue",
        }),
      }),
    )
    expect(response.status).toBe(200)
    const body = (await response.json()) as { qlooMode: string; qloo: { days: unknown[] } }
    expect(body.qlooMode).toBe("mock")
    expect(body.qloo.days).toHaveLength(1)
  })

  it("rejects a body with no likes", async () => {
    const response = await POST(
      new Request("http://localhost/api/itinerary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ likes: " ", days: 2, regionId: "izumo-matsue" }),
      }),
    )
    expect(response.status).toBe(400)
  })
})
