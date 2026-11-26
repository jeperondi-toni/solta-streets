// Bike lanes for "Same traffic" (a second step on its result) and the
// car-free variant without a bike path. Ported from the test page (26 Nov, testing).
/* eslint-disable */
// @ts-nocheck

export function bikeLanes(o, kind, keepInfra, keepClear) {
  return `You receive two images. IMAGE 1 is the street after a first round of changes. IMAGE 2 is the original photo, for reference only: use it to check that the buildings, the street width and the existing trees are unchanged. Edit IMAGE 1 only.

KEEP: everything already changed in IMAGE 1 stays exactly as it is: the sidewalks, the rain gardens, the crossings and the parking groups.

CHANGES TO MAKE:
${kind === "painted"
  ? `1. Painted bike lanes: on BOTH sides of the road, a one-way bike lane about 1.5 m wide, on the road surface, in red-brown asphalt with small white bike symbols, separated from the car lane by a solid white line.${o.parking ? " Where cars are parked, the bike lane runs between the car lane and the parked cars, with a 0.5 m hatched white strip next to the parked cars so opening doors do not hit cyclists." : " It runs along the kerb."}
2. Make room by narrowing the car lanes. NEVER take width from the sidewalks, the trees, the rain gardens or the parking. If the road is too narrow for two car lanes and two bike lanes, keep ONE car lane (one-way traffic) and remove the centre line.`
  : `1. Protected bike lanes: on BOTH sides of the road, a one-way bike lane about 2 m wide, on the road surface, in red-brown asphalt, right next to the kerb.${o.parking ? " The parked cars move out to the car side of the bike lane, so the cars protect the cyclists; between the parked cars and the bike lane, a raised concrete strip 0.6 m wide." : " Between the bike lane and the car lane, a raised concrete kerb island 0.5 m wide with low planting."}
2. Make room by narrowing the car lanes. NEVER take width from the sidewalks, the trees or the rain gardens; the bike lane is always on the road, never on the sidewalk and never between or over the trees. If the road is too narrow, keep ONE car lane (one-way traffic) and remove the centre line.`}

ZONES:
- LEFT and RIGHT, on the road along the kerbs: the bike lanes, full visible length, smaller with perspective.
- CENTRE: the narrower car lane or lanes.
- Sidewalks, buildings and existing trees exactly as in IMAGE 1.${keepInfra}${keepClear}`;
}

export function carfreeNoPath(s3) {
  return s3
    .replace(/3\. One quiet bike path down the middle:[^\n]*/, "3. No bike path: the whole level surface is for people walking, with no lines, symbols or differently coloured strips.")
    .replace(/- CENTRE: the darker grey bike path[^\n]*\n/, "");
}
