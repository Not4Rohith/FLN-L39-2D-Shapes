import React, { useRef, useState, useEffect } from 'react';
import { getStroke } from 'perfect-freehand';
import { audio } from '../lib/audio.js';
import { PALETTE } from '../lib/shapes-data.js';
import { 
  Pencil, 
  Paintbrush, 
  Highlighter, 
  PaintBucket, 
  Eraser, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Rocket, 
  Star 
} from 'lucide-react';

export default function DrawingCanvas({
  targetShape,
  showGuide,
  isTraceMode = false,
  isVisualAid = false,
  onSubmit,
  canvasRefExport
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [tool, setTool] = useState('pencil'); // pencil, crayon, marker, fill, eraser
  const [color, setColor] = useState('#e8864a');
  const [size, setSize] = useState(8);

  // Stroke data: Array of { tool, color, size, points: [{x, y, pressure}] }
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Sync canvas ref for evaluator
  useEffect(() => {
    if (canvasRefExport) {
      canvasRefExport.current = {
        getCanvas: () => canvasRef.current,
        getStrokes: () => strokes,
        clear: handleClear
      };
    }
  }, [strokes, canvasRefExport]);

  // Setup resolution & DPI
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      redrawAll(strokes);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw whenever strokes change
  useEffect(() => {
    redrawAll(strokes);
  }, [strokes]);

  // Redraw all strokes with perfect-freehand
  const redrawAll = (strokeList) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    strokeList.forEach(s => {
      if (!s.points || s.points.length === 0) return;

      if (s.tool === 'eraser') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        s.points.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = s.size * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.tool === 'marker' ? 0.45 : s.tool === 'crayon' ? 0.85 : 1.0;

      // perfect-freehand stroke options
      const strokeOptions = {
        size: s.size,
        thinning: s.tool === 'crayon' ? 0.2 : 0.5,
        smoothing: 0.65,
        streamline: 0.5,
        simulatePressure: true
      };

      const outlinePoints = getStroke(s.points, strokeOptions);
      if (outlinePoints.length > 2) {
        ctx.beginPath();
        ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);
        for (let i = 1; i < outlinePoints.length; i++) {
          ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  };

  // Pointer event handlers
  const handlePointerDown = (e) => {
    e.preventDefault();
    audio.init();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;

    if (tool === 'fill') {
      floodFill(Math.round(x), Math.round(y), color);
      audio.playFill();
      saveToHistory();
      return;
    }

    canvas.setPointerCapture(e.pointerId);
    audio.playPop(360);

    const newStroke = {
      tool,
      color,
      size,
      points: [{ x, y, pressure }]
    };

    setCurrentStroke(newStroke);
    redrawAll([...strokes, newStroke]);
  };

  const handlePointerMove = (e) => {
    if (!currentStroke) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;

    const lastPt = currentStroke.points[currentStroke.points.length - 1];
    if (Math.hypot(x - lastPt.x, y - lastPt.y) < 2) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, { x, y, pressure }]
    };

    setCurrentStroke(updatedStroke);
    redrawAll([...strokes, updatedStroke]);
  };

  const handlePointerUp = (e) => {
    if (!currentStroke) return;
    try {
      canvasRef.current.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);
    saveToHistory(newStrokes);
  };

  // BFS Flood Fill for Coloring
  const floodFill = (startX, startY, fillHex) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width;
    const h = canvas.height;
    const sx = Math.round(startX * dpr);
    const sy = Math.round(startY * dpr);

    if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Convert hex to rgb
    const c = fillHex.replace('#', '');
    const num = parseInt(c.length === 3 ? c[0]+c[0]+c[1]+c[1]+c[2]+c[2] : c, 16);
    const fr = (num >> 16) & 255;
    const fg = (num >> 8) & 255;
    const fb = num & 255;

    const startIndex = (sy * w + sx) * 4;
    const sr = data[startIndex];
    const sg = data[startIndex + 1];
    const sb = data[startIndex + 2];
    const sa = data[startIndex + 3];

    if (Math.abs(sr - fr) < 15 && Math.abs(sg - fg) < 15 && Math.abs(sb - fb) < 15 && sa > 200) return;

    const matchTolerance = 45;
    const match = (idx) => {
      return (
        Math.abs(data[idx] - sr) <= matchTolerance &&
        Math.abs(data[idx + 1] - sg) <= matchTolerance &&
        Math.abs(data[idx + 2] - sb) <= matchTolerance &&
        Math.abs(data[idx + 3] - sa) <= matchTolerance
      );
    };

    const queue = [sx, sy];
    const visited = new Uint8Array(w * h);
    visited[sy * w + sx] = 1;

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const idx = (cy * w + cx) * 4;

      data[idx] = fr;
      data[idx + 1] = fg;
      data[idx + 2] = fb;
      data[idx + 3] = 255;

      const nbs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (let i = 0; i < 4; i++) {
        const nx = nbs[i][0];
        const ny = nbs[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const pos = ny * w + nx;
          if (!visited[pos]) {
            visited[pos] = 1;
            if (match(pos * 4)) {
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // History Undo / Redo
  const saveToHistory = (newStrokes = strokes) => {
    const trimmed = history.slice(0, historyIndex + 1);
    const updated = [...trimmed, newStrokes];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setStrokes(prev);
      audio.playPop(420);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setStrokes([]);
      audio.playPop(350);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setStrokes(next);
      audio.playPop(460);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    saveToHistory([]);
    audio.playPop(300);
  };

  return (
    <section className="draw-card">
      {/* Visual Toolbar (Icons Only) */}
      <div className="canvas-toolbar">
        {/* Tools: Pencil, Crayon, Marker, Fill, Eraser */}
        <div className="tool-group">
          <button
            className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
            onClick={() => { setTool('pencil'); audio.playPop(500); }}
            title="Pencil"
          >
            <Pencil size={20} />
          </button>
          <button
            className={`tool-btn ${tool === 'crayon' ? 'active' : ''}`}
            onClick={() => { setTool('crayon'); audio.playPop(520); }}
            title="Crayon"
          >
            <Paintbrush size={20} />
          </button>
          <button
            className={`tool-btn ${tool === 'marker' ? 'active' : ''}`}
            onClick={() => { setTool('marker'); audio.playPop(540); }}
            title="Marker"
          >
            <Highlighter size={20} />
          </button>
          <button
            className={`tool-btn ${tool === 'fill' ? 'active' : ''}`}
            onClick={() => { setTool('fill'); audio.playPop(560); }}
            title="Fill"
          >
            <PaintBucket size={20} />
          </button>
          <button
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => { setTool('eraser'); audio.playPop(480); }}
            title="Eraser"
          >
            <Eraser size={20} />
          </button>
        </div>

        {/* Sizes: Small, Medium, Large */}
        <div className="tool-group">
          <button
            className={`size-btn size-sm ${size === 4 ? 'active' : ''}`}
            onClick={() => { setSize(4); audio.playPop(450); }}
          >
            <span className="size-dot"></span>
          </button>
          <button
            className={`size-btn size-md ${size === 8 ? 'active' : ''}`}
            onClick={() => { setSize(8); audio.playPop(500); }}
          >
            <span className="size-dot"></span>
          </button>
          <button
            className={`size-btn size-lg ${size === 16 ? 'active' : ''}`}
            onClick={() => { setSize(16); audio.playPop(550); }}
          >
            <span className="size-dot"></span>
          </button>
        </div>

        {/* History: Undo, Redo, Clear */}
        <div className="tool-group">
          <button className="tool-btn" onClick={handleUndo} title="Undo">
            <RotateCcw size={20} />
          </button>
          <button className="tool-btn" onClick={handleRedo} title="Redo">
            <RotateCw size={20} />
          </button>
          <button className="tool-btn" onClick={handleClear} title="Clear">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Color Ribbon */}
      <div className="color-ribbon">
        {PALETTE.map((hex) => (
          <div
            key={hex}
            className={`color-swatch ${color === hex && tool !== 'eraser' ? 'active' : ''}`}
            style={{ backgroundColor: hex }}
            onClick={() => {
              setColor(hex);
              if (tool === 'eraser') setTool('pencil');
              audio.playPop(580);
            }}
          />
        ))}
      </div>

      {/* Canvas Viewport */}
      <div className="canvas-wrapper" ref={containerRef}>
        {/* Vector SVG Tracing Outline Overlay */}
        {showGuide && targetShape && (
          <div
            className={`canvas-guide-overlay ${isTraceMode ? 'trace-mode' : isVisualAid ? 'aid-mode' : 'normal-mode'}`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 100 100"
              className="canvas-guide-svg"
              dangerouslySetInnerHTML={{ __html: targetShape.svg }}
            />
          </div>
        )}

        {/* Dynamic Mode / Aid Badge */}
        {isTraceMode && (
          <div className="canvas-badge trace-badge">
            <span className="badge-icon">✏️</span>
            <span>Trace Mode</span>
          </div>
        )}
        {!isTraceMode && isVisualAid && (
          <div className="canvas-badge aid-badge">
            <span className="badge-icon">💡</span>
            <span>Follow the dashed line</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="canvas-layer"
          id="drawCanvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {/* Bottom Bar: Clear & Big Glowing Submit Button */}
      <div className="bottom-bar">
        <button className="clear-btn" onClick={handleClear} title="Clear">
          <Trash2 size={24} />
        </button>
        <button
          className="submit-btn"
          onClick={() => onSubmit(strokes, canvasRef.current)}
          title="Submit"
        >
          <Rocket size={26} />
          <Star size={26} fill="#ffffff" />
        </button>
      </div>
    </section>
  );
}
