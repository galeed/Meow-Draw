import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  Check,
  Download,
  Eraser,
  Grid3x3,
  Minus,
  PaintBucket,
  Pencil,
  Plus,
  Redo2,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import {
  EXPORT_SCALES,
  PALETTE,
  SIZES,
  cloneFrame,
  createFrame,
  floodFill,
  isEmpty,
  nearestZoom,
  paintCell,
  readDoc,
  readPrefs,
  renderPng,
  resizeFrame,
  starterCat,
  writeDoc,
  writePrefs,
  bresenham,
  type CanvasSize,
  type ExportScale,
  type Frame,
  type Tool,
} from "@/lib/pixel";

type Doc = {
  frame: Frame;
  undo: Frame[];
  redo: Frame[];
};

type Meta = {
  w: number;
  h: number;
  undo: number;
  redo: number;
};

type Stroke = {
  pointerId: number;
  lastX: number;
  lastY: number;
  value: number;
  before: Frame;
  dirty: boolean;
};

const HISTORY_LIMIT = 100;

const TOOLS: { id: Tool; label: string; hint: string; Icon: typeof Pencil }[] = [
  { id: "pencil", label: "Lápiz", hint: "P", Icon: Pencil },
  { id: "eraser", label: "Borrador", hint: "B", Icon: Eraser },
  { id: "fill", label: "Relleno", hint: "F", Icon: PaintBucket },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isLight(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function MeowDraw() {
  const docRef = useRef<Doc>({
    frame: createFrame(16, 16),
    undo: [],
    redo: [],
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<Stroke | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState<Tool>("pencil");
  const [colorIndex, setColorIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [scale, setScale] = useState(16);
  const [fitMode, setFitMode] = useState(true);
  const [exportScale, setExportScale] = useState<ExportScale>(8);
  const [meta, setMeta] = useState<Meta>({ w: 16, h: 16, undo: 0, redo: 0 });
  const [armedClear, setArmedClear] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportName, setExportName] = useState("meow-draw.png");
  const [exportLabel, setExportLabel] = useState("");
  const [ios, setIos] = useState(false);

  const toolRef = useRef(tool);
  const colorRef = useRef(colorIndex);
  const gridRef = useRef(showGrid);
  const scaleRef = useRef(scale);
  const exportUrlRef = useRef(exportUrl);
  toolRef.current = tool;
  colorRef.current = colorIndex;
  gridRef.current = showGrid;
  scaleRef.current = scale;
  exportUrlRef.current = exportUrl;

  function publish() {
    const doc = docRef.current;
    setMeta({
      w: doc.frame.w,
      h: doc.frame.h,
      undo: doc.undo.length,
      redo: doc.redo.length,
    });
  }

  function redraw() {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas) return;
    const { frame } = docRef.current;
    const cell = scaleRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(frame.w * cell * dpr));
    canvas.height = Math.max(1, Math.floor(frame.h * cell * dpr));
    canvas.style.width = `${frame.w * cell}px`;
    canvas.style.height = `${frame.h * cell}px`;
    canvas.style.setProperty("--cell", `${cell}px`);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, frame.w * cell, frame.h * cell);
    for (let y = 0; y < frame.h; y++) {
      for (let x = 0; x < frame.w; x++) {
        const value = frame.cells[y * frame.w + x]!;
        if (!value) continue;
        const swatch = PALETTE[value - 1];
        if (!swatch) continue;
        ctx.fillStyle = swatch.hex;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    if (gridRef.current && cell >= 6) {
      const line = getComputedStyle(canvas).getPropertyValue("--grid-line").trim() || "rgb(28 22 18 / 28%)";
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= frame.w; x++) {
        const px = x * cell + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, frame.h * cell);
      }
      for (let y = 0; y <= frame.h; y++) {
        const py = y * cell + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(frame.w * cell, py);
      }
      ctx.stroke();
    }

    if (!preview) return;
    const previewPx = 48;
    preview.width = frame.w;
    preview.height = frame.h;
    preview.style.width = `${previewPx}px`;
    preview.style.height = `${previewPx}px`;
    preview.style.setProperty("--cell", `${previewPx / frame.w}px`);
    const pctx = preview.getContext("2d");
    if (!pctx) return;
    pctx.imageSmoothingEnabled = false;
    pctx.clearRect(0, 0, frame.w, frame.h);
    for (let y = 0; y < frame.h; y++) {
      for (let x = 0; x < frame.w; x++) {
        const value = frame.cells[y * frame.w + x]!;
        if (!value) continue;
        const swatch = PALETTE[value - 1];
        if (!swatch) continue;
        pctx.fillStyle = swatch.hex;
        pctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function commit(before: Frame) {
    const doc = docRef.current;
    doc.undo.push(before);
    if (doc.undo.length > HISTORY_LIMIT) doc.undo.shift();
    doc.redo = [];
    writeDoc(doc.frame);
    publish();
    redraw();
  }

  function syncFrame() {
    writeDoc(docRef.current.frame);
    publish();
    redraw();
  }

  useEffect(() => {
    const saved = readDoc();
    docRef.current.frame = saved ?? starterCat();
    const prefs = readPrefs();
    setColorIndex(prefs.color);
    setShowGrid(prefs.grid);
    setExportScale(prefs.exportScale);
    setIos(isIosDevice());
    publish();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writePrefs({ color: colorIndex, grid: showGrid, exportScale });
  }, [ready, colorIndex, showGrid, exportScale]);

  useEffect(() => {
    if (!ready) return;
    redraw();
  }, [ready, scale, showGrid, meta.w, meta.h, meta.undo, meta.redo]);

  useEffect(() => {
    if (!ready || !fitMode) return;
    const el = stageRef.current;
    if (!el) return;
    const apply = () => {
      const pad = 32;
      const { w, h } = docRef.current.frame;
      if (el.clientWidth < 40 || el.clientHeight < 40) return;
      const next = Math.floor(Math.min((el.clientWidth - pad) / w, (el.clientHeight - pad) / h));
      const clamped = Math.max(4, Math.min(48, next || 4));
      setScale((prev) => (prev === clamped ? prev : clamped));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready, fitMode, meta.w, meta.h]);

  useEffect(() => {
    if (!armedClear) return;
    const timer = window.setTimeout(() => setArmedClear(false), 1800);
    return () => window.clearTimeout(timer);
  }, [armedClear]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      setFitMode(false);
      setScale((current) => nearestZoom(current, event.deltaY < 0 ? 1 : -1));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.isContentEditable)) {
        return;
      }
      if (exportUrlRef.current) {
        if (event.key === "Escape") setExportUrl(null);
        return;
      }
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (key === "p") setTool("pencil");
      else if (key === "b" || key === "e") setTool("eraser");
      else if (key === "f") setTool("fill");
      else if (key === "g") setShowGrid((value) => !value);
      else if (key === "+" || key === "=") {
        setFitMode(false);
        setScale((current) => nearestZoom(current, 1));
      } else if (key === "-" || key === "_") {
        setFitMode(false);
        setScale((current) => nearestZoom(current, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function undo() {
    const doc = docRef.current;
    const prev = doc.undo.pop();
    if (!prev) return;
    doc.redo.push(cloneFrame(doc.frame));
    doc.frame = prev;
    syncFrame();
  }

  function redo() {
    const doc = docRef.current;
    const next = doc.redo.pop();
    if (!next) return;
    doc.undo.push(cloneFrame(doc.frame));
    doc.frame = next;
    syncFrame();
  }

  function resizeTo(size: CanvasSize) {
    const doc = docRef.current;
    if (doc.frame.w === size && doc.frame.h === size) return;
    const before = cloneFrame(doc.frame);
    doc.frame = resizeFrame(before, size, size);
    commit(before);
  }

  function clearCanvas() {
    const doc = docRef.current;
    if (isEmpty(doc.frame)) {
      setArmedClear(false);
      return;
    }
    if (!armedClear) {
      setArmedClear(true);
      return;
    }
    setArmedClear(false);
    const before = cloneFrame(doc.frame);
    doc.frame = createFrame(before.w, before.h);
    commit(before);
  }

  function sampleAt(x: number, y: number) {
    const { frame } = docRef.current;
    const value = frame.cells[y * frame.w + x] ?? 0;
    if (value > 0) setColorIndex(value - 1);
  }

  function cellFromClient(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const { w, h } = docRef.current.frame;
    const x = Math.max(0, Math.min(w - 1, Math.floor(((clientX - rect.left) / rect.width) * w)));
    const y = Math.max(0, Math.min(h - 1, Math.floor(((clientY - rect.top) / rect.height) * h)));
    return { x, y };
  }

  function strokeValue(button: number) {
    if (toolRef.current === "eraser" || button === 2) return 0;
    return colorRef.current + 1;
  }

  function beginStroke(event: ReactPointerEvent<HTMLCanvasElement>) {
    const cell = cellFromClient(event.clientX, event.clientY);
    if (!cell) return;
    if (event.altKey && event.button === 0) {
      sampleAt(cell.x, cell.y);
      return;
    }
    const value = strokeValue(event.button);
    const frame = docRef.current.frame;
    if (toolRef.current === "fill" && event.button !== 2) {
      const before = cloneFrame(frame);
      if (floodFill(frame, cell.x, cell.y, value)) commit(before);
      return;
    }
    const before = cloneFrame(frame);
    const dirty = paintCell(frame, cell.x, cell.y, value);
    strokeRef.current = {
      pointerId: event.pointerId,
      lastX: cell.x,
      lastY: cell.y,
      value,
      before,
      dirty,
    };
    if (dirty) redraw();
  }

  function moveStroke(event: ReactPointerEvent<HTMLCanvasElement>) {
    const stroke = strokeRef.current;
    if (!stroke || stroke.pointerId !== event.pointerId) return;
    const native = event.nativeEvent;
    const events = native.getCoalescedEvents?.() ?? [];
    const points = events.length > 0 ? events : [native];
    let lastX = stroke.lastX;
    let lastY = stroke.lastY;
    let dirty = stroke.dirty;
    for (const point of points) {
      const cell = cellFromClient(point.clientX, point.clientY);
      if (!cell) continue;
      bresenham(lastX, lastY, cell.x, cell.y, (x, y) => {
        if (paintCell(docRef.current.frame, x, y, stroke.value)) dirty = true;
      });
      lastX = cell.x;
      lastY = cell.y;
    }
    stroke.lastX = lastX;
    stroke.lastY = lastY;
    stroke.dirty = dirty;
    if (dirty) redraw();
  }

  function endStroke(pointerId: number) {
    const stroke = strokeRef.current;
    if (!stroke || stroke.pointerId !== pointerId) return;
    strokeRef.current = null;
    if (stroke.dirty) commit(stroke.before);
  }

  function cancelStroke() {
    const stroke = strokeRef.current;
    if (!stroke) return;
    docRef.current.frame = stroke.before;
    strokeRef.current = null;
    redraw();
  }

  function centroid() {
    let x = 0;
    let y = 0;
    const points = pointersRef.current;
    for (const point of points.values()) {
      x += point.x;
      y += point.y;
    }
    const count = points.size || 1;
    return { x: x / count, y: y / count };
  }

  function pointerDistance() {
    const points = [...pointersRef.current.values()];
    if (points.length < 2) return 0;
    return Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointersRef.current.size >= 2) {
      cancelStroke();
      panRef.current = centroid();
      pinchRef.current = { dist: pointerDistance(), scale: scaleRef.current };
      return;
    }
    beginStroke(event);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2) {
      const next = centroid();
      const last = panRef.current;
      const stage = stageRef.current;
      if (last && stage) {
        stage.scrollLeft -= next.x - last.x;
        stage.scrollTop -= next.y - last.y;
      }
      panRef.current = next;
      const pinch = pinchRef.current;
      const dist = pointerDistance();
      if (pinch && pinch.dist > 8 && dist > 8) {
        const zoom = Math.max(4, Math.min(48, Math.round(pinch.scale * (dist / pinch.dist))));
        if (zoom !== scaleRef.current) {
          setFitMode(false);
          setScale(zoom);
        }
      }
      return;
    }
    moveStroke(event);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) {
      panRef.current = null;
      pinchRef.current = null;
    }
    endStroke(event.pointerId);
  }

  function openExport(scale: ExportScale, download: boolean) {
    const frame = docRef.current.frame;
    const url = renderPng(frame, scale);
    if (!url) return;
    const name = `meow-draw-${frame.w}x${frame.h}${scale === 1 ? "" : `-x${scale}`}.png`;
    setExportName(name);
    setExportLabel(`${frame.w}×${frame.h} px · archivo ${frame.w * scale}×${frame.h * scale}`);
    setExportUrl(url);
    if (download && !isIosDevice()) {
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  function exportPng() {
    openExport(exportScale, true);
  }

  const color = PALETTE[colorIndex] ?? PALETTE[0]!;
  const activeTool = TOOLS.find((item) => item.id === tool) ?? TOOLS[0]!;
  const gridVisible = showGrid && scale >= 6;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg select-none">
      <header className="safe-top flex shrink-0 items-center justify-between gap-3 border-b border-border px-3 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <CatMark />
          <div className="min-w-0">
            <h1 className="truncate font-display text-base leading-none text-primary">Meow Draw</h1>
            <p className="mt-1 truncate text-xs text-muted">Estudio de pixel art</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Deshacer" disabled={meta.undo === 0} onClick={undo}>
            <Undo2 className="size-5" />
          </IconButton>
          <IconButton label="Rehacer" disabled={meta.redo === 0} onClick={redo}>
            <Redo2 className="size-5" />
          </IconButton>
          <IconButton label="Exportar PNG" onClick={exportPng}>
            <Download className="size-5" />
          </IconButton>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav
          aria-label="Herramientas"
          className="flex shrink-0 gap-2 overflow-x-auto border-b border-border p-2 md:flex-col md:border-r md:border-b-0"
        >
          {TOOLS.map((item) => (
            <ToolButton
              key={item.id}
              label={item.label}
              hint={item.hint}
              active={tool === item.id}
              onClick={() => setTool(item.id)}
            >
              <item.Icon className="size-5" />
            </ToolButton>
          ))}
          <ToolButton
            label={showGrid ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
            hint="G"
            active={showGrid}
            onClick={() => setShowGrid((value) => !value)}
          >
            <Grid3x3 className="size-5" />
          </ToolButton>
          <button
            type="button"
            aria-pressed={armedClear}
            aria-label={armedClear ? "Confirmar borrar lienzo" : "Limpiar"}
            title={armedClear ? "¿Borrar?" : "Limpiar"}
            onClick={clearCanvas}
            className={cx(
              "flex h-11 shrink-0 items-center justify-center gap-1 rounded-md border px-3 transition-colors",
              armedClear
                ? "border-primary bg-primary text-primary-fg"
                : "size-11 border-border bg-surface text-fg hover:bg-surface-2",
            )}
          >
            <Trash2 className="size-5" />
            {armedClear ? <span className="pr-1 text-sm font-medium">¿Borrar?</span> : null}
          </button>
        </nav>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div ref={stageRef} className="stage flex min-h-0 flex-1 overflow-auto bg-bg">
            <div className="m-auto p-4">
              <canvas
                ref={canvasRef}
                className={cx(
                  "pixel-checker touch-none rounded-md shadow-lg",
                  ready ? "opacity-100" : "opacity-0",
                  tool === "eraser" ? "cursor-cell" : "cursor-crosshair",
                )}
                aria-label={`Lienzo de ${meta.w} por ${meta.h} píxeles`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onContextMenu={(event) => event.preventDefault()}
              />
            </div>
          </div>
          <p className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs text-muted">
            <span className="min-w-0 truncate tabular-nums">
              {meta.w}×{meta.h} · {activeTool.label} · {color.name}
              {showGrid && !gridVisible ? " · sube el zoom para la cuadrícula" : ""}
            </span>
            <span className="hidden sm:inline">P lápiz · B borrar · F relleno · Alt clic color · ⌘Z</span>
          </p>
        </div>

        <aside className="safe-bottom max-h-[48dvh] shrink-0 overflow-y-auto border-t border-border p-3 md:max-h-none md:w-72 md:border-t-0 md:border-l">
          <div className="flex flex-col gap-4">
            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Paleta</h2>
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span
                    className="size-4 rounded-sm border border-border"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  {color.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2" role="listbox" aria-label="Colores">
                {PALETTE.map((swatch, index) => {
                  const selected = index === colorIndex;
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={swatch.name}
                      title={swatch.name}
                      onClick={() => setColorIndex(index)}
                      className={cx(
                        "flex size-11 items-center justify-center rounded-md border transition-transform",
                        selected ? "scale-105 border-fg" : "border-border hover:border-fg",
                      )}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {selected ? (
                        <Check
                          className={cx("size-5", isLight(swatch.hex) ? "text-bg" : "text-fg")}
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">Lienzo</h2>
                <canvas
                  ref={previewRef}
                  width={16}
                  height={16}
                  className="pixel-checker pixelated size-12 rounded-sm border border-border"
                  aria-label="Vista previa a tamaño real"
                />
              </div>
              <div className="grid grid-cols-6 gap-2" role="group" aria-label="Tamaño del lienzo">
                {SIZES.map((size) => {
                  const selected = meta.w === size && meta.h === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => resizeTo(size)}
                      className={cx(
                        "h-11 rounded-md border text-sm tabular-nums transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-fg"
                          : "border-border bg-surface-2 text-fg hover:border-fg",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted">Al reducir se recorta desde la esquina. Deshacer lo recupera.</p>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">Zoom</h2>
                <span className="text-xs text-muted tabular-nums">
                  {fitMode ? "Ajuste" : "Manual"} · {scale}px
                </span>
              </div>
              <div className="flex gap-2">
                <IconButton
                  label="Alejar"
                  onClick={() => {
                    setFitMode(false);
                    setScale((current) => nearestZoom(current, -1));
                  }}
                >
                  <Minus className="size-5" />
                </IconButton>
                <button
                  type="button"
                  onClick={() => setFitMode(true)}
                  className="h-11 flex-1 rounded-md border border-border bg-surface-2 text-sm hover:border-fg"
                >
                  Ajustar
                </button>
                <IconButton
                  label="Acercar"
                  onClick={() => {
                    setFitMode(false);
                    setScale((current) => nearestZoom(current, 1));
                  }}
                >
                  <Plus className="size-5" />
                </IconButton>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-medium">Exportar PNG</h2>
              <div className="mb-2 grid grid-cols-3 gap-2" role="group" aria-label="Escala de exportación">
                {EXPORT_SCALES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={exportScale === value}
                    onClick={() => setExportScale(value)}
                    className={cx(
                      "h-11 rounded-md border text-sm tabular-nums transition-colors",
                      exportScale === value
                        ? "border-primary bg-primary text-primary-fg"
                        : "border-border bg-surface-2 hover:border-fg",
                    )}
                  >
                    {value}×
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={exportPng}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg hover:bg-primary/90"
              >
                <Download className="size-4" />
                Exportar PNG
              </button>
            </section>
          </div>
        </aside>
      </div>

      {exportUrl ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-bg/80" onClick={() => setExportUrl(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="export-title" className="text-base font-medium">
                  PNG listo
                </h2>
                <p className="mt-1 text-xs text-muted tabular-nums">{exportLabel}</p>
              </div>
              <IconButton label="Cerrar" onClick={() => setExportUrl(null)}>
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="pixel-checker flex items-center justify-center rounded-lg p-4" style={{ ["--cell" as string]: "12px" }}>
              <img src={exportUrl} alt="Dibujo exportado" className="pixelated max-h-64 max-w-full" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Escala de exportación">
              {EXPORT_SCALES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={exportScale === value}
                  onClick={() => {
                    setExportScale(value);
                    openExport(value, false);
                  }}
                  className={cx(
                    "h-11 rounded-md border text-sm tabular-nums transition-colors",
                    exportScale === value
                      ? "border-primary bg-primary text-primary-fg"
                      : "border-border bg-surface-2 hover:border-fg",
                  )}
                >
                  {value}×
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-pretty text-muted">
              {ios
                ? "En el iPhone, mantén pulsada la imagen para guardarla en Fotos."
                : "El archivo se descargó. Si no aparece, usa el botón de abajo."}
            </p>
            {ios ? null : (
              <a
                href={exportUrl}
                download={exportName}
                className="mt-3 flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-fg"
              >
                Descargar de nuevo
              </a>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CatMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-9 shrink-0 text-primary" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5 14.5 9.2 4l4.2 7.2h5.2L22.8 4 27 14.5V18l-2.2 1.2V27H7.2v-7.8L5 18v-3.5zm6.2 5.2h2.2v2.4h-2.2zm7.4 0h2.2v2.4h-2.2z"
      />
    </svg>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-fg transition-colors hover:bg-surface-2 disabled:text-muted"
    >
      {children}
    </button>
  );
}

function ToolButton({
  label,
  hint,
  active,
  onClick,
  children,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={hint ? `${label} (${hint})` : label}
      title={hint ? `${label} (${hint})` : label}
      onClick={onClick}
      className={cx(
        "flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors",
        active
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-surface text-fg hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}
