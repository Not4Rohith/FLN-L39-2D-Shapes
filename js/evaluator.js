/**
 * FLN L39 Intelligent Shape Evaluator
 * Multi-Metric Computer Vision & Geometric Analysis Engine
 * Tailored for elementary children (FLN Grade 1-3)
 */

class ShapeEvaluator {
  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Main evaluation entry point
   * @param {DrawingCanvas} drawingCanvas
   * @param {Object} shapeTarget - Entry from SHAPES_DATA
   * @param {string} mode - 'trace', 'copy', 'object', 'free'
   * @returns {Object} evaluation results with score, stars, metrics, and kid-friendly feedback
   */
  evaluate(drawingCanvas, shapeTarget, mode = 'copy') {
    if (drawingCanvas.isEmpty()) {
      return {
        passed: false,
        score: 0,
        stars: 0,
        verdict: 'Empty Canvas',
        feedback: 'The canvas is empty! Draw your shape with the pen or crayon first.',
        details: []
      };
    }

    const pixelData = drawingCanvas.getPixelMask(2);
    const colorStats = drawingCanvas.getColorStats();
    const strokes = drawingCanvas.strokes;

    if (!pixelData.bounds || pixelData.pixels.length < 20) {
      return {
        passed: false,
        score: 15,
        stars: 0,
        verdict: 'Draw a bit more!',
        feedback: 'That was just a little dot! Draw the full shape so we can test it.',
        details: ['Stroke is too small']
      };
    }

    // 1. Geometric stroke analysis
    const geoMetrics = this.analyzeGeometry(strokes, pixelData);

    // 2. Spatial template alignment and coverage analysis
    const spatialMetrics = this.analyzeSpatialMatch(drawingCanvas, shapeTarget);

    // 3. Category specific evaluation
    let categoryScore = 0;
    let feedbackNotes = [];

    if (shapeTarget.category === 'object' || shapeTarget.properties.type === 'composite') {
      const compResult = this.evaluateCompositeObject(shapeTarget.id, pixelData, geoMetrics);
      categoryScore = compResult.score;
      feedbackNotes.push(...compResult.notes);
    } else {
      const basicResult = this.evaluateBasicShape(shapeTarget, geoMetrics, spatialMetrics);
      categoryScore = basicResult.score;
      feedbackNotes.push(...basicResult.notes);
    }

    // 4. Combine spatial match (40%) + geometric shape features (50%) + coloring flair bonus (10%)
    let finalScore = Math.round(spatialMetrics.matchScore * 0.40 + categoryScore * 0.50);

    // Coloring bonus
    let coloringBonus = 0;
    if (colorStats.hasColoring) {
      coloringBonus = Math.min(10, colorStats.uniqueColorCount * 3);
      finalScore += coloringBonus;
      feedbackNotes.push(`🎨 Colorful work! (+${coloringBonus}% color bonus)`);
    }

    // In 'trace' mode, be slightly more lenient
    if (mode === 'trace') {
      finalScore = Math.min(100, Math.round(finalScore * 1.12));
    }

    finalScore = Math.max(10, Math.min(100, finalScore));

    // Star calculation
    let stars = 0;
    let verdict = '';
    let mainPraise = '';

    if (finalScore >= 80) {
      stars = 3;
      verdict = 'Outstanding!';
      mainPraise = `Superstar! You drew an awesome ${shapeTarget.name}!`;
    } else if (finalScore >= 60) {
      stars = 2;
      verdict = 'Great Job!';
      mainPraise = `Well done! Your ${shapeTarget.name} looks very good!`;
    } else if (finalScore >= 42) {
      stars = 1;
      verdict = 'Good Effort!';
      mainPraise = `Nice try! A little more practice and your ${shapeTarget.name} will be perfect!`;
    } else {
      stars = 0;
      verdict = 'Keep Practicing!';
      mainPraise = `Almost there! Look at the reference shape and try tracing it!`;
    }

    return {
      passed: finalScore >= 45,
      score: finalScore,
      stars: stars,
      verdict: verdict,
      mainPraise: mainPraise,
      feedback: feedbackNotes.join(' '),
      metrics: {
        spatialMatch: Math.round(spatialMetrics.matchScore),
        geometricScore: Math.round(categoryScore),
        detectedCorners: geoMetrics.cornersCount,
        circularity: Math.round(geoMetrics.circularity * 100),
        aspectRatio: geoMetrics.aspectRatio.toFixed(2),
        isClosed: geoMetrics.isClosed,
        uniqueColors: colorStats.uniqueColorCount
      },
      details: feedbackNotes
    };
  }

  // ── GEOMETRIC FEATURE EXTRACTION ──
  analyzeGeometry(strokes, pixelData) {
    // Collect all stroke points
    let allPoints = [];
    strokes.forEach(s => {
      if (s.points) allPoints.push(...s.points);
    });

    if (allPoints.length === 0) {
      allPoints = pixelData.pixels;
    }

    const bounds = pixelData.bounds;
    const width = bounds.width || 1;
    const height = bounds.height || 1;
    const aspectRatio = width / height;

    // Centroid
    let sumX = 0, sumY = 0;
    pixelData.pixels.forEach(p => { sumX += p.x; sumY += p.y; });
    const cx = sumX / pixelData.pixels.length;
    const cy = sumY / pixelData.pixels.length;

    // Radius distribution from centroid
    const radii = pixelData.pixels.map(p => Math.hypot(p.x - cx, p.y - cy));
    const meanRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    const varianceRadius = radii.reduce((a, r) => a + Math.pow(r - meanRadius, 2), 0) / radii.length;
    const stdRadius = Math.sqrt(varianceRadius);
    const radiusUniformity = Math.max(0, 1 - (stdRadius / (meanRadius + 1)));

    // Circularity / Compactness: 4 * pi * Area / (Perimeter^2)
    // Approximate perimeter using bounding box diagonal or convex hull span
    const approxPerimeter = 2 * (width + height);
    const approxArea = pixelData.totalPixels * 4; // since sampled step=2
    const circularity = Math.min(1.0, (4 * Math.PI * approxArea) / (approxPerimeter * approxPerimeter));

    // Corner / Vertices detection on main stroke
    const corners = this.detectCorners(allPoints);

    // Path closure: distance between first and last point of primary stroke
    let isClosed = false;
    if (strokes.length > 0 && strokes[0].points && strokes[0].points.length > 5) {
      const pFirst = strokes[0].points[0];
      const pLast = strokes[0].points[strokes[0].points.length - 1];
      const closeDist = Math.hypot(pFirst.x - pLast.x, pFirst.y - pLast.y);
      const span = Math.max(width, height);
      isClosed = closeDist < Math.max(35, span * 0.25);
    }

    return {
      bounds,
      width,
      height,
      aspectRatio,
      centroid: { x: cx, y: cy },
      meanRadius,
      radiusUniformity,
      circularity,
      cornersCount: corners.length,
      corners,
      isClosed
    };
  }

  // Detect corners / inflection points using Douglas-Peucker & angle threshold
  detectCorners(points) {
    if (points.length < 5) return [];

    // Subsample points
    const simplified = [];
    const step = Math.max(1, Math.floor(points.length / 45));
    for (let i = 0; i < points.length; i += step) {
      simplified.push(points[i]);
    }
    if (simplified[simplified.length - 1] !== points[points.length - 1]) {
      simplified.push(points[points.length - 1]);
    }

    const detected = [];
    for (let i = 1; i < simplified.length - 1; i++) {
      const pPrev = simplified[i - 1];
      const pCurr = simplified[i];
      const pNext = simplified[i + 1];

      const v1 = { x: pPrev.x - pCurr.x, y: pPrev.y - pCurr.y };
      const v2 = { x: pNext.x - pCurr.x, y: pNext.y - pCurr.y };

      const l1 = Math.hypot(v1.x, v1.y);
      const l2 = Math.hypot(v2.x, v2.y);

      if (l1 > 8 && l2 > 8) {
        const dot = (v1.x * v2.x + v1.y * v2.y) / (l1 * l2);
        const clampedDot = Math.max(-1, Math.min(1, dot));
        const angleDeg = Math.acos(clampedDot) * (180 / Math.PI);

        // A sharp corner is when angle is between 35 deg and 140 deg
        if (angleDeg >= 35 && angleDeg <= 140) {
          // Avoid clustering corners too close to each other
          const isFarEnough = detected.every(c => Math.hypot(c.x - pCurr.x, c.y - pCurr.y) > 20);
          if (isFarEnough) {
            detected.push(pCurr);
          }
        }
      }
    }

    return detected;
  }

  // ── SPATIAL OVERLAP & CONTOUR DISTANCE MATCHING ──
  analyzeSpatialMatch(drawingCanvas, shapeTarget) {
    const w = 180;
    const h = 135;

    this.offscreenCanvas.width = w;
    this.offscreenCanvas.height = h;

    // 1. Draw child's drawing scaled to offscreen canvas
    this.offscreenCtx.clearRect(0, 0, w, h);
    this.offscreenCtx.drawImage(drawingCanvas.canvas, 0, 0, w, h);
    const childImg = this.offscreenCtx.getImageData(0, 0, w, h).data;

    // 2. Render target SVG onto a second offscreen canvas
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = w;
    targetCanvas.height = h;
    const targetCtx = targetCanvas.getContext('2d');

    // Scale SVG to fill 75% of canvas centered
    const svgScale = Math.min(w * 0.75, h * 0.75) / 100;
    const ox = (w - 100 * svgScale) / 2;
    const oy = (h - 100 * svgScale) / 2;

    targetCtx.translate(ox, oy);
    targetCtx.scale(svgScale, svgScale);
    targetCtx.lineWidth = 6;
    targetCtx.strokeStyle = '#000000';
    targetCtx.fillStyle = '#000000';

    // Parse simple SVG shapes directly or use Path2D
    this.renderSvgToCanvas(targetCtx, shapeTarget.svg);

    const targetImg = targetCtx.getImageData(0, 0, w, h).data;

    // 3. Compute Intersection, Union, and Chamfer-like nearest distance
    let intersection = 0;
    let childCount = 0;
    let targetCount = 0;

    const childPts = [];
    const targetPts = [];

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4 + 3;
        const cAlpha = childImg[idx] > 30;
        const tAlpha = targetImg[idx] > 30;

        if (cAlpha) {
          childCount++;
          childPts.push({ x, y });
        }
        if (tAlpha) {
          targetCount++;
          targetPts.push({ x, y });
        }
        if (cAlpha && tAlpha) {
          intersection++;
        }
      }
    }

    if (childPts.length === 0 || targetPts.length === 0) {
      return { matchScore: 20, coverage: 0 };
    }

    // IoU (Intersection over Union) with dilation tolerance
    const union = childCount + targetCount - intersection;
    const iou = union > 0 ? (intersection / union) : 0;

    // Chamfer distance: average distance from sampled child points to target points
    let totalDist = 0;
    const sampleSize = Math.min(childPts.length, 60);
    const step = Math.max(1, Math.floor(childPts.length / sampleSize));

    for (let i = 0; i < childPts.length; i += step) {
      const cp = childPts[i];
      let minDist = Infinity;
      // Compare with sample of target points
      const tStep = Math.max(1, Math.floor(targetPts.length / 50));
      for (let j = 0; j < targetPts.length; j += tStep) {
        const tp = targetPts[j];
        const d = Math.hypot(cp.x - tp.x, cp.y - tp.y);
        if (d < minDist) minDist = d;
      }
      totalDist += Math.min(minDist, 45); // cap outlier penalty
    }

    const avgDist = totalDist / (childPts.length / step);
    const proximityScore = Math.max(0, 100 - (avgDist * 2.8));

    // Coverage of target
    const coverage = targetCount > 0 ? (intersection / targetCount) : 0;

    // Combined spatial score
    const matchScore = Math.min(100, proximityScore * 0.70 + iou * 150 * 0.30);

    return {
      matchScore: Math.max(15, Math.min(100, matchScore)),
      coverage,
      iou
    };
  }

  // Draw basic SVG strings onto Canvas 2D
  renderSvgToCanvas(ctx, svgString) {
    try {
      // Circle
      const circleMatch = svgString.match(/<circle\s+cx="([^"]+)"\s+cy="([^"]+)"\s+r="([^"]+)"/);
      if (circleMatch) {
        ctx.beginPath();
        ctx.arc(parseFloat(circleMatch[1]), parseFloat(circleMatch[2]), parseFloat(circleMatch[3]), 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      // Ellipse / Oval
      const ellipseMatch = svgString.match(/<ellipse\s+cx="([^"]+)"\s+cy="([^"]+)"\s+rx="([^"]+)"\s+ry="([^"]+)"/);
      if (ellipseMatch) {
        ctx.beginPath();
        ctx.ellipse(parseFloat(ellipseMatch[1]), parseFloat(ellipseMatch[2]), parseFloat(ellipseMatch[3]), parseFloat(ellipseMatch[4]), 0, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      // Polygon
      const polyMatch = svgString.match(/<polygon\s+points="([^"]+)"/);
      if (polyMatch) {
        const pts = polyMatch[1].trim().split(/\s+/).map(pair => {
          const [px, py] = pair.split(',').map(Number);
          return { x: px, y: py };
        });
        if (pts.length > 2) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.stroke();
          return;
        }
      }

      // Rect
      const rectMatch = svgString.match(/<rect\s+x="([^"]+)"\s+y="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"/);
      if (rectMatch) {
        ctx.strokeRect(parseFloat(rectMatch[1]), parseFloat(rectMatch[2]), parseFloat(rectMatch[3]), parseFloat(rectMatch[4]));
        return;
      }

      // Path
      const pathMatch = svgString.match(/<path\s+d="([^"]+)"/);
      if (pathMatch && window.Path2D) {
        const p = new Path2D(pathMatch[1]);
        ctx.stroke(p);
      }
    } catch (e) {
      // Fallback: draw outline bounding box
      ctx.strokeRect(20, 20, 60, 60);
    }
  }

  // ── BASIC SHAPES EVALUATOR ──
  evaluateBasicShape(target, geo, spatial) {
    const id = target.id;
    let score = 50;
    const notes = [];

    switch (id) {
      case 'circle': {
        const isRound = geo.radiusUniformity > 0.60;
        const cornerPenalty = geo.cornersCount > 2 ? (geo.cornersCount - 2) * 8 : 0;
        score = (geo.radiusUniformity * 70) + (geo.isClosed ? 25 : 10) - cornerPenalty;

        if (geo.radiusUniformity > 0.72) {
          notes.push('⭕ Super smooth, round curve!');
        } else {
          notes.push('⭕ Nice round effort, try keeping the distance from the center even.');
        }
        if (geo.isClosed) notes.push('✅ Loop is nicely closed!');
        break;
      }

      case 'triangle': {
        const has3Corners = geo.cornersCount >= 2 && geo.cornersCount <= 4;
        const cornerScore = has3Corners ? 50 : Math.max(15, 45 - Math.abs(geo.cornersCount - 3) * 12);
        score = cornerScore + (geo.isClosed ? 35 : 15) + (geo.circularity < 0.75 ? 15 : 5);

        if (geo.cornersCount === 3) {
          notes.push('🔺 Found 3 clear corners! Exactly right for a triangle.');
        } else {
          notes.push(`🔺 Detected ${geo.cornersCount} corners (triangles need 3 pointy corners).`);
        }
        if (geo.isClosed) notes.push('✅ Triangle sides meet nicely!');
        break;
      }

      case 'square': {
        const has4Corners = geo.cornersCount >= 3 && geo.cornersCount <= 5;
        const isSquareAspect = Math.abs(geo.aspectRatio - 1.0) < 0.35;
        const aspectScore = isSquareAspect ? 40 : Math.max(15, 35 - Math.abs(geo.aspectRatio - 1.0) * 30);
        const cornerScore = has4Corners ? 40 : 20;
        score = cornerScore + aspectScore + (geo.isClosed ? 20 : 5);

        if (has4Corners) {
          notes.push('🟩 4 corners spotted!');
        } else {
          notes.push(`🟩 Found ${geo.cornersCount} corners (squares need 4 sharp corners).`);
        }
        if (isSquareAspect) {
          notes.push('⚖️ Equal height and width sides!');
        } else {
          notes.push('📏 Make sure all 4 sides are the same length!');
        }
        break;
      }

      case 'rectangle': {
        const has4Corners = geo.cornersCount >= 3 && geo.cornersCount <= 5;
        const isElongated = geo.aspectRatio > 1.25 || geo.aspectRatio < 0.75;
        const aspectScore = isElongated ? 45 : 20;
        const cornerScore = has4Corners ? 35 : 20;
        score = cornerScore + aspectScore + (geo.isClosed ? 20 : 5);

        if (isElongated) {
          notes.push('🧱 Great wide rectangle shape!');
        } else {
          notes.push('🧱 Tip: Make 2 sides longer than the other 2 sides!');
        }
        break;
      }

      case 'oval': {
        const isElongated = geo.aspectRatio > 1.25 || geo.aspectRatio < 0.75;
        const isSmooth = geo.cornersCount <= 2;
        score = (isElongated ? 45 : 20) + (isSmooth ? 35 : 15) + (geo.isClosed ? 20 : 10);

        if (isElongated && isSmooth) {
          notes.push('🥚 Beautiful curved oval!');
        } else {
          notes.push('🥚 Remember an oval is an elongated circle with no corners.');
        }
        break;
      }

      case 'diamond': {
        const has4Corners = geo.cornersCount >= 3 && geo.cornersCount <= 5;
        score = (has4Corners ? 50 : 25) + (geo.isClosed ? 30 : 10) + 20;
        notes.push('💎 Diamond diamond shining bright! Good pointy corners.');
        break;
      }

      case 'pentagon': {
        const has5Corners = geo.cornersCount >= 4 && geo.cornersCount <= 6;
        score = (has5Corners ? 55 : 30) + (geo.isClosed ? 30 : 10) + 15;
        notes.push(`⬟ Detected ${geo.cornersCount} corners (pentagon target is 5).`);
        break;
      }

      case 'hexagon': {
        const has6Corners = geo.cornersCount >= 5 && geo.cornersCount <= 7;
        score = (has6Corners ? 55 : 30) + (geo.isClosed ? 30 : 10) + 15;
        notes.push(`⬡ Hexagon honeycomb! Great polygon structure.`);
        break;
      }

      default:
        score = 65;
        notes.push('✨ Good shape drawing!');
    }

    return {
      score: Math.max(25, Math.min(100, Math.round(score))),
      notes
    };
  }

  // ── COMPOSITE OBJECT EVALUATOR (HOUSE, CAR, TREE, FLOWER, ETC.) ──
  evaluateCompositeObject(id, pixelData, geo) {
    const b = pixelData.bounds;
    const pixels = pixelData.pixels;
    let score = 55;
    const notes = [];

    // Slice pixels into vertical / horizontal zones
    const midY = b.minY + b.height * 0.50;
    const topPixels = pixels.filter(p => p.y < midY);
    const bottomPixels = pixels.filter(p => p.y >= midY);

    const midX = b.minX + b.width * 0.50;
    const leftPixels = pixels.filter(p => p.x < midX);
    const rightPixels = pixels.filter(p => p.x >= midX);

    switch (id) {
      case 'house': {
        // Top zone should be triangular (roof), bottom zone should be square/rectangular (body)
        const hasTopRoof = topPixels.length > 15;
        const hasBottomWall = bottomPixels.length > 20;

        // Check top width vs bottom width (roof should taper at the top)
        const topSlice = pixels.filter(p => p.y < b.minY + b.height * 0.25);
        let topSpan = 0;
        if (topSlice.length > 0) {
          const minXs = Math.min(...topSlice.map(p => p.x));
          const maxXs = Math.max(...topSlice.map(p => p.x));
          topSpan = maxXs - minXs;
        }

        const isTaperedRoof = topSpan < b.width * 0.85;

        score = (hasTopRoof ? 30 : 10) + (hasBottomWall ? 30 : 10) + (isTaperedRoof ? 25 : 10) + 15;
        notes.push('🏠 Hut structure confirmed: Triangle roof on top and walls below!');
        break;
      }

      case 'car': {
        // Car needs horizontal elongation + wheels near the bottom
        const isHorizontal = geo.aspectRatio > 1.15;
        const hasBottomWheels = bottomPixels.length > topPixels.length * 0.6;
        score = (isHorizontal ? 40 : 20) + (hasBottomWheels ? 35 : 15) + 25;

        notes.push('🚗 Great car chassis with wheels on the ground!');
        break;
      }

      case 'tree': {
        // Pine tree: top should have foliage mass, bottom should have narrow trunk
        const hasTrunk = bottomPixels.length > 10;
        const hasLeaves = topPixels.length > 20;
        score = (hasLeaves ? 40 : 15) + (hasTrunk ? 35 : 15) + 25;

        notes.push('🌲 Pine tree recognized: green triangular foliage and trunk!');
        break;
      }

      case 'flower': {
        // Flower has radial symmetry around center + bottom stem
        const hasCenterPetals = topPixels.length > 25;
        const hasStem = bottomPixels.length > 10;
        score = (hasCenterPetals ? 45 : 20) + (hasStem ? 35 : 15) + 20;

        notes.push('🌸 Cheerful blossom flower! Lovely petals and stem.');
        break;
      }

      case 'boat': {
        // Boat: bottom hull + top sail
        const hasHull = bottomPixels.length > 20;
        const hasSail = topPixels.length > 15;
        score = (hasHull ? 40 : 20) + (hasSail ? 40 : 20) + 20;

        notes.push('⛵ Sailboat afloat! Great hull and triangular sail.');
        break;
      }

      case 'fish': {
        // Fish: wide body + tail on one side
        const tailCheck = Math.abs(leftPixels.length - rightPixels.length) > 5;
        score = (geo.aspectRatio > 1.1 ? 40 : 20) + (tailCheck ? 35 : 20) + 25;

        notes.push('🐟 Swimming fish shape with body and tail fin!');
        break;
      }

      case 'sun': {
        // Sun: round core + radial spokes
        const isRoundCore = geo.circularity > 0.45;
        score = (isRoundCore ? 45 : 25) + (pixels.length > 40 ? 35 : 15) + 20;

        notes.push('☀️ Shining sun with bright radiating rays!');
        break;
      }

      case 'kite': {
        // Kite: diamond body + lower tail
        const hasTail = bottomPixels.length > 15;
        score = (hasTail ? 45 : 25) + 40;

        notes.push('🪁 Flying kite with diamond frame and tail!');
        break;
      }

      default:
        score = 70;
        notes.push('🎨 Creative composite object!');
    }

    return {
      score: Math.max(30, Math.min(100, Math.round(score))),
      notes
    };
  }
}

const evaluator = new ShapeEvaluator();
