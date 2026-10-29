import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Moon, Sun, Star, Lock } from 'lucide-react';
import { SHAPES, STAGES } from './lib/shapes-data.js';
import { audio } from './lib/audio.js';
import { preciseMatcher } from './lib/precise-matcher.js';
import RefCard from './components/RefCard.jsx';
import DrawingCanvas from './components/DrawingCanvas.jsx';
import EvalModal from './components/EvalModal.jsx';
import ShapeSorter from './components/ShapeSorter.jsx';
import ShapeSvgDefs from './components/ShapeSvgDefs.jsx';
import './App.css';

export default function App() {
  const [stageIndex, setStageIndex] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);

  // Progression & Unlock State (default to 5 so all stages 1-6 are unlocked and accessible)
  const [unlockedStage, setUnlockedStage] = useState(() => {
    try {
      const saved = localStorage.getItem('fln_l39_unlocked_stage');
      return saved !== null ? Math.max(5, parseInt(saved, 10)) : 5;
    } catch (e) {
      return 5;
    }
  });

  const [unlockedShapes, setUnlockedShapes] = useState(() => {
    try {
      const saved = localStorage.getItem('fln_l39_unlocked_shapes');
      return saved ? JSON.parse(saved) : { 0: 0 };
    } catch (e) {
      return { 0: 0 };
    }
  });

  const [stars, setStars] = useState(() => {
    try {
      return parseInt(localStorage.getItem('fln_l39_stars'), 10) || 0;
    } catch (e) {
      return 0;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fln_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [muted, setMuted] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [failCount, setFailCount] = useState(0);

  // Evaluation modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [drawnDataUrl, setDrawnDataUrl] = useState(null);

  const canvasExportRef = useRef(null);

  const currentStage = STAGES[stageIndex] || STAGES[0];
  const isSortMode = currentStage.mode === 'sort';
  const currentShapeId = currentStage.shapes ? currentStage.shapes[shapeIndex] : 'circle';
  const currentShape = SHAPES[currentShapeId] || SHAPES['circle'];

  const isTraceMode = currentStage.mode === 'trace';
  const isVisualAid = !isTraceMode && failCount >= 3;

  // Sync theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('fln_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Stage change: update guide mode & speak shape name (only in draw/trace stages)
  useEffect(() => {
    setShowGuide(isTraceMode);
    if (currentShape && !isSortMode) {
      const timer = setTimeout(() => {
        audio.speak(currentShape.name);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stageIndex, shapeIndex, isTraceMode, currentShape, isSortMode]);

  // Handle stage selection (only allowed if stage is unlocked)
  const handleSelectStage = (idx) => {
    if (idx > unlockedStage) {
      audio.playPop(220); // Buzz indicating locked
      return;
    }
    setStageIndex(idx);
    setShapeIndex(0);
    setFailCount(0);
    setShowGuide(STAGES[idx].mode === 'trace');
    audio.playPop(420);
    if (canvasExportRef.current) {
      canvasExportRef.current.clear();
    }
  };

  // Handle shape selection within stage (only allowed if shape is unlocked)
  const handleSelectShape = (idx) => {
    const maxUnlocked = unlockedShapes[stageIndex] || 0;
    if (idx > maxUnlocked) {
      audio.playPop(220);
      return;
    }
    setShapeIndex(idx);
    setFailCount(0);
    setShowGuide(currentStage.mode === 'trace');
    audio.playPop(500);
    if (canvasExportRef.current) {
      canvasExportRef.current.clear();
    }
  };

  // Handle submit & precise evaluation
  const handleSubmit = (strokes, canvasEl) => {
    if (!canvasEl) return;
    audio.init();

    const result = preciseMatcher.evaluate(strokes, canvasEl, currentShape, currentStage.mode);
    setEvalResult(result);
    setDrawnDataUrl(canvasEl.toDataURL());
    setEvalModalOpen(true);

    if (result.passed) {
      setFailCount(0);
      // Award stars
      const newTotal = stars + result.stars;
      setStars(newTotal);

      // Unlock progression: unlock next shape or next stage!
      if (shapeIndex < currentStage.shapes.length - 1) {
        const nextShape = Math.max(unlockedShapes[stageIndex] || 0, shapeIndex + 1);
        const updatedShapes = { ...unlockedShapes, [stageIndex]: nextShape };
        setUnlockedShapes(updatedShapes);
        try {
          localStorage.setItem('fln_l39_unlocked_shapes', JSON.stringify(updatedShapes));
        } catch (e) {}
      } else if (stageIndex < STAGES.length - 1) {
        // Last shape of current stage passed -> unlock next stage!
        const nextStg = Math.max(unlockedStage, stageIndex + 1);
        setUnlockedStage(nextStg);
        const updatedShapes = {
          ...unlockedShapes,
          [stageIndex + 1]: Math.max(unlockedShapes[stageIndex + 1] || 0, 0)
        };
        setUnlockedShapes(updatedShapes);
        try {
          localStorage.setItem('fln_l39_unlocked_stage', nextStg.toString());
          localStorage.setItem('fln_l39_unlocked_shapes', JSON.stringify(updatedShapes));
        } catch (e) {}
      }

      try {
        localStorage.setItem('fln_l39_stars', newTotal.toString());
      } catch (e) {}
      audio.playSuccess();

      if (result.stars >= 2) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e8864a', '#ff4d4d', '#48bb78', '#29b6f6', '#ffeb3b', '#7e57c2']
        });
      }
    } else {
      const nextFails = failCount + 1;
      setFailCount(nextFails);
      if (nextFails >= 3) {
        setShowGuide(true);
      }
      audio.playPop(260); // Low prompt to try again
    }
  };

  // Modal retry
  const handleRetry = () => {
    setEvalModalOpen(false);
    if (canvasExportRef.current) {
      canvasExportRef.current.clear();
    }
    audio.playPop(380);
  };

  // Modal next shape/stage (Only callable when passed)
  const handleNext = () => {
    setEvalModalOpen(false);
    setFailCount(0);
    if (canvasExportRef.current) {
      canvasExportRef.current.clear();
    }
    if (shapeIndex < currentStage.shapes.length - 1) {
      setShapeIndex(shapeIndex + 1);
      setShowGuide(currentStage.mode === 'trace');
    } else if (stageIndex < STAGES.length - 1) {
      const nextStg = stageIndex + 1;
      setStageIndex(nextStg);
      setShapeIndex(0);
      setShowGuide(STAGES[nextStg].mode === 'trace');
    } else {
      setStageIndex(0);
      setShapeIndex(0);
      setShowGuide(true);
    }
    audio.playPop(520);
  };

  // Toggle guide overlay (Lock always ON in Level 1 Complete Tracing)
  const handleToggleGuide = () => {
    if (isTraceMode) {
      audio.playPop(320);
      return;
    }
    setShowGuide(prev => !prev);
  };

  // Sound toggle
  const handleToggleMute = () => {
    const isM = audio.toggleMute();
    setMuted(isM);
  };

  // Theme toggle
  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    audio.playPop(440);
  };

  return (
    <div className="fln-app">
      {/* Top Header (Minimal Text - Clean Icons) */}
      <header className="app-header">
        <div className="brand-badge" title="FLN L39: Draws 2D Shapes Freehand">
          <span className="brand-logo">📐</span>
          <span className="brand-code">L39</span>
        </div>

        {/* Stage Selector: 1, 2, 3, 4, 5 with Lock states */}
        <nav className="stage-selector">
          {STAGES.map((stg, idx) => {
            const isLocked = idx > unlockedStage;
            return (
              <button
                key={stg.id}
                className={`stage-btn ${idx === stageIndex ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => handleSelectStage(idx)}
                title={isLocked ? 'Locked' : stg.title}
                disabled={isLocked}
              >
                {isLocked ? <Lock size={14} /> : stg.num}
              </button>
            );
          })}
        </nav>

        {/* Header Action Controls */}
        <div className="header-actions">
          <div className="star-counter" title="Total Stars">
            <Star size={18} fill="#ecc94b" color="#ecc94b" />
            <span>{stars}</span>
          </div>

          <button className="icon-btn" onClick={handleToggleMute} title="Sound">
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button className="icon-btn" onClick={handleToggleTheme} title="Theme">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Global SVG Symbol Definitions for 52 Objects */}
      <ShapeSvgDefs />

      {/* Main Arena: Shape Sorter for Level 6 or Drawing/Tracing for Levels 1-5 */}
      {isSortMode ? (
        <main className="main-arena sorter-arena">
          <ShapeSorter onStarEarned={(count) => {
            const newTotal = stars + count;
            setStars(newTotal);
            try {
              localStorage.setItem('fln_l39_stars', newTotal.toString());
            } catch (e) {}
          }} />
        </main>
      ) : (
        <main className="main-arena">
          {/* Left Reference Card */}
          <RefCard
            targetShape={currentShape}
            currentStage={currentStage}
            currentShapeIndex={shapeIndex}
            onSelectShapeIndex={handleSelectShape}
            showGuide={showGuide || isTraceMode || isVisualAid}
            onToggleGuide={handleToggleGuide}
            maxUnlockedShapeIndex={unlockedShapes[stageIndex] || 0}
            isTraceMode={isTraceMode}
          />

          {/* Right Excalidraw-like Canvas Workspace */}
          <DrawingCanvas
            targetShape={currentShape}
            showGuide={showGuide || isTraceMode || isVisualAid}
            isTraceMode={isTraceMode}
            isVisualAid={isVisualAid}
            onSubmit={handleSubmit}
            canvasRefExport={canvasExportRef}
          />
        </main>
      )}

      {/* Precise Evaluation Modal (Only for drawing stages) */}
      {!isSortMode && (
        <EvalModal
          isOpen={evalModalOpen}
          result={evalResult}
          targetShape={currentShape}
          drawnCanvasUrl={drawnDataUrl}
          onRetry={handleRetry}
          onNext={handleNext}
          hasVisualAid={failCount >= 3}
        />
      )}
    </div>
  );
}
