import { useState } from "react";
import { fileToJpeg } from "../image";
import Header from "./Header";

export default function Home({ onStart, openMenu }: { onStart: (photo: string, street: string) => void; openMenu: (p: string) => void }) {
  const [photo, setPhoto] = useState("");
  const [street, setStreet] = useState("");
  const [error, setError] = useState("");
  const [video, setVideo] = useState(true); // hidden until public/hero.mp4 exists

  const pick = async (f?: File) => {
    if (!f) return;
    setError("");
    try { setPhoto(await fileToJpeg(f)); } catch (e) { setError(`Could not use this photo: ${(e as Error).message}`); }
  };

  return (
    <>
      <Header openMenu={openMenu} />
      <main>
        <section className="wrap hero">
          <div>
            <h1>What could your street <mark>become?</mark></h1>
            <p className="lead">Upload a photo of your street. Pick what you’d love to see — trees, places to sit, a slow or car-free street. Get an image you can share, and hear what your community thinks.</p>
            <form className="card" onSubmit={(e) => { e.preventDefault(); if (photo) onStart(photo, street.trim()); }}>
              <label className="drop">
                {photo ? <img src={photo} alt="Your street photo" /> : (
                  <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                )}
                <strong>{photo ? "Choose another photo" : "Take or upload a photo of your street"}</strong>
                <span className="muted">Stand on the sidewalk and look along the street</span>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => pick(e.target.files?.[0])} />
              </label>
              {error && <p className="error" role="alert">{error}</p>}
              <label className="field">Which street?
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. Utrechtsestraat, Amsterdam" autoComplete="street-address" />
              </label>
              <button className="btn" type="submit" disabled={!photo}>Imagine my street →</button>
            </form>
            <p style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "8px 12px", fontSize: 16, color: "var(--ink-2)" }}>
              <b style={{ color: "var(--ink)" }}>Solta × STIPO</b><span>Made with the team behind The City at Eye Level.</span>
              <button className="link" onClick={() => openMenu("who")}>Who we are →</button>
            </p>
          </div>
          {video && <div>
            <video className="hero-video" autoPlay muted loop playsInline poster="/hero-poster.jpg" aria-label="A street changing from today to what it could be" style={{ width: "100%", borderRadius: 18, background: "var(--soft)", aspectRatio: "4 / 3", objectFit: "cover" }}>
              <source src="/hero.mp4" type="video/mp4" onError={() => setVideo(false)} />
            </video>
          </div>}
        </section>
        <section className="how" id="how">
          <div className="wrap">
            <div><span>1</span><h2>Photo</h2><p>One picture from your phone is enough.</p></div>
            <div><span>2</span><h2>Choose</h2><p>We suggest what fits your street. You pick what you want to see.</p></div>
            <div><span>3</span><h2>Share</h2><p>Share the before and after, and ask your community what it thinks.</p></div>
          </div>
        </section>
      </main>
      <footer className="wrap foot">
        <span>A school on your street? <button className="link" onClick={() => openMenu("school")}>Transform your school street →</button></span>
        <span>Made by <b>Solta</b> in partnership with <b>STIPO</b> · <button className="link" onClick={() => openMenu("who")}>Who we are</button></span>
      </footer>
    </>
  );
}
