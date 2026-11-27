// Render prompts for the street tool. Ported from the calibrated test page
// (solta repo, branch mobility-test-round1, public/mobility-test/index.html).
// Rules and their reasons: claude/MOBILITY_RENDER_RULES.md in the Hidalgo project.
// Change rules on the test page first, test, then port here.
/* eslint-disable */
// @ts-nocheck

export const SYSTEM = `You are a PHOTO EDITOR, not an image generator. You receive a real street photo
and a short list of changes. Apply ONLY the listed changes. Everything else in the
photo stays identical: buildings, facades, shop fronts, windows, signs, sky, the
existing trees and their exact positions, street lamps, poles and wires. Never add
buildings or structures. The result must look like the same photograph, taken
with the same camera, in the same light.`;

export const ENDING = `

DO NOT ADD: cars, vans, scooters, cyclists, new people, text, logos, signs with
words, fences, walls, new buildings.

CRITICAL GEOMETRY RULES — NON-NEGOTIABLE:
Street width must stay EXACTLY the same as the original photo.
Building positions, heights and facades must not change.
The existing trees stay exactly where they are, with the same size and shape.
Perspective and camera angle must stay identical.
Photorealistic, same light, shadows and weather as the original photo.`;

export type Facts = { type: 'high' | 'residential'; parking: false | 'parallel' | 'angled'; trees: boolean; treeSide: 'both' | 'left' | 'right' | 'none'; tram: boolean; desc?: string };

export function scenarioPrompts(o: Facts) {
  const high = o.type === "high";
  const intro = (o.desc ? o.desc.trim() : `This is a ${high ? "high street with shops at street level" : "residential street with homes"}${o.parking === "angled" ? " and angled parking along the street" : o.parking ? " and cars parked along the kerb" : ""}${o.treeSide === "both" ? ", with trees in both sidewalks" : o.trees ? `, with trees only in the ${o.treeSide} sidewalk` : ", with no trees"}.`) + (o.tram ? " A tram or bus line runs along it." : "") + "\n\n";
  const keepInfra = o.tram ? "\n- The tram tracks, overhead wires, poles and stops stay EXACTLY as they are. Nothing is placed on the tracks." : "";
  const treeBed = "a small planted bed around its base, about 1.5 m by 1.5 m, with low foliage (ferns, grasses, ground cover), edged with a low kerb. The tree itself stays exactly as it is";
  const trees = o.trees ? `\n4. Every existing tree stays in its exact place, now standing in the level paving with ${treeBed}.` : "";
  const treeStep = (n) => o.trees ? `\n${n}. Every existing tree gets ${treeBed}.` : "";
  const keepClear = "\n\nPARKED CARS: every parked car that stays must be able to drive out: nothing (planting, bump-out, bench, planter, kerb) between it and the traffic lane, and its space stays as long as the car. Where a bump-out, crossing or garden would block or touch a parked car, remove that car instead.\n\nSURFACES: never add asphalt. Wherever the photo shows cobblestones, setts or pavers (on the road, the parking strip or the sidewalks), they stay pavers. A surface can only change to another paver, never to asphalt or concrete.\n\nKEEP CLEAR: look for garage doors, gates and driveway entrances along the street. In front of each one, keep a free strip at least 3 m wide from the building to the road, with nothing on it: no tree, planter, rain garden, bump-out, bench, bike rack or parked car. The access stays open and paved, with its dropped kerb, exactly as in the photo.";
  const angled = o.parking === "angled";
  const s1 = o.parking
    ? `CHANGES TO MAKE:
1. Traffic stays as it is: keep the traffic lanes and their markings.
2. Fewer parked cars, in small groups: ${angled ? "the angled parking becomes parallel parking, cars parked lengthwise in one row along the kerb. " : ""}Along BOTH kerbs, keep the parked cars only in short groups of 2 or 3 cars. Between groups, alternately one zebra crossing or one small rain garden bump-out about 5 m long (low grasses and shrubs, edged with a low granite kerb). Remove the cars where a crossing or bump-out goes.
3. ${angled ? "The space freed by the change to parallel parking becomes sidewalk: move the kerb out to the edge of the parking row, exactly the same stone, colour and pattern as the existing sidewalk, as if it had always been one sidewalk, with no visible seam. " : ""}The parking strip is paved in red-brown brick pavers instead of asphalt.${treeStep(4)}

ZONES:
- CENTRE: the traffic lanes, unchanged.
- LEFT and RIGHT, along the kerbs: groups of 2 or 3 parked cars, then a crossing or a rain garden, repeating down the street, smaller with perspective.${angled ? " The widened sidewalks behind them." : ""}
- Buildings and the far end of the street unchanged.${keepInfra}${keepClear}`
    : high
    ? `CHANGES TO MAKE:
1. Traffic stays as it is: keep the lanes and markings.
2. Loading bay: along the LEFT kerb, in the foreground, one marked loading bay about 12 m long with a white dashed outline on the road. The bay is empty.
3. Rain gardens: along the edge of both sidewalks, right next to the kerb, low planted beds about 1.2 m wide and 5 m long with grasses and shrubs, separating the sidewalk from the road, with open gaps between them to step through.${treeStep(4)}

ZONES:
- LEFT: the loading bay on the road next to the kerb, foreground only.
- LEFT and RIGHT: the rain gardens along the kerb edge; the rest of each sidewalk stays open for walking.
- Everything else unchanged.${keepInfra}${keepClear}`
    : `CHANGES TO MAKE:
1. Traffic stays as it is.
2. Rain gardens: along the edge of both sidewalks, right next to the kerb, low planted beds about 1.2 m wide and 5 m long with grasses and shrubs, separating the sidewalk from the road, with open gaps between them to step through.${treeStep(3)}

ZONES:
- LEFT and RIGHT: the rain gardens along the kerb edge; the rest of each sidewalk stays open for walking.
- Everything else unchanged.${keepInfra}${keepClear}`;
  // Slow street (Jess, 27 Nov): parking on ONE side only, the other sidewalk much wider,
  // never planting along the side of a parked car.
  const L = o.treeSide === "right" ? "RIGHT" : "LEFT";
  const W = L === "LEFT" ? "RIGHT" : "LEFT";
  const s2asym = `CHANGES TO MAKE:
1. Slow street, parking on ONE side only: ONE lane, just wide enough for one car (about 3 m), moved next to the ${L} kerb. Its surface becomes red-brown brick pavers instead of asphalt. Remove the white road markings. On the ${L} side only, between the lane and the kerb, a parking strip in red-brown brick pavers for a FEW cars: groups of at most TWO parallel parking spaces, separated by a rain garden bump-out about 5 m long (low granite kerb, low planting). The parked cars stand directly next to the lane, with NOTHING between a car and the lane: no plants, no kerb, no bollards along the side of any car, so every car can drive out.${o.parking ? " Keep only the cars that stand in those spaces; remove all the others." : " The spaces are clearly marked and empty."}
2. The ${W} side has NO parking at all${o.parking ? `: remove every parked car on the ${W} side, along the whole visible stretch` : ""}. The ${W} sidewalk becomes much wider: all the space between the lane and the ${W} buildings becomes sidewalk, at sidewalk height, in exactly the same stone, colour and pattern as the existing sidewalk, as if it had always been one sidewalk, with no visible seam. Use the existing sidewalk paving in the photo as the sample and copy it: never a different, lighter or newer stone.
3. On this wide ${W} sidewalk, along the edge of the lane: a row of rain gardens with a young tree every 8 m and low planting (grasses, shrubs), with gaps to cross. Behind them, a broad open walking area up to the buildings.${o.trees ? " All existing trees stay in their exact place, each with a small planted bed around its base." : ""}
4. In the foreground, a raised crossing: the brick lane rises to sidewalk level for about 4 m, with a pale stone band on each side; no parked car within 5 m of it.

ZONES:
- ${L}: the narrow brick lane with a short parking strip along the ${L} kerb (two spaces, one bump-out, repeating); the ${L} sidewalk keeps its width.
- ${W}: no cars; a very wide sidewalk, clearly wider than the lane, with the row of rain gardens and young trees along the lane and open walking space behind.
- FOREGROUND: the raised crossing.${keepInfra}${keepClear}`;
  const s2 = true ? s2asym : o.parking
    ? `CHANGES TO MAKE:
1. Slow street: narrow the roadway to ONE lane, just wide enough for one car (about 3 m), clearly narrower than today. Its surface becomes red-brown brick pavers instead of asphalt, so it reads as a slow shared street. Remove the white road markings. The parking strip and the kerb move in towards the narrower lane, and the width freed is added to the sidewalks, exactly the same stone, colour and pattern as the existing sidewalks, as if it had always been one sidewalk, with no visible seam. Use the existing sidewalk paving in the photo as the sample and copy it: never a different, lighter or newer stone.
2. Fewer parking spaces, grouped: ${angled ? "the angled parking becomes parallel parking along the kerb. " : ""}On BOTH sides, along the whole visible stretch, alternate TWO parking spaces with ONE rain garden bump-out. The parking spaces stay clearly visible and in use: keep the parked cars that stand in them; remove only the car where a bump-out goes.
3. Each rain garden bump-out sits at the kerb edge, in the parking strip, about 5 m long and as deep as the parking strip, edged with a low granite kerb, with one young tree and low planting (grasses, shrubs). The sidewalk behind it stays open for walking.${o.trees ? " Every existing tree gets the same low planting around its base." : ""}
4. In the foreground, a raised crossing: the brick lane rises to sidewalk level for about 4 m, with a pale stone band on each side.

ZONES:
- CENTRE: the brick lane, full visible length.
- LEFT and RIGHT: the rhythm of two parking spaces, one planted bump-out, smaller with perspective; wider sidewalks behind. Buildings and existing trees in place.
- FOREGROUND: the raised crossing.${keepInfra}${keepClear}`
    : `CHANGES TO MAKE:
1. Slow street: narrow the road to ONE lane in the centre, just wide enough for one car (about 3 m), much narrower than today. Its surface becomes red-brown brick pavers instead of asphalt. Remove the white road markings.
2. The freed asphalt on the LEFT of the lane becomes part of the LEFT sidewalk, at sidewalk height, with the kerb moved out to the edge of the brick lane, in exactly the same stone, colour and pattern as the existing sidewalk, as if it had always been one sidewalk, with no visible seam. Use the existing sidewalk paving in the photo as the sample and copy it: never a different, lighter or newer stone. On the RIGHT of the lane, a parking strip for a few cars: parallel parking spaces in red-brown brick pavers, in groups of TWO spaces separated by a rain garden bump-out (about 5 m, low granite kerb, low planting); the spaces are empty.
3. Rain gardens at the kerb: along the new kerb edge of the widened LEFT sidewalk, low planted beds about 1.5 m wide and 5 m long with grasses and shrubs, forming a green edge between the sidewalk and the lane, with short gaps every few metres to cross. Nothing is planted in the middle of the sidewalk: the rest stays open paving for walking.${o.trees ? " Every existing tree gets the same low planting around its base." : ""}
4. In the foreground, a raised crossing: the brick lane rises to sidewalk level for about 4 m, with a pale stone band on each side.

ZONES:
- CENTRE: the brick lane, empty, full visible length.
- CENTRE: the lane is narrow.
- LEFT: a widened sidewalk, clearly wider than the lane, rain gardens along the kerb edge, open walking space behind them, in the same stone as before.
- RIGHT: the parking strip, two spaces then one bump-out, repeating; the RIGHT sidewalk keeps its width. Buildings and existing trees in place.
- FOREGROUND: the raised crossing.${keepInfra}${keepClear}`;
  const s3 = `CHANGES TO MAKE:
1. Car-free street: remove every car, parked and moving, along the whole visible stretch, including the cars far down the street. Remove all lane markings and parking signs.
2. Make the street ONE LEVEL from facade to facade: remove both kerbs completely. The old roadway and both sidewalks become one flat surface at the same height, paved with the same light grey stone pavers from the buildings on the left to the buildings on the right. No step, no kerb line, no drop anywhere across the street.
3. One quiet bike path down the middle: a two-way path about 2.2 m wide, paved flush in the SAME stone as the rest of the street, only a slightly darker grey, with small white bike symbols painted every 15 m. No red or coloured surface, no kerb, no raised edge. Most of the street width stays for people walking.${o.tram ? " The bike path runs beside the tram tracks, never on them." : ""}${trees}

ZONES:
- CENTRE: the darker grey bike path, full visible length, narrow compared to the walking area, smaller with perspective.
- LEFT and RIGHT: the level walking area, one paving material up to the buildings.
- FAR END OF THE STREET: cars removed, the same level paving continues.${keepInfra}${keepClear}`;
  return { intro, keepInfra, keepClear, s1, s2, s3, keep: intro + s1, calm: intro + s2, carfree: intro + s3 };
}

export const ELEMENTS = {
  play: {
    name: "Something to play on", cat: "People and play",
    zone: "SIDEWALK, mid-distance: a small play spot on the wider side, away from the road edge.",
    alone: (o) => o.parking
      ? `Something to play on: play must be far from cars. Remove ALL parked cars on the RIGHT side of the street, along the whole visible stretch, and turn that parking strip into a play strip at sidewalk level: low wooden logs, stepping stumps of different heights and a low balancing beam, natural wood on a soft surface, nothing taller than 1 m, grouped in the mid-distance. Along its edge with the traffic lane, a continuous low hedge or planted bed about 1 m deep and 60 cm high, so no child can run onto the road. Cars on the LEFT side stay.`
      : `Something to play on: a small informal play spot about 6 m long: low wooden logs, stepping stumps of different heights and a low balancing beam, natural wood on a soft surface flush with the paving, nothing taller than 1 m. Place it along the BUILDING side of the wider sidewalk (not in front of a door, shop entrance or garage), NEVER in the middle of the walking path, never next to the road or a parked car. Between the play spot and the road there is always the walking path AND a low hedge or planted bed about 1 m deep along the kerb. If no sidewalk is wide enough, add nothing.`,
    after: () => `Something to play on: a small informal play spot about 6 m long with low wooden logs, stepping stumps and a balancing beam, natural wood on a soft surface, nothing taller than 1 m, on the widened sidewalk along the BUILDING side (not in front of a door, shop or garage). Never in the middle of the walking path, never next to the lane: the walking path and the rain gardens always lie between the play spot and the lane.`,
  },
  terraces: {
    name: "Terraces", cat: "Business",
    zone: "SIDEWALK in front of cafés and shops: a few small terraces, walking path kept free.",
    alone: () => `Terraces: in front of the cafés and shops at street level, small terraces: 2 or 3 small round tables with simple chairs each, ONLY on the sidewalk, directly against the front of their own shop. NEVER on the road, the parking strip or the bike path, and never at the kerb edge. Keep at least 1.8 m clear walking path between the tables and the kerb. No umbrellas with text, no fences, no platforms. Where there are no cafés or shops, add nothing.`,
    after: () => `Terraces: in front of the cafés and shops at street level, 2 or 3 small round tables with simple chairs, ONLY on the sidewalk directly against the front of their own shop, never on the lane, the parking strip or near the kerb, keeping at least 1.8 m clear walking path. No umbrellas with text, no fences. Where there are no cafés or shops, add nothing.`,
  },
  shade: {
    name: "Shade sails", cat: "Climate",
    zone: "OVERHEAD, mid-distance: light shade sails above a sitting spot.",
    alone: () => `Shade sails: in the mid-distance, above one wide part of the sidewalk, 2 or 3 light triangular shade sails in off-white fabric, stretched between slim steel poles at about 4 m high, overlapping a little, casting soft shade on the paving below. Poles stand at the kerb edge, never in the walking path. Do not attach anything to the buildings.`,
    after: () => `Shade sails: above the widest part of the sidewalk where people sit, 2 or 3 light triangular shade sails in off-white fabric on slim steel poles at about 4 m high, casting soft shade below. Poles at the edge of the lane, never in the walking path.`,
  },
  light: {
    name: "Good lighting", cat: "Safety",
    zone: "SIDEWALKS: a row of new pedestrian lamps, shown by day.",
    alone: () => `Good lighting: along both sidewalks, a row of slim pedestrian street lamps about 4.5 m high, simple dark grey poles with a small round light head, about 15 m apart, at the kerb edge so the walking path stays free. Daylight scene: the lamps are off. Keep the existing tall street lights as they are.`,
    after: () => `Good lighting: along the widened sidewalks, slim pedestrian street lamps about 4.5 m high, dark grey poles with a small round light head, about 15 m apart, next to the rain gardens. Daylight scene: the lamps are off.`,
  },
  mural: {
    name: "Mural", cat: "Art",
    zone: "ONE BLANK WALL: the mural, nothing else on the buildings changes.",
    alone: () => `Mural: choose ONE blank side wall or blank façade without windows that you can see clearly. Paint it with a large colourful abstract mural: soft organic shapes and plants in warm colours (terracotta, ochre, sage green, soft blue), no text, no letters, no faces, no logos. If there is no blank wall without windows, add nothing. Every other wall, window and door stays exactly as it is.`,
    after: () => `Mural: on ONE blank wall without windows, a large colourful abstract mural with soft organic shapes and plants in warm colours, no text, no faces, no logos. If there is no blank wall, add nothing.`,
  },
  stop: {
    name: "A better bus or tram stop", cat: "People and play",
    zone: "THE STOP: shelter, bench and greenery at the existing stop only.",
    alone: () => `A better bus or tram stop: if there is a bus or tram stop in the photo, improve it in its exact place (keep its sign pole and kerb). If there is none, add a new stop on the sidewalk in the mid-distance, at a straight stretch of kerb with room for it, never in front of a garage, gate, driveway, door or shop entrance, and only where 1.5 m stays clear for walking. The stop: a simple glass shelter with a slim dark frame and a green roof planted with sedum, a wooden bench with a backrest inside, a low planted bed beside it, and a slim stop sign pole with a plain blank sign (no text).`,
    after: () => `A better bus or tram stop: improve the existing stop in its place, or if there is none, add one on the widened sidewalk next to the lane, never in front of a garage, gate, driveway, door or shop entrance: a simple glass shelter with a slim dark frame and a green sedum roof, a wooden bench with a backrest inside, a low planted bed beside it, and a slim stop pole with a plain blank sign.`,
  },
  trees: {
    name: "Street trees", cat: "Green",
    zone: "KERB EDGE: new young trees in a regular row, smaller with perspective; none in front of garages, doors or shop entrances.",
    alone: (o) => o.parking
      ? `Street trees: along BOTH kerbs, every third parking space becomes a tree pit: one young street tree (about 6 m tall, slim trunk, light canopy) in a planted bed edged with a low granite kerb, as deep as the parking strip. Remove the car only in those spaces; keep all other parked cars. Trees line up with any existing trees.`
      : `Street trees: along the kerb edge of the sidewalks, a row of young street trees (about 6 m tall, slim trunk, light canopy) about 10 m apart, each in a planted bed about 1.5 m by 1.5 m. Only where the sidewalk stays at least 1.5 m clear for walking beside the tree; otherwise no tree on that side.`,
    after: () => `Street trees: add young street trees (about 6 m tall, slim trunk, light canopy) along the edge of the lane on the widened sidewalks and in the bump-outs, about 10 m apart, each in a planted bed, lined up with the existing trees. Never in front of a garage, door or shop entrance.`,
  },
  bike: {
    name: "Bike parking", cat: "People and play",
    zone: "FOREGROUND, RIGHT: the bike racks.",
    alone: (o) => o.parking
      ? `Bike parking: in the foreground on the RIGHT, one parking space becomes a bike corral: 6 simple steel hoop racks (inverted U shape) in a row, parallel to the kerb, with no bikes in them, inside a painted white outline. Remove the car in that space only.`
      : `Bike parking: in the foreground on the RIGHT, a row of 5 simple steel hoop racks (inverted U shape) along the kerb edge of the sidewalk, parallel to the kerb, with no bikes in them, only if the sidewalk stays at least 1.5 m clear for walking beside them. If it is too narrow, place them on the LEFT sidewalk instead.`,
    after: () => `Bike parking: in the foreground on the RIGHT, a row of 5 simple steel hoop racks (inverted U shape) in a bump-out or on the widened sidewalk next to the lane, parallel to the kerb, with no bikes in them, keeping the walking path clear.`,
  },
  crossing: {
    name: "A safe crossing", cat: "Safety",
    zone: "FOREGROUND: the zebra crossing with its kerb extensions.",
    alone: (o) => `A safe crossing: in the foreground, a zebra crossing across the whole road: broad white stripes on the road surface. It is never placed where a car is parked: remove every parked car on or within 5 m of the crossing on both sides, so people crossing can see and be seen. On both sides, the kerb extends out to the edge of the traffic lane for about 5 m${o.parking ? ", taking the parking space there" : ""}; the kerb at the crossing is dropped flush for wheelchairs and prams, with tactile paving at the edge.`,
    after: () => `A safe crossing: the raised crossing in the foreground gets broad white zebra stripes on it and tactile paving at both edges.`,
  },
  facade: {
    name: "Façade gardens", cat: "Green",
    zone: "BUILDING EDGE, LEFT and RIGHT: the narrow façade gardens directly against the buildings.",
    alone: () => `Façade gardens: only where a façade or wall is bare today, a narrow planted strip about 40 cm wide directly against it, made by lifting one row of sidewalk pavers: climbing plants (roses, clematis, ivy) on the wall up to about first-floor height, low perennials at the base. The strip stops at every door, shop entrance, low window and garage door, which stay free. Walls, fences and hedges that are already green stay exactly as they are. Do not add, remove or move any window, door or opening: a blank wall stays blank, only planted. The rest of the sidewalk stays open for walking.`,
    after: () => `Façade gardens: only where a façade or wall is bare, a narrow planted strip about 40 cm wide directly against it, with climbing plants up to about first-floor height and low perennials at the base. The strip stops at every door, shop entrance, low window and garage door. Walls and hedges that are already green stay as they are. Do not add, remove or move any window, door or opening.`,
  },
  sit: {
    name: "Places to sit", cat: "People and play",
    zone: "SIDEWALKS: benches with their backs to the road, facing the buildings and the walking area, a clear walking path in front of them.",
    // The Good Bench (STIPO, Placemaking Europe, Social Life Project, 2026)
    alone: () => `Places to sit: 3 benches, each about 1.8 m long: warm natural wood slats on a slim dark metal frame, seat at knee height, a slightly reclined backrest, armrests ONLY at the two ends (no dividers in the middle), legs that do not stick out past the seat. Place them on the sidewalk, out of the walking flow, about 20 m apart, with its BACK TO THE ROAD and the seat facing the buildings, the shops or front doors and the walking area, never facing the road or the traffic, and never back-to-back; ideally with a tree or a planted bed behind it. Keep at least 1.5 m clear walking path in front of each bench and an open space beside it for a wheelchair. Where an existing tree stands, place a bench in its shade. If a sidewalk is too narrow for this, put no bench on that side.`,
    after: () => `Places to sit: 4 benches, each about 1.8 m long: warm natural wood slats on a slim dark metal frame, seat at knee height, a slightly reclined backrest, armrests ONLY at the two ends (no dividers in the middle). Place them on the widened sidewalks with their BACKS TO THE LANE and the rain gardens or young trees behind them, the seat facing the buildings and the walking area, never facing the road or the traffic, about 20 m apart; near the foreground, two benches at a right angle to each other so people can talk. Keep at least 1.5 m clear walking path in front of them and an open space beside each one for a wheelchair.`,
  },
  planters: {
    name: "Big planters", cat: "Green",
    zone: "KERB EDGE: a few large planters, evenly spaced, smaller with perspective.",
    alone: (o) => `Big planters: 4 large square planters, about 1.2 m wide and 60 cm high, in dark grey concrete, each with a small multi-stem tree and flowering shrubs. Place them along the kerb edge of the sidewalks, about 10 m apart, keeping at least 1.5 m clear walking path.${o.parking ? " In the foreground on the RIGHT, one parking space becomes two planters side by side; remove the car in that space only." : ""}`,
    after: () => `Big planters: 3 large square planters, about 1.2 m wide and 60 cm high, in dark grey concrete, each with a small multi-stem tree and flowering shrubs, on the widened sidewalks where there is no rain garden, about 10 m apart, keeping at least 1.5 m clear walking path.`,
  },
};
