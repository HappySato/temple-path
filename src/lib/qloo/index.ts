import { MemoryCache } from "@/lib/qloo/cache"
import { LiveQlooClient } from "@/lib/qloo/live"
import { MockQlooClient } from "@/lib/qloo/mock"
import type { QlooClient } from "@/lib/qloo/types"

const liveCache = new MemoryCache<unknown>()

export function createQlooClient(
  env: Record<string, string | undefined> = process.env,
): QlooClient {
  const apiKey = env.QLOO_API_KEY?.trim()
  if (!apiKey) return new MockQlooClient()
  return new LiveQlooClient({
    apiKey,
    baseUrl: env.QLOO_BASE_URL?.trim() || "https://hackathon.api.qloo.com",
    cache: liveCache,
  })
}

export { LiveQlooClient } from "@/lib/qloo/live"
export { MockQlooClient } from "@/lib/qloo/mock"
export { QlooError } from "@/lib/qloo/types"
export type {
  InsightsParams,
  QlooClient,
  QlooEntity,
  QlooTag,
} from "@/lib/qloo/types"
