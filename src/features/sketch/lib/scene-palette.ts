/**
 * Material colours for the WebGL dollhouse, as hex **numbers** (three.js cannot
 * parse CSS `oklch` tokens, so the scene shell can't reference `tokens.css`). This
 * is a deliberate, self-contained scene palette — the WebGL analogue of the design
 * tokens, composed in-house (NOT mirrored from any other Bonyad app). Two variants
 * keep the model legible in light and dark mode. Furniture colours come from the
 * backend per item; rooms are tinted by function via {@link roomColor}.
 */
export type ScenePalette = {
  background: number;
  ground: number;
  floor: number;
  wall: number;
  door: number;
  doorExternal: number;
  frame: number;
  glass: number;
  windowFrame: number;
  stair: number;
  handrail: number;
  furnitureFallback: number;
};

const LIGHT: ScenePalette = {
  background: 0xeef2f6,
  // Distinctly darker than every room tint so neutral floors (garage, maid, store)
  // read as slabs instead of vanishing into the ground.
  ground: 0xacb8c7,
  floor: 0xeef1f5,
  wall: 0xe4e8ef,
  door: 0xb07a46,
  doorExternal: 0x7d4f28,
  frame: 0xf6f6f4,
  glass: 0x7ec8ec,
  windowFrame: 0x55617a,
  stair: 0xba8a55,
  handrail: 0xdadad6,
  furnitureFallback: 0xb8bdc6,
};

const DARK: ScenePalette = {
  background: 0x0f1419,
  // Darker than the dark room tints, for the same reason as light mode.
  ground: 0x10151c,
  floor: 0x4a525e,
  wall: 0x3b434f,
  door: 0x6e4d2c,
  doorExternal: 0x4a3119,
  frame: 0x9aa1ac,
  glass: 0x57b0d6,
  windowFrame: 0xb4bcc8,
  stair: 0x6e5436,
  handrail: 0x8a8f98,
  furnitureFallback: 0x6b7280,
};

export const scenePalette = (isDark: boolean): ScenePalette => (isDark ? DARK : LIGHT);

/** Per-function room tints `[light, dark]` — chosen in-house for legibility. */
// Dark tints are deliberately MID-toned (not near-black): the dark ground is very dark
// (`0x10151c`), so a floor must be clearly brighter than both it and the dark walls
// (`0x3b434f`) to read as a slab. Earlier near-black tints vanished in dark mode.
const ROOM_COLORS: Record<string, readonly [number, number]> = {
  majlis_men: [0xf6e3b0, 0x6e5e34],
  majlis_women: [0xf6e3b0, 0x6e5e34],
  majlis_outdoor: [0xf6e3b0, 0x6e5e34],
  family_living: [0xc9e9cd, 0x3f6149],
  kitchen: [0xfcdcb6, 0x70583a],
  kitchen_open: [0xfcdcb6, 0x70583a],
  dining: [0xf8cfc9, 0x6f4742],
  dining_guest: [0xf8cfc9, 0x6f4742],
  bedroom: [0xd2e4fb, 0x3e5673],
  bedroom_kids: [0xd2e4fb, 0x3e5673],
  bedroom_master: [0xbcd6f7, 0x395471],
  bathroom_master: [0xbdeede, 0x356b60],
  bathroom_shared: [0xc7eef2, 0x356a6c],
  wc_guest: [0xc7eef2, 0x356a6c],
  wc_family: [0xc7eef2, 0x356a6c],
  prayer: [0xf3ecd6, 0x675f43],
  maid_quarters: [0xe6e6ea, 0x53565d],
  garage: [0xd9dadf, 0x4c4f55],
  storage: [0xe2dbf6, 0x524b73],
  laundry: [0xe2dbf6, 0x524b73],
  corridor: [0xeceadf, 0x575345],
  foyer: [0xeceadf, 0x575345],
};

/** Tint for a room from its backend tags, falling back to the neutral floor. */
export function roomColor(tags: string[] | undefined, isDark: boolean): number {
  for (const tag of tags ?? []) {
    const pair = ROOM_COLORS[tag];
    if (pair) return isDark ? pair[1] : pair[0];
  }
  return isDark ? DARK.floor : LIGHT.floor;
}
