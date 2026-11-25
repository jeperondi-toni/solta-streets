const STEPS = ["Your street", "What you want", "Your image"];

export default function Header({ step, openMenu }: { step?: number; openMenu: (p: string) => void }) {
  return (
    <header className="wrap top">
      <a href="/" aria-label="Solta — start again"><img src="/solta-logo.png" alt="Solta" /></a>
      <nav aria-label="Main">
        {step !== undefined && (
          <ol className="steps">
            {STEPS.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined}>{i + 1} {s}</li>)}
          </ol>
        )}
        <button className="pill" onClick={() => openMenu("why")} aria-haspopup="dialog">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          Menu
        </button>
      </nav>
    </header>
  );
}
