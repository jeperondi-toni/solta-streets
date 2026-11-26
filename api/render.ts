// POST /api/render — runs ONE step of the render plan.
// Body: { facts, choices, step, image, reference? }
//   step 0 → image is the user's photo
//   step n → image is the previous result, reference is the original photo
// Returns { image, steps } (steps = how many steps the plan has).
// Prompts are built here on the server from the choices, never sent by the client.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildPlan, ELEMENT_IDS, type Choices } from "../lib/plan.js";
import { SYSTEM, type Facts } from "../lib/prompts.js";
import { callGemini, IMAGE_MODEL, splitDataUrl, UpstreamError } from "../lib/gemini.js";

export const config = { maxDuration: 60 };

const MAX_B64 = 4_300_000; // two images must stay under Vercel's ~4.5 MB body limit

function parseFacts(f: any): Facts {
  return {
    type: f?.type === "high" ? "high" : "residential",
    parking: f?.parking === "parallel" || f?.parking === "angled" ? f.parking : false,
    trees: ["both", "left", "right"].includes(f?.treeSide),
    treeSide: ["both", "left", "right"].includes(f?.treeSide) ? f.treeSide : "none",
    tram: !!f?.tram,
    desc: typeof f?.desc === "string" ? f.desc.replace(/[`<>{}]/g, "").slice(0, 300) : "",
  };
}

function parseChoices(c: any): Choices {
  return {
    cars: c?.cars === "keep" || c?.cars === "calm" ? c.cars : "carfree",
    bikes: ["none", "painted", "protected", "path", "nopath"].includes(c?.bikes) ? c.bikes : undefined,
    elements: Array.isArray(c?.elements) ? c.elements.filter((e: string) => (ELEMENT_IDS as string[]).includes(e)).slice(0, 15) : [],
    other: typeof c?.other === "string" ? c.other : "",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const { facts, choices, step = 0, image, reference } = (req.body ?? {}) as any;
  if (typeof image !== "string" || !image) return res.status(400).json({ error: "image is required" });
  if (image.length + (reference?.length ?? 0) > MAX_B64) return res.status(413).json({ error: "Images are too large" });

  const plan = buildPlan(parseFacts(facts), parseChoices(choices));
  const s = plan[Number(step)];
  if (!s) return res.status(400).json({ error: `No step ${step}; the plan has ${plan.length}` });
  if (s.withReference && typeof reference !== "string") return res.status(400).json({ error: "reference photo is required from step 2 on" });

  const parts: any[] = [{ inlineData: splitDataUrl(image) }];
  if (s.withReference) parts.push({ inlineData: splitDataUrl(reference) });
  parts.push({ text: s.prompt });

  try {
    const result = await callGemini(IMAGE_MODEL, {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"], temperature: 0.2 },
    });
    const out = (result?.candidates?.[0]?.content?.parts ?? []) as any[];
    const img = out.map((p) => p.inlineData ?? p.inline_data).find((d) => d?.data);
    if (!img) {
      const note = out.map((p) => p.text).filter(Boolean).join(" ").slice(0, 300);
      return res.status(502).json({ error: "No image was returned", detail: note || result?.candidates?.[0]?.finishReason || "No explanation given." });
    }
    return res.status(200).json({ image: `data:${img.mimeType ?? img.mime_type ?? "image/png"};base64,${img.data}`, steps: plan.length });
  } catch (e) {
    if (e instanceof UpstreamError) return res.status(e.status).json({ error: e.message, detail: e.detail });
    console.error("render failed", e);
    return res.status(500).json({ error: "Image generation failed", detail: String((e as Error)?.message ?? e) });
  }
}
