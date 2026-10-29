# FLN L39: Shape Master (Vite React Edition)

A visual-first, minimal-text shape drawing, coloring, and **high-precision evaluation** game designed for elementary children attaining **FLN Skill L39 (S3.22 - Draws 2D Shapes Freehand)**, inspired by the FLN worksheet ([l39_shape_practice(1) (1).html](file:///home/rohith/vs_code/coders%20high/Tenali%20Repo/FLN/l39_shape_practice%281%29%20%281%29.html)) and styled with Tenali's Kid Zone & Espresso UI design systems.

---

## 🎯 High-Precision Matching System

To evaluate children's drawings with high accuracy across both simple shapes and composite objects, the app uses a multi-faceted recognition pipeline in [src/lib/precise-matcher.js](file:///home/rohith/vs_code/coders%20high/Tenali%20Repo/FLN/src/lib/precise-matcher.js):

1. **$P Point-Cloud Recognizer (ACM Algorithm)**:
   - Resamples strokes into a normalized, equidistant 64-point cloud.
   - Normalizes for translation and scale.
   - Computes bipartite Euclidean assignment distance against canonical templates.
   - Invariant to stroke count, drawing direction (clockwise vs counter-clockwise), and stroke order.

2. **Hu Invariant Image Moments**:
   - Computes 2D spatial moments ($m_{pq}$), normalized central moments ($\eta_{pq}$), and Hu's scale-and-rotation-invariant moments ($h_1 \dots h_4$).
   - Provides global shape descriptor matching identical to computer vision contour matching (`cv.matchShapes`).

3. **Bidirectional Chamfer Distance & Visual Difference Heatmap**:
   - Measures sub-pixel distance between drawn contours and template edges.
   - Generates a **Visual Difference Heatmap**:
     - 🟢 **Green**: Accurate strokes (within 5px of template).
     - 🟡 **Amber**: Slight deviation (within 12px).
     - 🔴 **Red**: Out-of-line strokes.
   - Gives young children immediate, color-coded visual feedback without reading words!

4. **Curvature Extrema & Geometric Corner Analysis**:
   - Detects vertices and right angles (e.g. 0 corners for circle/oval, 3 for triangle, 4 for square/rectangle, 5 for pentagon, 6 for hexagon).
   - Verifies circularity ($4\pi A / P^2$) and radius uniformity from centroid.

5. **Hierarchical Multi-Part Matching for Composite Objects**:
   - **Hut / House 🏠**: Verifies triangular roof peak on top + rectangular walls below.
   - **Car 🚗**: Verifies chassis polygon + 2 circular wheel hubs at the bottom.
   - **Tree 🌲**: Verifies tiered triangular foliage + vertical trunk.
   - **Sun ☀️**: Verifies round central core + radiating rays.
   - **Boat ⛵, Fish 🐟, Flower 🌸, Kite 🪁**: Component-based segment verification.

6. **Coloring Verification & Flair Bonus**:
   - Detects interior flood-filled / colored pixels and color diversity to award bonus stars.

---

## 🎨 Excalidraw-Inspired Drawing & Coloring

- **Organic Vector Strokes**: Powered by `perfect-freehand` for pressure/velocity smoothing.
- **Paint Bucket Flood Fill (`🪣`)**: Fast BFS flood-fill algorithm allowing children to fill enclosed regions with color.
- **Tools**: Pencil (`✏️`), Crayon (`🖍️`), Marker (`🖌️`), Paint Bucket (`🪣`), Eraser (`🧼`).
- **Minimal Text UI**: Intuitive icons, stage numbers (`1`, `2`, `3`, `4`, `5`, `★`), and auditory pronunciation (`🔊`) via Web Speech API.
- **Tenali Theme Integration**: Kid-Zone pastel dot-matrix background + Espresso Dark theme toggle.

---

## 🚀 Development & Running

Start the Vite development server:
```bash
cd FLN
npm install
npm run dev -- --port 5175
```
Access in browser:
**`http://localhost:5175/`**

To create a production bundle:
```bash
npm run build
```
# FLN-L39-2D-Shapes
