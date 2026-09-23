# Agent Value Measurement Specification

## 1. Purpose

Create a reproducible measurement demo showing that an AI agent is valuable only when its incremental business outcome exceeds its full cost, while quality and benchmark scores remain necessary but insufficient gates.

The demo must answer: “Did the agent create more value than it consumed, for which users, and with what uncertainty?”

## 2. Goals

- Connect control and agent-variant exposure to one concrete ecommerce outcome.
- Show interaction cost, latency, guardrails, and net value alongside conversion.
- Show how an overall result can hide a segment-level regression.
- Make uncertainty and economic assumptions explicit.
- Keep all output reproducible and deployable without a live model or analytics account.

## 3. Non-goals

- Proving real-world causal impact with synthetic data.
- Building an experimentation platform or production event pipeline.
- Ingesting customer analytics by default.
- Treating clicks, answer quality, or benchmark scores as business value on their own.
- Combining ecommerce and support into one first-version scenario.

## 4. User experience

The root route `/` is an article-shaped measurement guide with:

- A statement of the business job and primary outcome.
- A persistent `Synthetic data` banner with a short explanation.
- Overview metrics for control and agent variant: exposure, primary outcome rate, incremental gross value, cost per interaction, net value per session, latency, handoff/error rate, and uncertainty interval where applicable.
- A cohort selector for simple versus complex requests.
- A comparison view showing overall results beside cohort results.
- A visually prominent warning when the aggregate result hides a segment regression.
- A methodology disclosure covering assignment, attribution window, cost inputs, and bootstrap settings.
- A small event or funnel table that lets a reader trace how a metric was produced.
- A closing operating loop: measure, inspect, change one system component, and measure again.

Selected cohort and view state should be serializable in the URL. Charts must have accessible text summaries and a table alternative. The article and default interpretation must remain readable without client interaction.

## 5. Scenario and fixture model

The first version uses ecommerce search as its concrete scenario. Keep the schema extensible, but do not add a second business domain before the first is coherent.

Each synthetic session should include:

- Stable session ID
- Variant assignment: control or agent
- Cohort: simple or complex request
- Query/task description
- Agent version where applicable
- Tool-call count, latency, and error/fallback/handoff state
- Engagement events such as result click or cart addition
- Primary outcome, initially completed order or explicitly equivalent fixture outcome
- Attributed value and interaction cost inputs

Keep economic assumptions in a separate typed fixture, including the value or margin assigned to the primary outcome and the cost components included in net value. The README and UI must make clear that these are illustrative assumptions.

## 6. Analysis behavior

Implement pure TypeScript functions for:

1. Exposure and outcome summaries by variant and cohort.
2. Primary outcome lift with denominators shown.
3. Incremental gross value using explicit fixture assumptions.
4. Full interaction cost, including model/tool/infrastructure or review components represented by the fixture.
5. Net value per session and related unit economics.
6. Latency, error, fallback, handoff, and other guardrail summaries.
7. Segment comparisons that identify an aggregate improvement alongside a cohort regression.
8. Seeded bootstrap intervals or another clearly documented uncertainty estimate.

Do not infer causal validity from the synthetic dataset. The methodology must state what the analysis assumes and what it cannot establish.

## 7. Determinism and edge cases

- The same fixture and seed must produce the same report.
- Empty cohorts must render an explicit no-data state rather than zero-valued success.
- Zero denominators must be represented as unavailable, not as 0% performance.
- Cost and value inputs must be traceable to named fixture fields.
- Rounding must occur only at presentation boundaries.

## 8. Technical architecture

- Next.js App Router.
- TypeScript with strict mode.
- Server-rendered article shell, fixture payload, and default report.
- Small client component for cohort/view controls and disclosures.
- Pure analysis and seeded sampling modules with unit tests.
- No required API route, database, analytics provider, live model, or secret.

## 9. Future real-data boundary

A future adapter may ingest an approved event export, but it must not be part of the baseline. Before adding it, define:

- Event ownership and privacy constraints.
- Valid control assignment and attribution window.
- Stable event/session/variant identifiers.
- Outcome and cost definitions.
- Redaction, retention, and failure behavior.
- Separate validation for data quality, analysis correctness, and live deployment.

## 10. Acceptance criteria

- A clean checkout installs, starts, tests, and builds using documented commands.
- The baseline runs without environment variables or network access.
- Overall and simple/complex cohort results are visible.
- The report shows at least one aggregate-versus-segment contrast.
- Primary outcome, cost, net value, latency, and guardrail calculations are covered by tests.
- Uncertainty output is deterministic for a fixed seed and documented clearly.
- Economic assumptions are visible and traceable.
- Every result is labeled synthetic or illustrative; no copy claims live causality.
- Charts and tables agree, work at narrow widths, and are keyboard accessible.
