import { describe, expect, it } from "vitest"
import { parseLikes } from "@/lib/agent/likes"

describe("parseLikes", () => {
  it("splits commas, the word and, and Japanese commas", () => {
    expect(parseLikes("Brian Eno, Spirited Away and matcha")).toEqual([
      "Brian Eno",
      "Spirited Away",
      "matcha",
    ])
    expect(parseLikes("坂本龍一、抹茶")).toEqual(["坂本龍一", "抹茶"])
  })

  it("keeps quoted titles intact", () => {
    expect(parseLikes('"My Neighbor Totoro", jazz')).toEqual([
      "My Neighbor Totoro",
      "jazz",
    ])
  })

  it("drops blanks and caps the list", () => {
    expect(parseLikes("  ,  ")).toEqual([])
    expect(parseLikes("aa, bb, cc, dd, ee, ff, gg, hh, ii, jj")).toHaveLength(8)
  })
})
