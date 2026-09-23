# Agent Value Measurement

An interactive companion for the article about proving whether an AI agent creates business value. The visible product is intentionally a compact measurement surface: it connects controlled exposure to outcomes, cost, latency, uncertainty, and segment behavior without repeating the article around it.

This is a self-contained Next.js and TypeScript application using deterministic synthetic event fixtures. It requires no live model, production analytics account, credentials, or network request at runtime and is designed for eventual Vercel hosting.

## Demo experience

The root route is a viewport-sized demonstration:

- Desktop is exactly `100vw` by `100dvh` with no page scroll.
- Mobile is exactly `100vw` by `200dvh`, arranged as an intentional vertical composition.
- The surface shows control versus agent, overall metrics, cohort/segment controls, net value, cost, latency, and seeded uncertainty.
- A compact aggregate/segment signal makes the complex-cohort regression visible beside the overall improvement.
- A small synthetic-data caveat remains visible without competing with the result.
- Selected cohort and metric state is shareable in the URL.

The page prioritizes the result over explanatory copy. The article owns the framing, methodology, and interpretation; the demo owns the controls and visual evidence.

## Product boundaries

The fixture demonstrates a measurement method; it does not prove that a live agent caused a business outcome. Synthetic assignment, outcomes, costs, and segment effects are explicit inputs. Any future real-data adapter would require a separately reviewed event contract, privacy boundaries, attribution rules, and a valid control design.

## Technical direction

- Next.js App Router with TypeScript and strict type checking.
- Deterministic checked-in event fixtures and economic assumptions.
- Pure TypeScript analysis functions, including seeded bootstrap uncertainty.
- Server-rendered editorial shell with a focused interactive measurement island.
- Accessible tables and charts, responsive layout, and reduced-motion support.
- No live model, analytics provider, database, or secret required for the baseline.

## Working locally

The implementation should expose the conventional scripts below once the app is scaffolded:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

The demo is complete only when it runs from a clean checkout and the production build succeeds without a live analytics account.
