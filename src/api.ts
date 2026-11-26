// Calls to our own API routes. Every error shows the real reason (status + message).

export interface Facts {
  type: "residential" | "high";
  parking: "none" | "parallel" | "angled";
  treeSide: "both" | "left" | "right" | "none";
  tram: boolean;
  desc: string;
  isStreet?: boolean;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch (e) {
    throw new Error(`Could not reach the server: ${(e as Error).message}`);
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} · ${j.error ?? r.statusText}${j.detail ? ` — ${j.detail}` : ""}`);
  return j as T;
}

export const readStreet = (image: string) => post<{ facts: Facts }>("/api/read", { image }).then((r) => r.facts);

export function renderStep(facts: Facts, choices: { cars: string; bikes: string; elements: string[]; other: string }, step: number, image: string, reference?: string) {
  const f = { ...facts, parking: facts.parking === "none" ? false : facts.parking };
  return post<{ image: string; steps: number }>("/api/render", { facts: f, choices, step, image, reference });
}

export const sendToChorus = (image: string, title: string) => post<{ url: string }>("/api/chorus", { image, title });

export const streetView = (address: string, turn = 0) =>
  post<{ found: boolean; image?: string; message?: string }>("/api/streetview", { address, turn });
