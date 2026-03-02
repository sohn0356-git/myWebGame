const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 3000);
const WEB_DIR = path.join(__dirname, "web");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const CFG = {
  WORLD_W: 5600,
  WORLD_H: 5600,
  TICK_HZ: 15,
  MAX_PLAYERS: 8,
  MONSTER_COUNT: 56,
  GUARDIAN_COUNT: 6,
  CENTRAL_HP: 30000,
  HQ_INCOME_PER_SEC: 4,
  BUILD_SNAP: 20,
  LEVEL_MAX: 8,
  MONSTER_BOUNTY: 24,
};

const BUILDINGS = {
  HQ: { hp: 2600, size: 34, cost: 0, r: 320, range: 190, damage: 18, fireCd: 0.85, prereq: [], trait: "Base core and low passive defense" },
  RELAY: { hp: 1000, size: 22, cost: 70, r: 260, range: 0, damage: 0, fireCd: 0, prereq: ["HQ"], trait: "Territory extension" },
  MEDBAY: { hp: 980, size: 20, cost: 130, r: 220, range: 0, damage: 0, fireCd: 0, heal: 42, healRange: 245, healCd: 1.05, prereq: ["RELAY"], trait: "Heals nearby buildings" },
  BARRACKS: { hp: 1180, size: 24, cost: 120, r: 230, range: 0, damage: 0, fireCd: 0, produces: "INFANTRY", spawnCd: 3.8, maxUnits: 8, leash: 300, prereq: ["RELAY"], trait: "Melee infantry production (max 8, short leash)" },
  WORKSHOP: { hp: 1300, size: 26, cost: 170, r: 240, range: 0, damage: 0, fireCd: 0, produces: "CAVALRY", spawnCd: 5.6, maxUnits: 6, leash: 450, prereq: ["BARRACKS"], trait: "Cavalry production" },
  REACTOR: { hp: 1400, size: 25, cost: 180, r: 260, range: 0, damage: 0, fireCd: 0, prereq: ["WORKSHOP"], trait: "Production/attack support" },
  SIEGEWORKS: { hp: 1450, size: 28, cost: 240, r: 240, range: 0, damage: 0, fireCd: 0, produces: "SIEGE", spawnCd: 8.8, maxUnits: 4, leash: 520, prereq: ["WORKSHOP", "REACTOR"], trait: "Siege unit production" },
  CANNON: { hp: 930, size: 18, cost: 100, r: 180, range: 310, damage: 44, fireCd: 0.72, prereq: ["RELAY"], monsterMult: 1.3, trait: "Static defense tower" },
  MISSILE: { hp: 860, size: 18, cost: 165, r: 170, range: 430, damage: 72, fireCd: 1.24, prereq: ["CANNON", "REACTOR"], trait: "Long-range static defense" },
};

const BUILD_LIMITS = {
  HQ: 1,
  RELAY: 5,
  MEDBAY: 3,
  BARRACKS: 2,
  WORKSHOP: 2,
  REACTOR: 2,
  SIEGEWORKS: 2,
  CANNON: 6,
  MISSILE: 3,
};

const UNIT_TYPES = {
  INFANTRY: { hp: 84, r: 8, speed: 170, range: 28, atk: 34, fireCd: 0.62, trait: "Fast + high attack, low HP" },
  CAVALRY: { hp: 180, r: 10, speed: 215, range: 36, atk: 18, fireCd: 0.55, trait: "Fast + high HP, low attack" },
  SIEGE: { hp: 300, r: 12, speed: 58, range: 220, atk: 90, fireCd: 1.6, towerMult: 1.55, trait: "Very slow, tanky, high attack" },
};

const MONSTER_ARCHETYPES = [
  { name: "Fangling", hp: 100, atk: 18, speed: 126, r: 11 },
  { name: "Brute", hp: 170, atk: 26, speed: 92, r: 15 },
  { name: "Crawler", hp: 130, atk: 20, speed: 116, r: 12 },
];

let idSeed = 1;
const id = (p) => `${p}${idSeed++}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const norm = (x, y) => {
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
};
const rand = (a, b) => a + Math.random() * (b - a);

const slots = Array.from({ length: CFG.MAX_PLAYERS }, (_, i) => ({
  idx: i,
  x: CFG.WORLD_W * 0.5 + Math.cos((Math.PI * 2 * i) / CFG.MAX_PLAYERS) * 1900,
  y: CFG.WORLD_H * 0.5 + Math.sin((Math.PI * 2 * i) / CFG.MAX_PLAYERS) * 1900,
}));

const players = new Map();
const sockets = new Map();
const buildings = [];
const units = [];
const monsters = [];
const guardians = [];
const match = { over: false, winnerId: "", reason: "", winnerName: "" };
const central = {
  id: "central",
  x: CFG.WORLD_W * 0.5,
  y: CFG.WORLD_H * 0.5,
  hp: CFG.CENTRAL_HP,
  hpMax: CFG.CENTRAL_HP,
  r: 64,
  lastHitOwner: "",
};

function playerAtkMul(level) { return 1 + (level - 1) * 0.08; }
function playerHpMul(level) { return 1 + (level - 1) * 0.1; }
function playerIncomeMul(level) { return 1 + (level - 1) * 0.05; }

function addBuilding(ownerId, type, x, y) {
  const t = BUILDINGS[type];
  const p = players.get(ownerId);
  const hpMul = p ? playerHpMul(p.level) : 1;
  const hp = Math.floor(t.hp * hpMul);
  const b = {
    id: id("b"),
    ownerId,
    type,
    x,
    y,
    hp,
    hpMax: hp,
    fireCd: 0,
    healCd: t.healCd || 0,
    spawnCd: t.spawnCd || 0,
  };
  buildings.push(b);
  return b;
}

function addUnit(ownerId, ownerBuildingId, type, x, y) {
  const t = UNIT_TYPES[type];
  if (!t) return null;
  const p = players.get(ownerId);
  const hpMul = p ? playerHpMul(p.level) : 1;
  const hp = Math.floor(t.hp * hpMul);
  const u = {
    id: id("u"),
    ownerId,
    ownerBuildingId,
    type,
    x,
    y,
    homeX: x,
    homeY: y,
    hp,
    hpMax: hp,
    r: t.r,
    speed: t.speed,
    range: t.range,
    atk: t.atk,
    fireCd: 0,
    leash: BUILDINGS[buildings.find((b) => b.id === ownerBuildingId)?.type || "HQ"]?.leash || 420,
  };
  units.push(u);
  return u;
}

function addMonster() {
  const ar = MONSTER_ARCHETYPES[(Math.random() * MONSTER_ARCHETYPES.length) | 0];
  const a = rand(0, Math.PI * 2);
  monsters.push({
    id: id("m"),
    x: rand(120, CFG.WORLD_W - 120),
    y: rand(120, CFG.WORLD_H - 120),
    hp: ar.hp,
    hpMax: ar.hp,
    atk: ar.atk,
    speed: ar.speed,
    r: ar.r,
    archetype: ar.name,
    hitCd: 0,
    vx: Math.cos(a) * rand(30, 80),
    vy: Math.sin(a) * rand(30, 80),
    wanderT: rand(0.6, 2.2),
  });
}

function addGuardian(i) {
  const a = (Math.PI * 2 * i) / CFG.GUARDIAN_COUNT;
  guardians.push({
    id: id("g"),
    x: central.x + Math.cos(a) * 220,
    y: central.y + Math.sin(a) * 220,
    homeX: central.x + Math.cos(a) * 220,
    homeY: central.y + Math.sin(a) * 220,
    hp: 900,
    hpMax: 900,
    atk: 52,
    speed: 108,
    r: 14,
    hitCd: 0,
  });
}

function countOwned(ownerId, type) {
  return buildings.filter((b) => b.ownerId === ownerId && b.type === type && b.hp > 0).length;
}

function ownedBuildings(ownerId) {
  return buildings.filter((b) => b.ownerId === ownerId && b.hp > 0);
}

function hasOwnedType(ownerId, type) {
  return countOwned(ownerId, type) > 0;
}

function inTerritory(ownerId, x, y) {
  return ownedBuildings(ownerId).some((b) => dist(x, y, b.x, b.y) <= BUILDINGS[b.type].r);
}

function overlaps(x, y, size, ignoreId = "") {
  if (dist(x, y, central.x, central.y) <= size + central.r + 24) return true;
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    if (ignoreId && b.id === ignoreId) continue;
    if (dist(x, y, b.x, b.y) < size + BUILDINGS[b.type].size + 8) return true;
  }
  return false;
}

function canBuild(ownerId, type) {
  const def = BUILDINGS[type];
  if (!def) return { ok: false, reason: "unknown" };
  const p = players.get(ownerId);
  if (!p || !p.alive) return { ok: false, reason: "dead" };
  if (p.money < def.cost) return { ok: false, reason: "not enough money" };
  if (countOwned(ownerId, type) >= (BUILD_LIMITS[type] || 99)) return { ok: false, reason: "limit reached" };
  for (const req of def.prereq) {
    if (!hasOwnedType(ownerId, req)) return { ok: false, reason: `need ${req}` };
  }
  return { ok: true };
}

function ensurePlayer(slotIdx, name, isBot) {
  let p = [...players.values()].find((x) => x.slot === slotIdx);
  if (p) {
    p.name = name;
    p.isBot = isBot;
    p.connected = !isBot;
    return p;
  }
  const slot = slots[slotIdx];
  p = {
    id: id("pl"),
    slot: slotIdx,
    name,
    isBot,
    connected: !isBot,
    alive: true,
    color: `hsl(${(slotIdx * 47) % 360} 75% 70%)`,
    money: 240,
    level: 1,
    exp: 0,
    expNext: 120,
    incomeTick: 0,
    botThink: 0,
    rallyX: null,
    rallyY: null,
  };
  players.set(p.id, p);
  addBuilding(p.id, "HQ", slot.x, slot.y);
  return p;
}

function fillBotSlots() {
  for (let i = 0; i < CFG.MAX_PLAYERS; i++) {
    const occupied = [...players.values()].find((p) => p.slot === i && p.alive);
    if (!occupied) ensurePlayer(i, `BOT-${i + 1}`, true);
  }
}

function playerBySocket(ws) {
  const pid = sockets.get(ws);
  if (!pid) return null;
  return players.get(pid) || null;
}

function rescalePlayerForLevelUp(p, oldLevel, newLevel) {
  const oldMul = playerHpMul(oldLevel);
  const newMul = playerHpMul(newLevel);
  const ratio = newMul / oldMul;
  for (const b of buildings) {
    if (b.ownerId !== p.id || b.hp <= 0) continue;
    b.hpMax = Math.floor(b.hpMax * ratio);
    b.hp = Math.floor(b.hp * ratio);
  }
  for (const u of units) {
    if (u.ownerId !== p.id || u.hp <= 0) continue;
    u.hpMax = Math.floor(u.hpMax * ratio);
    u.hp = Math.floor(u.hp * ratio);
  }
}

function gainExp(player, amount) {
  if (!player || amount <= 0 || player.level >= CFG.LEVEL_MAX) return;
  player.exp += amount;
  while (player.level < CFG.LEVEL_MAX && player.exp >= player.expNext) {
    player.exp -= player.expNext;
    const old = player.level;
    player.level += 1;
    player.expNext = Math.floor(player.expNext * 1.34 + 26);
    rescalePlayerForLevelUp(player, old, player.level);
  }
  if (player.level >= CFG.LEVEL_MAX) {
    player.level = CFG.LEVEL_MAX;
    player.exp = 0;
  }
}

function buildingTargetFor(b) {
  const range = BUILDINGS[b.type].range;
  if (!range || range <= 0) return null;
  let best = null;
  let bestD = range;
  for (const g of guardians) {
    const d = dist(b.x, b.y, g.x, g.y);
    if (d < bestD) {
      best = { kind: "guardian", id: g.id, x: g.x, y: g.y };
      bestD = d;
    }
  }
  for (const m of monsters) {
    const d = dist(b.x, b.y, m.x, m.y);
    if (d < bestD) {
      best = { kind: "monster", id: m.id, x: m.x, y: m.y };
      bestD = d;
    }
  }
  const dc = dist(b.x, b.y, central.x, central.y);
  if (central.hp > 0 && dc < bestD) best = { kind: "central", id: central.id, x: central.x, y: central.y };
  return best;
}

function damageMonster(m, dmg, ownerId) {
  m.hp -= dmg;
  if (m.hp <= 0) {
    const idx = monsters.findIndex((x) => x.id === m.id);
    if (idx >= 0) monsters.splice(idx, 1);
    const p = players.get(ownerId);
    if (p) {
      p.money += CFG.MONSTER_BOUNTY;
      gainExp(p, 18);
    }
    addMonster();
  }
}

function damageGuardian(g, dmg, ownerId) {
  g.hp -= dmg;
  if (g.hp <= 0) {
    const idx = guardians.findIndex((x) => x.id === g.id);
    if (idx >= 0) guardians.splice(idx, 1);
    const p = players.get(ownerId);
    if (p) {
      p.money += 42;
      gainExp(p, 24);
    }
    setTimeout(() => {
      if (!match.over) addGuardian(Math.floor(Math.random() * 1000));
    }, 3000);
  }
}

function producerUnitCount(ownerBuildingId) {
  return units.filter((u) => u.ownerBuildingId === ownerBuildingId && u.hp > 0).length;
}

function updateBuildings(dt) {
  for (const b of buildings) {
    if (b.hp <= 0) continue;
    const def = BUILDINGS[b.type];
    const p = players.get(b.ownerId);
    if (!p || !p.alive) continue;

    b.fireCd = Math.max(0, b.fireCd - dt);
    b.spawnCd = Math.max(0, b.spawnCd - dt);
    b.healCd = Math.max(0, b.healCd - dt);

    if (def.produces) {
      const maxUnits = def.maxUnits || 99;
      if (producerUnitCount(b.id) < maxUnits && b.spawnCd <= 0) {
        const ang = rand(0, Math.PI * 2);
        const px = b.x + Math.cos(ang) * (def.size + 18);
        const py = b.y + Math.sin(ang) * (def.size + 18);
        addUnit(b.ownerId, b.id, def.produces, px, py);
        b.spawnCd = def.spawnCd;
      }
    }

    if (def.heal && b.healCd <= 0) {
      let healed = false;
      for (const ob of buildings) {
        if (ob.ownerId !== b.ownerId || ob.hp <= 0 || ob.hp >= ob.hpMax) continue;
        if (dist(ob.x, ob.y, b.x, b.y) <= def.healRange) {
          ob.hp = Math.min(ob.hpMax, ob.hp + def.heal);
          healed = true;
        }
      }
      b.healCd = healed ? def.healCd : 0.25;
    }

    if (!def.range || b.fireCd > 0) continue;
    const t = buildingTargetFor(b);
    if (!t) continue;

    const dmg = def.damage * playerAtkMul(p.level);
    if (t.kind === "monster") {
      const m = monsters.find((x) => x.id === t.id);
      if (m) damageMonster(m, dmg * (def.monsterMult || 1), b.ownerId);
    } else if (t.kind === "guardian") {
      const g = guardians.find((x) => x.id === t.id);
      if (g) damageGuardian(g, dmg, b.ownerId);
    } else if (central.hp > 0) {
      central.hp -= dmg * (def.towerMult || 1);
      central.lastHitOwner = b.ownerId;
      gainExp(p, 4);
      if (central.hp < 0) central.hp = 0;
    }
    b.fireCd = def.fireCd;
  }
}

function nearestEnemyForUnit(u, detect) {
  let best = null;
  let bestD = detect;
  for (const g of guardians) {
    const d = dist(u.x, u.y, g.x, g.y);
    if (d < bestD) {
      best = { kind: "guardian", id: g.id, x: g.x, y: g.y };
      bestD = d;
    }
  }
  for (const m of monsters) {
    const d = dist(u.x, u.y, m.x, m.y);
    if (d < bestD) {
      best = { kind: "monster", id: m.id, x: m.x, y: m.y };
      bestD = d;
    }
  }
  const dc = dist(u.x, u.y, central.x, central.y);
  if (central.hp > 0 && dc < bestD) best = { kind: "central", id: central.id, x: central.x, y: central.y };
  return best;
}

function updateUnits(dt) {
  for (let i = units.length - 1; i >= 0; i--) {
    const u = units[i];
    if (u.hp <= 0) {
      units.splice(i, 1);
      continue;
    }
    const owner = players.get(u.ownerId);
    if (!owner || !owner.alive) {
      units.splice(i, 1);
      continue;
    }

    u.fireCd = Math.max(0, u.fireCd - dt);
    const ownerB = buildings.find((b) => b.id === u.ownerBuildingId && b.hp > 0);
    const leash = ownerB ? (BUILDINGS[ownerB.type].leash || u.leash || 420) : (u.leash || 420);

    let targetPos = null;
    const enemy = nearestEnemyForUnit(u, 560);
    if (owner.rallyX != null && owner.rallyY != null) {
      targetPos = { kind: "rally", x: owner.rallyX, y: owner.rallyY };
      if (enemy) {
        const ed = dist(u.x, u.y, enemy.x, enemy.y);
        if (ed < Math.max(120, u.range + 50)) targetPos = enemy;
      }
    } else if (enemy) {
      targetPos = enemy;
    }

    const homeX = ownerB ? ownerB.x : u.homeX;
    const homeY = ownerB ? ownerB.y : u.homeY;

    if (targetPos) {
      const n = norm(targetPos.x - u.x, targetPos.y - u.y);
      const d = dist(u.x, u.y, targetPos.x, targetPos.y);
      const homeD = dist(u.x, u.y, homeX, homeY);

      if (homeD > leash) {
        const back = norm(homeX - u.x, homeY - u.y);
        u.x += back.x * u.speed * dt;
        u.y += back.y * u.speed * dt;
      } else if (targetPos.kind === "rally") {
        if (d > 16) {
          u.x += n.x * u.speed * dt;
          u.y += n.y * u.speed * dt;
        }
      } else if (d > u.range - 4) {
        u.x += n.x * u.speed * dt;
        u.y += n.y * u.speed * dt;
      } else if (u.fireCd <= 0) {
        const dmg = u.atk * playerAtkMul(owner.level);
        if (targetPos.kind === "monster") {
          const m = monsters.find((x) => x.id === targetPos.id);
          if (m) damageMonster(m, dmg, u.ownerId);
        } else if (targetPos.kind === "guardian") {
          const g = guardians.find((x) => x.id === targetPos.id);
          if (g) damageGuardian(g, dmg, u.ownerId);
        } else if (targetPos.kind === "central" && central.hp > 0) {
          central.hp -= dmg * (UNIT_TYPES[u.type].towerMult || 1);
          central.lastHitOwner = u.ownerId;
          if (central.hp < 0) central.hp = 0;
          gainExp(owner, 2);
        }
        u.fireCd = UNIT_TYPES[u.type].fireCd;
      }
    } else {
      const d = dist(u.x, u.y, homeX, homeY);
      if (d > 24) {
        const n = norm(homeX - u.x, homeY - u.y);
        u.x += n.x * (u.speed * 0.72) * dt;
        u.y += n.y * (u.speed * 0.72) * dt;
      }
    }
    u.x = clamp(u.x, 0, CFG.WORLD_W);
    u.y = clamp(u.y, 0, CFG.WORLD_H);
  }
}

function updateMonsters(dt) {
  for (const m of monsters) {
    m.hitCd = Math.max(0, m.hitCd - dt);
    let target = null;
    let bestD = 99999;
    for (const b of buildings) {
      if (b.hp <= 0) continue;
      const d = dist(m.x, m.y, b.x, b.y);
      if (d < bestD) {
        bestD = d;
        target = b;
      }
    }

    if (!target || bestD > 250) {
      m.wanderT -= dt;
      if (m.wanderT <= 0) {
        const a = rand(0, Math.PI * 2);
        const s = rand(34, 84);
        m.vx = Math.cos(a) * s;
        m.vy = Math.sin(a) * s;
        m.wanderT = rand(0.6, 2.2);
      }
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.x < 20 || m.x > CFG.WORLD_W - 20) m.vx *= -1;
      if (m.y < 20 || m.y > CFG.WORLD_H - 20) m.vy *= -1;
      m.x = clamp(m.x, 20, CFG.WORLD_W - 20);
      m.y = clamp(m.y, 20, CFG.WORLD_H - 20);
      continue;
    }

    const n = norm(target.x - m.x, target.y - m.y);
    if (bestD > 26) {
      m.x += n.x * m.speed * dt;
      m.y += n.y * m.speed * dt;
    } else if (m.hitCd <= 0) {
      m.hitCd = 1;
      target.hp -= m.atk;
      if (target.hp < 0) target.hp = 0;
    }
  }
}

function updateGuardians(dt) {
  for (const g of guardians) {
    g.hitCd = Math.max(0, g.hitCd - dt);
    let targetU = null;
    let bestUD = 99999;
    for (const u of units) {
      if (u.hp <= 0) continue;
      const d = dist(g.x, g.y, u.x, u.y);
      if (d < bestUD && d < 700) {
        bestUD = d;
        targetU = u;
      }
    }

    let targetB = null;
    let bestBD = 99999;
    for (const b of buildings) {
      if (b.hp <= 0 || b.type === "HQ") continue;
      const d = dist(g.x, g.y, b.x, b.y);
      if (d < bestBD && d < 650) {
        bestBD = d;
        targetB = b;
      }
    }

    const tx = targetU ? targetU.x : targetB ? targetB.x : g.homeX;
    const ty = targetU ? targetU.y : targetB ? targetB.y : g.homeY;
    const d = dist(g.x, g.y, tx, ty);
    const n = norm(tx - g.x, ty - g.y);

    if (d > 28) {
      const sp = targetU || targetB ? g.speed : g.speed * 0.65;
      g.x += n.x * sp * dt;
      g.y += n.y * sp * dt;
    } else if (g.hitCd <= 0) {
      g.hitCd = 0.9;
      if (targetU) {
        targetU.hp -= g.atk;
        if (targetU.hp < 0) targetU.hp = 0;
      } else if (targetB) {
        targetB.hp -= g.atk * 0.8;
        if (targetB.hp < 0) targetB.hp = 0;
      }
    }

    const homeD = dist(g.x, g.y, g.homeX, g.homeY);
    if (homeD > 420 && !targetU && !targetB) {
      const back = norm(g.homeX - g.x, g.homeY - g.y);
      g.x += back.x * g.speed * dt;
      g.y += back.y * g.speed * dt;
    }
    g.x = clamp(g.x, 0, CFG.WORLD_W);
    g.y = clamp(g.y, 0, CFG.WORLD_H);
  }
}

function removePlayerAssets(ownerId) {
  for (let i = units.length - 1; i >= 0; i--) {
    if (units[i].ownerId === ownerId) units.splice(i, 1);
  }
  for (let i = buildings.length - 1; i >= 0; i--) {
    if (buildings[i].ownerId === ownerId) buildings.splice(i, 1);
  }
}

function evaluateDeathsAndWin() {
  for (const p of players.values()) {
    if (!p.alive) continue;
    const hqAlive = buildings.some((b) => b.ownerId === p.id && b.type === "HQ" && b.hp > 0);
    if (!hqAlive) {
      p.alive = false;
      removePlayerAssets(p.id);
    }
  }

  if (match.over) return;

  if (central.hp <= 0) {
    match.over = true;
    match.reason = "central_destroyed";
    match.winnerId = central.lastHitOwner || "";
    match.winnerName = players.get(match.winnerId)?.name || "Unknown";
    return;
  }

  const alive = [...players.values()].filter((p) => p.alive);
  if (alive.length === 1) {
    match.over = true;
    match.reason = "last_survivor";
    match.winnerId = alive[0].id;
    match.winnerName = alive[0].name;
  }
}

function botAct(p, dt) {
  p.botThink -= dt;
  if (p.botThink > 0) return;
  p.botThink = rand(1.0, 2.2);

  const order = ["RELAY", "BARRACKS", "WORKSHOP", "MEDBAY", "CANNON", "REACTOR", "SIEGEWORKS", "MISSILE"];
  const hq = buildings.find((b) => b.ownerId === p.id && b.type === "HQ" && b.hp > 0);
  if (!hq) return;

  for (const type of order) {
    const can = canBuild(p.id, type);
    if (!can.ok) continue;
    let placed = false;
    for (let i = 0; i < 18 && !placed; i++) {
      const a = rand(0, Math.PI * 2);
      const d = rand(90, 260);
      let x = Math.round((hq.x + Math.cos(a) * d) / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
      let y = Math.round((hq.y + Math.sin(a) * d) / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
      x = clamp(x, 40, CFG.WORLD_W - 40);
      y = clamp(y, 40, CFG.WORLD_H - 40);
      if (!inTerritory(p.id, x, y)) continue;
      if (overlaps(x, y, BUILDINGS[type].size)) continue;
      addBuilding(p.id, type, x, y);
      p.money -= BUILDINGS[type].cost;
      placed = true;
    }
    if (placed) break;
  }

  const hasArmy = units.some((u) => u.ownerId === p.id && u.hp > 0);
  if (hasArmy && Math.random() < 0.35) {
    p.rallyX = central.x + rand(-150, 150);
    p.rallyY = central.y + rand(-150, 150);
  }
}

function gameTick(dt) {
  if (match.over) return;

  for (const p of players.values()) {
    if (!p.alive) continue;
    p.incomeTick += dt;
    if (p.incomeTick >= 1) {
      p.incomeTick -= 1;
      p.money += Math.floor(CFG.HQ_INCOME_PER_SEC * playerIncomeMul(p.level));
    }
    if (p.isBot) botAct(p, dt);
  }

  updateBuildings(dt);
  updateUnits(dt);
  updateMonsters(dt);
  updateGuardians(dt);
  evaluateDeathsAndWin();
}

function safeSend(ws, obj) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(obj));
}

function worldSnapshot(forPlayerId) {
  return {
    type: "snapshot",
    cfg: {
      worldW: CFG.WORLD_W,
      worldH: CFG.WORLD_H,
      buildSnap: CFG.BUILD_SNAP,
      limits: BUILD_LIMITS,
      buildingDefs: Object.fromEntries(Object.entries(BUILDINGS).map(([k, v]) => [k, {
        size: v.size,
        cost: v.cost,
        prereq: v.prereq,
        range: v.range || 0,
        radius: v.r,
        trait: v.trait,
      }])),
      unitDefs: UNIT_TYPES,
    },
    me: players.get(forPlayerId) || null,
    players: [...players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      slot: p.slot,
      isBot: p.isBot,
      connected: p.connected,
      alive: p.alive,
      color: p.color,
      money: p.money,
      level: p.level,
      rallyX: p.rallyX,
      rallyY: p.rallyY,
    })),
    buildings,
    units,
    monsters,
    guardians,
    central,
    match,
  };
}

function broadcastSnapshots() {
  for (const [ws, playerId] of sockets.entries()) {
    safeSend(ws, worldSnapshot(playerId));
  }
}

function handleJoin(ws, nameRaw) {
  const name = String(nameRaw || "Commander").trim().slice(0, 16) || "Commander";
  const freeHumanSlot = slots.find((s) => {
    const p = [...players.values()].find((x) => x.slot === s.idx && x.alive);
    return !p || p.isBot;
  });
  const slot = freeHumanSlot ? freeHumanSlot.idx : 0;

  const existing = [...players.values()].find((x) => x.slot === slot && x.alive);
  if (existing && existing.isBot) {
    removePlayerAssets(existing.id);
    players.delete(existing.id);
  }

  const p = ensurePlayer(slot, name, false);
  p.connected = true;
  sockets.set(ws, p.id);
  safeSend(ws, { type: "welcome", playerId: p.id, slot: p.slot, maxPlayers: CFG.MAX_PLAYERS });
}

function handleBuild(player, msg) {
  if (!player || !player.alive || match.over) return;
  const buildingType = String(msg.buildingType || "").toUpperCase();
  const x = Math.round(Number(msg.x || 0) / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
  const y = Math.round(Number(msg.y || 0) / CFG.BUILD_SNAP) * CFG.BUILD_SNAP;
  if (!BUILDINGS[buildingType]) return;
  const can = canBuild(player.id, buildingType);
  if (!can.ok) return;
  if (x < 20 || y < 20 || x > CFG.WORLD_W - 20 || y > CFG.WORLD_H - 20) return;
  if (!inTerritory(player.id, x, y)) return;
  if (overlaps(x, y, BUILDINGS[buildingType].size)) return;
  player.money -= BUILDINGS[buildingType].cost;
  addBuilding(player.id, buildingType, x, y);
}

function handleRallyAll(player, msg) {
  if (!player || !player.alive || match.over) return;
  player.rallyX = clamp(Number(msg.x || 0), 0, CFG.WORLD_W);
  player.rallyY = clamp(Number(msg.y || 0), 0, CFG.WORLD_H);
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/ping") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, now: Date.now(), players: [...players.values()].filter((p) => !p.isBot && p.alive).length }));
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
      sendFile(safePath, res);
      return;
    }
    sendFile(path.join(WEB_DIR, "index.html"), res);
  });
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  ws.on("message", (buf) => {
    let msg;
    try {
      msg = JSON.parse(String(buf));
    } catch {
      return;
    }

    if (msg?.type === "join") {
      handleJoin(ws, msg.name);
      return;
    }

    const player = playerBySocket(ws);
    if (!player) return;

    if (msg?.type === "build") {
      handleBuild(player, msg);
    } else if (msg?.type === "rally_all") {
      handleRallyAll(player, msg);
    }
  });

  ws.on("close", () => {
    const pid = sockets.get(ws);
    sockets.delete(ws);
    if (!pid) return;
    const p = players.get(pid);
    if (!p || !p.alive) return;
    p.isBot = true;
    p.connected = false;
    p.name = `BOT-${p.slot + 1}`;
  });
});

fillBotSlots();
while (monsters.length < CFG.MONSTER_COUNT) addMonster();
for (let i = 0; i < CFG.GUARDIAN_COUNT; i++) addGuardian(i);

let last = Date.now() / 1000;
setInterval(() => {
  const now = Date.now() / 1000;
  const dt = Math.min(0.15, now - last);
  last = now;
  gameTick(dt);
  broadcastSnapshots();
}, Math.floor(1000 / CFG.TICK_HZ));

server.listen(PORT, () => {
  console.log(`Web+WS server running on port ${PORT}`);
});
