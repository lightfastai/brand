/**
 * Flow Field Sketch for Lightfast Logo Generation
 *
 * Uses Perlin noise to create organic flow patterns
 * Particles/lines follow the vector field
 * Configurable parameters for refinement
 */

const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

// Set a seed for reproducible results (comment out for random)
random.setSeed(random.getRandomSeed());
console.log('Seed:', random.getSeed());

const settings = {
  // Output size suitable for logo work
  dimensions: [1024, 1024],
  // Enable animation if desired
  animate: false,
  // Export settings
  suffix: random.getSeed(),
  pixelsPerInch: 300,
};

// ============================================
// PARAMETERS - Adjust these to refine the flow field
// ============================================
const params = {
  // Grid resolution for the flow field
  gridResolution: 50,

  // Number of flow lines/particles
  lineCount: 800,

  // Length of each line (number of steps)
  lineLength: 80,

  // Step size for particle movement
  stepSize: 2,

  // Noise scale - lower = smoother, larger patterns
  noiseScale: 0.002,

  // Noise amplitude - controls how much the angle varies
  noiseAmplitude: Math.PI * 2,

  // Line width range
  lineWidthMin: 0.5,
  lineWidthMax: 2,

  // Line opacity range
  opacityMin: 0.3,
  opacityMax: 0.9,

  // Color settings
  useColorPalette: true,
  backgroundColor: '#0a0a0a',
  lineColor: '#ffffff',

  // Margin as percentage of canvas
  margin: 0.1,

  // Spawn pattern: 'random', 'grid', 'center', 'circle'
  spawnPattern: 'random',

  // Flow variation
  flowOctaves: 3,
  flowLacunarity: 2.0,
  flowPersistence: 0.5,
};

// ============================================
// FLOW FIELD FUNCTIONS
// ============================================

/**
 * Get the flow angle at a given position using multi-octave Perlin noise
 */
function getFlowAngle(x, y, time = 0) {
  let angle = 0;
  let amplitude = 1;
  let frequency = params.noiseScale;
  let maxAmplitude = 0;

  for (let i = 0; i < params.flowOctaves; i++) {
    angle += random.noise3D(x * frequency, y * frequency, time) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= params.flowPersistence;
    frequency *= params.flowLacunarity;
  }

  // Normalize and scale to desired amplitude
  return (angle / maxAmplitude) * params.noiseAmplitude;
}

/**
 * Generate spawn positions based on the selected pattern
 */
function generateSpawnPositions(width, height, count, margin) {
  const positions = [];
  const innerWidth = width * (1 - margin * 2);
  const innerHeight = height * (1 - margin * 2);
  const offsetX = width * margin;
  const offsetY = height * margin;

  switch (params.spawnPattern) {
    case 'grid':
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push({
          x: offsetX + (col / (cols - 1)) * innerWidth,
          y: offsetY + (row / (rows - 1)) * innerHeight,
        });
      }
      break;

    case 'center':
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(innerWidth, innerHeight) / 2;
      for (let i = 0; i < count; i++) {
        const r = random.value() * maxRadius;
        const theta = random.value() * Math.PI * 2;
        positions.push({
          x: centerX + Math.cos(theta) * r,
          y: centerY + Math.sin(theta) * r,
        });
      }
      break;

    case 'circle':
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(innerWidth, innerHeight) * 0.4;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const jitter = random.gaussian(0, 10);
        positions.push({
          x: cx + Math.cos(angle) * (radius + jitter),
          y: cy + Math.sin(angle) * (radius + jitter),
        });
      }
      break;

    case 'random':
    default:
      for (let i = 0; i < count; i++) {
        positions.push({
          x: offsetX + random.value() * innerWidth,
          y: offsetY + random.value() * innerHeight,
        });
      }
      break;
  }

  return positions;
}

/**
 * Trace a flow line from a starting position
 */
function traceFlowLine(startX, startY, width, height, margin) {
  const points = [];
  let x = startX;
  let y = startY;

  const minX = width * margin;
  const maxX = width * (1 - margin);
  const minY = height * margin;
  const maxY = height * (1 - margin);

  for (let i = 0; i < params.lineLength; i++) {
    points.push({ x, y });

    const angle = getFlowAngle(x, y);
    x += Math.cos(angle) * params.stepSize;
    y += Math.sin(angle) * params.stepSize;

    // Stop if we go out of bounds
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
  // Select a color palette
  const palette = random.shuffle(random.pick(palettes)).slice(0, 5);

  return ({ context, width, height }) => {
    // Background
    context.fillStyle = params.backgroundColor;
    context.fillRect(0, 0, width, height);

    // Generate spawn positions
    const spawnPositions = generateSpawnPositions(
      width, height, params.lineCount, params.margin
    );

    // Draw flow lines
    spawnPositions.forEach((spawn, index) => {
      const points = traceFlowLine(spawn.x, spawn.y, width, height, params.margin);

      if (points.length < 2) return;

      // Select color
      let color;
      if (params.useColorPalette) {
        color = palette[index % palette.length];
      } else {
        color = params.lineColor;
      }

      // Vary line properties
      const lineWidth = lerp(
        params.lineWidthMin,
        params.lineWidthMax,
        random.value()
      );
      const opacity = lerp(
        params.opacityMin,
        params.opacityMax,
        random.value()
      );

      // Draw the line with gradient opacity (fade out at end)
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }

      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.globalAlpha = opacity;
      context.stroke();
    });

    // Reset alpha
    context.globalAlpha = 1;

    // Optional: Add a subtle vignette effect for logo presentation
    addVignette(context, width, height);
  };
};

/**
 * Add a subtle vignette effect
 */
function addVignette(context, width, height) {
  const gradient = context.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.7
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

canvasSketch(sketch, settings);
