import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Redo2, c as PaintBucket, d as Eraser, f as Download, i as Trash2, l as Minus, n as Undo2, o as Plus, p as Check, s as Pencil, t as X, u as Grid3x3 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DrbAHbyW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SIZES = [
	8,
	16,
	24,
	32,
	48,
	64
];
/** Limited retro palette — warm first, a few cools for contrast. Index + 1 is stored in cells. */
var PALETTE = [
	{
		name: "Tinta",
		hex: "#1a1614"
	},
	{
		name: "Cacao",
		hex: "#5c3317"
	},
	{
		name: "Jengibre",
		hex: "#e07a3d"
	},
	{
		name: "Miel",
		hex: "#f0a35e"
	},
	{
		name: "Crema",
		hex: "#f6d7a8"
	},
	{
		name: "Papel",
		hex: "#f4efe6"
	},
	{
		name: "Rubor",
		hex: "#e08a86"
	},
	{
		name: "Coral",
		hex: "#c44536"
	},
	{
		name: "Musgo",
		hex: "#6b8f71"
	},
	{
		name: "Pino",
		hex: "#2f4a3c"
	},
	{
		name: "Cielo",
		hex: "#7eb8c9"
	},
	{
		name: "Marino",
		hex: "#243e5a"
	},
	{
		name: "Ciruela",
		hex: "#6e4560"
	},
	{
		name: "Oro",
		hex: "#e0b15a"
	},
	{
		name: "Piedra",
		hex: "#8a7b6b"
	},
	{
		name: "Vacío",
		hex: "#0e0c0a"
	}
];
var EXPORT_SCALES = [
	1,
	8,
	16
];
var ZOOM_STEPS = [
	4,
	6,
	8,
	10,
	12,
	16,
	20,
	24,
	32,
	40,
	48
];
function createFrame(w, h) {
	return {
		w,
		h,
		cells: new Uint8Array(w * h)
	};
}
function cloneFrame(frame) {
	return {
		w: frame.w,
		h: frame.h,
		cells: new Uint8Array(frame.cells)
	};
}
function isEmpty(frame) {
	for (let i = 0; i < frame.cells.length; i++) if (frame.cells[i] !== 0) return false;
	return true;
}
function resizeFrame(frame, w, h) {
	const next = createFrame(w, h);
	const cw = Math.min(frame.w, w);
	const ch = Math.min(frame.h, h);
	for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) next.cells[y * w + x] = frame.cells[y * frame.w + x];
	return next;
}
function bresenham(x0, y0, x1, y1, plot) {
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
function floodFill(frame, x, y, value) {
	const { w, h, cells } = frame;
	if (x < 0 || y < 0 || x >= w || y >= h) return false;
	const target = cells[y * w + x];
	if (target === value) return false;
	const stack = [x, y];
	let changed = false;
	while (stack.length) {
		const cy = stack.pop();
		const cx = stack.pop();
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
function paintCell(frame, x, y, value) {
	if (x < 0 || y < 0 || x >= frame.w || y >= frame.h) return false;
	const i = y * frame.w + x;
	if (frame.cells[i] === value) return false;
	frame.cells[i] = value;
	return true;
}
var SPRITE_INK = 1;
var SPRITE_GINGER = 3;
var SPRITE_HONEY = 4;
var SPRITE_PAPER = 6;
var SPRITE_BLUSH = 7;
var SPRITE_CORAL = 8;
var SPRITE_ROWS = [
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
	"................"
];
var SPRITE_MAP = {
	".": 0,
	k: SPRITE_INK,
	g: SPRITE_GINGER,
	h: SPRITE_HONEY,
	p: SPRITE_PAPER,
	b: SPRITE_BLUSH,
	r: SPRITE_CORAL
};
/** Welcome sketch: original 16×16 tabby, so the desk is never blank. */
function starterCat() {
	const frame = createFrame(16, 16);
	SPRITE_ROWS.forEach((row, y) => {
		if (row.length !== 16) throw new Error("sprite row");
		for (let x = 0; x < 16; x++) {
			const value = SPRITE_MAP[row[x]];
			if (value === void 0) throw new Error("sprite color");
			frame.cells[y * 16 + x] = value;
		}
	});
	return frame;
}
function renderPng(frame, scale) {
	const canvas = document.createElement("canvas");
	canvas.width = frame.w * scale;
	canvas.height = frame.h * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";
	ctx.imageSmoothingEnabled = false;
	for (let y = 0; y < frame.h; y++) for (let x = 0; x < frame.w; x++) {
		const value = frame.cells[y * frame.w + x];
		if (!value) continue;
		const swatch = PALETTE[value - 1];
		if (!swatch) continue;
		ctx.fillStyle = swatch.hex;
		ctx.fillRect(x * scale, y * scale, scale, scale);
	}
	return canvas.toDataURL("image/png");
}
var DOC_KEY = "meow-draw-doc-v1";
var PREF_KEY = "meow-draw-pref-v1";
var DEFAULT_PREFS = {
	color: 0,
	grid: true,
	exportScale: 8
};
function readPrefs() {
	try {
		const raw = localStorage.getItem(PREF_KEY);
		if (!raw) return DEFAULT_PREFS;
		const data = JSON.parse(raw);
		const color = typeof data.color === "number" && data.color >= 0 && data.color < PALETTE.length ? data.color : DEFAULT_PREFS.color;
		const exportScale = EXPORT_SCALES.includes(data.exportScale) ? data.exportScale : DEFAULT_PREFS.exportScale;
		return {
			color,
			grid: typeof data.grid === "boolean" ? data.grid : true,
			exportScale
		};
	} catch {
		return DEFAULT_PREFS;
	}
}
function writePrefs(prefs) {
	localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}
function readDoc() {
	try {
		const raw = localStorage.getItem(DOC_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (typeof data.w !== "number" || typeof data.h !== "number" || !Array.isArray(data.cells)) return null;
		const w = data.w;
		const h = data.h;
		if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 128 || h > 128) return null;
		if (data.cells.length !== w * h) return null;
		const cells = new Uint8Array(w * h);
		for (let i = 0; i < cells.length; i++) {
			const value = data.cells[i];
			if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > PALETTE.length) return null;
			cells[i] = value;
		}
		return {
			w,
			h,
			cells
		};
	} catch {
		return null;
	}
}
function writeDoc(frame) {
	localStorage.setItem(DOC_KEY, JSON.stringify({
		w: frame.w,
		h: frame.h,
		cells: Array.from(frame.cells)
	}));
}
function nearestZoom(scale, direction) {
	let nearest = 0;
	for (let i = 1; i < ZOOM_STEPS.length; i++) if (Math.abs(ZOOM_STEPS[i] - scale) < Math.abs(ZOOM_STEPS[nearest] - scale)) nearest = i;
	return ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, nearest + direction))];
}
var HISTORY_LIMIT = 100;
var TOOLS = [
	{
		id: "pencil",
		label: "Lápiz",
		hint: "P",
		Icon: Pencil
	},
	{
		id: "eraser",
		label: "Borrador",
		hint: "B",
		Icon: Eraser
	},
	{
		id: "fill",
		label: "Relleno",
		hint: "F",
		Icon: PaintBucket
	}
];
function cx(...parts) {
	return parts.filter(Boolean).join(" ");
}
function isLight(hex) {
	const value = Number.parseInt(hex.slice(1), 16);
	const r = value >> 16 & 255;
	const g = value >> 8 & 255;
	const b = value & 255;
	return (r * 299 + g * 587 + b * 114) / 1e3 > 155;
}
function isIosDevice() {
	if (typeof navigator === "undefined") return false;
	return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
function MeowDraw() {
	const docRef = (0, import_react.useRef)({
		frame: createFrame(16, 16),
		undo: [],
		redo: []
	});
	const canvasRef = (0, import_react.useRef)(null);
	const previewRef = (0, import_react.useRef)(null);
	const stageRef = (0, import_react.useRef)(null);
	const strokeRef = (0, import_react.useRef)(null);
	const pointersRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const panRef = (0, import_react.useRef)(null);
	const pinchRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [tool, setTool] = (0, import_react.useState)("pencil");
	const [colorIndex, setColorIndex] = (0, import_react.useState)(0);
	const [showGrid, setShowGrid] = (0, import_react.useState)(true);
	const [scale, setScale] = (0, import_react.useState)(16);
	const [fitMode, setFitMode] = (0, import_react.useState)(true);
	const [exportScale, setExportScale] = (0, import_react.useState)(8);
	const [meta, setMeta] = (0, import_react.useState)({
		w: 16,
		h: 16,
		undo: 0,
		redo: 0
	});
	const [armedClear, setArmedClear] = (0, import_react.useState)(false);
	const [exportUrl, setExportUrl] = (0, import_react.useState)(null);
	const [exportName, setExportName] = (0, import_react.useState)("meow-draw.png");
	const [exportLabel, setExportLabel] = (0, import_react.useState)("");
	const [ios, setIos] = (0, import_react.useState)(false);
	const toolRef = (0, import_react.useRef)(tool);
	const colorRef = (0, import_react.useRef)(colorIndex);
	const gridRef = (0, import_react.useRef)(showGrid);
	const scaleRef = (0, import_react.useRef)(scale);
	const exportUrlRef = (0, import_react.useRef)(exportUrl);
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
			redo: doc.redo.length
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
		for (let y = 0; y < frame.h; y++) for (let x = 0; x < frame.w; x++) {
			const value = frame.cells[y * frame.w + x];
			if (!value) continue;
			const swatch = PALETTE[value - 1];
			if (!swatch) continue;
			ctx.fillStyle = swatch.hex;
			ctx.fillRect(x * cell, y * cell, cell, cell);
		}
		if (gridRef.current && cell >= 6) {
			ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue("--grid-line").trim() || "rgb(28 22 18 / 28%)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (let x = 0; x <= frame.w; x++) {
				const px = x * cell + .5;
				ctx.moveTo(px, 0);
				ctx.lineTo(px, frame.h * cell);
			}
			for (let y = 0; y <= frame.h; y++) {
				const py = y * cell + .5;
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
		for (let y = 0; y < frame.h; y++) for (let x = 0; x < frame.w; x++) {
			const value = frame.cells[y * frame.w + x];
			if (!value) continue;
			const swatch = PALETTE[value - 1];
			if (!swatch) continue;
			pctx.fillStyle = swatch.hex;
			pctx.fillRect(x, y, 1, 1);
		}
	}
	function commit(before) {
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
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		writePrefs({
			color: colorIndex,
			grid: showGrid,
			exportScale
		});
	}, [
		ready,
		colorIndex,
		showGrid,
		exportScale
	]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		redraw();
	}, [
		ready,
		scale,
		showGrid,
		meta.w,
		meta.h,
		meta.undo,
		meta.redo
	]);
	(0, import_react.useEffect)(() => {
		if (!ready || !fitMode) return;
		const el = stageRef.current;
		if (!el) return;
		const apply = () => {
			const pad = 32;
			const { w, h } = docRef.current.frame;
			if (el.clientWidth < 40 || el.clientHeight < 40) return;
			const next = Math.floor(Math.min((el.clientWidth - pad) / w, (el.clientHeight - pad) / h));
			const clamped = Math.max(4, Math.min(48, next || 4));
			setScale((prev) => prev === clamped ? prev : clamped);
		};
		apply();
		const observer = new ResizeObserver(apply);
		observer.observe(el);
		return () => observer.disconnect();
	}, [
		ready,
		fitMode,
		meta.w,
		meta.h
	]);
	(0, import_react.useEffect)(() => {
		if (!armedClear) return;
		const timer = window.setTimeout(() => setArmedClear(false), 1800);
		return () => window.clearTimeout(timer);
	}, [armedClear]);
	(0, import_react.useEffect)(() => {
		const el = stageRef.current;
		if (!el) return;
		const onWheel = (event) => {
			if (!(event.ctrlKey || event.metaKey)) return;
			event.preventDefault();
			setFitMode(false);
			setScale((current) => nearestZoom(current, event.deltaY < 0 ? 1 : -1));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const target = event.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.isContentEditable)) return;
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
	function resizeTo(size) {
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
	function sampleAt(x, y) {
		const { frame } = docRef.current;
		const value = frame.cells[y * frame.w + x] ?? 0;
		if (value > 0) setColorIndex(value - 1);
	}
	function cellFromClient(clientX, clientY) {
		const canvas = canvasRef.current;
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return null;
		const { w, h } = docRef.current.frame;
		return {
			x: Math.max(0, Math.min(w - 1, Math.floor((clientX - rect.left) / rect.width * w))),
			y: Math.max(0, Math.min(h - 1, Math.floor((clientY - rect.top) / rect.height * h)))
		};
	}
	function strokeValue(button) {
		if (toolRef.current === "eraser" || button === 2) return 0;
		return colorRef.current + 1;
	}
	function beginStroke(event) {
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
			dirty
		};
		if (dirty) redraw();
	}
	function moveStroke(event) {
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
	function endStroke(pointerId) {
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
		return {
			x: x / count,
			y: y / count
		};
	}
	function pointerDistance() {
		const points = [...pointersRef.current.values()];
		if (points.length < 2) return 0;
		return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
	}
	function onPointerDown(event) {
		if (event.button !== 0 && event.button !== 2) return;
		event.preventDefault();
		pointersRef.current.set(event.pointerId, {
			x: event.clientX,
			y: event.clientY
		});
		event.currentTarget.setPointerCapture(event.pointerId);
		if (pointersRef.current.size >= 2) {
			cancelStroke();
			panRef.current = centroid();
			pinchRef.current = {
				dist: pointerDistance(),
				scale: scaleRef.current
			};
			return;
		}
		beginStroke(event);
	}
	function onPointerMove(event) {
		if (!pointersRef.current.has(event.pointerId)) return;
		pointersRef.current.set(event.pointerId, {
			x: event.clientX,
			y: event.clientY
		});
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
	function onPointerUp(event) {
		pointersRef.current.delete(event.pointerId);
		if (pointersRef.current.size < 2) {
			panRef.current = null;
			pinchRef.current = null;
		}
		endStroke(event.pointerId);
	}
	function openExport(scale, download) {
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
	const color = PALETTE[colorIndex] ?? PALETTE[0];
	const activeTool = TOOLS.find((item) => item.id === tool) ?? TOOLS[0];
	const gridVisible = showGrid && scale >= 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "safe-top flex shrink-0 items-center justify-between gap-3 border-b border-border px-3 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate font-display text-base leading-none text-primary",
							children: "Meow Draw"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 truncate text-xs text-muted",
							children: "Estudio de pixel art"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "Deshacer",
							disabled: meta.undo === 0,
							onClick: undo,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "Rehacer",
							disabled: meta.redo === 0,
							onClick: redo,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "Exportar PNG",
							onClick: exportPng,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col md:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Herramientas",
						className: "flex shrink-0 gap-2 overflow-x-auto border-b border-border p-2 md:flex-col md:border-r md:border-b-0",
						children: [
							TOOLS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
								label: item.label,
								hint: item.hint,
								active: tool === item.id,
								onClick: () => setTool(item.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.Icon, { className: "size-5" })
							}, item.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
								label: showGrid ? "Ocultar cuadrícula" : "Mostrar cuadrícula",
								hint: "G",
								active: showGrid,
								onClick: () => setShowGrid((value) => !value),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": armedClear,
								"aria-label": armedClear ? "Confirmar borrar lienzo" : "Limpiar",
								title: armedClear ? "¿Borrar?" : "Limpiar",
								onClick: clearCanvas,
								className: cx("flex h-11 shrink-0 items-center justify-center gap-1 rounded-md border px-3 transition-colors", armedClear ? "border-primary bg-primary text-primary-fg" : "size-11 border-border bg-surface text-fg hover:bg-surface-2"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-5" }), armedClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pr-1 text-sm font-medium",
									children: "¿Borrar?"
								}) : null]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 min-w-0 flex-1 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: stageRef,
							className: "stage flex min-h-0 flex-1 overflow-auto bg-bg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "m-auto p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
									ref: canvasRef,
									className: cx("pixel-checker touch-none rounded-md shadow-lg", ready ? "opacity-100" : "opacity-0", tool === "eraser" ? "cursor-cell" : "cursor-crosshair"),
									"aria-label": `Lienzo de ${meta.w} por ${meta.h} píxeles`,
									onPointerDown,
									onPointerMove,
									onPointerUp,
									onPointerCancel: onPointerUp,
									onContextMenu: (event) => event.preventDefault()
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex shrink-0 items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 truncate tabular-nums",
								children: [
									meta.w,
									"×",
									meta.h,
									" · ",
									activeTool.label,
									" · ",
									color.name,
									showGrid && !gridVisible ? " · sube el zoom para la cuadrícula" : ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "P lápiz · B borrar · F relleno · Alt clic color · ⌘Z"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "safe-bottom max-h-[48dvh] shrink-0 overflow-y-auto border-t border-border p-3 md:max-h-none md:w-72 md:border-t-0 md:border-l",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-medium",
										children: "Paleta"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2 text-xs text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "size-4 rounded-sm border border-border",
											style: { backgroundColor: color.hex },
											"aria-hidden": "true"
										}), color.name]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									role: "listbox",
									"aria-label": "Colores",
									children: PALETTE.map((swatch, index) => {
										const selected = index === colorIndex;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											role: "option",
											"aria-selected": selected,
											"aria-label": swatch.name,
											title: swatch.name,
											onClick: () => setColorIndex(index),
											className: cx("flex size-11 items-center justify-center rounded-md border transition-transform", selected ? "scale-105 border-fg" : "border-border hover:border-fg"),
											style: { backgroundColor: swatch.hex },
											children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
												className: cx("size-5", isLight(swatch.hex) ? "text-bg" : "text-fg"),
												strokeWidth: 3,
												"aria-hidden": "true"
											}) : null
										}, swatch.hex);
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-2 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-sm font-medium",
											children: "Lienzo"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
											ref: previewRef,
											width: 16,
											height: 16,
											className: "pixel-checker pixelated size-12 rounded-sm border border-border",
											"aria-label": "Vista previa a tamaño real"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-6 gap-2",
										role: "group",
										"aria-label": "Tamaño del lienzo",
										children: SIZES.map((size) => {
											const selected = meta.w === size && meta.h === size;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-pressed": selected,
												onClick: () => resizeTo(size),
												className: cx("h-11 rounded-md border text-sm tabular-nums transition-colors", selected ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface-2 text-fg hover:border-fg"),
												children: size
											}, size);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted",
										children: "Al reducir se recorta desde la esquina. Deshacer lo recupera."
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-medium",
										children: "Zoom"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted tabular-nums",
										children: [
											fitMode ? "Ajuste" : "Manual",
											" · ",
											scale,
											"px"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: "Alejar",
											onClick: () => {
												setFitMode(false);
												setScale((current) => nearestZoom(current, -1));
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setFitMode(true),
											className: "h-11 flex-1 rounded-md border border-border bg-surface-2 text-sm hover:border-fg",
											children: "Ajustar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: "Acercar",
											onClick: () => {
												setFitMode(false);
												setScale((current) => nearestZoom(current, 1));
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mb-2 text-sm font-medium",
										children: "Exportar PNG"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mb-2 grid grid-cols-3 gap-2",
										role: "group",
										"aria-label": "Escala de exportación",
										children: EXPORT_SCALES.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											"aria-pressed": exportScale === value,
											onClick: () => setExportScale(value),
											className: cx("h-11 rounded-md border text-sm tabular-nums transition-colors", exportScale === value ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface-2 hover:border-fg"),
											children: [value, "×"]
										}, value))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: exportPng,
										className: "flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg hover:bg-primary/90",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Exportar PNG"]
									})
								] })
							]
						})
					})
				]
			}),
			exportUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-bg/80",
					onClick: () => setExportUrl(null)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "export-title",
					className: "relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "export-title",
								className: "text-base font-medium",
								children: "PNG listo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted tabular-nums",
								children: exportLabel
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								label: "Cerrar",
								onClick: () => setExportUrl(null),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pixel-checker flex items-center justify-center rounded-lg p-4",
							style: { ["--cell"]: "12px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: exportUrl,
								alt: "Dibujo exportado",
								className: "pixelated max-h-64 max-w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-3 gap-2",
							role: "group",
							"aria-label": "Escala de exportación",
							children: EXPORT_SCALES.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": exportScale === value,
								onClick: () => {
									setExportScale(value);
									openExport(value, false);
								},
								className: cx("h-11 rounded-md border text-sm tabular-nums transition-colors", exportScale === value ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface-2 hover:border-fg"),
								children: [value, "×"]
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-pretty text-muted",
							children: ios ? "En el iPhone, mantén pulsada la imagen para guardarla en Fotos." : "El archivo se descargó. Si no aparece, usa el botón de abajo."
						}),
						ios ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: exportUrl,
							download: exportName,
							className: "mt-3 flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-fg",
							children: "Descargar de nuevo"
						})
					]
				})]
			}) : null
		]
	});
}
function CatMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 32 32",
		className: "size-9 shrink-0 text-primary",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			fillRule: "evenodd",
			d: "M5 14.5 9.2 4l4.2 7.2h5.2L22.8 4 27 14.5V18l-2.2 1.2V27H7.2v-7.8L5 18v-3.5zm6.2 5.2h2.2v2.4h-2.2zm7.4 0h2.2v2.4h-2.2z"
		})
	});
}
function IconButton({ label, disabled, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		title: label,
		disabled,
		onClick,
		className: "flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-fg transition-colors hover:bg-surface-2 disabled:text-muted",
		children
	});
}
function ToolButton({ label, hint, active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": active,
		"aria-label": hint ? `${label} (${hint})` : label,
		title: hint ? `${label} (${hint})` : label,
		onClick,
		className: cx("flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors", active ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg hover:bg-surface-2"),
		children
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeowDraw, {});
}
//#endregion
export { Home as component };
