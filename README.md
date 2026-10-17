# Temple Path

A taste-grounded travel guide for the shrines, temples, and meals of Izumo and Matsue in Shimane, Japan.

You name a few things you already love — an artist, a film, a book, a food, a brand. Temple Path resolves them with Qloo, then builds a day-by-day walk. Each grounded stop carries a reason in the form “Because you like …”. Beside it, an ungrounded column shows what a guidebook (or a model with no taste graph) would have said instead.

There is no login. The app runs without a Qloo key, on a hand-written demo catalog. A real key switches the same interface to the live API.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317). The dev server allows that host. Without it, Next.js blocks its dev resources and the form never becomes interactive.

```bash
npm test
npm run lint
npm run build
```

## How a plan is made

The server route `POST /api/itinerary` runs a fixed tool loop. It is not a free-form agent with a hidden prompt.

1. **search_entities** — `GET /search` for each name you typed (artist, movie, TV show, book, brand, podcast).
2. **get_tags** — `GET /v2/tags` for the whole phrase, so words like “matcha” or “seafood” can still become signals.
3. **get_insights** — `GET /v2/insights` three ways:
   - `filter.type=urn:tag` for a taste read on the resolved entities
   - `filter.type=urn:entity:place` with `filter.location.query`, a WKT `POINT`, and a radius, for meals near the region
   - `filter.type=urn:entity:destination` for nearby destinations
4. **build_itinerary** — orders a curated Izumo / Matsue shrine and temple list by those signals, then interleaves meals and a walk.

Signals are sent as `signal.interests.entities` and `signal.interests.tags`. The client is GET-only and sends `X-Api-Key`. It does not call legacy `/recommendations` or `/recs`.

If the live place call returns nothing, it retries once with `filter.location.query=Shimane`. If that is also empty, meals come from the local list and are badged **Local list**, not **Qloo**.

Shrines and temples are always the local list (Izumo Taisha, Gakuenji, Ichibata Yakushi, Kamosu, Hinomisaki, Miho, and others). A rural pilgrimage route should not pretend a place graph is dense outside large cities. Their order still follows your taste signals, and they are badged **Temple list**.

## Demo catalog and live Qloo

| `QLOO_API_KEY` | Behavior |
| --- | --- |
| unset | `MockQlooClient`. Hand-written entities, tags, places, and destinations. Ids start with `MOCK-`. |
| set | `LiveQlooClient` against `QLOO_BASE_URL` (default `https://hackathon.api.qloo.com`). |

Qloo’s terms forbid storing Qloo response data in a public repository. This repo has no recorded responses, no fixtures captured from real calls, and no on-disk cache. The live client keeps a process-local memory cache (about 10 minutes, 100 entries) and drops it when the process exits. Do not add a fixture dumped from the API.

The demo catalog is original writing for this app. It is not a copy of a Qloo payload.

## The comparison column

| `LLM_API_KEY` | Ungrounded column |
| --- | --- |
| unset | A local guidebook baseline. Izumo Taisha, soba, Hinomisaki, Matsue Castle, the lake. It does not change when your tastes change. |
| set | A model writes the column. The prompt contains your words, the region, and the number of days. It does not contain Qloo ids, tags, scores, or places. If the reply is unusable, the guidebook baseline is shown and labeled. |

No model is called unless `LLM_API_KEY` is set. The default install costs nothing.

### Models you can plug in

The client speaks two protocols.

- **OpenAI-compatible** (`LLM_PROVIDER` omitted or `openai`). `POST {LLM_BASE_URL}/chat/completions` with `Authorization: Bearer`. If you set a key and leave the base URL at the example value, requests go to Groq (`https://api.groq.com/openai/v1`). Groq has a free tier; past the quota it costs money. Confirm the current free model name — `llama-3.3-70b-versatile` is the example, not a promise.
- **Ollama, on your machine, free.** `LLM_BASE_URL=http://127.0.0.1:11434/v1`, `LLM_MODEL=llama3.2`, `LLM_API_KEY=ollama` (Ollama ignores the key; the app needs a non-empty value to leave the baseline).
- **Gemini** (`LLM_PROVIDER=gemini`). Google AI Studio’s Gemini Flash tier is free up to a quota and costs money after that. Default model `gemini-2.5-flash`.
- **OpenAI and most other hosted APIs cost money from the first request.** Set `LLM_BASE_URL=https://api.openai.com/v1` only if you mean to pay the provider. This repository does not ship a paid key and does not call one by default.

## Environment

See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `QLOO_API_KEY` | no | Live Qloo. Absent → demo catalog. |
| `QLOO_BASE_URL` | no | Default `https://hackathon.api.qloo.com`. |
| `LLM_API_KEY` | no | Turns on the model column. |
| `LLM_PROVIDER` | no | `openai` (any OpenAI-compatible host) or `gemini`. |
| `LLM_BASE_URL` | no | OpenAI-compatible host. Ignored for Gemini. |
| `LLM_MODEL` | no | Model name for the host you chose. |

Put real values in `.env.local`. That file is gitignored. `.env.example` is the only env file that belongs in git.

The browser never sees the keys. Only `POST /api/itinerary` talks to Qloo or a model. The route allows about 10 plans a minute per IP.

## Architecture

```
src/app/page.tsx                 the planner
src/app/about/page.tsx           how it works, MIT license
src/app/api/itinerary/route.ts   the only network boundary
src/lib/qloo/                    QlooClient, live GET client, demo catalog, memory cache
src/lib/agent/                   parse likes, score, compose, tool loop
src/lib/llm/                     guidebook baseline, prompt, OpenAI-compatible + Gemini
src/lib/content/                 regions, temples, meals, etiquette (our writing)
```

Stack: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.

## Deploy

The app is a Next.js server app and fits Vercel Hobby.

1. Import the repository.
2. Framework preset: Next.js. Build `npm run build`, no extra install command.
3. Set `QLOO_API_KEY` as an environment variable if you want live Qloo. Leave `LLM_API_KEY` empty unless you intend to use a model.
4. Deploy. Hobby is enough: there is no database, no cron, and no background worker.

The memory cache is per server instance. On a serverless host it does not survive a cold start, which is what we want — Qloo payloads are not persisted.

Any host that runs `next start` works the same way. Do not add a disk cache or a checked-in fixture to “speed up” the demo.

## What costs money

- **This app, locally or on Vercel Hobby:** nothing, if you leave `LLM_API_KEY` empty. The demo catalog needs no key.
- **Qloo hackathon API:** use the key the event gives you. This app does not bill Qloo and does not call it without `QLOO_API_KEY`.
- **LLM:** nothing until you set `LLM_API_KEY`. Ollama is free and local. Groq and Gemini Flash are free inside a quota and can cost money after it. OpenAI and other commercial APIs cost money. You pay the provider, not this repo.
- **No other paid service** is wired in. There is no database, no auth provider, and no analytics vendor.

## License

[MIT](LICENSE). Qloo’s terms still apply to their API and to any response you receive at runtime. Do not commit those responses.
