import * as THREE from 'three';
import {
  vertexShader,
  fluidFragmentShader,
  displayFragmentShader,
} from './shaders.js';
import './code-env.js';
import './about-anim.js';

const isCoarsePointer =
  window.matchMedia('(pointer: coarse)').matches ||
  window.matchMedia('(hover: none)').matches;

const CONFIG = {
  // Simulation render-target size (square, ping-pong)
  simSize: isCoarsePointer ? 320 : 500,
  // Trail mask — mobile: finger-sized stroke, no auto-fill
  decay: isCoarsePointer ? 0.985 : 0.97,
  lineWidth: isCoarsePointer ? 0.11 : 0.09,
  perFrameIntensity: isCoarsePointer ? 0.38 : 0.3,
  // Reveal threshold (display shader)
  revealThreshold: 0.02,
  edgeWidthBase: 0.004, // divided by uDpr in shader
  // Soft gray halo overlay (display shader)
  haloUpperMul: 2.0, // halo upper bound = revealThreshold * this
  haloMixStrength: 0.35,
  haloGray: [0.12, 0.12, 0.12],
  // Idle auto-trail — disabled on phones (manual finger paint only)
  enableAutoTrail: !isCoarsePointer,
  idleThresholdMs: 2500,
  idleEaseInMs: 1500,
  autoLerp: 0.05,
  // Mouse / finger stop detection
  stopAfterMs: isCoarsePointer ? 80 : 50,
  // Max texture size
  maxTextureSize: isCoarsePointer ? 2048 : 4096,
};

const canvas = document.querySelector('.hero canvas');
const hero = document.querySelector('.hero');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isCoarsePointer,
  precision: 'highp',
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.75 : 2));

const scene = new THREE.Scene();
const simScene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const rtOptions = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  // Half float is far more reliable on iOS / mobile GPUs than FloatType
  type: THREE.HalfFloatType,
};

const pingPong = [
  new THREE.WebGLRenderTarget(CONFIG.simSize, CONFIG.simSize, rtOptions),
  new THREE.WebGLRenderTarget(CONFIG.simSize, CONFIG.simSize, rtOptions),
];

renderer.setRenderTarget(pingPong[0]);
renderer.clear();
renderer.setRenderTarget(pingPong[1]);
renderer.clear();
renderer.setRenderTarget(null);

let currentTarget = 0;

const mouse = new THREE.Vector2(0.5, 0.5);
const prevMouse = new THREE.Vector2(0.5, 0.5);
let isMoving = false;
let lastMoveTime = 0;
let touchDrawing = false;
let heroInView = true;

function createPlaceholderTexture(hex) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 5;
  const ctx = c.getContext('2d');
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 4, 5);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

const topPlaceholder = createPlaceholderTexture('#0000ff');
const bottomPlaceholder = createPlaceholderTexture('#ff0000');

const topTextureSize = new THREE.Vector2(4, 5);
const bottomTextureSize = new THREE.Vector2(4, 5);

function downscaleIfNeeded(img) {
  let { width, height } = img;
  const max = CONFIG.maxTextureSize;

  if (width <= max && height <= max) {
    return { canvas: img, width, height };
  }

  const scale = Math.min(max / width, max / height);
  width = Math.floor(width * scale);
  height = Math.floor(height * scale);

  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas: off, width, height };
}

function loadPortrait(url, sizeUniform, materialUniformKey) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';

  img.onload = () => {
    try {
      const { canvas: source, width, height } = downscaleIfNeeded(img);
      sizeUniform.set(width, height);

      let tex;
      if (source instanceof HTMLCanvasElement) {
        tex = new THREE.CanvasTexture(source);
      } else {
        const off = document.createElement('canvas');
        off.width = width;
        off.height = height;
        off.getContext('2d').drawImage(source, 0, 0);
        tex = new THREE.CanvasTexture(off);
      }

      tex.needsUpdate = true;
      displayMaterial.uniforms[materialUniformKey].value = tex;
      console.log(`[ATA DUMAN] Loaded ${url} (${width}×${height})`);
    } catch (err) {
      console.error(`[ATA DUMAN] Failed to process ${url}`, err);
    }
  };

  img.onerror = (err) => {
    console.error(`[ATA DUMAN] Failed to load ${url}`, err);
  };

  img.src = url;
}

const trailsMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader: fluidFragmentShader,
  uniforms: {
    uPrevTrails: { value: pingPong[0].texture },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uPrevMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uDecay: { value: CONFIG.decay },
    uIsMoving: { value: false },
    uLineWidth: { value: CONFIG.lineWidth },
    uIntensity: { value: CONFIG.perFrameIntensity },
  },
});

const displayMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader: displayFragmentShader,
  uniforms: {
    uFluid: { value: pingPong[0].texture },
    uTopTexture: { value: topPlaceholder },
    uBottomTexture: { value: bottomPlaceholder },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uTopTextureSize: { value: topTextureSize },
    uBottomTextureSize: { value: bottomTextureSize },
    uDpr: { value: Math.min(window.devicePixelRatio, isCoarsePointer ? 1.75 : 2) },
  },
});

loadPortrait('/portrait_top.png', topTextureSize, 'uTopTexture');
loadPortrait('/portrait_bottom.png', bottomTextureSize, 'uBottomTexture');

const geometry = new THREE.PlaneGeometry(2, 2);
const displayMesh = new THREE.Mesh(geometry, displayMaterial);
scene.add(displayMesh);

const simMesh = new THREE.Mesh(geometry, trailsMaterial);
simScene.add(simMesh);

const autoMouse = new THREE.Vector2(0.5, 0.5);
const prevAutoMouse = new THREE.Vector2(0.5, 0.5);

if (hero && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    ([entry]) => {
      heroInView = entry.isIntersecting && entry.intersectionRatio > 0.15;
    },
    { threshold: [0, 0.15, 0.4] }
  );
  io.observe(hero);
}

function getAutoTarget(now) {
  const t = now * 0.001;
  return {
    x: 0.5 + 0.3 * Math.sin(t * 0.41) + 0.12 * Math.sin(t * 0.93 + 1.3),
    y: 0.5 + 0.28 * Math.cos(t * 0.37 + 0.5) + 0.1 * Math.cos(t * 1.11 + 2.7),
  };
}

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();

  if (isMoving && now - lastMoveTime > CONFIG.stopAfterMs) {
    isMoving = false;
  }

  const idleTime = now - lastMoveTime;
  const autoActive =
    CONFIG.enableAutoTrail &&
    !touchDrawing &&
    heroInView &&
    idleTime > CONFIG.idleThresholdMs;

  const prevTarget = pingPong[currentTarget];
  currentTarget = (currentTarget + 1) % 2;
  const writeTarget = pingPong[currentTarget];

  trailsMaterial.uniforms.uPrevTrails.value = prevTarget.texture;

  if (autoActive) {
    const easeIn = Math.min(
      1,
      Math.max(0, idleTime - CONFIG.idleThresholdMs) / CONFIG.idleEaseInMs
    );

    const target = getAutoTarget(now);

    prevAutoMouse.copy(autoMouse);
    autoMouse.x += (target.x - autoMouse.x) * CONFIG.autoLerp * easeIn;
    autoMouse.y += (target.y - autoMouse.y) * CONFIG.autoLerp * easeIn;

    trailsMaterial.uniforms.uMouse.value.copy(autoMouse);
    trailsMaterial.uniforms.uPrevMouse.value.copy(prevAutoMouse);
    trailsMaterial.uniforms.uIsMoving.value = true;

    mouse.copy(autoMouse);
    prevMouse.copy(prevAutoMouse);
  } else {
    trailsMaterial.uniforms.uMouse.value.copy(mouse);
    trailsMaterial.uniforms.uPrevMouse.value.copy(prevMouse);
    trailsMaterial.uniforms.uIsMoving.value = isMoving;

    autoMouse.copy(mouse);
    prevAutoMouse.copy(mouse);
  }

  renderer.setRenderTarget(writeTarget);
  renderer.render(simScene, camera);

  displayMaterial.uniforms.uFluid.value = writeTarget.texture;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

function pointerToUv(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    inside:
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom,
    x: (clientX - rect.left) / rect.width,
    y: 1 - (clientY - rect.top) / rect.height,
  };
}

function updatePointer(clientX, clientY, { seed = false } = {}) {
  const { inside, x, y } = pointerToUv(clientX, clientY);

  if (!inside) {
    isMoving = false;
    return false;
  }

  if (seed) {
    mouse.set(x, y);
    // Tiny offset so the first frame still draws a stroke segment
    prevMouse.set(x - 0.008, y);
  } else {
    prevMouse.copy(mouse);
    mouse.set(x, y);
  }

  isMoving = true;
  lastMoveTime = performance.now();
  return true;
}

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
  updatePointer(e.clientX, e.clientY);
});

canvas.addEventListener(
  'pointerdown',
  (e) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    touchDrawing = true;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    updatePointer(e.clientX, e.clientY, { seed: true });
  },
  { passive: false }
);

canvas.addEventListener(
  'pointermove',
  (e) => {
    if (!touchDrawing) return;
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    e.preventDefault();
    updatePointer(e.clientX, e.clientY);
  },
  { passive: false }
);

function endTouchDraw(e) {
  if (e.pointerType === 'mouse') return;
  touchDrawing = false;
  isMoving = false;
  lastMoveTime = performance.now();
}

canvas.addEventListener('pointerup', endTouchDraw, { passive: true });
canvas.addEventListener('pointercancel', endTouchDraw, { passive: true });

/* Fallback for browsers that under-deliver pointer events on canvas */
canvas.addEventListener(
  'touchstart',
  (e) => {
    if (!e.touches.length) return;
    e.preventDefault();
    touchDrawing = true;
    const t = e.touches[0];
    updatePointer(t.clientX, t.clientY, { seed: true });
  },
  { passive: false }
);

canvas.addEventListener(
  'touchmove',
  (e) => {
    if (!touchDrawing || !e.touches.length) return;
    e.preventDefault();
    const t = e.touches[0];
    updatePointer(t.clientX, t.clientY);
  },
  { passive: false }
);

canvas.addEventListener(
  'touchend',
  () => {
    touchDrawing = false;
    isMoving = false;
    lastMoveTime = performance.now();
  },
  { passive: true }
);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, isCoarsePointer ? 1.75 : 2);

  renderer.setSize(w, h);
  renderer.setPixelRatio(dpr);
  displayMaterial.uniforms.uResolution.value.set(w, h);
  displayMaterial.uniforms.uDpr.value = dpr;
  trailsMaterial.uniforms.uResolution.value.set(w, h);
});

animate();
