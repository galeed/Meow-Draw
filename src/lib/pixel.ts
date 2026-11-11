export const SIZES = [8, 16, 24, 32, 48, 64] as const;
export type CanvasSize = (typeof SIZES)[number];

export type Tool = "pencil" | "eraser" | "fill";

export type Swatch = {
  name: string;
  hex: string;
};

/** Limited retro palette — warm first, a few cools for contrast. Index + 1 is stored in cells. */
export const PALETTE: readonly Swatch[] = [
  { name: "Tinta", hex: "#1a1614" },
  { name: "Cacao", hex: "#5c3317" },
  { name: "Jengibre", hex: "#e07a3d" },
  { name: "Miel", hex: "#f0a35e" },
  { name: "Crema", hex: "#f6d7a8" },
  { name: "Papel", hex: "#f4efe6" },
  { name: "Rubor", hex: "#e08a86" },
  { name: "Coral", hex: "#c44536" },
  { name: "Musgo", hex: "#6b8f71" },
  { name: "Pino", hex: "#2f4a3c" },
  { name: "Cielo", hex: "#7eb8c9" },
  { name: "Marino", hex: "#243e5a" },
  { name: "Ciruela", hex: "#6e4560" },
  { name: "Oro", hex: "#e0b15a" },
  { name: "Piedra", hex: "#8a7b6b" },
  { name: "Vacío", hex: "#0e0c0a" },
];

export const EXPORT_SCALES = [1, 8, 16] as const;
export type ExportScale = (typeof EXPORT_SCALES)[number];

export const ZOOM_STEPS = [4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48] as const;

export type Frame = {
  w: number;
  h: number;
  /** 0 = transparent, otherwise palette index + 1. */
  cells: Uint8Array;
};

export function createFrame(w: number, h: number): Frame {
  return { w, h, cells: new Uint8Array(w * h) };
}

export function cloneFrame(frame: Frame): Frame {
  return { w: frame.w, h: frame.h, cells: new Uint8Array(frame.cells) };
}

export function isEmpty(frame: Frame): boolean {
  for (let i = 0; i < frame.cells.length; i++) {
    if (frame.cells[i] !== 0) return false;
  }
  return true;
}

export function resizeFrame(frame: Frame, w: number, h: number): Frame {
  const next = createFrame(w, h);
  const cw = Math.min(frame.w, w);
  const ch = Math.min(frame.h, h);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      next.cells[y * w + x] = frame.cells[y * frame.w + x]!;
    }
  }
  return next;
}

export function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  plot: (x: number, y: number) => void,
) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (;;) {
    plot(x, y);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/** 4-connected flood fill. Returns whether any pixel changed. */
export function floodFill(frame: Frame, x: number, y: number, value: number): boolean {
  const { w, h, cells } = frame;
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  const target = cells[y * w + x]!;
  if (target === value) return false;
  const stack = [x, y];
  let changed = false;
  while (stack.length) {
    const cy = stack.pop()!;
    const cx = stack.pop()!;
    const i = cy * w + cx;
    if (cells[i] !== target) continue;
    cells[i] = value;
    changed = true;
    if (cx > 0) stack.push(cx - 1, cy);
    if (cx + 1 < w) stack.push(cx + 1, cy);
    if (cy > 0) stack.push(cx, cy - 1);
    if (cy + 1 < h) stack.push(cx, cy + 1);
  }
  return changed;
}

export function paintCell(frame: Frame, x: number, y: number, value: number): boolean {
  if (x < 0 || y < 0 || x >= frame.w || y >= frame.h) return false;
  const i = y * frame.w + x;
  if (frame.cells[i] === value) return false;
  frame.cells[i] = value;
  return true;
}

const SPRITE_INK = 1;
const SPRITE_GINGER = 3;
const SPRITE_HONEY = 4;
const SPRITE_PAPER = 6;
const SPRITE_BLUSH = 7;
const SPRITE_CORAL = 8;

const SPRITE_ROWS = [
  "................",
  "...k........k...",
  "..khk......khk..",
  ".kgggk....kgggk.",
  ".kggggggggggggk.",
  "kggggggggggggggk",
  "kgggpkggggkpgggk",
  "kgbggggggggggbgk",
  "kggggggrrggggggk",
  "kggggggggggggggk",
  ".kgggggkkgggggk.",
  "..kggggggggggk..",
  "...kggggggggk...",
  "....kggggggk....",
  "................",
  "................",
];

const SPRITE_MAP: Record<string, number> = {
  ".": 0,
  k: SPRITE_INK,
  g: SPRITE_GINGER,
  h: SPRITE_HONEY,
  p: SPRITE_PAPER,
  b: SPRITE_BLUSH,
  r: SPRITE_CORAL,
};

/** Welcome sketch: original 16×16 tabby, so the desk is never blank. */
export function starterCat(): Frame {
  const frame = createFrame(16, 16);
  SPRITE_ROWS.forEach((row, y) => {
    if (row.length !== 16) throw new Error("sprite row");
    for (let x = 0; x < 16; x++) {
      const value = SPRITE_MAP[row[x]!];
      if (value === undefined) throw new Error("sprite color");
      frame.cells[y * 16 + x] = value;
    }
  });
  return frame;
}

export function renderPng(frame: Frame, scale: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = frame.w * scale;
  canvas.height = frame.h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < frame.h; y++) {
    for (let x = 0; x < frame.w; x++) {
      const value = frame.cells[y * frame.w + x]!;
      if (!value) continue;
      const swatch = PALETTE[value - 1];
      if (!swatch) continue;
      ctx.fillStyle = swatch.hex;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return canvas.toDataURL("image/png");
}

const DOC_KEY = "meow-draw-doc-v1";
const PREF_KEY = "meow-draw-pref-v1";

export type Prefs = {
  color: number;
  grid: boolean;
  exportScale: ExportScale;
};

export const DEFAULT_PREFS: Prefs = {
  color: 0,
  grid: true,
  exportScale: 8,
};

export function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_PREFS;
    const data = JSON.parse(raw) as Partial<Prefs>;
    const color =
      typeof data.color === "number" && data.color >= 0 && data.color < PALETTE.length
        ? data.color
        : DEFAULT_PREFS.color;
    const exportScale = EXPORT_SCALES.includes(data.exportScale as ExportScale)
      ? (data.exportScale as ExportScale)
      : DEFAULT_PREFS.exportScale;
    return {
      color,
      grid: typeof data.grid === "boolean" ? data.grid : true,
      exportScale,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writePrefs(prefs: Prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

export function readDoc(): Frame | null {
  try {
    const raw = localStorage.getItem(DOC_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { w?: unknown; h?: unknown; cells?: unknown };
    if (typeof data.w !== "number" || typeof data.h !== "number" || !Array.isArray(data.cells)) {
      return null;
    }
    const w = data.w;
    const h = data.h;
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 128 || h > 128) {
      return null;
    }
    if (data.cells.length !== w * h) return null;
    const cells = new Uint8Array(w * h);
    for (let i = 0; i < cells.length; i++) {
      const value = data.cells[i];
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > PALETTE.length) {
        return null;
      }
      cells[i] = value;
    }
    return { w, h, cells };
  } catch {
    return null;
  }
}

export function writeDoc(frame: Frame) {
  localStorage.setItem(
    DOC_KEY,
    JSON.stringify({
      w: frame.w,
      h: frame.h,
      cells: Array.from(frame.cells),
    }),
  );
}

export function nearestZoom(scale: number, direction: number): number {
  let nearest = 0;
  for (let i = 1; i < ZOOM_STEPS.length; i++) {
    if (Math.abs(ZOOM_STEPS[i]! - scale) < Math.abs(ZOOM_STEPS[nearest]! - scale)) nearest = i;
  }
  const index = Math.max(0, Math.min(ZOOM_STEPS.length - 1, nearest + direction));
  return ZOOM_STEPS[index]!;
}
