import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

/**
 * Procedural brick + wood textures for the dollhouse, drawn on a `<canvas>` at
 * runtime — NO image assets to ship, and they tint cleanly. Both are GREYSCALE
 * relief patterns; each mesh multiplies them by its own palette colour, so brick
 * walls stay theme-aware (light/dark) and doors/stairs keep their wood tone while
 * gaining grain. Created once (client-only — the viewer is `dynamic(ssr:false)`).
 */
export type SceneTextures = { brick: Texture; wood: Texture };

const SIZE = 256;

function grey(value: number): string {
  const v = Math.max(0, Math.min(255, Math.round(value)));
  return `rgb(${v},${v},${v})`;
}

function context(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  return ctx ? { canvas, ctx } : null;
}

function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Brick courses (light faces, darker mortar), every other row offset by half. */
function brickTexture(): Texture {
  const made = context();
  if (!made) return new CanvasTexture();
  const { canvas, ctx } = made;
  const rows = 6;
  const cols = 3;
  const bh = SIZE / rows;
  const bw = SIZE / cols;
  const gap = 7;
  ctx.fillStyle = grey(176); // mortar — soft, low-contrast lines
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (bw / 2);
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = grey(233 - ((r * 3 + c) % 3) * 7); // subtle per-brick variation
      ctx.fillRect(c * bw + offset + gap / 2, r * bh + gap / 2, bw - gap, bh - gap);
    }
  }
  return toTexture(canvas);
}

/** Vertical wood grain — streaks of varying lightness over a mid-grey base. */
function woodTexture(): Texture {
  const made = context();
  if (!made) return new CanvasTexture();
  const { canvas, ctx } = made;
  const planks = 56;
  const pw = SIZE / planks;
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = grey(202 + (((i * 53) % 11) - 5) * 4); // 202 ± ~20, gentle grain
    ctx.fillRect(i * pw, 0, pw + 1, SIZE);
  }
  return toTexture(canvas);
}

export function createSceneTextures(): SceneTextures {
  return { brick: brickTexture(), wood: woodTexture() };
}
