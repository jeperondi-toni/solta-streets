// Turns what the user chose into the list of render steps.
//
// Step 1 always renders the "How much room for cars?" answer on the photo.
// The other choices follow in groups of up to 3, each on the previous result,
// with the original photo sent as reference (attention budget: max 4 changes
// per render). Rules: claude/MOBILITY_RENDER_RULES.md (Hidalgo project).

import { ELEMENTS as CALIBRATED, ENDING, scenarioPrompts, type Facts } from "./prompts.js";
import { EXTRA } from "./extra.js";
import { bikeLanes, carfreeNoPath } from "./bikes.js";

// Calibrated rules win over first drafts when both exist.
const ELEMENTS = { ...EXTRA, ...CALIBRATED } as Record<string, any>;

export type Cars = "keep" | "calm" | "carfree";
export type ElementId = string;
export type Bikes = "none" | "painted" | "protected" | "path" | "nopath";

export interface Choices {
  cars: Cars;
  bikes?: Bikes;
  elements: ElementId[];
  other?: string; // "Something else you'd like to see?" free text
}

export interface Step {
  prompt: string;
  withReference: boolean; // true from step 2 on: the original photo goes along
}

export const ELEMENT_IDS = Object.keys(ELEMENTS);
const GROUP = 3;

const clean = (t: string) => t.replace(/[`<>{}]/g, "").replace(/\s+/g, " ").trim().slice(0, 240);

export function buildPlan(facts: Facts, choices: Choices): Step[] {
  const sc = scenarioPrompts(facts);
  const carfree = choices.bikes === "nopath" ? sc.intro + carfreeNoPath(sc.s3) : sc.carfree;
  const first = { keep: sc.keep, calm: sc.calm, carfree }[choices.cars];
  const steps: Step[] = [{ prompt: first + ENDING, withReference: false }];
  // Bike lanes only go with "Same traffic", as their own step right after it.
  if (choices.cars === "keep" && (choices.bikes === "painted" || choices.bikes === "protected")) {
    steps.push({ prompt: bikeLanes(facts, choices.bikes, sc.keepInfra, sc.keepClear) + ENDING, withReference: true });
  }

  const els = choices.elements.filter((e) => e in ELEMENTS);
  const other = choices.other ? clean(choices.other) : "";
  const groups: { ids: ElementId[]; other?: string }[] = [];
  for (let i = 0; i < els.length; i += GROUP) groups.push({ ids: els.slice(i, i + GROUP) });
  if (other) {
    const last = groups[groups.length - 1];
    if (last && last.ids.length < GROUP) last.other = other;
    else groups.push({ ids: [], other });
  }

  // "Same traffic" keeps the street as it is, so elements use their stand-alone
  // wording; Slow street and Car-free have widened sidewalks to place them on.
  const wording = (id: ElementId) => {
    const el = ELEMENTS[id];
    return choices.cars === "keep" ? el.alone(facts) : el.after(facts);
  };

  for (const g of groups) {
    const lines = g.ids.map((id, i) => `${i + 1}. ${wording(id)}`);
    if (g.other) lines.push(`${lines.length + 1}. The person also asked for: "${g.other}". Add it only if it fits the street and these rules; keep it small and realistic.`);
    const zones = g.ids.map((id) => `- ${(ELEMENTS[id] as any).zone}`).join("\n");
    const prompt = `You receive two images. IMAGE 1 is the street after earlier rounds of changes. IMAGE 2 is the original photo, for reference only: use it to check that the buildings, the street width and the existing trees are unchanged. Edit IMAGE 1 only.

KEEP: everything already changed in IMAGE 1 stays exactly as it is: the lane, its paving, the parking, the rain gardens, the crossing, the widened sidewalks and anything added before.

FIX FIRST: compare with IMAGE 2. If IMAGE 1 has a tree, planter, rain garden or bump-out in front of a garage door, gate or driveway that you can see in IMAGE 2, remove it and continue the paved sidewalk there, so the access is open again.

CHANGES TO MAKE:
${lines.join("\n")}

ZONES:
${zones}${zones ? "\n" : ""}- Everything else exactly as in IMAGE 1.${sc.keepInfra}${sc.keepClear}`;
    steps.push({ prompt: prompt + ENDING, withReference: true });
  }
  return steps;
}
