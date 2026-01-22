/**
 * Lightfast Logo - Minimal Version
 * Designed for readability at all sizes
 *
 * Usage: node export-logo-minimal.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 512;
const OUTPUT_DIR = path.join(__dirname, 'output', 'logos');

const colors = {
  bg: '#f5f3f0',
  black: '#1a1a1a',
  darkGray: '#3d3d3d',
  accent: '#2563eb',
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function renderMinimal(padding = 0.10) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const margin = SIZE * padding;
  const boxSize = SIZE - margin * 2;
  const borderWidth = boxSize * 0.03;  // 3% of box size, scales with padding

  // Draw filled square border (not stroke, for crispness)
  ctx.fillStyle = colors.black;
  ctx.fillRect(margin, margin, boxSize, boxSize);

  // Inner background
  const innerMargin = margin + borderWidth;
  const innerSize = boxSize - borderWidth * 2;
  ctx.fillStyle = colors.bg;
  ctx.fillRect(innerMargin, innerMargin, innerSize, innerSize);

  // Stripes - only 3, each substantial
  // Positioned relative to inner box
  const stripeTop = innerMargin;
  const stripeHeight = innerSize;

  // Stripe 1: Bold black (main element)
  const s1x = innerMargin + innerSize * 0.12;
  const s1w = innerSize * 0.22;  // ~22% width - dominant
  ctx.fillStyle = colors.black;
  ctx.fillRect(s1x, stripeTop, s1w, stripeHeight);

  // Stripe 2: Medium dark gray
  const s2x = innerMargin + innerSize * 0.42;
  const s2w = innerSize * 0.14;  // ~14% width
  ctx.fillStyle = colors.darkGray;
  ctx.fillRect(s2x, stripeTop, s2w, stripeHeight);

  // Stripe 3: Accent blue (the "zip")
  const s3x = innerMargin + innerSize * 0.64;
  const s3w = innerSize * 0.06;  // ~6% width - thinnest but still visible
  ctx.fillStyle = colors.accent;
  ctx.fillRect(s3x, stripeTop, s3w, stripeHeight);

  return canvas;
}

// Generate
console.log('Generating minimal logos...\n');

// Standard version (10% padding)
const canvasStandard = renderMinimal(0.10);

// Social/profile version (22% padding for circular crop)
const canvasSocial = renderMinimal(0.22);

// Save standard version
const sizes = [512, 256, 128, 64, 32];

console.log('Standard version:');
sizes.forEach(size => {
  const scaled = createCanvas(size, size);
  const sctx = scaled.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(canvasStandard, 0, 0, size, size);

  const filename = `minimal-${size}.png`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), scaled.toBuffer('image/png'));
  console.log(`  ✓ ${filename}`);
});

// Save social/profile version
console.log('\nSocial/profile version (more padding):');
const socialSizes = [400, 200];

socialSizes.forEach(size => {
  const scaled = createCanvas(size, size);
  const sctx = scaled.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(canvasSocial, 0, 0, size, size);

  const filename = `minimal-social-${size}.png`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), scaled.toBuffer('image/png'));
  console.log(`  ✓ ${filename}`);
});

console.log(`\nDone! Files saved to ${OUTPUT_DIR}/`);
