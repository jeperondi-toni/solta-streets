import { useState } from "react";
import type { Work } from "../App";
import type { Facts } from "../api";
import { CARS, CATEGORIES, ORDER, ITEM, defaultPicks, type StreetType } from "../options";
import Header from "./Header";

const EXCLUSIVE: Record<string, string> = {};

export default function Choose({ w, setW, onMake, onBack, openMenu }: {
  w: Work; setW: React.Dispatch<React.SetStateAction<Work>>; onMake: () => void; onBack: () => void; openMenu: (p: string) => void;
}) {
  const [open, setOpen] = useState<string[] | null>(null);
  const [peek, setPeek] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const f = w.facts;
  const type: StreetType = f?.type ?? "residential";
  const openCats = open ?? ORDER[type].slice(0, 2);

  const setFact = <K extends keyof Facts>(k: K, v: Facts[K]) => setW((p) => {
    const facts = { ...(p.facts as Facts), [k]: v };
    return k === "type" ? { ...p, facts, picks: defaultPicks(v as StreetType), cars: "carfree" } : { ...p, facts };
  });
  const toggle = (id: string) => setW((p) => {
    const has = p.picks.includes(id);
    const other = EXCLUSIVE[id];
    const base = other ? p.picks.filter((x) => x !== other) : p.picks;
    return { ...p, picks: has ? base.filter((x) => x !== id) : [...base, id] };
  });

  const count = w.picks.length + 1 + (w.other.trim() ? 1 : 0);
  const minutes = Math.max(1, Math.ceil((1 + Math.ceil((w.picks.length + (w.other.trim() ? 1 : 0)) / 3)) * 0.4));

  return (
    <>
      <Header step={1} openMenu={openMenu} />
      <main className="wrap choose">
        <aside>
          <img src={w.photo} alt="Your street today" />
          {w.street && <strong style={{ fontSize: 18 }}>{w.street}</strong>}
          <div className="read" aria-live="polite">
            {!f ? <span className="muted">Looking at your photo…</span> : (
              <>
                {w.readError && <span className="muted">We couldn’t read the photo, so please check these. ({w.readError})</span>}
                {f.isStreet === false && <span className="error">This doesn’t look like a street. The image works best with a photo from the sidewalk, looking along the street.</span>}
                {!(edit || w.readError) ? (
                  <p className="summary">
                    We read: <b>{f.type === "high" ? "High street" : "Residential"}</b>
                    {" · "}<b>{{ none: "no parked cars", parallel: "cars parked along the kerb", angled: "cars parked at an angle" }[f.parking]}</b>
                    {" · "}<b>{{ both: "trees on both sides", left: "trees on the left", right: "trees on the right", none: "no trees" }[f.treeSide]}</b>
                    {f.tram && <>{" · "}<b>tram or bus lane</b></>}
                    {" "}<button className="link" onClick={() => setEdit(true)} aria-expanded={false}>Change</button>
                  </p>
                ) : (
                  <>
                    <strong>How we read your street</strong>
                    <label>Street type
                      <select value={f.type} onChange={(e) => setFact("type", e.target.value as StreetType)}>
                        <option value="residential">Residential</option><option value="high">High street</option>
                      </select>
                    </label>
                    <label>Parked cars
                      <select value={f.parking} onChange={(e) => setFact("parking", e.target.value as Facts["parking"])}>
                        <option value="none">None</option><option value="parallel">Along the kerb</option><option value="angled">At an angle</option>
                      </select>
                    </label>
                    <label>Trees
                      <select value={f.treeSide} onChange={(e) => setFact("treeSide", e.target.value as Facts["treeSide"])}>
                        <option value="both">Both sides</option><option value="left">Left side</option><option value="right">Right side</option><option value="none">None</option>
                      </select>
                    </label>
                    <label>Tram or bus lane
                      <input type="checkbox" checked={f.tram} onChange={(e) => setFact("tram", e.target.checked)} />
                    </label>
                    {!w.readError && <button className="link" style={{ alignSelf: "flex-start" }} onClick={() => setEdit(false)}>Done</button>}
                  </>
                )}
              </>
            )}
          </div>
          <button className="link" onClick={onBack}>← Use another photo</button>
        </aside>

        <div>
          <h2 className="q">How much room for cars?</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>Each step already settles lanes, parking and bikes.</p>
          <div className="radios" role="radiogroup" aria-label="How much room for cars?">
            {CARS.map((c) => (
              <button key={c.id} role="radio" aria-checked={w.cars === c.id} className="radio" onClick={() => setW((p) => ({ ...p, cars: c.id }))}>
                <span className="step">{c.step}</span><strong>{c.title}</strong><span>{c.desc}</span><span className="muted">{c.incl}</span>
              </button>
            ))}
          </div>

          <h2 className="q">What would you love to see?</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>We picked a few that suit your street. Add or remove what you like.</p>
          {ORDER[type].map((key) => {
            const c = CATEGORIES.find((x) => x.key === key)!;
            const items = [...c.items].sort((a, b) => Number(b.t.includes(type)) - Number(a.t.includes(type)));
            const isOpen = openCats.includes(key);
            const chosen = items.filter((i) => w.picks.includes(i.id)).length;
            return (
              <div className="cat" key={key} data-open={isOpen}>
                <button aria-expanded={isOpen} aria-controls={`cat-${key}`} onClick={() => setOpen(isOpen ? openCats.filter((k) => k !== key) : [...openCats, key])}>
                  <span className="ico" style={{ background: c.color }}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={c.icon} /></svg></span>
                  <span className="name">{c.name}</span>
                  <span className="sum">{chosen ? `${chosen} chosen` : `${items.length} ${items.length === 1 ? "idea" : "ideas"}`}</span>
                  <svg className="chev" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {isOpen && (
                  <div className="items" id={`cat-${key}`}>
                    {items.map((it) => {
                      const on = w.picks.includes(it.id);
                      return (
                        <div className="row" key={it.id}>
                          <button className="opt" aria-pressed={on} onClick={() => toggle(it.id)}><span className="box">{on ? "✓" : ""}</span>{it.title}</button>
                          <button className="info" aria-label={`More about ${it.title}`} onClick={() => setPeek(it.id)}>ⓘ</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <label className="field" style={{ marginTop: 24 }}>Something else you’d like to see?
            <textarea rows={2} maxLength={240} value={w.other} onChange={(e) => setW((p) => ({ ...p, other: e.target.value }))} placeholder="e.g. a water fountain, more flowers" />
          </label>
        </div>
      </main>

      <div className="bar">
        <div className="wrap">
          <div><div className="count">{count} {count === 1 ? "change" : "changes"} chosen</div><div className="muted">Ready in about {minutes} {minutes === 1 ? "minute" : "minutes"}</div></div>
          <button className="btn" onClick={onMake} disabled={!f}>{f ? "Show my street →" : "Reading your photo…"}</button>
        </div>
      </div>

      {peek && (
        <div className="overlay" onClick={() => setPeek(null)}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="peek-t" onClick={(e) => e.stopPropagation()}>
            <h3 id="peek-t">{ITEM[peek].title}</h3>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>{ITEM[peek].desc}</p>
            <div className="actions">
              <button className="btn" onClick={() => { toggle(peek); setPeek(null); }}>{w.picks.includes(peek) ? "✓ In my street — remove" : "Add to my street"}</button>
              <button className="btn ghost" onClick={() => setPeek(null)}>Back to the list</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
