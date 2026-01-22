/**
 * Lightfast Logo Flow Field
 *
 * A refined flow field sketch specifically designed for the Lightfast brand.
 * The design evokes speed, light, and precision - core themes for an AI company.
 *
 * Key visual themes:
 * - Light rays / beams emanating from center
 * - Fast, directional flow suggesting speed and efficiency
 * - Clean, modern aesthetic suitable for tech branding
 */

const canvasSketch = require('canvas-sketch');
const { lerp, mapRange } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

// Set a seed for reproducible results
random.setSeed('lightfast');
console.log('Seed:', random.getSeed());

const settings = {
  dimensions: [1024, 1024],
  animate: false,
  suffix: 'lightfast',
  pixelsPerInch: 300,
};

// ============================================
// LIGHTFAST BRAND PARAMETERS
// ============================================
const params = {
  // Grid resolution
  gridResolution: 60,

  // Flow lines
  lineCount: 600,
  lineLength: 100,
  stepSize: 3,

  // Noise configuration for smooth, directional flow
  noiseScale: 0.0015,
  noiseAmplitude: Math.PI * 1.5,

  // Line styling
  lineWidthMin: 0.3,
  lineWidthMax: 1.5,
  opacityMin: 0.2,
  opacityMax: 0.8,

  // Brand colors
  backgroundColor: '#0d0d0d',

  // Lightfast brand palette - gradients of light
  brandColors: [
    '#ffffff',  // Pure white - light
    '#f0f4ff',  // Ice white
    '#c4d4ff',  // Light blue
    '#7b9cff',  // Medium blue
    '#4a6fff',  // Electric blue
    '#2a4fff',  // Deep blue
  ],

  // Alternative warm palette (uncomment to try)
  // brandColors: [
  //   '#ffffff',
  //   '#fff8e6',
  //   '#ffdd80',
  //   '#ffaa00',
  //   '#ff6600',
  // ],

  margin: 0.08,

  // Center-weighted spawn for radial effect
  spawnPattern: 'radial-burst',

  // Flow field modifiers
  radialInfluence: 0.4,  // How much the flow radiates from center
  spiralTwist: 0.2,      // Adds spiral motion
};

// ============================================
// FLOW FIELD FUNCTIONS
// ============================================

/**
 * Get flow angle with radial and spiral components
 * Creates a "burst of light" effect emanating from center
 */
function getFlowAngle(x, y, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate angle from center (radial component)
  const dx = x - centerX;
  const dy = y - centerY;
  const radialAngle = Math.atan2(dy, dx);

  // Calculate distance from center (normalized)
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const normalizedDist = dist / maxDist;

  // Perlin noise component for organic variation
  const noiseAngle = random.noise2D(x * params.noiseScale, y * params.noiseScale) * params.noiseAmplitude;

  // Combine radial flow with noise
  // Near center: more radial, near edges: more noise
  const radialWeight = params.radialInfluence * (1 - normalizedDist * 0.5);

  // Add spiral twist
  const spiralAngle = normalizedDist * params.spiralTwist * Math.PI;

  return radialAngle * radialWeight + noiseAngle * (1 - radialWeight) + spiralAngle;
}

/**
 * Generate spawn positions with center-weighted distribution
 */
function generateSpawnPositions(width, height, count) {
  const positions = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const margin = params.margin;
  const maxRadius = Math.min(width, height) * (0.5 - margin);

  if (params.spawnPattern === 'radial-burst') {
    // Create rings of particles emanating from center
    const rings = 12;
    const particlesPerRing = Math.floor(count / rings);

    for (let ring = 0; ring < rings; ring++) {
      // Rings get larger exponentially for even visual distribution
      const ringRadius = maxRadius * Math.pow((ring + 1) / rings, 0.7);
      const particleCount = Math.floor(particlesPerRing * (1 + ring * 0.3));

      for (let i = 0; i < particleCount && positions.length < count; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + random.gaussian(0, 0.1);
        const jitter = random.gaussian(0, ringRadius * 0.1);

        positions.push({
          x: centerX + Math.cos(angle) * (ringRadius + jitter),
          y: centerY + Math.sin(angle) * (ringRadius + jitter),
          ring: ring,
        });
      }
    }

    // Add some random particles in the center for density
    const centerCount = Math.floor(count * 0.1);
    for (let i = 0; i < centerCount; i++) {
      const r = random.value() * maxRadius * 0.3;
      const theta = random.value() * Math.PI * 2;
      positions.push({
        x: centerX + Math.cos(theta) * r,
        y: centerY + Math.sin(theta) * r,
        ring: 0,
      });
    }
  }

  return positions.slice(0, count);
}

/**
 * Trace a flow line
 */
function traceFlowLine(startX, startY, width, height) {
  const points = [];
  let x = startX;
  let y = startY;

  const margin = params.margin;
  const minX = width * margin;
  const maxX = width * (1 - margin);
  const minY = height * margin;
  const maxY = height * (1 - margin);

  for (let i = 0; i < params.lineLength; i++) {
    points.push({ x, y });

    const angle = getFlowAngle(x, y, width, height);
    x += Math.cos(angle) * params.stepSize;
    y += Math.sin(angle) * params.stepSize;

    if (x < minX || x > maxX || y < minY || y > maxY) {
      break;
    }
  }

  return points;
}

// ============================================
// SKETCH
// ============================================

const sketch = () => {
  return ({ context, width, height }) => {
    // Dark background
    context.fillStyle = params.backgroundColor;
    context.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    // Generate spawn positions
    const spawnPositions = generateSpawnPositions(width, height, params.lineCount);

    // Sort by distance from center (draw outer first for layering)
    spawnPositions.sort((a, b) => {
      const distA = Math.sqrt((a.x - centerX) ** 2 + (a.y - centerY) ** 2);
      const distB = Math.sqrt((b.x - centerX) ** 2 + (b.y - centerY) ** 2);
      return distB - distA;
    });

    // Draw flow lines
    spawnPositions.forEach((spawn, index) => {
      const points = traceFlowLine(spawn.x, spawn.y, width, height);

      if (points.length < 2) return;

      // Calculate distance from center for color/opacity
      const dist = Math.sqrt((spawn.x - centerX) ** 2 + (spawn.y - centerY) ** 2);
      const normalizedDist = dist / maxDist;

      // Color based on distance (brighter near center)
      const colorIndex = Math.floor(normalizedDist * (params.brandColors.length - 1));
      const color = params.brandColors[Math.min(colorIndex, params.brandColors.length - 1)];

      // Line properties - thicker and more opaque near center
      const lineWidth = lerp(
        params.lineWidthMax,
        params.lineWidthMin,
        normalizedDist
      ) * (0.5 + random.value() * 0.5);

      const opacity = lerp(
        params.opacityMax,
        params.opacityMin,
        normalizedDist * 0.7
      ) * (0.7 + random.value() * 0.3);

      // Draw with tapering effect
      drawTaperedLine(context, points, color, lineWidth, opacity);
    });

    // Add subtle glow at center
    addCenterGlow(context, width, height);
  };
};

/**
 * Draw a line that tapers from thick to thin
 */
function drawTaperedLine(context, points, color, maxWidth, opacity) {
  if (points.length < 2) return;

  for (let i = 0; i < points.length - 1; i++) {
    const t = i / (points.length - 1);
    // Taper: thick at start, thin at end
    const width = maxWidth * (1 - t * 0.8);
    const segmentOpacity = opacity * (1 - t * 0.5);

    context.beginPath();
    context.moveTo(points[i].x, points[i].y);
    context.lineTo(points[i + 1].x, points[i + 1].y);

    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.globalAlpha = segmentOpacity;
    context.stroke();
  }

  context.globalAlpha = 1;
}

/**
 * Add a subtle glow effect at the center
 */
function addCenterGlow(context, width, height) {
  const gradient = context.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.25
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.03)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

canvasSketch(sketch, settings);
