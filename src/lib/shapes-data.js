/**
 * Canonical Shape Templates & Progression for FLN L39
 * Visual-first, minimal text design.
 */

export const SHAPES = {
  // ── BASIC 2D SHAPES ──
  circle: {
    id: 'circle',
    name: 'Circle',
    symbol: '⭕',
    category: 'basic',
    svg: '<circle cx="50" cy="50" r="31" />',
    properties: { type: 'circle', corners: 0, circularity: 0.88, aspect: 1.0 },
    canonicalPoints: generateCirclePoints(50, 50, 31, 64)
  },
  triangle: {
    id: 'triangle',
    name: 'Triangle',
    symbol: '🔺',
    category: 'basic',
    svg: '<polygon points="50,15 84,79 16,79" />',
    properties: { type: 'polygon', corners: 3, aspect: 1.05 },
    canonicalPoints: generatePolygonPoints([[50, 15], [84, 79], [16, 79]], 64)
  },
  square: {
    id: 'square',
    name: 'Square',
    symbol: '🟩',
    category: 'basic',
    svg: '<rect x="20" y="20" width="60" height="60" />',
    properties: { type: 'polygon', corners: 4, aspect: 1.0 },
    canonicalPoints: generatePolygonPoints([[20, 20], [80, 20], [80, 80], [20, 80]], 64)
  },
  rectangle: {
    id: 'rectangle',
    name: 'Rectangle',
    symbol: '🧱',
    category: 'basic',
    svg: '<rect x="12" y="29" width="76" height="42" />',
    properties: { type: 'polygon', corners: 4, aspect: 1.8 },
    canonicalPoints: generatePolygonPoints([[12, 29], [88, 29], [88, 71], [12, 71]], 64)
  },

  // ── ADVANCED POLYGONS & CURVES ──
  oval: {
    id: 'oval',
    name: 'Oval',
    symbol: '🥚',
    category: 'polygon',
    svg: '<ellipse cx="50" cy="50" rx="36" ry="24" />',
    properties: { type: 'curve', corners: 0, aspect: 1.5 },
    canonicalPoints: generateEllipsePoints(50, 50, 36, 24, 64)
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    symbol: '💎',
    category: 'polygon',
    svg: '<polygon points="50,12 84,50 50,88 16,50" />',
    properties: { type: 'polygon', corners: 4, aspect: 1.0 },
    canonicalPoints: generatePolygonPoints([[50, 12], [84, 50], [50, 88], [16, 50]], 64)
  },
  pentagon: {
    id: 'pentagon',
    name: 'Pentagon',
    symbol: '⬟',
    category: 'polygon',
    svg: '<polygon points="50,12 84,38 71,80 29,80 16,38" />',
    properties: { type: 'polygon', corners: 5, aspect: 1.0 },
    canonicalPoints: generatePolygonPoints([[50, 12], [84, 38], [71, 80], [29, 80], [16, 38]], 64)
  },
  hexagon: {
    id: 'hexagon',
    name: 'Hexagon',
    symbol: '⬡',
    category: 'polygon',
    svg: '<polygon points="30,16 70,16 88,50 70,84 30,84 12,50" />',
    properties: { type: 'polygon', corners: 6, aspect: 1.1 },
    canonicalPoints: generatePolygonPoints([[30, 16], [70, 16], [88, 50], [70, 84], [30, 84], [12, 50]], 64)
  },

  // ── COMPOSITE OBJECTS FROM WORKSHEET ──
  house: {
    id: 'house',
    name: 'Hut',
    symbol: '🏠',
    category: 'object',
    svg: '<polygon points="14,44 50,14 86,44" /><rect x="22" y="44" width="56" height="44" /><rect x="44" y="62" width="12" height="26" /><rect x="29" y="53" width="10" height="10" /><rect x="61" y="53" width="10" height="10" />',
    properties: { type: 'composite', parts: ['roof', 'base'] },
    canonicalPoints: generateMultiPartPoints([
      [[14, 44], [50, 14], [86, 44]],
      [[22, 44], [78, 44], [78, 88], [22, 88]]
    ], 64)
  },
  tree: {
    id: 'tree',
    name: 'Tree',
    symbol: '🌲',
    category: 'object',
    svg: '<polygon points="50,12 25,47 38,47 19,68 42,68 42,88 58,88 58,68 81,68 62,47 75,47" /><path d="M50 68V88" />',
    properties: { type: 'composite', parts: ['foliage', 'trunk'] },
    canonicalPoints: generatePolygonPoints([[50, 12], [25, 47], [38, 47], [19, 68], [42, 68], [42, 88], [58, 88], [58, 68], [81, 68], [62, 47], [75, 47]], 64)
  },
  car: {
    id: 'car',
    name: 'Car',
    symbol: '🚗',
    category: 'object',
    svg: '<path d="M10 61 L20 53 L31 42 H69 L80 53 L90 61 V72 H10 Z" /><circle cx="28" cy="72" r="9" /><circle cx="28" cy="72" r="4" /><circle cx="72" cy="72" r="9" /><circle cx="72" cy="72" r="4" />',
    properties: { type: 'composite', parts: ['body', 'wheels'] },
    canonicalPoints: generateMultiPartPoints([
      [[10, 61], [20, 53], [31, 42], [69, 42], [80, 53], [90, 61], [90, 72], [10, 72]],
      generateCirclePoints(28, 72, 9, 16),
      generateCirclePoints(72, 72, 9, 16)
    ], 64)
  },
  flower: {
    id: 'flower',
    name: 'Flower',
    symbol: '🌸',
    category: 'object',
    svg: '<circle cx="50" cy="37" r="10" /><circle cx="50" cy="18" r="9" /><circle cx="69" cy="37" r="9" /><circle cx="50" cy="56" r="9" /><circle cx="31" cy="37" r="9" /><path d="M50 47 V88 M50 68 Q37 55 30 68 Q40 78 50 68" />',
    properties: { type: 'composite', parts: ['center', 'petals', 'stem'] },
    canonicalPoints: generateCirclePoints(50, 37, 24, 64)
  },
  boat: {
    id: 'boat',
    name: 'Boat',
    symbol: '⛵',
    category: 'object',
    svg: '<path d="M12 57 H88 L72 78 H29 Z" /><path d="M48 18 V56 M50 22 L76 49 H50 Z M44 29 L23 49 H44 Z" /><path d="M20 86 Q30 81 40 86 T60 86 T80 86" />',
    properties: { type: 'composite', parts: ['hull', 'sail'] },
    canonicalPoints: generateMultiPartPoints([
      [[12, 57], [88, 57], [72, 78], [29, 78]],
      [[50, 22], [76, 49], [50, 49]]
    ], 64)
  },
  fish: {
    id: 'fish',
    name: 'Fish',
    symbol: '🐟',
    category: 'object',
    svg: '<path d="M15 50 Q35 22 65 43 L84 29 V70 L65 57 Q35 78 15 50 Z" /><circle cx="31" cy="45" r="2.5" /><path d="M47 39 Q57 50 47 61" />',
    properties: { type: 'composite', parts: ['body', 'tail'] },
    canonicalPoints: generatePolygonPoints([[15, 50], [40, 26], [65, 43], [84, 29], [84, 70], [65, 57], [40, 74]], 64)
  },
  sun: {
    id: 'sun',
    name: 'Sun',
    symbol: '☀️',
    category: 'object',
    svg: '<circle cx="50" cy="50" r="19" /><path d="M50 12 V23 M50 77 V88 M12 50 H23 M77 50 H88 M23 23 L31 31 M69 69 L77 77 M77 23 L69 31 M31 69 L23 77" />',
    properties: { type: 'composite', parts: ['core', 'rays'] },
    canonicalPoints: generateCirclePoints(50, 50, 19, 64)
  },
  kite: {
    id: 'kite',
    name: 'Kite',
    symbol: '🪁',
    category: 'object',
    svg: '<polygon points="50,12 78,43 50,73 22,43" /><path d="M50 12 V73 M22 43 H78 M50 73 Q64 78 57 87 Q48 91 56 96" />',
    properties: { type: 'composite', parts: ['diamond', 'tail'] },
    canonicalPoints: generatePolygonPoints([[50, 12], [78, 43], [50, 73], [22, 43]], 64)
  }
};

export const STAGES = [
  { id: 's1', num: '1', title: 'Trace', mode: 'trace', shapes: ['circle', 'triangle', 'square', 'rectangle'] },
  { id: 's2', num: '2', title: 'Draw', mode: 'copy', shapes: ['circle', 'triangle', 'square', 'rectangle'] },
  { id: 's3', num: '3', title: 'Polygons', mode: 'copy', shapes: ['oval', 'diamond', 'pentagon', 'hexagon'] },
  { id: 's4', num: '4', title: 'Objects 1', mode: 'object', shapes: ['house', 'tree', 'car', 'flower'] },
  { id: 's5', num: '5', title: 'Objects 2', mode: 'object', shapes: ['boat', 'fish', 'sun', 'kite'] },
  { id: 's6', num: '6', title: 'Sort', mode: 'sort', shapes: ['circle', 'oval', 'square', 'rectangle', 'triangle'] }
];

export const PALETTE = [
  '#e8864a', '#ff4d4d', '#ff9800', '#ffeb3b',
  '#4caf50', '#26a69a', '#29b6f6', '#1976d2',
  '#7e57c2', '#ec407a', '#8d6e63', '#212121', '#ffffff'
];

// Helper point generators
function generateCirclePoints(cx, cy, r, count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return pts;
}

function generateEllipsePoints(cx, cy, rx, ry, count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry });
  }
  return pts;
}

function generatePolygonPoints(vertices, count) {
  const pts = [];
  const n = vertices.length;
  const perSide = Math.floor(count / n);
  for (let i = 0; i < n; i++) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % n];
    for (let j = 0; j < perSide; j++) {
      const t = j / perSide;
      pts.push({
        x: v1[0] + (v2[0] - v1[0]) * t,
        y: v1[1] + (v2[1] - v1[1]) * t
      });
    }
  }
  while (pts.length < count) pts.push(pts[pts.length - 1]);
  return pts.slice(0, count);
}

function generateMultiPartPoints(parts, count) {
  const all = [];
  parts.forEach(part => {
    if (Array.isArray(part) && part[0] && typeof part[0].x === 'number') {
      all.push(...part);
    } else if (Array.isArray(part)) {
      part.forEach(p => all.push({ x: p[0], y: p[1] }));
    }
  });
  // Subsample to count
  const result = [];
  const step = Math.max(1, Math.floor(all.length / count));
  for (let i = 0; i < all.length && result.length < count; i += step) {
    result.push(all[i]);
  }
  while (result.length < count && result.length > 0) result.push(result[result.length - 1]);
  return result;
}
