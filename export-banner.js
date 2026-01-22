/**
 * Lightfast Twitter Banner
 * 1500 x 300 px
 *
 * Newman zip aesthetic with text placement
 *
 * Usage: node export-banner.js
 */

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register Geist font
registerFont(path.join(__dirname, 'fonts/Geist-Regular.ttf'), { family: 'Geist', weight: '400' });
registerFont(path.join(__dirname, 'fonts/Geist-Medium.ttf'), { family: 'Geist', weight: '500' });

const WIDTH = 1500;
const HEIGHT = 500;

// Seeded random for reproducibility
let seed = 42;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function resetSeed() {
  seed = 42;
}

const params = {
  backgroundColor: '#f5f3f0',  // Warm off-white

  // Stripe colors (grays)
  stripeColors: [
    '#1a1a1a',
    '#2d2d2d',
    '#404040',
    '#555555',
    '#707070',
    '#909090',
    '#b0b0b0',
    '#c8c8c8',
  ],

  // Accent zips
  accentColors: [
    '#2563eb',  // Blue
    '#f59e0b',  // Amber/orange
  ],

  // Stripe zone (full width)
  stripeZoneWidth: 1.0,  // 100% of width for stripes

  // Text
  text: 'The memory layer for software teams',
  textColor: '#1a1a1a',

  // Stripe generation
  stripeCount: 60,
  minStripeWidth: 2,
  maxStripeWidth: 80,

};

/**
 * Generate stripe definitions
 */
function generateStripes() {
  const stripes = [];
  const zoneWidth = WIDTH * params.stripeZoneWidth;

  let x = 0;

  while (x < zoneWidth && stripes.length < params.stripeCount) {
    // Decide stripe width (variable)
    const widthRoll = random();
    let stripeWidth;

    if (widthRoll < 0.2) {
      // Thin hairline
      stripeWidth = params.minStripeWidth + random() * 4;
    } else if (widthRoll < 0.5) {
      // Medium
      stripeWidth = 8 + random() * 20;
    } else {
      // Wide
      stripeWidth = 30 + random() * (params.maxStripeWidth - 30);
    }

    // Full height stripes
    let yStart = 0;
    let yEnd = HEIGHT;

    // Choose color
    const colorIndex = Math.floor(random() * params.stripeColors.length);
    let color = params.stripeColors[colorIndex];

    // Small chance of accent color
    if (random() < 0.025 && stripes.length > 5) {
      const accentIndex = Math.floor(random() * params.accentColors.length);
      color = params.accentColors[accentIndex];
    }

    // Opacity variation
    const opacity = 0.6 + random() * 0.4;

    stripes.push({
      x,
      width: stripeWidth,
      yStart,
      yEnd,
      color,
      opacity,
    });

    // Gap before next stripe
    const gapRoll = random();
    let gap;
    if (gapRoll < 0.4) {
      gap = 1 + random() * 3;  // Tight
    } else if (gapRoll < 0.8) {
      gap = 4 + random() * 15; // Medium
    } else {
      gap = 20 + random() * 40; // Wide gap
    }

    x += stripeWidth + gap;
  }

  return stripes;
}

/**
 * Draw a stripe - clean rectangle
 */
function drawStripe(ctx, stripe) {
  const { x, width, yStart, yEnd, color, opacity } = stripe;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.fillRect(x, yStart, width, yEnd - yStart);
  ctx.restore();
}

/**
 * Draw text
 */
function drawText(ctx) {
  const fontSize = 52;

  // Geist font
  ctx.font = `500 ${fontSize}px "Geist"`;
  ctx.fillStyle = params.textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Position: bottom-right
  const textX = WIDTH * 0.38;
  const textY = HEIGHT * 0.88;

  ctx.fillText(params.text, textX, textY);
}

/**
 * Main render
 */
function render() {
  resetSeed();

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = params.backgroundColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Generate and draw stripes
  const stripes = generateStripes();

  // Sort by width (draw wider ones first for layering)
  stripes.sort((a, b) => b.width - a.width);

  stripes.forEach(stripe => {
    drawStripe(ctx, stripe);
  });

  return canvas;
}

// Export
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating Lightfast banner...\n');

const canvas = render();
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(outputDir, 'lightfast-banner.png'), buffer);

console.log('  ✓ lightfast-banner.png (1500x500)');
console.log(`\nDone! File saved to ${outputDir}/`);
