"use client";

import { useMemo, useSyncExternalStore } from "react";
import { bootstrapOutcomeLift, getMetricLabel, getMetricValue, maxOutcomeRate, summarize } from "../lib/analysis";
import { dollars, number, percent, signedDollars, signedPercent } from "../lib/format";
import type { CohortFilter, EconomicAssumptions, MetricView, Session, Variant } from "../lib/types";

const cohortOptions: Array<{ value: CohortFilter; label: string }> = [
  { value: "all", label: "All requests" },
  { value: "simple", label: "Simple" },
  { value: "complex", label: "Complex" },
];

const metricOptions: Array<{ value: MetricView; label: string }> = [
  { value: "outcomes", label: "Outcome rate" },
  { value: "economics", label: "Net value" },
  { value: "guardrails", label: "Latency" },
];

export function MeasurementExplorer({ sessions, assumptions }: { sessions: Session[]; assumptions: EconomicAssumptions }) {
  const selection = useUrlSelection();
  const cohort = selection.cohort;
  const view = selection.view;

  function updateState(nextCohort: CohortFilter, nextView: MetricView) {
    const params = new URLSearchParams(window.location.search);
    params.set("cohort", nextCohort);
    params.set("view", nextView);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}#explore`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const result = useMemo(() => summarize(sessions, cohort), [sessions, cohort]);
  const interval = useMemo(() => bootstrapOutcomeLift(sessions, cohort, assumptions), [sessions, cohort, assumptions]);
  const maxRate = maxOutcomeRate(result);
  const currentLabel = getMetricLabel(view);
  const currentControl = getMetricValue(result.control, view);
  const currentAgent = getMetricValue(result.agent, view);
  const outcomeLift = result.control.outcomeRate.value === null || result.agent.outcomeRate.value === null ? null : result.agent.outcomeRate.value - result.control.outcomeRate.value;
  const netLift = result.control.netValuePerSession === null || result.agent.netValuePerSession === null ? null : result.agent.netValuePerSession - result.control.netValuePerSession;
  const noData = result.control.exposure === 0 || result.agent.exposure === 0;

  return (
    <div className="explorer" aria-live="polite">
      <div className="explorer-head">
        <div><p className="explorer-label">Interactive fixture report</p><h3>What happened after exposure?</h3></div>
        <p className="explorer-seed">seed {assumptions.bootstrap.seed} · {assumptions.bootstrap.resamples.toLocaleString()} resamples</p>
      </div>
      <div className="control-row" aria-label="Measurement filters">
        <span className="control-label">Cohort</span>
        {cohortOptions.map((option) => <button className="choice" key={option.value} type="button" aria-pressed={cohort === option.value} onClick={() => updateState(option.value, view)}>{option.label}</button>)}
        <label className="control-label" htmlFor="metric-view">Metric</label>
        <select className="control-select" id="metric-view" value={view} onChange={(event) => updateState(cohort, event.target.value as MetricView)}>
          {metricOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {noData ? <div className="no-data">No fixture sessions are available for this comparison. Reset the cohort filter to continue.</div> : <>
        <div className="result-grid">
          <ResultCard label="Exposure" control={number(result.control.exposure)} agent={number(result.agent.exposure)} />
          <ResultCard label="Completed order rate" control={percent(result.control.outcomeRate.value)} agent={percent(result.agent.outcomeRate.value)} meta={signedPercent(outcomeLift)} />
          <ResultCard label="Net value / session" control={dollars(result.control.netValuePerSession)} agent={dollars(result.agent.netValuePerSession)} meta={signedDollars(netLift)} negative={netLift !== null && netLift < 0} />
          <ResultCard label="Average latency" control={result.control.avgLatencyMs === null ? "—" : `${Math.round(result.control.avgLatencyMs)} ms`} agent={result.agent.avgLatencyMs === null ? "—" : `${Math.round(result.agent.avgLatencyMs)} ms`} meta={`handoff ${percent(result.agent.handoffRate.value)}`} />
        </div>
        <div className="contrast warning"><strong>Read this carefully.</strong> The overall outcome rate rises {signedPercent(outcomeLift)}, while net value per session changes {signedDollars(netLift)}. The agent’s additional interaction cost is part of the result.</div>

        <div className="view-grid" style={{ marginTop: 28 }}>
          <MetricChart label={currentLabel} view={view} control={currentControl} agent={currentAgent} maxRate={view === "outcomes" ? maxRate : undefined} />
          <div className="chart-summary"><h3>Uncertainty, not certainty</h3><p>The descriptive 95% bootstrap interval for outcome lift is <strong>{signedPercent(interval.low)} to {signedPercent(interval.high)}</strong> around an observed {signedPercent(interval.estimate)}. A fixture cannot establish live causality.</p></div>
        </div>

        <div className="data-table-wrap" style={{ marginTop: 30 }}>
          <table className="data-table"><caption className="sr-only">Detailed report for selected cohort</caption><thead><tr><th scope="col">Variant</th><th scope="col">Exposure</th><th scope="col">Orders</th><th scope="col">Gross margin</th><th scope="col">Full cost</th><th scope="col">Net value</th><th scope="col">Error / fallback</th></tr></thead>
            <tbody><DetailRow variant="control" summary={result.control} /><DetailRow variant="agent" summary={result.agent} /></tbody>
          </table>
        </div>
        <p className="caption" style={{ color: "#b7b8b0" }}>All values are synthetic and illustrative. Costs include the named fixture components, not a live provider bill.</p>
      </>}
    </div>
  );
}

function useUrlSelection(): { cohort: CohortFilter; view: MetricView } {
  const encoded = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    readUrlSelection,
    () => "all|outcomes",
  );
  const [cohort, view] = encoded.split("|");
  return {
    cohort: cohort === "simple" || cohort === "complex" ? cohort : "all",
    view: view === "economics" || view === "guardrails" ? view : "outcomes",
  };
}

function readUrlSelection(): string {
  const params = new URLSearchParams(window.location.search);
  const cohort = params.get("cohort");
  const view = params.get("view");
  return `${cohort === "simple" || cohort === "complex" ? cohort : "all"}|${view === "economics" || view === "guardrails" ? view : "outcomes"}`;
}

function ResultCard({ label, control, agent, meta, negative = false }: { label: string; control: string; agent: string; meta?: string; negative?: boolean }) {
  return <div className="result-card"><span className="result-card-label">{label}</span><span className="result-card-value">{agent}</span><span className={`result-card-meta${negative ? " is-negative" : ""}`}>control {control}{meta ? ` · ${meta}` : ""}</span></div>;
}

function MetricChart({ label, view, control, agent, maxRate }: { label: string; view: MetricView; control: number | null; agent: number | null; maxRate?: number }) {
  const max = view === "outcomes" ? (maxRate ?? 1) : Math.max(control ?? 0, agent ?? 0, 1);
  const display = (value: number | null) => value === null ? "—" : view === "outcomes" ? percent(value) : view === "economics" ? dollars(value) : `${Math.round(value)} ms`;
  const width = (value: number | null) => value === null ? 0 : Math.max(3, (value / max) * 100);
  return <div className="chart-panel"><div className="chart-row"><span className="chart-name">Control</span><div className="chart-track" role="img" aria-label={`Control ${label}: ${display(control)}`}><div className="chart-bar" style={{ width: `${width(control)}%` }} /></div><span className="chart-value">{display(control)}</span></div><div className="chart-row"><span className="chart-name">Agent</span><div className="chart-track" role="img" aria-label={`Agent ${label}: ${display(agent)}`}><div className="chart-bar agent" style={{ width: `${width(agent)}%` }} /></div><span className="chart-value">{display(agent)}</span></div><div className="chart-legend"><span><i className="legend-dot" aria-hidden="true" />Control</span><span><i className="legend-dot agent" aria-hidden="true" />Agent</span></div></div>;
}

function DetailRow({ variant, summary }: { variant: Variant; summary: ReturnType<typeof summarize>["control"] }) {
  return <tr><td>{variant === "agent" ? "Agent variant" : "Control"}</td><td>{summary.exposure}</td><td>{summary.outcomeRate.numerator} ({percent(summary.outcomeRate.value)})</td><td>{dollars(summary.grossMargin)}</td><td>{dollars(summary.totalCost)}</td><td className={variant === "agent" ? "agent-cell" : ""}>{dollars(summary.netValue)}</td><td>{percent(summary.errorRate.value)} / {percent(summary.fallbackRate.value)}</td></tr>;
}
