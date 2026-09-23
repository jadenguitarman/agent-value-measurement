import type { EconomicAssumptions, Session, Variant, Cohort } from "./types";

export const economicAssumptions: EconomicAssumptions = {
  currency: "USD",
  attributionWindow: "30 minutes after the search task",
  primaryOutcome: "completed order attributed to the session",
  simpleOrderMargin: 42,
  complexOrderMargin: 120,
  costComponents: {
    model: "agent model tokens and generation",
    tool: "search and catalog tool calls",
    infrastructure: "request and orchestration overhead",
    review: "human review or fallback handling",
  },
  bootstrap: { resamples: 1000, seed: 1947, confidence: 0.95 },
};

const simpleQueries = ["black running shoes", "linen shirt", "blue desk lamp", "wireless mouse"];
const complexQueries = [
  "waterproof trail shoes under $150 for wide feet",
  "quiet desk setup for a shared home office",
  "carry-on luggage for a two-week winter trip",
  "non-toxic cookware that works on induction",
];

function buildSession(
  variant: Variant,
  cohort: Cohort,
  index: number,
  completedOrder: boolean,
): Session {
  const isAgent = variant === "agent";
  const isComplex = cohort === "complex";
  const toolCalls = isAgent ? (isComplex ? 4 + (index % 3) : 2 + (index % 2)) : 0;
  const latencyMs = isAgent
    ? (isComplex ? 1620 + (index % 5) * 110 : 920 + (index % 5) * 80)
    : 410 + (index % 4) * 45;
  const hadError = isAgent && ((isComplex && index % 11 === 0) || (!isComplex && index % 17 === 0));
  const hadFallback = isAgent && ((isComplex && index % 7 === 0) || (!isComplex && index % 19 === 0));
  const hadHandoff = isAgent && isComplex && index % 13 === 0;
  const resultClick = completedOrder || index % (isComplex ? 3 : 4) !== 0;
  const cartAdd = completedOrder || index % (isComplex ? 4 : 5) === 0;
  const modelCost = isAgent ? (isComplex ? 0.7 + (index % 4) * 0.06 : 0.18 + (index % 3) * 0.025) : 0;
  const toolCost = isAgent ? toolCalls * 0.045 : 0;
  const infrastructureCost = isAgent ? (isComplex ? 0.18 : 0.09) : 0.01;
  const reviewCost = isAgent && (hadFallback || hadHandoff) ? (isComplex ? 0.36 : 0.12) : 0;

  return {
    id: `${variant}-${cohort}-${String(index + 1).padStart(2, "0")}`,
    variant,
    cohort,
    query: (isComplex ? complexQueries : simpleQueries)[index % (isComplex ? complexQueries : simpleQueries).length],
    agentVersion: isAgent ? "search-agent-v0.3-fixture" : null,
    toolCalls,
    latencyMs,
    hadError,
    hadFallback,
    hadHandoff,
    resultClick,
    cartAdd,
    completedOrder,
    attributedMargin: completedOrder ? (isComplex ? economicAssumptions.complexOrderMargin : economicAssumptions.simpleOrderMargin) : 0,
    modelCost,
    toolCost,
    infrastructureCost,
    reviewCost,
  };
}

function buildVariantSessions(variant: Variant, cohort: Cohort, count: number, orderIndexes: number[]): Session[] {
  const orderSet = new Set(orderIndexes);
  return Array.from({ length: count }, (_, index) => buildSession(variant, cohort, index, orderSet.has(index)));
}

// Fixed counts make the aggregate improvement and complex-cohort regression inspectable.
export const sessions: Session[] = [
  ...buildVariantSessions("control", "simple", 30, [1, 5, 10, 14, 20, 26]),
  ...buildVariantSessions("agent", "simple", 30, [1, 4, 8, 12, 16, 21, 24, 27, 29]),
  ...buildVariantSessions("control", "complex", 20, [0, 3, 5, 8, 11, 14, 17, 19]),
  ...buildVariantSessions("agent", "complex", 20, [1, 4, 7, 12, 16, 18, 19]),
];
