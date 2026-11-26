import { useRef, useState } from "react";
import type { Work } from "../App";
import { sendToChorus } from "../api";
import { sideBySide } from "../image";
import { BIKES, CARS, ITEM } from "../options";
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

const PINS = [
  { left: "30%", top: "62%", color: "#22a35a", label: "+", text: "Love the benches" },
  { left: "54%", top: "40%", color: "#e0a100", label: "!", text: "A tree here?" },
  { left: "68%", top: "70%", color: "#d23c2c", label: "−", text: "Where do vans unload?" },
];

function Pinned({ image, small }: { image: string; small?: boolean }) {
  return (
    <div className={"pinned" + (small ? " small" : "")}>
      <img src={image} alt="" />
      {PINS.map((p, i) => (
        <div key={i} className="pin" style={{ left: p.left, top: p.top, animationDelay: `${0.4 + i * 0.5}s` }}>
          <span className="dot" style={{ background: p.color }}>{p.label}</span>
          {!small && <span className="bubble">{p.text}</span>}
        </div>
      ))}
      <div className="pinned-cap">People tap on the image to leave feedback</div>
    </div>
  );
}

export default function Result({ w, onChange, onAnother, openMenu }: { w: Work; onChange: () => void; onAnother: () => void; openMenu: (p: string) => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [ask, setAsk] = useState(false);
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

        <div className="photo-block">
          <Compare before={w.photo} after={w.result} />
          <section className="sharebar" aria-labelledby="share-t">
            <div>
              <h2 id="share-t">Share it</h2>
              <p>Every share brings more people in — and more voices make a stronger case with the city.</p>
            </div>
            <div className="actions">
              <button className="btn" onClick={share} disabled={!!busy}>Share image</button>
              <a className="btn ghost" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener">WhatsApp</a>
              <button className="btn ghost" onClick={download} disabled={!!busy}>Download</button>
            </div>
          </section>
          {msg && <p className="error" role="alert">{msg}</p>}
        </div>

        <section className="panel">
          <h2>What changed</h2>
          <ul className="changed">
            <li><b>{car.title}</b> — {car.desc}</li>
            {(() => { const b = BIKES[w.cars].options.find((o) => o.id === w.bikes); return b && w.bikes !== "none" ? <li><b>{b.title}</b> — {b.desc}</li> : null; })()}
            {w.picks.map((id) => {
              const it = ITEM[id];
              return <li key={id}><b>{it?.title}</b> — {it?.desc}{it?.learn && <> <a href={it.learn} target="_blank" rel="noopener">Best practices →</a></>}</li>;
            })}
            {w.other.trim() && <li><b>Your idea</b> — {w.other.trim()}</li>}
          </ul>
          <p className="note"><b>Don’t forget:</b> crossings and sidewalks should work for everyone — wheelchairs, prams, people who walk slowly. Level kerbs and ramps are too small to see in the image, but they belong in the plan.</p>
          <p className="muted">This image is made by AI from your photo. It shows an idea, not a finished design.</p>
        </section>

        <section className="community" aria-labelledby="comm-t">
          <div className="community-head">
            <h2 id="comm-t">What does your community think?</h2>
            <p>Ask your neighbours to tap on the image: what they like, what they don’t, and their own ideas — by text or voice. No account needed.</p>
          </div>
          <Pinned image={w.result} />
          <div className="community-body">
            <ul className="feats">
              {["Live pin map on the image", "AI summary of themes and ideas", "Filter by like, dislike and idea", "A report to take to the city"].map((f) => <li key={f}><span aria-hidden="true">✓</span>{f}</li>)}
            </ul>
            <button className="btn big" onClick={() => setAsk(true)}>Ask my community →</button>
          </div>
        </section>

        <div className="actions">
          <button className="btn ghost" onClick={onChange}>← Change my choices</button>
          <button className="btn ghost" onClick={onAnother}>Try another street</button>
          <button className="btn ghost" onClick={() => openMenu("steps")}>What can I do next?</button>
        </div>
      </main>

      {ask && (
        <div className="overlay" onClick={() => setAsk(false)}>
          <div className="dialog wide" role="dialog" aria-modal="true" aria-labelledby="ask-t" onClick={(e) => e.stopPropagation()}>
            <Pinned image={w.result} small />
            <h3 id="ask-t">Collect feedback on your street</h3>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>We open Chorus, Solta’s feedback tool, with your image. Confirm your email there — no password — and you get a link to share and your own dashboard with everything people say.</p>
            {msg && <p className="error" role="alert">{msg}</p>}
            <div className="actions">
              <button className="btn" onClick={chorus} disabled={!!busy}>{busy === "chorus" ? "Opening Chorus…" : "Continue to Chorus →"}</button>
              <button className="btn ghost" onClick={() => setAsk(false)}>Not now</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
