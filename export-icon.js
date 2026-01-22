/**
 * Lightfast Icon - Node.js Export Script
 * Generates icon PNGs at multiple sizes without needing a browser.
 *
 * Usage: node export-icon.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Seeded random
let seed = 54321;
function seededRandom() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function noise2D(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function resetSeed() {
  seed = 54321;
}

const params = {
  lineCount: 5,
  strokeWidthRatio: 0.045, // Slightly thinner
  noiseScale: 0.004,       // Less noise frequency
  noiseStrength: Math.PI * 0.4, // Gentler curves
  lineLength: 35,          // Shorter for cleaner arcs
  stepSize: 12,
  backgroundColor: '#0a0a0f',
  strokeColor: '#ffffff',
  margin: 0.1,
  radialStrength: 0.75,    // Stronger radial = more "burst" effect
};

function getFlowAngle(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;

  // Pure radial angle (pointing outward from center)
  const radialAngle = Math.atan2(dy, dx);

  // Distance from center
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const normDist = dist / maxDist;

  // Subtle noise - more near the edges
  const noiseVal = noise2D(x * params.noiseScale, y * params.noiseScale);
  const noiseAngle = noiseVal * params.noiseStrength * normDist;

  // Mostly radial, with gentle curve
  return radialAngle + noiseAngle * (1 - params.radialStrength);
}

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
    if (x < margin || x > width - margin || y < margin || y > height - margin) break;
  }
  return points;
}

function getSpawnPoints(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.15; // Spawn closer to center
  const points = [];
  const count = params.lineCount;

  // Distribute evenly around center with slight offset
  const startAngle = -Math.PI * 0.6; // Start from upper-left area

  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i / count) * Math.PI * 2;
    // Vary the radius slightly for each line
    const r = radius * (0.8 + seededRandom() * 0.4);

    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return points;
}

function drawSmoothCurve(ctx, points) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
  }
  ctx.stroke();
}

function renderIcon(size) {
  resetSeed();

  const scale = size / 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = params.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // Scale context
  ctx.scale(scale, scale);

  // Stroke settings
  const strokeWidth = 512 * params.strokeWidthRatio;
  ctx.strokeStyle = params.strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw flow lines
  const spawns = getSpawnPoints(512, 512);
  spawns.forEach((spawn) => {
    const points = traceLine(spawn.x, spawn.y, 512, 512);
    if (points.length >= 2) {
      drawSmoothCurve(ctx, points);
    }
  });

  return canvas;
}

function generateSVG() {
  resetSeed();
  const size = 512;
  const spawns = getSpawnPoints(size, size);
  const strokeWidth = size * params.strokeWidthRatio;

  let paths = '';
  spawns.forEach((spawn) => {
    const points = traceLine(spawn.x, spawn.y, size, size);
    if (points.length >= 2) {
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length - 1; i++) {
        const xc = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
        const yc = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
        d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${xc} ${yc}`;
      }
      const last = points[points.length - 1];
      d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
      paths += `  <path d="${d}" />\n`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${params.backgroundColor}" />
  <g fill="none" stroke="${params.strokeColor}" stroke-width="${strokeWidth.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round">
${paths}  </g>
</svg>`;
}

// Export
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [32, 48, 64, 128, 180, 192, 512, 1024];

console.log('Generating Lightfast icon...\n');

sizes.forEach((size) => {
  const canvas = renderIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = `lightfast-icon-${size}x${size}.png`;
  fs.writeFileSync(path.join(outputDir, filename), buffer);
  console.log(`  ✓ ${filename}`);
});

// SVG
const svg = generateSVG();
fs.writeFileSync(path.join(outputDir, 'lightfast-icon.svg'), svg);
console.log('  ✓ lightfast-icon.svg');

console.log(`\nDone! Files saved to ${outputDir}/`);
