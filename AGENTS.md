# AGENTS.md

## Mission

Build and maintain a fully working, blog-ready measurement demo in Next.js and TypeScript. The application must show how to connect agent exposure to business value without overstating what synthetic data or offline quality scores prove.

## Non-negotiable behavior

- Keep the baseline local, deterministic, and runnable without a live model, analytics account, credentials, or network access.
- Label every fixture-derived result as synthetic or illustrative.
- Never describe synthetic results as evidence of live causal impact.
- Keep one concrete ecommerce search scenario in the first version; do not mix unrelated support and commerce outcomes into one ambiguous dashboard.
- Make the primary outcome, attribution window, cost inputs, assignment model, and segment definitions inspectable.
- Preserve the segment-level regression example; it is central to the article’s thesis.
- Distinguish quality gates, business outcomes, guardrails, and costs in code and copy.
- Do not add a real analytics adapter, customer data, or production instrumentation without a revised SPEC and explicit privacy/authorization review.

## Technical rules

- Use TypeScript throughout and do not add JavaScript application logic.
- Use the Next.js App Router and server components by default; keep interactive filters and disclosures in small client components.
- Keep analysis functions pure and unit-testable.
- Use a seeded pseudo-random process for bootstrap sampling so test and article outputs are reproducible.
- Keep economic assumptions in checked-in, named fixture data. Never hide margin or cost constants inside presentation components.
- Keep the app compatible with a standard Vercel build: no persistent process, local writes, database, provider SDK, or secret required for the baseline.

## UX and accessibility

- Preserve the editorial sequence: business question, measurement setup, overall result, segment caveat, methodology, operating loop.
- Put the synthetic-data warning near the first result and repeat it where readers could mistake the output for live evidence.
- Use tables alongside charts and provide text summaries for every important comparison.
- Make cohort, metric, and view controls keyboard accessible with visible labels.
- Do not rely on color alone to communicate improvement or regression.
- Support narrow screens, reduced motion, loading, empty, error, and reset states.

## Working method

1. Read `SPEC.md` and inspect the checkout before changing it.
2. Preserve unrelated work and existing configuration.
3. Define the event schema and economic assumptions before building visualizations.
4. Implement a vertical slice: control/variant data, primary outcome, cost, net value, and one segment comparison.
5. Test aggregate and segment calculations, seeded uncertainty, and edge cases before visual polish.
6. Report local implementation, build results, Vercel state, and live behavior as separate evidence categories.

## Required validation

Run the repository’s available equivalents of:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Manually verify the synthetic warning, overall and segment views, no-data behavior, keyboard operation, chart/table agreement, and narrow-screen layout. Do not claim causal validity, deployment, or live analytics behavior without direct verification.

## Scope discipline

Do not build a production experimentation platform, customer-data ingestion system, or live agent evaluation service in this repository. Update `SPEC.md` before adding those capabilities.
