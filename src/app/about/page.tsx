import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About",
  description:
    "How Temple Path uses Qloo search, tags, and insights to build an Izumo and Matsue itinerary, and how the ungrounded comparison works without a paid model.",
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs tracking-[0.18em] text-primary uppercase">About</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">How the path is made</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed">
        <p>
          Temple Path is a small travel guide for Izumo and Matsue in Shimane. You name a few things you already love. The server resolves them, asks Qloo for nearby places and destinations, and lays a day-by-day walk beside the answer a guidebook — or a model with no taste graph — would have given.
        </p>
        <p>
          There is no account. The API key, if you have one, stays on the server.
        </p>
      </div>

      <h2 className="mt-10 font-serif text-2xl">The four calls</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed">
        <li>
          <span className="font-medium">search_entities.</span> Each name goes to <code>GET /search</code> so a film, artist, book, or brand can become an entity id.
        </li>
        <li>
          <span className="font-medium">get_tags.</span> <code>GET /v2/tags</code> picks up words the search missed, such as matcha or seafood.
        </li>
        <li>
          <span className="font-medium">get_insights.</span> <code>GET /v2/insights</code> is called for taste tags (<code>urn:tag</code>), dining places (<code>urn:entity:place</code> near the region), and destinations (<code>urn:entity:destination</code>). Legacy <code>/recommendations</code> and <code>/recs</code> are not used.
        </li>
        <li>
          <span className="font-medium">build_itinerary.</span> A fixed list of Izumo and Matsue shrines and temples is ordered by those signals and interleaved with the meals Qloo returned. Each stop that matched says why, in the form “Because you like …”.
        </li>
      </ol>
      <p className="mt-4 leading-relaxed">
        Shrines and temples are a local list — Gakuenji, Izumo Taisha, Ichibata Yakushi, and the others — because a rural pilgrimage route should not depend on a place graph that may be thin outside large cities. Meals prefer Qloo. If the live API returns none inside Shimane, the meal slots fall back to that same local list and are labeled so they are not mistaken for Qloo results.
      </p>

      <h2 className="mt-10 font-serif text-2xl">Demo catalog and live Qloo</h2>
      <p className="mt-4 leading-relaxed">
        Without <code>QLOO_API_KEY</code> the app uses an in-process catalog written for this project. Its ids start with <code>MOCK-</code>. It is not a recording of Qloo, and it is not saved as a fixture from a real call. Set the key and the same interface calls <code>https://hackathon.api.qloo.com</code> with the header <code>X-Api-Key</code>. Successful responses sit in memory for about ten minutes and are never written to disk or committed.
      </p>

      <h2 className="mt-10 font-serif text-2xl">The other column</h2>
      <p className="mt-4 leading-relaxed">
        The ungrounded column is a guidebook baseline: Izumo Taisha, soba, Hinomisaki, Matsue Castle, and the lake. It does not read your tastes. If you set <code>LLM_API_KEY</code>, that column is written by a model instead. The prompt contains only your words, the region, and the number of days — not Qloo ids, tags, or places. Nothing is called when the key is absent, so the app does not spend money on a model by default.
      </p>
      <p className="mt-4 leading-relaxed">
        A free local option is Ollama: point <code>LLM_BASE_URL</code> at <code>http://127.0.0.1:11434/v1</code>. Groq and Gemini Flash have free tiers that can cost money once you pass the quota. OpenAI and most other hosted models cost money from the first call. Details are in the README.
      </p>

      <h2 className="mt-10 font-serif text-2xl">Monk&apos;s notes</h2>
      <p className="mt-4 leading-relaxed">
        Notes on bowing, shoes, and the noodle shops are written for this guide in the voice of someone who treats the halls as working places. They are etiquette, not a claim of office at any of the temples named.
      </p>

      <h2 id="license" className="mt-10 font-serif text-2xl">
        License
      </h2>
      <p className="mt-4 leading-relaxed">
        Temple Path is released under the MIT license. Qloo&apos;s own terms still govern their API and forbid storing their response data in a public repository. This project does not.
      </p>
      <p className="mt-6">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Compose a path
        </Link>
      </p>
    </main>
  )
}
