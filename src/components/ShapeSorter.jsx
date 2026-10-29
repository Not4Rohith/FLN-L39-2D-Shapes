import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { SHAPE_TYPES, ALL_OBJECTS, getInitialTopBarObjects, getNextTopBarObject } from '../lib/shape-sorter-data.js';
import { audio } from '../lib/audio.js';

function renderStencil(shapeKey) {
  switch (shapeKey) {
    case 'circle':
      return (
        <svg viewBox="0 0 100 100" className="stencil-svg" aria-hidden="true">
          <circle cx="50" cy="50" r="38" className="stencil-path" />
          <circle cx="50" cy="50" r="28" className="stencil-watermark" />
        </svg>
      );
    case 'oval':
      return (
        <svg viewBox="0 0 100 100" className="stencil-svg" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="44" ry="28" className="stencil-path" />
          <ellipse cx="50" cy="50" rx="34" ry="20" className="stencil-watermark" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 100 100" className="stencil-svg" aria-hidden="true">
          <rect x="16" y="16" width="68" height="68" rx="8" className="stencil-path" />
          <rect x="28" y="28" width="44" height="44" rx="4" className="stencil-watermark" />
          <path d="M16 28 H28 V16 M84 28 H72 V16 M16 72 H28 V84 M84 72 H72 V84" className="stencil-corner" />
        </svg>
      );
    case 'rectangle':
      return (
        <svg viewBox="0 0 100 100" className="stencil-svg" aria-hidden="true">
          <rect x="8" y="24" width="84" height="52" rx="8" className="stencil-path" />
          <rect x="20" y="34" width="60" height="32" rx="4" className="stencil-watermark" />
          <path d="M8 36 H18 V24 M92 36 H82 V24 M8 64 H18 V76 M92 64 H82 V76" className="stencil-corner" />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" className="stencil-svg" aria-hidden="true">
          <polygon points="50,14 88,82 12,82" className="stencil-path" />
          <polygon points="50,30 76,74 24,74" className="stencil-watermark" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ShapeSorter({ onStarEarned }) {
  // Conveyor / Top Bar items (5 active objects)
  const [topBarItems, setTopBarItems] = useState(() => getInitialTopBarObjects(5));

  // Collected items per shape category
  const [collected, setCollected] = useState({
    circle: [],
    oval: [],
    square: [],
    rectangle: [],
    triangle: []
  });

  // Selected item (for tap-to-place fallback)
  const [selectedItemKey, setSelectedItemKey] = useState(null);

  // Dragging state
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredShape, setHoveredShape] = useState(null);

  // Animation states for drop feedback
  const [bouncingShape, setBouncingShape] = useState(null);
  const [shakingShape, setShakingShape] = useState(null);
  const [lastCorrectItem, setLastCorrectItem] = useState(null);
  const [newIncomingKey, setNewIncomingKey] = useState(null);

  // Level 6 Target Goal (Ending point for the round)
  const TARGET_GOAL = 10;
  const [sortedCount, setSortedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Refs for drop targets hit-testing
  const binRefs = useRef({});
  const isDraggingRef = useRef(false);
  const dragItemRef = useRef(null);

  // Register a drop bin element ref
  const setBinRef = useCallback((shapeId, el) => {
    if (el) {
      binRefs.current[shapeId] = el;
    }
  }, []);

  // Helper: Find which bin is currently under (x, y)
  const getBinUnderPointer = useCallback((x, y) => {
    for (const [shapeId, el] of Object.entries(binRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // Add slight padding tolerance for easier drop
      if (
        x >= rect.left - 15 &&
        x <= rect.right + 15 &&
        y >= rect.top - 15 &&
        y <= rect.bottom + 15
      ) {
        return shapeId;
      }
    }
    return null;
  }, []);

  // Handle successful drop
  const handleCorrectDrop = useCallback((item, targetShape) => {
    audio.playSuccess();
    audio.playDrop();

    // Trigger subtle bounce on the target space
    setBouncingShape(targetShape);
    setTimeout(() => setBouncingShape(null), 350);

    // Save into collected space
    setCollected(prev => ({
      ...prev,
      [targetShape]: [...prev[targetShape], item]
    }));

    setSortedCount(prev => {
      const next = prev + 1;
      if (next === TARGET_GOAL) {
        setIsCompleted(true);
        audio.playSuccess();
        setTimeout(() => {
          audio.playStar(0);
          audio.playStar(1);
          audio.playStar(2);
        }, 320);
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#e8864a', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
        });
        if (onStarEarned) {
          onStarEarned(3); // 3 bonus stars for completing the level!
        }
      }
      return next;
    });

    if (onStarEarned) {
      onStarEarned(1);
    }

    // Replenish the top bar: remove the dropped item and slide in a new one!
    setTopBarItems(prevItems => {
      const remaining = prevItems.filter(i => i.instanceKey !== item.instanceKey);
      const currentIds = remaining.map(i => i.id);
      const newItem = getNextTopBarObject(currentIds);
      setNewIncomingKey(newItem.instanceKey);
      setTimeout(() => setNewIncomingKey(null), 600);
      return [...remaining, newItem];
    });

    setSelectedItemKey(null);
  }, [onStarEarned]);

  // Handle incorrect drop (wrong space)
  const handleIncorrectDrop = useCallback((targetShape) => {
    audio.playWrong();
    setShakingShape(targetShape);
    setTimeout(() => setShakingShape(null), 500);
  }, []);

  // Pointer Down on Top Bar Object
  const handlePointerDown = (e, item) => {
    // Left click or primary touch only
    if (e.button !== undefined && e.button !== 0) return;

    audio.init();
    audio.playPop(480);

    isDraggingRef.current = true;
    dragItemRef.current = item;

    setDraggingItem(item);
    setDragPos({ x: e.clientX, y: e.clientY });
    setHoveredShape(null);
    setSelectedItemKey(item.instanceKey);

    // Prevent scrolling during drag
    e.preventDefault();
  };

  // Global Pointer Move & Up listeners while dragging
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingRef.current || !dragItemRef.current) return;
      setDragPos({ x: e.clientX, y: e.clientY });

      const target = getBinUnderPointer(e.clientX, e.clientY);
      setHoveredShape(target);
    };

    const handlePointerUp = (e) => {
      if (!isDraggingRef.current || !dragItemRef.current) return;

      const item = dragItemRef.current;
      const targetShape = getBinUnderPointer(e.clientX, e.clientY);

      isDraggingRef.current = false;
      dragItemRef.current = null;
      setDraggingItem(null);
      setHoveredShape(null);

      if (targetShape) {
        if (targetShape === item.shape) {
          handleCorrectDrop(item, targetShape);
        } else {
          handleIncorrectDrop(targetShape);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [getBinUnderPointer, handleCorrectDrop, handleIncorrectDrop]);

  // Tap-to-Place fallback: If an item in top bar is selected, clicking a bin drops it
  const handleBinClick = (shapeKey) => {
    if (!selectedItemKey) return;
    const item = topBarItems.find(i => i.instanceKey === selectedItemKey);
    if (!item) return;

    if (item.shape === shapeKey) {
      handleCorrectDrop(item, shapeKey);
    } else {
      handleIncorrectDrop(shapeKey);
    }
  };

  // Reset activity
  const handleReset = () => {
    audio.playPop(350);
    setTopBarItems(getInitialTopBarObjects(5));
    setCollected({
      circle: [],
      oval: [],
      square: [],
      rectangle: [],
      triangle: []
    });
    setSelectedItemKey(null);
    setSortedCount(0);
    setIsCompleted(false);
  };

  return (
    <div className="shape-sorter-container">
      {/* ── TOP CONVEYOR BAR ── */}
      <section className="sorter-top-bar" aria-label="Incoming objects conveyor">
        <div className="conveyor-track">
          <div className="conveyor-belt-header">
            {/* Goal Progress Bar & Trophy Finish Line */}
            <div className="sorter-progress-container" title={`Goal: ${sortedCount} / ${TARGET_GOAL}`}>
              <div className="sorter-progress-track">
                <div
                  className="sorter-progress-fill"
                  style={{ width: `${Math.min(100, (sortedCount / TARGET_GOAL) * 100)}%` }}
                >
                  <span className="sorter-progress-glow" />
                </div>
              </div>
              <span className="sorter-progress-badge">⭐ {sortedCount} / {TARGET_GOAL}</span>
              <span className="sorter-trophy-icon" title="Goal: 10 Shapes">🏆</span>
            </div>

            <button
              className="icon-btn-sm"
              onClick={handleReset}
              title="Refresh / Start Over"
              aria-label="Refresh objects"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* List of items currently in the top bar */}
          <div className="conveyor-items-row">
            {topBarItems.map((item, idx) => {
              const isSelected = selectedItemKey === item.instanceKey;
              const isBeingDragged = draggingItem && draggingItem.instanceKey === item.instanceKey;
              const isIncoming = newIncomingKey === item.instanceKey;

              return (
                <div
                  key={item.instanceKey}
                  className={`conveyor-slot ${isIncoming ? 'incoming-slot' : ''}`}
                >
                  <div
                    className={`sorter-object-card ${isSelected ? 'selected' : ''} ${isBeingDragged ? 'dragged-placeholder' : ''}`}
                    onPointerDown={(e) => handlePointerDown(e, item)}
                    onClick={() => {
                      audio.playPop(420);
                      setSelectedItemKey(item.instanceKey);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Draggable ${item.name}`}
                  >
                    <div className="object-svg-wrapper">
                      <svg
                        className="col shape-colored-svg"
                        viewBox="0 0 120 120"
                        role="img"
                        aria-label={item.name}
                      >
                        <use href={`#${item.id}`} />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5 DESIGNATED EMPTY SPACES BELOW (NO WORDS, PURE VISUAL CLUES) ── */}
      <section className="sorter-drop-arena" aria-label="5 shape collection spaces">
        <div className="drop-spaces-grid">
          {Object.entries(SHAPE_TYPES).map(([shapeKey, config]) => {
            const itemsInBin = collected[shapeKey] || [];
            const isHovered = hoveredShape === shapeKey;
            const isBouncing = bouncingShape === shapeKey;
            const isShaking = shakingShape === shapeKey;

            return (
              <div
                key={shapeKey}
                ref={(el) => setBinRef(shapeKey, el)}
                onClick={() => handleBinClick(shapeKey)}
                className={`drop-space-card drop-space-${shapeKey} ${isHovered ? 'hovered-zone' : ''} ${isBouncing ? 'bounce-pop' : ''} ${isShaking ? 'shake-mismatch' : ''}`}
                style={{
                  '--shape-color': config.color,
                  '--shape-bg': config.bgLight,
                  '--shape-border': config.borderColor
                }}
                role="region"
                aria-label={`Drop space for ${shapeKey}`}
              >
                {/* Visual geometric clue without any words */}
                <div className="space-stencil-frame">
                  {renderStencil(shapeKey)}
                </div>

                {/* Collected objects tray inside this designated space */}
                <div className="collected-tray">
                  {itemsInBin.length === 0 ? (
                    <div className="empty-tray-glow" aria-hidden="true"></div>
                  ) : (
                    <div className="collected-items-stack">
                      {itemsInBin.slice(-4).map((cItem, cIdx) => (
                        <div
                          key={`${cItem.id}_${cIdx}`}
                          className="collected-mini-item"
                          title={cItem.name}
                        >
                          <svg className="col mini-svg" viewBox="0 0 120 120">
                            <use href={`#${cItem.id}`} />
                          </svg>
                        </div>
                      ))}
                      {itemsInBin.length > 4 && (
                        <div className="overflow-badge">+{itemsInBin.length - 4}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Subtle visual badge counter */}
                <div className="space-counter-pip" aria-hidden="true">
                  <span className="pip-dot"></span>
                  <span className="pip-count">{itemsInBin.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FLOATING DRAG AVATAR ── */}
      {draggingItem && (
        <div
          className="floating-drag-avatar"
          style={{
            transform: `translate3d(${dragPos.x - 48}px, ${dragPos.y - 48}px, 0)`
          }}
          aria-hidden="true"
        >
          <div className="drag-avatar-inner">
            <svg className="col avatar-svg" viewBox="0 0 120 120">
              <use href={`#${draggingItem.id}`} />
            </svg>
          </div>
        </div>
      )}

      {/* ── LEVEL COMPLETE VICTORY CELEBRATION MODAL ── */}
      {isCompleted && (
        <div className="modal-backdrop open">
          <div className="eval-card sorter-victory-card">
            <div className="eval-badge victory-badge">🏆</div>
            <div className="stars-row">
              <span className="star-icon filled">⭐</span>
              <span className="star-icon filled">⭐</span>
              <span className="star-icon filled">⭐</span>
            </div>

            <div className="victory-text-banner">
              <h2>Level 6 Complete!</h2>
              <p>You sorted {sortedCount} everyday shapes!</p>
            </div>

            <div className="victory-shape-summary">
              <div className="victory-chip"><span className="chip-ico">⭕</span><span>{collected.circle.length}</span></div>
              <div className="victory-chip"><span className="chip-ico">🥚</span><span>{collected.oval.length}</span></div>
              <div className="victory-chip"><span className="chip-ico">🟩</span><span>{collected.square.length}</span></div>
              <div className="victory-chip"><span className="chip-ico">🧱</span><span>{collected.rectangle.length}</span></div>
              <div className="victory-chip"><span className="chip-ico">🔺</span><span>{collected.triangle.length}</span></div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn retry-btn pulse-attention"
                onClick={handleReset}
                title="Play Again"
              >
                <RotateCcw size={28} />
                <span>Play Again</span>
              </button>
              <button
                className="modal-btn next-btn"
                onClick={() => setIsCompleted(false)}
                title="Continue Free Play"
              >
                <Sparkles size={28} />
                <span>Free Play</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
