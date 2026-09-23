export type Variant = "control" | "agent";
export type Cohort = "simple" | "complex";

export type Session = {
  id: string;
  variant: Variant;
  cohort: Cohort;
  query: string;
  agentVersion: string | null;
  toolCalls: number;
  latencyMs: number;
  hadError: boolean;
  hadFallback: boolean;
  hadHandoff: boolean;
  resultClick: boolean;
  cartAdd: boolean;
  completedOrder: boolean;
  attributedMargin: number;
  modelCost: number;
  toolCost: number;
  infrastructureCost: number;
  reviewCost: number;
};

export type EconomicAssumptions = {
  currency: "USD";
  attributionWindow: string;
  primaryOutcome: string;
  simpleOrderMargin: number;
  complexOrderMargin: number;
  costComponents: Record<"model" | "tool" | "infrastructure" | "review", string>;
  bootstrap: { resamples: number; seed: number; confidence: number };
};

export type CohortFilter = "all" | Cohort;
export type MetricView = "outcomes" | "economics" | "guardrails";
