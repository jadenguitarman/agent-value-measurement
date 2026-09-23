import { describe, expect, it } from "vitest";
import { economicAssumptions, sessions } from "./fixtures";
import { bootstrapOutcomeLift, summarize, summarizeVariant } from "./analysis";
import type { Session } from "./types";

describe("synthetic measurement analysis", () => {
  it("keeps exposure counts and aggregate outcome denominators visible", () => {
    const result = summarize(sessions, "all");
    expect(result.control.exposure).toBe(50);
    expect(result.agent.exposure).toBe(50);
    expect(result.control.outcomeRate).toMatchObject({ numerator: 14, denominator: 50, value: 0.28 });
    expect(result.agent.outcomeRate).toMatchObject({ numerator: 16, denominator: 50, value: 0.32 });
  });

  it("preserves a complex-cohort regression while the aggregate rate improves", () => {
    const all = summarize(sessions, "all");
    const complex = summarize(sessions, "complex");
    expect(all.agent.outcomeRate.value).toBeGreaterThan(all.control.outcomeRate.value ?? 1);
    expect(complex.agent.outcomeRate.value).toBeLessThan(complex.control.outcomeRate.value ?? 0);
  });

  it("calculates costs and net value from named session inputs", () => {
    const control = summarizeVariant(sessions, "control");
    const agent = summarizeVariant(sessions, "agent");
    expect(control.totalCost).toBeGreaterThan(0);
    expect(agent.totalCost).toBeGreaterThan(control.totalCost);
    expect(agent.netValuePerSession).toBeLessThan(control.netValuePerSession ?? Infinity);
  });

  it("returns a stable seeded bootstrap interval", () => {
    const first = bootstrapOutcomeLift(sessions, "all", economicAssumptions);
    const second = bootstrapOutcomeLift(sessions, "all", economicAssumptions);
    expect(first).toEqual(second);
    expect(first.estimate).toBeCloseTo(0.04);
    expect(first.low).not.toBeNull();
    expect(first.high).not.toBeNull();
  });

  it("does not turn empty cohorts into zero-valued success", () => {
    const empty: Session[] = [];
    expect(summarizeVariant(empty, "agent").outcomeRate.value).toBeNull();
    expect(bootstrapOutcomeLift(empty, "all", economicAssumptions).estimate).toBeNull();
  });
});
