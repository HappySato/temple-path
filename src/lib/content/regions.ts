import type { Area, Cluster } from "@/lib/domain"

export type Region = {
  id: string
  name: string
  prefecture: string
  blurb: string
  locationQuery: string
  /** WKT POINT, longitude then latitude. */
  point: string
  radiusMeters: number
  clusters: Cluster[]
}

export const REGIONS: Region[] = [
  {
    id: "izumo-matsue",
    name: "Izumo & Matsue",
    prefecture: "Shimane",
    blurb: "The grand shrine, the castle town, and the lake between them.",
    locationQuery: "Izumo",
    point: "POINT(132.685 35.402)",
    radiusMeters: 40000,
    clusters: ["west", "east", "lake"],
  },
  {
    id: "matsue-shinji",
    name: "Matsue & Lake Shinji",
    prefecture: "Shimane",
    blurb: "Castle town, tea, and the brackish lake.",
    locationQuery: "Matsue",
    point: "POINT(133.051 35.475)",
    radiusMeters: 20000,
    clusters: ["east", "lake"],
  },
  {
    id: "izumo-coast",
    name: "Izumo coast",
    prefecture: "Shimane",
    blurb: "Izumo Taisha, the cedar valley, and the cliff at Hinomisaki.",
    locationQuery: "Izumo",
    point: "POINT(132.685 35.402)",
    radiusMeters: 25000,
    clusters: ["west"],
  },
]

export function getRegion(id: string): Region | undefined {
  return REGIONS.find((region) => region.id === id)
}

export function areasForCluster(cluster: Cluster): Area[] {
  if (cluster === "west") return ["izumo", "coast", "any"]
  if (cluster === "east") return ["matsue", "miho", "any"]
  return ["lake", "any"]
}
