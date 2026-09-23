"use client";

import { useMemo, useSyncExternalStore } from "react";
import { bootstrapOutcomeLift, getMetricLabel, getMetricValue, maxOutcomeRate, summarize } from "../lib/analysis";
import { dollars, number, percent, signedDollars, signedPercent } from "../lib/format";
import type { CohortFilter, EconomicAssumptions, MetricView, Session, Variant } from "../lib/types";

const cohortOptions: Array<{ value: CohortFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "simple", label: "Simple" },
  { value: "complex", label: "Complex" },
];

const metricOptions: Array<{ value: MetricView; label: string }> = [
  { value: "outcomes", label: "Order rate" },
  { value: "economics", label: "Net value" },
  { value: "guardrails", label: "Latency" },
];

export function MeasurementExplorer({ sessions, assumptions }: { sessions: Session[]; assumptions: EconomicAssumptions }) {
  const selection = useUrlSelection();
  const cohort = selection.cohort;
  const view = selection.view;
  const result = useMemo(() => summarize(sessions, cohort), [sessions, cohort]);
  const interval = useMemo(() => bootstrapOutcomeLift(sessions, cohort, assumptions), [sessions, cohort, assumptions]);
  const segmentResults = useMemo(() => ({
    all: summarize(sessions, "all"),
    simple: summarize(sessions, "simple"),
    complex: summarize(sessions, "complex"),
  }), [sessions]);

  function updateState(nextCohort: CohortFilter, nextView: MetricView) {
    const params = new URLSearchParams(window.location.search);
    params.set("cohort", nextCohort);
    params.set("view", nextView);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const maxRate = maxOutcomeRate(result);
  const currentLabel = getMetricLabel(view);
  const currentControl = getMetricValue(result.control, view);
  const currentAgent = getMetricValue(result.agent, view);
  const outcomeLift = difference(result.control.outcomeRate.value, result.agent.outcomeRate.value);
  const netLift = difference(result.control.netValuePerSession, result.agent.netValuePerSession);
  const noData = result.control.exposure === 0 || result.agent.exposure === 0;

  return (
    <section className="measurement-workspace" aria-label="Agent value measurement">
      <aside className="measurement-rail">
        <div>
          <div className="rail-heading">
            <span className="rail-index">01</span>
            <h1>Value signal</h1>
          </div>
          <div className="rail-rule" />
          <div className="signal-panel">
            <div className="signal-panel-head"><span>Aggregate / segment</span><span className="signal-alert">inspect</span></div>
            <SignalRow label="All requests" value={difference(segmentResults.all.control.outcomeRate.value, segmentResults.all.agent.outcomeRate.value)} />
            <SignalRow label="Simple" value={difference(segmentResults.simple.control.outcomeRate.value, segmentResults.simple.agent.outcomeRate.value)} />
            <SignalRow label="Complex" value={difference(segmentResults.complex.control.outcomeRate.value, segmentResults.complex.agent.outcomeRate.value)} negative />
            <div className="signal-foot">Complex requests regress while the aggregate improves.</div>
          </div>
        </div>
        <div className="rail-bottom">
          <div className="rail-key"><span className="key-block control-key" />Control</div>
          <div className="rail-key"><span className="key-block agent-key" />Agent</div>
          <p className="caveat">Synthetic, deterministic fixture. Illustrative only; not live causal evidence.</p>
        </div>
      </aside>

      <div className="measurement-main">
        <div className="measurement-controls">
          <div className="control-set" aria-label="Cohort filter">
            <span className="control-set-label">Cohort</span>
            <div className="choice-group">
              {cohortOptions.map((option) => <button className="choice" key={option.value} type="button" aria-pressed={cohort === option.value} onClick={() => updateState(option.value, view)}>{option.label}</button>)}
            </div>
          </div>
          <label className="metric-select-label" htmlFor="metric-view">Measure
            <select className="metric-select" id="metric-view" value={view} onChange={(event) => updateState(cohort, event.target.value as MetricView)}>
              {metricOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {noData ? <div className="no-data">No fixture sessions are available for this comparison.</div> : <>
          <div className="metric-grid" aria-label="Overall control and agent metrics">
            <MetricCell label="Exposure" control={number(result.control.exposure)} agent={number(result.agent.exposure)} />
            <MetricCell label="Completed order rate" control={percent(result.control.outcomeRate.value)} agent={percent(result.agent.outcomeRate.value)} delta={signedPercent(outcomeLift)} negative={outcomeLift !== null && outcomeLift < 0} />
            <MetricCell label="Gross margin" control={dollars(result.control.grossMargin)} agent={dollars(result.agent.grossMargin)} delta={signedDollars(difference(result.control.grossMargin, result.agent.grossMargin))} />
            <MetricCell label="Full interaction cost" control={dollars(result.control.totalCost)} agent={dollars(result.agent.totalCost)} delta={signedDollars(difference(result.control.totalCost, result.agent.totalCost))} negative />
            <MetricCell label="Net value / session" control={dollars(result.control.netValuePerSession)} agent={dollars(result.agent.netValuePerSession)} delta={signedDollars(netLift)} negative={netLift !== null && netLift < 0} />
            <MetricCell label="Average latency" control={milliseconds(result.control.avgLatencyMs)} agent={milliseconds(result.agent.avgLatencyMs)} delta={`fallback ${percent(result.agent.fallbackRate.value)}`} />
          </div>

          <div className="result-lower">
            <div className="comparison-panel">
              <div className="panel-heading"><span>{currentLabel}</span><span className="panel-context">{cohortLabel(cohort)}</span></div>
              <MetricChart label={currentLabel} view={view} control={currentControl} agent={currentAgent} maxRate={view === "outcomes" ? maxRate : undefined} />
              <div className="interval-row"><span>95% outcome lift interval</span><strong>{signedPercent(interval.low)} to {signedPercent(interval.high)}</strong><span className="interval-estimate">observed {signedPercent(interval.estimate)}</span></div>
            </div>
            <div className="detail-panel">
              <div className="panel-heading"><span>Variant detail</span><span className="panel-context">{assumptions.attributionWindow}</span></div>
              <table className="detail-table"><caption className="sr-only">Control and agent detail for {cohortLabel(cohort)}</caption><thead><tr><th scope="col">Variant</th><th scope="col">Orders</th><th scope="col">Net value</th><th scope="col">Recovery</th></tr></thead><tbody><DetailRow variant="control" summary={result.control} /><DetailRow variant="agent" summary={result.agent} /></tbody></table>
              <div className="detail-note"><span className="note-marker" aria-hidden="true" />Cost is included in net value.</div>
            </div>
          </div>
        </>}
      </div>
    </section>
  );
}

function difference(control: number | null, agent: number | null): number | null {
  return control === null || agent === null ? null : agent - control;
}

function milliseconds(value: number | null): string {
  return value === null ? "—" : `${Math.round(value)} ms`;
}

function cohortLabel(cohort: CohortFilter): string {
  return cohort === "all" ? "all requests" : `${cohort} requests`;
}

function SignalRow({ label, value, negative = false }: { label: string; value: number | null; negative?: boolean }) {
  return <div className={`signal-row${negative ? " signal-row-negative" : ""}`}><span>{label}</span><strong>{signedPercent(value)}</strong></div>;
}

function MetricCell({ label, control, agent, delta, negative = false }: { label: string; control: string; agent: string; delta?: string; negative?: boolean }) {
  return <div className="metric-cell"><span className="metric-label">{label}</span><div className="metric-values"><span><small>ctrl</small>{control}</span><span className="agent-value"><small>agent</small>{agent}</span></div>{delta ? <span className={`metric-delta${negative ? " metric-delta-negative" : ""}`}>{delta}</span> : null}</div>;
}

function MetricChart({ label, view, control, agent, maxRate }: { label: string; view: MetricView; control: number | null; agent: number | null; maxRate?: number }) {
  const max = view === "outcomes" ? (maxRate ?? 1) : Math.max(control ?? 0, agent ?? 0, 1);
  const display = (value: number | null) => value === null ? "—" : view === "outcomes" ? percent(value) : view === "economics" ? dollars(value) : milliseconds(value);
  const width = (value: number | null) => value === null ? 0 : Math.max(3, (value / max) * 100);
  return <div className="chart" aria-label={`${label} comparison`}><div className="chart-line"><span>Control</span><div className="chart-track" role="img" aria-label={`Control ${label}: ${display(control)}`}><div className="chart-bar control-bar" style={{ width: `${width(control)}%` }} /></div><strong>{display(control)}</strong></div><div className="chart-line"><span>Agent</span><div className="chart-track" role="img" aria-label={`Agent ${label}: ${display(agent)}`}><div className="chart-bar agent-bar" style={{ width: `${width(agent)}%` }} /></div><strong>{display(agent)}</strong></div></div>;
}

function DetailRow({ variant, summary }: { variant: Variant; summary: ReturnType<typeof summarize>["control"] }) {
  return <tr><td><span className={`table-dot ${variant === "agent" ? "table-dot-agent" : "table-dot-control"}`} aria-hidden="true" />{variant === "agent" ? "Agent" : "Control"}</td><td>{summary.outcomeRate.numerator} <span className="table-muted">/ {summary.exposure}</span></td><td>{dollars(summary.netValue)}</td><td>{percent(summary.fallbackRate.value)} <span className="table-muted">fb</span></td></tr>;
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
