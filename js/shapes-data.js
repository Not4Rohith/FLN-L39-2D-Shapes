/**
 * FLN L39 SHAPES DATA - MINIMAL TEXT VERSION
 * Visual-first shape & stage definitions for young children (FLN Level 39)
 * Minimal text, heavy on visual cues and iconography.
 */

const SHAPES_DATA = {
  // ── BASIC 2D SHAPES ──
  circle: {
    id: 'circle',
    name: 'Circle',
    symbol: '⭕',
    level: 1,
    category: 'basic',
    svg: '<circle cx="50" cy="50" r="31" />',
    guideSvg: '<circle cx="50" cy="50" r="31" />',
    properties: {
      type: 'circle',
      expectedCorners: 0,
      aspectRatio: 1.0,
      circularity: 0.88
    }
  },
  triangle: {
    id: 'triangle',
    name: 'Triangle',
    symbol: '🔺',
    level: 1,
    category: 'basic',
    svg: '<polygon points="50,15 84,79 16,79" />',
    guideSvg: '<polygon points="50,15 84,79 16,79" />',
    properties: {
      type: 'polygon',
      expectedCorners: 3,
      aspectRatio: 1.05,
      circularity: 0.58
    }
  },
  square: {
    id: 'square',
    name: 'Square',
    symbol: '🟩',
    level: 1,
    category: 'basic',
    svg: '<rect x="20" y="20" width="60" height="60" />',
    guideSvg: '<rect x="20" y="20" width="60" height="60" />',
    properties: {
      type: 'polygon',
      expectedCorners: 4,
      aspectRatio: 1.0,
      circularity: 0.75
    }
  },
  rectangle: {
    id: 'rectangle',
    name: 'Rectangle',
    symbol: '🧱',
    level: 1,
    category: 'basic',
    svg: '<rect x="12" y="29" width="76" height="42" />',
    guideSvg: '<rect x="12" y="29" width="76" height="42" />',
    properties: {
      type: 'polygon',
      expectedCorners: 4,
      aspectRatio: 1.8,
      circularity: 0.65
    }
  },

  // ── ADVANCED POLYGONS & CURVES ──
  oval: {
    id: 'oval',
    name: 'Oval',
    symbol: '🥚',
    level: 2,
    category: 'polygon',
    svg: '<ellipse cx="50" cy="50" rx="36" ry="24" />',
    guideSvg: '<ellipse cx="50" cy="50" rx="36" ry="24" />',
    properties: {
      type: 'curve',
      expectedCorners: 0,
      aspectRatio: 1.5,
      circularity: 0.78
    }
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    symbol: '💎',
    level: 2,
    category: 'polygon',
    svg: '<polygon points="50,12 84,50 50,88 16,50" />',
    guideSvg: '<polygon points="50,12 84,50 50,88 16,50" />',
    properties: {
      type: 'polygon',
      expectedCorners: 4,
      aspectRatio: 1.0,
      circularity: 0.68
    }
  },
  pentagon: {
    id: 'pentagon',
    name: 'Pentagon',
    symbol: '⬟',
    level: 2,
    category: 'polygon',
    svg: '<polygon points="50,12 84,38 71,80 29,80 16,38" />',
    guideSvg: '<polygon points="50,12 84,38 71,80 29,80 16,38" />',
    properties: {
      type: 'polygon',
      expectedCorners: 5,
      aspectRatio: 1.0,
      circularity: 0.77
    }
  },
  hexagon: {
    id: 'hexagon',
    name: 'Hexagon',
    symbol: '⬡',
    level: 2,
    category: 'polygon',
    svg: '<polygon points="30,16 70,16 88,50 70,84 30,84 12,50" />',
    guideSvg: '<polygon points="30,16 70,16 88,50 70,84 30,84 12,50" />',
    properties: {
      type: 'polygon',
      expectedCorners: 6,
      aspectRatio: 1.1,
      circularity: 0.82
    }
  },

  // ── OBJECTS FROM WORKSHEET ──
  house: {
    id: 'house',
    name: 'Hut',
    symbol: '🏠',
    level: 3,
    category: 'object',
    svg: '<polygon points="14,44 50,14 86,44" /><rect x="22" y="44" width="56" height="44" /><rect x="44" y="62" width="12" height="26" /><rect x="29" y="53" width="10" height="10" /><rect x="61" y="53" width="10" height="10" />',
    guideSvg: '<polygon points="14,44 50,14 86,44" /><rect x="22" y="44" width="56" height="44" /><rect x="44" y="62" width="12" height="26" /><rect x="29" y="53" width="10" height="10" /><rect x="61" y="53" width="10" height="10" />',
    properties: {
      type: 'composite'
    }
  },
  tree: {
    id: 'tree',
    name: 'Tree',
    symbol: '🌲',
    level: 3,
    category: 'object',
    svg: '<polygon points="50,12 25,47 38,47 19,68 42,68 42,88 58,88 58,68 81,68 62,47 75,47" /><path d="M50 68V88" />',
    guideSvg: '<polygon points="50,12 25,47 38,47 19,68 42,68 42,88 58,88 58,68 81,68 62,47 75,47" /><path d="M50 68V88" />',
    properties: {
      type: 'composite'
    }
  },
  car: {
    id: 'car',
    name: 'Car',
    symbol: '🚗',
    level: 3,
    category: 'object',
    svg: '<path d="M10 61 L20 53 L31 42 H69 L80 53 L90 61 V72 H10 Z" /><circle cx="28" cy="72" r="9" /><circle cx="28" cy="72" r="4" /><circle cx="72" cy="72" r="9" /><circle cx="72" cy="72" r="4" />',
    guideSvg: '<path d="M10 61 L20 53 L31 42 H69 L80 53 L90 61 V72 H10 Z" /><circle cx="28" cy="72" r="9" /><circle cx="28" cy="72" r="4" /><circle cx="72" cy="72" r="9" /><circle cx="72" cy="72" r="4" />',
    properties: {
      type: 'composite'
    }
  },
  flower: {
    id: 'flower',
    name: 'Flower',
    symbol: '🌸',
    level: 3,
    category: 'object',
    svg: '<circle cx="50" cy="37" r="10" /><circle cx="50" cy="18" r="9" /><circle cx="69" cy="37" r="9" /><circle cx="50" cy="56" r="9" /><circle cx="31" cy="37" r="9" /><path d="M50 47 V88 M50 68 Q37 55 30 68 Q40 78 50 68" />',
    guideSvg: '<circle cx="50" cy="37" r="10" /><circle cx="50" cy="18" r="9" /><circle cx="69" cy="37" r="9" /><circle cx="50" cy="56" r="9" /><circle cx="31" cy="37" r="9" /><path d="M50 47 V88 M50 68 Q37 55 30 68 Q40 78 50 68" />',
    properties: {
      type: 'composite'
    }
  },
  boat: {
    id: 'boat',
    name: 'Boat',
    symbol: '⛵',
    level: 4,
    category: 'object',
    svg: '<path d="M12 57 H88 L72 78 H29 Z" /><path d="M48 18 V56 M50 22 L76 49 H50 Z M44 29 L23 49 H44 Z" /><path d="M20 86 Q30 81 40 86 T60 86 T80 86" />',
    guideSvg: '<path d="M12 57 H88 L72 78 H29 Z" /><path d="M48 18 V56 M50 22 L76 49 H50 Z M44 29 L23 49 H44 Z" /><path d="M20 86 Q30 81 40 86 T60 86 T80 86" />',
    properties: {
      type: 'composite'
    }
  },
  fish: {
    id: 'fish',
    name: 'Fish',
    symbol: '🐟',
    level: 4,
    category: 'object',
    svg: '<path d="M15 50 Q35 22 65 43 L84 29 V70 L65 57 Q35 78 15 50 Z" /><circle cx="31" cy="45" r="2.5" /><path d="M47 39 Q57 50 47 61" />',
    guideSvg: '<path d="M15 50 Q35 22 65 43 L84 29 V70 L65 57 Q35 78 15 50 Z" /><circle cx="31" cy="45" r="2.5" /><path d="M47 39 Q57 50 47 61" />',
    properties: {
      type: 'composite'
    }
  },
  sun: {
    id: 'sun',
    name: 'Sun',
    symbol: '☀️',
    level: 4,
    category: 'object',
    svg: '<circle cx="50" cy="50" r="19" /><path d="M50 12 V23 M50 77 V88 M12 50 H23 M77 50 H88 M23 23 L31 31 M69 69 L77 77 M77 23 L69 31 M31 69 L23 77" />',
    guideSvg: '<circle cx="50" cy="50" r="19" /><path d="M50 12 V23 M50 77 V88 M12 50 H23 M77 50 H88 M23 23 L31 31 M69 69 L77 77 M77 23 L69 31 M31 69 L23 77" />',
    properties: {
      type: 'composite'
    }
  },
  kite: {
    id: 'kite',
    name: 'Kite',
    symbol: '🪁',
    level: 4,
    category: 'object',
    svg: '<polygon points="50,12 78,43 50,73 22,43" /><path d="M50 12 V73 M22 43 H78 M50 73 Q64 78 57 87 Q48 91 56 96" />',
    guideSvg: '<polygon points="50,12 78,43 50,73 22,43" /><path d="M50 12 V73 M22 43 H78 M50 73 Q64 78 57 87 Q48 91 56 96" />',
    properties: {
      type: 'composite'
    }
  }
};

// ── PROGRESSION STAGES (MINIMAL TEXT - VISUAL LABELS) ──
const GAME_LEVELS = [
  {
    id: 'stage-1',
    levelNumber: 1,
    title: '1',
    icon: '✍️',
    mode: 'trace', // guide line visible on canvas
    shapes: ['circle', 'triangle', 'square', 'rectangle']
  },
  {
    id: 'stage-2',
    levelNumber: 2,
    title: '2',
    icon: '🎯',
    mode: 'copy',
    shapes: ['circle', 'triangle', 'square', 'rectangle']
  },
  {
    id: 'stage-3',
    levelNumber: 3,
    title: '3',
    icon: '💎',
    mode: 'copy',
    shapes: ['oval', 'diamond', 'pentagon', 'hexagon']
  },
  {
    id: 'stage-4',
    levelNumber: 4,
    title: '4',
    icon: '🏠',
    mode: 'object',
    shapes: ['house', 'tree', 'car', 'flower']
  },
  {
    id: 'stage-5',
    levelNumber: 5,
    title: '5',
    icon: '⛵',
    mode: 'object',
    shapes: ['boat', 'fish', 'sun', 'kite']
  },
  {
    id: 'stage-6',
    levelNumber: 6,
    title: '★',
    icon: '🎨',
    mode: 'free',
    shapes: ['circle', 'triangle', 'square', 'rectangle', 'oval', 'diamond', 'pentagon', 'hexagon', 'house', 'tree', 'car', 'flower', 'boat', 'fish', 'sun', 'kite']
  }
];

// Rich kid-friendly color palette with large visual swatches
const PALETTE = [
  '#e8864a', // Tenali Orange
  '#ff4d4d', // Red
  '#ff9800', // Amber
  '#ffeb3b', // Yellow
  '#4caf50', // Green
  '#26a69a', // Teal
  '#29b6f6', // Light Blue
  '#1976d2', // Blue
  '#7e57c2', // Purple
  '#ec407a', // Pink
  '#8d6e63', // Brown
  '#212121', // Black
  '#ffffff'  // White
];
