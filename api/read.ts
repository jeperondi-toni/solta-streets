// POST /api/read — the hidden reading of the photo.
// Body: { image }. Returns { facts } with what the render prompts need.
// The user confirms or changes these on the choices page.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { callGemini, READ_MODEL, splitDataUrl, UpstreamError } from "../lib/gemini.js";

export const config = { maxDuration: 30 };

const PROMPT = `You look at one photo of a street, taken from the sidewalk looking along it.
Describe only what you can see. Answer in JSON with these fields:
- isStreet: true if this is a photo of a street outdoors, false otherwise.
- type: "high" if there are shops, cafés or businesses on the ground floors along the street, otherwise "residential".
- parking: "none" if no cars are parked along the street, "parallel" if cars park lengthwise along the kerb, "angled" if they park at an angle or perpendicular.
- parkSide: if cars are parked, on which side: "both", "left" or "right" (as seen in the photo); "both" if none.
- treeSide: where trees stand in the sidewalks: "both", "left", "right" or "none" (left and right as seen in the photo).
- tram: true if tram tracks, overhead tram wires or a bus lane run along the street.
- desc: one plain sentence describing the street (buildings, lanes, sidewalks, parking, trees), at most 30 words, no opinions.`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    isStreet: { type: "BOOLEAN" },
    type: { type: "STRING", enum: ["high", "residential"] },
    parking: { type: "STRING", enum: ["none", "parallel", "angled"] },
    parkSide: { type: "STRING", enum: ["both", "left", "right"] },
    treeSide: { type: "STRING", enum: ["both", "left", "right", "none"] },
    tram: { type: "BOOLEAN" },
    desc: { type: "STRING" },
  },
  required: ["isStreet", "type", "parking", "parkSide", "treeSide", "tram", "desc"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const { image } = (req.body ?? {}) as { image?: string };
  if (!image) return res.status(400).json({ error: "image is required" });
  try {
    const r = await callGemini(READ_MODEL, {
      contents: [{ parts: [{ inlineData: splitDataUrl(image) }, { text: PROMPT }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0 },
    });
    const text = r?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
    const facts = JSON.parse(text);
    return res.status(200).json({ facts });
  } catch (e) {
    if (e instanceof UpstreamError) return res.status(e.status).json({ error: e.message, detail: e.detail });
    return res.status(502).json({ error: "Could not read the photo", detail: String((e as Error)?.message ?? e) });
  }
}
