/**
 * FLN L39 Drawing Canvas Engine
 * Excalidraw-inspired kid-friendly freehand drawing & coloring engine
 * Features:
 * - High DPI Retina rendering
 * - Smooth quadratic Bezier stroke interpolation
 * - Pencil, Crayon, Marker, Eraser, and Paint Bucket (Flood Fill)
 * - Trace Guide overlay (Stage 1 & hint mode)
 * - Undo / Redo history
 * - Touch, Stylus, and Mouse input
 */

class DrawingCanvas {
  constructor(canvasElement, guideCanvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.guideCanvas = guideCanvasElement;
    this.guideCtx = this.guideCanvas ? this.guideCanvas.getContext('2d') : null;

    // Drawing state
    this.tool = 'pencil'; // pencil, crayon, marker, eraser, fill
    this.color = '#e8864a'; // default Tenali warm orange
    this.strokeWidth = 6;
    this.isDrawing = false;
    this.showGuide = true;
    this.guideOpacity = 0.35;

    // Stroke tracking
    this.currentStroke = null;
    this.strokes = []; // list of { tool, color, width, points: [{x, y}] }

    // History for Undo/Redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 25;

    // Dimensions
    this.width = 600;
    this.height = 450;
    this.dpr = window.devicePixelRatio || 1;

    // Callbacks
    this.onStrokeEnd = null;
    this.onHistoryChange = null;

    this.init();
  }

  init() {
    this.setupResolution();
    this.setupEvents();
    this.saveState();
  }

  setupResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 600;
    const h = rect.height || 450;

    this.width = w;
    this.height = h;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.ctx.scale(this.dpr, this.dpr);

    if (this.guideCanvas) {
      this.guideCanvas.width = Math.floor(w * this.dpr);
      this.guideCanvas.height = Math.floor(h * this.dpr);
      this.guideCtx.scale(this.dpr, this.dpr);
    }

    this.redrawStrokes();
  }

  setupEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const onPointerDown = (e) => {
      e.preventDefault();
      sounds.init();
      const pos = getPos(e);

      if (this.tool === 'fill') {
        this.floodFill(Math.round(pos.x), Math.round(pos.y), this.color);
        sounds.playFill();
        this.saveState();
        if (this.onStrokeEnd) this.onStrokeEnd();
        return;
      }

      this.isDrawing = true;
      this.canvas.setPointerCapture(e.pointerId);

      this.currentStroke = {
        tool: this.tool,
        color: this.color,
        width: this.strokeWidth,
        points: [pos]
      };

      sounds.playDrawStroke();

      // Draw initial dot
      this.drawPoint(pos);
    };

    const onPointerMove = (e) => {
      if (!this.isDrawing || !this.currentStroke) return;
      e.preventDefault();
      const pos = getPos(e);
      const lastPos = this.currentStroke.points[this.currentStroke.points.length - 1];

      // Minimum distance filter to avoid redundant points
      const d = Math.hypot(pos.x - lastPos.x, pos.y - lastPos.y);
      if (d < 2) return;

      this.currentStroke.points.push(pos);
      this.drawSmoothSegment();
    };

    const onPointerUp = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}

      if (this.currentStroke && this.currentStroke.points.length > 0) {
        this.strokes.push(this.currentStroke);
        this.currentStroke = null;
        this.saveState();
        if (this.onStrokeEnd) this.onStrokeEnd();
      }
    };

    this.canvas.addEventListener('pointerdown', onPointerDown);
    this.canvas.addEventListener('pointermove', onPointerMove);
    this.canvas.addEventListener('pointerup', onPointerUp);
    this.canvas.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('resize', () => {
      // Debounce resize
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        const img = this.getImageData();
        this.setupResolution();
        if (img) this.putImageData(img);
      }, 150);
    });
  }

  drawPoint(p) {
    this.ctx.save();
    if (this.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.strokeWidth * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = this.color;
      this.ctx.globalAlpha = this.tool === 'marker' ? 0.45 : this.tool === 'crayon' ? 0.85 : 1.0;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.strokeWidth / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawSmoothSegment() {
    const pts = this.currentStroke.points;
    if (pts.length < 2) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
      this.ctx.lineWidth = this.strokeWidth * 3;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.strokeWidth;
      this.ctx.globalAlpha = this.tool === 'marker' ? 0.45 : this.tool === 'crayon' ? 0.82 : 1.0;
    }

    const p1 = pts[pts.length - 2];
    const p2 = pts[pts.length - 1];

    if (pts.length === 2) {
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    } else {
      const p0 = pts[pts.length - 3];
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      this.ctx.beginPath();
      this.ctx.moveTo(mid1.x, mid1.y);
      this.ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Flood fill algorithm for coloring in enclosed shapes
  floodFill(startX, startY, fillColorHex) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scaledX = Math.round(startX * this.dpr);
    const scaledY = Math.round(startY * this.dpr);

    if (scaledX < 0 || scaledX >= w || scaledY < 0 || scaledY >= h) return;

    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Target fill color parsed
    const fillRgb = this.hexToRgb(fillColorHex);
    const fillR = fillRgb.r;
    const fillG = fillRgb.g;
    const fillB = fillRgb.b;
    const fillA = 255;

    const startIndex = (scaledY * w + scaledX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];

    // If already the same color, skip
    if (
      Math.abs(startR - fillR) < 15 &&
      Math.abs(startG - fillG) < 15 &&
      Math.abs(startB - fillB) < 15 &&
      Math.abs(startA - fillA) < 15
    ) {
      return;
    }

    // Color match helper with tolerance
    const matchTolerance = 36;
    const colorMatch = (idx) => {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      return (
        Math.abs(r - startR) <= matchTolerance &&
        Math.abs(g - startG) <= matchTolerance &&
        Math.abs(b - startB) <= matchTolerance &&
        Math.abs(a - startA) <= matchTolerance
      );
    };

    // Fast BFS flood fill with queue
    const queue = [scaledX, scaledY];
    const visited = new Uint8Array(w * h);
    visited[scaledY * w + scaledX] = 1;

    let head = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const idx = (y * w + x) * 4;

      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = fillA;

      // 4-way neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nPos = ny * w + nx;
          if (!visited[nPos]) {
            visited[nPos] = 1;
            const nIdx = nPos * 4;
            if (colorMatch(nIdx)) {
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
  }

  hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  // Draw reference shape guideline onto the guide overlay canvas
  renderGuide(shapeObj, mode = 'trace') {
    if (!this.guideCtx) return;
    const w = this.width;
    const h = this.height;

    this.guideCtx.clearRect(0, 0, w, h);

    if (!shapeObj || !this.showGuide) return;

    this.guideCtx.save();

    // Subtle guide styling
    const isDark = document.body.getAttribute('data-theme') !== 'light';
    const guideColor = isDark ? 'rgba(232, 134, 74, 0.45)' : 'rgba(100, 116, 139, 0.45)';
    this.guideCtx.strokeStyle = guideColor;
    this.guideCtx.lineWidth = 2.5;
    this.guideCtx.setLineDash([6, 6]);

    // Parse SVG and draw path inside 80% of canvas area
    const scale = Math.min(w * 0.75, h * 0.75) / 100;
    const offsetX = (w - 100 * scale) / 2;
    const offsetY = (h - 100 * scale) / 2;

    this.guideCtx.translate(offsetX, offsetY);
    this.guideCtx.scale(scale, scale);

    // Create an Image from SVG string to render onto guide canvas
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${shapeObj.svg}</svg>`;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      this.guideCtx.save();
      this.guideCtx.globalAlpha = mode === 'trace' ? 0.45 : 0.22;
      this.guideCtx.drawImage(img, 0, 0, 100, 100);
      this.guideCtx.restore();
      URL.revokeObjectURL(url);
    };
    img.src = url;

    this.guideCtx.restore();
  }

  toggleGuide(forceState) {
    this.showGuide = forceState !== undefined ? forceState : !this.showGuide;
    if (this.guideCanvas) {
      this.guideCanvas.style.display = this.showGuide ? 'block' : 'none';
    }
    return this.showGuide;
  }

  // ── HISTORY / UNDO / REDO ──
  saveState() {
    const dataUrl = this.canvas.toDataURL();
    // Trim forward redo history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push({
      dataUrl,
      strokesCount: this.strokes.length
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    if (this.onHistoryChange) {
      this.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    this.historyIndex--;
    const state = this.history[this.historyIndex];
    this.loadState(state.dataUrl);
    if (this.strokes.length > state.strokesCount) {
      this.strokes = this.strokes.slice(0, state.strokesCount);
    }
    if (this.onHistoryChange) {
      this.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  redo() {
    if (!this.canRedo()) return;
    this.historyIndex++;
    const state = this.history[this.historyIndex];
    this.loadState(state.dataUrl);
    if (this.onHistoryChange) {
      this.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  loadState(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.drawImage(img, 0, 0, this.width, this.height);
    };
    img.src = dataUrl;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.strokes = [];
    this.currentStroke = null;
    this.saveState();
  }

  isEmpty() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const data = this.ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 10) return false;
    }
    return true;
  }

  // Extract all drawn pixel locations for analysis
  getPixelMask(sampleStep = 2) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const imgData = this.ctx.getImageData(0, 0, w, h).data;
    const pixels = [];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        const alpha = imgData[(y * w + x) * 4 + 3];
        if (alpha > 30) {
          const pt = { x: x / this.dpr, y: y / this.dpr };
          pixels.push(pt);
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }
      }
    }

    return {
      pixels,
      totalPixels: pixels.length,
      bounds: pixels.length > 0 ? { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY } : null
    };
  }

  // Detect distinct colors used by child (for coloring evaluation bonus)
  getColorStats() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const data = this.ctx.getImageData(0, 0, w, h).data;
    const colorMap = new Map();

    for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
      const a = data[i + 3];
      if (a > 60) {
        // Quantize RGB to 32-level buckets
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }

    return {
      uniqueColorCount: colorMap.size,
      hasColoring: colorMap.size >= 2
    };
  }

  getImageData() {
    try {
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    } catch (e) {
      return null;
    }
  }

  putImageData(data) {
    try {
      this.ctx.putImageData(data, 0, 0);
    } catch (e) {}
  }

  redrawStrokes() {
    // If resized, state will be maintained by saveState / history
  }
}
