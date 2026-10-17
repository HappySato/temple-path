import { describe, expect, it } from "vitest"
import { MemoryCache } from "@/lib/qloo/cache"

describe("MemoryCache", () => {
  it("expires entries and evicts the oldest when full", () => {
    let now = 0
    const cache = new MemoryCache<string>(1000, 2, () => now)
    cache.set("a", "1")
    cache.set("b", "2")
    now = 500
    expect(cache.get("a")).toBe("1")
    now = 2000
    expect(cache.get("a")).toBeUndefined()

    now = 3000
    cache.set("c", "3")
    cache.set("d", "4")
    cache.set("e", "5")
    expect(cache.get("c")).toBeUndefined()
    expect(cache.get("e")).toBe("5")
    expect(cache.size).toBeLessThanOrEqual(2)
  })
})
