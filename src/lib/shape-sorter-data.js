/**
 * Shape Sorter Data - Level 6
 * Contains all 52 everyday object SVGs categorized into 5 basic shapes:
 * Circle, Oval, Square, Rectangle, Triangle
 */

export const SHAPE_TYPES = {
  circle: {
    id: 'circle',
    color: '#e8864a',
    bgLight: '#fff7ed',
    borderColor: '#fdba74'
  },
  oval: {
    id: 'oval',
    color: '#10b981',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7'
  },
  square: {
    id: 'square',
    color: '#3b82f6',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd'
  },
  rectangle: {
    id: 'rectangle',
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd'
  },
  triangle: {
    id: 'triangle',
    color: '#ec4899',
    bgLight: '#fdf2f8',
    borderColor: '#f9a8d4'
  }
};

export const ALL_OBJECTS = [
  // ── CIRCLES (9) ──
  { id: 'coin', name: 'Coin', shape: 'circle' },
  { id: 'clock', name: 'Clock', shape: 'circle' },
  { id: 'biscuit', name: 'Biscuit', shape: 'circle' },
  { id: 'button', name: 'Button', shape: 'circle' },
  { id: 'plate', name: 'Plate', shape: 'circle' },
  { id: 'pizza', name: 'Pizza', shape: 'circle' },
  { id: 'wheel', name: 'Wheel', shape: 'circle' },
  { id: 'donut', name: 'Donut', shape: 'circle' },
  { id: 'ball', name: 'Ball', shape: 'circle' },

  // ── OVALS (9) ──
  { id: 'egg', name: 'Egg', shape: 'oval' },
  { id: 'rugby', name: 'Rugby ball', shape: 'oval' },
  { id: 'chips', name: 'Potato chip', shape: 'oval' },
  { id: 'fried', name: 'Fried egg', shape: 'oval' },
  { id: 'omirror', name: 'Hand mirror', shape: 'oval' },
  { id: 'balloon', name: 'Balloon', shape: 'oval' },
  { id: 'leaf', name: 'Leaf', shape: 'oval' },
  { id: 'platter', name: 'Platter', shape: 'oval' },
  { id: 'pebble', name: 'Pebble', shape: 'oval' },

  // ── SQUARES (12) ──
  { id: 'chess', name: 'Chessboard', shape: 'square' },
  { id: 'dice', name: 'Dice', shape: 'square' },
  { id: 'sticky', name: 'Sticky note', shape: 'square' },
  { id: 'frame', name: 'Photo frame', shape: 'square' },
  { id: 'bread', name: 'Bread slice', shape: 'square' },
  { id: 'cracker', name: 'Cracker', shape: 'square' },
  { id: 'tile', name: 'Floor tile', shape: 'square' },
  { id: 'hanky', name: 'Handkerchief', shape: 'square' },
  { id: 'cube', name: 'Cube face', shape: 'square' },
  { id: 'waffle', name: 'Waffle', shape: 'square' },
  { id: 'gift', name: 'Gift box', shape: 'square' },
  { id: 'calendar', name: 'Calendar page', shape: 'square' },

  // ── RECTANGLES (11) ──
  { id: 'laptop', name: 'Laptop', shape: 'rectangle' },
  { id: 'window', name: 'Window', shape: 'rectangle' },
  { id: 'mirror', name: 'Mirror', shape: 'rectangle' },
  { id: 'wall', name: 'Brick wall', shape: 'rectangle' },
  { id: 'brick', name: 'Brick', shape: 'rectangle' },
  { id: 'door', name: 'Door', shape: 'rectangle' },
  { id: 'book', name: 'Book', shape: 'rectangle' },
  { id: 'tv', name: 'Television', shape: 'rectangle' },
  { id: 'choc', name: 'Chocolate bar', shape: 'rectangle' },
  { id: 'envelope', name: 'Envelope', shape: 'rectangle' },
  { id: 'phone', name: 'Phone', shape: 'rectangle' },

  // ── TRIANGLES (11) ──
  { id: 'sandwich', name: 'Sandwich', shape: 'triangle' },
  { id: 'gamepad', name: 'Gamepad', shape: 'triangle' },
  { id: 'slice', name: 'Pizza slice', shape: 'triangle' },
  { id: 'tent', name: 'Tent', shape: 'triangle' },
  { id: 'hat', name: 'Party hat', shape: 'triangle' },
  { id: 'sign', name: 'Warning sign', shape: 'triangle' },
  { id: 'samosa', name: 'Samosa', shape: 'triangle' },
  { id: 'house', name: 'House roof', shape: 'triangle' },
  { id: 'tree', name: 'Christmas tree', shape: 'triangle' },
  { id: 'pennant', name: 'Pennant', shape: 'triangle' },
  { id: 'cheese', name: 'Cheese wedge', shape: 'triangle' }
];

/**
 * Get a set of initial random objects ensuring balanced representation across shapes.
 */
export function getInitialTopBarObjects(count = 5) {
  const shapes = ['circle', 'oval', 'square', 'rectangle', 'triangle'];
  // Shuffle shapes
  const shuffledShapes = [...shapes].sort(() => Math.random() - 0.5);

  const selected = [];
  shuffledShapes.slice(0, count).forEach(shape => {
    const matching = ALL_OBJECTS.filter(o => o.shape === shape);
    const item = matching[Math.floor(Math.random() * matching.length)];
    selected.push({ ...item, instanceKey: `${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` });
  });

  return selected;
}

/**
 * Get next object to slide in, trying to avoid immediate repeats of objects currently visible.
 */
export function getNextTopBarObject(currentVisibleIds = []) {
  const available = ALL_OBJECTS.filter(o => !currentVisibleIds.includes(o.id));
  const pool = available.length > 0 ? available : ALL_OBJECTS;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...picked,
    instanceKey: `${picked.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };
}
