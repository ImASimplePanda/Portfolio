/* Kage — the procedural night-temple world.
 *
 * Everything visible in WebGL is built at runtime: terrain, distant ridges, torii,
 * stairs, lanterns, the hall, the pagoda, the garden pond, trees, rain, drifting
 * leaves, embers, the moon, and a small hand-written post chain (bloom, depth haze,
 * grain, vignette). No models and no image textures — only Three.js and canvas.
 */

import * as THREE from '../vendor/three.module.min.js';

/* ---------------------------------------------------------------- palette */

export const PALETTE = {
  ink: 0x05070b,
  charcoal: 0x121821,
  stone: 0x2b3038,
  stoneDark: 0x1b2027,
  wood: 0x191410,
  tile: 0x0d1016,
  vermilion: 0xb8382b,
  amber: 0xffb066,
  bone: 0xe8e2d6,
  moonlight: 0x9db8e8,
  moss: 0x1b2a24,
};

/* ------------------------------------------------------------------ math */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const smoothRange = (a, b, x) => smooth(clamp((x - a) / (b - a), 0, 1));

/** Deterministic PRNG, so the mountain is the same mountain on every visit. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value noise + fbm: enough relief for terrain and enough jitter for scatter. */
function makeNoise(seed) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i += 1) perm[i] = i;
  for (let i = 255; i > 0; i -= 1) {
    const j = (rand() * (i + 1)) | 0;
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < 256; i += 1) perm[i + 256] = perm[i];

  const grad = (h, x, y) => ((h & 1) === 1 ? -x : x) * 0.7071 + ((h & 2) === 2 ? -y : y) * 0.7071;

  const noise2 = (x, y) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = smooth(xf);
    const v = smooth(yf);
    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v);
  };

  const fbm = (x, y, octaves) => {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < (octaves || 4); i += 1) {
      sum += noise2(x * freq, y * freq) * amp;
      freq *= 2.03;
      amp *= 0.5;
    }
    return sum;
  };

  return { rand, fbm };
}

/* -------------------------------------------------------- canvas textures */

function canvasTexture(size, draw, { flipY = true } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = flipY;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft radial falloff used for lantern glow, ember sprites and the moon halo. */
const glowTexture = () =>
  canvasTexture(128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,226,178,0.72)');
    g.addColorStop(0.45, 'rgba(255,168,92,0.22)');
    g.addColorStop(1, 'rgba(255,140,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

/** A five-lobed maple leaf, used as the alpha of the drifting instanced quads. */
const leafTexture = () =>
  canvasTexture(128, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    ctx.translate(s / 2, s / 2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i - 2) * 0.62;
      const len = i === 2 ? s * 0.46 : s * (0.4 - Math.abs(i - 2) * 0.07);
      const wide = 0.26 - Math.abs(i - 2) * 0.04;
      ctx.moveTo(0, s * 0.08);
      ctx.quadraticCurveTo(
        Math.cos(a - wide) * len * 0.6,
        Math.sin(a - wide) * len * 0.6,
        Math.cos(a) * len,
        Math.sin(a) * len,
      );
      ctx.quadraticCurveTo(
        Math.cos(a + wide) * len * 0.6,
        Math.sin(a + wide) * len * 0.6,
        0,
        s * 0.08,
      );
    }
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.08);
    ctx.lineTo(0, s * 0.3);
    ctx.stroke();
  });

/** Vermilion moon disc: hard-ish limb, faint maria, no ring artefacts. */
const moonTexture = () =>
  canvasTexture(512, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    const r = s * 0.42;
    const g = ctx.createRadialGradient(s * 0.44, s * 0.42, r * 0.1, s / 2, s / 2, r);
    g.addColorStop(0, '#ffd7b4');
    g.addColorStop(0.42, '#f68a5c');
    g.addColorStop(0.82, '#d1462c');
    g.addColorStop(0.97, '#a32d1c');
    g.addColorStop(1, 'rgba(150,40,25,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'multiply';
    const rand = mulberry32(97);
    for (let i = 0; i < 26; i += 1) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * r * 0.82;
      const rr = r * (0.05 + rand() * 0.17);
      const m = ctx.createRadialGradient(
        s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, 0,
        s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, rr,
      );
      m.addColorStop(0, 'rgba(196,120,96,1)');
      m.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.fillStyle = m;
      ctx.beginPath();
      ctx.arc(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/* --------------------------------------------------------------- terrain */

const PATH_TOP = 11;

/** Height of the walked route at a given depth: valley, stair climb, terrace. */
function pathHeight(z) {
  if (z > 36) return 0;
  if (z > 4) return PATH_TOP * smooth((36 - z) / 32);
  if (z > -40) return PATH_TOP;
  return PATH_TOP + (z + 40) * 0.5;
}

/* ---------------------------------------------------------------- pieces */

/** A curved-eave gable roof, lofted as two slope surfaces plus a ridge beam. */
function gableRoof({ width, depth, rise, flare = 0.6, overhang = 1.6, material }) {
  const cols = 20;
  const rows = 10;
  const group = new THREE.Group();
  const halfW = width / 2 + overhang;
  const halfD = depth / 2 + overhang;

  for (const side of [1, -1]) {
    const positions = [];
    const indices = [];
    for (let r = 0; r <= rows; r += 1) {
      const v = r / rows;
      const y = rise * (1 - Math.pow(v, 1.55)) + flare * Math.pow(v, 3.4);
      const z = side * v * halfD;
      for (let c = 0; c <= cols; c += 1) {
        const u = c / cols;
        const x = lerp(-halfW, halfW, u);
        const corner = Math.pow(Math.abs(u * 2 - 1), 3.2) * flare * 1.5 * Math.pow(v, 2.2);
        positions.push(x, y + corner, z);
      }
    }
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const a = r * (cols + 1) + c;
        const b = a + 1;
        const d = a + cols + 1;
        const e = d + 1;
        if (side > 0) indices.push(a, d, b, b, d, e);
        else indices.push(a, b, d, b, e, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(width + overhang * 2 + 0.5, 0.44, 0.8), material);
  ridge.position.y = rise + 0.18;
  ridge.castShadow = true;
  group.add(ridge);

  return group;
}

/** Torii gate: battered columns, curved kasagi, nuki, gakuzuka. */
function makeTorii({ height, span, material, base }) {
  const g = new THREE.Group();
  const r = height * 0.055;

  for (const side of [-1, 1]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r, height, 14), material);
    col.position.set((side * span) / 2, height / 2, 0);
    col.rotation.z = -side * 0.018;
    col.castShadow = true;
    g.add(col);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.5, r * 1.75, height * 0.07, 12), base);
    foot.position.set((side * span) / 2, height * 0.035, 0);
    foot.receiveShadow = true;
    g.add(foot);
  }

  const nuki = new THREE.Mesh(new THREE.BoxGeometry(span + r * 3.4, r * 1.1, r * 1.5), material);
  nuki.position.y = height * 0.78;
  nuki.castShadow = true;
  g.add(nuki);

  const arc = new THREE.Group();
  const segs = 15;
  const kw = span + r * 7;
  for (let i = 0; i < segs; i += 1) {
    const t = i / (segs - 1) - 0.5;
    const piece = new THREE.Mesh(new THREE.BoxGeometry(kw / segs + 0.06, r * 1.4, r * 2.7), material);
    piece.position.set(t * kw, Math.pow(Math.abs(t) * 2, 2.1) * height * 0.04, 0);
    piece.rotation.z = -Math.sign(t) * Math.pow(Math.abs(t), 1.2) * 0.22;
    piece.castShadow = true;
    arc.add(piece);
  }
  arc.position.y = height * 0.955;
  g.add(arc);

  const shimaki = new THREE.Mesh(new THREE.BoxGeometry(span + r * 5, r * 0.85, r * 1.95), material);
  shimaki.position.y = height * 0.9;
  g.add(shimaki);

  const gaku = new THREE.Mesh(new THREE.BoxGeometry(r * 1.5, height * 0.11, r * 0.8), material);
  gaku.position.y = height * 0.845;
  g.add(gaku);

  return g;
}

/** Stone lantern (ishidoro), with the fire box left hollow for its own light. */
function makeLantern(mats, s) {
  const g = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.44 * s, 0.56 * s, 0.3 * s, 8), mats.stoneDark);
  base.position.y = 0.15 * s;
  base.receiveShadow = true;
  g.add(base);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.19 * s, 1.16 * s, 8), mats.stone);
  post.position.y = 0.86 * s;
  post.castShadow = true;
  g.add(post);

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.46 * s, 0.3 * s, 0.14 * s, 8), mats.stone);
  plate.position.y = 1.5 * s;
  g.add(plate);

  const box = new THREE.Mesh(new THREE.CylinderGeometry(0.38 * s, 0.4 * s, 0.52 * s, 8, 1, true), mats.stone);
  box.position.y = 1.8 * s;
  box.castShadow = true;
  g.add(box);

  const fire = new THREE.Mesh(
    new THREE.SphereGeometry(0.23 * s, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffc078, toneMapped: true }),
  );
  fire.position.y = 1.8 * s;
  g.add(fire);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.66 * s, 0.38 * s, 8), mats.stoneDark);
  roof.position.y = 2.24 * s;
  roof.castShadow = true;
  g.add(roof);

  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 8, 6), mats.stoneDark);
  finial.position.y = 2.46 * s;
  g.add(finial);

  return { group: g, fire, flameY: 1.8 * s };
}

/* ------------------------------------------------------------ post chain */

function makePass(fragmentShader, uniforms) {
  return new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: `
      in vec3 position;
      in vec2 uv;
      out vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `precision highp float;\nprecision highp sampler2D;\nin vec2 vUv;\nout vec4 outColor;\n${fragmentShader}`,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
}

const BRIGHT_FRAG = `
  uniform sampler2D tDiffuse;
  uniform float uThreshold;
  uniform float uKnee;
  void main() {
    vec3 c = texture(tDiffuse, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float soft = clamp((l - uThreshold + uKnee) / (2.0 * uKnee), 0.0, 1.0);
    float w = max(l - uThreshold, soft * soft * uKnee) / max(l, 1e-4);
    outColor = vec4(c * w, 1.0);
  }
`;

const BLUR_FRAG = `
  uniform sampler2D tDiffuse;
  uniform vec2 uDirection;
  void main() {
    vec3 sum = texture(tDiffuse, vUv).rgb * 0.2270270270;
    sum += texture(tDiffuse, vUv + uDirection * 1.3846153846).rgb * 0.3162162162;
    sum += texture(tDiffuse, vUv - uDirection * 1.3846153846).rgb * 0.3162162162;
    sum += texture(tDiffuse, vUv + uDirection * 3.2307692308).rgb * 0.0702702703;
    sum += texture(tDiffuse, vUv - uDirection * 3.2307692308).rgb * 0.0702702703;
    outColor = vec4(sum, 1.0);
  }
`;

const COMPOSITE_FRAG = `
  uniform sampler2D tScene;
  uniform sampler2D tBloomNear;
  uniform sampler2D tBloomFar;
  uniform sampler2D tDepth;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uBloom;
  uniform float uGrain;
  uniform float uVignette;
  uniform float uHaze;
  uniform float uNear;
  uniform float uFar;
  uniform vec3 uHazeColor;
  uniform float uFade;

  float viewDepth(vec2 uv) {
    float d = texture(tDepth, uv).x;
    float z = d * 2.0 - 1.0;
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);

    // a whisper of lateral chromatic separation, only out at the corners
    float ca = 0.0016 * r2;
    vec3 col;
    col.r = texture(tScene, uv + centered * ca).r;
    col.g = texture(tScene, uv).g;
    col.b = texture(tScene, uv - centered * ca).b;

    vec3 bloom = texture(tBloomNear, uv).rgb * 0.62 + texture(tBloomFar, uv).rgb * 0.38;
    col += bloom * uBloom;

    // depth haze: distance lifts the blacks toward blue-charcoal
    float dz = viewDepth(uv);
    float haze = 1.0 - exp(-max(dz - 18.0, 0.0) * 0.0042);
    col = mix(col, uHazeColor, clamp(haze, 0.0, 1.0) * uHaze);

    // grade: cool the shadows, keep the warms warm
    float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(col, vec3(0.052, 0.070, 0.104) + col * 0.86, smoothstep(0.34, 0.0, l) * 0.55);
    col *= vec3(1.015, 0.994, 0.985);

    col *= 1.0 - smoothstep(0.16, 0.86, r2) * uVignette;

    float g = hash(uv * uResolution + fract(uTime) * 977.0) - 0.5;
    col += g * uGrain * (1.0 - smoothstep(0.0, 0.8, l) * 0.55);

    col *= uFade;
    outColor = vec4(max(col, 0.0), 1.0);
  }
`;

/* ------------------------------------------------------------ the camera */

/** One composed shot per page section, in order. */
export const SHOTS = [
  { pos: [2, 3.2, 104], look: [-2, 12, 30], fov: 52, drift: [-3, 0.6, -8] },
  { pos: [2.6, 1.9, 56], look: [-0.8, 9, 26], fov: 38, drift: [-3, 0.8, -7] },
  { pos: [-12, 13.4, 22], look: [-27, 10.9, 2], fov: 40, drift: [-2.2, -0.6, -4.5] },
  { pos: [16, 13, 16], look: [-4, 13.8, -12], fov: 44, drift: [-5, 0.4, -4.5] },
  { pos: [-6.5, 13.4, -6], look: [2.5, 14.8, -17], fov: 34, drift: [3.6, 0.5, -3] },
  { pos: [26, 30, 16], look: [-28, 23, -66], fov: 48, drift: [-3.4, 1.2, -5] },
  { pos: [66, 40, 66], look: [-14, 15, -26], fov: 44, drift: [-7, 2, -9] },
];

/* ------------------------------------------------------------ the world  */

export function createWorld({ canvas, quality = 'high', reducedMotion = false }) {
  const low = quality === 'low';
  const noise = makeNoise(20260819);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: quality === 'capture',
  });
  renderer.setClearColor(0x04060a, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060a);
  scene.fog = new THREE.FogExp2(0x0a1018, 0.0062);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 900);

  /* ---- sky ------------------------------------------------------------ */

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(620, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x03050a) },
        uMid: { value: new THREE.Color(0x0d1523) },
        uHorizon: { value: new THREE.Color(0x1d2334) },
        uGlow: { value: new THREE.Color(0x3c2a2c) },
        uMoonDir: { value: new THREE.Vector3(-0.45, 0.32, -0.83) },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vDir;
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        uniform vec3 uGlow;
        uniform vec3 uMoonDir;
        void main() {
          float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 c = mix(uHorizon, uMid, smoothstep(0.46, 0.62, h));
          c = mix(c, uTop, smoothstep(0.6, 0.95, h));
          float m = max(dot(normalize(vDir), normalize(uMoonDir)), 0.0);
          c += uGlow * pow(m, 5.0) * 0.85;
          c += uGlow * pow(m, 32.0) * 0.7;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  sky.frustumCulled = false;
  scene.add(sky);

  /* ---- moon ----------------------------------------------------------- */

  const MOON_POS = new THREE.Vector3(-168, 118, -310);
  const moonGroup = new THREE.Group();
  moonGroup.position.copy(MOON_POS);
  scene.add(moonGroup);

  const moonDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(78, 78),
    new THREE.MeshBasicMaterial({
      map: moonTexture(),
      transparent: true,
      fog: false,
      depthWrite: false,
      toneMapped: true,
    }),
  );
  moonGroup.add(moonDisc);

  const moonHalo = new THREE.Mesh(
    new THREE.PlaneGeometry(230, 230),
    new THREE.MeshBasicMaterial({
      map: glowTexture(),
      color: 0xff7a4e,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      toneMapped: true,
    }),
  );
  moonHalo.position.z = -2;
  moonGroup.add(moonHalo);

  /* ---- light ---------------------------------------------------------- */

  scene.add(new THREE.HemisphereLight(0x2b3f60, 0x05080c, 0.8));
  scene.add(new THREE.AmbientLight(0x101828, 0.9));

  const moonLight = new THREE.DirectionalLight(0xa8c3ff, 2.5);
  moonLight.position.copy(MOON_POS).normalize().multiplyScalar(150);
  moonLight.target.position.set(0, 10, -6);
  scene.add(moonLight, moonLight.target);
  if (!low) {
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(2048, 2048);
    const sc = moonLight.shadow.camera;
    sc.left = -70;
    sc.right = 70;
    sc.top = 70;
    sc.bottom = -70;
    sc.near = 40;
    sc.far = 330;
    moonLight.shadow.bias = -0.0008;
    moonLight.shadow.normalBias = 0.05;
  }

  /* ---- materials ------------------------------------------------------ */

  const mats = {
    stone: new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.94, metalness: 0.02 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: PALETTE.stoneDark, roughness: 0.96 }),
    wood: new THREE.MeshStandardMaterial({ color: PALETTE.wood, roughness: 0.82, metalness: 0.04 }),
    tile: new THREE.MeshStandardMaterial({ color: PALETTE.tile, roughness: 0.55, metalness: 0.16 }),
    vermilion: new THREE.MeshStandardMaterial({ color: PALETTE.vermilion, roughness: 0.64, metalness: 0.04 }),
    pine: new THREE.MeshStandardMaterial({ color: 0x0c1714, roughness: 1 }),
    maple: new THREE.MeshStandardMaterial({ color: 0x2a1316, roughness: 1 }),
    ground: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, vertexColors: true }),
    shoji: new THREE.MeshBasicMaterial({ color: 0xcf8b4b }),
  };

  /* ---- terrain -------------------------------------------------------- */

  const terrainHeight = (x, z) => {
    const relief =
      noise.fbm(x * 0.0075, z * 0.0075, 5) * 46 +
      noise.fbm(x * 0.031, z * 0.031, 3) * 6.5 +
      Math.max(0, -z - 40) * 0.28;
    const valley = smoothRange(30, 120, z) * -9;
    const mountain = relief + valley + 6;

    // flatten the walked corridor, and cut a level plateau for the west garden
    const corridor = smoothRange(7.5, 26, Math.abs(x));
    const gardenEdge = Math.max(Math.abs(x + 24) / 17, Math.abs(z - 8) / 20);
    const garden = clamp(smoothRange(0, 1, 1 - gardenEdge) * 1.7, 0, 1);

    let y = lerp(pathHeight(z) - 0.4, mountain, corridor);
    y = lerp(y, PATH_TOP - 0.9, garden);
    return y;
  };

  const terrainGeo = new THREE.PlaneGeometry(540, 540, 168, 168);
  terrainGeo.rotateX(-Math.PI / 2);
  {
    const pos = terrainGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i) - 20;
      const y = terrainHeight(x, z);
      pos.setY(i, y);
      pos.setZ(i, z);
      const damp = clamp((y - 6) / 30, 0, 1);
      const mossy = clamp(1 - Math.abs(x) / 40, 0, 1) * (1 - damp);
      c.setRGB(
        lerp(0.045, 0.062, damp) + mossy * 0.012,
        lerp(0.058, 0.072, damp) + mossy * 0.03,
        lerp(0.082, 0.098, damp) + mossy * 0.012,
      );
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();
  }
  const terrain = new THREE.Mesh(terrainGeo, mats.ground);
  terrain.receiveShadow = !low;
  scene.add(terrain);

  /* ---- distant ridges ------------------------------------------------- */

  const ridgeColors = [0x141c2a, 0x0e1522, 0x090f19];
  ridgeColors.forEach((color, layer) => {
    const width = 1500;
    const segs = 110;
    const positions = [];
    const indices = [];
    const baseY = -120;
    for (let i = 0; i <= segs; i += 1) {
      const t = i / segs;
      const x = (t - 0.5) * width;
      const h =
        70 + layer * 26 +
        noise.fbm(t * 4.2 + layer * 11, layer * 3.7, 4) * (150 - layer * 22) +
        Math.sin(t * 9.1 + layer) * 12;
      positions.push(x, baseY, 0, x, h, 0);
    }
    for (let i = 0; i < segs; i += 1) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color, fog: false, depthWrite: false }),
    );
    mesh.position.set(-40, 0, -260 - layer * 105);
    mesh.renderOrder = -5 + layer;
    scene.add(mesh);
  });

  /* ---- approach, stairs, terrace -------------------------------------- */

  const built = new THREE.Group();
  scene.add(built);

  // gravel approach
  const approach = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 76), mats.stoneDark);
  approach.position.set(0, -0.2, 62);
  approach.receiveShadow = !low;
  built.add(approach);

  // the stair flight
  const STEPS = 30;
  const stepGeo = new THREE.BoxGeometry(1, 1, 1);
  const steps = new THREE.InstancedMesh(stepGeo, mats.stone, STEPS);
  steps.castShadow = !low;
  steps.receiveShadow = !low;
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < STEPS; i += 1) {
    const t = i / (STEPS - 1);
    const z = lerp(35, 5, t);
    const y = pathHeight(z);
    m4.compose(
      new THREE.Vector3(0, y - 0.55, z),
      new THREE.Quaternion(),
      new THREE.Vector3(13 - t * 1.4, 1.1 + y * 0.5, 30 / STEPS + 0.08),
    );
    steps.setMatrixAt(i, m4);
  }
  steps.instanceMatrix.needsUpdate = true;
  built.add(steps);

  // stair balustrades
  for (const side of [-1, 1]) {
    const rail = new THREE.InstancedMesh(stepGeo, mats.stoneDark, STEPS);
    rail.castShadow = !low;
    for (let i = 0; i < STEPS; i += 1) {
      const t = i / (STEPS - 1);
      const z = lerp(35, 5, t);
      const y = pathHeight(z);
      m4.compose(
        new THREE.Vector3(side * (6.6 - t * 0.7), y + 0.34, z),
        new THREE.Quaternion(),
        new THREE.Vector3(0.9, 1.5, 30 / STEPS + 0.08),
      );
      rail.setMatrixAt(i, m4);
    }
    rail.instanceMatrix.needsUpdate = true;
    built.add(rail);
  }

  // terrace slab
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(46, 1.1, 58), mats.stoneDark);
  terrace.position.set(9, PATH_TOP - 0.55, -18);
  terrace.receiveShadow = !low;
  built.add(terrace);

  /* ---- torii ---------------------------------------------------------- */

  const toriiSpecs = [
    { z: 78, h: 11.5, span: 9 },
    { z: 46, h: 9.4, span: 7.4 },
    { z: 22, h: 7.4, span: 5.8 },
  ];
  for (const spec of toriiSpecs) {
    const t = makeTorii({ height: spec.h, span: spec.span, material: mats.vermilion, base: mats.stoneDark });
    t.position.set(0, pathHeight(spec.z), spec.z);
    built.add(t);
  }

  /* ---- earthen walls -------------------------------------------------- */

  const wallSegment = (x, z, len, rot) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(len, 3.1, 0.9), mats.stoneDark);
    body.position.y = 1.55;
    body.castShadow = !low;
    body.receiveShadow = !low;
    g.add(body);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.5, 0.34, 1.7), mats.tile);
    cap.position.y = 3.25;
    cap.castShadow = !low;
    g.add(cap);
    const cap2 = new THREE.Mesh(new THREE.BoxGeometry(len + 0.5, 0.26, 1.2), mats.tile);
    cap2.position.y = 3.5;
    g.add(cap2);
    g.position.set(x, PATH_TOP, z);
    g.rotation.y = rot;
    return g;
  };
  built.add(wallSegment(-15, -34, 40, 0));
  built.add(wallSegment(20, -34, 26, 0));
  built.add(wallSegment(-30, -14, 40, Math.PI / 2));
  built.add(wallSegment(31, -12, 44, Math.PI / 2));

  /* ---- the hall ------------------------------------------------------- */

  const hall = new THREE.Group();
  hall.position.set(0, PATH_TOP, -20);
  built.add(hall);

  const podium = new THREE.Mesh(new THREE.BoxGeometry(30, 1.7, 21), mats.stone);
  podium.position.y = 0.85;
  podium.castShadow = !low;
  podium.receiveShadow = !low;
  hall.add(podium);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(28, 0.45, 19), mats.wood);
  deck.position.y = 1.9;
  deck.receiveShadow = !low;
  hall.add(deck);

  for (let i = 0; i < 4; i += 1) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(11, 0.42, 0.95), mats.stone);
    st.position.set(0, 0.2 + i * 0.42, 10.9 + i * 0.95);
    st.receiveShadow = !low;
    hall.add(st);
  }

  const COLS = [-11.4, -7.6, -3.8, 0, 3.8, 7.6, 11.4];
  for (const cx of COLS) {
    for (const cz of [8.4, -8.4]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 5.4, 12), mats.wood);
      col.position.set(cx, 4.8, cz);
      col.castShadow = !low;
      hall.add(col);
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.3, 12), mats.stone);
      plinth.position.set(cx, 2.25, cz);
      hall.add(plinth);
    }
  }

  // lit shoji screens, recessed behind the veranda
  const shoji = new THREE.Mesh(new THREE.PlaneGeometry(21.5, 4.4), mats.shoji);
  shoji.position.set(0, 4.4, 4.4);
  hall.add(shoji);
  const shojiBack = new THREE.Mesh(new THREE.BoxGeometry(23, 5.4, 0.4), mats.wood);
  shojiBack.position.set(0, 4.9, 3.8);
  hall.add(shojiBack);
  for (let i = -5; i <= 5; i += 1) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.6, 0.16), mats.wood);
    mullion.position.set(i * 1.96, 4.4, 4.5);
    hall.add(mullion);
  }
  for (let i = 0; i < 4; i += 1) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(21.5, 0.11, 0.16), mats.wood);
    rail.position.set(0, 2.7 + i * 1.12, 4.5);
    hall.add(rail);
  }

  const beam = new THREE.Mesh(new THREE.BoxGeometry(29, 0.8, 0.9), mats.wood);
  beam.position.set(0, 7.9, 8.4);
  beam.castShadow = !low;
  hall.add(beam);
  const beamB = beam.clone();
  beamB.position.z = -8.4;
  hall.add(beamB);

  const lowerRoof = gableRoof({ width: 30, depth: 21, rise: 2.6, flare: 0.9, overhang: 2.6, material: mats.tile });
  lowerRoof.position.y = 8.2;
  hall.add(lowerRoof);

  const mainRoof = gableRoof({ width: 25, depth: 17, rise: 6.6, flare: 1.1, overhang: 2.9, material: mats.tile });
  mainRoof.position.y = 10.6;
  hall.add(mainRoof);

  for (const side of [-1, 1]) {
    const gableEnd = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.6, 12), mats.wood);
    gableEnd.position.set(side * 12.4, 11.4, 0);
    hall.add(gableEnd);
  }

  /* ---- pagoda --------------------------------------------------------- */

  const pagoda = new THREE.Group();
  pagoda.position.set(24, PATH_TOP, -2);
  built.add(pagoda);
  {
    const pBase = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 10), mats.stone);
    pBase.position.y = 0.6;
    pBase.receiveShadow = !low;
    pagoda.add(pBase);
    for (let tier = 0; tier < 3; tier += 1) {
      const w = 7.4 - tier * 1.5;
      const y = 1.2 + tier * 4.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, 3.3, w), mats.wood);
      body.position.y = y + 1.65;
      body.castShadow = !low;
      pagoda.add(body);
      const roof = gableRoof({ width: w + 1.4, depth: w + 1.4, rise: 1.5, flare: 0.85, overhang: 2.1, material: mats.tile });
      roof.position.y = y + 3.3;
      pagoda.add(roof);
    }
    const sorin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 5, 8), mats.tile);
    sorin.position.y = 17.4;
    pagoda.add(sorin);
    for (let i = 0; i < 5; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 - i * 0.06, 0.06, 6, 14), mats.tile);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 15.6 + i * 0.62;
      pagoda.add(ring);
    }
  }

  /* ---- garden pond ---------------------------------------------------- */

  // the pond opts into scene fog, so three's fog uniforms have to travel with it
  const pondUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uToCam: { value: new THREE.Vector2(0, 1) },
      uMoonColor: { value: new THREE.Color(0xff8a5c) },
    },
  ]);
  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(11, 64),
    new THREE.ShaderMaterial({
      uniforms: pondUniforms,
      transparent: true,
      fog: true,
      vertexShader: `
        #include <fog_pars_vertex>
        varying vec2 vP;
        void main() {
          vP = position.xy;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        uniform float uTime;
        uniform vec2 uToCam;
        uniform vec3 uMoonColor;
        varying vec2 vP;
        void main() {
          float edge = smoothstep(11.0, 8.2, length(vP));
          vec3 water = vec3(0.014, 0.022, 0.036);

          // the moon, smeared by the ripple into a column running to the viewer
          vec2 axis = normalize(uToCam);
          float along = dot(vP, axis);
          float perp = dot(vP, vec2(-axis.y, axis.x));
          float ripple = sin(along * 2.1 + uTime * 0.55) * 0.5 + 0.5;
          ripple *= sin(along * 5.3 - uTime * 0.9) * 0.5 + 0.5;
          float column = exp(-pow(perp * 0.34, 2.0)) * smoothstep(-11.0, 4.0, along);
          float glint = column * (0.22 + ripple * 0.9);
          water += uMoonColor * glint * 0.62;
          water += vec3(0.10, 0.13, 0.2) * pow(max(-along / 11.0, 0.0), 3.0) * 0.2;
          gl_FragColor = vec4(water, edge);
          #include <fog_fragment>
        }
      `,
    }),
  );
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(-25, PATH_TOP - 0.78, 7);
  built.add(pond);

  const pondRim = new THREE.Mesh(new THREE.TorusGeometry(11.3, 0.55, 6, 60), mats.stoneDark);
  pondRim.rotation.x = Math.PI / 2;
  pondRim.position.set(-25, PATH_TOP - 0.95, 7);
  pondRim.receiveShadow = !low;
  built.add(pondRim);

  // stepping stones and a water basin
  {
    const rand = mulberry32(41);
    for (let i = 0; i < 7; i += 1) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.85 + rand() * 0.3, 0.95, 0.4, 7), mats.stone);
      st.position.set(-16 + Math.sin(i * 1.1) * 2.4, PATH_TOP - 0.7, 16 - i * 2.6);
      st.rotation.y = rand() * 3;
      st.receiveShadow = !low;
      built.add(st);
    }
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.9, 10), mats.stone);
    basin.position.set(-14.5, PATH_TOP - 0.4, 2);
    basin.castShadow = !low;
    built.add(basin);
  }

  /* ---- lanterns ------------------------------------------------------- */

  const lanternPositions = [];
  for (let i = 0; i < 7; i += 1) {
    const z = 34 - i * 5;
    for (const side of [-1, 1]) lanternPositions.push([side * 8.2, pathHeight(z), z, 1]);
  }
  lanternPositions.push([-11, PATH_TOP, -2, 1.25], [11, PATH_TOP, -2, 1.25]);
  lanternPositions.push([-11, PATH_TOP, -12, 1.25], [11, PATH_TOP, -12, 1.25]);
  lanternPositions.push([-15.5, PATH_TOP, 12, 1.1], [-33, PATH_TOP, 2, 1.1], [-24, PATH_TOP, 20, 1.1]);
  lanternPositions.push([0, 0, 70, 1.4], [-9, 0, 54, 1.2], [9, 0, 54, 1.2]);

  const fireMeshes = [];
  const glowSprites = [];
  const glowMat = new THREE.SpriteMaterial({
    map: glowTexture(),
    color: 0xffa96a,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.5,
  });

  for (const [x, y, z, s] of lanternPositions) {
    const { group, fire, flameY } = makeLantern(mats, s);
    group.position.set(x, y, z);
    built.add(group);
    fireMeshes.push(fire);

    const sprite = new THREE.Sprite(glowMat.clone());
    sprite.position.set(x, y + flameY, z);
    sprite.scale.setScalar(4.1 * s);
    built.add(sprite);
    glowSprites.push(sprite);
  }

  // A handful of real warm lights where the camera actually lingers.
  const warmLights = [
    new THREE.PointLight(0xff9a52, 22, 24, 2),
    new THREE.PointLight(0xff9a52, 22, 24, 2),
    new THREE.PointLight(0xffb379, 40, 34, 2),
    new THREE.PointLight(0xff9450, 16, 22, 2),
  ];
  warmLights[0].position.set(-11, PATH_TOP + 2.2, -2);
  warmLights[1].position.set(11, PATH_TOP + 2.2, -2);
  warmLights[2].position.set(0, PATH_TOP + 4.4, -13.5);
  warmLights[3].position.set(-15.5, PATH_TOP + 2, 12);
  for (const l of warmLights) built.add(l);

  /* ---- trees ---------------------------------------------------------- */

  const pineCount = low ? 46 : 96;
  const mapleCount = low ? 18 : 34;
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.34, 1, 6);
  const tierGeo = new THREE.ConeGeometry(1, 1, 7);
  const canopyGeo = new THREE.IcosahedronGeometry(1, 0);

  const pineTrunks = new THREE.InstancedMesh(trunkGeo, mats.wood, pineCount);
  const pineTiers = new THREE.InstancedMesh(tierGeo, mats.pine, pineCount * 4);
  const mapleTrunks = new THREE.InstancedMesh(trunkGeo, mats.wood, mapleCount);
  const mapleCanopy = new THREE.InstancedMesh(canopyGeo, mats.maple, mapleCount * 3);
  for (const im of [pineTrunks, pineTiers, mapleTrunks, mapleCanopy]) {
    im.castShadow = !low;
    built.add(im);
  }

  {
    const rand = mulberry32(7717);
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    let pi = 0;
    let ti = 0;
    let mi = 0;
    let ci = 0;
    let guard = 0;
    while ((pi < pineCount || mi < mapleCount) && guard < 6000) {
      guard += 1;
      const x = (rand() - 0.5) * 300;
      const z = (rand() - 0.5) * 330 - 10;
      const inCorridor = Math.abs(x) < 17 && z < 44 && z > -46;
      const inGarden = Math.abs(x + 25) < 14 && Math.abs(z - 7) < 18;
      const inCourt = Math.abs(x) < 34 && z < 4 && z > -46;
      if (inCorridor || inCourt) continue;
      const y = terrainHeight(x, z);
      if (y < -8) continue;
      const wantMaple = inGarden || (rand() < 0.26 && Math.abs(x) < 70);

      if (wantMaple && mi < mapleCount) {
        const h = 3.4 + rand() * 2.6;
        m4.compose(v.set(x, y + h / 2, z), q.identity(), sc.set(0.7, h, 0.7));
        mapleTrunks.setMatrixAt(mi, m4);
        mi += 1;
        for (let k = 0; k < 3; k += 1) {
          const r = 1.7 + rand() * 1.5;
          q.setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3));
          m4.compose(
            v.set(x + (rand() - 0.5) * 2.4, y + h + rand() * 1.6, z + (rand() - 0.5) * 2.4),
            q,
            sc.set(r, r * 0.7, r),
          );
          mapleCanopy.setMatrixAt(ci, m4);
          ci += 1;
        }
      } else if (pi < pineCount) {
        const h = 5 + rand() * 7;
        m4.compose(v.set(x, y + h * 0.34, z), q.identity(), sc.set(0.9, h * 0.7, 0.9));
        pineTrunks.setMatrixAt(pi, m4);
        pi += 1;
        for (let k = 0; k < 4; k += 1) {
          const t = k / 4;
          const r = lerp(2.9, 0.9, t) * (0.8 + rand() * 0.4);
          q.setFromEuler(new THREE.Euler(0, rand() * 3, 0));
          m4.compose(v.set(x, y + h * (0.34 + t * 0.62), z), q, sc.set(r, h * 0.34, r));
          pineTiers.setMatrixAt(ti, m4);
          ti += 1;
        }
      }
    }
    // park any unused instances far below the camera
    const hide = new THREE.Matrix4().makeTranslation(0, -9999, 0);
    for (let i = ti; i < pineCount * 4; i += 1) pineTiers.setMatrixAt(i, hide);
    for (let i = ci; i < mapleCount * 3; i += 1) mapleCanopy.setMatrixAt(i, hide);
    for (let i = pi; i < pineCount; i += 1) pineTrunks.setMatrixAt(i, hide);
    for (let i = mi; i < mapleCount; i += 1) mapleTrunks.setMatrixAt(i, hide);
    for (const im of [pineTrunks, pineTiers, mapleTrunks, mapleCanopy]) im.instanceMatrix.needsUpdate = true;
  }

  /* ---- rain ----------------------------------------------------------- */

  const RAIN = low ? 700 : 1700;
  const rainGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(RAIN * 6);
    const seed = new Float32Array(RAIN * 2);
    const rand = mulberry32(555);
    for (let i = 0; i < RAIN; i += 1) {
      const x = (rand() - 0.5) * 190;
      const y = rand() * 70;
      const z = (rand() - 0.5) * 230 + 10;
      const len = 0.4 + rand() * 0.75;
      pos.set([x, y, z, x + 0.16, y - len, z], i * 6);
      seed[i * 2] = rand();
      seed[i * 2 + 1] = rand();
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  }
  const rainUniforms = { uTime: { value: 0 }, uOpacity: { value: 0.13 } };
  const rain = new THREE.LineSegments(
    rainGeo,
    new THREE.ShaderMaterial({
      uniforms: rainUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime;
        attribute float aSeed;
        varying float vFade;
        void main() {
          vec3 p = position;
          float speed = 26.0 + aSeed * 22.0;
          p.y = mod(p.y - uTime * speed, 72.0);
          p.x += sin(uTime * 0.35 + aSeed * 6.28) * 1.4;
          vFade = smoothstep(0.0, 14.0, p.y) * smoothstep(72.0, 46.0, p.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying float vFade;
        void main() {
          gl_FragColor = vec4(vec3(0.55, 0.66, 0.9), vFade * uOpacity);
        }
      `,
    }),
  );
  rain.frustumCulled = false;
  scene.add(rain);

  /* ---- embers --------------------------------------------------------- */

  const EMBERS = low ? 120 : 300;
  const emberGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(EMBERS * 3);
    const seed = new Float32Array(EMBERS);
    const rand = mulberry32(1231);
    for (let i = 0; i < EMBERS; i += 1) {
      const src = lanternPositions[(rand() * lanternPositions.length) | 0];
      pos.set([src[0] + (rand() - 0.5) * 3, src[1] + 1.6, src[2] + (rand() - 0.5) * 3], i * 3);
      seed[i] = rand();
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    emberGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  }
  const emberUniforms = { uTime: { value: 0 }, uTex: { value: glowTexture() }, uScale: { value: 1 } };
  const embers = new THREE.Points(
    emberGeo,
    new THREE.ShaderMaterial({
      uniforms: emberUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        uniform float uTime;
        uniform float uScale;
        attribute float aSeed;
        varying float vFade;
        void main() {
          vec3 p = position;
          float life = fract(uTime * (0.045 + aSeed * 0.05) + aSeed);
          p.y += life * 9.0;
          p.x += sin(uTime * 0.5 + aSeed * 31.0) * (0.6 + life * 1.8);
          p.z += cos(uTime * 0.42 + aSeed * 17.0) * (0.5 + life * 1.4);
          vFade = sin(life * 3.14159) * (0.4 + aSeed * 0.6);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (28.0 + aSeed * 34.0) * uScale / max(-mv.z, 1.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTex;
        varying float vFade;
        void main() {
          vec4 t = texture2D(uTex, gl_PointCoord);
          gl_FragColor = vec4(vec3(1.0, 0.62, 0.3) * t.a, t.a * vFade * 0.7);
        }
      `,
    }),
  );
  embers.frustumCulled = false;
  scene.add(embers);

  /* ---- drifting leaves ------------------------------------------------ */

  const LEAVES = low ? 60 : 150;
  const leaves = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.4, 0.4),
    new THREE.MeshBasicMaterial({
      map: leafTexture(),
      color: 0x8a3a2c,
      transparent: true,
      alphaTest: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    LEAVES,
  );
  leaves.frustumCulled = false;
  scene.add(leaves);
  const leafState = [];
  {
    const rand = mulberry32(88);
    for (let i = 0; i < LEAVES; i += 1) {
      leafState.push({
        x: (rand() - 0.5) * 120,
        y: rand() * 34,
        z: (rand() - 0.5) * 160 + 10,
        fall: 0.7 + rand() * 1.1,
        swing: 0.7 + rand() * 1.9,
        phase: rand() * 100,
        spin: (rand() - 0.5) * 1.6,
        size: 0.7 + rand() * 1.5,
      });
    }
  }

  /* ---- post-processing ------------------------------------------------ */

  const rtOpts = { type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false };
  const rtScene = new THREE.WebGLRenderTarget(2, 2, rtOpts);
  rtScene.depthTexture = new THREE.DepthTexture(2, 2);
  rtScene.depthTexture.format = THREE.DepthFormat;
  rtScene.depthTexture.type = THREE.UnsignedIntType;

  const rtBrightA = new THREE.WebGLRenderTarget(2, 2, rtOpts);
  const rtBrightB = new THREE.WebGLRenderTarget(2, 2, rtOpts);
  const rtFarA = new THREE.WebGLRenderTarget(2, 2, rtOpts);
  const rtFarB = new THREE.WebGLRenderTarget(2, 2, rtOpts);
  for (const rt of [rtScene, rtBrightA, rtBrightB, rtFarA, rtFarB]) {
    rt.texture.minFilter = THREE.LinearFilter;
    rt.texture.magFilter = THREE.LinearFilter;
  }

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  const postScene = new THREE.Scene();
  postScene.add(quad);
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const brightMat = makePass(BRIGHT_FRAG, {
    tDiffuse: { value: rtScene.texture },
    uThreshold: { value: 0.62 },
    uKnee: { value: 0.28 },
  });
  const blurMat = makePass(BLUR_FRAG, {
    tDiffuse: { value: null },
    uDirection: { value: new THREE.Vector2() },
  });
  const compositeMat = makePass(COMPOSITE_FRAG, {
    tScene: { value: rtScene.texture },
    tBloomNear: { value: rtBrightB.texture },
    tBloomFar: { value: rtFarB.texture },
    tDepth: { value: rtScene.depthTexture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uBloom: { value: 0.5 },
    uGrain: { value: 0.052 },
    uVignette: { value: 0.62 },
    uHaze: { value: 0.34 },
    uHazeColor: { value: new THREE.Color(0x121b2a) },
    uNear: { value: camera.near },
    uFar: { value: camera.far },
    uFade: { value: 1 },
  });

  const runPass = (material, target) => {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(postScene, postCamera);
  };

  /* ---- camera path ---------------------------------------------------- */

  const posCurve = new THREE.CatmullRomCurve3(
    SHOTS.map((s) => new THREE.Vector3(...s.pos)), false, 'catmullrom', 0.35,
  );
  const lookCurve = new THREE.CatmullRomCurve3(
    SHOTS.map((s) => new THREE.Vector3(...s.look)), false, 'catmullrom', 0.35,
  );
  const lastShot = SHOTS.length - 1;

  const targetPos = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  const currentPos = new THREE.Vector3();
  const currentLook = new THREE.Vector3();
  const driftVec = new THREE.Vector3();
  let targetFov = SHOTS[0].fov;
  let currentFov = SHOTS[0].fov;
  let progress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let reduced = reducedMotion;
  let initialised = false;

  /** Resolve a fractional shot index into a camera position, target and fov. */
  function sampleShot(f) {
    const clamped = clamp(f, 0, lastShot);
    const u = clamped / lastShot;
    posCurve.getPoint(u, targetPos);
    lookCurve.getPoint(u, targetLook);

    const i = clamp(Math.floor(clamped), 0, lastShot);
    const j = clamp(i + 1, 0, lastShot);
    const t = clamped - i;
    targetFov = lerp(SHOTS[i].fov, SHOTS[j].fov, smooth(t));

    // each shot breathes a little on its own, then hands off
    const d0 = SHOTS[i].drift;
    const d1 = SHOTS[j].drift;
    const local = smooth(t);
    driftVec.set(
      lerp(d0[0] * t, d1[0] * (t - 1), local),
      lerp(d0[1] * t, d1[1] * (t - 1), local),
      lerp(d0[2] * t, d1[2] * (t - 1), local),
    );
    targetPos.add(driftVec);
  }

  /* ---- frame ---------------------------------------------------------- */

  const size = new THREE.Vector2(1, 1);
  let pixelRatio = 1;

  function setSize(width, height, dpr) {
    pixelRatio = dpr === undefined ? Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75) : dpr;
    size.set(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const w = Math.max(2, Math.floor(width * pixelRatio));
    const h = Math.max(2, Math.floor(height * pixelRatio));
    rtScene.setSize(w, h);
    rtBrightA.setSize(Math.max(2, w >> 1), Math.max(2, h >> 1));
    rtBrightB.setSize(Math.max(2, w >> 1), Math.max(2, h >> 1));
    rtFarA.setSize(Math.max(2, w >> 2), Math.max(2, h >> 2));
    rtFarB.setSize(Math.max(2, w >> 2), Math.max(2, h >> 2));
    compositeMat.uniforms.uResolution.value.set(w, h);
    emberUniforms.uScale.value = h / 900;
  }

  function setProgress(f) {
    progress = clamp(f, 0, lastShot);
  }

  function jumpTo(f) {
    setProgress(f);
    sampleShot(progress);
    currentPos.copy(targetPos);
    currentLook.copy(targetLook);
    currentFov = targetFov;
    initialised = true;
    applyCamera();
  }

  function applyCamera() {
    camera.position.copy(currentPos);
    camera.position.x += smoothPointerX * 1.25;
    camera.position.y += smoothPointerY * 0.7;
    camera.lookAt(currentLook);
    camera.fov = currentFov;
    camera.updateProjectionMatrix();
  }

  function setPointer(x, y) {
    pointerX = clamp(x, -1, 1);
    pointerY = clamp(y, -1, 1);
  }

  function setReducedMotion(value) {
    reduced = value;
    rainUniforms.uOpacity.value = value ? 0.07 : 0.13;
  }
  setReducedMotion(reduced);

  const timer = new THREE.Timer();
  const leafMatrix = new THREE.Matrix4();
  const leafQuat = new THREE.Quaternion();
  const leafEuler = new THREE.Euler();
  const leafPos = new THREE.Vector3();
  const leafScale = new THREE.Vector3();

  function render() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();

    sampleShot(progress);
    if (!initialised) {
      currentPos.copy(targetPos);
      currentLook.copy(targetLook);
      currentFov = targetFov;
      initialised = true;
    }
    const ease = 1 - Math.pow(0.0016, dt);
    currentPos.lerp(targetPos, ease);
    currentLook.lerp(targetLook, ease);
    currentFov = lerp(currentFov, targetFov, ease);

    const pEase = 1 - Math.pow(0.02, dt);
    smoothPointerX = lerp(smoothPointerX, reduced ? 0 : pointerX, pEase);
    smoothPointerY = lerp(smoothPointerY, reduced ? 0 : pointerY, pEase);
    applyCamera();

    sky.position.copy(camera.position);
    moonGroup.quaternion.copy(camera.quaternion);

    rainUniforms.uTime.value = t;
    emberUniforms.uTime.value = t;
    pondUniforms.uTime.value = t;
    // the pond is rotated -90deg about X, so its local +y runs along world -z
    pondUniforms.uToCam.value.set(
      camera.position.x - pond.position.x,
      -(camera.position.z - pond.position.z),
    ).normalize();
    compositeMat.uniforms.uTime.value = t;

    // lantern flames flicker on slightly different clocks
    for (let i = 0; i < fireMeshes.length; i += 1) {
      const f = 0.86 + Math.sin(t * (2.1 + i * 0.37) + i) * 0.09 + Math.sin(t * (5.3 + i * 0.11)) * 0.05;
      fireMeshes[i].scale.setScalar(f);
      glowSprites[i].material.opacity = 0.62 + f * 0.3;
    }
    warmLights[0].intensity = 22 + Math.sin(t * 2.3) * 2.4;
    warmLights[1].intensity = 22 + Math.sin(t * 1.9 + 2) * 2.4;
    warmLights[2].intensity = 40 + Math.sin(t * 1.1) * 2;

    const leafSpeed = reduced ? 0.25 : 1;
    for (let i = 0; i < LEAVES; i += 1) {
      const s = leafState[i];
      s.y -= s.fall * dt * 1.9 * leafSpeed;
      if (s.y < -2) s.y = 36;
      const sway = Math.sin(t * s.swing + s.phase);
      leafPos.set(s.x + sway * 2.2, s.y, s.z + Math.cos(t * s.swing * 0.7 + s.phase) * 1.6);
      leafEuler.set(t * s.spin * leafSpeed, sway * 1.9, t * s.spin * 0.6 * leafSpeed);
      leafQuat.setFromEuler(leafEuler);
      leafScale.setScalar(s.size);
      leafMatrix.compose(leafPos, leafQuat, leafScale);
      leaves.setMatrixAt(i, leafMatrix);
    }
    leaves.instanceMatrix.needsUpdate = true;

    // scene
    renderer.setRenderTarget(rtScene);
    renderer.clear();
    renderer.render(scene, camera);

    // bloom: one tight pass, one wide pass
    brightMat.uniforms.tDiffuse.value = rtScene.texture;
    runPass(brightMat, rtBrightA);

    blurMat.uniforms.tDiffuse.value = rtBrightA.texture;
    blurMat.uniforms.uDirection.value.set(1 / rtBrightA.width, 0);
    runPass(blurMat, rtBrightB);
    blurMat.uniforms.tDiffuse.value = rtBrightB.texture;
    blurMat.uniforms.uDirection.value.set(0, 1 / rtBrightA.height);
    runPass(blurMat, rtBrightA);
    blurMat.uniforms.tDiffuse.value = rtBrightA.texture;
    blurMat.uniforms.uDirection.value.set(1.7 / rtBrightA.width, 0);
    runPass(blurMat, rtBrightB);

    blurMat.uniforms.tDiffuse.value = rtBrightB.texture;
    blurMat.uniforms.uDirection.value.set(1 / rtFarA.width, 0);
    runPass(blurMat, rtFarA);
    blurMat.uniforms.tDiffuse.value = rtFarA.texture;
    blurMat.uniforms.uDirection.value.set(0, 1 / rtFarA.height);
    runPass(blurMat, rtFarB);
    blurMat.uniforms.tDiffuse.value = rtFarB.texture;
    blurMat.uniforms.uDirection.value.set(2.4 / rtFarA.width, 0);
    runPass(blurMat, rtFarA);
    blurMat.uniforms.tDiffuse.value = rtFarA.texture;
    blurMat.uniforms.uDirection.value.set(0, 2.4 / rtFarA.height);
    runPass(blurMat, rtFarB);

    compositeMat.uniforms.uNear.value = camera.near;
    compositeMat.uniforms.uFar.value = camera.far;
    runPass(compositeMat, null);
  }

  function dispose() {
    renderer.dispose();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const m = obj.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else if (m) m.dispose();
    });
    for (const rt of [rtScene, rtBrightA, rtBrightB, rtFarA, rtFarB]) rt.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    shotCount: SHOTS.length,
    post: compositeMat.uniforms,
    setSize,
    setProgress,
    setPointer,
    setReducedMotion,
    jumpTo,
    render,
    dispose,
  };
}
