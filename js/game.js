/**
 * FLN L39 SHAPE MASTER - MAIN GAME CONTROLLER
 * Minimal words, visual-first interactive game for children
 */

class ShapeGame {
  constructor() {
    this.currentStageIndex = 0;
    this.currentShapeIndex = 0;
    this.totalStars = 0;
    this.stageStars = {};

    this.drawingCanvas = null;
    this.currentShape = null;
    this.currentStage = null;

    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.particles = [];

    this.init();
  }

  init() {
    this.loadProgress();

    // Elements
    const drawEl = document.getElementById('drawCanvas');
    const guideEl = document.getElementById('guideCanvas');
    this.drawingCanvas = new DrawingCanvas(drawEl, guideEl);

    this.confettiCanvas = document.getElementById('confettiCanvas');
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.setupConfettiResize();

    this.bindEvents();
    this.renderColorPalette();
    this.loadStage(0, 0);
    this.updateStarDisplay();

    // Theme setup from Tenali preferences or saved preference
    const savedTheme = localStorage.getItem('fln_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  loadProgress() {
    try {
      const savedStars = localStorage.getItem('fln_l39_stars');
      if (savedStars) this.totalStars = parseInt(savedStars, 10) || 0;
      const savedStages = localStorage.getItem('fln_l39_stage_stars');
      if (savedStages) this.stageStars = JSON.parse(savedStages) || {};
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('fln_l39_stars', this.totalStars.toString());
      localStorage.setItem('fln_l39_stage_stars', JSON.stringify(this.stageStars));
    } catch (e) {}
  }

  updateStarDisplay() {
    const el = document.getElementById('totalStars');
    if (el) el.textContent = this.totalStars;
  }

  bindEvents() {
    // Stage Selector Tabs (1, 2, 3, 4, 5, ★)
    const stageBtns = document.querySelectorAll('.stage-btn');
    stageBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        sounds.playPop(420);
        this.loadStage(idx, 0);
      });
    });

    // Voice assistant / Speech icon (No reading needed for kids!)
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.speakCurrentShape();
      });
    }

    // Guide Toggle (Eye icon)
    const guideBtn = document.getElementById('guideToggleBtn');
    if (guideBtn) {
      guideBtn.addEventListener('click', () => {
        const isShown = this.drawingCanvas.toggleGuide();
        guideBtn.classList.toggle('active', isShown);
        sounds.playPop(500);
      });
    }

    // Tool Buttons (Pencil, Crayon, Marker, Fill, Eraser)
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.getAttribute('data-tool');
        this.setTool(tool, btn);
        sounds.playPop(480);
      });
    });

    // Stroke Size buttons (• ● ⬤)
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = parseInt(btn.getAttribute('data-size'), 10) || 6;
        this.drawingCanvas.strokeWidth = size;
        sounds.playPop(520);
      });
    });

    // Undo / Redo / Clear
    document.getElementById('undoBtn')?.addEventListener('click', () => {
      this.drawingCanvas.undo();
      sounds.playPop(380);
    });

    document.getElementById('redoBtn')?.addEventListener('click', () => {
      this.drawingCanvas.redo();
      sounds.playPop(440);
    });

    document.getElementById('clearBtn')?.addEventListener('click', () => {
      this.drawingCanvas.clear();
      sounds.playPop(300);
    });

    // Submit & Evaluate Button (🚀)
    document.getElementById('submitBtn')?.addEventListener('click', () => {
      this.submitDrawing();
    });

    // Modal Actions (Retry / Next)
    document.getElementById('retryBtn')?.addEventListener('click', () => {
      this.closeModal();
      this.drawingCanvas.clear();
      sounds.playPop(400);
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
      this.closeModal();
      this.nextShape();
      sounds.playPop(540);
    });

    // Header Action Toggles (Mute, Theme)
    document.getElementById('muteBtn')?.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      const icon = document.getElementById('muteIcon');
      if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', nextTheme);
      localStorage.setItem('fln_theme', nextTheme);
      this.updateThemeIcon(nextTheme);
      sounds.playPop(450);
      this.drawingCanvas.renderGuide(this.currentShape, this.currentStage.mode);
    });
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  setTool(tool, activeBtn) {
    this.drawingCanvas.tool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
  }

  renderColorPalette() {
    const container = document.getElementById('colorRibbon');
    if (!container) return;
    container.innerHTML = '';

    PALETTE.forEach((hex, idx) => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${idx === 0 ? 'active' : ''}`;
      swatch.style.backgroundColor = hex;
      swatch.setAttribute('data-color', hex);

      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.drawingCanvas.color = hex;
        // If eraser was selected, switch back to pencil
        if (this.drawingCanvas.tool === 'eraser') {
          const pencilBtn = document.querySelector('[data-tool="pencil"]');
          this.setTool('pencil', pencilBtn);
        }
        sounds.playPop(600);
      });

      container.appendChild(swatch);
    });
  }

  loadStage(stageIndex, shapeIndex = 0) {
    this.currentStageIndex = stageIndex;
    this.currentStage = GAME_LEVELS[stageIndex];
    this.currentShapeIndex = shapeIndex;

    // Update Stage selector active state
    document.querySelectorAll('.stage-btn').forEach((b, i) => {
      b.classList.toggle('active', i === stageIndex);
    });

    this.renderShapeThumbnails();
    this.loadShape(this.currentStage.shapes[shapeIndex]);
  }

  renderShapeThumbnails() {
    const thumbsContainer = document.getElementById('shapeThumbs');
    if (!thumbsContainer) return;
    thumbsContainer.innerHTML = '';

    this.currentStage.shapes.forEach((shapeId, idx) => {
      const shapeObj = SHAPES_DATA[shapeId];
      if (!shapeObj) return;

      const btn = document.createElement('button');
      btn.className = `thumb-btn ${idx === this.currentShapeIndex ? 'active' : ''}`;
      btn.setAttribute('data-index', idx);
      btn.innerHTML = `<svg viewBox="0 0 100 100">${shapeObj.svg}</svg>`;

      btn.addEventListener('click', () => {
        this.currentShapeIndex = idx;
        document.querySelectorAll('.thumb-btn').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        this.loadShape(shapeId);
        sounds.playPop(520);
      });

      thumbsContainer.appendChild(btn);
    });
  }

  loadShape(shapeId) {
    this.currentShape = SHAPES_DATA[shapeId];
    if (!this.currentShape) return;

    // Update Reference display
    const refSvgBox = document.getElementById('refShapeBox');
    if (refSvgBox) {
      refSvgBox.innerHTML = `<svg viewBox="0 0 100 100">${this.currentShape.svg}</svg>`;
    }

    const emojiBadge = document.getElementById('shapeEmojiBadge');
    if (emojiBadge) {
      emojiBadge.textContent = this.currentShape.symbol || '✨';
    }

    // Auto-set guide based on stage mode
    const isTraceStage = this.currentStage.mode === 'trace';
    const guideBtn = document.getElementById('guideToggleBtn');
    this.drawingCanvas.showGuide = isTraceStage;
    if (guideBtn) guideBtn.classList.toggle('active', isTraceStage);

    // Render guide on overlay canvas
    this.drawingCanvas.renderGuide(this.currentShape, this.currentStage.mode);

    // Clear user canvas for the new shape
    this.drawingCanvas.clear();

    // Auto-speak shape name softly
    setTimeout(() => {
      this.speakCurrentShape();
    }, 250);
  }

  // Audio Speech synthesis (Minimal written text, maximum accessibility for kids)
  speakCurrentShape() {
    if (sounds.muted) return;
    if ('speechSynthesis' in window && this.currentShape) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(this.currentShape.name);
      utterance.rate = 0.95;
      utterance.pitch = 1.25; // Friendly higher pitch for kids
      window.speechSynthesis.speak(utterance);
    }
    sounds.playPop(480);
  }

  submitDrawing() {
    sounds.init();
    const result = evaluator.evaluate(this.drawingCanvas, this.currentShape, this.currentStage.mode);

    // Award stars and sound effects
    if (result.stars > 0) {
      this.totalStars += result.stars;
      this.updateStarDisplay();
      this.saveProgress();
      sounds.playSuccess();
      if (result.stars >= 2) {
        this.triggerConfetti();
      }
    } else {
      sounds.playEncouragement();
    }

    this.showEvaluationModal(result);
  }

  showEvaluationModal(result) {
    const modal = document.getElementById('evalModal');
    if (!modal) return;

    // Set Big Visual Emoji Mascot
    const badge = document.getElementById('evalBadge');
    if (badge) {
      if (result.stars === 3) badge.textContent = '🌟';
      else if (result.stars === 2) badge.textContent = '👏';
      else if (result.stars === 1) badge.textContent = '👍';
      else badge.textContent = '💪';
    }

    // Render Animated Stars (⭐ ⭐ ⭐)
    const starRow = document.getElementById('starsRow');
    if (starRow) {
      starRow.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = 'star-icon';
        star.textContent = '⭐';
        if (i < result.stars) {
          setTimeout(() => {
            star.classList.add('filled');
            sounds.playStar(i);
          }, (i + 1) * 200);
        }
        starRow.appendChild(star);
      }
    }

    // Side-by-side Visual Comparison: Target SVG vs Drawn Canvas
    const targetBox = document.getElementById('evalTargetBox');
    if (targetBox) {
      targetBox.innerHTML = `<svg viewBox="0 0 100 100">${this.currentShape.svg}</svg>`;
    }

    const drawnBox = document.getElementById('evalDrawnBox');
    if (drawnBox) {
      drawnBox.innerHTML = `<img src="${this.drawingCanvas.canvas.toDataURL()}" alt="Drawing" />`;
    }

    // Visual tags (Score pill, color bonus pill)
    const tagsContainer = document.getElementById('evalTags');
    if (tagsContainer) {
      tagsContainer.innerHTML = `
        <div class="tag-pill">🎯 ${result.score}%</div>
        ${result.metrics.uniqueColors > 1 ? `<div class="tag-pill">🎨 +${result.metrics.uniqueColors}</div>` : ''}
      `;
    }

    modal.classList.add('open');
  }

  closeModal() {
    const modal = document.getElementById('evalModal');
    if (modal) modal.classList.remove('open');
  }

  nextShape() {
    if (this.currentShapeIndex < this.currentStage.shapes.length - 1) {
      this.currentShapeIndex++;
      this.loadShape(this.currentStage.shapes[this.currentShapeIndex]);
      // Update thumb selection
      document.querySelectorAll('.thumb-btn').forEach((b, i) => {
        b.classList.toggle('active', i === this.currentShapeIndex);
      });
    } else if (this.currentStageIndex < GAME_LEVELS.length - 1) {
      // Advance to next stage
      this.loadStage(this.currentStageIndex + 1, 0);
    } else {
      // Reached the end, loop or go to creative lab
      this.loadStage(0, 0);
    }
  }

  // ── CONFETTI SYSTEM ──
  setupConfettiResize() {
    const resize = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  triggerConfetti() {
    const count = 75;
    const colors = ['#e8864a', '#ff4d4d', '#48bb78', '#29b6f6', '#ffeb3b', '#7e57c2'];
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 150,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1.0
      });
    }

    this.animateConfetti();
  }

  animateConfetti() {
    if (this.particles.length === 0) return;

    this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.rotation += p.rotSpeed;
      p.alpha -= 0.012;

      this.confettiCtx.save();
      this.confettiCtx.translate(p.x, p.y);
      this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
      this.confettiCtx.fillStyle = p.color;
      this.confettiCtx.globalAlpha = Math.max(0, p.alpha);
      this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.confettiCtx.restore();

      if (p.alpha <= 0 || p.y > window.innerHeight) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
  }
}

// Start game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.shapeGame = new ShapeGame();
});
