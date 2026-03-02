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
startOverlay.style.cssText = "position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;background:rgba(6,10,16,0.18);backdrop-filter: blur(1.5px);";
wrap.appendChild(startOverlay);

const panel = document.createElement("div");
panel.style.cssText = "width:min(430px,90vw);border:1px solid rgba(137,170,228,0.45);background:rgba(9,14,24,0.46);border-radius:14px;padding:16px 16px 14px;box-shadow:0 16px 40px rgba(0,0,0,0.36)";
startOverlay.appendChild(panel);

const title = document.createElement("div");
title.textContent = "GHOST TRAIL ARENA ONLINE";
title.style.cssText = "font-weight:900;color:#eff5ff;letter-spacing:0.04em;margin-bottom:6px";
panel.appendChild(title);

const sub = document.createElement("div");
sub.textContent = "Transparent lobby: background is live server state.";
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
info.textContent = "Join same room with others. Right-bottom stick controls your craft.";
info.style.cssText = "font-size:12px;color:#9db3d7;margin-top:8px;line-height:1.4";
panel.appendChild(info);

const startBtn = document.createElement("button");
startBtn.textContent = "JOIN MATCH";
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

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

const keys = new Set();
window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (e.code === "Enter" && !joined) joinMatch();
});
window.addEventListener("keyup", (e) => keys.delete(e.code));

const joystick = { active: false, id: -1, x: 0, y: 0, mag: 0 };
function setKnobVisual() {
  const maxR = 42;
  joyKnob.style.transform = `translate(calc(-50% + ${joystick.x * maxR}px), calc(-50% + ${joystick.y * maxR}px))`;
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
function clearJoy() {
  joystick.active = false;
  joystick.id = -1;
  joystick.x = 0;
  joystick.y = 0;
  joystick.mag = 0;
  setKnobVisual();
}
joyWrap.addEventListener("pointerup", (e) => { if (e.pointerId === joystick.id) clearJoy(); });
joyWrap.addEventListener("pointercancel", clearJoy);

let ws = null;
let connected = false;
let joined = false;
let myId = null;
let state = { now: 0, world: { w: 2800, h: 1700 }, config: { ghostDelay: 2.2, ttl: 6, respawnDelay: 2 }, players: [], segments: [], leaderboard: [] };

function wsUrl() {
  const p = location.protocol === "https:" ? "wss:" : "ws:";
  return `${p}//${location.host}`;
}

function connect() {
  ws = new WebSocket(wsUrl());
  ws.addEventListener("open", () => {
    connected = true;
  });
  ws.addEventListener("close", () => {
    connected = false;
    joined = false;
    myId = null;
    setTimeout(connect, 900);
  });
  ws.addEventListener("message", (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.t === "welcome") {
      if (msg.config) state.config = {
        ghostDelay: msg.config.ghostDelay,
        ttl: msg.config.ttl,
        respawnDelay: msg.config.respawnDelay,
      };
      return;
    }
    if (msg.t === "joined") {
      myId = msg.youId;
      joined = true;
      startOverlay.style.display = "none";
      return;
    }
    if (msg.t === "you") {
      myId = msg.id;
      return;
    }
    if (msg.t === "state") {
      state = msg;
      return;
    }
  });
}
connect();

function joinMatch() {
  if (!connected || !ws || ws.readyState !== WebSocket.OPEN) return;
  const nick = (nickInput.value || "Pilot").trim().slice(0, 16) || "Pilot";
  ws.send(JSON.stringify({ t: "join", nick }));
}
startBtn.addEventListener("click", joinMatch);

let lastInputSend = 0;
function sendInput(now) {
  if (!connected || !joined || !ws || ws.readyState !== WebSocket.OPEN || !myId) return;
  if (now - lastInputSend < 0.05) return;
  lastInputSend = now;

  let ix = 0;
  let iy = 0;

  if (joystick.active && joystick.mag > 0.05) {
    ix = joystick.x;
    iy = joystick.y;
  } else {
    const up = keys.has("KeyW") || keys.has("ArrowUp");
    const dn = keys.has("KeyS") || keys.has("ArrowDown");
    const lf = keys.has("KeyA") || keys.has("ArrowLeft");
    const rt = keys.has("KeyD") || keys.has("ArrowRight");
    ix = (rt ? 1 : 0) - (lf ? 1 : 0);
    iy = (dn ? 1 : 0) - (up ? 1 : 0);
    const mag = Math.hypot(ix, iy) || 1;
    if (ix || iy) {
      ix /= mag;
      iy /= mag;
    }
  }

  const boost = keys.has("ShiftLeft") || keys.has("ShiftRight") || (joystick.active && joystick.mag > 0.85);
  ws.send(JSON.stringify({ t: "input", ix, iy, boost }));
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
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function render(now) {
  const players = state.players || [];
  const segments = state.segments || [];
  const world = state.world || { w: 2800, h: 1700 };
  const me = players.find((p) => p.id === myId) || players[0] || { x: world.w / 2, y: world.h / 2, alive: true, respawnIn: 0, name: "-", kills: 0, deaths: 0 };

  const camX = clamp(me.x - W * 0.5, 0, Math.max(0, world.w - W));
  const camY = clamp(me.y - H * 0.5, 0, Math.max(0, world.h - H));

  ctx.clearRect(0, 0, W, H);
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
  ctx.strokeRect(-camX + 1, -camY + 1, world.w - 2, world.h - 2);

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const x1 = s.x1 - camX;
    const y1 = s.y1 - camY;
    const x2 = s.x2 - camX;
    const y2 = s.y2 - camY;
    if ((x1 < -20 && x2 < -20) || (x1 > W + 20 && x2 > W + 20) || (y1 < -20 && y2 < -20) || (y1 > H + 20 && y2 > H + 20)) continue;
    if (s.solid) {
      ctx.setLineDash([]);
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 4;
    } else {
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = s.color;
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

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.alive) continue;
    const sx = p.x - camX;
    const sy = p.y - camY;
    if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;

    drawPlane(sx, sy, p.angle, p.color, p.id === myId ? 1.05 : 0.95);

    if (p.invuln > 0) {
      ctx.strokeStyle = "rgba(165,242,255,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, (p.radius || 8) + 6 + Math.sin(now * 18) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (p.id === myId) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px ui-monospace,monospace";
      ctx.fillText(p.name, sx + 11, sy + 5);
    }
  }

  const aliveCount = players.filter((p) => p.alive).length;
  hud.textContent =
`Ghost Trail Arena ONLINE
Connected: ${connected ? "YES" : "NO"} | Joined: ${joined ? "YES" : "NO"}
Delay ${Number(state.config?.ghostDelay || 2.2).toFixed(1)}s -> SOLID lethal wall
Trail TTL ${Number(state.config?.ttl || 6).toFixed(1)}s | Respawn ${Number(state.config?.respawnDelay || 2).toFixed(1)}s
World ${world.w} x ${world.h}
Alive: ${aliveCount}/${players.length}
${me.name || "YOU"}  K:${me.kills || 0} D:${me.deaths || 0}`;

  const lb = state.leaderboard || [];
  board.textContent = "LEADERBOARD (survival sec)\n" + lb.map((p, idx) => {
    const mark = p.id === myId ? " <YOU>" : "";
    return `${idx + 1}. ${(p.name || "-").padEnd(8, " ")} ${Number(p.survival || 0).toFixed(1)}s K:${p.kills || 0}${mark}`;
  }).join("\n");

  if (!connected) {
    centerMsg.textContent = "CONNECTING TO SERVER...";
  } else if (joined && me && !me.alive) {
    centerMsg.textContent = `RESPAWNING IN ${Number(me.respawnIn || 0).toFixed(1)}...`;
  } else if (!joined) {
    centerMsg.textContent = "JOIN TO ENTER THE SAME LIVE MAP";
  } else {
    centerMsg.textContent = "";
  }
}

let last = performance.now() / 1000;
function frame() {
  const now = performance.now() / 1000;
  const dt = Math.min(0.08, now - last);
  last = now;
  sendInput(now);
  render(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
