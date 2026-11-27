import { useEffect, useState } from "react";
import { readStreet, renderStep, type Facts } from "./api";
import { toJpeg } from "./image";
import { defaultPicks, type Bikes, type Cars } from "./options";
import Home from "./screens/Home";
import Choose from "./screens/Choose";
import Making from "./screens/Making";
import Result from "./screens/Result";
import Menu from "./screens/Menu";

export type Screen = "home" | "choose" | "making" | "result";

export interface Version { image: string; cars: Cars; bikes: Bikes; picks: string[]; other: string }

export interface Work {
  photo: string;          // the user's photo, resized JPEG data URL
  street: string;         // "Which street?"
  facts: Facts | null;    // hidden reading, confirmed on the choices page
  readError: string;
  cars: Cars;
  bikes: Bikes;
  picks: string[];
  other: string;
  result: string;         // final image shown
  versions: Version[];    // every render of this photo, newest last
  shown: number;          // which version is on screen
}

const EMPTY: Work = { photo: "", street: "", facts: null, readError: "", cars: "carfree", bikes: "path", picks: [], other: "", result: "", versions: [], shown: -1 };
const FALLBACK: Facts = { type: "residential", parking: "parallel", parkSide: "both", treeSide: "both", tram: false, desc: "" };

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [menu, setMenu] = useState<string | null>(null);
  const [w, setW] = useState<Work>(EMPTY);
  const [progress, setProgress] = useState({ step: 0, steps: 1, error: "" });

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const start = (photo: string, street: string) => {
    setW({ ...EMPTY, photo, street, facts: null });
    setScreen("choose");
    readStreet(photo)
      .then((facts) => setW((p) => p.photo !== photo ? p : { ...p, facts: { ...FALLBACK, ...facts }, picks: defaultPicks(facts.type ?? "residential") }))
      .catch((e) => setW((p) => p.photo !== photo ? p : { ...p, facts: FALLBACK, picks: defaultPicks("residential"), readError: String(e.message ?? e) }));
  };

  const make = async () => {
    if (!w.facts) return;
    setScreen("making");
    setProgress({ step: 0, steps: 1, error: "" });
    const choices = { cars: w.cars, bikes: w.bikes, elements: w.picks, other: w.other };
    try {
      let r = await renderStep(w.facts, choices, 0, w.photo);
      let image = r.image;
      const steps = r.steps;
      setProgress({ step: 1, steps, error: "" });
      for (let s = 1; s < steps; s++) {
        r = await renderStep(w.facts, choices, s, await toJpeg(image), w.photo);
        image = r.image;
        setProgress({ step: s + 1, steps, error: "" });
      }
      setW((p) => ({ ...p, result: image, shown: p.versions.length, versions: [...p.versions, { image, cars: p.cars, bikes: p.bikes, picks: p.picks, other: p.other }] }));
      setScreen("result");
    } catch (e) {
      setProgress((p) => ({ ...p, error: String((e as Error).message ?? e) }));
    }
  };

  return (
    <>
      {screen === "home" && <Home onStart={start} openMenu={setMenu} />}
      {screen === "choose" && <Choose w={w} setW={setW} onMake={make} onBack={() => setScreen("home")} openMenu={setMenu} />}
      {screen === "making" && <Making photo={w.photo} progress={progress} onRetry={make} onBack={() => setScreen("choose")} openMenu={setMenu} />}
      {screen === "result" && <Result w={w} onShow={(i) => setW((p) => { const v = p.versions[i]; return { ...p, shown: i, result: v.image, cars: v.cars, bikes: v.bikes, picks: v.picks, other: v.other }; })} onChange={() => setScreen("choose")} onAnother={() => { setW(EMPTY); setScreen("home"); }} openMenu={setMenu} />}
      {menu !== null && <Menu page={menu} setPage={setMenu} onClose={() => setMenu(null)} />}
    </>
  );
}
