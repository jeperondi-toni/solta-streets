# Solta × STIPO — street transformation tool

Upload a photo of a street, choose what you'd love to see, get a before/after
image to share and to ask your community about (via Chorus).

Sibling of Transform Your School Street. Separate repo on purpose: building here
can never break TYSS.

## How it works

1. **Home** — photo + street name. The photo is resized in the browser (1600 px JPEG).
2. **Hidden reading** — `api/read.ts` asks `gemini-3.5-flash-lite` what the prompts
   need: street type, parked cars (none / along the kerb / angled), trees (both /
   left / right / none), tram or bus lane, one-line description. The user sees it
   on the choices page and can change it.
3. **Choices** — "How much room for cars?" (Same traffic / Slow street / Car-free)
   + the options with calibrated render rules + one free-text field.
4. **Render** — `api/render.ts` runs one step at a time; the browser chains them.
   Step 1 renders the room-for-cars answer on the photo; then the other choices in
   groups of up to 3, each on the previous result, with the original photo as
   reference. Prompts are built on the server (`lib/plan.ts`, `lib/prompts.ts`).
5. **Result** — before/after slider, share / download (side-by-side image),
   "Ask my community" → Chorus, what changed, accessibility reminder.

Render rules and where they come from: `claude/MOBILITY_RENDER_RULES.md` in the
Hidalgo project. `lib/prompts.ts` is ported from the calibrated test page (solta
repo, branch `mobility-test-round1`); change rules there first, test, then port.

## Setup

Vercel project, framework **Vite**. Environment variables (tick Production **and** Preview):

| Name | What |
| --- | --- |
| `GEMINI_API_KEY` | Google AI key (same as TYSS is fine) |
| `GOOGLE_MAPS_API_KEY` | Street View Static API + Geocoding API (same key as TYSS) — for the address option |
| `CHORUS_URL` | e.g. `https://chorus.solta.city` — without it "Ask my community" shows the error |

Local: `npm install`, then `vercel dev` (needs the Vercel CLI for the `api/` routes).

## Still to do

- **Chorus side:** a `/?claim=<pending_id>` page in Chorus (email field →
  `sendMagicLink(email, origin + "/?finish=" + id)`). `api/stage-image` and
  `?finish=` already exist on the Chorus branch `magic-link-auth`.
- Hero video: put `public/hero.mp4` (+ `public/hero-poster.jpg`). Hidden until it exists.
- Gallery / "Streets so far", support counter, outcome after the image (parked).
- More options as their render rules pass the tests.
