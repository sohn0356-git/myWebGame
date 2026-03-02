const root = document.getElementById("root") || document.body;
root.innerHTML = "";

function mk(tag, style = "") {
  const el = document.createElement(tag);
  if (style) el.style.cssText = style;
  return el;
}

const BUILD_ORDER = ["RELAY", "MEDBAY", "BARRACKS", "WORKSHOP", "REACTOR", "SIEGEWORKS", "CANNON", "MISSILE", "ARTILLERY"];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

const wrap = mk("div", "position:fixed;inset:0;background:#050912;overflow:hidden;color:#e8f2ff;font-family:Segoe UI,Arial,sans-serif");
const canvas = mk("canvas", "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none");
const hud = mk("div", "position:absolute;left:10px;top:10px;z-index:8;font-size:12px;line-height:1.4;white-space:pre-wrap;pointer-events:none;text-shadow:0 1px 0 #000");
const right = mk("div", "position:absolute;right:10px;top:10px;z-index:8;font-size:12px;line-height:1.4;white-space:pre-wrap;pointer-events:none;text-align:right;text-shadow:0 1px 0 #000");
const info = mk("div", "position:absolute;left:10px;bottom:220px;z-index:8;font-size:12px;line-height:1.4;white-space:pre-wrap;pointer-events:none;text-shadow:0 1px 0 #000;max-width:min(64vw,560px)");
const banner = mk("div", "position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:9;padding:8px 12px;border-radius:10px;background:rgba(18,50,92,.85);display:none;font-size:12px;font-weight:700");
const center = mk("div", "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:9;font-size:30px;font-weight:900;pointer-events:none;text-shadow:0 2px 0 #000");
const buildPanel = mk("div", "position:absolute;left:10px;top:110px;z-index:10;display:flex;gap:6px;flex-direction:column;align-items:stretch;width:min(42vw,320px);max-height:calc(100vh - 340px);overflow:auto;padding:8px;border-radius:10px;background:rgba(9,15,26,.58);border:1px solid rgba(105,145,210,.35)");
const actionPanel = mk("div", "position:absolute;right:10px;bottom:10px;z-index:10;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;width:min(96vw,520px)");

const overlay = mk("div", "position:absolute;inset:0;z-index:11;display:flex;align-items:center;justify-content:center;background:rgba(8,13,22,.28)");
const card = mk("div", "width:min(520px,92vw);padding:16px;border-radius:14px;border:1px solid rgba(120,170,230,.55);background:rgba(11,18,31,.64);backdrop-filter:blur(3px)");
card.innerHTML = `<div style="font-size:20px;font-weight:900">Crystal Core Hunt Online</div>
<div style="margin-top:6px;color:#b7cff5;font-size:12px">최대 8명 동시 플레이. 빈 슬롯은 봇으로 자동 대체.</div>`;
const nick = mk("input", "margin-top:10px;width:100%;padding:10px;border-radius:10px;border:1px solid #4b6899;background:rgba(7,12,20,.82);color:#eef6ff;outline:none");
nick.maxLength = 16;
nick.value = "Commander";
const startBtn = mk("button", "margin-top:10px;width:100%;padding:10px;border-radius:10px;border:1px solid #8ab4ff;background:rgba(30,50,84,.9);color:#fff;font-weight:800;cursor:pointer");
startBtn.textContent = "Start Online";
card.append(nick, startBtn);
overlay.append(card);

wrap.append(canvas, hud, right, info, banner, center, buildPanel, actionPanel, overlay);
root.append(wrap);

const ctx = canvas.getContext("2d");
let W = 1280;
let H = 720;
function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = innerWidth;
  H = innerHeight;
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
addEventListener("resize", resize);

const state = {
  connected: false,
  myId: "",
  placingType: "",
  selectedBuildingId: "",
  artilleryMoveMode: false,
  rallyMode: false,
  camX: 0,
  camY: 0,
  drag: false,
  dragStartX: 0,
  dragStartY: 0,
  camStartX: 0,
  camStartY: 0,
  pointerX: 0,
  pointerY: 0,
  initCamera: false,
  world: {
    cfg: { worldW: 3200, worldH: 3200, buildSnap: 20, limits: {}, buildingDefs: {}, unitDefs: {} },
    me: null,
    players: [],
    buildings: [],
    units: [],
    monsters: [],
    guardians: [],
    central: { x: 1600, y: 1600, hp: 1, hpMax: 1, r: 64, lastHitOwner: "" },
    match: { over: false, winnerId: "", reason: "", winnerName: "" },
  },
  bannerUntil: 0,
  time: 0,
};

function showBanner(text, sec = 1.4) {
  banner.textContent = text;
  banner.style.display = "block";
  state.bannerUntil = state.time + sec;
}

function wsUrl() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}/ws`;
}

let ws = null;
function connect(name) {
  ws = new WebSocket(wsUrl());
  ws.addEventListener("open", () => {
    state.connected = true;
    ws.send(JSON.stringify({ type: "join", name }));
  });
  ws.addEventListener("close", () => {
    state.connected = false;
    showBanner("Disconnected from server", 2.2);
  });
  ws.addEventListener("message", (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.type === "welcome") {
      state.myId = msg.playerId;
      showBanner(`Connected. Slot ${msg.slot + 1}/${msg.maxPlayers}`);
      return;
    }
    if (msg.type === "snapshot") {
      state.world = msg;
      const me = msg.me;
      if (me && !state.initCamera) {
        const hq = msg.buildings.find((b) => b.ownerId === me.id && b.type === "HQ" && b.hp > 0);
        if (hq) {
          state.camX = clamp(hq.x - W * 0.5, 0, Math.max(0, msg.cfg.worldW - W));
          state.camY = clamp(hq.y - H * 0.5, 0, Math.max(0, msg.cfg.worldH - H));
          state.initCamera = true;
        }
      }
      rebuildBuildButtons();
    }
  });
}

function send(obj) {
  if (!ws || ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(obj));
}

function screenToWorld(sx, sy) {
  return { x: sx + state.camX, y: sy + state.camY };
}

function meObj() { return state.world.me; }

function playersById() {
  const m = new Map();
  for (const p of state.world.players) m.set(p.id, p);
  return m;
}

function myBuildings() {
  const me = meObj();
  if (!me) return [];
  return state.world.buildings.filter((b) => b.ownerId === me.id && b.hp > 0);
}

function selectedBuilding() {
  return state.world.buildings.find((b) => b.id === state.selectedBuildingId && b.hp > 0) || null;
}

function ownBuildingAt(x, y) {
  const me = meObj();
  if (!me) return null;
  for (const b of state.world.buildings) {
    if (b.ownerId !== me.id || b.hp <= 0) continue;
    const s = state.world.cfg.buildingDefs[b.type]?.size || 20;
    if (dist(x, y, b.x, b.y) <= s + 6) return b;
  }
  return null;
}

function ownedCount(type) {
  const me = meObj();
  if (!me) return 0;
  return state.world.buildings.filter((b) => b.ownerId === me.id && b.type === type && b.hp > 0).length;
}

function hasOwnedType(type) {
  return ownedCount(type) > 0;
}

function canBuildLocal(type) {
  const me = meObj();
  const def = state.world.cfg.buildingDefs[type];
  if (!me || !def) return { ok: false, reason: "not ready" };
  if (!me.alive) return { ok: false, reason: "you are dead" };
  const limit = state.world.cfg.limits[type] || 99;
  const cur = ownedCount(type);
  if (cur >= limit) return { ok: false, reason: `limit ${cur}/${limit}` };
  if (me.money < def.cost) return { ok: false, reason: "not enough money" };
  const req = def.prereq || [];
  for (const need of req) {
    if (!hasOwnedType(need)) return { ok: false, reason: `need ${need}` };
  }
  return { ok: true, reason: "" };
}

function canPlaceAtLocal(type, x, y) {
  const me = meObj();
  const def = state.world.cfg.buildingDefs[type];
  if (!me || !def) return { ok: false, reason: "not ready" };
  const base = canBuildLocal(type);
  if (!base.ok) return base;
  if (x < 20 || y < 20 || x > state.world.cfg.worldW - 20 || y > state.world.cfg.worldH - 20) {
    return { ok: false, reason: "out of bounds" };
  }

  const own = myBuildings();
  const inTerritory = own.some((b) => {
    const r = state.world.cfg.buildingDefs[b.type]?.radius || 180;
    return dist(x, y, b.x, b.y) <= r;
  });
  if (!inTerritory) return { ok: false, reason: "outside territory" };

  const size = def.size || 20;
  for (const b of state.world.buildings) {
    if (b.hp <= 0) continue;
    const os = state.world.cfg.buildingDefs[b.type]?.size || 20;
    if (dist(x, y, b.x, b.y) < size + os + 8) return { ok: false, reason: "blocked" };
  }
  const c = state.world.central;
  if (dist(x, y, c.x, c.y) < size + c.r + 24) return { ok: false, reason: "too close to central" };

  return { ok: true, reason: "" };
}

function rebuildBuildButtons() {
  buildPanel.innerHTML = "";
  const me = meObj();
  if (!me) return;
  const title = mk("div", "font-size:12px;font-weight:800;color:#d7e8ff;letter-spacing:.02em;padding:2px 2px 6px 2px;border-bottom:1px solid rgba(110,146,207,.35);margin-bottom:4px");
  title.textContent = "BUILDINGS";
  buildPanel.append(title);
  for (let i = 0; i < BUILD_ORDER.length; i++) {
    const type = BUILD_ORDER[i];
    const def = state.world.cfg.buildingDefs[type];
    if (!def) continue;
    const cur = ownedCount(type);
    const limit = state.world.cfg.limits[type] || 99;
    const chk = canBuildLocal(type);
    const btn = mk("button", "padding:8px 10px;border-radius:10px;border:1px solid #4d6b99;background:rgba(11,20,34,.9);color:#e9f2ff;cursor:pointer;font-size:12px;text-align:left");
    if (!chk.ok) {
      btn.style.opacity = "0.45";
      btn.style.cursor = "not-allowed";
    }
    if (state.placingType === type) btn.style.borderColor = "#9fd0ff";
    btn.textContent = `${i + 1}. ${type}  ${cur}/${limit}  (${def.cost})`;
    btn.title = `${def.trait || ""}${chk.ok ? "" : ` | ${chk.reason}`}`;
    btn.disabled = !chk.ok;
    if (!chk.ok) btn.style.pointerEvents = "none";
    btn.onclick = () => {
      if (!chk.ok) {
        showBanner(`${type}: ${chk.reason}`);
        return;
      }
      state.placingType = state.placingType === type ? "" : type;
      state.artilleryMoveMode = false;
      state.rallyMode = false;
      showBanner(state.placingType ? `Build mode: ${state.placingType} (tap map)` : "Build mode canceled");
      rebuildBuildButtons();
      rebuildActionButtons();
    };
    buildPanel.append(btn);
  }
}

function rebuildActionButtons() {
  actionPanel.innerHTML = "";

  const moveBtn = mk("button", "padding:8px 10px;border-radius:10px;border:1px solid #759cd3;background:rgba(22,38,63,.92);color:#f2f7ff;cursor:pointer;font-size:12px");
  moveBtn.textContent = state.artilleryMoveMode ? "Cancel Move" : "Move Artillery";
  moveBtn.onclick = () => {
    const sel = selectedBuilding();
    if (!sel || sel.type !== "ARTILLERY") {
      showBanner("Select your ARTILLERY first");
      return;
    }
    state.artilleryMoveMode = !state.artilleryMoveMode;
    if (state.artilleryMoveMode) state.rallyMode = false;
    showBanner(state.artilleryMoveMode ? "Tap map to move artillery" : "Move canceled");
    rebuildActionButtons();
  };
  actionPanel.append(moveBtn);

  const rallyBtn = mk("button", "padding:8px 10px;border-radius:10px;border:1px solid #9dbf7a;background:rgba(38,62,33,.9);color:#efffea;cursor:pointer;font-size:12px");
  rallyBtn.textContent = state.rallyMode ? "Cancel Rally" : "Rally All Units";
  rallyBtn.onclick = () => {
    const sel = selectedBuilding();
    if (!sel || sel.type !== "ARTILLERY") {
      showBanner("Select your ARTILLERY first");
      return;
    }
    state.rallyMode = !state.rallyMode;
    if (state.rallyMode) state.artilleryMoveMode = false;
    showBanner(state.rallyMode ? "Tap map to rally all units" : "Rally canceled");
    rebuildActionButtons();
  };
  actionPanel.append(rallyBtn);
}

canvas.addEventListener("pointerdown", (e) => {
  state.pointerX = e.clientX;
  state.pointerY = e.clientY;
  state.drag = true;
  state.dragStartX = e.clientX;
  state.dragStartY = e.clientY;
  state.camStartX = state.camX;
  state.camStartY = state.camY;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  state.pointerX = e.clientX;
  state.pointerY = e.clientY;
  if (!state.drag) return;
  const dx = e.clientX - state.dragStartX;
  const dy = e.clientY - state.dragStartY;
  state.camX = clamp(state.camStartX - dx, 0, Math.max(0, state.world.cfg.worldW - W));
  state.camY = clamp(state.camStartY - dy, 0, Math.max(0, state.world.cfg.worldH - H));
});

canvas.addEventListener("pointerup", (e) => {
  if (!state.drag) return;
  const moved = Math.hypot(e.clientX - state.dragStartX, e.clientY - state.dragStartY) > 16;
  state.drag = false;
  canvas.releasePointerCapture(e.pointerId);
  if (moved) return;

  const w = screenToWorld(e.clientX, e.clientY);
  const snap = state.world.cfg.buildSnap || 20;
  const x = Math.round(w.x / snap) * snap;
  const y = Math.round(w.y / snap) * snap;

  if (state.placingType) {
    const ok = canPlaceAtLocal(state.placingType, x, y);
    if (!ok.ok) {
      showBanner(`Cannot build: ${ok.reason}`);
      return;
    }
    send({ type: "build", buildingType: state.placingType, x, y });
    return;
  }

  const own = ownBuildingAt(w.x, w.y);
  if (own) {
    state.selectedBuildingId = own.id;
    state.artilleryMoveMode = false;
    state.rallyMode = false;
    rebuildActionButtons();
    showBanner(`${own.type} selected`);
    return;
  }

  if (state.artilleryMoveMode) {
    const sel = selectedBuilding();
    if (sel && sel.type === "ARTILLERY") {
      send({ type: "move_artillery", buildingId: sel.id, x, y });
      state.artilleryMoveMode = false;
      rebuildActionButtons();
      return;
    }
  }

  if (state.rallyMode) {
    const sel = selectedBuilding();
    if (sel && sel.type === "ARTILLERY") {
      send({ type: "rally_all", buildingId: sel.id, x, y });
      state.rallyMode = false;
      rebuildActionButtons();
      return;
    }
  }

  state.selectedBuildingId = "";
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const sel = selectedBuilding();
  if (!sel || sel.type !== "ARTILLERY") return;
  const w = screenToWorld(e.clientX, e.clientY);
  send({ type: "move_artillery", buildingId: sel.id, x: w.x, y: w.y });
});

function drawBar(x, y, w, h, ratio, fg, bg = "rgba(0,0,0,.4)") {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fg;
  ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);
}

function levelForOwner(ownerId, pmap) {
  return pmap.get(ownerId)?.level || 1;
}

function drawBuildingVisual(b, x, y, s, own, ownerLv) {
  const pixelPal = {
    HQ: { a: "#66f1c9", b: "#1f7f67", c: "#d9fff4" },
    RELAY: { a: "#8fdcff", b: "#315f8f", c: "#ebf9ff" },
    MEDBAY: { a: "#8dffc1", b: "#2d8058", c: "#f2fff8" },
    BARRACKS: { a: "#90beff", b: "#35558f", c: "#e9f3ff" },
    WORKSHOP: { a: "#ffd29c", b: "#8b5f31", c: "#fff2e0" },
    REACTOR: { a: "#c2a7ff", b: "#5f4a93", c: "#efe7ff" },
    SIEGEWORKS: { a: "#dcbaff", b: "#74559e", c: "#f6ecff" },
    CANNON: { a: "#ff9db5", b: "#8f3d50", c: "#ffe7ee" },
    MISSILE: { a: "#ffdc96", b: "#8f6a3c", c: "#fff4dd" },
    ARTILLERY: { a: "#ffbe98", b: "#965334", c: "#fff0e4" },
  };
  const pal = pixelPal[b.type] || pixelPal.RELAY;
  const lvScale = 1 + (ownerLv - 1) * 0.03;
  const ss = s * lvScale;
  const px = Math.max(2, Math.floor(ss / 5));
  const ox = Math.round(x - px * 4);
  const oy = Math.round(y - px * 4);
  const sprite = {
    HQ: ["..1111..",".122221.","12222221","12233221","12233221","12222221",".122221.","..1111.."],
    RELAY: ["...11...","..1221..",".122221.","12233221","12233221",".122221.","..1221..","...11..."],
    MEDBAY: ["...11...","..1111..",".122221.","11233211","11233211",".122221.","..1111..","...11..."],
    BARRACKS: ["11111111","12222221","12233221","12233221","12222221","12333321","12222221","11111111"],
    WORKSHOP: ["11111111","12222221","12333221","12222221","12222221","12233321","12222221","11111111"],
    REACTOR: [".111111.","12222221","12333321","12322321","12322321","12333321","12222221",".111111."],
    SIEGEWORKS: ["11111111","12222221","12333221","12222221","12222221","12333321","12333321","11111111"],
    CANNON: ["11111111","12222221","12222221","12233221","12222221","12222221","12222221","11111111"],
    MISSILE: ["11111111","12222221","12222221","12233221","12233221","12222221","12222221","11111111"],
    ARTILLERY: ["11111111","12222221","12222221","12333321","12222221","12222221","12222221","11111111"],
  }[b.type] || ["11111111","12222221","12222221","12222221","12222221","12222221","12222221","11111111"];

  for (let ry = 0; ry < 8; ry++) {
    for (let rx = 0; rx < 8; rx++) {
      const ch = sprite[ry][rx];
      if (ch === ".") continue;
      ctx.fillStyle = ch === "1" ? pal.a : ch === "2" ? pal.b : pal.c;
      ctx.fillRect(ox + rx * px, oy + ry * px, px, px);
    }
  }
  ctx.strokeStyle = own ? "rgba(238,255,232,.95)" : "rgba(255,255,255,.6)";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(ox - 1, oy - 1, px * 8 + 2, px * 8 + 2);

  if (b.type === "CANNON" || b.type === "MISSILE" || b.type === "ARTILLERY") {
    ctx.strokeStyle = "#f8f5e8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + ss + 8, y - ss * 0.3);
    ctx.stroke();
  }
}

function drawUnit(u, x, y, own, ownerLv) {
  const boost = 1 + (ownerLv - 1) * 0.04;
  const r = (u.r || 8) * boost;
  if (u.type === "INFANTRY") {
    ctx.fillStyle = own ? "#99f1ff" : "#ffdcae";
    ctx.fillRect(x - r * 0.72, y - r * 0.75, r * 1.44, r * 1.7);
    ctx.fillStyle = "#e7fbff";
    ctx.beginPath(); ctx.arc(x, y - r * 1.05, r * 0.52, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = own ? "#1f5064" : "#5d3e27";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + r * 0.5, y - r * 0.2); ctx.lineTo(x + r * 1.35, y - r * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + r * 1.35, y - r * 0.8); ctx.lineTo(x + r * 1.32, y + r * 0.5); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillRect(x - r * 0.2, y + r * 0.2, r * 0.4, r * 0.45);
  } else if (u.type === "CAVALRY") {
    ctx.fillStyle = own ? "#6ff5cf" : "#ffc08f";
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.65, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e7fbff";
    ctx.beginPath(); ctx.arc(x + r * 0.85, y - r * 0.75, r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = own ? "#16644f" : "#7a4c2e";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + r * 0.2, y - r * 0.2); ctx.lineTo(x + r * 1.6, y - r * 1.2); ctx.stroke();
    ctx.fillStyle = "rgba(240,255,250,.78)";
    ctx.fillRect(x - r * 0.6, y - r * 0.25, r * 0.55, r * 0.32);
    ctx.fillRect(x - r * 0.2, y - r * 0.25, r * 0.55, r * 0.32);
  } else {
    ctx.fillStyle = own ? "#c6c7ff" : "#ffc4b8";
    ctx.fillRect(x - r * 1.25, y - r * 0.9, r * 2.5, r * 1.8);
    ctx.fillStyle = "rgba(42,28,69,.9)";
    ctx.fillRect(x + r * 0.8, y - r * 0.25, r * 1.15, r * 0.5);
    ctx.strokeStyle = "rgba(20,16,36,.9)";
    ctx.strokeRect(x - r * 1.25, y - r * 0.9, r * 2.5, r * 1.8);
    ctx.strokeRect(x + r * 0.8, y - r * 0.25, r * 1.15, r * 0.5);
  }
}

function drawMonster(m, x, y) {
  const r = m.r || 12;
  ctx.fillStyle = m.archetype === "Brute" ? "#ffb08a" : m.archetype === "Crawler" ? "#b4f29a" : "#8ac0ff";
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.86, y - r * 0.2);
  ctx.lineTo(x + r * 0.68, y + r * 0.72);
  ctx.lineTo(x, y + r * 0.9);
  ctx.lineTo(x - r * 0.68, y + r * 0.72);
  ctx.lineTo(x - r * 0.86, y - r * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(8,12,22,.9)";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.2, Math.max(2, r * 0.15), 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.24, y - r * 0.18, Math.max(2, r * 0.15), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a0e15";
  ctx.beginPath(); ctx.arc(x - r * 0.26, y - r * 0.2, Math.max(1, r * 0.07), 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.22, y - r * 0.18, Math.max(1, r * 0.07), 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,245,190,.9)";
  ctx.beginPath(); ctx.moveTo(x - r * 0.3, y - r * 0.95); ctx.lineTo(x - r * 0.05, y - r * 1.35); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r * 0.24, y - r * 0.9); ctx.lineTo(x + r * 0.46, y - r * 1.2); ctx.stroke();
}

function drawGuardian(g, x, y) {
  const r = g.r || 14;
  ctx.fillStyle = "#ff5a7c";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffe0ea";
  ctx.stroke();
  ctx.fillStyle = "#310015";
  ctx.beginPath();
  ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  state.time += 1 / 60;
  if (banner.style.display === "block" && state.time > state.bannerUntil) banner.style.display = "none";

  const world = state.world;
  const pmap = playersById();

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#081021");
  bg.addColorStop(1, "#040a15");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(122,152,212,.1)";
  for (let x = -state.camX % 50; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -state.camY % 50; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.strokeRect(-state.camX, -state.camY, world.cfg.worldW, world.cfg.worldH);

  for (const b of myBuildings()) {
    const def = world.cfg.buildingDefs[b.type];
    if (!def) continue;
    const x = b.x - state.camX;
    const y = b.y - state.camY;
    ctx.strokeStyle = "rgba(98,217,255,.2)";
    ctx.fillStyle = "rgba(98,217,255,.05)";
    ctx.beginPath();
    ctx.arc(x, y, def.radius || 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const ex = world.central.x - state.camX;
  const ey = world.central.y - state.camY;
  ctx.fillStyle = "#9d5fff";
  ctx.beginPath(); ctx.arc(ex, ey, world.central.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#efe3ff";
  ctx.stroke();
  drawBar(ex - 80, ey + world.central.r + 8, 160, 7, world.central.hp / world.central.hpMax, "#ff8aaf");
  ctx.fillStyle = "#f2e8ff";
  ctx.font = "11px Segoe UI";
  ctx.fillText("CENTRAL PYLON", ex - 46, ey - world.central.r - 10);

  for (const b of world.buildings) {
    if (b.hp <= 0) continue;
    const x = b.x - state.camX;
    const y = b.y - state.camY;
    const s = world.cfg.buildingDefs[b.type]?.size || 20;
    if (x < -80 || y < -80 || x > W + 80 || y > H + 80) continue;
    const own = world.me && b.ownerId === world.me.id;
    const ownerLv = levelForOwner(b.ownerId, pmap);
    drawBuildingVisual(b, x, y, s, own, ownerLv);
    drawBar(x - s, y + s + 4, s * 2, 4, b.hp / b.hpMax, own ? "#95ffd7" : "#b6d2ff");
    if (b.id === state.selectedBuildingId) {
      ctx.strokeStyle = "#fff29a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - s - 3, y - s - 3, s * 2 + 6, s * 2 + 6);
    }
  }

  for (const u of world.units) {
    const x = u.x - state.camX;
    const y = u.y - state.camY;
    if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    const own = world.me && u.ownerId === world.me.id;
    const ownerLv = levelForOwner(u.ownerId, pmap);
    drawUnit(u, x, y, own, ownerLv);
  }

  for (const g of world.guardians || []) {
    const x = g.x - state.camX;
    const y = g.y - state.camY;
    if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
    drawGuardian(g, x, y);
    drawBar(x - 16, y - (g.r || 14) - 9, 32, 4, g.hp / g.hpMax, "#ffb7c8");
  }

  for (const m of world.monsters) {
    const x = m.x - state.camX;
    const y = m.y - state.camY;
    if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
    let closeFight = false;
    for (const b of world.buildings) {
      if (b.hp <= 0) continue;
      if (dist(m.x, m.y, b.x, b.y) < (m.r || 12) + (world.cfg.buildingDefs[b.type]?.size || 20) + 10) {
        closeFight = true;
        break;
      }
    }
    drawMonster(m, x, y);
    if (closeFight) {
      const t = state.time * 18;
      ctx.strokeStyle = "rgba(255,95,95,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(t) * 10, y + Math.sin(t) * 10);
      ctx.lineTo(x + Math.cos(t + 1.2) * 18, y + Math.sin(t + 1.2) * 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(t + 2.1) * 8, y + Math.sin(t + 2.1) * 8);
      ctx.lineTo(x + Math.cos(t + 2.9) * 16, y + Math.sin(t + 2.9) * 16);
      ctx.stroke();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#ff6d6d";
      ctx.beginPath();
      ctx.arc(x, y, (m.r || 12) + 8 + Math.sin(state.time * 8) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawBar(x - 13, y - (m.r || 12) - 8, 26, 4, m.hp / m.hpMax, "#ffe1a8");
  }

  if (state.placingType && world.cfg.buildingDefs[state.placingType]) {
    const def = world.cfg.buildingDefs[state.placingType];
    const w = screenToWorld(state.pointerX, state.pointerY);
    const snap = world.cfg.buildSnap || 20;
    const px = Math.round(w.x / snap) * snap;
    const py = Math.round(w.y / snap) * snap;
    const sx = px - state.camX;
    const sy = py - state.camY;
    const chk = canBuildLocal(state.placingType);
    ctx.fillStyle = chk.ok ? "rgba(106,240,172,.35)" : "rgba(255,117,117,.35)";
    ctx.strokeStyle = chk.ok ? "#b2ffd4" : "#ffc4c4";
    const s = def.size || 20;
    ctx.fillRect(sx - s, sy - s, s * 2, s * 2);
    ctx.strokeRect(sx - s, sy - s, s * 2, s * 2);
  }

  const mm = Math.min(220, Math.max(150, Math.floor(H * 0.25)));
  const mx = 10;
  const my = H - mm - 10;
  ctx.fillStyle = "rgba(8,14,24,.74)";
  ctx.fillRect(mx, my, mm, mm);
  ctx.strokeStyle = "rgba(170,197,238,.7)";
  ctx.strokeRect(mx, my, mm, mm);
  const sx = mm / world.cfg.worldW;
  const sy = mm / world.cfg.worldH;
  for (const b of world.buildings) {
    if (b.hp <= 0) continue;
    const own = world.me && b.ownerId === world.me.id;
    ctx.fillStyle = own ? "#9fffd9" : "#9ab9ff";
    ctx.fillRect(mx + b.x * sx - 1.5, my + b.y * sy - 1.5, 3, 3);
  }
  for (const g of world.guardians || []) {
    ctx.fillStyle = "#ff7da0";
    ctx.fillRect(mx + g.x * sx - 1.5, my + g.y * sy - 1.5, 3, 3);
  }
  for (const m of world.monsters) {
    ctx.fillStyle = "#d3e3ff";
    ctx.fillRect(mx + m.x * sx - 1, my + m.y * sy - 1, 2, 2);
  }
  ctx.fillStyle = "#ca9fff";
  ctx.fillRect(mx + world.central.x * sx - 3, my + world.central.y * sy - 3, 6, 6);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(mx + state.camX * sx, my + state.camY * sy, W * sx, H * sy);

  const me = world.me;
  hud.textContent = me
    ? `Online RTS\nMoney: ${Math.floor(me.money)}\nLevel: ${me.level}\nBuild: ${state.placingType || "-"}\nAlive: ${me.alive ? "YES" : "NO"}\nConnection: ${state.connected ? "OK" : "OFF"}\nBuild list: left panel | Minimap: left-bottom`
    : "Connecting...";

  right.textContent = `PLAYERS (${world.players.length}/8)\n${world.players
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((p) => `${p.slot + 1}. ${p.name}${p.isBot ? " [BOT]" : ""}${p.alive ? "" : " [DEAD]"}`)
    .join("\n")}`;

  const sel = selectedBuilding();
  if (sel) {
    const def = world.cfg.buildingDefs[sel.type] || {};
    const limit = world.cfg.limits[sel.type] || 99;
    info.textContent = `Selected: ${sel.type}\nHP: ${Math.floor(sel.hp)} / ${sel.hpMax}\nTrait: ${def.trait || "-"}\nCost: ${def.cost || 0}\nLimit: ${ownedCount(sel.type)} / ${limit}\nPrereq: ${(def.prereq || []).join(", ") || "none"}`;
  } else {
    info.textContent = "Build flow: pick a building from LEFT list (enabled only), then tap map.\nFinal command: select ARTILLERY -> Rally All Units -> tap target point.";
  }

  if (world.match?.over) {
    const won = me && world.match.winnerId === me.id;
    center.textContent = won ? `VICTORY (${world.match.reason})` : `DEFEAT - ${world.match.winnerName || "Unknown"} won`;
  } else {
    center.textContent = "";
  }

  rebuildActionButtons();
  requestAnimationFrame(render);
}

function startGame() {
  overlay.style.display = "none";
  connect((nick.value || "Commander").trim().slice(0, 16));
}

startBtn.onclick = startGame;
addEventListener("keydown", (e) => {
  if (overlay.style.display !== "none" && e.code === "Enter") startGame();
});

requestAnimationFrame(render);

