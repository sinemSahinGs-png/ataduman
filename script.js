import * as THREE from 'three';
import {
  vertexShader,
  fluidFragmentShader,
  displayFragmentShader,
} from './shaders.js';
import './code-env.js';
import './about-anim.js';
import './cta-anim.js';

const isCoarsePointer =
  window.matchMedia('(pointer: coarse)').matches ||
  window.matchMedia('(hover: none)').matches;

const CONFIG = {
  // Simulation render-target size (square, ping-pong)
  simSize: isCoarsePointer ? 320 : 500,
  // Trail mask — manual stroke
  decay: 0.97,
  lineWidth: isCoarsePointer ? 0.11 : 0.09,
  perFrameIntensity: isCoarsePointer ? 0.38 : 0.3,
  // Subtle idle wander (thin, local — not a full-screen wipe)
  autoLineWidth: 0.05,
  autoIntensity: 0.18,
  // Reveal threshold (display shader)
  revealThreshold: 0.02,
  edgeWidthBase: 0.004, // divided by uDpr in shader
  // Soft gray halo overlay (display shader)
  haloUpperMul: 2.0, // halo upper bound = revealThreshold * this
  haloMixStrength: 0.35,
  haloGray: [0.12, 0.12, 0.12],
  // Idle auto-trail on all devices — gentle meander when idle
  enableAutoTrail: true,
  idleThresholdMs: isCoarsePointer ? 900 : 2200,
  idleEaseInMs: isCoarsePointer ? 700 : 1400,
  autoLerp: 0.035,
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
let touchGesture = null; // 'draw' | 'scroll' | null
let touchStartX = 0;
let touchStartY = 0;

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
  // Small local meander — like a quiet cursor, not a wipe across the frame
  return {
    x: 0.54 + 0.13 * Math.sin(t * 0.33) + 0.05 * Math.sin(t * 0.77 + 1.2),
    y: 0.5 + 0.11 * Math.cos(t * 0.27 + 0.35) + 0.045 * Math.cos(t * 0.91 + 2.1),
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
    touchGesture !== 'draw' &&
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

    trailsMaterial.uniforms.uLineWidth.value = CONFIG.autoLineWidth;
    trailsMaterial.uniforms.uIntensity.value = CONFIG.autoIntensity;
    trailsMaterial.uniforms.uMouse.value.copy(autoMouse);
    trailsMaterial.uniforms.uPrevMouse.value.copy(prevAutoMouse);
    trailsMaterial.uniforms.uIsMoving.value = true;

    mouse.copy(autoMouse);
    prevMouse.copy(prevAutoMouse);
  } else {
    trailsMaterial.uniforms.uLineWidth.value = CONFIG.lineWidth;
    trailsMaterial.uniforms.uIntensity.value = CONFIG.perFrameIntensity;
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

function classifyTouchGesture(clientX, clientY) {
  if (touchGesture) return touchGesture;
  const dx = clientX - touchStartX;
  const dy = clientY - touchStartY;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 8 && ay < 8) return null;
  // Mostly vertical → page scroll; otherwise paint the reveal
  touchGesture = ay > ax * 1.15 ? 'scroll' : 'draw';
  return touchGesture;
}

function beginTouch(clientX, clientY) {
  touchStartX = clientX;
  touchStartY = clientY;
  touchGesture = null;
  touchDrawing = false;
}

function moveTouch(e, clientX, clientY) {
  const mode = classifyTouchGesture(clientX, clientY);
  if (mode === 'scroll') {
    touchDrawing = false;
    isMoving = false;
    return;
  }
  if (mode === 'draw') {
    e.preventDefault();
    if (!touchDrawing) {
      touchDrawing = true;
      updatePointer(clientX, clientY, { seed: true });
    } else {
      updatePointer(clientX, clientY);
    }
  }
}

function endTouch() {
  // Short tap (no scroll/draw lock) still reveals a small spot
  if (!touchGesture) {
    updatePointer(touchStartX, touchStartY, { seed: true });
  }
  touchDrawing = false;
  touchGesture = null;
  isMoving = false;
  lastMoveTime = performance.now();
}

canvas.addEventListener(
  'pointerdown',
  (e) => {
    if (e.pointerType === 'mouse') return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    beginTouch(e.clientX, e.clientY);
  },
  { passive: true }
);

canvas.addEventListener(
  'pointermove',
  (e) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    if (touchGesture === 'scroll') return;
    moveTouch(e, e.clientX, e.clientY);
  },
  { passive: false }
);

canvas.addEventListener('pointerup', endTouch, { passive: true });
canvas.addEventListener('pointercancel', endTouch, { passive: true });

canvas.addEventListener(
  'touchstart',
  (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    beginTouch(t.clientX, t.clientY);
  },
  { passive: true }
);

canvas.addEventListener(
  'touchmove',
  (e) => {
    if (!e.touches.length) return;
    if (touchGesture === 'scroll') return;
    const t = e.touches[0];
    moveTouch(e, t.clientX, t.clientY);
  },
  { passive: false }
);

canvas.addEventListener('touchend', endTouch, { passive: true });
canvas.addEventListener('touchcancel', endTouch, { passive: true });

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
