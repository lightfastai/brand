/**
 * Lightfast Logo - Lissajous Curves (corrected)
 *
 * x = sin(a*t + delta)
 * y = sin(b*t)
 *
 * Usage: node export-logo-lissajous.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 512;
const OUTPUT_DIR = path.join(__dirname, 'output', 'logos');

const colors = {
  bg: '#0a0a0f',
  white: '#ffffff',
  accent: '#2563eb',
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate Lissajous curve points
 * Need enough cycles for the curve to close properly
 */
function lissajous(a, b, delta = 0, steps = 1000) {
  const points = [];
  // For curve to close: t needs to go from 0 to 2π * LCM(a,b) / gcd(a,b)
  // For 2:3, LCM=6, so we need t from 0 to 2π for it to close
  const periods = Math.max(a, b); // ensure full curve
  const tMax = Math.PI * 2 * periods;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    const x = Math.sin(a * t + delta);
    const y = Math.sin(b * t);
    points.push({ x, y });
  }
  return points;
}

/**
 * Draw a Lissajous curve
 */
function drawLissajous(ctx, points, cx, cy, radius, strokeWidth, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  points.forEach((p, i) => {
    const x = cx + p.x * radius;
    const y = cy + p.y * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();
}

/**
 * Generate a render function for given params
 */
function createRenderer(a, b, delta, label) {
  return function() {
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const points = lissajous(a, b, delta, 2000);
    drawLissajous(ctx, points, SIZE/2, SIZE/2, SIZE * 0.38, SIZE * 0.022, colors.white);

    // Add label
    ctx.fillStyle = '#666';
    ctx.font = '16px monospace';
    ctx.fillText(`${a}:${b} δ=${label}`, 20, 30);

    return canvas;
  };
}

/**
 * Generate SVG path for Lissajous curve
 */
function lissajousToSVG(a, b, delta, size = 512, strokeWidth = 11) {
  const points = lissajous(a, b, delta, 2000);
  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;

  // Build path data
  let d = '';
  points.forEach((p, i) => {
    const x = (cx + p.x * radius).toFixed(2);
    const y = (cy + p.y * radius).toFixed(2);
    if (i === 0) d += `M ${x} ${y}`;
    else d += ` L ${x} ${y}`;
  });
  d += ' Z';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <path d="${d}" fill="none" stroke="#ffffff" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// Generate the selected curve: 3:2 with π/2
console.log('Generating Lissajous 3:2 π/2...\n');

const svg = lissajousToSVG(3, 2, Math.PI / 2, 512, 11);
fs.writeFileSync(path.join(OUTPUT_DIR, 'lightfast-logo.svg'), svg);
console.log('  ✓ lightfast-logo.svg');

// Also save PNG versions
const canvas = createRenderer(3, 2, Math.PI / 2, 'π/2')();
fs.writeFileSync(path.join(OUTPUT_DIR, 'lightfast-logo-512.png'), canvas.toBuffer('image/png'));
console.log('  ✓ lightfast-logo-512.png');

console.log(`\nDone! Files saved to ${OUTPUT_DIR}/`);
