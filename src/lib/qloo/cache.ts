/**
 * Process-local cache. Qloo responses must never be written into the repo
 * or onto disk. This object lives only in memory and dies with the process.
 */
export class MemoryCache<T = unknown> {
  private entries = new Map<string, { expires: number; value: T }>()

  constructor(
    private ttlMs = 10 * 60 * 1000,
    private maxEntries = 100,
    private now: () => number = Date.now,
  ) {}

  get(key: string): T | undefined {
    const hit = this.entries.get(key)
    if (!hit) return undefined
    if (hit.expires <= this.now()) {
      this.entries.delete(key)
      return undefined
    }
    return hit.value
  }

  set(key: string, value: T): void {
    if (this.entries.size >= this.maxEntries && !this.entries.has(key)) {
      const oldest = this.entries.keys().next().value
      if (oldest) this.entries.delete(oldest)
    }
    this.entries.set(key, { expires: this.now() + this.ttlMs, value })
  }

  get size(): number {
    return this.entries.size
  }
}
