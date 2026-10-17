export interface LlmClient {
  readonly mode: "llm"
  readonly provider: string
  readonly model: string
  complete(system: string, user: string): Promise<string>
}

type ChatOptions = {
  apiKey: string
  model: string
  baseUrl: string
  fetchImpl?: typeof fetch
}

export class OpenAiCompatibleClient implements LlmClient {
  readonly mode = "llm" as const
  readonly provider = "openai-compatible"
  readonly model: string
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  constructor(options: ChatOptions) {
    this.model = options.model
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl.replace(/\/$/, "")
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async complete(system: string, user: string): Promise<string> {
    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    })
    if (!response.ok) {
      throw new Error(`LLM request failed (${response.status}).`)
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = payload.choices?.[0]?.message?.content
    if (!text) throw new Error("LLM returned an empty reply.")
    return text
  }
}

export class GeminiClient implements LlmClient {
  readonly mode = "llm" as const
  readonly provider = "gemini"
  readonly model: string
  private readonly apiKey: string
  private readonly fetchImpl: typeof fetch

  constructor(options: { apiKey: string; model: string; fetchImpl?: typeof fetch }) {
    this.apiKey = options.apiKey
    this.model = options.model
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async complete(system: string, user: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`
    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: { temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(25_000),
    })
    if (!response.ok) {
      throw new Error(`LLM request failed (${response.status}).`)
    }
    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("")
    if (!text) throw new Error("LLM returned an empty reply.")
    return text
  }
}

export function createLlmClient(
  env: Record<string, string | undefined> = process.env,
): LlmClient | null {
  const apiKey = env.LLM_API_KEY?.trim()
  if (!apiKey) return null
  const provider = env.LLM_PROVIDER?.trim().toLowerCase() || "openai"
  if (provider === "gemini") {
    return new GeminiClient({
      apiKey,
      model: env.LLM_MODEL?.trim() || "gemini-2.5-flash",
    })
  }
  return new OpenAiCompatibleClient({
    apiKey,
    model: env.LLM_MODEL?.trim() || "llama-3.3-70b-versatile",
    baseUrl: env.LLM_BASE_URL?.trim() || "https://api.groq.com/openai/v1",
  })
}
