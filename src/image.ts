// Image helpers that run in the browser.

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error("Could not open this image")); i.src = src; });
}

/** Resize to at most `max` px on the long side and return a JPEG data URL. */
export async function toJpeg(src: string, max = 1600, quality = 0.88): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", quality);
}

export async function fileToJpeg(file: File) {
  const url = URL.createObjectURL(file);
  try { return await toJpeg(url); } finally { URL.revokeObjectURL(url); }
}

/** Today and could-be side by side, with small labels, for sharing. */
export async function sideBySide(before: string, after: string, street: string): Promise<string> {
  const [a, b] = await Promise.all([loadImage(before), loadImage(after)]);
  const h = 900, wa = Math.round(a.width * h / a.height), wb = Math.round(b.width * h / b.height);
  const pad = 24, foot = 84;
  const c = document.createElement("canvas");
  c.width = wa + wb + pad * 3; c.height = h + pad * 2 + foot;
  const x = c.getContext("2d")!;
  x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(a, pad, pad, wa, h); x.drawImage(b, pad * 2 + wa, pad, wb, h);
  const tag = (t: string, left: number) => {
    x.font = "bold 30px Georgia, serif"; const w = x.measureText(t).width + 32;
    x.fillStyle = "#FFFFFF"; x.fillRect(left + 16, pad + 16, w, 50);
    x.fillStyle = "#1A2418"; x.fillText(t, left + 32, pad + 52);
  };
  tag("Today", pad); tag("Could be", pad * 2 + wa);
  x.fillStyle = "#1A2418"; x.font = "bold 34px Georgia, serif";
  x.fillText(street ? `This could be ${street}.` : "This could be our street.", pad, h + pad + 56);
  x.font = "24px Georgia, serif"; x.fillStyle = "#3B4A37";
  const credit = "Solta × STIPO"; x.fillText(credit, c.width - pad - x.measureText(credit).width, h + pad + 56);
  return c.toDataURL("image/jpeg", 0.9);
}
