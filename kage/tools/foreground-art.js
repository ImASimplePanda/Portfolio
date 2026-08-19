/* Procedural artwork for the foreground cutout layers.
 *
 * Each drawer paints one element into a transparent canvas as a near-black
 * silhouette carrying a cold moon rim on its upper-left edge — the same light the
 * WebGL scene uses — so the HTML layers and the 3D world read as one picture.
 * Run through tools/gen-foreground.html; output lands in assets/foreground/ as
 * alpha-preserving WebP. Nothing in this file ships with the site.
 */

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Moon rim: bright where the light lands, gone before it reaches the ground. */
function rimFill(ctx, top, bottom, strength) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, `rgba(158,192,238,${strength})`);
  g.addColorStop(0.4, `rgba(112,148,202,${strength * 0.45})`);
  g.addColorStop(1, 'rgba(80,110,160,0)');
  return g;
}

/** Body: barely-there relief so a silhouette does not read as a paper cut-out. */
function bodyFill(ctx, top, bottom, light = '#131b26', dark = '#03050a') {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, light);
  g.addColorStop(0.62, '#080d15');
  g.addColorStop(1, dark);
  return g;
}

/** Paint a shape twice: an offset rim pass, then the body over it. */
function rimmed(ctx, path, { body, rim, dx = -3, dy = -4 }) {
  if (rim) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = rim;
    path(ctx);
    ctx.restore();
  }
  ctx.save();
  ctx.fillStyle = body;
  path(ctx);
  ctx.restore();
}

/** A soft shadow across the unlit flank, clipped to the shape it belongs to. */
function flank(ctx, path, left, right, strength = 0.6) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0)';
  path(ctx);
  ctx.clip();
  const g = ctx.createLinearGradient(left, 0, right, 0);
  g.addColorStop(0, 'rgba(2,4,8,0)');
  g.addColorStop(0.55, `rgba(2,4,8,${strength * 0.55})`);
  g.addColorStop(1, `rgba(2,4,8,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(Math.min(left, right) - 40, -4000, Math.abs(right - left) + 8000, 8000);
  ctx.restore();
}

/** An irregular closed blob, smoothed through midpoints. */
function blobPath(rand, cx, cy, rx, ry, wobble, roughness = 0.16, n = 18) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * TAU;
    const k = 1 + Math.sin(a * 3 + wobble) * roughness * 0.7 + (rand() - 0.5) * roughness;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return (ctx) => {
    ctx.beginPath();
    const mid = (i) => [
      (pts[i % n][0] + pts[(i + 1) % n][0]) / 2,
      (pts[i % n][1] + pts[(i + 1) % n][1]) / 2,
    ];
    ctx.moveTo(...mid(n - 1));
    for (let i = 0; i < n; i += 1) {
      const p = pts[i];
      ctx.quadraticCurveTo(p[0], p[1], ...mid(i));
    }
    ctx.closePath();
    ctx.fill();
  };
}

/* ------------------------------------------------------------------ grass */

function blade(ctx, x, y, height, bend, width) {
  const tipX = x + bend;
  const tipY = y - height;
  const cx = x + bend * 0.32;
  const cy = y - height * 0.58;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.quadraticCurveTo(cx - width * 0.28, cy, tipX, tipY);
  ctx.quadraticCurveTo(cx + width * 0.34, cy + height * 0.04, x + width / 2, y);
  ctx.closePath();
  ctx.fill();
}

export function drawGrass(ctx, w, h, seed = 11) {
  const rand = mulberry32(seed);
  const layers = [
    { n: 320, hMin: 0.3, hMax: 0.54, color: '#0d1520', rimChance: 0.06, width: 5 },
    { n: 360, hMin: 0.42, hMax: 0.74, color: '#070c14', rimChance: 0.14, width: 7 },
    { n: 320, hMin: 0.58, hMax: 1.0, color: '#03050a', rimChance: 0.22, width: 9 },
  ];

  layers.forEach((layer, li) => {
    for (let i = 0; i < layer.n; i += 1) {
      const x = rand() * w;
      const clump = 0.62 + Math.abs(Math.sin(x * 0.0032 + li * 2.1)) * 0.55;
      const height = h * lerp(layer.hMin, layer.hMax, rand()) * clump;
      const bend = (rand() - 0.45) * height * 0.55;
      const width = layer.width * (0.6 + rand() * 0.9);
      const draw = (c) => blade(c, x, h + 6, height, bend, width);
      rimmed(ctx, draw, {
        body: layer.color,
        rim: rand() < layer.rimChance ? rimFill(ctx, h - height, h, 0.5) : null,
        dx: -2.5,
        dy: -3,
      });
    }
  });

  // susuki plumes standing clear of the mass
  for (let i = 0; i < 18; i += 1) {
    const x = rand() * w;
    const height = h * (0.86 + rand() * 0.3);
    const bend = (rand() - 0.5) * height * 0.5;
    ctx.strokeStyle = '#05070b';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(x, h + 6);
    ctx.quadraticCurveTo(x + bend * 0.4, h - height * 0.6, x + bend, h - height);
    ctx.stroke();
    for (let k = 0; k < 30; k += 1) {
      const t = k / 30;
      const px = x + bend * (0.72 + t * 0.3);
      const py = h - height * (0.74 + t * 0.3);
      const len = 18 * (1 - t) + 5;
      const a = -Math.PI / 2 + (rand() - 0.5) * 1.6;
      ctx.strokeStyle = rand() < 0.3 ? 'rgba(146,176,220,0.4)' : '#0a111a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len);
      ctx.stroke();
    }
  }
}

/* ------------------------------------------------------- branch structure */

function branchInto(ctx, rand, { x, y, angle, length, width, depth, tip }) {
  if (depth <= 0 || width < 1) return;
  const ex = x + Math.cos(angle) * length;
  const ey = y + Math.sin(angle) * length;
  const mx = x + Math.cos(angle - 0.26) * length * 0.55;
  const my = y + Math.sin(angle - 0.26) * length * 0.55;

  ctx.strokeStyle = '#04060a';
  ctx.lineCap = 'round';
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx, my, ex, ey);
  ctx.stroke();

  if (width > 4) {
    ctx.strokeStyle = `rgba(140,176,224,${Math.min(0.3, width * 0.014)})`;
    ctx.lineWidth = Math.max(1, width * 0.16);
    ctx.beginPath();
    ctx.moveTo(x - width * 0.3, y - width * 0.24);
    ctx.quadraticCurveTo(mx - width * 0.3, my - width * 0.24, ex, ey);
    ctx.stroke();
  }

  const kids = depth > 4 ? 2 : 2 + (rand() < 0.5 ? 1 : 0);
  for (let i = 0; i < kids; i += 1) {
    const spread = (rand() - 0.5) * 1.2 - (i === 0 ? 0.16 : -0.16);
    branchInto(ctx, rand, {
      x: ex,
      y: ey,
      angle: angle + spread * 0.72,
      length: length * (0.66 + rand() * 0.2),
      width: width * (0.6 + rand() * 0.13),
      depth: depth - 1,
      tip,
    });
  }

  if (depth <= 2 && tip) tip(ctx, rand, ex, ey);
}

/* ------------------------------------------------------------ maple bough */

function mapleLeafPath(ctx, size) {
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i - 2) * 0.66;
    const len = size * (i === 2 ? 1 : 0.86 - Math.abs(i - 2) * 0.14);
    const spread = 0.3 - Math.abs(i - 2) * 0.05;
    ctx.moveTo(0, size * 0.18);
    ctx.quadraticCurveTo(
      Math.cos(a - spread) * len * 0.55, Math.sin(a - spread) * len * 0.55,
      Math.cos(a) * len, Math.sin(a) * len,
    );
    ctx.quadraticCurveTo(
      Math.cos(a + spread) * len * 0.55, Math.sin(a + spread) * len * 0.55,
      0, size * 0.18,
    );
  }
  ctx.fill();
}

export function drawMapleBranch(ctx, w, h, seed = 23) {
  const rand = mulberry32(seed);

  const tip = (c, r, x, y) => {
    const count = 5 + ((r() * 6) | 0);
    for (let i = 0; i < count; i += 1) {
      const size = 22 + r() * 34;
      const lx = x + (r() - 0.5) * 76;
      const ly = y + (r() - 0.5) * 76;
      c.save();
      c.translate(lx, ly);
      c.rotate((r() - 0.5) * TAU);
      const roll = r();
      c.fillStyle = roll < 0.1 ? 'rgba(128,62,46,0.9)' : roll < 0.34 ? '#100a0c' : '#05070b';
      mapleLeafPath(c, size);
      if (roll < 0.16) {
        c.translate(-3, -4);
        c.fillStyle = 'rgba(150,96,78,0.3)';
        mapleLeafPath(c, size * 0.9);
      }
      c.restore();
    }
  };

  // three stems, so the canopy has a mass rather than a diagram of a tree
  branchInto(ctx, rand, { x: -30, y: h + 30, angle: -Math.PI / 2.7, length: h * 0.3, width: 44, depth: 7, tip });
  branchInto(ctx, rand, { x: w * 0.16, y: h + 30, angle: -Math.PI / 2.15, length: h * 0.25, width: 30, depth: 6, tip });
  branchInto(ctx, rand, { x: w * 0.4, y: h + 30, angle: -Math.PI / 1.95, length: h * 0.2, width: 19, depth: 6, tip });

  // a scatter of leaves already let go
  for (let i = 0; i < 26; i += 1) {
    ctx.save();
    ctx.translate(rand() * w, rand() * h * 0.8);
    ctx.rotate(rand() * TAU);
    ctx.fillStyle = rand() < 0.3 ? 'rgba(120,58,44,0.6)' : 'rgba(10,12,18,0.75)';
    mapleLeafPath(ctx, 10 + rand() * 16);
    ctx.restore();
  }
}

/* ----------------------------------------------------------- sakura bough */

export function drawSakuraBranch(ctx, w, h, seed = 37) {
  const rand = mulberry32(seed);

  const blossom = (c, x, y, size, bright) => {
    c.save();
    c.translate(x, y);
    c.rotate(rand() * TAU);
    const petal = bright ? 'rgba(198,182,178,0.62)' : 'rgba(52,40,44,0.9)';
    for (let p = 0; p < 5; p += 1) {
      c.save();
      c.rotate((p / 5) * TAU);
      c.fillStyle = petal;
      c.beginPath();
      c.ellipse(0, -size * 0.6, size * 0.34, size * 0.6, 0, 0, TAU);
      c.fill();
      c.restore();
    }
    c.fillStyle = bright ? 'rgba(226,206,182,0.7)' : '#0a0810';
    c.beginPath();
    c.arc(0, 0, size * 0.18, 0, TAU);
    c.fill();
    c.restore();
  };

  const tip = (c, r, x, y) => {
    const count = 4 + ((r() * 5) | 0);
    for (let i = 0; i < count; i += 1) {
      blossom(c, x + (r() - 0.5) * 66, y + (r() - 0.5) * 66, 9 + r() * 13, r() < 0.22);
    }
  };

  branchInto(ctx, rand, { x: w + 34, y: h + 26, angle: -Math.PI / 1.55, length: h * 0.27, width: 40, depth: 7, tip });
  branchInto(ctx, rand, { x: w * 0.86, y: h + 26, angle: -Math.PI / 1.78, length: h * 0.21, width: 24, depth: 6, tip });

  for (let i = 0; i < 40; i += 1) {
    ctx.save();
    ctx.translate(rand() * w, rand() * h * 0.9);
    ctx.rotate(rand() * TAU);
    ctx.fillStyle = rand() < 0.24 ? 'rgba(190,174,172,0.4)' : 'rgba(46,36,40,0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 3 + rand() * 4, 5 + rand() * 7, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------------------------------------------------------------- stones */

export function drawStones(ctx, w, h, seed = 53) {
  const rand = mulberry32(seed);
  const stones = [];
  for (let i = 0; i < 11; i += 1) {
    const rx = w * (0.075 + Math.pow(rand(), 1.6) * 0.13);
    const ry = rx * (0.52 + rand() * 0.46);
    stones.push({ cx: rand() * w, cy: h - ry * (0.05 + rand() * 0.55), rx, ry, wobble: rand() * TAU });
  }
  stones.sort((a, b) => a.cy - b.cy);

  for (const s of stones) {
    const top = s.cy - s.ry;
    const path = blobPath(rand, s.cx, s.cy, s.rx, s.ry, s.wobble, 0.13);
    rimmed(ctx, path, {
      body: bodyFill(ctx, top, s.cy + s.ry, '#28323f'),
      rim: rimFill(ctx, top, s.cy + s.ry * 0.5, 0.5),
      dx: -5,
      dy: -7,
    });
    flank(ctx, path, s.cx - s.rx, s.cx + s.rx, 0.7);
  }

  for (let i = 0; i < 1400; i += 1) {
    const x = rand() * w;
    const y = h - Math.pow(rand(), 2.4) * h * 0.4;
    ctx.fillStyle = rand() < 0.18 ? 'rgba(48,80,68,0.3)' : 'rgba(5,8,13,0.85)';
    ctx.fillRect(x, y, 1 + rand() * 3, 1 + rand() * 2);
  }
}

/* ------------------------------------------------------------------ wall */

export function drawWall(ctx, w, h, seed = 71) {
  const rand = mulberry32(seed);
  const wallW = w * 0.86;
  const topY = h * 0.26;
  const slopeAt = (x) => (x / wallW) * h * 0.05;
  const plinth = h * 0.74;

  // plaster body
  const g = ctx.createLinearGradient(0, topY, 0, h);
  g.addColorStop(0, '#1c2532');
  g.addColorStop(0.5, '#101823');
  g.addColorStop(1, '#05080d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-6, topY + 40);
  ctx.lineTo(wallW, topY + slopeAt(wallW) + 40);
  ctx.lineTo(wallW, h + 6);
  ctx.lineTo(-6, h + 6);
  ctx.closePath();
  ctx.fill();

  // weathering
  for (let i = 0; i < 320; i += 1) {
    const x = rand() * wallW;
    const y = topY + 40 + rand() * (plinth - topY - 40);
    ctx.fillStyle = rand() < 0.45 ? 'rgba(32,42,56,0.45)' : 'rgba(4,6,11,0.5)';
    ctx.fillRect(x, y, 1 + rand() * 4, 10 + rand() * 90);
  }

  // jogi-suji: the horizontal rank stripes an earthen temple wall carries
  for (let i = 0; i < 4; i += 1) {
    const y = topY + 96 + i * 34;
    ctx.strokeStyle = `rgba(178,196,222,${0.17 - i * 0.03})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-6, y);
    ctx.lineTo(wallW, y + slopeAt(wallW));
    ctx.stroke();
  }

  // stone plinth
  ctx.fillStyle = '#070c13';
  ctx.beginPath();
  ctx.moveTo(-6, plinth);
  ctx.lineTo(wallW, plinth + slopeAt(wallW));
  ctx.lineTo(wallW, h + 6);
  ctx.lineTo(-6, h + 6);
  ctx.closePath();
  ctx.fill();
  for (let x = -20; x < wallW; x += 54 + rand() * 34) {
    ctx.strokeStyle = 'rgba(2,4,7,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, plinth + slopeAt(x));
    ctx.lineTo(x + (rand() - 0.5) * 14, h);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(150,182,228,0.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, plinth);
  ctx.lineTo(wallW, plinth + slopeAt(wallW));
  ctx.stroke();

  // tiled coping
  const tileW = 62;
  ctx.fillStyle = '#080d14';
  ctx.beginPath();
  ctx.moveTo(-6, topY + 34);
  ctx.lineTo(wallW + 10, topY + slopeAt(wallW) + 34);
  ctx.lineTo(wallW + 10, topY + slopeAt(wallW) + 58);
  ctx.lineTo(-6, topY + 58);
  ctx.closePath();
  ctx.fill();

  for (let x = -tileW; x < wallW + tileW; x += tileW) {
    const y = topY + slopeAt(x);
    ctx.fillStyle = '#0b111a';
    ctx.beginPath();
    ctx.moveTo(x, y + 38);
    ctx.quadraticCurveTo(x + tileW * 0.5, y - 26, x + tileW, y + 38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,186,234,0.22)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 34);
    ctx.quadraticCurveTo(x + tileW * 0.5, y - 22, x + tileW - 4, y + 34);
    ctx.stroke();
  }

  // the wall ends on a post
  ctx.fillStyle = '#04060a';
  ctx.fillRect(wallW - 4, topY + 10, 30, h);
  ctx.fillStyle = 'rgba(150,182,228,0.16)';
  ctx.fillRect(wallW - 4, topY + 10, 5, h);
}

/* ----------------------------------------------------------------- ruins */

export function drawRuins(ctx, w, h, seed = 89) {
  const rand = mulberry32(seed);

  const brokenPost = (x, baseY, width, height, lean) => {
    ctx.save();
    ctx.translate(x, baseY);
    ctx.rotate(lean);
    const path = (c) => {
      c.beginPath();
      c.moveTo(-width / 2, 0);
      c.lineTo(-width / 2 - 4, -height * 0.6);
      c.lineTo(-width / 2 + 2, -height);
      for (let i = 0; i < 5; i += 1) {
        c.lineTo(-width / 2 + (width * (i + 1)) / 5, -height + (rand() - 0.5) * height * 0.14);
      }
      c.lineTo(width / 2 + 4, -height * 0.55);
      c.lineTo(width / 2, 0);
      c.closePath();
      c.fill();
    };
    rimmed(ctx, path, {
      body: bodyFill(ctx, -height, 0, '#1a222d'),
      rim: rimFill(ctx, -height, -height * 0.1, 0.4),
      dx: -4,
      dy: -3,
    });
    flank(ctx, path, -width * 0.6, width * 0.6, 0.66);
    ctx.restore();
  };

  brokenPost(w * 0.15, h * 0.97, 78, h * 0.76, -0.035);
  brokenPost(w * 0.33, h * 0.99, 62, h * 0.46, 0.06);
  brokenPost(w * 0.79, h * 0.96, 86, h * 0.62, -0.02);

  ctx.save();
  ctx.translate(w * 0.53, h * 0.88);
  ctx.rotate(0.13);
  rimmed(ctx, (c) => {
    c.beginPath();
    c.rect(-w * 0.19, -58, w * 0.38, 58);
    c.fill();
  }, {
    body: bodyFill(ctx, h * 0.8, h, '#161d27'),
    rim: rimFill(ctx, h * 0.8, h * 0.92, 0.38),
    dx: -4,
    dy: -6,
  });
  ctx.restore();

  for (let i = 0; i < 12; i += 1) {
    const cx = rand() * w;
    const rx = w * (0.04 + rand() * 0.055);
    const ry = rx * 0.52;
    const path = blobPath(rand, cx, h - ry * 0.2, rx, ry, rand() * TAU, 0.14);
    rimmed(ctx, path, {
      body: '#05070b',
      rim: rimFill(ctx, h - ry * 1.4, h, 0.3),
      dx: -3,
      dy: -4,
    });
  }

  for (let i = 0; i < 320; i += 1) {
    const x = rand() * w;
    const bh = 16 + rand() * 74;
    ctx.fillStyle = rand() < 0.08 ? 'rgba(120,152,196,0.25)' : '#04060a';
    blade(ctx, x, h + 4, bh, (rand() - 0.5) * bh * 0.6, 3 + rand() * 3);
  }
}

/* ------------------------------------------------------------------ bush */

export function drawBush(ctx, w, h, seed = 101) {
  const rand = mulberry32(seed);
  const cx = w * 0.5;
  const baseY = h + 14;
  const rx = w * 0.46;
  const ry = h * 0.88;

  const dome = (c) => {
    c.beginPath();
    c.moveTo(cx - rx, baseY);
    c.bezierCurveTo(cx - rx * 0.98, baseY - ry * 1.22, cx + rx * 0.98, baseY - ry * 1.22, cx + rx, baseY);
    c.closePath();
    c.fill();
  };

  // rim first, then the solid mound over it
  ctx.save();
  ctx.translate(-6, -8);
  ctx.fillStyle = rimFill(ctx, baseY - ry, baseY - ry * 0.15, 0.4);
  dome(ctx);
  ctx.restore();

  ctx.fillStyle = bodyFill(ctx, baseY - ry, baseY, '#111925');
  dome(ctx);

  // clipped foliage texture inside the mound
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0)';
  dome(ctx);
  ctx.clip();
  for (let i = 0; i < 1500; i += 1) {
    const x = cx + (rand() - 0.5) * rx * 2.1;
    const y = baseY - Math.pow(rand(), 0.75) * ry * 1.15;
    const r = 9 + rand() * 26;
    const roll = rand();
    ctx.fillStyle = roll < 0.07 ? 'rgba(74,102,132,0.2)' : roll < 0.55 ? 'rgba(3,5,10,0.5)' : 'rgba(20,28,40,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.55 + rand() * 0.5), rand() * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  flank(ctx, dome, cx - rx * 0.4, cx + rx, 0.6);

  // shoots escaping the clipped line
  for (let i = 0; i < 80; i += 1) {
    const a = rand() * Math.PI;
    const x = cx - Math.cos(a) * rx * 0.96;
    const y = baseY - Math.sin(a) * ry * 1.02;
    ctx.strokeStyle = rand() < 0.22 ? 'rgba(126,160,208,0.3)' : '#05070b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 44, y - rand() * 52);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ hill */

export function drawHill(ctx, w, h, seed = 131) {
  const rand = mulberry32(seed);

  const ridgeAt = (span, offset, amp, base) => {
    const pts = [];
    const steps = 220;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const arc = Math.sin(t * Math.PI * span + offset);
      const y =
        h * base -
        Math.pow(Math.max(arc, 0), 1.35) * h * amp -
        Math.sin(t * 6.1 + offset * 3) * h * 0.07 -
        Math.sin(t * 17.3 + offset) * h * 0.022;
      pts.push([t * w, y]);
    }
    return pts;
  };

  const layers = [
    { pts: ridgeAt(0.7, 0.62, 0.88, 1.02), light: '#18222f', dark: '#0d1520', rim: 0.24, trees: 110, treeMax: 22 },
    { pts: ridgeAt(0.92, 0.16, 0.6, 1.16), light: '#0b121c', dark: '#04070c', rim: 0.36, trees: 170, treeMax: 38 },
  ];

  for (const layer of layers) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, layer.light);
    g.addColorStop(1, layer.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, h + 6);
    for (const [x, y] of layer.pts) ctx.lineTo(x, y);
    ctx.lineTo(w, h + 6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(150,184,232,${layer.rim})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    layer.pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();

    for (let i = 0; i < layer.trees; i += 1) {
      const idx = (rand() * (layer.pts.length - 1)) | 0;
      const [x, y] = layer.pts[idx];
      const th = 10 + rand() * layer.treeMax;
      ctx.fillStyle = layer.dark;
      ctx.beginPath();
      ctx.moveTo(x - th * 0.24, y + 4);
      ctx.lineTo(x - th * 0.1, y - th * 0.5);
      ctx.lineTo(x, y - th);
      ctx.lineTo(x + th * 0.1, y - th * 0.5);
      ctx.lineTo(x + th * 0.24, y + 4);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/* ------------------------------------------------------------------ pine */

export function drawPine(ctx, w, h, seed = 149) {
  const rand = mulberry32(seed);
  const baseX = w * 0.26;

  const trunk = (offX, offY, style, width) => {
    ctx.strokeStyle = style;
    ctx.lineCap = 'round';
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(baseX + offX, h + 26);
    ctx.bezierCurveTo(
      baseX + w * 0.02 + offX, h * 0.68 + offY,
      baseX + w * 0.22 + offX, h * 0.5 + offY,
      baseX + w * 0.17 + offX, h * 0.16 + offY,
    );
    ctx.stroke();
  };
  trunk(-7, -6, 'rgba(140,176,224,0.26)', 40);
  trunk(0, 0, '#04060a', 40);

  // flat boughs, the way a trained black pine is layered
  const boughs = [
    { x: 0.14, y: 0.78, rx: 0.2, ry: 0.05 },
    { x: 0.66, y: 0.66, rx: 0.24, ry: 0.055 },
    { x: 0.2, y: 0.52, rx: 0.19, ry: 0.05 },
    { x: 0.72, y: 0.4, rx: 0.21, ry: 0.05 },
    { x: 0.33, y: 0.28, rx: 0.18, ry: 0.045 },
    { x: 0.56, y: 0.13, rx: 0.16, ry: 0.042 },
  ];

  for (const b of boughs) {
    const cx = w * b.x + w * b.rx * 0.5;
    const cy = h * b.y;
    const rx = w * b.rx;
    const ry = h * b.ry;

    // the limb reaching out to the cluster
    ctx.strokeStyle = '#04060a';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(baseX + w * 0.09 * (1 - b.y), h * b.y + h * 0.11);
    ctx.quadraticCurveTo(lerp(baseX, cx, 0.5), cy + h * 0.035, cx, cy);
    ctx.stroke();

    const path = blobPath(rand, cx, cy, rx, ry, rand() * TAU, 0.34, 22);
    ctx.save();
    ctx.translate(-6, -7);
    ctx.fillStyle = rimFill(ctx, cy - ry * 1.5, cy + ry, 0.34);
    path(ctx);
    ctx.restore();
    ctx.fillStyle = bodyFill(ctx, cy - ry * 1.6, cy + ry * 1.4, '#0e1622');
    path(ctx);

    // needles fringing the silhouette
    for (let i = 0; i < 230; i += 1) {
      const a = rand() * TAU;
      const d = 0.72 + rand() * 0.5;
      const x = cx + Math.cos(a) * rx * d;
      const y = cy + Math.sin(a) * ry * d * 1.5;
      const len = 8 + rand() * 16;
      const na = a + (rand() - 0.5) * 1.1;
      ctx.strokeStyle = rand() < 0.1 ? 'rgba(122,158,208,0.3)' : '#04060a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(na) * len, y + Math.sin(na) * len);
      ctx.stroke();
    }
  }
}

/* --------------------------------------------------------------- lantern */

export function drawLantern(ctx, w, h, seed = 167) {
  const rand = mulberry32(seed);
  const cx = w * 0.5;
  const u = h / 13;

  const part = (path, top, bottom, rimStrength = 0.42) => {
    rimmed(ctx, path, {
      body: bodyFill(ctx, top, bottom, '#1a222e'),
      rim: rimFill(ctx, top, bottom, rimStrength),
      dx: -5,
      dy: -4,
    });
    flank(ctx, path, cx - u * 1.2, cx + u * 3, 0.55);
  };

  // pedestal
  part((c) => {
    c.beginPath();
    c.moveTo(cx - u * 2.4, h);
    c.lineTo(cx - u * 1.9, h - u * 0.7);
    c.lineTo(cx - u * 1.5, h - u * 1.35);
    c.lineTo(cx + u * 1.5, h - u * 1.35);
    c.lineTo(cx + u * 1.9, h - u * 0.7);
    c.lineTo(cx + u * 2.4, h);
    c.closePath();
    c.fill();
  }, h - u * 1.4, h);

  // shaft
  part((c) => {
    c.beginPath();
    c.moveTo(cx - u * 0.66, h - u * 1.35);
    c.lineTo(cx - u * 0.56, h - u * 5.1);
    c.lineTo(cx + u * 0.56, h - u * 5.1);
    c.lineTo(cx + u * 0.66, h - u * 1.35);
    c.closePath();
    c.fill();
    // the swelling ring a stone shaft carries at mid height
    c.beginPath();
    c.ellipse(cx, h - u * 3.2, u * 0.86, u * 0.3, 0, 0, TAU);
    c.fill();
  }, h - u * 5.2, h - u * 1.3);

  // plate under the fire box
  part((c) => {
    c.beginPath();
    c.moveTo(cx - u * 2.2, h - u * 5.1);
    c.lineTo(cx - u * 1.6, h - u * 6.0);
    c.lineTo(cx + u * 1.6, h - u * 6.0);
    c.lineTo(cx + u * 2.2, h - u * 5.1);
    c.closePath();
    c.fill();
  }, h - u * 6.1, h - u * 5);

  const boxBottom = h - u * 6.0;
  const boxTop = h - u * 8.6;
  const boxMid = (boxTop + boxBottom) / 2;

  // the light living inside the box
  const glow = ctx.createRadialGradient(cx, boxMid, u * 0.1, cx, boxMid, u * 3.2);
  glow.addColorStop(0, 'rgba(255,206,150,0.8)');
  glow.addColorStop(0.3, 'rgba(255,146,70,0.34)');
  glow.addColorStop(1, 'rgba(255,120,50,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, boxMid, u * 3.2, 0, TAU);
  ctx.fill();

  // fire box with a cut-out window
  part((c) => {
    c.beginPath();
    c.moveTo(cx - u * 1.75, boxBottom);
    c.lineTo(cx - u * 1.6, boxTop);
    c.lineTo(cx + u * 1.6, boxTop);
    c.lineTo(cx + u * 1.75, boxBottom);
    c.closePath();
    c.moveTo(cx + u * 1.0, boxBottom - u * 0.42);
    c.lineTo(cx + u * 0.95, boxTop + u * 0.42);
    c.lineTo(cx - u * 0.95, boxTop + u * 0.42);
    c.lineTo(cx - u * 1.0, boxBottom - u * 0.42);
    c.closePath();
    c.fill('evenodd');
  }, boxTop, boxBottom);

  // window mullions
  ctx.strokeStyle = 'rgba(6,8,12,0.9)';
  ctx.lineWidth = u * 0.11;
  for (let i = 1; i < 3; i += 1) {
    const y = lerp(boxTop + u * 0.42, boxBottom - u * 0.42, i / 3);
    ctx.beginPath();
    ctx.moveTo(cx - u * 0.98, y);
    ctx.lineTo(cx + u * 0.98, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, boxTop + u * 0.42);
  ctx.lineTo(cx, boxBottom - u * 0.42);
  ctx.stroke();

  // roof with lifted corners
  part((c) => {
    const eaveY = boxTop + u * 0.2;
    const peakY = boxTop - u * 1.85;
    c.beginPath();
    c.moveTo(cx - u * 3.5, eaveY);
    c.quadraticCurveTo(cx - u * 3.3, eaveY - u * 0.62, cx - u * 2.7, eaveY - u * 0.3);
    c.quadraticCurveTo(cx - u * 1.5, peakY + u * 0.5, cx, peakY);
    c.quadraticCurveTo(cx + u * 1.5, peakY + u * 0.5, cx + u * 2.7, eaveY - u * 0.3);
    c.quadraticCurveTo(cx + u * 3.3, eaveY - u * 0.62, cx + u * 3.5, eaveY);
    c.quadraticCurveTo(cx, eaveY - u * 0.95, cx - u * 3.5, eaveY);
    c.closePath();
    c.fill();
  }, boxTop - u * 2, boxTop + u * 0.4, 0.55);

  // finial
  part((c) => {
    c.beginPath();
    c.arc(cx, boxTop - u * 2.5, u * 0.42, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(cx - u * 0.18, boxTop - u * 2.4);
    c.lineTo(cx + u * 0.18, boxTop - u * 2.4);
    c.lineTo(cx + u * 0.12, boxTop - u * 1.7);
    c.lineTo(cx - u * 0.12, boxTop - u * 1.7);
    c.closePath();
    c.fill();
  }, boxTop - u * 3, boxTop - u * 1.6, 0.6);

  // warm spill on the ground
  const spill = ctx.createRadialGradient(cx, h - u * 0.3, 0, cx, h - u * 0.3, u * 4.6);
  spill.addColorStop(0, 'rgba(255,150,74,0.2)');
  spill.addColorStop(1, 'rgba(255,140,70,0)');
  ctx.fillStyle = spill;
  ctx.beginPath();
  ctx.ellipse(cx, h - u * 0.25, u * 4.6, u * 1.1, 0, 0, TAU);
  ctx.fill();

  for (let i = 0; i < 520; i += 1) {
    const x = cx + (rand() - 0.5) * u * 7;
    const y = h - Math.pow(rand(), 2) * u * 1.5;
    ctx.fillStyle = rand() < 0.24 ? 'rgba(52,86,72,0.35)' : 'rgba(5,7,11,0.85)';
    ctx.fillRect(x, y, 1 + rand() * 3, 1 + rand() * 2);
  }
}

/* -------------------------------------------------------------- manifest */

export const ASSETS = [
  { name: 'tall-grass', w: 1800, h: 700, draw: drawGrass },
  { name: 'maple-branch', w: 1300, h: 900, draw: drawMapleBranch },
  { name: 'sakura-branch', w: 1300, h: 860, draw: drawSakuraBranch },
  { name: 'basalt-stones', w: 1600, h: 560, draw: drawStones },
  { name: 'temple-wall', w: 1800, h: 640, draw: drawWall },
  { name: 'shrine-ruins', w: 1500, h: 720, draw: drawRuins },
  { name: 'garden-bush', w: 1200, h: 660, draw: drawBush },
  { name: 'ridge-hill', w: 2200, h: 560, draw: drawHill },
  { name: 'pine-bough', w: 1300, h: 900, draw: drawPine },
  { name: 'stone-lantern', w: 760, h: 1180, draw: drawLantern },
];
