// ─────────────────────────────────────────────────────────────────────────────
// Street View fetch — same as Transform Your School Street (api/streetview.ts there).
//
// Receives an address, checks whether Google Street View has imagery,
// and returns the photo as a base64 JPEG. The image is resized to 1200×800 px
// — wide enough for a good render, small enough to stay under the 413 limit
// that the generate endpoint enforces.
//
// Camera heading is calculated to look ALONG the street (lateral view) rather
// than directly at the school facade:
//   1. Geocode the address to get the school's lat/lng.
//   2. Compute the compass bearing from the Street View pano to the school
//      (= "facing the school" heading).
//   3. Rotate 90° → the camera looks down the street, showing cars and kerbs.
//
// Requires GOOGLE_MAPS_API_KEY in Vercel environment variables.
// Enable these APIs in Google Cloud Console:
//   - Street View Static API
//   - Geocoding API
// ─────────────────────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { maxDuration: 20 };

const IMAGE_W = 1200;
const IMAGE_H = 800;

/** Compass bearing (0–360) from point A to point B. */
function bearingTo(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(lng2 - lng1);
  const lat1r = toRad(lat1);
  const lat2r = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void | VercelResponse> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GOOGLE_MAPS_API_KEY is not set on the server" });
    return;
  }

  const body = (req.body ?? {}) as { address?: string; turn?: number };
  const { address } = body;
  // turn: extra degrees chosen by the user ("Turn the view"), 0 / 90 / 180 / 270.
  const turn = [0, 90, 180, 270].includes(Number(body.turn)) ? Number(body.turn) : 0;

  if (!address || address.trim().length < 3) {
    res.status(400).json({ error: "address is required" });
    return;
  }

  const location = encodeURIComponent(address.trim());

  // ── Step 1: Street View metadata — does imagery exist here? ──────────────
  const metaUrl =
    `https://maps.googleapis.com/maps/api/streetview/metadata` +
    `?location=${location}&key=${apiKey}&source=outdoor`;

  const metaRes = await fetch(metaUrl);
  if (!metaRes.ok) {
    res.status(502).json({ error: "Could not reach Google Street View." });
    return;
  }

  const meta = await metaRes.json();

  if (meta.status !== "OK") {
    res.status(200).json({
      found: false,
      message:
        "No Street View imagery found for this address. Try uploading a photo of the street instead.",
    });
    return;
  }

  // Use the exact pano location returned by metadata.
  const panoId: string | undefined = meta.pano_id;
  const panoLat: number | undefined = meta.location?.lat;
  const panoLng: number | undefined = meta.location?.lng;

  const locationParam = panoId
    ? `pano=${encodeURIComponent(panoId)}`
    : `location=${location}`;

  // ── Step 2: geocode the address to get the school's exact lat/lng ─────────
  // We use this to compute the bearing from the pano to the school, then
  // rotate 90° so the camera looks along the street instead of at the facade.
  let heading: number | undefined;

  if (panoLat !== undefined && panoLng !== undefined) {
    try {
      const geocodeUrl =
        `https://maps.googleapis.com/maps/api/geocode/json` +
        `?address=${location}&key=${apiKey}`;
      const geoRes = await fetch(geocodeUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const schoolLoc = geoData.results?.[0]?.geometry?.location;
        if (schoolLoc) {
          // Bearing from pano → school = "facing the facade".
          // Adding 90° rotates the camera to look along the street.
          const facingSchool = bearingTo(panoLat, panoLng, schoolLoc.lat, schoolLoc.lng);
          heading = (facingSchool + 90) % 360;
        }
      }
    } catch {
      // Geocoding failed — fall back to default heading (facing the address).
    }
  }

  // ── Step 3: fetch the Street View image ───────────────────────────────────
  // fov=90  — natural street-level field of view.
  // pitch=0 — camera stays horizontal.
  // source=outdoor — avoids indoor panoramas.
  const finalHeading = heading !== undefined ? (heading + turn) % 360 : (turn ? turn : undefined);
  const headingParam = finalHeading !== undefined ? `&heading=${Math.round(finalHeading)}` : "";

  const imageUrl =
    `https://maps.googleapis.com/maps/api/streetview` +
    `?${locationParam}` +
    `&size=${IMAGE_W}x${IMAGE_H}` +
    `&fov=90&pitch=0&source=outdoor` +
    headingParam +
    `&key=${apiKey}`;

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    res.status(502).json({ error: `Street View image returned ${imgRes.status}` });
    return;
  }

  const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";

  if (!contentType.startsWith("image/")) {
    res.status(200).json({
      found: false,
      message: "No Street View imagery found. Try uploading a photo instead.",
    });
    return;
  }

  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  res.status(200).json({
    found: true,
    image: `data:${contentType};base64,${base64}`,
    location: meta.location,
  });
}
