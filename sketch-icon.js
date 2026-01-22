/**
 * Lightfast Icon - Simplified Flow Field
 *
 * Designed for 32x32 favicon / app icon use.
 * Bold strokes, minimal lines, high contrast.
 */

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

random.setSeed('lightfast-icon-v1');

const settings = {
  dimensions: [512, 512], // Design at 512, export scaled versions
  animate: false,
  suffix: 'icon',
  pixelsPerInch: 300,
};

const params = {
  // Icon-optimized: fewer, bolder lines
  lineCount: 5,

  // Stroke sizing (relative to canvas)
  strokeWidth: 0.06, // 6% of canvas = ~31px at 512, ~2px at 32

  // Flow parameters
  noiseScale: 0.003,
  noiseStrength: Math.PI * 0.8,

  // Line length and smoothness
  lineLength: 60,
  stepSize: 8,

  // Colors
  backgroundColor: '#0a0a0f',
  strokeColor: '#ffffff',

  // Layout
  margin: 0.12,

  // Radial burst from center
  radialStrength: 0.6,

  // Curve smoothing
  smoothing: true,
};

/**
 * Get flow angle - combines radial burst with subtle noise
 */
function getFlowAngle(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;

  const dx = x - cx;
  const dy = y - cy;
  const radialAngle = Math.atan2(dy, dx);

  const noise = random.noise2D(x * params.noiseScale, y * params.noiseScale);
  const noiseAngle = noise * params.noiseStrength;

  return radialAngle * params.radialStrength + noiseAngle * (1 - params.radialStrength);
}

/**
 * Trace a flow line from a starting point
 */
function traceLine(startX, startY, width, height) {
  const points = [];
  let x = startX;
  let y = startY;

  const margin = width * params.margin;

  for (let i = 0; i < params.lineLength; i++) {
    points.push({ x, y });

    const angle = getFlowAngle(x, y, width, height);
    x += Math.cos(angle) * params.stepSize;
    y += Math.sin(angle) * params.stepSize;

    // Stop if out of bounds
    if (x < margin || x > width - margin || y < margin || y > height - margin) {
      break;
    }
  }

  return points;
}

/**
 * Draw a smooth curve through points using quadratic beziers
 */
function drawSmoothCurve(ctx, points) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    // Use quadratic curves for smoothness
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    // Connect to last point
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
  }

  ctx.stroke();
}

/**
 * Generate strategic spawn points for icon
 */
function getSpawnPoints(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.25;

  const points = [];
  const count = params.lineCount;

  // Spawn in a ring around center, slightly offset
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // Start from top
    const jitter = random.gaussian(0, 0.15);
    const r = radius * (0.8 + random.value() * 0.4);

    points.push({
      x: cx + Math.cos(angle + jitter) * r,
      y: cy + Math.sin(angle + jitter) * r,
    });
  }

  return points;
}

const sketch = () => {
  return ({ context: ctx, width, height }) => {
    // Background
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Stroke settings
    const strokeWidth = width * params.strokeWidth;
    ctx.strokeStyle = params.strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Get spawn points and trace lines
    const spawns = getSpawnPoints(width, height);

    spawns.forEach((spawn) => {
      const points = traceLine(spawn.x, spawn.y, width, height);

      if (points.length >= 2) {
        if (params.smoothing) {
          drawSmoothCurve(ctx, points);
        } else {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
      }
    });

    // Log SVG path data for manual extraction
    console.log('\n--- SVG Path Data (for vector export) ---');
    spawns.forEach((spawn, i) => {
      const points = traceLine(spawn.x, spawn.y, width, height);
      if (points.length >= 2) {
        const pathData = pointsToSVGPath(points);
        console.log(`Path ${i + 1}: ${pathData}`);
      }
    });
  };
};

/**
 * Convert points to SVG path data
 */
function pointsToSVGPath(points) {
  if (points.length < 2) return '';

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 1; i < points.length - 1; i++) {
    const xc = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
    const yc = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${xc} ${yc}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  return d;
}

canvasSketch(sketch, settings);
