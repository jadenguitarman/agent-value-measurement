# Agent Value Measurement

An editorial companion for the article about proving whether an AI agent creates business value. It shows why a good answer or benchmark score is only a quality signal, then connects controlled exposure to outcomes, cost, uncertainty, and segment behavior.

This is a self-contained Next.js and TypeScript application using deterministic synthetic event fixtures. It requires no live model, production analytics account, credentials, or network request at runtime and is designed for eventual Vercel hosting.

## Reader experience

The page should feel like a clear measurement story embedded in a blog post:

1. The article frames one concrete ecommerce search scenario and names the primary outcome.
2. A prominent banner says the data is synthetic and the results are illustrative.
3. The reader sees control and agent-variant exposure counts, outcome rates, cost, latency, and net value.
4. A cohort control switches between simple and complex requests.
5. A segment comparison reveals how a favorable overall result can hide a regression for a valuable or complex cohort.
6. A methodology panel explains assignment, attribution window, cost assumptions, and bootstrap uncertainty.
7. The closing section turns the demo into a recurring loop: measure, inspect, change one thing, and measure again.

The page should prioritize interpretation over dashboard density. Charts must have adjacent summaries or tables so the point is understandable without hovering. Selected cohort and metric state should be shareable in the URL.

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
