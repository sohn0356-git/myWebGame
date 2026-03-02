const CFG = {
  WORLD_W: 3000,
  WORLD_H: 3000,
  SIM_HZ: 30,
  PLAYERS: 13,
  ATTACK_CD: 0.36,
  DASH_CD: 3.8,
  DASH_TIME: 0.22,
  DASH_MULT: 2.15,
  DOWN_TIME: 3,
  HP: 120,
  ATK: 22,
  DEF: 6,
  SPD: 210,
  CORE_HP: 1200,
  CORE_R: 46,
  CORE_DEF_R: 220,
  CORE_DMG_MUL: 0.6,
  CORE_DEF_REDUCE: 0.3,
  SAFE_TIME: 10,
  SAFE_LEVEL: 3,
  MONSTERS: 48,
  MON_RESPAWN: 4,
  PROJ_SPD: 760,
  PROJ_LIFE: 0.65,
  EXP_BASE: 28,
};

const ROLES = ["farm", "raid", "guard"];
const COLORS = ["#5eead4", "#f472b6", "#60a5fa", "#f59e0b", "#34d399", "#a78bfa", "#f87171", "#22d3ee", "#fb7185", "#84cc16", "#c084fc", "#facc15", "#fb923c"];

const root = document.getElementById("root") || document.body;
root.innerHTML = "";
const wrap = el("div", "position:fixed;inset:0;background:#060b15;overflow:hidden;color:#deebff;font-family:ui-sans-serif,Segoe UI,Arial,sans-serif");
const cvs = el("canvas", "position:absolute;inset:0;width:100%;height:100%;display:block;");
const hud = el("div", "position:absolute;left:12px;top:10px;z-index:5;font-size:12px;line-height:1.45;white-space:pre-wrap;pointer-events:none;text-shadow:0 1px 0 #000");
const board = el("div", "position:absolute;right:12px;top:10px;z-index:5;font-size:12px;line-height:1.45;white-space:pre-wrap;text-align:right;pointer-events:none;text-shadow:0 1px 0 #000");
const banner = el("div", "position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:6;padding:7px 11px;border-radius:8px;font-size:12px;font-weight:700;display:none");
const center = el("div", "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:5;font-size:24px;font-weight:900;pointer-events:none;text-shadow:0 2px 0 #000");
wrap.append(cvs, hud, board, banner, center);
root.append(wrap);

const overlay = el("div", "position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;background:rgba(7,11,18,0.25)");
const panel = el("div", "width:min(460px,92vw);background:rgba(13,21,35,0.58);border:1px solid rgba(116,159,227,0.46);border-radius:14px;padding:16px;backdrop-filter:blur(2px)");
panel.innerHTML = `<div style="font-size:20px;font-weight:900;letter-spacing:.04em;color:#eff6ff;margin-bottom:7px">CRYSTAL CORE HUNT</div>
<div style="font-size:12px;color:#b8cbed;margin-bottom:10px">Defend your Crystal Core, level up, and destroy enemy cores.</div>`;
const nick = el("input", "width:100%;padding:10px;border-radius:10px;border:1px solid #49689a;background:rgba(8,13,20,.75);color:#f0f7ff;outline:none");
nick.placeholder = "Nickname"; nick.maxLength = 16; nick.value = "Hunter";
const startBtn = el("button", "margin-top:11px;width:100%;padding:10px;border-radius:10px;border:1px solid #8fbaff;background:rgba(29,49,80,.9);color:#fff;font-weight:800;cursor:pointer");
startBtn.textContent = "Start Match";
panel.append(nick, startBtn); overlay.append(panel); wrap.append(overlay);

const lvUI = el("div", "position:absolute;left:50%;bottom:24px;transform:translateX(-50%);z-index:7;display:none;width:min(700px,95vw);padding:10px;border-radius:12px;border:1px solid rgba(112,158,230,.5);background:rgba(8,14,24,.82)");
const lvTitle = el("div", "font-size:12px;font-weight:800;color:#dcecff;margin-bottom:8px");
lvTitle.textContent = "LEVEL UP - PICK ONE";
const lvChoices = el("div", "display:grid;grid-template-columns:repeat(3,1fr);gap:8px");
lvUI.append(lvTitle, lvChoices); wrap.append(lvUI);

function el(tag, css) { const n = document.createElement(tag); if (css) n.style.cssText = css; return n; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function len(x, y) { return Math.hypot(x, y); }
function norm(x, y) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }
function wrapA(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
function aLerp(a, b, t) { return a + wrapA(b - a) * t; }
function expNeed(lv) { return CFG.EXP_BASE + lv * 15; }

let audioCtx = null;
function beep(f = 700, d = 0.06, t = "square", v = 0.02) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); const n = audioCtx.currentTime;
    o.type = t; o.frequency.setValueAtTime(f, n); o.frequency.exponentialRampToValueAtTime(Math.max(70, f * 0.8), n + d);
    g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(v, n + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
    o.connect(g); g.connect(audioCtx.destination); o.start(n); o.stop(n + d + 0.01);
  } catch {}
}

const ctx = cvs.getContext("2d");
let W = 1280, H = 720;
function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = innerWidth; H = innerHeight;
  cvs.width = Math.floor(W * dpr); cvs.height = Math.floor(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize(); addEventListener("resize", resize);

const keys = new Set();
const mouse = { x: 0, y: 0, down: false };
addEventListener("keydown", (e) => { keys.add(e.code); if (overlay.style.display !== "none" && e.code === "Enter") startGame(); });
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener("mousedown", () => { mouse.down = true; });
addEventListener("mouseup", () => { mouse.down = false; });

let started = false, over = false, winner = "";
let matchT = 0, idSeed = 1, bannerUntil = 0;
const players = [], cores = [], monsters = [], projs = [], drops = [], fx = [];

function mkPlayer(isBot, role, idx) {
  return { id: `p${idSeed++}`, name: isBot ? `BOT-${idx}` : "Hunter", isBot, role, x: 0, y: 0, angle: rand(-Math.PI, Math.PI), hp: CFG.HP, hpMax: CFG.HP, level: 1, exp: 0, atk: CFG.ATK, def: CFG.DEF, speed: CFG.SPD, coreId: "", eliminated: false, downUntil: 0, spawnInv: 0, atkCd: 0, dashCd: 0, dashUntil: 0, lifesteal: 0, crit: 0, coreMul: 1, coreGuard: 0, exposeUntil: 0, botThink: 0, tx: 0, ty: 0, queue: [] };
}
function mkCore(ownerId, x, y, c) { return { id: `c-${ownerId}`, ownerId, x, y, hp: CFG.CORE_HP, hpMax: CFG.CORE_HP, alive: true, color: c, hitUntil: 0 }; }

function initPlayers() {
  const cx = CFG.WORLD_W * 0.5, cy = CFG.WORLD_H * 0.5, rad = 1200;
  for (let i = 0; i < CFG.PLAYERS; i++) {
    const bot = i > 0;
    const p = mkPlayer(bot, bot ? ROLES[(i - 1) % ROLES.length] : "guard", i);
    const a = (i / CFG.PLAYERS) * Math.PI * 2;
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    p.x = x + rand(-60, 60); p.y = y + rand(-60, 60); p.spawnInv = 2.2;
    if (!bot) p.name = (nick.value.trim().slice(0, 16) || "Hunter");
    const core = mkCore(p.id, x, y, COLORS[i % COLORS.length]); p.coreId = core.id;
    players.push(p); cores.push(core);
  }
}

function spawnMon(type) {
  const t = {
    weak: { hp: 45, atk: 8, exp: 14, spd: 88, r: 10, col: "#89c9ff" },
    mid: { hp: 85, atk: 14, exp: 24, spd: 92, r: 12, col: "#6cf3d5" },
    strong: { hp: 150, atk: 22, exp: 42, spd: 74, r: 15, col: "#ffb06b" },
  }[type];
  monsters.push({ id: `m${idSeed++}`, type, x: rand(140, CFG.WORLD_W - 140), y: rand(140, CFG.WORLD_H - 140), hp: t.hp, hpMax: t.hp, atk: t.atk, speed: t.spd, r: t.r, exp: t.exp, col: t.col, hitCd: 0, deadUntil: 0, alive: true, rx: 0, ry: 0 });
}
function initMons() { for (let i = 0; i < CFG.MONSTERS; i++) spawnMon(i < 24 ? "weak" : i < 40 ? "mid" : "strong"); }

const upPool = [
  { id: "atk", label: "Attack Matrix", txt: "ATK +6", apply: (p) => p.atk += 6 },
  { id: "crit", label: "Critical Lens", txt: "Crit +10%", apply: (p) => p.crit += 0.1 },
  { id: "leech", label: "Life Siphon", txt: "Lifesteal +8%", apply: (p) => p.lifesteal += 0.08 },
  { id: "hp", label: "Crystal Skin", txt: "HP +26", apply: (p) => { p.hpMax += 26; p.hp += 26; } },
  { id: "def", label: "Armor Core", txt: "DEF +4", apply: (p) => p.def += 4 },
  { id: "guard", label: "Core Guardian", txt: "Near core dmg -15%", apply: (p) => p.coreGuard += 0.15 },
  { id: "siege", label: "Siege Rounds", txt: "Core dmg +22%", apply: (p) => p.coreMul += 0.22 },
  { id: "spd", label: "Thruster", txt: "Move speed +18", apply: (p) => p.speed += 18 },
  { id: "dash", label: "Dash Relay", txt: "Dash CD -0.6s", apply: (p) => p.dashCd -= 0.6 },
];
function pick3() { const a = [...upPool], out = []; while (out.length < 3 && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return out; }

function coreByOwner(id) { return cores.find((c) => c.ownerId === id); }

function grantExp(p, val) {
  if (!p || p.eliminated) return;
  p.exp += val;
  while (p.exp >= expNeed(p.level) && p.level < 10) {
    p.exp -= expNeed(p.level); p.level += 1;
    const c = pick3();
    if (p.isBot) botPick(p, c).apply(p);
    else { p.queue.push(c); beep(960, 0.05, "square", 0.03); }
  }
}
function botPick(p, c) {
  if (p.role === "raid") return c.find((x) => x.id === "siege" || x.id === "atk" || x.id === "spd") || c[0];
  if (p.role === "guard") return c.find((x) => x.id === "guard" || x.id === "hp" || x.id === "def") || c[0];
  return c.find((x) => x.id === "atk" || x.id === "spd" || x.id === "leech") || c[0];
}

function showBanner(text, bg = "rgba(29,76,146,.8)") { banner.textContent = text; banner.style.background = bg; banner.style.display = "block"; bannerUntil = matchT + 1.6; }
function removeOwnerProjectiles(ownerId) { for (let i = projs.length - 1; i >= 0; i--) if (projs[i].ownerId === ownerId) projs.splice(i, 1); }

function eliminate(ownerId, attacker) {
  const p = players.find((x) => x.id === ownerId);
  if (!p || p.eliminated) return;
  p.eliminated = true; p.hp = 0;
  if (attacker) grantExp(attacker, 80);
  removeOwnerProjectiles(ownerId);
  for (let i = 0; i < 8; i++) drops.push({ id: `d${idSeed++}`, x: coreByOwner(ownerId).x + rand(-70, 70), y: coreByOwner(ownerId).y + rand(-70, 70), t: 14, kind: i % 2 ? "heal" : "power" });
  showBanner(`${p.name} CORE DESTROYED`, "rgba(176,82,22,.8)");
}

function dmgPlayer(target, dmg, src) {
  if (target.eliminated) return;
  if (matchT < CFG.SAFE_TIME && target.level < CFG.SAFE_LEVEL && src && src.id !== target.id) dmg *= 0.65;
  const v = Math.max(1, dmg - target.def * 0.45);
  target.hp -= v; fx.push({ x: target.x, y: target.y, t: 0.18, c: "#ff8ea2" });
  if (src && src.lifesteal > 0 && !src.eliminated) src.hp = Math.min(src.hpMax, src.hp + v * src.lifesteal);
  if (target.hp <= 0) {
    target.hp = 0; target.downUntil = matchT + CFG.DOWN_TIME; target.atkCd = matchT + CFG.DOWN_TIME; target.dashCd = Math.max(target.dashCd, matchT + 1.5);
    grantExp(src, 24);
  }
}

function dmgCore(core, dmg, atker) {
  if (!core.alive) return;
  const owner = players.find((p) => p.id === core.ownerId);
  const near = owner && !owner.eliminated && len(owner.x - core.x, owner.y - core.y) <= CFG.CORE_DEF_R;
  let v = dmg * CFG.CORE_DMG_MUL * (atker ? atker.coreMul : 1);
  if (near) v *= 1 - CFG.CORE_DEF_REDUCE;
  if (matchT < CFG.SAFE_TIME && owner && owner.level < CFG.SAFE_LEVEL) v *= 0.55;
  core.hp -= v; core.hitUntil = matchT + 1.5;
  if (atker) atker.exposeUntil = matchT + 3;
  if (core.hp <= core.hpMax * 0.3 && owner && owner.id === players[0].id) showBanner("ALERT: YOUR CORE UNDER 30%", "rgba(177,33,53,.8)");
  if (core.hp <= 0) { core.hp = 0; core.alive = false; eliminate(core.ownerId, atker); }
}

function fire(p) {
  if (matchT < p.atkCd || p.eliminated || p.downUntil > matchT) return;
  p.atkCd = matchT + CFG.ATTACK_CD;
  const crit = Math.random() < p.crit;
  projs.push({ id: `pr${idSeed++}`, ownerId: p.id, x: p.x + Math.cos(p.angle) * 16, y: p.y + Math.sin(p.angle) * 16, vx: Math.cos(p.angle) * CFG.PROJ_SPD, vy: Math.sin(p.angle) * CFG.PROJ_SPD, dmg: p.atk * (crit ? 1.6 : 1), life: CFG.PROJ_LIFE, col: crit ? "#ffe17a" : "#c9e7ff" });
}
function dash(p) { if (!p.eliminated && p.downUntil <= matchT && matchT >= p.dashCd) { p.dashCd = matchT + CFG.DASH_CD; p.dashUntil = matchT + CFG.DASH_TIME; fx.push({ x: p.x, y: p.y, t: 0.2, c: "#95f2ff" }); } }

function updateHuman(p, dt, cam) {
  if (p.downUntil > matchT) return;
  let ix = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
  let iy = (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) - (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0);
  if (ix || iy) { const n = norm(ix, iy); ix = n.x; iy = n.y; }
  const tx = mouse.x + cam.x, ty = mouse.y + cam.y;
  p.angle = aLerp(p.angle, Math.atan2(ty - p.y, tx - p.x), clamp(dt * 8, 0, 1));
  const mul = matchT < p.dashUntil ? CFG.DASH_MULT : 1;
  p.x = clamp(p.x + ix * p.speed * mul * dt, 0, CFG.WORLD_W);
  p.y = clamp(p.y + iy * p.speed * mul * dt, 0, CFG.WORLD_H);
  if (mouse.down || keys.has("Space")) fire(p);
  if (keys.has("ShiftLeft") || keys.has("ShiftRight") || keys.has("KeyQ")) dash(p);
}

function botTarget(b) {
  if (b.role === "guard") {
    const c = coreByOwner(b.id); b.tx = c.x + rand(-120, 120); b.ty = c.y + rand(-120, 120); return;
  }
  if (b.role === "raid" && b.level >= 4) {
    const c = cores.filter((x) => x.alive && x.ownerId !== b.id).sort((a, z) => a.hp - z.hp)[0];
    if (c) { b.tx = c.x + rand(-90, 90); b.ty = c.y + rand(-90, 90); return; }
  }
  const m = monsters.filter((x) => x.alive).sort((a, z) => len(b.x - a.x, b.y - a.y) - len(b.x - z.x, b.y - z.y))[0];
  if (m) { b.tx = m.x + rand(-40, 40); b.ty = m.y + rand(-40, 40); } else { b.tx = rand(80, CFG.WORLD_W - 80); b.ty = rand(80, CFG.WORLD_H - 80); }
}
function updateBot(b, dt) {
  if (b.downUntil > matchT) return;
  if (matchT >= b.botThink) { b.botThink = matchT + rand(0.15, 0.35); botTarget(b); }
  let tx = b.tx - b.x, ty = b.ty - b.y;
  const e = players.filter((p) => !p.eliminated && p.id !== b.id).sort((a, z) => len(b.x - a.x, b.y - a.y) - len(b.x - z.x, b.y - z.y))[0];
  if (e && e.hp < e.hpMax * 0.45 && len(b.x - e.x, b.y - e.y) < 260) { tx = e.x - b.x; ty = e.y - b.y; }
  b.angle = aLerp(b.angle, Math.atan2(ty, tx), clamp(dt * 5.2, 0, 1));
  const mul = matchT < b.dashUntil ? CFG.DASH_MULT : 1;
  b.x = clamp(b.x + Math.cos(b.angle) * b.speed * mul * dt, 0, CFG.WORLD_W);
  b.y = clamp(b.y + Math.sin(b.angle) * b.speed * mul * dt, 0, CFG.WORLD_H);
  if (Math.random() < 0.35) {
    let shot = false;
    if (e && len(b.x - e.x, b.y - e.y) < 340) { b.angle = Math.atan2(e.y - b.y, e.x - b.x); fire(b); shot = true; }
    if (!shot) {
      const c = cores.filter((x) => x.alive && x.ownerId !== b.id).sort((a, z) => len(b.x - a.x, b.y - a.y) - len(b.x - z.x, b.y - z.y))[0];
      if (c && len(b.x - c.x, b.y - c.y) < 280) { b.angle = Math.atan2(c.y - b.y, c.x - b.x); fire(b); }
    }
  }
  if (Math.random() < 0.015) dash(b);
}

function updateMon(dt) {
  for (const m of monsters) {
    if (!m.alive) { if (matchT >= m.deadUntil) { m.alive = true; m.hp = m.hpMax; m.x = rand(120, CFG.WORLD_W - 120); m.y = rand(120, CFG.WORLD_H - 120); } continue; }
    const t = players.filter((p) => !p.eliminated && p.downUntil <= matchT).sort((a, z) => len(a.x - m.x, a.y - m.y) - len(z.x - m.x, z.y - m.y))[0];
    const d = t ? len(t.x - m.x, t.y - m.y) : Infinity;
    if (t && d < 230) {
      const n = norm(t.x - m.x, t.y - m.y); m.x += n.x * m.speed * dt; m.y += n.y * m.speed * dt;
      if (d < m.r + 16 && matchT >= m.hitCd) { m.hitCd = matchT + 0.85; dmgPlayer(t, m.atk, null); }
    } else {
      if (!m.rx || len(m.rx - m.x, m.ry - m.y) < 40) { m.rx = m.x + rand(-170, 170); m.ry = m.y + rand(-170, 170); }
      const n = norm(m.rx - m.x, m.ry - m.y); m.x += n.x * m.speed * 0.45 * dt; m.y += n.y * m.speed * 0.45 * dt;
    }
    m.x = clamp(m.x, 30, CFG.WORLD_W - 30); m.y = clamp(m.y, 30, CFG.WORLD_H - 30);
  }
}

function updateProj(dt) {
  for (let i = projs.length - 1; i >= 0; i--) {
    const pr = projs[i]; pr.life -= dt; if (pr.life <= 0) { projs.splice(i, 1); continue; }
    pr.x += pr.vx * dt; pr.y += pr.vy * dt;
    if (pr.x < 0 || pr.y < 0 || pr.x > CFG.WORLD_W || pr.y > CFG.WORLD_H) { projs.splice(i, 1); continue; }
    const owner = players.find((p) => p.id === pr.ownerId); if (!owner || owner.eliminated) { projs.splice(i, 1); continue; }
    let hit = false;
    for (const p of players) {
      if (p.id === owner.id || p.eliminated || p.downUntil > matchT) continue;
      if (len(pr.x - p.x, pr.y - p.y) <= 14) { dmgPlayer(p, pr.dmg, owner); hit = true; break; }
    }
    if (!hit) {
      for (const c of cores) {
        if (!c.alive || c.ownerId === owner.id) continue;
        if (len(pr.x - c.x, pr.y - c.y) <= CFG.CORE_R) { dmgCore(c, pr.dmg, owner); grantExp(owner, 5); showBanner("SIEGE ENGAGED", "rgba(145,74,18,.82)"); hit = true; break; }
      }
    }
    if (!hit) {
      for (const m of monsters) {
        if (!m.alive) continue;
        if (len(pr.x - m.x, pr.y - m.y) <= m.r + 4) { m.hp -= pr.dmg; fx.push({ x: m.x, y: m.y, t: 0.15, c: "#fff3b2" }); if (m.hp <= 0) { m.alive = false; m.deadUntil = matchT + CFG.MON_RESPAWN; grantExp(owner, m.exp); } hit = true; break; }
      }
    }
    if (hit) projs.splice(i, 1);
  }
}

function updateDrops(dt) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]; d.t -= dt; if (d.t <= 0) { drops.splice(i, 1); continue; }
    for (const p of players) {
      if (p.eliminated || p.downUntil > matchT) continue;
      if (len(p.x - d.x, p.y - d.y) <= 22) {
        if (d.kind === "heal") p.hp = Math.min(p.hpMax, p.hp + 28); else { p.atk += 3; p.speed += 4; }
        grantExp(p, 12); drops.splice(i, 1); break;
      }
    }
  }
}
function recover() {
  for (const p of players) if (!p.eliminated && p.downUntil > 0 && matchT >= p.downUntil) { p.downUntil = 0; const c = coreByOwner(p.id); p.x = c.x + rand(-35, 35); p.y = c.y + rand(-35, 35); p.hp = p.hpMax; p.spawnInv = matchT + 1.2; }
}
function updateFx(dt) { for (let i = fx.length - 1; i >= 0; i--) { fx[i].t -= dt; if (fx[i].t <= 0) fx.splice(i, 1); } }

function levelUI() {
  const me = players[0], set = me.queue[0];
  if (!set) { lvUI.style.display = "none"; lvChoices.innerHTML = ""; return; }
  lvUI.style.display = "block";
  if (lvChoices.childElementCount) return;
  set.forEach((u) => {
    const b = el("button", "padding:9px;border-radius:10px;border:1px solid #4f6992;background:#122034;color:#eaf3ff;cursor:pointer;text-align:left");
    b.innerHTML = `<div style=\"font-weight:800\">${u.label}</div><div style=\"font-size:12px;color:#9eb7db\">${u.txt}</div>`;
    b.onclick = () => { u.apply(me); me.queue.shift(); lvChoices.innerHTML = ""; levelUI(); };
    lvChoices.appendChild(b);
  });
}

function winCheck() {
  const alive = cores.filter((c) => c.alive).map((c) => c.ownerId);
  if (alive.length <= 1) { over = true; winner = alive.length ? `${players.find((p) => p.id === alive[0])?.name || "Unknown"} WINS` : "DRAW"; }
}

function update(dt) {
  if (!started || over) return;
  if (banner.style.display === "block" && matchT > bannerUntil) banner.style.display = "none";
  const me = players[0], cam = { x: clamp(me.x - W * 0.5, 0, Math.max(0, CFG.WORLD_W - W)), y: clamp(me.y - H * 0.5, 0, Math.max(0, CFG.WORLD_H - H)) };
  for (const p of players) { if (p.eliminated) continue; if (p.isBot) updateBot(p, dt); else updateHuman(p, dt, cam); }
  updateMon(dt); updateProj(dt); updateDrops(dt); recover(); updateFx(dt); winCheck(); levelUI();
}

function bar(x, y, w, h, r, fg, bg = "rgba(0,0,0,.4)") { ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); ctx.fillStyle = fg; ctx.fillRect(x, y, Math.max(0, w * clamp(r, 0, 1)), h); }

function drawPlane(x, y, a, col, down) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = down ? "#6f778b" : col;
  ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-8, -8); ctx.lineTo(-4, 0); ctx.lineTo(-8, 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.stroke(); ctx.restore();
}

function render() {
  const me = players[0] || { x: CFG.WORLD_W * 0.5, y: CFG.WORLD_H * 0.5, hp: 0, hpMax: 1, level: 1, exp: 0, coreId: "" };
  const camX = clamp(me.x - W * 0.5, 0, Math.max(0, CFG.WORLD_W - W)), camY = clamp(me.y - H * 0.5, 0, Math.max(0, CFG.WORLD_H - H));
  ctx.clearRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#091223"); g.addColorStop(1, "#050a14"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(130,160,220,.1)";
  for (let x = -camX % 50; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -camY % 50; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineWidth = 2; ctx.strokeRect(-camX, -camY, CFG.WORLD_W, CFG.WORLD_H);

  for (const c of cores) {
    const x = c.x - camX, y = c.y - camY; if (x < -80 || y < -80 || x > W + 80 || y > H + 80) continue;
    ctx.fillStyle = c.alive ? c.color : "#3c455b"; ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x + 22, y); ctx.lineTo(x, y + 24); ctx.lineTo(x - 22, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.stroke();
    bar(x - 28, y + 30, 56, 5, c.hp / c.hpMax, "#62f5dd");
    if (c.hitUntil > matchT) { ctx.strokeStyle = "rgba(255,92,109,.85)"; ctx.beginPath(); ctx.arc(x, y, CFG.CORE_R + 8 + Math.sin(matchT * 16) * 2, 0, Math.PI * 2); ctx.stroke(); }
  }
  for (const m of monsters) {
    if (!m.alive) continue; const x = m.x - camX, y = m.y - camY; if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    ctx.fillStyle = m.col; ctx.beginPath(); ctx.arc(x, y, m.r, 0, Math.PI * 2); ctx.fill(); bar(x - 16, y - m.r - 10, 32, 4, m.hp / m.hpMax, "#ffe28d");
  }
  for (const d of drops) { const x = d.x - camX, y = d.y - camY; ctx.fillStyle = d.kind === "heal" ? "#85f6ca" : "#ffe78f"; ctx.beginPath(); ctx.arc(x, y, 7 + Math.sin(matchT * 10) * 1.5, 0, Math.PI * 2); ctx.fill(); }
  for (const p of projs) { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x - camX, p.y - camY, 3, 0, Math.PI * 2); ctx.fill(); }
  for (const p of players) {
    if (p.eliminated) continue; const x = p.x - camX, y = p.y - camY; if (x < -50 || y < -50 || x > W + 50 || y > H + 50) continue;
    const col = coreByOwner(p.id)?.color || "#c8d7f6"; drawPlane(x, y, p.angle, col, p.downUntil > matchT);
    bar(x - 18, y + 14, 36, 4, p.hp / p.hpMax, "#78e2ff");
    ctx.fillStyle = "#eef6ff"; ctx.font = "10px ui-sans-serif"; ctx.fillText(`LV${p.level} ${p.name}`, x - 20, y - 16);
    if (p.downUntil > matchT) { ctx.fillStyle = "#ffccd4"; ctx.fillText(`DOWN ${(p.downUntil - matchT).toFixed(1)}s`, x - 22, y + 28); }
    if (p.exposeUntil > matchT) { ctx.strokeStyle = "rgba(255,129,72,.9)"; ctx.beginPath(); ctx.arc(x, y, 17 + Math.sin(matchT * 20) * 1.2, 0, Math.PI * 2); ctx.stroke(); }
  }
  for (const e of fx) { const a = clamp(e.t / 0.18, 0, 1); ctx.globalAlpha = a; ctx.strokeStyle = e.c; ctx.beginPath(); ctx.arc(e.x - camX, e.y - camY, 10 + (1 - a) * 16, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }

  const myCore = coreByOwner(me.id) || { hp: 1, hpMax: 1 };
  const aliveCores = cores.filter((c) => c.alive).length;
  hud.textContent = `Crystal Core Hunt\nAlive cores: ${aliveCores}/${cores.length}\nMatch: ${matchT.toFixed(1)}s\nMy Core HP: ${Math.max(0, myCore.hp).toFixed(0)} / ${myCore.hpMax}\nPlayer HP: ${Math.max(0, me.hp).toFixed(0)} / ${me.hpMax}\nLV ${me.level} EXP ${me.exp.toFixed(0)} / ${expNeed(me.level)}\nATK ${me.atk.toFixed(0)} DEF ${me.def.toFixed(0)} SPD ${me.speed.toFixed(0)}\nControls: WASD move | Mouse aim | LMB/Space attack | Shift/Q dash`;
  if (myCore.hp <= myCore.hpMax * 0.3 && myCore.hp > 0) { ctx.fillStyle = "rgba(194,34,54,.3)"; ctx.fillRect(0, 0, W, H); }
  const lb = players.filter((p) => !p.eliminated).map((p) => ({ name: p.name, lv: p.level, hp: coreByOwner(p.id)?.hp || 0 })).sort((a, b) => b.lv - a.lv || b.hp - a.hp).slice(0, 8);
  board.textContent = "LEADERBOARD\n" + lb.map((x, i) => `${i + 1}. ${x.name.padEnd(10, " ")} LV${x.lv} CORE:${Math.max(0, x.hp).toFixed(0)}`).join("\n");

  const mw = 180, mh = 180, mx = W - mw - 14, my = H - mh - 14;
  ctx.fillStyle = "rgba(8,14,24,.62)"; ctx.fillRect(mx, my, mw, mh); ctx.strokeStyle = "rgba(170,197,238,.6)"; ctx.strokeRect(mx, my, mw, mh);
  const sx = mw / CFG.WORLD_W, sy = mh / CFG.WORLD_H;
  for (const c of cores) { ctx.fillStyle = c.alive ? c.color : "#5f6575"; ctx.fillRect(mx + c.x * sx - 3, my + c.y * sy - 3, 6, 6); }
  for (const p of players) { if (!p.eliminated) { ctx.fillStyle = p.id === me.id ? "#fff" : "rgba(220,230,248,.76)"; ctx.fillRect(mx + p.x * sx - 1.5, my + p.y * sy - 1.5, 3, 3); } }

  if (over) center.textContent = winner || "GAME OVER";
  else if (me.downUntil > matchT) center.textContent = `DOWN ${Math.max(0, me.downUntil - matchT).toFixed(1)}s`;
  else center.textContent = "";
}

function startGame() { if (started) return; overlay.style.display = "none"; started = true; beep(670, 0.06, "triangle", 0.03); }
startBtn.onclick = startGame;

initPlayers(); initMons();
let last = performance.now() / 1000, acc = 0, dt = 1 / CFG.SIM_HZ;
function loop() {
  const now = performance.now() / 1000;
  let frame = Math.min(0.08, now - last); last = now;
  if (started && !over) matchT += frame;
  acc += frame;
  while (acc >= dt) { update(dt); acc -= dt; }
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
