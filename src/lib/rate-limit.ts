const hits = new Map<string, number[]>()

export function allowRequest(
  key: string,
  limit = 10,
  windowMs = 60_000,
  now = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

export function resetRateLimit(): void {
  hits.clear()
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || "local"
}

export function enforceRateLimit(request: Request): boolean {
  if (process.env.VITEST) return true
  return allowRequest(clientKey(request))
}
