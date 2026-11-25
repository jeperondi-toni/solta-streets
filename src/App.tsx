import { useEffect, useState } from "react";
import { readStreet, renderStep, type Facts } from "./api";
import { toJpeg } from "./image";
import { defaultPicks, type Cars } from "./options";
import Home from "./screens/Home";
import Choose from "./screens/Choose";
import Making from "./screens/Making";
import Result from "./screens/Result";
import Menu from "./screens/Menu";

export type Screen = "home" | "choose" | "making" | "result";

export interface Work {
  photo: string;          // the user's photo, resized JPEG data URL
  street: string;         // "Which street?"
  facts: Facts | null;    // hidden reading, confirmed on the choices page
  readError: string;
  cars: Cars;
  picks: string[];
  other: string;
  result: string;         // final image
}

const EMPTY: Work = { photo: "", street: "", facts: null, readError: "", cars: "carfree", picks: [], other: "", result: "" };
const FALLBACK: Facts = { type: "residential", parking: "parallel", treeSide: "both", tram: false, desc: "" };

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
    const choices = { cars: w.cars, elements: w.picks, other: w.other };
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
      setW((p) => ({ ...p, result: image }));
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
      {screen === "result" && <Result w={w} onChange={() => setScreen("choose")} onAnother={() => { setW(EMPTY); setScreen("home"); }} openMenu={setMenu} />}
      {menu !== null && <Menu page={menu} setPage={setMenu} onClose={() => setMenu(null)} />}
    </>
  );
}
