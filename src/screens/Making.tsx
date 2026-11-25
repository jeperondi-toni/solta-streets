import Header from "./Header";

export default function Making({ photo, progress, onRetry, onBack, openMenu }: {
  photo: string; progress: { step: number; steps: number; error: string }; onRetry: () => void; onBack: () => void; openMenu: (p: string) => void;
}) {
  const pct = Math.round((progress.step / Math.max(progress.steps, 1)) * 100);
  return (
    <>
      <Header step={2} openMenu={openMenu} />
      <main className="wrap making" aria-live="polite">
        <img src={photo} alt="" />
        {progress.error ? (
          <>
            <h1 style={{ fontSize: 36 }}>Something went wrong</h1>
            <p className="error" role="alert">{progress.error}</p>
            <div className="actions"><button className="btn" onClick={onRetry}>Try again</button><button className="btn ghost" onClick={onBack}>← Change my choices</button></div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 36 }}>Imagining your street…</h1>
            <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${Math.max(pct, 6)}%` }} /></div>
            <p className="muted">{progress.step === 0 ? "Changing the room for cars first" : `Adding your choices · step ${Math.min(progress.step + 1, progress.steps)} of ${progress.steps}`}. This takes about 30 seconds a step.</p>
          </>
        )}
      </main>
    </>
  );
}
