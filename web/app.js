const CONFIG = {
  SIM_HZ: 30,
  GHOST_DELAY: 2.2,
  SEGMENT_TTL: 12,
  RESPAWN_DELAY: 2,
  PLAYER_COUNT: 11,
  HUMAN_SPEED: 170,
  BOT_SPEED: 158,
  TURN_RATE: 5.2,
  BOT_TURN_RATE: 4.2,
  RADIUS: 8,
  SEGMENT_MIN_DIST: 4,
  WORLD_W_MIN: 2200,
  WORLD_H_MIN: 1300,
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

const startOverlay = document.createElement("div");
startOverlay.style.cssText = "position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:rgba(6,10,16,0.18);backdrop-filter: blur(1.5px);";
wrap.appendChild(startOverlay);

const panel = document.createElement("div");
panel.style.cssText = "width:min(420px,90vw);border:1px solid rgba(137,170,228,0.45);background:rgba(9,14,24,0.46);border-radius:14px;padding:16px 16px 14px;box-shadow:0 16px 40px rgba(0,0,0,0.36)";
startOverlay.appendChild(panel);

const title = document.createElement("div");
title.textContent = "GHOST TRAIL ARENA";
title.style.cssText = "font-weight:900;color:#eff5ff;letter-spacing:0.04em;margin-bottom:6px";
panel.appendChild(title);

const sub = document.createElement("div");
sub.textContent = "Transparent lobby: game is running live behind this panel.";
sub.style.cssText = "font-size:12px;color:#b9cae9;margin-bottom:10px";
panel.appendChild(sub);

const nickInput = document.createElement("input");
nickInput.type = "text";
nickInput.maxLength = 16;
nickInput.placeholder = "Enter your nickname";
nickInput.value = "Pilot";
nickInput.style.cssText = "width:100%;padding:10px 11px;border-radius:10px;border:1px solid #43608a;background:rgba(8,13,20,0.72);color:#e9f2ff;outline:none;font-size:14px;";
panel.appendChild(nickInput);

const info = document.createElement("div");
info.textContent = "Right-bottom stick steers the aircraft. Trail turns SOLID after 2.2s.";
info.style.cssText = "font-size:12px;color:#9db3d7;margin-top:8px;line-height:1.4";
panel.appendChild(info);

const startBtn = document.createElement("button");
startBtn.textContent = "START FLIGHT";
startBtn.style.cssText = "margin-top:12px;width:100%;padding:11px 12px;border-radius:10px;border:1px solid #88b8ff;background:rgba(23,40,70,0.85);color:#f3f8ff;font-weight:800;cursor:pointer";
panel.appendChild(startBtn);

const joyWrap = document.createElement("div");
joyWrap.style.cssText = "position:absolute;right:18px;bottom:20px;z-index:4;width:132px;height:132px;border-radius:50%;border:1px solid rgba(144,182,243,0.5);background:radial-gradient(circle at 35% 30%, rgba(136,173,230,0.20), rgba(24,34,52,0.45));backdrop-filter:blur(1px);touch-action:none;";
wrap.appendChild(joyWrap);

const joyKnob = document.createElement("div");
joyKnob.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:56px;height:56px;border-radius:50%;border:1px solid rgba(194,223,255,0.85);background:rgba(173,213,255,0.27);box-shadow:0 4px 16px rgba(0,0,0,0.3);";
joyWrap.appendChild(joyKnob);

const ctx = canvas.getContext("2d");
let W = 1280;
let H = 720;
let WORLD_W = 2400;
let WORLD_H = 1400;

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = window.innerWidth;
  H = window.innerHeight;
  WORLD_W = Math.max(CONFIG.WORLD_W_MIN, Math.floor(W * 1.9));
  WORLD_H = Math.max(CONFIG.WORLD_H_MIN, Math.floor(H * 1.45));
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

const keys = new Set();
window.addEventListener("keydown", (e) => { keys.add(e.code); if (e.code === "Enter" && !gameStarted) tryStart(); });
window.addEventListener("keyup", (e) => { keys.delete(e.code); });

const joystick = { active: false, id: -1, x: 0, y: 0, mag: 0 };
function setKnobVisual() {
  const maxR = 42;
  const px = joystick.x * maxR;
  const py = joystick.y * maxR;
  joyKnob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
}
function setJoystickFromPointer(clientX, clientY) {
  const r = joyWrap.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const l = Math.hypot(dx, dy);
  const max = r.width * 0.38;
  if (l > max) {
    dx = (dx / l) * max;
    dy = (dy / l) * max;
  }
  joystick.x = clamp(dx / max, -1, 1);
  joystick.y = clamp(dy / max, -1, 1);
  joystick.mag = clamp(Math.hypot(joystick.x, joystick.y), 0, 1);
  setKnobVisual();
}
joyWrap.addEventListener("pointerdown", (e) => {
  joystick.active = true;
  joystick.id = e.pointerId;
  joyWrap.setPointerCapture(e.pointerId);
  setJoystickFromPointer(e.clientX, e.clientY);
});
joyWrap.addEventListener("pointermove", (e) => {
  if (!joystick.active || e.pointerId !== joystick.id) return;
  setJoystickFromPointer(e.clientX, e.clientY);
});
joyWrap.addEventListener("pointerup", (e) => {
  if (e.pointerId !== joystick.id) return;
  joystick.active = false;
  joystick.id = -1;
  joystick.x = 0;
  joystick.y = 0;
  joystick.mag = 0;
  setKnobVisual();
});
joyWrap.addEventListener("pointercancel", () => {
  joystick.active = false;
  joystick.id = -1;
  joystick.x = 0;
  joystick.y = 0;
  joystick.mag = 0;
  setKnobVisual();
});

const players = [];
const segments = [];
const pulses = [];
let gameStarted = false;

function spawnPlayer(p, now) {
  p.x = rand(120, WORLD_W - 120);
  p.y = rand(120, WORLD_H - 120);
  p.angle = rand(-Math.PI, Math.PI);
  p.alive = true;
  p.spawnInvulnUntil = now + CONFIG.RESPAWN_DELAY;
  p.respawnAt = 0;
  p.lastTrailX = p.x;
  p.lastTrailY = p.y;
  p.botThinkAt = now;
  p.botTargetX = rand(140, WORLD_W - 140);
  p.botTargetY = rand(140, WORLD_H - 140);
}

for (let i = 0; i < CONFIG.PLAYER_COUNT; i++) {
  players.push({
    id: i,
    name: i === 0 ? "Pilot" : `BOT-${i}`,
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

function tryStart() {
  const nick = (nickInput.value || "Pilot").trim().slice(0, 16);
  players[0].name = nick || "Pilot";
  gameStarted = true;
  startOverlay.style.display = "none";
  beep(620, 0.07, "triangle", 0.03);
}
startBtn.addEventListener("click", tryStart);

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
  });
}

function killPlayer(p, now, killerId = -1) {
  if (!p.alive) return;
  p.alive = false;
  p.kills = 0;
  p.deaths = 0;
  p.survival = 0;
  p.respawnAt = now + CONFIG.RESPAWN_DELAY;
  if (killerId >= 0 && killerId !== p.id && players[killerId]) players[killerId].kills += 1;
  pulses.push({ x: p.x, y: p.y, t: 0.3, color: "#ff4d5d" });
  if (p.id === 0) beep(140, 0.12, "sawtooth", 0.05);
}

function updateBot(p, now, step) {
  if (now >= p.botThinkAt) {
    p.botThinkAt = now + rand(0.16, 0.34);
    let ax = 0;
    let ay = 0;

    const margin = 70;
    if (p.x < margin) ax += 1;
    if (p.x > WORLD_W - margin) ax -= 1;
    if (p.y < margin) ay += 1;
    if (p.y > WORLD_H - margin) ay -= 1;

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (!s.solid) continue;
      const d = pointSegmentDist(p.x, p.y, s.x1, s.y1, s.x2, s.y2);
      if (d > 78) continue;
      const vx = s.x2 - s.x1;
      const vy = s.y2 - s.y1;
      const n = norm(-vy, vx);
      const sign = ((p.x - s.x1) * n.x + (p.y - s.y1) * n.y) >= 0 ? 1 : -1;
      const w = (78 - d) / 78;
      ax += n.x * sign * w * 2.2;
      ay += n.y * sign * w * 2.2;
    }

    if (len(p.botTargetX - p.x, p.botTargetY - p.y) < 70 || Math.random() < 0.06) {
      p.botTargetX = rand(110, WORLD_W - 110);
      p.botTargetY = rand(110, WORLD_H - 110);
    }

    let tx = p.botTargetX - p.x;
    let ty = p.botTargetY - p.y;

    let nearest = null;
    let best = 1e9;
    for (let i = 0; i < players.length; i++) {
      const q = players[i];
      if (!q.alive || q.id === p.id) continue;
      const d = len(q.x - p.x, q.y - p.y);
      if (d < best) { best = d; nearest = q; }
    }
    if (nearest && best < 220 && Math.random() < 0.34) {
      const vx = Math.cos(nearest.angle);
      const vy = Math.sin(nearest.angle);
      const px = -vy;
      const py = vx;
      tx += px * 190;
      ty += py * 190;
    }

    ax += tx * 0.01;
    ay += ty * 0.01;

    if (Math.random() < 0.16) {
      ax *= 0.72;
      ay *= 0.72;
      p.desiredAngle += rand(-0.45, 0.45);
    } else {
      p.desiredAngle = Math.atan2(ay, ax);
    }
  }

  p.angle = angleLerp(p.angle, p.desiredAngle, clamp(step * CONFIG.BOT_TURN_RATE, 0, 1));
}

function updateHuman(p, step) {
  if (!gameStarted) {
    p.angle += 0.16 * step;
    return;
  }

  let targetAngle = p.angle;
  const up = keys.has("KeyW") || keys.has("ArrowUp");
  const dn = keys.has("KeyS") || keys.has("ArrowDown");
  const lf = keys.has("KeyA") || keys.has("ArrowLeft");
  const rt = keys.has("KeyD") || keys.has("ArrowRight");

  if (joystick.active && joystick.mag > 0.08) {
    targetAngle = Math.atan2(joystick.y, joystick.x);
  } else {
    const ix = (rt ? 1 : 0) - (lf ? 1 : 0);
    const iy = (dn ? 1 : 0) - (up ? 1 : 0);
    if (ix || iy) targetAngle = Math.atan2(iy, ix);
  }

  const boost = keys.has("ShiftLeft") || keys.has("ShiftRight") || (joystick.active && joystick.mag > 0.85);
  const turnMul = boost ? 0.82 : 1;
  p.angle = angleLerp(p.angle, targetAngle, clamp(step * CONFIG.TURN_RATE * turnMul, 0, 1));
}

function simulate(now) {
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    if (!s.solid && now >= s.solidAt) {
      s.solid = true;
      const mx = (s.x1 + s.x2) * 0.5;
      const my = (s.y1 + s.y2) * 0.5;
      pulses.push({ x: mx, y: my, t: 0.12, color: "#d1f9ff" });
      beep(950, 0.035, "square", 0.015);
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

    const boost = (!p.isBot && (keys.has("ShiftLeft") || keys.has("ShiftRight") || (joystick.active && joystick.mag > 0.85)));
    const joySpeedScale = !p.isBot && joystick.active ? clamp(0.55 + joystick.mag * 0.6, 0.55, 1.15) : 1;
    const speed = p.speed * joySpeedScale * (boost ? 1.18 : 1);

    const vx = Math.cos(p.angle) * speed * dt;
    const vy = Math.sin(p.angle) * speed * dt;

    const prevX = p.x;
    const prevY = p.y;
    p.x += vx;
    p.y += vy;

    if (p.x < 0 || p.x > WORLD_W || p.y < 0 || p.y > WORLD_H) {
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

function drawPlane(x, y, angle, color, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-8, -7);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function render(now) {
  ctx.clearRect(0, 0, W, H);
  const me = players[0];

  const camX = clamp(me.x - W * 0.5, 0, Math.max(0, WORLD_W - W));
  const camY = clamp(me.y - H * 0.5, 0, Math.max(0, WORLD_H - H));

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#070b14");
  grad.addColorStop(1, "#03060d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(135,162,220,0.09)";
  ctx.lineWidth = 1;
  const gx0 = Math.floor(camX / 40) * 40;
  const gy0 = Math.floor(camY / 40) * 40;
  for (let x = gx0; x < camX + W + 40; x += 40) {
    const sx = x - camX;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, 0);
    ctx.lineTo(sx + 0.5, H);
    ctx.stroke();
  }
  for (let y = gy0; y < camY + H + 40; y += 40) {
    const sy = y - camY;
    ctx.beginPath();
    ctx.moveTo(0, sy + 0.5);
    ctx.lineTo(W, sy + 0.5);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-camX + 1, -camY + 1, WORLD_W - 2, WORLD_H - 2);

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const c = COLORS[s.ownerId % COLORS.length];
    const x1 = s.x1 - camX;
    const y1 = s.y1 - camY;
    const x2 = s.x2 - camX;
    const y2 = s.y2 - camY;
    if ((x1 < -20 && x2 < -20) || (x1 > W + 20 && x2 > W + 20) || (y1 < -20 && y2 < -20) || (y1 > H + 20 && y2 > H + 20)) continue;

    if (s.solid) {
      ctx.setLineDash([]);
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 4;
    } else {
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = 2;
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  for (let i = 0; i < pulses.length; i++) {
    const p = pulses[i];
    const a = clamp(p.t / 0.3, 0, 1);
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = a;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 7 + (1 - a) * 28, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.alive) continue;
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;

    drawPlane(sx, sy, p.angle, p.color, p.id === 0 ? 1.05 : 0.95);

    if (now < p.spawnInvulnUntil) {
      const t = p.spawnInvulnUntil - now;
      ctx.strokeStyle = "rgba(165,242,255,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, p.radius + 6 + Math.sin(now * 18) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      if (p.id === 0) {
        ctx.fillStyle = "#d5f7ff";
        ctx.font = "12px ui-monospace,monospace";
        ctx.fillText(`INVULN ${t.toFixed(1)}s`, sx + 12, sy - 13);
      }
    }

    if (p.id === 0) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px ui-monospace,monospace";
      ctx.fillText(p.name, sx + 11, sy + 5);
    }
  }

  const aliveCount = players.filter((p) => p.alive).length;
  hud.textContent =
`Ghost Trail Arena
Delay ${CONFIG.GHOST_DELAY.toFixed(1)}s -> SOLID lethal wall
World ${WORLD_W} x ${WORLD_H}
Flight speed tuned down | Trail TTL ${CONFIG.SEGMENT_TTL}s
Controller: right-bottom virtual stick
Alive: ${aliveCount}/${players.length}
${players[0].name}  K:${players[0].kills} D:${players[0].deaths}`;

  const top = [...players].sort((a, b) => b.survival - a.survival).slice(0, 6);
  board.textContent = "LEADERBOARD (survival sec)\n" + top.map((p, idx) => {
    const mark = p.id === 0 ? " <YOU>" : "";
    return `${idx + 1}. ${p.name.padEnd(8, " ")} ${p.survival.toFixed(1)}s  K:${p.kills}${mark}`;
  }).join("\n");

  if (!players[0].alive) {
    centerMsg.textContent = `OVERWRITE IN ${(players[0].respawnAt - now).toFixed(1)}...`;
  } else if (!gameStarted) {
    centerMsg.textContent = "";
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
