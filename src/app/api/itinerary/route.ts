import { PlanError, planTrip, validatePlanInput } from "@/lib/agent/plan"
import { createLlmClient } from "@/lib/llm/client"
import { createQlooClient, QlooError } from "@/lib/qloo"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  if (!enforceRateLimit(request)) {
    return Response.json(
      { error: "Too many itineraries in a short time. Wait a minute and try again." },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Send JSON with the things you love." }, { status: 400 })
  }

  const parsed = validatePlanInput(body)
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const plan = await planTrip(parsed.value, {
      qloo: createQlooClient(),
      llm: createLlmClient(),
    })
    return Response.json(plan)
  } catch (error) {
    if (error instanceof PlanError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof QlooError) {
      return Response.json({ error: error.message }, { status: 502 })
    }
    console.error("itinerary failed")
    return Response.json({ error: "The path could not be composed." }, { status: 500 })
  }
}
