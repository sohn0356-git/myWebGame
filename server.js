const http = require("http");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 3000);
const WEB_DIR = path.join(__dirname, "web");

const CONFIG = {
  SIM_HZ: 30,
  SNAP_HZ: 15,
  GHOST_DELAY: 2.2,
  SEGMENT_TTL: 6,
  RESPAWN_DELAY: 2,
  HUMAN_SPEED: 170,
  BOT_SPEED: 158,
  TURN_RATE: 5.2,
  BOT_TURN_RATE: 4.2,
  RADIUS: 8,
  SEGMENT_MIN_DIST: 4,
  WORLD_W: 2800,
  WORLD_H: 1700,
  BOT_COUNT: 8,
};

const COLORS = [
  "#5eead4", "#f472b6", "#60a5fa", "#f59e0b", "#34d399", "#a78bfa",
  "#f87171", "#22d3ee", "#fb7185", "#84cc16", "#c084fc", "#facc15",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
};

function nowSec() {
  return performance.now() / 1000;
}

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

const players = new Map();
const segments = [];
const sockets = new Map();
let nextHumanId = 1;
let nextColor = 0;

function spawnPlayer(p, now) {
  p.x = rand(120, CONFIG.WORLD_W - 120);
  p.y = rand(120, CONFIG.WORLD_H - 120);
  p.angle = rand(-Math.PI, Math.PI);
  p.alive = true;
  p.spawnInvulnUntil = now + CONFIG.RESPAWN_DELAY;
  p.respawnAt = 0;
  p.lastTrailX = p.x;
  p.lastTrailY = p.y;
  p.botThinkAt = now;
  p.botTargetX = rand(140, CONFIG.WORLD_W - 140);
  p.botTargetY = rand(140, CONFIG.WORLD_H - 140);
}

function removeTrailByOwner(ownerId) {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].ownerId === ownerId) segments.splice(i, 1);
  }
}

function killPlayer(p, now, killerId = null) {
  if (!p.alive) return;
  p.alive = false;
  p.kills = 0;
  p.deaths = 0;
  p.survival = 0;
  removeTrailByOwner(p.id);
  p.respawnAt = now + CONFIG.RESPAWN_DELAY;
  if (killerId && killerId !== p.id && players.has(killerId)) players.get(killerId).kills += 1;
}

function addSegment(owner, x1, y1, x2, y2, now) {
  segments.push({
    ownerId: owner.id,
    color: owner.color,
    x1,
    y1,
    x2,
    y2,
    solidAt: now + CONFIG.GHOST_DELAY,
    expireAt: now + CONFIG.GHOST_DELAY + CONFIG.SEGMENT_TTL,
    solid: false,
  });
}

function updateBot(p, now, dt) {
  if (now >= p.botThinkAt) {
    p.botThinkAt = now + rand(0.16, 0.34);
    let ax = 0;
    let ay = 0;
    const margin = 70;
    if (p.x < margin) ax += 1;
    if (p.x > CONFIG.WORLD_W - margin) ax -= 1;
    if (p.y < margin) ay += 1;
    if (p.y > CONFIG.WORLD_H - margin) ay -= 1;

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
      p.botTargetX = rand(110, CONFIG.WORLD_W - 110);
      p.botTargetY = rand(110, CONFIG.WORLD_H - 110);
    }

    let tx = p.botTargetX - p.x;
    let ty = p.botTargetY - p.y;
    let nearest = null;
    let best = 1e9;
    for (const q of players.values()) {
      if (!q.alive || q.id === p.id) continue;
      const d = len(q.x - p.x, q.y - p.y);
      if (d < best) {
        best = d;
        nearest = q;
      }
    }
    if (nearest && best < 220 && Math.random() < 0.34) {
      const vx = Math.cos(nearest.angle);
      const vy = Math.sin(nearest.angle);
      tx += -vy * 190;
      ty += vx * 190;
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
  p.angle = angleLerp(p.angle, p.desiredAngle, clamp(dt * CONFIG.BOT_TURN_RATE, 0, 1));
  p.boost = false;
  p.throttle = 1;
}

function updateHuman(p, dt) {
  const input = p.input || { ix: 0, iy: 0, boost: false };
  const mag = clamp(Math.hypot(input.ix, input.iy), 0, 1);
  if (mag > 0.06) {
    const target = Math.atan2(input.iy, input.ix);
    const turnMul = input.boost ? 0.82 : 1;
    p.angle = angleLerp(p.angle, target, clamp(dt * CONFIG.TURN_RATE * turnMul, 0, 1));
  }
  p.boost = !!input.boost;
  p.throttle = clamp(0.55 + mag * 0.6, 0.55, 1.15);
}

function ensureBots(now) {
  const botAlive = [...players.values()].filter((p) => p.bot).length;
  for (let i = botAlive; i < CONFIG.BOT_COUNT; i++) {
    const id = `bot-${i + 1}`;
    const p = {
      id,
      bot: true,
      name: `BOT-${i + 1}`,
      color: COLORS[nextColor++ % COLORS.length],
      speed: CONFIG.BOT_SPEED,
      radius: CONFIG.RADIUS,
      alive: true,
      kills: 0,
      deaths: 0,
      survival: 0,
      desiredAngle: rand(-Math.PI, Math.PI),
      input: null,
      x: 0,
      y: 0,
      angle: 0,
      spawnInvulnUntil: 0,
      respawnAt: 0,
      lastTrailX: 0,
      lastTrailY: 0,
      botThinkAt: 0,
      botTargetX: 0,
      botTargetY: 0,
      throttle: 1,
      boost: false,
    };
    spawnPlayer(p, now);
    players.set(id, p);
  }
}

function tick(now, dt) {
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i];
    if (!s.solid && now >= s.solidAt) s.solid = true;
    if (now >= s.expireAt) segments.splice(i, 1);
  }

  for (const p of players.values()) {
    if (!p.alive) {
      if (now >= p.respawnAt) spawnPlayer(p, now);
      continue;
    }

    p.survival += dt;
    if (p.bot) updateBot(p, now, dt);
    else updateHuman(p, dt);

    const speed = p.speed * p.throttle * (p.boost ? 1.18 : 1);
    p.x += Math.cos(p.angle) * speed * dt;
    p.y += Math.sin(p.angle) * speed * dt;

    if (p.x < 0 || p.x > CONFIG.WORLD_W || p.y < 0 || p.y > CONFIG.WORLD_H) {
      killPlayer(p, now, null);
      continue;
    }

    if (len(p.x - p.lastTrailX, p.y - p.lastTrailY) >= CONFIG.SEGMENT_MIN_DIST) {
      addSegment(p, p.lastTrailX, p.lastTrailY, p.x, p.y, now);
      p.lastTrailX = p.x;
      p.lastTrailY = p.y;
    }

    if (now < p.spawnInvulnUntil) continue;
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (!s.solid) continue;
      const d = pointSegmentDist(p.x, p.y, s.x1, s.y1, s.x2, s.y2);
      if (d <= p.radius) {
        killPlayer(p, now, s.ownerId);
        break;
      }
    }
  }
}

function buildSnapshot(now) {
  const playerList = [...players.values()].map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    x: p.x,
    y: p.y,
    angle: p.angle,
    alive: p.alive,
    invuln: p.alive ? Math.max(0, p.spawnInvulnUntil - now) : 0,
    respawnIn: !p.alive ? Math.max(0, p.respawnAt - now) : 0,
    kills: p.kills,
    deaths: p.deaths,
    survival: p.survival,
    bot: p.bot,
    radius: p.radius,
  }));

  const leaderboard = [...playerList]
    .sort((a, b) => b.survival - a.survival)
    .slice(0, 8)
    .map((p) => ({ id: p.id, name: p.name, survival: p.survival, kills: p.kills }));

  return {
    t: "state",
    now,
    world: { w: CONFIG.WORLD_W, h: CONFIG.WORLD_H },
    config: {
      ghostDelay: CONFIG.GHOST_DELAY,
      ttl: CONFIG.SEGMENT_TTL,
      respawnDelay: CONFIG.RESPAWN_DELAY,
    },
    players: playerList,
    segments,
    leaderboard,
  };
}

function sendJson(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/ping") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, now: Date.now() }));
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const unsafePath = path.join(WEB_DIR, pathname);
  const safePath = path.normalize(unsafePath);
  if (!safePath.startsWith(WEB_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(safePath, (err, stat) => {
    if (!err && stat.isFile()) {
      fs.readFile(safePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Internal Error");
          return;
        }
        const ext = path.extname(safePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      });
      return;
    }
    fs.readFile(path.join(WEB_DIR, "index.html"), (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not Found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  });
});

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  sockets.set(ws, { playerId: null });
  sendJson(ws, {
    t: "welcome",
    config: {
      worldW: CONFIG.WORLD_W,
      worldH: CONFIG.WORLD_H,
      ghostDelay: CONFIG.GHOST_DELAY,
      ttl: CONFIG.SEGMENT_TTL,
      respawnDelay: CONFIG.RESPAWN_DELAY,
    },
  });

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    const session = sockets.get(ws);
    if (!session) return;

    if (msg.t === "join") {
      if (!session.playerId) {
        const id = `p-${nextHumanId++}`;
        const now = nowSec();
        const nick = (String(msg.nick || "Pilot").trim().slice(0, 16) || "Pilot");
        const p = {
          id,
          bot: false,
          name: nick,
          color: COLORS[nextColor++ % COLORS.length],
          speed: CONFIG.HUMAN_SPEED,
          radius: CONFIG.RADIUS,
          alive: true,
          kills: 0,
          deaths: 0,
          survival: 0,
          desiredAngle: rand(-Math.PI, Math.PI),
          input: { ix: 0, iy: 0, boost: false },
          x: 0,
          y: 0,
          angle: 0,
          spawnInvulnUntil: 0,
          respawnAt: 0,
          lastTrailX: 0,
          lastTrailY: 0,
          botThinkAt: 0,
          botTargetX: 0,
          botTargetY: 0,
          throttle: 1,
          boost: false,
        };
        spawnPlayer(p, now);
        players.set(id, p);
        session.playerId = id;
        sendJson(ws, { t: "joined", youId: id, name: nick, color: p.color });
      } else {
        const p = players.get(session.playerId);
        if (p) p.name = (String(msg.nick || p.name).trim().slice(0, 16) || p.name);
      }
      return;
    }

    if (msg.t === "input") {
      if (!session.playerId) return;
      const p = players.get(session.playerId);
      if (!p) return;
      p.input = {
        ix: clamp(Number(msg.ix || 0), -1, 1),
        iy: clamp(Number(msg.iy || 0), -1, 1),
        boost: !!msg.boost,
      };
    }
  });

  ws.on("close", () => {
    const session = sockets.get(ws);
    if (session && session.playerId) {
      removeTrailByOwner(session.playerId);
      players.delete(session.playerId);
    }
    sockets.delete(ws);
  });
});

ensureBots(nowSec());
let lastTick = nowSec();
setInterval(() => {
  const now = nowSec();
  const dt = Math.min(0.08, now - lastTick);
  lastTick = now;
  ensureBots(now);
  tick(now, dt);
}, Math.round(1000 / CONFIG.SIM_HZ));

setInterval(() => {
  const now = nowSec();
  const snapBody = JSON.stringify(buildSnapshot(now));
  for (const [ws, session] of sockets.entries()) {
    if (ws.readyState !== ws.OPEN) continue;
    ws.send(JSON.stringify({ t: "you", id: session.playerId }));
    ws.send(snapBody);
  }
}, Math.round(1000 / CONFIG.SNAP_HZ));

server.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
