import { guidebookItinerary } from "@/lib/llm/baseline"
import type { LlmClient } from "@/lib/llm/client"
import { parseLlmItinerary } from "@/lib/llm/parse"
import { buildUngroundedPrompt } from "@/lib/llm/prompt"
import type { Itinerary, PlanResult } from "@/lib/domain"
import type { Region } from "@/lib/content/regions"

export async function buildComparison(args: {
  likes: string[]
  days: number
  region: Region
  llm: LlmClient | null
}): Promise<{ itinerary: Itinerary; llm: PlanResult["llm"] }> {
  if (!args.llm) {
    return {
      itinerary: guidebookItinerary(args.region, args.days),
      llm: { mode: "baseline" },
    }
  }

  const prompt = buildUngroundedPrompt({
    likes: args.likes,
    days: args.days,
    region: args.region,
  })

  try {
    const text = await args.llm.complete(prompt.system, prompt.user)
    const parsed = parseLlmItinerary(text)
    if (!parsed) {
      return {
        itinerary: guidebookItinerary(
          args.region,
          args.days,
          "The model reply was not usable, so this panel is the guidebook baseline.",
        ),
        llm: {
          mode: "baseline",
          provider: args.llm.provider,
          model: args.llm.model,
          note: "The model reply was not usable JSON.",
        },
      }
    }
    const dayNote =
      parsed.days.length === args.days
        ? undefined
        : ` The model returned ${parsed.days.length} day${parsed.days.length === 1 ? "" : "s"} instead of ${args.days}.`
    return {
      itinerary: {
        ...parsed,
        banner: `Written by ${args.llm.model} (${args.llm.provider}). The prompt did not include Qloo results.${dayNote ?? ""}`,
      },
      llm: {
        mode: "llm",
        provider: args.llm.provider,
        model: args.llm.model,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "The model could not be reached."
    return {
      itinerary: guidebookItinerary(
        args.region,
        args.days,
        `${message} Showing the guidebook baseline.`,
      ),
      llm: {
        mode: "baseline",
        provider: args.llm.provider,
        model: args.llm.model,
        note: message,
      },
    }
  }
}
