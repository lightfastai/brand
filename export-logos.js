/**
 * Lightfast Logo Variations
 * Newman zip aesthetic contained in square marks
 *
 * Usage: node export-logos.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 512;
const OUTPUT_DIR = path.join(__dirname, 'output', 'logos');

const colors = {
  bg: '#f5f3f0',
  black: '#1a1a1a',
  darkGray: '#404040',
  midGray: '#707070',
  lightGray: '#b0b0b0',
  accent: '#2563eb',  // Blue
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Draw square container with stripes inside
 */
function drawSquareWithStripes(ctx, stripes, options = {}) {
  const margin = SIZE * 0.12;
  const boxSize = SIZE - margin * 2;
  const radius = options.radius || 0;

  // Draw square background
  ctx.fillStyle = colors.bg;
  ctx.beginPath();
  if (radius > 0) {
    ctx.roundRect(margin, margin, boxSize, boxSize, radius);
  } else {
    ctx.rect(margin, margin, boxSize, boxSize);
  }
  ctx.fill();

  // Draw square border
  ctx.strokeStyle = colors.black;
  ctx.lineWidth = options.borderWidth || 4;
  ctx.beginPath();
  if (radius > 0) {
    ctx.roundRect(margin, margin, boxSize, boxSize, radius);
  } else {
    ctx.rect(margin, margin, boxSize, boxSize);
  }
  ctx.stroke();

  // Draw stripes inside the square (touching top and bottom)
  const stripeTop = margin;
  const stripeBottom = margin + boxSize;
  const stripeHeight = stripeBottom - stripeTop;

  stripes.forEach(s => {
    ctx.fillStyle = s.color;
    const x = margin + boxSize * s.x;
    const w = boxSize * s.w;
    ctx.fillRect(x, stripeTop, w, stripeHeight);
  });
}

/**
 * Version 1: Minimal Zip Mark
 */
function renderV1() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const stripes = [
    { x: 0.08, w: 0.04, color: colors.black },
    { x: 0.14, w: 0.18, color: colors.darkGray },
    { x: 0.36, w: 0.03, color: colors.midGray },
    { x: 0.42, w: 0.025, color: colors.accent },
    { x: 0.52, w: 0.22, color: colors.black },
  ];

  drawSquareWithStripes(ctx, stripes);
  return canvas;
}

/**
 * Version 2: Clustered Stripes
 */
function renderV2() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const stripes = [
    { x: 0.06, w: 0.14, color: colors.black },
    { x: 0.22, w: 0.10, color: colors.darkGray },
    { x: 0.34, w: 0.03, color: colors.midGray },
    { x: 0.39, w: 0.025, color: colors.accent },
    // Gap
    { x: 0.70, w: 0.08, color: colors.black },
  ];

  drawSquareWithStripes(ctx, stripes);
  return canvas;
}

/**
 * Version 3: "L" Letterform
 */
function renderV3() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const margin = SIZE * 0.12;
  const boxSize = SIZE - margin * 2;

  // Draw square border
  ctx.strokeStyle = colors.black;
  ctx.lineWidth = 4;
  ctx.strokeRect(margin, margin, boxSize, boxSize);

  // Fill background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(margin, margin, boxSize, boxSize);

  // Redraw border on top
  ctx.strokeRect(margin, margin, boxSize, boxSize);

  // L vertical stroke
  ctx.fillStyle = colors.black;
  ctx.fillRect(margin + boxSize * 0.15, margin, boxSize * 0.20, boxSize * 0.85);

  // Accent stripe
  ctx.fillStyle = colors.accent;
  ctx.fillRect(margin + boxSize * 0.37, margin, boxSize * 0.025, boxSize * 0.65);

  // L horizontal base
  ctx.fillStyle = colors.darkGray;
  ctx.fillRect(margin + boxSize * 0.15, margin + boxSize * 0.88, boxSize * 0.65, boxSize * 0.05);

  // End cap stripe
  ctx.fillStyle = colors.midGray;
  ctx.fillRect(margin + boxSize * 0.77, margin + boxSize * 0.70, boxSize * 0.03, boxSize * 0.23);

  return canvas;
}

/**
 * Version 4: Contained Mark (rounded)
 */
function renderV4() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const stripes = [
    { x: 0.10, w: 0.12, color: colors.black },
    { x: 0.25, w: 0.08, color: colors.darkGray },
    { x: 0.36, w: 0.02, color: colors.accent },
    { x: 0.48, w: 0.16, color: colors.black },
    { x: 0.68, w: 0.04, color: colors.midGray },
  ];

  drawSquareWithStripes(ctx, stripes, { radius: SIZE * 0.06, borderWidth: 5 });
  return canvas;
}

/**
 * Version 5: Single Accent Zip
 */
function renderV5() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const stripes = [
    { x: 0.30, w: 0.25, color: colors.black },
    { x: 0.58, w: 0.04, color: colors.accent },
  ];

  drawSquareWithStripes(ctx, stripes);
  return canvas;
}

// Generate all versions
console.log('Generating logo variations...\n');

const versions = [
  { name: 'v1-minimal-zip', render: renderV1 },
  { name: 'v2-clustered', render: renderV2 },
  { name: 'v3-letterform-L', render: renderV3 },
  { name: 'v4-contained', render: renderV4 },
  { name: 'v5-single-accent', render: renderV5 },
];

versions.forEach(({ name, render }) => {
  const canvas = render();
  const buffer = canvas.toBuffer('image/png');

  // Save 512px version
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}-512.png`), buffer);
  console.log(`  ✓ ${name}-512.png`);

  // Save 64px version (favicon preview)
  const small = createCanvas(64, 64);
  const sctx = small.getContext('2d');
  sctx.drawImage(canvas, 0, 0, 64, 64);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}-64.png`), small.toBuffer('image/png'));
  console.log(`  ✓ ${name}-64.png`);
});

console.log(`\nDone! Files saved to ${OUTPUT_DIR}/`);
