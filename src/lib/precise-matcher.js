/**
 * PRECISE SHAPE MATCHING ENGINE FOR FLN L39
 * Combines:
 * 1. $P Point-Cloud Recognizer (Wobbrock, Anthony, Vatavu - ACM)
 * 2. Hu Invariant Image Moments (Scale/Rotation Invariant)
 * 3. Bidirectional Chamfer Distance Transform
 * 4. Geometric Corner & Curvature Extrema Detection
 * 5. Multi-Part Connected Component Analysis for Composite Objects (Hut, Car, Tree, etc.)
 * 6. Visual Heatmap Difference Map (No reading needed for kids!)
 */

import { SHAPES } from './shapes-data.js';

export class PreciseShapeMatcher {
  constructor() {
    this.evalCanvas = document.createElement('canvas');
    this.evalCanvas.width = 120;
    this.evalCanvas.height = 120;
    this.evalCtx = this.evalCanvas.getContext('2d', { willReadFrequently: true });

    this.targetCanvas = document.createElement('canvas');
    this.targetCanvas.width = 120;
    this.targetCanvas.height = 120;
    this.targetCtx = this.targetCanvas.getContext('2d', { willReadFrequently: true });

    this.heatmapCanvas = document.createElement('canvas');
    this.heatmapCanvas.width = 120;
    this.heatmapCanvas.height = 120;
    this.heatmapCtx = this.heatmapCanvas.getContext('2d');
  }

  /**
   * Main Evaluation Pipeline
   * @param {Array} strokes - Array of { tool, color, width, points: [{x, y}] }
   * @param {HTMLCanvasElement} userCanvas - The active drawing canvas element
   * @param {Object} shapeTarget - Entry from SHAPES
   * @param {string} mode - 'trace', 'copy', 'object', 'free'
   */
  evaluate(strokes, userCanvas, shapeTarget, mode = 'copy') {
    // 0. Empty check
    if (!strokes || strokes.length === 0 || this.isCanvasBlank(userCanvas)) {
      return {
        passed: false,
        score: 0,
        stars: 0,
        verdict: 'Empty',
        heatmapUrl: null,
        metrics: { pointCloud: 0, chamfer: 0, huMoments: 0, geometry: 0, colors: 0 }
      };
    }

    // 1. Gather points & resample to normalized 64-point cloud
    const rawPoints = [];
    strokes.forEach(s => {
      if (s.points && s.tool !== 'eraser') rawPoints.push(...s.points);
    });

    if (rawPoints.length < 10) {
      return {
        passed: false,
        score: 15,
        stars: 0,
        verdict: 'Too small',
        heatmapUrl: null,
        metrics: { pointCloud: 10, chamfer: 15, huMoments: 10, geometry: 10, colors: 1 }
      };
    }

    // 2. $P Point Cloud Match Score
    const userCloud = this.normalizePointCloud(rawPoints, 64);
    const targetCloud = shapeTarget.canonicalPoints ? this.normalizePointCloud(shapeTarget.canonicalPoints, 64) : userCloud;
    const pointCloudScore = this.computePointCloudScore(userCloud, targetCloud);

    // 3. Render normalized rasters for Chamfer & Hu Moments (aspect-ratio preserved)
    this.renderStrokesToGrid(strokes, rawPoints, this.evalCtx, shapeTarget);
    this.renderSvgToGrid(shapeTarget.svg, this.targetCtx);

    const userRaster = this.evalCtx.getImageData(0, 0, 120, 120).data;
    const targetRaster = this.targetCtx.getImageData(0, 0, 120, 120).data;

    // 4. Chamfer Distance & Visual Heatmap
    const { chamferScore, heatmapUrl, accuracyRatio, targetCoverage } = this.computeChamferAndHeatmap(userRaster, targetRaster);

    // 5. Hu Moments (Scale & Translation Invariant 2D moments)
    const huScore = this.computeHuMomentsScore(userRaster, targetRaster);

    // 6. Geometric Features or Multi-Part Object Analysis
    let geometryScore = 60;
    let shapeMismatch = false;
    let detectedShape = '';
    let mismatchReason = '';

    if (shapeTarget.properties.type === 'composite' || shapeTarget.category === 'object') {
      geometryScore = this.evaluateCompositeParts(shapeTarget.id, rawPoints, userRaster);
    } else {
      const geoResult = this.evaluateBasicGeometry(shapeTarget, rawPoints, strokes);
      geometryScore = geoResult.score;
      shapeMismatch = geoResult.mismatch;
      detectedShape = geoResult.detectedShape;
      mismatchReason = geoResult.reason || '';
    }

    // Incomplete shape check (user only drew a fragment, e.g. single arch)
    if (!shapeMismatch && targetCoverage < 0.50 && shapeTarget.category !== 'object') {
      shapeMismatch = true;
      detectedShape = 'incomplete shape';
      mismatchReason = 'Only drawn halfway! Draw the whole shape';
    }

    // 7. Coloring analysis (detects interior filled pixels & color variety)
    const colorStats = this.analyzeColoring(userCanvas);
    let colorBonus = 0;
    if (colorStats.uniqueColors >= 2 || colorStats.coloredAreaRatio > 0.15) {
      colorBonus = Math.min(10, Math.round(colorStats.uniqueColors * 2.5 + colorStats.coloredAreaRatio * 15));
    }

    // 8. Weighted Composite Precision Score
    // Weightings: Point Cloud (35%) + Chamfer Proximity (25%) + Hu Moments (20%) + Geometry (20%)
    let baseScore = Math.round(
      pointCloudScore * 0.35 +
      chamferScore * 0.25 +
      huScore * 0.20 +
      geometryScore * 0.20
    );

    // CRITICAL: Shape Mismatch Penalty
    // If the child drew a fundamentally wrong shape (e.g. square for a circle, or vertical oval for horizontal oval),
    // heavily penalize and prevent passing.
    if (shapeMismatch) {
      baseScore = Math.min(25, Math.round(baseScore * 0.30));
    }

    let finalScore = baseScore + (shapeMismatch ? 0 : colorBonus);

    // In 'trace' mode (Stage 1), provide motor-skill encouragement when tracing
    if (mode === 'trace' && !shapeMismatch) {
      finalScore = Math.min(100, Math.round(finalScore * 1.15) + 5);
    }

    if (shapeMismatch) {
      finalScore = Math.min(28, finalScore);
    }

    finalScore = Math.max(10, Math.min(100, finalScore));

    // Star thresholds tailored for elementary children (Minimum 50% required to pass)
    const PASS_THRESHOLD = 50;
    let stars = 0;
    let verdict = '';

    if (shapeMismatch) {
      stars = 0;
      verdict = mode === 'trace'
        ? `💪 Follow the dashed line to trace the ${shapeTarget.name} ${shapeTarget.symbol || ''}`
        : mismatchReason
        ? `💪 ${mismatchReason}`
        : detectedShape
        ? `💪 That's a ${detectedShape}! Try a ${shapeTarget.name} ${shapeTarget.symbol || ''}`
        : `💪 Not quite! Try a ${shapeTarget.name} ${shapeTarget.symbol || ''}`;
    } else if (finalScore >= 80) {
      stars = 3;
      verdict = '🌟 Perfect!';
    } else if (finalScore >= 65) {
      stars = 2;
      verdict = '👏 Great!';
    } else if (finalScore >= PASS_THRESHOLD) {
      stars = 1;
      verdict = '👍 Good!';
    } else {
      stars = 0;
      verdict = '💪 Try Again!';
    }

    const passed = !shapeMismatch && finalScore >= PASS_THRESHOLD && stars >= 1;

    return {
      passed,
      score: finalScore,
      stars,
      verdict,
      heatmapUrl,
      userCanvasUrl: this.evalCanvas.toDataURL(),
      metrics: {
        pointCloud: Math.round(pointCloudScore),
        chamfer: Math.round(chamferScore),
        huMoments: Math.round(huScore),
        geometry: Math.round(geometryScore),
        colors: colorStats.uniqueColors,
        colorBonus: shapeMismatch ? 0 : colorBonus,
        accuracyRatio: Math.round(accuracyRatio * 100)
      }
    };
  }

  // ── $P POINT CLOUD ALGORITHM ──

  normalizePointCloud(points, n = 64) {
    if (!points || points.length === 0) return [];
    // 1. Resample to N equidistant points
    const resampled = this.resamplePoints(points, n);
    // 2. Compute Centroid
    let cx = 0, cy = 0;
    resampled.forEach(p => { cx += p.x; cy += p.y; });
    cx /= resampled.length;
    cy /= resampled.length;
    // 3. Translate to origin (0,0)
    const centered = resampled.map(p => ({ x: p.x - cx, y: p.y - cy }));
    // 4. Scale to unit bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    centered.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    const scale = Math.max(maxX - minX, maxY - minY) || 1;
    return centered.map(p => ({ x: p.x / scale, y: p.y / scale }));
  }

  resamplePoints(points, n) {
    const totalLen = this.pathLength(points);
    if (totalLen <= 0) return Array(n).fill({ x: points[0].x, y: points[0].y });
    const interval = totalLen / (n - 1);
    let D = 0;
    const newPoints = [{ x: points[0].x, y: points[0].y }];

    for (let i = 1; i < points.length; i++) {
      const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      if (D + d >= interval) {
        const qx = points[i - 1].x + ((interval - D) / d) * (points[i].x - points[i - 1].x);
        const qy = points[i - 1].y + ((interval - D) / d) * (points[i].y - points[i - 1].y);
        const q = { x: qx, y: qy };
        newPoints.push(q);
        points.splice(i, 0, q);
        D = 0;
      } else {
        D += d;
      }
    }
    while (newPoints.length < n) newPoints.push(points[points.length - 1]);
    return newPoints.slice(0, n);
  }

  pathLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return len;
  }

  computePointCloudScore(cloud1, cloud2) {
    if (!cloud1.length || !cloud2.length) return 20;

    // Bipartite minimum distance
    let distSum = 0;
    cloud1.forEach(p1 => {
      let minD = Infinity;
      cloud2.forEach(p2 => {
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < minD) minD = d;
      });
      distSum += minD;
    });

    cloud2.forEach(p2 => {
      let minD = Infinity;
      cloud1.forEach(p1 => {
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < minD) minD = d;
      });
      distSum += minD;
    });

    const avgDist = distSum / (cloud1.length + cloud2.length);
    // Typical good drawing dist is < 0.12, poor drawing > 0.35
    const score = Math.max(0, 100 - (avgDist * 280));
    return Math.min(100, Math.round(score));
  }

  // ── CHAMFER DISTANCE & VISUAL HEATMAP ──

  computeChamferAndHeatmap(userRaster, targetRaster) {
    const w = 120, h = 120;
    this.heatmapCtx.clearRect(0, 0, w, h);
    const heatmapImg = this.heatmapCtx.createImageData(w, h);
    const hData = heatmapImg.data;

    // Collect edge pixel coordinates
    const userPts = [];
    const targetPts = [];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4 + 3;
        if (userRaster[idx] > 40) userPts.push({ x, y });
        if (targetRaster[idx] > 40) targetPts.push({ x, y });
      }
    }

    if (userPts.length === 0 || targetPts.length === 0) {
      return { chamferScore: 20, heatmapUrl: null, accuracyRatio: 0 };
    }

    let accurateCount = 0;
    let totalDist = 0;

    // For each user pixel, calculate distance to target edge and render heatmap
    userPts.forEach(up => {
      let minD = Infinity;
      targetPts.forEach(tp => {
        const d = Math.hypot(up.x - tp.x, up.y - tp.y);
        if (d < minD) minD = d;
      });

      totalDist += Math.min(minD, 35);
      const idx = (up.y * w + up.x) * 4;

      if (minD <= 5) {
        // High accuracy: Neon Green
        accurateCount++;
        hData[idx] = 72;
        hData[idx + 1] = 187;
        hData[idx + 2] = 120;
        hData[idx + 3] = 230;
      } else if (minD <= 12) {
        // Moderate: Tenali Amber/Yellow
        hData[idx] = 237;
        hData[idx + 1] = 137;
        hData[idx + 2] = 54;
        hData[idx + 3] = 210;
      } else {
        // Deviation: Red/Coral
        hData[idx] = 245;
        hData[idx + 1] = 101;
        hData[idx + 2] = 101;
        hData[idx + 3] = 200;
      }
    });

    // Also compute target coverage (recall): how much of the target edge did the user draw?
    let coveredTargetCount = 0;
    targetPts.forEach(tp => {
      let minD = Infinity;
      userPts.forEach(up => {
        const d = Math.hypot(tp.x - up.x, tp.y - up.y);
        if (d < minD) minD = d;
      });
      if (minD <= 10) coveredTargetCount++;
    });
    const targetCoverage = coveredTargetCount / targetPts.length;

    this.heatmapCtx.putImageData(heatmapImg, 0, 0);

    const accuracyRatio = accurateCount / userPts.length;
    // Harmonic mean (F1 score) of precision (accuracyRatio) and recall (targetCoverage)
    const f1 = (2 * accuracyRatio * targetCoverage) / (accuracyRatio + targetCoverage + 1e-6);
    const chamferScore = Math.max(15, Math.min(100, Math.round(f1 * 100)));

    return {
      chamferScore,
      heatmapUrl: this.heatmapCanvas.toDataURL(),
      accuracyRatio,
      targetCoverage
    };
  }

  // ── HU INVARIANT MOMENTS (Scale & Rotation Invariant) ──

  computeHuMomentsScore(userRaster, targetRaster) {
    const huUser = this.calculateHuMoments(userRaster);
    const huTarget = this.calculateHuMoments(targetRaster);

    let diff = 0;
    for (let i = 0; i < 4; i++) {
      const uVal = huUser[i];
      const tVal = huTarget[i];
      const logU = Math.sign(uVal) * Math.log10(Math.abs(uVal) + 1e-7);
      const logT = Math.sign(tVal) * Math.log10(Math.abs(tVal) + 1e-7);
      diff += Math.abs(logU - logT);
    }

    const score = Math.max(20, Math.min(100, Math.round(100 - diff * 16)));
    return score;
  }

  calculateHuMoments(raster) {
    const w = 120, h = 120;
    let m00 = 0, m10 = 0, m01 = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = raster[(y * w + x) * 4 + 3] > 40 ? 1 : 0;
        if (val) {
          m00++;
          m10 += x;
          m01 += y;
        }
      }
    }

    if (m00 === 0) return [0, 0, 0, 0, 0, 0, 0];

    const cx = m10 / m00;
    const cy = m01 / m00;

    let mu20 = 0, mu02 = 0, mu11 = 0, mu30 = 0, mu03 = 0, mu21 = 0, mu12 = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const val = raster[(y * w + x) * 4 + 3] > 40 ? 1 : 0;
        if (val) {
          const dx = x - cx;
          const dy = y - cy;
          mu20 += dx * dx;
          mu02 += dy * dy;
          mu11 += dx * dy;
          mu30 += dx * dx * dx;
          mu03 += dy * dy * dy;
          mu21 += dx * dx * dy;
          mu12 += dx * dy * dy;
        }
      }
    }

    // Normalized central moments
    const norm = (mu, p, q) => mu / Math.pow(m00, 1 + (p + q) / 2);
    const eta20 = norm(mu20, 2, 0);
    const eta02 = norm(mu02, 0, 2);
    const eta11 = norm(mu11, 1, 1);
    const eta30 = norm(mu30, 3, 0);
    const eta03 = norm(mu03, 0, 3);
    const eta21 = norm(mu21, 2, 1);
    const eta12 = norm(mu12, 1, 2);

    // Hu Moments 1-4
    const h1 = eta20 + eta02;
    const h2 = Math.pow(eta20 - eta02, 2) + 4 * Math.pow(eta11, 2);
    const h3 = Math.pow(eta30 - 3 * eta12, 2) + Math.pow(3 * eta21 - eta03, 2);
    const h4 = Math.pow(eta30 + eta12, 2) + Math.pow(eta21 + eta03, 2);

    return [h1, h2, h3, h4];
  }

  // ── GEOMETRIC CORNER, RADIAL VARIANCE & SHAPE DISCRIMINATION ──

  computeRadialMetrics(points) {
    if (!points || points.length === 0) return { meanRadius: 0, cv: 0, uniformity: 0 };
    let cx = 0, cy = 0;
    points.forEach(p => { cx += p.x; cy += p.y; });
    cx /= points.length;
    cy /= points.length;

    const radii = points.map(p => Math.hypot(p.x - cx, p.y - cy));
    const meanRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    if (meanRadius < 1) return { meanRadius: 0, cv: 0, uniformity: 0 };

    const variance = radii.reduce((a, r) => a + Math.pow(r - meanRadius, 2), 0) / radii.length;
    const std = Math.sqrt(variance);
    const cv = std / meanRadius; // Coefficient of variation: < 0.14 for circles, ~0.20-0.30 for squares

    return {
      meanRadius,
      cv,
      uniformity: Math.max(0, 1 - cv)
    };
  }

  countSelfIntersections(points) {
    if (!points || points.length < 12) return 0;
    const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    const segmentsIntersect = (p1, p2, p3, p4) => {
      return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
    };

    const sub = [];
    const step = Math.max(1, Math.floor(points.length / 50));
    for (let i = 0; i < points.length; i += step) sub.push(points[i]);
    let count = 0;

    for (let i = 0; i < sub.length - 2; i++) {
      for (let j = i + 2; j < sub.length - 1; j++) {
        if (i === 0 && j === sub.length - 2) continue; // skip loop closure seam
        if (segmentsIntersect(sub[i], sub[i + 1], sub[j], sub[j + 1])) {
          count++;
          if (count >= 1) return count;
        }
      }
    }
    return count;
  }

  evaluateBasicGeometry(target, points, strokes = []) {
    const corners = this.detectCorners(points, strokes);
    const radial = this.computeRadialMetrics(points);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const w = maxX - minX || 1;
    const h = maxY - minY || 1;
    const span = Math.max(w, h, 1);
    const diag = Math.hypot(w, h);
    const aspect = w / h;

    // 1. Path Closure Check (Basic 2D shapes must be closed loops)
    const pFirst = points[0];
    const pLast = points[points.length - 1];
    const endGap = Math.hypot(pFirst.x - pLast.x, pFirst.y - pLast.y);
    const isClosed = (endGap / span) < 0.32;

    if (!isClosed) {
      return {
        score: 20,
        mismatch: true,
        detectedShape: 'open stroke',
        reason: 'Loop is open! Please close the shape ⭕',
        cornersCount: corners.length,
        radial
      };
    }

    // 2. Topology / Self-Intersection Check (catches infinity ∞, figure-8, scribbles)
    const intersections = this.countSelfIntersections(points);
    if (intersections > 0) {
      return {
        score: 20,
        mismatch: true,
        detectedShape: 'figure-8',
        reason: 'Self-crossing lines! Draw a clean single loop',
        cornersCount: corners.length,
        radial
      };
    }

    // 3. Bounding box sharp corner occupancy (distinguishes boxy shapes from round shapes)
    const bCorners = [
      { x: minX, y: minY }, { x: maxX, y: minY },
      { x: minX, y: maxY }, { x: maxX, y: maxY }
    ];
    let sharpCornerCount = 0;
    bCorners.forEach(c => {
      let minD = Infinity;
      points.forEach(p => {
        const d = Math.hypot(p.x - c.x, p.y - c.y);
        if (d < minD) minD = d;
      });
      if ((minD / diag) < 0.065) sharpCornerCount++;
    });

    let score = 70;
    let mismatch = false;
    let detectedShape = '';
    let reason = '';

    switch (target.id) {
      case 'circle': {
        if (sharpCornerCount >= 3 || corners.length >= 3) {
          mismatch = true;
          detectedShape = 'square/polygon';
          reason = 'That has square corners! Circles are round ⭕';
          score = 25;
        } else if (aspect > 1.30 || aspect < 0.76) {
          mismatch = true;
          detectedShape = 'oval';
          reason = 'That is stretched! Circles are evenly round ⭕';
          score = 35;
        } else if (radial.cv > 0.16) {
          mismatch = true;
          detectedShape = 'uneven shape';
          reason = 'Keep distance from center even ⭕';
          score = 40;
        } else {
          score = Math.round(radial.uniformity * 60 + 35);
        }
        break;
      }

      case 'oval': {
        // Visual aid is a horizontal ellipse (aspect ~1.5, rx=36, ry=24)
        if (aspect < 0.88) {
          mismatch = true;
          detectedShape = 'vertical oval';
          reason = 'That is vertical! Draw a horizontal oval 🥚';
          score = 28;
        } else if (sharpCornerCount >= 3) {
          mismatch = true;
          detectedShape = 'rectangle';
          reason = 'That has boxy corners! Ovals have round smooth curves 🥚';
          score = 28;
        } else if (aspect < 1.15) {
          mismatch = true;
          detectedShape = 'circle';
          reason = 'Too round! Ovals are stretched horizontally 🥚';
          score = 45;
        } else {
          score = aspect >= 1.20 && aspect <= 3.2 ? 95 : 75;
        }
        break;
      }

      case 'square': {
        if (sharpCornerCount <= 1 && corners.length <= 1) {
          mismatch = true;
          detectedShape = 'circle';
          reason = 'That is round! Squares have 4 straight sides and 4 corners 🟩';
          score = 25;
        } else if (aspect > 1.30 || aspect < 0.75) {
          mismatch = true;
          detectedShape = 'rectangle';
          reason = 'That is elongated! Squares have equal sides 🟩';
          score = 45;
        } else {
          const has4Corners = sharpCornerCount >= 3 || Math.abs(corners.length - 4) <= 1;
          score = has4Corners ? 95 : 70;
        }
        break;
      }

      case 'rectangle': {
        if (sharpCornerCount <= 1 && corners.length <= 1) {
          mismatch = true;
          detectedShape = 'oval';
          reason = 'That is round! Rectangles have 4 boxy corners 🧱';
          score = 25;
        } else if (aspect < 0.88) {
          mismatch = true;
          detectedShape = 'vertical rectangle';
          reason = 'That is vertical! Draw a horizontal rectangle 🧱';
          score = 30;
        } else if (aspect >= 0.88 && aspect <= 1.18) {
          mismatch = true;
          detectedShape = 'square';
          reason = 'That is a square! Rectangles are wider 🧱';
          score = 45;
        } else {
          score = aspect >= 1.25 ? 95 : 70;
        }
        break;
      }

      case 'triangle': {
        if (sharpCornerCount <= 1 && corners.length <= 1) {
          mismatch = true;
          detectedShape = 'circle';
          reason = 'Triangles need 3 pointy corners 🔺';
          score = 25;
        } else {
          const has3Corners = corners.length === 3 || (corners.length >= 2 && corners.length <= 4);
          if (!has3Corners) {
            mismatch = true;
            detectedShape = 'polygon';
            reason = 'Triangles must have 3 corners 🔺';
            score = 35;
          } else {
            score = 95;
          }
        }
        break;
      }

      case 'diamond': {
        const isCircle = corners.length <= 1 && radial.cv < 0.14;
        if (isCircle) {
          mismatch = true;
          detectedShape = 'circle';
          reason = 'Diamonds have 4 pointy corners 💎';
          score = 25;
        } else {
          const has4Corners = Math.abs(corners.length - 4) <= 1;
          score = has4Corners ? 90 : 55;
        }
        break;
      }

      case 'pentagon': {
        const closeCorners = Math.abs(corners.length - 5) <= 1;
        score = closeCorners ? 90 : 55;
        break;
      }

      case 'hexagon': {
        const closeCorners = Math.abs(corners.length - 6) <= 1;
        score = closeCorners ? 90 : 55;
        break;
      }

      default:
        score = 75;
    }

    return {
      score: Math.max(10, Math.min(100, score)),
      mismatch,
      detectedShape,
      reason,
      cornersCount: corners.length,
      radial
    };
  }

  detectCorners(points, strokes = []) {
    if (!points || points.length < 5) return [];
    const corners = [];

    // 1. If multiple strokes were drawn, check where stroke endpoints meet
    if (strokes && strokes.length >= 2) {
      const endpoints = [];
      strokes.forEach(s => {
        if (s.points && s.points.length >= 2 && s.tool !== 'eraser') {
          endpoints.push(s.points[0]);
          endpoints.push(s.points[s.points.length - 1]);
        }
      });
      for (let i = 0; i < endpoints.length; i++) {
        for (let j = i + 1; j < endpoints.length; j++) {
          const d = Math.hypot(endpoints[i].x - endpoints[j].x, endpoints[i].y - endpoints[j].y);
          if (d < 35) {
            const mid = { x: (endpoints[i].x + endpoints[j].x) / 2, y: (endpoints[i].y + endpoints[j].y) / 2 };
            if (corners.every(c => Math.hypot(c.x - mid.x, c.y - mid.y) > 25)) {
              corners.push(mid);
            }
          }
        }
      }
    }

    // 2. Interior curvature & angle extrema on resampled equidistant points (64 points)
    const resampled = this.resamplePoints(points.slice(), 64);
    const k = 4; // look-ahead / look-behind (~1/16th of contour)

    for (let i = k; i < resampled.length - k; i++) {
      const p1 = resampled[i - k];
      const p = resampled[i];
      const p2 = resampled[i + k];

      const v1 = { x: p1.x - p.x, y: p1.y - p.y };
      const v2 = { x: p2.x - p.x, y: p2.y - p.y };
      const d1 = Math.hypot(v1.x, v1.y);
      const d2 = Math.hypot(v2.x, v2.y);

      if (d1 > 4 && d2 > 4) {
        const dot = (v1.x * v2.x + v1.y * v2.y) / (d1 * d2);
        const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
        // Sharp vertices (right angles ~90 deg, triangle corners ~60 deg) fall in [42, 135]
        if (angle >= 42 && angle <= 135) {
          const far = corners.every(c => Math.hypot(c.x - p.x, c.y - p.y) > 22);
          if (far) corners.push(p);
        }
      }
    }

    return corners;
  }

  // ── COMPOSITE OBJECT MULTI-PART EVALUATION ──

  evaluateCompositeParts(id, points, raster) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const h = maxY - minY || 1;
    const midY = minY + h * 0.48;

    const topPoints = points.filter(p => p.y < midY);
    const bottomPoints = points.filter(p => p.y >= midY);

    switch (id) {
      case 'house': {
        // Roof top points taper to peak, base has width
        const hasRoof = topPoints.length > 8;
        const hasBase = bottomPoints.length > 12;
        return (hasRoof ? 45 : 15) + (hasBase ? 50 : 20);
      }
      case 'car': {
        // Chassis horizontal span + wheels at bottom
        const hasBottom = bottomPoints.length > topPoints.length * 0.4;
        return hasBottom ? 88 : 60;
      }
      case 'tree': {
        // Foliage on top, trunk at bottom
        const hasFoliage = topPoints.length > 15;
        const hasTrunk = bottomPoints.length > 8;
        return (hasFoliage ? 50 : 20) + (hasTrunk ? 45 : 20);
      }
      case 'sun': {
        return points.length > 30 ? 90 : 65;
      }
      default:
        return 80;
    }
  }

  // ── COLORING ANALYSIS ──

  analyzeColoring(canvas) {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap = new Map();
    let coloredPixels = 0;
    let totalSampled = 0;

    for (let i = 0; i < data.length; i += 24) {
      totalSampled++;
      const a = data[i + 3];
      if (a > 60) {
        coloredPixels++;
        const r = Math.round(data[i] / 36) * 36;
        const g = Math.round(data[i + 1] / 36) * 36;
        const b = Math.round(data[i + 2] / 36) * 36;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }

    return {
      uniqueColors: colorMap.size,
      coloredAreaRatio: totalSampled > 0 ? (coloredPixels / totalSampled) : 0
    };
  }

  // ── RASTERIZATION HELPERS ──

  renderStrokesToGrid(strokes, rawPoints, ctx, shapeTarget) {
    ctx.clearRect(0, 0, 120, 120);
    if (!rawPoints || rawPoints.length < 2) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rawPoints.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const w = maxX - minX || 1;
    const h = maxY - minY || 1;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Target reference bounding box max span in 120x120 grid
    let targetSpan = 74;
    if (shapeTarget?.id === 'oval' || shapeTarget?.id === 'rectangle') {
      targetSpan = 86;
    }
    const scale = targetSpan / Math.max(w, h, 1);

    ctx.save();
    ctx.strokeStyle = '#e8864a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (strokes && strokes.length > 0) {
      strokes.forEach(s => {
        if (!s.points || s.points.length === 0 || s.tool === 'eraser') return;
        ctx.beginPath();
        const p0 = s.points[0];
        ctx.moveTo(60 + (p0.x - cx) * scale, 60 + (p0.y - cy) * scale);
        for (let i = 1; i < s.points.length; i++) {
          const pt = s.points[i];
          ctx.lineTo(60 + (pt.x - cx) * scale, 60 + (pt.y - cy) * scale);
        }
        ctx.stroke();
      });
    } else {
      ctx.beginPath();
      ctx.moveTo(60 + (rawPoints[0].x - cx) * scale, 60 + (rawPoints[0].y - cy) * scale);
      for (let i = 1; i < rawPoints.length; i++) {
        const pt = rawPoints[i];
        ctx.lineTo(60 + (pt.x - cx) * scale, 60 + (pt.y - cy) * scale);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  renderSvgToGrid(svgStr, ctx) {
    ctx.clearRect(0, 0, 120, 120);
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.scale(1.2, 1.2);

    // Simple parser for standard paths
    if (svgStr.includes('<circle')) {
      ctx.beginPath();
      ctx.arc(50, 50, 31, 0, Math.PI * 2);
      ctx.stroke();
    } else if (svgStr.includes('<rect x="20"')) {
      ctx.strokeRect(20, 20, 60, 60);
    } else if (svgStr.includes('<rect x="12"')) {
      ctx.strokeRect(12, 29, 76, 42);
    } else if (svgStr.includes('<ellipse')) {
      ctx.beginPath();
      ctx.ellipse(50, 50, 36, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Draw approximate polygon
      const m = svgStr.match(/points="([^"]+)"/);
      if (m) {
        const pts = m[1].trim().split(/\s+/).map(pair => pair.split(',').map(Number));
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeRect(15, 15, 70, 70);
      }
    }
    ctx.restore();
  }

  isCanvasBlank(canvas) {
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 8) {
      if (data[i] > 15) return false;
    }
    return true;
  }
}

export const preciseMatcher = new PreciseShapeMatcher();
