import { useEffect } from "react";

const PAGES = [
  { id: "why", label: "Why change your street?" },
  { id: "steps", label: "Suggested steps" },
  { id: "who", label: "Who we are" },
  { id: "school", label: "School streets" },
];

const TYSS = "https://transformyourschoolstreet.com";

export default function Menu({ page, setPage, onClose }: { page: string; setPage: (p: string) => void; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; // the page behind does not scroll
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="menu" role="dialog" aria-modal="true" aria-label="Menu">
      <header className="wrap top">
        <img src="/solta-logo.png" alt="Solta" />
        <button className="pill" onClick={onClose} autoFocus>Close ✕</button>
      </header>
      <div className="wrap">
        <nav className="tabs" aria-label="Menu pages">
          {PAGES.map((p) => <button key={p.id} className="pill" aria-current={page === p.id ? "page" : undefined} onClick={() => setPage(p.id)}>{p.label}</button>)}
        </nav>

        {page === "why" && (
          <section>
            <h2>Why change your street?</h2>
            <p>Streets are the biggest public space most of us have and we give most of it to cars, moving or parked. Yet a street is also where we meet our community, where children play, where a shop on the corner keeps a block alive.</p>
            <ol>
              <li><span>01</span><div><h3>Life happens at eye level.</h3><p>We experience a city on foot, along the ground floors. Seats, trees and open shop fronts make people stay — and a street where people stay feels safer for everyone.</p></div></li>
              <li><span>02</span><div><h3>Greener streets cope better.</h3><p>Trees give shade on hot days, and soil instead of asphalt soaks up heavy rain. Small changes along a street add up across a neighbourhood.</p></div></li>
              <li><span>03</span><div><h3>Change starts with a picture.</h3><p>It’s hard to want what you can’t see. An image of your own street, changed, turns a complaint into a proposal your community and your city can talk about.</p></div></li>
            </ol>
            <p><em>“Good streets are made with the people who use them.”</em></p>
          </section>
        )}

        {page === "steps" && (
          <section>
            <h2>Suggested steps</h2>
            <p>From an image to a real change. You don’t need to do it all — each step makes the next one easier.</p>
            <ol>
              <li><span>01</span><div><h3>Imagine</h3><p>Make an image of your street as it could be. Try a few versions until it feels right.</p></div></li>
              <li><span>02</span><div><h3>Ask your community</h3><p>Share it and ask what they like, what they don’t, and what they’d add. Their answers make the idea theirs too.</p></div></li>
              <li><span>03</span><div><h3>Test it for a day</h3><p>Borrow planters, bring chairs, ask the city for a street party permit. One afternoon shows more than any drawing.</p></div></li>
              <li><span>04</span><div><h3>Bring it to the city</h3><p>Take the image, your community’s answers and photos of the test day to your district or council. A tested, shared idea is hard to ignore.</p></div></li>
              <li><span>05</span><div><h3>Make it last</h3><p>Plant, build and look after it together. A street people care for stays good.</p></div></li>
            </ol>
          </section>
        )}

        {page === "who" && (
          <section>
            <h2>Who we are</h2>
            <p>This tool is made by Solta, in partnership with STIPO.</p>
            <h3>Solta</h3>
            <p>A digital placemaking studio. We make simple tools that turn local frustration into concrete proposals — an image, a conversation, a plan a city can act on. We also make Transform your school street and Chorus. <a href="https://solta.city" target="_blank" rel="noopener"><b>solta.city →</b></a></p>
            <h3>STIPO</h3>
            <p>A team for better cities, working from Amsterdam, Milan, Athens and Warsaw. STIPO started The City at Eye Level and co-founded Placemaking Europe. Their way of reading streets at eye level shapes how this tool reads yours and what it suggests. <a href="https://stipo.nl" target="_blank" rel="noopener"><b>stipo.nl →</b></a></p>
            <h3>Want to take your street further?</h3>
            <p>From a first image to a plan with the city — Solta and STIPO can help.</p>
            <div><a className="btn" href="https://solta.city" target="_blank" rel="noopener">Get in touch</a></div>
          </section>
        )}

        {page === "school" && (
          <section>
            <h2>Is there a school on your street?</h2>
            <p>The streets around a school matter twice: children walk them every day, and parents, teachers and neighbours already share a reason to change them. For those streets we made a tool of its own.</p>
            <h3>Transform your school street</h3>
            <ul>
              <li>A before and after of the school street, with ideas made for children: play, safe crossings, a car-free school entrance.</li>
              <li>Feedback from parents, teachers and children on the image.</li>
              <li>Suggested steps, a ready-to-send letter to the city and open-source guides to build street furniture together.</li>
            </ul>
            <div><a className="btn" href={TYSS} target="_blank" rel="noopener">Open Transform your school street →</a></div>
            <p className="muted">No school nearby? Stay here: this tool works for any residential or high street.</p>
          </section>
        )}
      </div>
    </div>
  );
}
