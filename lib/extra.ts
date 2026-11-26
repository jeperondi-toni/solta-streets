// First-draft render rules for the options that have NOT been calibrated yet
// (added 26 Nov so every option in the option doc can be picked).
// Same structure as ELEMENTS in prompts.ts: alone = on top of "Same traffic",
// after = on top of Slow street / Car-free, zone = where it goes.
// When an option passes the tests, move its rule into the test page and prompts.ts.

type O = { parking: false | "parallel" | "angled"; trees: boolean };

export const EXTRA = {
  raingarden: {
    name: "Rain garden", cat: "Green",
    zone: "KERB EDGE: sunken planted beds along the kerb, gaps to cross.",
    alone: (o: O) => `Rain gardens: along the kerb edge of both sidewalks, sunken planted beds about 1.2 m wide and 6 m long, a little lower than the paving, with grasses, rushes and flowering perennials, edged with a low granite kerb with small openings so street water can flow in. Gaps between them to step through, at least 1.5 m clear walking path behind them.${o.parking ? " Where a bed would touch a parked car, remove that car." : ""}`,
    after: () => `Rain gardens: more sunken planted beds along the edge of the lane, about 1.2 m wide and 6 m long, slightly lower than the paving, with grasses, rushes and flowering perennials and small kerb openings so street water flows in; gaps to step through.`,
  },
  community: {
    name: "Community garden", cat: "Green",
    zone: "WIDER SIDEWALK, mid-distance: a group of raised wooden vegetable beds.",
    alone: (o: O) => `Community garden: in the mid-distance, on the wider sidewalk along the building side${o.parking ? " (or in two parking spaces on the RIGHT, with a low planted edge towards the road; remove those cars only)" : ""}, 3 raised wooden beds about 60 cm high and 2.5 m long with vegetables, herbs and flowers growing, a small wooden tool box and a water butt. Never in front of a door, shop or garage; at least 1.5 m clear walking path.`,
    after: () => `Community garden: on the widened sidewalk, along the building side, 3 raised wooden beds about 60 cm high and 2.5 m long with vegetables, herbs and flowers growing, a small tool box and a water butt; never in front of a door, shop or garage.`,
  },
  greenwalls: {
    name: "Green walls", cat: "Green",
    zone: "ONE OR TWO BLANK WALLS: climbing plants on wires.",
    alone: () => `Green walls: on one or two blank walls without windows, climbing plants (ivy, Virginia creeper, wisteria) growing up on thin steel wires from a narrow planted strip at the foot of the wall, covering the lower two floors. Do not add, remove or move any window, door or opening. If there is no blank wall, add nothing.`,
    after: () => `Green walls: on one or two blank walls without windows, climbing plants on thin steel wires covering the lower two floors, from a narrow planted strip at the foot. Do not change any window or door. If there is no blank wall, add nothing.`,
  },
  permeable: {
    name: "Paving that lets water in", cat: "Climate",
    zone: "PARKING STRIP AND SIDEWALKS: open-joint pavers with green joints.",
    alone: (o: O) => `Paving that lets water in: ${o.parking ? "the parking strip and " : ""}the sidewalks are re-laid in grey concrete pavers with wide open joints, with grass and moss growing in the joints, so rain soaks in. Same layout, same kerb line, same heights as now. The traffic lane stays as it is.`,
    after: () => `Paving that lets water in: the parking spaces and the widened sidewalks get grey pavers with wide open joints, with grass and moss growing in the joints. Same layout and heights.`,
  },
  depave: {
    name: "Less paving, more soil", cat: "Climate",
    zone: "SIDEWALKS: strips of paving taken out and planted.",
    alone: () => `Less paving, more soil: on both sidewalks, take out strips of paving along the kerb and around the existing trees and plant them with low shrubs, grasses and wildflowers in open soil, about 1 m wide, keeping at least 1.5 m clear walking path and every door, shop and garage access open.`,
    after: () => `Less paving, more soil: on the widened sidewalks, take out more strips of paving and plant them with low shrubs, grasses and wildflowers in open soil, keeping 1.5 m clear walking path and every access open.`,
  },
  water: {
    name: "Water to cool down", cat: "Climate",
    zone: "WIDE SPOT, mid-distance: a drinking fountain and flush water jets.",
    alone: () => `Water to cool down: on the widest part of the sidewalk, in the mid-distance, a simple dark steel drinking fountain, and next to it a small square of 6 water jets set flush in the paving, with a thin film of water on the stones. Away from the road edge, never in the walking path.`,
    after: () => `Water to cool down: on the widened sidewalk, a simple dark steel drinking fountain and a small square of 6 water jets set flush in the paving, with a thin film of water on the stones, away from the lane.`,
  },
  sports: {
    name: "Sports in public space", cat: "People and play",
    zone: "WIDE SPOT away from the road: a table-tennis table or fitness bars.",
    alone: (o: O) => `Sports: a grey concrete table-tennis table on the wider sidewalk along the building side${o.parking ? " (or in one parking space on the RIGHT, enclosed by a low planted edge towards the road; remove that car only)" : ""}, with a set of 3 simple steel outdoor fitness bars beside it. Never next to the road without a planted edge, never in front of a door, shop or garage; 1.5 m clear walking path.`,
    after: () => `Sports: on the widened sidewalk along the building side, a grey concrete table-tennis table and 3 simple steel outdoor fitness bars, with the walking path and the rain gardens between them and the lane.`,
  },
  shopsasis: {
    name: "Same shops, fresher fronts", cat: "Business",
    zone: "SHOP FRONTS: small touches only, the architecture unchanged.",
    alone: () => `Same shops, fresher fronts: the shops stay exactly as they are. Add only small touches: plain fabric awnings in muted colours (no text), 2 potted plants beside each shop door, clean shop windows with soft warm light inside. Do not change the architecture, signs, windows or doors.`,
    after: () => `Same shops, fresher fronts: plain fabric awnings in muted colours (no text), potted plants beside each shop door, clean shop windows with soft warm light inside. The architecture stays exactly as it is.`,
  },
  stores: {
    name: "A mix of shops", cat: "Business",
    zone: "EMPTY GROUND FLOORS: open shops with lit windows.",
    alone: () => `A mix of shops: every empty, shuttered or closed ground-floor shopfront becomes an open small shop: shutters up, lit window displays with goods (bread, flowers, books, bike parts), the door open. No signs with text. Shops that are open today stay as they are. If there is no empty shopfront, add nothing.`,
    after: () => `A mix of shops: empty or shuttered ground-floor shopfronts become open small shops with lit window displays (bread, flowers, books, bike parts) and open doors; no text. If there is none, add nothing.`,
  },
  communityuse: {
    name: "Community uses of space", cat: "Business",
    zone: "ONE GROUND FLOOR: a neighbourhood space with open windows.",
    alone: () => `Community use: ONE empty or plain ground-floor unit becomes a neighbourhood space: large clear windows showing a long table, bookshelves and plants inside in warm light, the door open, a wooden bench and two potted trees outside. No text, no new people. If there is no ground-floor unit that fits, add nothing.`,
    after: () => `Community use: ONE empty or plain ground-floor unit becomes a neighbourhood space with clear windows showing a long table, bookshelves and plants in warm light, the door open and a wooden bench outside; no text, no people.`,
  },
  sculptures: {
    name: "A sculpture", cat: "Art",
    zone: "WIDE SPOT, mid-distance: one sculpture, away from the walking path.",
    alone: () => `A sculpture: on the widest part of the sidewalk, in the mid-distance, one playful abstract sculpture about 2.5 m high in painted steel (warm red or ochre), on the paving, out of the walking path and at least 1.5 m from the kerb. No text, no figures of people or animals.`,
    after: () => `A sculpture: on the widened sidewalk, one playful abstract sculpture about 2.5 m high in painted steel (warm red or ochre), out of the walking path. No text, no figures.`,
  },
  artists: {
    name: "Space for street artists", cat: "Art",
    zone: "WIDE SPOT: a small low wooden platform, empty.",
    alone: () => `Space for street artists: on the widest part of the sidewalk, a small round wooden platform about 3 m wide and 20 cm high, with two simple wooden stools on it and a plug-in post beside it. Empty: no people, no instruments. Out of the walking path, not in front of doors or shops.`,
    after: () => `Space for street artists: on the widened sidewalk, a small round wooden platform about 3 m wide and 20 cm high with two wooden stools, empty, out of the walking path.`,
  },
};
