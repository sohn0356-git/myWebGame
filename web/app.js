const CONFIG = {
  SIM_HZ: 30,
  GHOST_DELAY: 3,
  SEGMENT_TTL: 20,
  RESPAWN_DELAY: 2,
  PLAYER_COUNT: 11,
  HUMAN_SPEED: 210,
  BOT_SPEED: 195,
  TURN_RATE: 5.8,
  BOT_TURN_RATE: 4.6,
  RADIUS: 7,
  SEGMENT_MIN_DIST: 4,
};

const COLORS = [
  "#5eead4", "#f472b6", "#60a5fa", "#f59e0b", "#34d399", "#a78bfa",
  "#f87171", "#22d3ee", "#fb7185", "#84cc16", "#c084fc", "#facc15"
];

const root = document.getElementById("root") || document.body;
root.innerHTML = "";

const wrap = document.createElement("div");
wrap.style.cssText = "position:fixed;inset:0;background:#04070d;overflow:hidden;font-family:ui-monospace,Consolas,monospace;color:#dbe7ff";
root.appendChild(wrap);

const canvas = document.createElement("canvas");
canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
wrap.appendChild(canvas);

const hud = document.createElement("div");
hud.style.cssText = "position:absolute;left:12px;top:10px;z-index:3;font-size:12px;line-height:1.5;pointer-events:none;white-space:pre-wrap;text-shadow:0 1px 0 #000";
wrap.appendChild(hud);

const board = document.createElement("div");
board.style.cssText = "position:absolute;right:12px;top:10px;z-index:3;font-size:12px;line-height:1.45;pointer-events:none;text-align:right;white-space:pre-wrap";
wrap.appendChild(board);

const centerMsg = document.createElement("div");
centerMsg.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3;font-weight:800;font-size:20px;color:#f8fbff;pointer-events:none;text-shadow:0 2px 0 #000;";
wrap.appendChild(centerMsg);

const ctx = canvas.getContext("2d");
let W = 1280;
let H = 720;

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function len(x, y) { return Math.hypot(x, y); }
function norm(x, y) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }
function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
function angleLerp(a, b, t) { return a + wrapAngle(b - a) * t; }
function pointSegmentDist(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = px - x1;
  const wy = py - y1;
  const vv = vx * vx + vy * vy;
  if (vv <= 1e-6) return len(px - x1, py - y1);
  let t = (wx * vx + wy * vy) / vv;
  t = clamp(t, 0, 1);
  const cx = x1 + vx * t;
  const cy = y1 + vy * t;
  return len(px - cx, py - cy);
}

const keys = new Set();
const mouse = { x: 0, y: 0, active: false };
window.addEventListener("keydown", (e) => { keys.add(e.code); });
window.addEventListener("keyup", (e) => { keys.delete(e.code); });
window.addEventListener("mousemove", (e) => {
  mouse.active = true;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let audioCtx = null;
function beep(freq = 820, dur = 0.06, type = "square", vol = 0.02) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const now = audioCtx.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.85), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(now);
    o.stop(now + dur + 0.01);
  } catch {}
}

const players = [];
const segments = [];
const pulses = [];

function spawnPlayer(p, now) {
  p.x = rand(70, W - 70);
  p.y = rand(70, H - 70);
  p.angle = rand(-Math.PI, Math.PI);
  p.alive = true;
  p.spawnInvulnUntil = now + CONFIG.RESPAWN_DELAY;
  p.respawnAt = 0;
  p.lastTrailX = p.x;
  p.lastTrailY = p.y;
  p.botThinkAt = now;
  p.botTargetX = rand(80, W - 80);
  p.botTargetY = rand(80, H - 80);
}

for (let i = 0; i < CONFIG.PLAYER_COUNT; i++) {
  players.push({
    id: i,
    name: i === 0 ? "YOU" : `BOT-${i}`,
    color: COLORS[i % COLORS.length],
    x: 0,
    y: 0,
    angle: 0,
    speed: i === 0 ? CONFIG.HUMAN_SPEED : CONFIG.BOT_SPEED,
    radius: CONFIG.RADIUS,
    alive: true,
    spawnInvulnUntil: 0,
    respawnAt: 0,
    lastTrailX: 0,
    lastTrailY: 0,
    isBot: i !== 0,
    kills: 0,
    deaths: 0,
    survival: 0,
    botThinkAt: 0,
    botTargetX: 0,
    botTargetY: 0,
    desiredAngle: 0,
  });
}

let lastTime = performance.now() / 1000;
let acc = 0;
const dt = 1 / CONFIG.SIM_HZ;

function addSegment(owner, x1, y1, x2, y2, now) {
  segments.push({
    ownerId: owner.id,
    x1, y1, x2, y2,
    createdAt: now,
    solidAt: now + CONFIG.GHOST_DELAY,
    expireAt: now + CONFIG.GHOST_DELAY + CONFIG.SEGMENT_TTL,
    solid: false,
    justSolid: false,
  });
}

function killPlayer(p, now, killerId = -1) {
  if (!p.alive) return;
  p.alive = false;
  p.deaths += 1;
  p.respawnAt = now + CONFIG.RESPAWN_DELAY;
  if (killerId >= 0 && killerId !== p.id && players[killerId]) players[killerId].kills += 1;
  pulses.push({ x: p.x, y: p.y, t: 0.28, color: "#ff4d5d" });
  if (p.id === 0) beep(140, 0.12, "sawtooth", 0.05);
}

function updateBot(p, now, step) {
  if (now >= p.botThinkAt) {
    p.botThinkAt = now + rand(0.16, 0.35);
    let ax = 0;
    let ay = 0;

    const margin = 54;
    if (p.x < margin) ax += 1;
    if (p.x > W - margin) ax -= 1;
    if (p.y < margin) ay += 1;
    if (p.y > H - margin) ay -= 1;

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (!s.solid) continue;
      const d = pointSegmentDist(p.x, p.y, s.x1, s.y1, s.x2, s.y2);
      if (d > 70) continue;
      const vx = s.x2 - s.x1;
      const vy = s.y2 - s.y1;
      const n = norm(-vy, vx);
      const sign = ((p.x - s.x1) * n.x + (p.y - s.y1) * n.y) >= 0 ? 1 : -1;
      const w = (70 - d) / 70;
      ax += n.x * sign * w * 2.2;
      ay += n.y * sign * w * 2.2;
    }

    if (len(p.botTargetX - p.x, p.botTargetY - p.y) < 60 || Math.random() < 0.06) {
      p.botTargetX = rand(70, W - 70);
      p.botTargetY = rand(70, H - 70);
    }

    let tx = p.botTargetX - p.x;
    let ty = p.botTargetY - p.y;

    // Simple attack attempt: curve near nearest alive opponent
    let nearest = null;
    let best = 1e9;
    for (let i = 0; i < players.length; i++) {
      const q = players[i];
      if (!q.alive || q.id === p.id) continue;
      const d = len(q.x - p.x, q.y - p.y);
      if (d < best) { best = d; nearest = q; }
    }
    if (nearest && best < 190 && Math.random() < 0.38) {
      const vx = Math.cos(nearest.angle);
      const vy = Math.sin(nearest.angle);
      const px = -vy;
      const py = vx;
      tx += px * 180;
      ty += py * 180;
    }

    ax += tx * 0.012;
    ay += ty * 0.012;

    if (Math.random() < 0.16) {
      // human-like delay/noise
      ax *= 0.7;
      ay *= 0.7;
      const noise = rand(-0.5, 0.5);
      p.desiredAngle += noise;
    } else {
      p.desiredAngle = Math.atan2(ay, ax);
    }
  }

  p.angle = angleLerp(p.angle, p.desiredAngle, clamp(step * CONFIG.BOT_TURN_RATE, 0, 1));
}

function updateHuman(p, step) {
  let targetAngle = p.angle;
  const up = keys.has("KeyW") || keys.has("ArrowUp");
  const dn = keys.has("KeyS") || keys.has("ArrowDown");
  const lf = keys.has("KeyA") || keys.has("ArrowLeft");
  const rt = keys.has("KeyD") || keys.has("ArrowRight");

  if (mouse.active) {
    targetAngle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
  } else {
    const ix = (rt ? 1 : 0) - (lf ? 1 : 0);
    const iy = (dn ? 1 : 0) - (up ? 1 : 0);
    if (ix || iy) targetAngle = Math.atan2(iy, ix);
  }

  const boost = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const turnMul = boost ? 0.78 : 1;
  p.angle = angleLerp(p.angle, targetAngle, clamp(step * CONFIG.TURN_RATE * turnMul, 0, 1));
}

function simulate(now) {
  // segment state transitions + prune
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    s.justSolid = false;
    if (!s.solid && now >= s.solidAt) {
      s.solid = true;
      s.justSolid = true;
      const mx = (s.x1 + s.x2) * 0.5;
      const my = (s.y1 + s.y2) * 0.5;
      pulses.push({ x: mx, y: my, t: 0.12, color: "#d1f9ff" });
      beep(980, 0.035, "square", 0.016);
    }
    if (now > s.expireAt) segments.splice(i, 1);
  }

  for (let i = 0; i < players.length; i++) {
    const p = players[i];

    if (!p.alive) {
      if (now >= p.respawnAt) spawnPlayer(p, now);
      continue;
    }

    p.survival += dt;

    if (p.isBot) updateBot(p, now, dt);
    else updateHuman(p, dt);

    const boost = !p.isBot && (keys.has("ShiftLeft") || keys.has("ShiftRight"));
    const speed = p.speed * (boost ? 1.24 : 1);
    const vx = Math.cos(p.angle) * speed * dt;
    const vy = Math.sin(p.angle) * speed * dt;

    const prevX = p.x;
    const prevY = p.y;
    p.x += vx;
    p.y += vy;

    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
      killPlayer(p, now, -1);
      continue;
    }

    if (len(p.x - p.lastTrailX, p.y - p.lastTrailY) >= CONFIG.SEGMENT_MIN_DIST) {
      addSegment(p, p.lastTrailX, p.lastTrailY, p.x, p.y, now);
      p.lastTrailX = p.x;
      p.lastTrailY = p.y;
    }

    if (now < p.spawnInvulnUntil) continue;

    for (let j = 0; j < segments.length; j++) {
      const s = segments[j];
      if (!s.solid) continue;
      const d = pointSegmentDist(p.x, p.y, s.x1, s.y1, s.x2, s.y2);
      if (d <= p.radius) {
        killPlayer(p, now, s.ownerId);
        break;
      }
    }

    if (!p.alive) {
      p.x = prevX;
      p.y = prevY;
    }
  }

  for (let i = pulses.length - 1; i >= 0; i--) {
    pulses[i].t -= dt;
    if (pulses[i].t <= 0) pulses.splice(i, 1);
  }
}

function render(now) {
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#070b14");
  grad.addColorStop(1, "#03060d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = "rgba(135,162,220,0.09)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
  }

  // boundaries
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // segments
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const c = COLORS[s.ownerId % COLORS.length];
    if (s.solid) {
      ctx.setLineDash([]);
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 4;
    } else {
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
    }
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // pulses
  for (let i = 0; i < pulses.length; i++) {
    const p = pulses[i];
    const a = clamp(p.t / 0.3, 0, 1);
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = a;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7 + (1 - a) * 28, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // players
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.alive) continue;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // facing pointer
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.angle) * 12, p.y + Math.sin(p.angle) * 12);
    ctx.stroke();

    if (now < p.spawnInvulnUntil) {
      const t = (p.spawnInvulnUntil - now);
      ctx.strokeStyle = "rgba(165,242,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius + 4 + Math.sin(now * 18) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      if (p.id === 0) {
        ctx.fillStyle = "#d5f7ff";
        ctx.font = "12px ui-monospace,monospace";
        ctx.fillText(`INVULN ${t.toFixed(1)}s`, p.x + 12, p.y - 12);
      }
    }

    if (p.id === 0) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px ui-monospace,monospace";
      ctx.fillText("YOU", p.x + 10, p.y + 4);
    }
  }

  const me = players[0];
  const aliveCount = players.filter((p) => p.alive).length;
  const nextSolid = CONFIG.GHOST_DELAY.toFixed(1);
  hud.textContent =
`Ghost Trail Arena
Trail delay: ${nextSolid}s -> SOLID lethal wall
Controls: Mouse aim / WASD, Shift boost
Boundary = death | Respawn invuln: ${CONFIG.RESPAWN_DELAY}s
Alive: ${aliveCount}/${players.length}
YOU K:${me.kills} D:${me.deaths}`;

  const top = [...players].sort((a, b) => b.survival - a.survival).slice(0, 6);
  board.textContent = "LEADERBOARD (survival sec)\n" + top.map((p, idx) => {
    const mark = p.id === 0 ? " <YOU>" : "";
    return `${idx + 1}. ${p.name.padEnd(7, " ")} ${p.survival.toFixed(1)}s  K:${p.kills}${mark}`;
  }).join("\n");

  if (!me.alive) {
    centerMsg.textContent = `OVERWRITE IN ${(me.respawnAt - now).toFixed(1)}...`;
  } else {
    centerMsg.textContent = "";
  }
}

const now0 = performance.now() / 1000;
for (const p of players) spawnPlayer(p, now0);

function frame() {
  const now = performance.now() / 1000;
  let delta = now - lastTime;
  lastTime = now;
  delta = Math.min(delta, 0.08);
  acc += delta;

  while (acc >= dt) {
    simulate(now);
    acc -= dt;
  }

  render(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
