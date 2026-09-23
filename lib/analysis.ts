import type { CohortFilter, Cohort, EconomicAssumptions, MetricView, Session, Variant } from "./types";

export type Rate = { value: number | null; numerator: number; denominator: number };
export type VariantSummary = {
  variant: Variant;
  exposure: number;
  outcomeRate: Rate;
  grossMargin: number;
  totalCost: number;
  netValue: number;
  netValuePerSession: number | null;
  avgLatencyMs: number | null;
  errorRate: Rate;
  fallbackRate: Rate;
  handoffRate: Rate;
};

export type BootstrapInterval = { low: number | null; high: number | null; estimate: number | null };

export function filterSessions(sessions: Session[], cohort: CohortFilter): Session[] {
  return cohort === "all" ? sessions : sessions.filter((session) => session.cohort === cohort);
}

function rate(numerator: number, denominator: number): Rate {
  return { value: denominator === 0 ? null : numerator / denominator, numerator, denominator };
}

function totalCost(session: Session): number {
  return session.modelCost + session.toolCost + session.infrastructureCost + session.reviewCost;
}

export function summarizeVariant(sessions: Session[], variant: Variant): VariantSummary {
  const selected = sessions.filter((session) => session.variant === variant);
  const outcomeCount = selected.filter((session) => session.completedOrder).length;
  const errorCount = selected.filter((session) => session.hadError).length;
  const fallbackCount = selected.filter((session) => session.hadFallback).length;
  const handoffCount = selected.filter((session) => session.hadHandoff).length;
  const grossMargin = selected.reduce((sum, session) => sum + session.attributedMargin, 0);
  const cost = selected.reduce((sum, session) => sum + totalCost(session), 0);
  const latencyTotal = selected.reduce((sum, session) => sum + session.latencyMs, 0);

  return {
    variant,
    exposure: selected.length,
    outcomeRate: rate(outcomeCount, selected.length),
    grossMargin,
    totalCost: cost,
    netValue: grossMargin - cost,
    netValuePerSession: selected.length === 0 ? null : (grossMargin - cost) / selected.length,
    avgLatencyMs: selected.length === 0 ? null : latencyTotal / selected.length,
    errorRate: rate(errorCount, selected.length),
    fallbackRate: rate(fallbackCount, selected.length),
    handoffRate: rate(handoffCount, selected.length),
  };
}

export function summarize(sessions: Session[], cohort: CohortFilter): { control: VariantSummary; agent: VariantSummary } {
  const filtered = filterSessions(sessions, cohort);
  return { control: summarizeVariant(filtered, "control"), agent: summarizeVariant(filtered, "agent") };
}

export function lift(control: Rate, agent: Rate): number | null {
  if (control.value === null || agent.value === null) return null;
  return agent.value - control.value;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function bootstrapOutcomeLift(
  sessions: Session[],
  cohort: CohortFilter,
  assumptions: EconomicAssumptions,
): BootstrapInterval {
  const filtered = filterSessions(sessions, cohort);
  const control = filtered.filter((session) => session.variant === "control");
  const agent = filtered.filter((session) => session.variant === "agent");
  if (control.length === 0 || agent.length === 0) return { low: null, high: null, estimate: null };
  const estimate = lift(
    rate(control.filter((session) => session.completedOrder).length, control.length),
    rate(agent.filter((session) => session.completedOrder).length, agent.length),
  );
  const random = seededRandom(assumptions.bootstrap.seed + filtered.length);
  const samples: number[] = [];

  for (let iteration = 0; iteration < assumptions.bootstrap.resamples; iteration += 1) {
    let controlOrders = 0;
    let agentOrders = 0;
    for (let index = 0; index < control.length; index += 1) {
      controlOrders += control[Math.floor(random() * control.length)].completedOrder ? 1 : 0;
    }
    for (let index = 0; index < agent.length; index += 1) {
      agentOrders += agent[Math.floor(random() * agent.length)].completedOrder ? 1 : 0;
    }
    samples.push(agentOrders / agent.length - controlOrders / control.length);
  }

  samples.sort((a, b) => a - b);
  const alpha = (1 - assumptions.bootstrap.confidence) / 2;
  return {
    estimate,
    low: samples[Math.floor(alpha * samples.length)],
    high: samples[Math.ceil((1 - alpha) * samples.length) - 1],
  };
}

export function maxOutcomeRate(summary: { control: VariantSummary; agent: VariantSummary }): number {
  return Math.max(summary.control.outcomeRate.value ?? 0, summary.agent.outcomeRate.value ?? 0, 0.01);
}

export function getMetricLabel(view: MetricView): string {
  if (view === "economics") return "Net value per session";
  if (view === "guardrails") return "Average latency";
  return "Completed order rate";
}

export function getMetricValue(summary: VariantSummary, view: MetricView): number | null {
  if (view === "economics") return summary.netValuePerSession;
  if (view === "guardrails") return summary.avgLatencyMs;
  return summary.outcomeRate.value;
}

export function oppositeCohort(cohort: Cohort): Cohort {
  return cohort === "simple" ? "complex" : "simple";
}
