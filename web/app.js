const CFG = {
  WORLD_W: 3200,
  WORLD_H: 3200,
  SIM_HZ: 30,
  CAMERA_SPEED: 900,
  BUILD_SNAP: 20,
  CENTRAL_HP: 12000,
  MONSTER_COUNT: 32,
  MONSTER_AGGRO_TIME: 7,
  MINIMAP_SIZE: 210,
  LEVEL_MAX: 8,
  HQ_INCOME_PER_SEC: 7,
};

const BUILDINGS = {
  HQ: { name: "HQ", hp: 2600, size: 34, cost: 0, r: 320, range: 220, damage: 20, fireCd: 0.8, projSpeed: 620, prereq: [], trait: "Passive crystal income + base defense" },
  RELAY: { name: "Relay", hp: 1000, size: 22, cost: 70, r: 250, range: 0, damage: 0, fireCd: 0, projSpeed: 0, prereq: ["HQ"], trait: "Territory extension node" },
  BARRACKS: { name: "Barracks", hp: 1200, size: 24, cost: 110, r: 220, range: 230, damage: 22, fireCd: 0.75, projSpeed: 700, prereq: ["RELAY"], produces: "MARINE", spawnCd: 5.2, trait: "Auto-produces Marines" },
  WORKSHOP: { name: "Workshop", hp: 1300, size: 26, cost: 150, r: 240, range: 0, damage: 0, fireCd: 0, projSpeed: 0, prereq: ["BARRACKS"], produces: "DRONE", spawnCd: 7.4, trait: "Auto-produces Drones" },
  REACTOR: { name: "Reactor", hp: 1400, size: 25, cost: 170, r: 260, range: 0, damage: 0, fireCd: 0, projSpeed: 0, prereq: ["WORKSHOP"], trait: "Nearby towers: +20% damage, -20% cooldown/production time" },
  CANNON: { name: "Cannon", hp: 900, size: 18, cost: 95, r: 180, range: 300, damage: 40, fireCd: 0.7, projSpeed: 800, prereq: ["RELAY"], monsterMult: 1.35, trait: "Anti-monster turret" },
  MISSILE: { name: "Missile", hp: 850, size: 18, cost: 160, r: 170, range: 420, damage: 68, fireCd: 1.2, projSpeed: 980, prereq: ["CANNON", "REACTOR"], splashRadius: 42, trait: "Long range splash missiles" },
  ARTILLERY: { name: "Artillery", hp: 760, size: 18, cost: 240, r: 150, range: 620, damage: 125, fireCd: 2.4, projSpeed: 720, prereq: ["WORKSHOP", "REACTOR"], towerMult: 1.35, trait: "Siege bonus vs central tower" },
};

const UNIT_TYPES = {
  MARINE: { hp: 110, r: 8, speed: 145, range: 170, atk: 19, fireCd: 0.55, col: "#88e7ff" },
  DRONE: { hp: 210, r: 10, speed: 112, range: 220, atk: 46, fireCd: 1.15, col: "#ffcf89" },
};

const BUILD_ORDER = ["RELAY", "BARRACKS", "WORKSHOP", "REACTOR", "CANNON", "MISSILE", "ARTILLERY"];
const root = document.getElementById("root") || document.body;
root.innerHTML = "";

function mk(tag, style = "") {
  const n = document.createElement(tag);
  if (style) n.style.cssText = style;
  return n;
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function len(x, y) { return Math.hypot(x, y); }
function norm(x, y) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }
function rand(a, b) { return a + Math.random() * (b - a); }

const wrap = mk("div", "position:fixed;inset:0;background:#050912;overflow:hidden;color:#e5eeff;font-family:Segoe UI,Arial,sans-serif");
const canvas = mk("canvas", "position:absolute;inset:0;width:100%;height:100%;display:block");
const hud = mk("div", "position:absolute;left:12px;top:10px;z-index:8;font-size:12px;white-space:pre-wrap;line-height:1.45;pointer-events:none;text-shadow:0 1px 0 #000");
const right = mk("div", "position:absolute;right:12px;top:10px;z-index:8;font-size:12px;white-space:pre-wrap;line-height:1.45;pointer-events:none;text-align:right;text-shadow:0 1px 0 #000");
const banner = mk("div", "position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:9;padding:8px 12px;border-radius:9px;display:none;font-size:12px;font-weight:800");
const center = mk("div", "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:9;font-size:30px;font-weight:900;pointer-events:none;text-shadow:0 2px 0 #000");

const buildPanel = mk("div", "position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:10;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;width:min(95vw,920px)");
const infoPanel = mk("div", "position:absolute;left:12px;bottom:12px;z-index:8;font-size:12px;line-height:1.45;white-space:pre-wrap;pointer-events:none;text-shadow:0 1px 0 #000");

const startOverlay = mk("div", "position:absolute;inset:0;z-index:11;display:flex;align-items:center;justify-content:center;background:rgba(8,13,22,0.22)");
const card = mk("div", "width:min(480px,92vw);padding:16px;border-radius:14px;border:1px solid rgba(120,160,230,.5);background:rgba(11,18,31,.58);backdrop-filter:blur(2px)");
card.innerHTML = `<div style="font-size:20px;font-weight:900;letter-spacing:.04em">CRYSTAL CORE HUNT</div>
<div style="margin-top:6px;color:#b9cdee;font-size:12px">Build outward territory and destroy the central tower first.</div>`;
const nickInput = mk("input", "margin-top:10px;width:100%;padding:10px;border-radius:10px;border:1px solid #45638f;background:rgba(7,12,20,.82);color:#eef6ff;outline:none");
nickInput.placeholder = "Nickname";
nickInput.maxLength = 16;
nickInput.value = "Commander";
const startBtn = mk("button", "margin-top:10px;width:100%;padding:10px;border-radius:10px;border:1px solid #8ab4ff;background:rgba(30,50,84,.9);color:#fff;font-weight:800;cursor:pointer");
startBtn.textContent = "Start";
card.append(nickInput, startBtn);
startOverlay.append(card);

wrap.append(canvas, hud, right, banner, center, buildPanel, infoPanel, startOverlay);
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

const keys = new Set();
const mouse = { x: 0, y: 0, down: false };
addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (startOverlay.style.display !== "none" && e.code === "Enter") start();
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener("mousedown", () => mouse.down = true);
addEventListener("mouseup", () => mouse.down = false);

const state = {
  started: false,
  over: false,
  win: false,
  time: 0,
  money: 180,
  incomeTick: 0,
  camX: 0,
  camY: 0,
  selectedBuildingId: "",
  commandMode: false,
  placingType: "",
  lastClick: 0,
};

let idSeed = 1;
function id(prefix) { return `${prefix}${idSeed++}`; }

const player = {
  name: "Commander",
  hqId: "",
  level: 1,
  exp: 0,
  expNext: 110,
};
const buildings = [];
const monsters = [];
const projectiles = [];
const effects = [];
const units = [];
const enemyTower = {
  id: "enemy-core",
  x: CFG.WORLD_W * 0.5,
  y: CFG.WORLD_H * 0.5,
  hp: CFG.CENTRAL_HP,
  hpMax: CFG.CENTRAL_HP,
  r: 64,
  fireCd: 0,
};

function addBuilding(type, x, y) {
  const t = BUILDINGS[type];
  const b = {
    id: id("b"),
    type,
    x,
    y,
    hp: t.hp,
    hpMax: t.hp,
    fireCd: 0,
    spawnCd: t.spawnCd || 0,
    forceTarget: "",
  };
  buildings.push(b);
  return b;
}

function addUnit(type, ownerBuildingId, x, y) {
  const t = UNIT_TYPES[type];
  if (!t) return null;
  const u = {
    id: id("u"),
    type,
    ownerBuildingId,
    x,
    y,
    homeX: x,
    homeY: y,
    hp: t.hp,
    hpMax: t.hp,
    r: t.r,
    speed: t.speed,
    range: t.range,
    atk: t.atk,
    fireCd: 0,
    targetId: "",
  };
  units.push(u);
  return u;
}

function initGame() {
  buildings.length = 0;
  monsters.length = 0;
  projectiles.length = 0;
  effects.length = 0;
  units.length = 0;
  state.money = 180;
  state.incomeTick = 0;
  state.over = false;
  state.win = false;
  state.time = 0;
  state.selectedBuildingId = "";
  state.commandMode = false;
  state.placingType = "";
  enemyTower.hp = enemyTower.hpMax;
  enemyTower.fireCd = 0;
  player.level = 1;
  player.exp = 0;
  player.expNext = 110;

  const hq = addBuilding("HQ", CFG.WORLD_W * 0.2, CFG.WORLD_H * 0.8);
  player.hqId = hq.id;

  for (let i = 0; i < CFG.MONSTER_COUNT; i++) {
    const ang = rand(0, Math.PI * 2);
    monsters.push({
      id: id("m"),
      x: rand(130, CFG.WORLD_W - 130),
      y: rand(130, CFG.WORLD_H - 130),
      hp: 120,
      hpMax: 120,
      r: 12,
      atk: 20,
      speed: 120,
      aggroId: "",
      aggroUntil: 0,
      hitCd: 0,
      alive: true,
      vx: Math.cos(ang) * rand(32, 72),
      vy: Math.sin(ang) * rand(32, 72),
      wanderT: rand(0.4, 1.8),
    });
  }
}

function hasType(type) {
  return buildings.some((b) => b.type === type && b.hp > 0);
}
function canBuildType(type) {
  const t = BUILDINGS[type];
  if (!t) return false;
  return t.prereq.every(hasType);
}

function buildButtons() {
  buildPanel.innerHTML = "";
  BUILD_ORDER.forEach((type) => {
    const t = BUILDINGS[type];
    const btn = mk("button", "padding:8px 10px;border-radius:10px;border:1px solid #4b6490;background:rgba(12,20,34,.88);color:#e9f2ff;cursor:pointer;font-size:12px");
    const ok = canBuildType(type) && state.money >= t.cost;
    if (!ok) btn.style.opacity = "0.45";
    if (state.placingType === type) btn.style.borderColor = "#9fd0ff";
    btn.textContent = `${type} (${t.cost})`;
    btn.onclick = () => {
      if (!canBuildType(type)) return;
      state.placingType = state.placingType === type ? "" : type;
      state.commandMode = false;
      buildButtons();
    };
    buildPanel.append(btn);
  });
}

function showBanner(text, color = "rgba(29,76,146,.82)") {
  banner.textContent = text;
  banner.style.background = color;
  banner.style.display = "block";
  banner.dataset.until = String(state.time + 1.4);
}

function territorySources() {
  return buildings.filter((b) => b.hp > 0).map((b) => ({
    x: b.x,
    y: b.y,
    r: BUILDINGS[b.type].r,
  }));
}
function inTerritory(x, y) {
  return territorySources().some((s) => len(x - s.x, y - s.y) <= s.r);
}

function overlapsBuilding(x, y, size, ignoreId = "") {
  for (const b of buildings) {
    if (ignoreId && b.id === ignoreId) continue;
    if (b.hp <= 0) continue;
    const other = BUILDINGS[b.type].size;
    if (len(x - b.x, y - b.y) < size + other + 8) return true;
  }
  if (len(x - enemyTower.x, y - enemyTower.y) < size + enemyTower.r + 24) return true;
  return false;
}

function screenToWorld(sx, sy) {
  return { x: sx + state.camX, y: sy + state.camY };
}

function selectedBuilding() {
  return buildings.find((b) => b.id === state.selectedBuildingId);
}

function livingHQ() {
  return buildings.find((b) => b.id === player.hqId && b.hp > 0);
}

function enemyAtPoint(x, y) {
  if (enemyTower.hp > 0 && len(x - enemyTower.x, y - enemyTower.y) <= enemyTower.r) return { kind: "tower", id: enemyTower.id };
  for (const m of monsters) {
    if (m.alive && len(x - m.x, y - m.y) <= m.r + 4) return { kind: "monster", id: m.id };
  }
  return null;
}

function ownBuildingAtPoint(x, y) {
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    const s = BUILDINGS[b.type].size;
    if (len(x - b.x, y - b.y) <= s + 4) return b;
  }
  return null;
}

canvas.addEventListener("click", (e) => {
  if (!state.started || state.over) return;
  const w = screenToWorld(e.clientX, e.clientY);

  if (state.placingType) {
    const type = state.placingType;
    const t = BUILDINGS[type];
    if (!canBuildType(type)) return;
    const x = Math.round(w.x / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
    const y = Math.round(w.y / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
    if (x < 20 || y < 20 || x > CFG.WORLD_W - 20 || y > CFG.WORLD_H - 20) return;
    if (!inTerritory(x, y)) {
      showBanner("Outside of your build range", "rgba(148,57,35,.82)");
      return;
    }
    if (overlapsBuilding(x, y, t.size)) {
      showBanner("Cannot place here", "rgba(148,57,35,.82)");
      return;
    }
    if (state.money < t.cost) {
      showBanner("Not enough crystal", "rgba(148,57,35,.82)");
      return;
    }
    state.money -= t.cost;
    const b = addBuilding(type, x, y);
    state.selectedBuildingId = b.id;
    state.placingType = "";
    buildButtons();
    return;
  }

  const own = ownBuildingAtPoint(w.x, w.y);
  if (own) {
    state.selectedBuildingId = own.id;
    state.commandMode = BUILDINGS[own.type].range > 0;
    return;
  }

  const sel = selectedBuilding();
  if (sel && state.commandMode) {
    const target = enemyAtPoint(w.x, w.y);
    if (target) {
      sel.forceTarget = target.id;
      showBanner(`${sel.type} target locked`, "rgba(27,88,145,.82)");
      return;
    }
  }

  state.selectedBuildingId = "";
  state.commandMode = false;
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const sel = selectedBuilding();
  if (!sel) return;
  const w = screenToWorld(e.clientX, e.clientY);
  const atEnemy = enemyAtPoint(w.x, w.y);
  if (!atEnemy && sel.type === "ARTILLERY" && moveBuildingIfAllowed(sel, w.x, w.y)) return;
  sel.forceTarget = "";
  showBanner("Target cleared");
});

function spawnProjectile(owner, tx, ty, damage, speed, color, targetId) {
  const n = norm(tx - owner.x, ty - owner.y);
  projectiles.push({
    id: id("p"),
    ownerId: owner.id,
    x: owner.x,
    y: owner.y,
    vx: n.x * speed,
    vy: n.y * speed,
    life: 1.6,
    damage,
    color,
    targetId,
    splashRadius: owner.splashRadius || 0,
    monsterMult: owner.monsterMult || 1,
    towerMult: owner.towerMult || 1,
  });
}

function levelAttackMult() {
  return 1 + (player.level - 1) * 0.07;
}

function levelIncomeMult() {
  return 1 + (player.level - 1) * 0.08;
}

function levelProdCdMult() {
  return Math.max(0.72, 1 - (player.level - 1) * 0.03);
}

function gainExp(v) {
  if (player.level >= CFG.LEVEL_MAX || v <= 0) return;
  player.exp += v;
  while (player.level < CFG.LEVEL_MAX && player.exp >= player.expNext) {
    player.exp -= player.expNext;
    player.level += 1;
    player.expNext = Math.floor(player.expNext * 1.34 + 26);
    showBanner(`LEVEL UP ${player.level}!`, "rgba(38,118,78,.88)");
  }
  if (player.level >= CFG.LEVEL_MAX) {
    player.level = CFG.LEVEL_MAX;
    player.exp = 0;
  }
}

function hasReactorAura(x, y) {
  return buildings.some((b) => b.hp > 0 && b.type === "REACTOR" && len(b.x - x, b.y - y) <= BUILDINGS.REACTOR.r);
}

function nearestEnemyForBuilding(b, range) {
  let best = null;
  let bestD = range;
  for (const m of monsters) {
    if (!m.alive) continue;
    const d = len(m.x - b.x, m.y - b.y);
    if (d < bestD) {
      bestD = d;
      best = { id: m.id, x: m.x, y: m.y };
    }
  }
  if (enemyTower.hp > 0) {
    const d = len(enemyTower.x - b.x, enemyTower.y - b.y);
    if (d < bestD) {
      bestD = d;
      best = { id: enemyTower.id, x: enemyTower.x, y: enemyTower.y };
    }
  }
  return best;
}

function targetById(id) {
  if (!id) return null;
  if (id === enemyTower.id && enemyTower.hp > 0) return { id: enemyTower.id, x: enemyTower.x, y: enemyTower.y };
  const m = monsters.find((x) => x.id === id && x.alive);
  if (m) return { id: m.id, x: m.x, y: m.y };
  return null;
}

function moveBuildingIfAllowed(b, tx, ty) {
  if (!b || b.hp <= 0 || b.type !== "ARTILLERY") return false;
  const t = BUILDINGS[b.type];
  const x = Math.round(tx / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
  const y = Math.round(ty / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
  if (x < 20 || y < 20 || x > CFG.WORLD_W - 20 || y > CFG.WORLD_H - 20) return false;
  if (!inTerritory(x, y)) {
    showBanner("Outside of your build range", "rgba(148,57,35,.82)");
    return false;
  }
  if (overlapsBuilding(x, y, t.size, b.id)) {
    showBanner("Cannot move there", "rgba(148,57,35,.82)");
    return false;
  }
  b.x = x;
  b.y = y;
  showBanner("Artillery relocated", "rgba(27,88,145,.82)");
  return true;
}

function updateBuildings(dt) {
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    const reactorBuff = hasReactorAura(b.x, b.y);
    if (b.fireCd > 0) b.fireCd -= dt;
    const t = BUILDINGS[b.type];
    if (t.produces && b.spawnCd > 0) {
      b.spawnCd -= dt;
      if (b.spawnCd <= 0) {
        const a = rand(0, Math.PI * 2);
        const dist = t.size + 16;
        addUnit(t.produces, b.id, b.x + Math.cos(a) * dist, b.y + Math.sin(a) * dist);
        const prodBuff = reactorBuff ? 0.8 : 1;
        b.spawnCd = t.spawnCd * levelProdCdMult() * prodBuff;
      }
    }
    if (t.range <= 0) continue;
    if (b.fireCd > 0) continue;

    let target = targetById(b.forceTarget);
    if (target && len(target.x - b.x, target.y - b.y) > t.range) target = null;
    if (!target) target = nearestEnemyForBuilding(b, t.range);
    if (!target) continue;
    const atkBuff = levelAttackMult() * (reactorBuff ? 1.2 : 1);
    const speedBuff = reactorBuff ? 0.8 : 1;
    b.fireCd = t.fireCd * speedBuff;
    spawnProjectile({
      id: b.id,
      x: b.x,
      y: b.y,
      splashRadius: t.splashRadius || 0,
      monsterMult: t.monsterMult || 1,
      towerMult: t.towerMult || 1,
    }, target.x, target.y, t.damage * atkBuff, t.projSpeed, "#d7edff", target.id);
  }
}

function damageMonster(m, dmg, fromX, fromY) {
  m.hp -= dmg;
  effects.push({ x: m.x, y: m.y, t: 0.18, c: "#ffd5a5" });
  if (m.hp <= 0) {
    m.alive = false;
    state.money += 28;
    gainExp(18);
    return;
  }
  const nearest = buildings.filter((b) => b.hp > 0).sort((a, z) => len(a.x - m.x, a.y - m.y) - len(z.x - m.x, z.y - m.y))[0];
  if (nearest) {
    m.aggroId = nearest.id;
    m.aggroUntil = state.time + CFG.MONSTER_AGGRO_TIME;
  }
}

function damageBuilding(b, dmg) {
  b.hp -= dmg;
  effects.push({ x: b.x, y: b.y, t: 0.2, c: "#ff98a8" });
  if (b.hp <= 0) {
    b.hp = 0;
    if (b.id === player.hqId) {
      state.over = true;
      state.win = false;
    }
  }
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    if (p.life <= 0) { projectiles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < 0 || p.y < 0 || p.x > CFG.WORLD_W || p.y > CFG.WORLD_H) { projectiles.splice(i, 1); continue; }

    if (enemyTower.hp > 0 && len(p.x - enemyTower.x, p.y - enemyTower.y) <= enemyTower.r + 3) {
      enemyTower.hp -= p.damage * p.towerMult;
      effects.push({ x: enemyTower.x, y: enemyTower.y, t: 0.2, c: "#fff0a0" });
      if (enemyTower.hp <= 0) {
        enemyTower.hp = 0;
        state.over = true;
        state.win = true;
      }
      if (p.splashRadius > 0) {
        for (const m of monsters) {
          if (!m.alive) continue;
          const d = len(m.x - p.x, m.y - p.y);
          if (d <= p.splashRadius) damageMonster(m, p.damage * p.monsterMult * 0.55, p.x, p.y);
        }
      }
      gainExp(6);
      projectiles.splice(i, 1);
      continue;
    }

    let hit = false;
    for (const m of monsters) {
      if (!m.alive) continue;
      if (len(p.x - m.x, p.y - m.y) <= m.r + 3) {
        damageMonster(m, p.damage * p.monsterMult, p.x, p.y);
        if (p.splashRadius > 0) {
          for (const other of monsters) {
            if (!other.alive || other.id === m.id) continue;
            const d = len(other.x - p.x, other.y - p.y);
            if (d <= p.splashRadius) damageMonster(other, p.damage * p.monsterMult * 0.45, p.x, p.y);
          }
        }
        hit = true;
        break;
      }
    }
    if (hit) {
      projectiles.splice(i, 1);
      continue;
    }
  }
}

function nearestEnemyForUnit(u, detect) {
  let best = null;
  let bestD = detect;
  for (const m of monsters) {
    if (!m.alive) continue;
    const d = len(m.x - u.x, m.y - u.y);
    if (d < bestD) {
      bestD = d;
      best = { id: m.id, x: m.x, y: m.y, kind: "monster" };
    }
  }
  if (enemyTower.hp > 0) {
    const d = len(enemyTower.x - u.x, enemyTower.y - u.y);
    if (d < bestD) {
      bestD = d;
      best = { id: enemyTower.id, x: enemyTower.x, y: enemyTower.y, kind: "tower" };
    }
  }
  return best;
}

function applyUnitDamage(unit, target) {
  if (target.kind === "tower" && enemyTower.hp > 0) {
    const bonus = unit.type === "DRONE" ? 1.2 : 1;
    enemyTower.hp -= unit.atk * levelAttackMult() * bonus;
    effects.push({ x: enemyTower.x, y: enemyTower.y, t: 0.18, c: "#fff0a0" });
    gainExp(4);
    if (enemyTower.hp <= 0) {
      enemyTower.hp = 0;
      state.over = true;
      state.win = true;
    }
    return;
  }
  if (target.kind === "monster") {
    const m = monsters.find((x) => x.id === target.id && x.alive);
    if (m) damageMonster(m, unit.atk * levelAttackMult(), unit.x, unit.y);
  }
}

function updateUnits(dt) {
  for (let i = units.length - 1; i >= 0; i--) {
    const u = units[i];
    if (u.hp <= 0) {
      units.splice(i, 1);
      continue;
    }
    if (u.fireCd > 0) u.fireCd -= dt;
    const owner = buildings.find((b) => b.id === u.ownerBuildingId && b.hp > 0);
    const forced = owner ? targetById(owner.forceTarget) : null;
    let target = null;
    if (forced) {
      target = { id: forced.id, x: forced.x, y: forced.y, kind: forced.id === enemyTower.id ? "tower" : "monster" };
    } else {
      target = nearestEnemyForUnit(u, 460);
    }
    if (target) {
      const dx = target.x - u.x;
      const dy = target.y - u.y;
      const d = len(dx, dy);
      const n = norm(dx, dy);
      if (d > u.range - 8) {
        u.x += n.x * u.speed * dt;
        u.y += n.y * u.speed * dt;
      } else if (u.fireCd <= 0) {
        u.fireCd = UNIT_TYPES[u.type].fireCd;
        applyUnitDamage(u, target);
      }
      u.targetId = target.id;
    } else {
      const hx = owner ? owner.x : u.homeX;
      const hy = owner ? owner.y : u.homeY;
      const d = len(hx - u.x, hy - u.y);
      if (d > 24) {
        const n = norm(hx - u.x, hy - u.y);
        u.x += n.x * (u.speed * 0.72) * dt;
        u.y += n.y * (u.speed * 0.72) * dt;
      }
      u.targetId = "";
    }
    u.x = clamp(u.x, 0, CFG.WORLD_W);
    u.y = clamp(u.y, 0, CFG.WORLD_H);
  }
}

function updateMonsters(dt) {
  for (const m of monsters) {
    if (!m.alive) continue;
    if (m.hitCd > 0) m.hitCd -= dt;

    if (m.aggroUntil <= state.time) {
      m.aggroId = "";
      m.wanderT -= dt;
      if (m.wanderT <= 0) {
        const a = rand(0, Math.PI * 2);
        const s = rand(34, 82);
        m.vx = Math.cos(a) * s;
        m.vy = Math.sin(a) * s;
        m.wanderT = rand(0.6, 2.1);
      }
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.x < 20 || m.x > CFG.WORLD_W - 20) m.vx *= -1;
      if (m.y < 20 || m.y > CFG.WORLD_H - 20) m.vy *= -1;
      m.x = clamp(m.x, 20, CFG.WORLD_W - 20);
      m.y = clamp(m.y, 20, CFG.WORLD_H - 20);
      continue;
    }

    const target = buildings.find((b) => b.id === m.aggroId && b.hp > 0);
    if (!target) {
      m.aggroId = "";
      continue;
    }

    const d = len(target.x - m.x, target.y - m.y);
    const n = norm(target.x - m.x, target.y - m.y);
    const speed = 130;
    if (d > 26) {
      m.x += n.x * speed * dt;
      m.y += n.y * speed * dt;
    } else if (m.hitCd <= 0) {
      m.hitCd = 0.95;
      damageBuilding(target, m.atk);
    }
  }
}

function updateEnemyTower(dt) {
  if (enemyTower.hp <= 0) return;
  enemyTower.fireCd -= dt;
  if (enemyTower.fireCd > 0) return;
  const target = buildings
    .filter((b) => b.hp > 0)
    .sort((a, z) => len(a.x - enemyTower.x, a.y - enemyTower.y) - len(z.x - enemyTower.x, z.y - enemyTower.y))[0];
  if (!target) return;
  if (len(target.x - enemyTower.x, target.y - enemyTower.y) > 760) return;
  enemyTower.fireCd = 1.25;
  spawnProjectile({ id: enemyTower.id, x: enemyTower.x, y: enemyTower.y }, target.x, target.y, 70, 760, "#ffb4b4", target.id);
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].t -= dt;
    if (effects[i].t <= 0) effects.splice(i, 1);
  }
}

function update(dt) {
  if (!state.started || state.over) return;
  state.time += dt;
  state.incomeTick += dt;
  while (state.incomeTick >= 1) {
    state.incomeTick -= 1;
    if (livingHQ()) {
      state.money += Math.floor(CFG.HQ_INCOME_PER_SEC * levelIncomeMult());
    }
  }

  if (banner.style.display === "block" && Number(banner.dataset.until || 0) < state.time) {
    banner.style.display = "none";
  }

  const speed = CFG.CAMERA_SPEED * dt;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) state.camX -= speed;
  if (keys.has("KeyD") || keys.has("ArrowRight")) state.camX += speed;
  if (keys.has("KeyW") || keys.has("ArrowUp")) state.camY -= speed;
  if (keys.has("KeyS") || keys.has("ArrowDown")) state.camY += speed;
  state.camX = clamp(state.camX, 0, Math.max(0, CFG.WORLD_W - W));
  state.camY = clamp(state.camY, 0, Math.max(0, CFG.WORLD_H - H));

  updateBuildings(dt);
  updateUnits(dt);
  updateMonsters(dt);
  updateEnemyTower(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  buildButtons();
}

function drawBar(x, y, w, h, ratio, fg, bg = "rgba(0,0,0,.38)") {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fg;
  ctx.fillRect(x, y, Math.max(0, w * clamp(ratio, 0, 1)), h);
}

function drawWorldGrid() {
  ctx.strokeStyle = "rgba(122,152,212,.1)";
  for (let x = -state.camX % 50; x < W; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -state.camY % 50; y < H; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-state.camX, -state.camY, CFG.WORLD_W, CFG.WORLD_H);
}

function render() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#081021");
  bg.addColorStop(1, "#040a15");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  drawWorldGrid();

  // build range always visible
  for (const s of territorySources()) {
    const x = s.x - state.camX;
    const y = s.y - state.camY;
    ctx.strokeStyle = "rgba(98,217,255,.16)";
    ctx.fillStyle = "rgba(98,217,255,.05)";
    ctx.beginPath();
    ctx.arc(x, y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // enemy central tower
  const ex = enemyTower.x - state.camX;
  const ey = enemyTower.y - state.camY;
  if (enemyTower.hp > 0) {
    ctx.fillStyle = "#9d5fff";
    ctx.beginPath();
    ctx.arc(ex, ey, enemyTower.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.stroke();
    drawBar(ex - 60, ey + enemyTower.r + 8, 120, 7, enemyTower.hp / enemyTower.hpMax, "#ff8aaf");
    ctx.fillStyle = "#efe7ff";
    ctx.font = "11px Segoe UI";
    ctx.fillText("CENTRAL TOWER", ex - 48, ey - enemyTower.r - 10);
  }

  // monsters
  for (const m of monsters) {
    if (!m.alive) continue;
    const x = m.x - state.camX;
    const y = m.y - state.camY;
    if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
    ctx.fillStyle = m.aggroId ? "#ffb078" : "#9ecbff";
    ctx.beginPath();
    ctx.arc(x, y, m.r, 0, Math.PI * 2);
    ctx.fill();
    drawBar(x - 14, y - m.r - 9, 28, 4, m.hp / m.hpMax, "#ffe1a8");
  }

  // units
  for (const u of units) {
    const x = u.x - state.camX;
    const y = u.y - state.camY;
    if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
    ctx.fillStyle = UNIT_TYPES[u.type].col;
    ctx.beginPath();
    ctx.arc(x, y, u.r, 0, Math.PI * 2);
    ctx.fill();
    drawBar(x - 10, y - u.r - 8, 20, 3, u.hp / u.hpMax, "#d9f7ff");
  }

  // buildings
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    const x = b.x - state.camX;
    const y = b.y - state.camY;
    const s = BUILDINGS[b.type].size;
    if (x < -50 || y < -50 || x > W + 50 || y > H + 50) continue;
    ctx.fillStyle = b.id === player.hqId ? "#6effcf" : "#6ab8ff";
    ctx.fillRect(x - s, y - s, s * 2, s * 2);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.strokeRect(x - s, y - s, s * 2, s * 2);
    drawBar(x - s, y + s + 4, s * 2, 5, b.hp / b.hpMax, "#7ef5df");
    if (b.id === state.selectedBuildingId) {
      ctx.strokeStyle = "#fff8a1";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - s - 3, y - s - 3, s * 2 + 6, s * 2 + 6);
      const r = BUILDINGS[b.type].range;
      if (r > 0) {
        ctx.strokeStyle = "rgba(255,243,153,.4)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (b.forceTarget) {
        const t = targetById(b.forceTarget);
        if (t) {
          ctx.strokeStyle = "rgba(255,160,114,.9)";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(t.x - state.camX, t.y - state.camY);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "#eff6ff";
    ctx.font = "10px Segoe UI";
    ctx.fillText(b.type, x - s, y - s - 6);
  }

  // projectiles
  for (const p of projectiles) {
    const x = p.x - state.camX;
    const y = p.y - state.camY;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // hit effects
  for (const e of effects) {
    const x = e.x - state.camX;
    const y = e.y - state.camY;
    const a = clamp(e.t / 0.2, 0, 1);
    ctx.globalAlpha = a;
    ctx.strokeStyle = e.c;
    ctx.beginPath();
    ctx.arc(x, y, 12 + (1 - a) * 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // placement preview
  if (state.placingType) {
    const t = BUILDINGS[state.placingType];
    const w = screenToWorld(mouse.x, mouse.y);
    const x = Math.round(w.x / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
    const y = Math.round(w.y / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
    const ok = inTerritory(x, y) && !overlapsBuilding(x, y, t.size) && state.money >= t.cost;
    ctx.fillStyle = ok ? "rgba(126,245,205,.35)" : "rgba(255,120,120,.35)";
    ctx.fillRect(x - state.camX - t.size, y - state.camY - t.size, t.size * 2, t.size * 2);
    ctx.strokeStyle = ok ? "#9dffcf" : "#ff9d9d";
    ctx.strokeRect(x - state.camX - t.size, y - state.camY - t.size, t.size * 2, t.size * 2);
  }

  // minimap left
  const mm = CFG.MINIMAP_SIZE;
  const mx = 12;
  const my = H - mm - 12;
  ctx.fillStyle = "rgba(8,14,24,.72)";
  ctx.fillRect(mx, my, mm, mm);
  ctx.strokeStyle = "rgba(170,197,238,.65)";
  ctx.strokeRect(mx, my, mm, mm);
  const sx = mm / CFG.WORLD_W;
  const sy = mm / CFG.WORLD_H;
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    ctx.fillStyle = b.id === player.hqId ? "#7effd4" : "#9ad0ff";
    ctx.fillRect(mx + b.x * sx - 2, my + b.y * sy - 2, 4, 4);
  }
  for (const m of monsters) {
    if (!m.alive) continue;
    ctx.fillStyle = m.aggroId ? "#ffb07a" : "#a7c8ff";
    ctx.fillRect(mx + m.x * sx - 1, my + m.y * sy - 1, 2, 2);
  }
  for (const u of units) {
    ctx.fillStyle = UNIT_TYPES[u.type].col;
    ctx.fillRect(mx + u.x * sx - 1, my + u.y * sy - 1, 2, 2);
  }
  if (enemyTower.hp > 0) {
    ctx.fillStyle = "#caa0ff";
    ctx.fillRect(mx + enemyTower.x * sx - 3, my + enemyTower.y * sy - 3, 6, 6);
  }
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(mx + state.camX * sx, my + state.camY * sy, W * sx, H * sy);

  const hq = buildings.find((b) => b.id === player.hqId) || { hp: 0, hpMax: 1 };
  hud.textContent =
`Crystal Core Hunt
Money: ${Math.floor(state.money)}
LV: ${player.level} / ${CFG.LEVEL_MAX}  EXP: ${player.level >= CFG.LEVEL_MAX ? "MAX" : `${Math.floor(player.exp)} / ${player.expNext}`}
Build: ${state.placingType || "-"}
Command mode: ${state.commandMode ? "ON (click enemy)" : "OFF"}
Time: ${state.time.toFixed(1)}s
HQ HP: ${Math.max(0, hq.hp).toFixed(0)} / ${hq.hpMax}
Central HP: ${Math.max(0, enemyTower.hp).toFixed(0)} / ${enemyTower.hpMax}
Controls: WASD/Arrows camera | Left click select/place | Right click clear target
Artillery only: right click empty ground to relocate`;

  const aliveBuilds = buildings.filter((b) => b.hp > 0).length;
  right.textContent =
`BUILD SUMMARY
Alive buildings: ${aliveBuilds}
Units alive: ${units.length}
Monsters alive: ${monsters.filter((m) => m.alive).length}
Tech unlocked:
${Object.keys(BUILDINGS).filter((k) => k === "HQ" || canBuildType(k)).join(", ")}`;

  const sel = selectedBuilding();
  infoPanel.textContent = sel
    ? `Selected: ${sel.type}
HP ${Math.max(0, sel.hp).toFixed(0)} / ${sel.hpMax}
Range ${BUILDINGS[sel.type].range}
Trait: ${BUILDINGS[sel.type].trait || "-"}
Forced target: ${sel.forceTarget || "none"}`
    : "Select a combat tower then click an enemy to command target.";

  if (state.over) {
    center.textContent = state.win ? "VICTORY - CENTRAL TOWER DESTROYED" : "DEFEAT - HQ DESTROYED";
  } else {
    center.textContent = "";
  }
}

function start() {
  if (state.started) return;
  player.name = (nickInput.value || "Commander").trim().slice(0, 16) || "Commander";
  startOverlay.style.display = "none";
  state.started = true;
}
startBtn.onclick = start;

buildButtons();
initGame();

let last = performance.now() / 1000;
let acc = 0;
const dt = 1 / CFG.SIM_HZ;

function loop() {
  const now = performance.now() / 1000;
  let frame = Math.min(0.08, now - last);
  last = now;
  acc += frame;
  while (acc >= dt) {
    update(dt);
    acc -= dt;
  }
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
