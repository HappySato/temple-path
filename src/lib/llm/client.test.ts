import { describe, expect, it } from "vitest"
import { createLlmClient, GeminiClient, OpenAiCompatibleClient } from "@/lib/llm/client"
import { buildUngroundedPrompt } from "@/lib/llm/prompt"
import { REGIONS } from "@/lib/content/regions"
import { allowRequest, resetRateLimit } from "@/lib/rate-limit"

describe("LLM client", () => {
  it("stays off without a key", () => {
    expect(createLlmClient({})).toBeNull()
    expect(createLlmClient({ LLM_API_KEY: "  " })).toBeNull()
  })

  it("posts to an OpenAI-compatible chat endpoint and a Gemini generate endpoint", async () => {
    const openaiCalls: { url: string; init?: RequestInit }[] = []
    const openai = new OpenAiCompatibleClient({
      apiKey: "secret-key",
      model: "test-model",
      baseUrl: "https://example.test/v1",
      fetchImpl: async (input, init) => {
        openaiCalls.push({ url: String(input), init })
        return new Response(
          JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
          { status: 200 },
        )
      },
    })
    await expect(openai.complete("system", "user")).resolves.toBe("ok")
    expect(openaiCalls[0]?.url).toBe("https://example.test/v1/chat/completions")
    expect(openaiCalls[0]?.init?.method).toBe("POST")
    const openaiHeaders = new Headers(openaiCalls[0]?.init?.headers)
    expect(openaiHeaders.get("Authorization")).toBe("Bearer secret-key")
    expect(String(openaiCalls[0]?.init?.body)).toContain("test-model")

    const geminiCalls: { url: string; init?: RequestInit }[] = []
    const gemini = new GeminiClient({
      apiKey: "gemini-key",
      model: "gemini-2.5-flash",
      fetchImpl: async (input, init) => {
        geminiCalls.push({ url: String(input), init })
        return new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: "ok" }] } }],
          }),
          { status: 200 },
        )
      },
    })
    await expect(gemini.complete("system", "user")).resolves.toBe("ok")
    expect(geminiCalls[0]?.url).toContain(":generateContent")
    expect(new Headers(geminiCalls[0]?.init?.headers).get("x-goog-api-key")).toBe("gemini-key")

    const configured = createLlmClient({
      LLM_API_KEY: "gemini-key",
      LLM_PROVIDER: "gemini",
    })
    expect(configured?.provider).toBe("gemini")
    expect(configured?.model).toBe("gemini-2.5-flash")
  })

  it("keeps the ungrounded prompt free of taste-graph ids", () => {
    const prompt = buildUngroundedPrompt({
      likes: ["Ryuichi Sakamoto", "matcha"],
      days: 2,
      region: REGIONS[0],
    })
    const blob = `${prompt.system}\n${prompt.user}`
    expect(blob).not.toMatch(/Qloo|MOCK-|urn:entity|entity_id/)
    expect(prompt.user).toContain("Ryuichi Sakamoto")
  })
})

describe("rate limit", () => {
  it("blocks the third call inside the window", () => {
    resetRateLimit()
    expect(allowRequest("visitor", 2, 1000, 0)).toBe(true)
    expect(allowRequest("visitor", 2, 1000, 10)).toBe(true)
    expect(allowRequest("visitor", 2, 1000, 20)).toBe(false)
    expect(allowRequest("visitor", 2, 1000, 2000)).toBe(true)
  })
})
