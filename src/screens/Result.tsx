import { useRef, useState } from "react";
import type { Work } from "../App";
import { sendToChorus } from "../api";
import { sideBySide } from "../image";
import { CARS, ITEM } from "../options";
import Header from "./Header";

function Compare({ before, after }: { before: string; after: string }) {
  const [x, setX] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setX(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref} className="compare"
      role="slider" tabIndex={0} aria-label="Drag to compare today and what it could be" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(x)}
      onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons) move(e.clientX); }}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") setX((v) => Math.max(0, v - 5)); if (e.key === "ArrowRight") setX((v) => Math.min(100, v + 5)); }}
    >
      <img src={before} alt="Your street today" draggable={false} />
      <div className="after" style={{ clipPath: `inset(0 0 0 ${x}%)` }}><img src={after} alt="Your street as it could be" draggable={false} /></div>
      <div className="handle" style={{ left: `${x}%` }}><div className="knob" aria-hidden="true">↔</div></div>
      <span className="tag" style={{ left: 14 }}>Today</span>
      <span className="tag" style={{ right: 14 }}>Could be</span>
    </div>
  );
}

export default function Result({ w, onChange, onAnother, openMenu }: { w: Work; onChange: () => void; onAnother: () => void; openMenu: (p: string) => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const street = w.street || "our street";
  const shareText = `This could be ${street}. What do you think?`;
  const car = CARS.find((c) => c.id === w.cars)!;

  const shared = () => sideBySide(w.photo, w.result, w.street);

  const download = async () => {
    setBusy("download");
    try {
      const a = document.createElement("a");
      a.href = await shared(); a.download = `${(w.street || "my-street").replace(/[^\w-]+/g, "-").toLowerCase()}-could-be.jpg`; a.click();
    } catch (e) { setMsg(`Could not make the image: ${(e as Error).message}`); }
    setBusy("");
  };

  const share = async () => {
    setBusy("share"); setMsg("");
    try {
      const blob = await (await fetch(await shared())).blob();
      const file = new File([blob], "could-be.jpg", { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: shareText });
      else { await download(); setMsg("Your browser can’t share images directly, so we downloaded it. Share it from your photos."); }
    } catch (e) { if ((e as Error).name !== "AbortError") setMsg(`Could not share: ${(e as Error).message}`); }
    setBusy("");
  };

  const chorus = async () => {
    setBusy("chorus"); setMsg("");
    try {
      const { url } = await sendToChorus(await shared(), `This could be ${street}`);
      window.open(url, "_blank", "noopener");
    } catch (e) { setMsg(`Could not open Chorus: ${(e as Error).message}`); }
    setBusy("");
  };

  return (
    <>
      <Header step={2} openMenu={openMenu} />
      <main className="wrap result">
        <div>
          {w.street && <p className="muted" style={{ margin: "0 0 6px" }}>{w.street}</p>}
          <h1>This could be <mark>your street.</mark></h1>
        </div>
        <Compare before={w.photo} after={w.result} />
        {msg && <p className="error" role="alert">{msg}</p>}
        <div className="panels">
          <section className="panel">
            <h2>What does your community think?</h2>
            <p>Share the image and ask. People tap on it to say what they like, what they don’t, or leave an idea — by text or voice. They don’t need an account.</p>
            <div className="actions"><button className="btn" onClick={chorus} disabled={!!busy}>{busy === "chorus" ? "Opening Chorus…" : "Ask my community"}</button></div>
            <p className="muted">Feedback by Chorus, from Solta. You’ll confirm your email there — no password.</p>
          </section>
          <section className="panel">
            <h2>Share it</h2>
            <p>The image is your invitation. Every share brings more people in — and more voices make a stronger case with the city.</p>
            <div className="actions">
              <button className="btn small" onClick={share} disabled={!!busy}>Share image</button>
              <button className="btn ghost small" onClick={download} disabled={!!busy}>Download image</button>
              <a className="btn ghost small" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener">WhatsApp</a>
            </div>
            <p className="muted">The image comes ready for social media, with today and could-be side by side.</p>
          </section>
        </div>
        <section className="panel">
          <h2>What changed</h2>
          <ul className="changed">
            <li><b>{car.title}</b> — {car.desc}</li>
            {w.picks.map((id) => <li key={id}><b>{ITEM[id]?.title}</b> — {ITEM[id]?.desc}</li>)}
            {w.other.trim() && <li><b>Your idea</b> — {w.other.trim()}</li>}
          </ul>
          <p className="note"><b>Don’t forget:</b> crossings and sidewalks should work for everyone — wheelchairs, prams, people who walk slowly. Level kerbs and ramps are too small to see in the image, but they belong in the plan.</p>
          <p className="muted">This image is made by AI from your photo. It shows an idea, not a finished design.</p>
        </section>
        <div className="actions">
          <button className="btn ghost" onClick={onChange}>← Change my choices</button>
          <button className="btn ghost" onClick={onAnother}>Try another street</button>
          <button className="btn ghost" onClick={() => openMenu("steps")}>What can I do next?</button>
        </div>
      </main>
    </>
  );
}
