// Small Gemini REST helper used by the API routes.

export const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
export const READ_MODEL = "gemini-3.5-flash-lite";

const url = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export function splitDataUrl(b64: string, fallback = "image/jpeg") {
  const m = /^data:([^;]+);base64,(.*)$/.exec(b64);
  return m ? { mimeType: m[1], data: m[2] } : { mimeType: fallback, data: b64 };
}

export class UpstreamError extends Error {
  constructor(public status: number, message: string, public detail = "") { super(message); }
}

export async function callGemini(model: string, body: unknown) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new UpstreamError(500, "GEMINI_API_KEY is not set on the server");
  const r = await fetch(url(model), {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const detail = (await r.text()).slice(0, 400);
    throw new UpstreamError(502, `Image service returned ${r.status}`, detail);
  }
  return r.json() as Promise<any>;
}
