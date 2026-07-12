import * as THREE from 'three';
import {
  vertexShader,
  fluidFragmentShader,
  displayFragmentShader,
} from './shaders.js';
import './code-env.js';
import './about-anim.js';

const CONFIG = {
  // Simulation render-target size (square, ping-pong)
  simSize: 500,
  // Trail mask
  decay: 0.97,
  lineWidth: 0.09,
  perFrameIntensity: 0.3,
  // Reveal threshold (display shader)
  revealThreshold: 0.02,
  edgeWidthBase: 0.004, // divided by uDpr in shader
  // Soft gray halo overlay (display shader)
  haloUpperMul: 2.0, // halo upper bound = revealThreshold * this
  haloMixStrength: 0.35,
  haloGray: [0.12, 0.12, 0.12],
  // Idle auto-trail
  idleThresholdMs: 2500,
  idleEaseInMs: 1500,
  autoLerp: 0.05,
  // Mouse stop detection
  stopAfterMs: 50,
  // Max texture size
  maxTextureSize: 4096,
};

const canvas = document.querySelector('.hero canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  precision: 'highp',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const simScene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const rtOptions = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
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
    uDpr: { value: Math.min(window.devicePixelRatio, 2) },
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

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();

  if (isMoving && now - lastMoveTime > CONFIG.stopAfterMs) {
    isMoving = false;
  }

  const idleTime = now - lastMoveTime;
  const autoActive = idleTime > CONFIG.idleThresholdMs;

  const prevTarget = pingPong[currentTarget];
  currentTarget = (currentTarget + 1) % 2;
  const writeTarget = pingPong[currentTarget];

  trailsMaterial.uniforms.uPrevTrails.value = prevTarget.texture;

  if (autoActive) {
    const easeIn = Math.min(
      1,
      (idleTime - CONFIG.idleThresholdMs) / CONFIG.idleEaseInMs
    );

    const t = now * 0.001;
    const targetX =
      0.5 +
      0.3 * Math.sin(t * 0.41) +
      0.12 * Math.sin(t * 0.93 + 1.3);
    const targetY =
      0.5 +
      0.28 * Math.cos(t * 0.37 + 0.5) +
      0.1 * Math.cos(t * 1.11 + 2.7);

    prevAutoMouse.copy(autoMouse);
    autoMouse.x += (targetX - autoMouse.x) * CONFIG.autoLerp * easeIn;
    autoMouse.y += (targetY - autoMouse.y) * CONFIG.autoLerp * easeIn;

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

function updatePointer(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const inside =
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom;

  if (inside) {
    prevMouse.copy(mouse);
    mouse.x = (clientX - rect.left) / rect.width;
    mouse.y = 1 - (clientY - rect.top) / rect.height;
    isMoving = true;
    lastMoveTime = performance.now();
  } else {
    isMoving = false;
  }
}

window.addEventListener('mousemove', (e) => {
  updatePointer(e.clientX, e.clientY);
});

window.addEventListener(
  'touchmove',
  (e) => {
    if (!e.touches.length) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const inside =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;

    if (inside) {
      e.preventDefault();
    }
    updatePointer(touch.clientX, touch.clientY);
  },
  { passive: false }
);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio, 2);

  renderer.setSize(w, h);
  renderer.setPixelRatio(dpr);
  displayMaterial.uniforms.uResolution.value.set(w, h);
  displayMaterial.uniforms.uDpr.value = dpr;
  trailsMaterial.uniforms.uResolution.value.set(w, h);
});

animate();
