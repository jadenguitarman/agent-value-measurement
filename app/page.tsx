import { MeasurementExplorer } from "./measurement-explorer";
import { economicAssumptions, sessions } from "../lib/fixtures";

export default function Page() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="container nav" aria-label="Primary navigation">
          <a className="wordmark" href="#top">
            <span className="wordmark-mark" aria-hidden="true">AV</span>
            <span>Agent value, measured</span>
          </a>
          <div className="nav-links">
            <a href="#explore">Explore the result</a>
            <a href="#method">Method</a>
            <span className="nav-note">Synthetic / v0.1</span>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">An editorial measurement guide</p>
              <h1 id="hero-title">A better answer is not the same as <em>more value.</em></h1>
              <p className="hero-deck">
                Follow one ecommerce search scenario from agent exposure to order margin, cost, uncertainty, and the segment that changes the story.
              </p>
            </div>
            <aside className="hero-aside" aria-label="What this guide measures">
              <p className="aside-kicker">The measurement chain</p>
              <ol className="aside-list">
                <li><span className="aside-number">01</span><div><strong>Exposure</strong><span>Who saw control or agent search?</span></div></li>
                <li><span className="aside-number">02</span><div><strong>Outcome</strong><span>Did the session complete an order?</span></div></li>
                <li><span className="aside-number">03</span><div><strong>Value</strong><span>Did margin survive interaction cost?</span></div></li>
              </ol>
            </aside>
          </div>
        </section>

        <div className="synthetic-banner" role="note">
          <div className="container banner-inner">
            <span className="banner-label">Synthetic data</span>
            <p className="banner-copy">Every event, cost, and result here is a deterministic fixture. It illustrates a method; it is not evidence of live causal impact.</p>
            <a className="banner-link" href="#method">Read the assumptions →</a>
          </div>
        </div>

        <section className="section" aria-labelledby="question-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="question-title">Start with the business question.</h2>
              <p>A quality score can tell you whether a system answered well. It cannot tell you whether the answer paid for itself.</p>
            </div>
            <div className="question-grid">
              <div className="question-copy">
                <p>“For an ecommerce search task, did showing the agent increase completed orders and contribution margin within the attribution window?”</p>
              </div>
              <dl className="question-list">
                <div><dt>Primary outcome</dt><dd>Completed order</dd></div>
                <div><dt>Attribution window</dt><dd>{economicAssumptions.attributionWindow}</dd></div>
                <div><dt>Assignment</dt><dd>50 / 50 fixture split</dd></div>
                <div><dt>Guardrails</dt><dd>Latency + recovery</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="section" id="explore" aria-labelledby="explore-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="explore-title">Now inspect the result.</h2>
              <p>The default view shows all 100 synthetic sessions. Change the cohort or metric; the selected state is reflected in the URL so the comparison can be shared.</p>
            </div>
            <MeasurementExplorer sessions={sessions} assumptions={economicAssumptions} />
          </div>
        </section>

        <section className="section" aria-labelledby="segments-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="segments-title">The average can hide the user who matters.</h2>
              <p>Simple requests improve in this fixture. Complex requests—the higher-margin cohort—regress. That is why segment analysis belongs beside the headline number.</p>
            </div>
            <SegmentTable sessions={sessions} />
          </div>
        </section>

        <section className="section" id="method" aria-labelledby="method-title">
          <div className="container method-grid">
            <div>
              <h3 id="method-title">The result is only as credible as the contract behind it.</h3>
              <p className="method-copy">This baseline makes the contract inspectable. It also draws a hard boundary: synthetic events cannot establish that a live agent caused a business outcome.</p>
            </div>
            <ul className="method-list">
              <li><strong>Fixture</strong><span>100 deterministic ecommerce search sessions, split evenly between control and agent.</span></li>
              <li><strong>Value</strong><span>Illustrative contribution margin: ${economicAssumptions.simpleOrderMargin} for simple and ${economicAssumptions.complexOrderMargin} for complex orders.</span></li>
              <li><strong>Cost</strong><span>Model, tool, infrastructure, and fallback/review inputs are stored on each session and summed without hidden constants.</span></li>
              <li><strong>Uncertainty</strong><span>{economicAssumptions.bootstrap.resamples.toLocaleString()} seeded bootstrap resamples of session outcomes; the interval is descriptive, not a causal guarantee.</span></li>
              <li><strong>Future boundary</strong><span>A real adapter would need approved event ownership, privacy rules, assignment, attribution, retention, and live validation first.</span></li>
            </ul>
          </div>
        </section>

        <section className="section loop" aria-labelledby="loop-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="loop-title">Turn the demo into an operating loop.</h2>
              <p>Measurement is not a launch-day score. It is a sequence of decisions with a visible reason for the next change.</p>
            </div>
            <div className="loop-grid">
              <div className="loop-step"><span className="loop-step-number">01</span><h3>Measure</h3><p>Capture exposure, outcome, cost, and recovery events.</p></div>
              <div className="loop-step"><span className="loop-step-number">02</span><h3>Inspect</h3><p>Slice by request complexity, value, and guardrails.</p></div>
              <div className="loop-step"><span className="loop-step-number">03</span><h3>Change one thing</h3><p>Improve retrieval, routing, prompts, or fallback behavior.</p></div>
              <div className="loop-step"><span className="loop-step-number">04</span><h3>Measure again</h3><p>Keep the control, repeat the contract, and update the evidence.</p></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>Agent value, measured · local synthetic baseline</p>
          <p>No live model · no analytics account · no credentials required</p>
        </div>
      </footer>
    </div>
  );
}

import type { Session } from "../lib/types";
import { summarize } from "../lib/analysis";
import { dollars, percent, signedPercent } from "../lib/format";

function SegmentTable({ sessions }: { sessions: Session[] }) {
  const rows = ["all", "simple", "complex"] as const;
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <caption className="sr-only">Control and agent comparison by cohort</caption>
        <thead><tr><th scope="col">Cohort</th><th scope="col">Control exposure</th><th scope="col">Control orders</th><th scope="col">Agent exposure</th><th scope="col">Agent orders</th><th scope="col">Outcome lift</th><th scope="col">Agent net / session</th></tr></thead>
        <tbody>
          {rows.map((cohort) => {
            const result = summarize(sessions, cohort);
            const lift = result.agent.outcomeRate.value === null || result.control.outcomeRate.value === null ? null : result.agent.outcomeRate.value - result.control.outcomeRate.value;
            return <tr key={cohort}>
              <td>{cohort === "all" ? "All sessions" : `${cohort[0].toUpperCase()}${cohort.slice(1)} requests`}</td>
              <td>{result.control.exposure}</td><td>{result.control.outcomeRate.numerator} ({percent(result.control.outcomeRate.value)})</td>
              <td className="agent-cell">{result.agent.exposure}</td><td className="agent-cell">{result.agent.outcomeRate.numerator} ({percent(result.agent.outcomeRate.value)})</td>
              <td className={lift !== null && lift < 0 ? "agent-cell" : ""}>{signedPercent(lift)}</td><td className="agent-cell">{dollars(result.agent.netValuePerSession)}</td>
            </tr>;
          })}
        </tbody>
      </table>
      <p className="caption">The complex cohort has higher illustrative margin per order, yet its outcome rate falls and its agent interaction costs more.</p>
    </div>
  );
}
