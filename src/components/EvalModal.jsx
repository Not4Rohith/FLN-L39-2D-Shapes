import { RotateCcw, ArrowRight, Lock } from 'lucide-react';

export default function EvalModal({
  isOpen,
  result,
  targetShape,
  drawnCanvasUrl,
  onRetry,
  onNext,
  hasVisualAid = false
}) {
  if (!isOpen || !result) return null;

  const isPassed = Boolean(result.passed);

  return (
    <div className="modal-backdrop open">
      <div className="eval-card">
        {/* Mascot Badge */}
        <div className="eval-badge">
          {result.stars === 3 ? '🌟' : result.stars === 2 ? '👏' : result.stars === 1 ? '👍' : '💪'}
        </div>

        {/* Stars Animation Row */}
        <div className="stars-row">
          {[0, 1, 2].map(idx => (
            <span
              key={idx}
              className={`star-icon ${idx < result.stars ? 'filled' : ''}`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Visual Side-by-Side Comparison & Heatmap */}
        <div className="eval-compare">
          <div className="compare-box">
            <span className="compare-label">🎯</span>
            <div className="compare-img">
              {targetShape && (
                <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: targetShape.svg }} />
              )}
            </div>
          </div>

          <div className="compare-box">
            <span className="compare-label">✏️</span>
            <div className="compare-img" style={{ position: 'relative' }}>
              {(result.userCanvasUrl || drawnCanvasUrl) && (
                <img src={result.userCanvasUrl || drawnCanvasUrl} alt="Drawn" />
              )}
              {result.heatmapUrl && (
                <img
                  src={result.heatmapUrl}
                  alt="Heatmap"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.85,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Single Visual Progress Bar (Kid-friendly, no percentages) */}
        <div className="eval-progress-container">
          <span className="progress-edge-icon" aria-hidden="true">🎯</span>
          <div className="eval-progress-track">
            <div
              className={`eval-progress-fill ${isPassed ? 'fill-pass' : 'fill-retry'}`}
              style={{ width: `${Math.max(8, Math.min(100, result.score))}%` }}
            >
              <span className="eval-progress-glow" />
            </div>
            <div className="eval-progress-marker" title="Goal" />
          </div>
          <span className="progress-edge-icon" aria-hidden="true">🏆</span>
        </div>

        {/* Visual Aid Assistance Banner */}
        {hasVisualAid && !isPassed && (
          <div className="eval-aid-banner">
            <span className="eval-aid-icon">💡</span>
            <span>Trace guide turned on! Follow the dashed line</span>
          </div>
        )}

        {/* Big Action Buttons - Next is unlocked only when threshold is passed */}
        <div className="modal-actions">
          <button className={`modal-btn retry-btn ${!isPassed ? 'pulse-attention' : ''}`} onClick={onRetry} title="Try Again">
            <RotateCcw size={32} />
          </button>

          {isPassed ? (
            <button className="modal-btn next-btn" onClick={onNext} title="Next Level">
              <ArrowRight size={32} />
            </button>
          ) : (
            <button
              className="modal-btn locked-btn"
              title="Locked: Score 50%+ to unlock"
              disabled
            >
              <Lock size={28} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
