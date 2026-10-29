import React from 'react';
import { Volume2, Eye, Lock } from 'lucide-react';
import { audio } from '../lib/audio.js';
import { SHAPES } from '../lib/shapes-data.js';

export default function RefCard({
  targetShape,
  currentStage,
  currentShapeIndex,
  onSelectShapeIndex,
  showGuide,
  onToggleGuide,
  maxUnlockedShapeIndex = 0,
  isTraceMode = false
}) {
  const handleSpeak = () => {
    if (targetShape) {
      audio.speak(targetShape.name);
      audio.playPop(480);
    }
  };

  return (
    <aside className="ref-card">
      <div className="ref-header">
        <span className="shape-emoji-badge">{targetShape?.symbol || '✨'}</span>
        <button className="voice-btn" onClick={handleSpeak} title="Speak">
          <Volume2 size={22} />
        </button>
      </div>

      {/* Big Reference Box */}
      <div className="ref-shape-box">
        {targetShape && (
          <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: targetShape.svg }} />
        )}
      </div>

      {/* Ghost Guide Toggle Button (Eye) - Locked On in Level 1 Complete Tracing */}
      <button
        className={`guide-toggle-btn ${showGuide ? 'active' : ''} ${isTraceMode ? 'trace-lock' : ''}`}
        onClick={onToggleGuide}
        title={isTraceMode ? 'Level 1: Tracing Mode (Always On)' : 'Guide Overlay'}
      >
        <Eye size={22} />
      </button>

      {/* Thumbnails in Current Stage with Lock Indicators */}
      <div className="shape-thumbs">
        {currentStage.shapes.map((sId, idx) => {
          const s = SHAPES[sId];
          if (!s) return null;
          const isLocked = idx > maxUnlockedShapeIndex;

          return (
            <button
              key={sId}
              className={`thumb-btn ${idx === currentShapeIndex ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => {
                if (isLocked) {
                  audio.playPop(240);
                  return;
                }
                onSelectShapeIndex(idx);
                audio.playPop(520);
              }}
              title={isLocked ? 'Locked' : s.name}
              disabled={isLocked}
            >
              {isLocked ? (
                <Lock size={18} className="lock-icon-svg" />
              ) : (
                <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: s.svg }} />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
