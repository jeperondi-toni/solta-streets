// POST /api/chorus — hands the before/after image to Chorus.
// Body: { image, title }. Stages the image in Chorus and returns the link where
// the person confirms their email to open their feedback page.
// Needs CHORUS_URL (e.g. https://chorus.solta.city) and, on the Chorus side,
// the /?claim=<id> page (see README).

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { splitDataUrl } from "../lib/gemini.js";

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const base = process.env.CHORUS_URL?.replace(/\/$/, "");
  if (!base) return res.status(501).json({ error: "CHORUS_URL is not set on the server" });
  const { image, title } = (req.body ?? {}) as { image?: string; title?: string };
  if (!image) return res.status(400).json({ error: "image is required" });
  const { mimeType, data } = splitDataUrl(image);
  try {
    const r = await fetch(`${base}/api/stage-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: data, mimeType, title }),
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok || !j.pending_id) return res.status(502).json({ error: `Chorus returned ${r.status}`, detail: j.error ?? "" });
    return res.status(200).json({ url: `${base}/?claim=${encodeURIComponent(j.pending_id)}` });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach Chorus", detail: String((e as Error)?.message ?? e) });
  }
}
