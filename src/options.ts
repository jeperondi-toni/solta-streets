// What the user can pick. Only options with calibrated render rules are listed;
// the rest of the option doc comes back as their rules pass the tests.

export type StreetType = "residential" | "high";
export type Cars = "keep" | "calm" | "carfree";

export const CARS: { id: Cars; step: string; title: string; desc: string; incl: string }[] = [
  { id: "keep", step: "1 · Small step", title: "Same traffic, better edges", desc: "Cars, tram and bikes as today. We improve the sidewalks around them.", incl: "Parking in small groups · gardens at the kerb" },
  { id: "calm", step: "2 · Halfway", title: "Slow street", desc: "One slow lane where cars are guests. Some parking stays, in groups between gardens.", incl: "Raised crossing · wider sidewalks · bikes share the lane" },
  { id: "carfree", step: "3 · The big change", title: "Car-free", desc: "A level street for people, with one bike path. Deliveries at set hours.", incl: "No kerbs · no parking · tram kept" },
];

export interface Item { id: string; title: string; desc: string; t: StreetType[]; learn?: string } // learn: link to best practices (to come)
export interface Category { key: string; name: string; color: string; icon: string; items: Item[] }

const R: StreetType = "residential", H: StreetType = "high", ALL = [R, H];

export const CATEGORIES: Category[] = [
  { key: "green", name: "Green", color: "#2F7D5B", icon: "M12 21v-7 M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0", items: [
    { id: "trees", title: "Street trees", desc: "Real trees with shade over the sidewalk.", t: ALL },
    { id: "facade", title: "Façade gardens", desc: "Narrow gardens and climbing plants at the foot of bare walls.", t: ALL },
    { id: "planters", title: "Big planters", desc: "Small trees and flowers in large containers.", t: ALL },
  ]},
  { key: "people", name: "People and play", color: "#8E3B76", icon: "M6 8a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M3 19c0-3 3-5 6-5s6 2 6 5 M14.5 9a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M16 14c3 0 5 1.5 5 4.5", items: [
    { id: "sit", title: "Places to sit", desc: "Wooden benches with a backrest, facing the life of the street.", t: ALL },
    { id: "play", title: "Something to play on", desc: "Logs, stumps and a beam to climb and balance on, away from cars.", t: [R] },
    { id: "stop", title: "A better bus or tram stop", desc: "A shelter with a green roof, a bench and some planting.", t: [H] },
    { id: "bike", title: "Bike parking", desc: "Racks, so bikes leave the sidewalk.", t: ALL },
  ]},
  { key: "safety", name: "Safety", color: "#B4521A", icon: "M12 3l7 3v6c0 4-3 7-7 9c-4-2-7-5-7-9V6z M9 12l2 2 4-4", items: [
    { id: "crossing", title: "A safe crossing", desc: "A clear crossing with no parked cars around it.", t: ALL },
    { id: "light", title: "Good lighting", desc: "Street lamps along the sidewalk, so it feels safe at night.", t: [] },
  ]},
  { key: "business", name: "Business", color: "#7A5A00", icon: "M4 9l1-4h14l1 4 M4 9h16v10H4z M10 19v-5h4v5", items: [
    { id: "terraces", title: "Terraces", desc: "Café tables against the shop fronts.", t: [H] },
  ]},
  { key: "climate", name: "Climate", color: "#0E6E78", icon: "M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z", items: [
    { id: "shade", title: "Shade sails", desc: "Light canopies over a place to sit.", t: [H] },
  ]},
  { key: "art", name: "Art", color: "#5B4BA8", icon: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z", items: [
    { id: "mural", title: "Mural", desc: "A painted blank wall, made with the community.", t: [R] },
  ]},
];

export const ORDER: Record<StreetType, string[]> = {
  high: ["business", "people", "green", "climate", "safety", "art"],
  residential: ["green", "people", "safety", "climate", "art", "business"],
};

export const ITEM = Object.fromEntries(CATEGORIES.flatMap((c) => c.items.map((i) => [i.id, i])));

/** First fitting option of the first 4 categories, pre-selected. */
export function defaultPicks(type: StreetType) {
  return ORDER[type].slice(0, 4)
    .map((k) => CATEGORIES.find((c) => c.key === k)!.items.find((i) => i.t.includes(type))?.id)
    .filter(Boolean) as string[];
}
