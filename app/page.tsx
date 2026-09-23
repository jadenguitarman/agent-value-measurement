import { MeasurementExplorer } from "./measurement-explorer";
import { economicAssumptions, sessions } from "../lib/fixtures";
import Link from "next/link";

export default function Page() {
  return (
    <main className="measurement-app">
      <div className="measurement-frame">
        <header className="measurement-header">
          <Link className="measurement-brand" href="/" aria-label="Agent value home">
            <span className="brand-mark" aria-hidden="true">AV</span>
            <span>Agent value</span>
          </Link>
          <div className="header-status">
            <span className="synthetic-chip">synthetic fixture</span>
            <span className="header-meta">100 sessions · v0.1</span>
          </div>
        </header>
        <MeasurementExplorer sessions={sessions} assumptions={economicAssumptions} />
      </div>
    </main>
  );
}
