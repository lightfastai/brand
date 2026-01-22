/**
 * Lightfast Logo - Circle with Newman Zips
 * Inspired by PlanetScale's approach
 *
 * Usage: node export-logo-circle.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 512;
const OUTPUT_DIR = path.join(__dirname, 'output', 'logos');

const colors = {
  bg: '#0a0a0f',      // Dark background
  white: '#ffffff',
  lightGray: '#e0e0e0',
  accent: '#2563eb',
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * V1: Circle with vertical stripes cutting through
 * Stripes go edge to edge of circle
 */
function renderV1() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE * 0.38;

  // Draw white circle
  ctx.fillStyle = colors.white;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Cut out vertical stripes (reveal background)
  ctx.globalCompositeOperation = 'destination-out';

  const stripes = [
    { x: 0.38, w: 0.08 },  // Left stripe
    { x: 0.52, w: 0.05 },  // Middle thin
    { x: 0.62, w: 0.03 },  // Right thinnest
  ];

  stripes.forEach(s => {
    ctx.fillRect(SIZE * s.x, 0, SIZE * s.w, SIZE);
  });

  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}

/**
 * V2: Circle outline with stripes inside
 */
function renderV2() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE * 0.38;

  // Draw circle outline
  ctx.strokeStyle = colors.white;
  ctx.lineWidth = SIZE * 0.025;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Clip to circle for stripes
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - SIZE * 0.015, 0, Math.PI * 2);
  ctx.clip();

  // Draw vertical stripes inside
  const stripes = [
    { x: 0.30, w: 0.10, color: colors.white },
    { x: 0.46, w: 0.06, color: colors.lightGray },
    { x: 0.58, w: 0.035, color: colors.accent },
  ];

  stripes.forEach(s => {
    ctx.fillStyle = s.color;
    ctx.fillRect(SIZE * s.x, 0, SIZE * s.w, SIZE);
  });

  ctx.restore();

  return canvas;
}

/**
 * V3: Solid circle with stripes as negative space (like PlanetScale)
 */
function renderV3() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE * 0.38;

  // Create circle path
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Fill circle white
  ctx.fillStyle = colors.white;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Cut stripes as negative space
  ctx.fillStyle = colors.bg;

  const stripes = [
    { x: 0.35, w: 0.09 },
    { x: 0.50, w: 0.055 },
    { x: 0.60, w: 0.032 },
  ];

  stripes.forEach(s => {
    ctx.fillRect(SIZE * s.x, 0, SIZE * s.w, SIZE);
  });

  ctx.restore();

  return canvas;
}

/**
 * V4: Half circle with stripes (more unique)
 */
function renderV4() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE * 0.38;

  // Left half circle
  ctx.fillStyle = colors.white;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();

  // Stripes on right side
  const stripes = [
    { x: 0.52, w: 0.10, color: colors.white },
    { x: 0.67, w: 0.05, color: colors.lightGray },
    { x: 0.76, w: 0.03, color: colors.accent },
  ];

  stripes.forEach(s => {
    ctx.fillStyle = s.color;
    const stripeHeight = radius * 1.6;
    ctx.fillRect(SIZE * s.x, cy - stripeHeight/2, SIZE * s.w, stripeHeight);
  });

  return canvas;
}

/**
 * V5: Circle with one accent stripe (ultra minimal)
 */
function renderV5() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = SIZE * 0.38;

  // Solid white circle
  ctx.fillStyle = colors.white;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Single accent stripe cut through
  ctx.fillStyle = colors.bg;
  ctx.fillRect(SIZE * 0.54, 0, SIZE * 0.07, SIZE);

  // Thin accent line
  ctx.fillStyle = colors.accent;
  ctx.fillRect(SIZE * 0.63, cy - radius * 0.85, SIZE * 0.025, radius * 1.7);

  return canvas;
}

// Generate all versions
console.log('Generating circle logo variations...\n');

const versions = [
  { name: 'circle-v1-cutout', render: renderV1 },
  { name: 'circle-v2-outline', render: renderV2 },
  { name: 'circle-v3-negative', render: renderV3 },
  { name: 'circle-v4-half', render: renderV4 },
  { name: 'circle-v5-minimal', render: renderV5 },
];

versions.forEach(({ name, render }) => {
  const canvas = render();

  // Save 512 and 64
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}-512.png`), canvas.toBuffer('image/png'));
  console.log(`  ✓ ${name}-512.png`);

  const small = createCanvas(64, 64);
  const sctx = small.getContext('2d');
  sctx.drawImage(canvas, 0, 0, 64, 64);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}-64.png`), small.toBuffer('image/png'));
  console.log(`  ✓ ${name}-64.png`);
});

console.log(`\nDone! Files saved to ${OUTPUT_DIR}/`);
