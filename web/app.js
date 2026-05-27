const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

const W = 2400;
const H = 2400;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const len = (x, y) => Math.hypot(x, y) || 1;

const app = document.createElement("div");
app.className = "app";

const canvas = document.createElement("canvas");
canvas.className = "gameCanvas";
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context unavailable");
ctx.imageSmoothingEnabled = false;

function makePixelCanvas(w, h, drawFn) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) throw new Error("Pixel canvas context unavailable");
  g.imageSmoothingEnabled = false;
  drawFn(g);
  return c;
}

function px(g, x, y, w, h, color) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function makeSpriteSet() {
  const c = {
    knight: makePixelCanvas(16, 16, (g) => {
      px(g, 6, 2, 4, 3, "#cfd9ea");
      px(g, 5, 5, 6, 5, "#6a7fb7");
      px(g, 4, 7, 8, 5, "#26324f");
      px(g, 5, 8, 2, 5, "#d9e6ff");
      px(g, 9, 8, 2, 5, "#d9e6ff");
      px(g, 3, 9, 2, 4, "#8fb5ff");
      px(g, 11, 9, 2, 4, "#8fb5ff");
      px(g, 7, 10, 2, 4, "#edf3ff");
      px(g, 6, 1, 4, 1, "#8fb5ff");
      px(g, 12, 7, 2, 1, "#ffd76a");
      px(g, 12, 8, 1, 4, "#d9e6ff");
    }),
    ranger: makePixelCanvas(16, 16, (g) => {
      px(g, 6, 2, 4, 3, "#7cd7ff");
      px(g, 4, 5, 8, 4, "#23405e");
      px(g, 5, 6, 6, 6, "#0f1b2b");
      px(g, 4, 8, 3, 4, "#8fb5ff");
      px(g, 9, 8, 3, 4, "#8fb5ff");
      px(g, 6, 11, 4, 3, "#eaf5ff");
      px(g, 11, 6, 2, 6, "#ffd76a");
      px(g, 12, 5, 2, 2, "#8fb5ff");
      px(g, 3, 9, 2, 2, "#4c6384");
    }),
    mage: makePixelCanvas(16, 16, (g) => {
      px(g, 6, 2, 4, 3, "#f0d8ff");
      px(g, 4, 5, 8, 4, "#5a4d97");
      px(g, 3, 8, 10, 6, "#2f2d64");
      px(g, 5, 7, 6, 1, "#b39cff");
      px(g, 6, 10, 4, 3, "#edf3ff");
      px(g, 12, 5, 1, 8, "#ffd76a");
      px(g, 11, 4, 3, 1, "#8fb5ff");
      px(g, 3, 12, 2, 2, "#8fb5ff");
      px(g, 10, 12, 2, 2, "#8fb5ff");
    }),
    drone: makePixelCanvas(12, 12, (g) => {
      px(g, 5, 1, 2, 2, "#67f7d4");
      px(g, 3, 3, 6, 6, "#2d4963");
      px(g, 4, 4, 4, 4, "#8fb5ff");
      px(g, 2, 5, 2, 2, "#67f7d4");
      px(g, 8, 5, 2, 2, "#67f7d4");
      px(g, 5, 9, 2, 2, "#d9e6ff");
    }),
    striker: makePixelCanvas(14, 14, (g) => {
      px(g, 5, 1, 4, 3, "#8fb5ff");
      px(g, 3, 4, 8, 6, "#20314f");
      px(g, 2, 5, 2, 4, "#ff7b88");
      px(g, 10, 5, 2, 4, "#ff7b88");
      px(g, 4, 10, 6, 2, "#edf3ff");
      px(g, 6, 2, 2, 10, "#ffffff");
      px(g, 5, 5, 4, 4, "#ff6e8a");
    }),
    brute: makePixelCanvas(18, 18, (g) => {
      px(g, 6, 2, 6, 4, "#ffb06a");
      px(g, 4, 5, 10, 8, "#7a2230");
      px(g, 3, 6, 2, 5, "#ff7b88");
      px(g, 13, 6, 2, 5, "#ff7b88");
      px(g, 5, 12, 8, 2, "#2e1521");
      px(g, 5, 8, 2, 2, "#ffd76a");
      px(g, 11, 8, 2, 2, "#ffd76a");
      px(g, 7, 14, 4, 2, "#edf3ff");
    }),
    shard: makePixelCanvas(8, 8, (g) => {
      px(g, 3, 0, 2, 2, "#fff0b4");
      px(g, 2, 2, 4, 4, "#ffd76a");
      px(g, 3, 6, 2, 2, "#fff0b4");
      px(g, 0, 3, 2, 2, "#ffd76a");
      px(g, 6, 3, 2, 2, "#ffd76a");
    }),
    bullet: makePixelCanvas(6, 6, (g) => {
      px(g, 2, 1, 2, 4, "#7ef7d4");
      px(g, 1, 2, 4, 2, "#8fb5ff");
      px(g, 2, 2, 2, 2, "#edf3ff");
    }),
    bolt: makePixelCanvas(6, 6, (g) => {
      px(g, 2, 0, 2, 6, "#8fb5ff");
      px(g, 0, 2, 6, 2, "#ff7b88");
    }),
  };
  return c;
}

const sprites = makeSpriteSet();

function drawSprite(sprite, x, y, scale, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const w = sprite.width * scale;
  const h = sprite.height * scale;
  ctx.drawImage(sprite, Math.round(-w / 2), Math.round(-h / 2), Math.round(w), Math.round(h));
  ctx.restore();
}

const flash = document.createElement("div");
flash.className = "damageFlash";

const hud = document.createElement("div");
hud.className = "hud";

const topRow = document.createElement("div");
topRow.className = "topRow";

const bottomRow = document.createElement("div");
bottomRow.className = "bottomRow";

const brand = document.createElement("div");
brand.className = "brand";
brand.innerHTML = `
  <div class="brandTitle">Eclipse Solo RPG</div>
  <div class="brandSub">A single-player action RPG about a lone pilot, relic hunting, and surviving the dark between chapters.</div>
`;

const stats = document.createElement("div");
stats.className = "stats";

const statScore = statCard("Gold", "0");
const statWave = statCard("Chapter", "1");
const statHull = statCard("HP", "100");
const statShield = statCard("Ward", "40");

stats.append(statScore.card, statWave.card, statHull.card, statShield.card);
topRow.append(brand, stats);

const tipCard = document.createElement("div");
tipCard.className = "tipCard";
tipCard.innerHTML = `
  <strong>Controls:</strong> WASD / Arrow keys to move, mouse to aim, Space to dash.
  <br />This is a solo action RPG: choose a class, collect relics, level up, and survive each chapter.
`;

bottomRow.append(tipCard);
hud.append(topRow, bottomRow);

const centerLayer = document.createElement("div");
centerLayer.className = "centerLayer";

const overlay = document.createElement("div");
overlay.className = "overlayCard";
centerLayer.append(overlay);

app.append(canvas, flash, hud, centerLayer);
root.append(app);

function statCard(label, initial) {
  const card = document.createElement("div");
  card.className = "statCard";
  card.innerHTML = `
    <div class="statLabel">${label}</div>
    <div class="statValue">${initial}</div>
    <div class="bar"><div class="barFill"></div></div>
  `;
  return {
    card,
    valueEl: card.querySelector(".statValue"),
    fillEl: card.querySelector(".barFill"),
  };
}

const ui = {
  title: null,
  lead: null,
  actionRow: null,
  upgradePanel: null,
  footer: null,
};

function buildOverlay(mode) {
  overlay.classList.add("active");
  overlay.innerHTML = "";

  const title = document.createElement("div");
  title.className = "heroTitle";
  const lead = document.createElement("div");
  lead.className = "heroLead";
  const actionRow = document.createElement("div");
  actionRow.className = "buttonRow";
  const footer = document.createElement("div");
  footer.className = "footerHint";

  ui.title = title;
  ui.lead = lead;
  ui.actionRow = actionRow;
  ui.footer = footer;
  ui.upgradePanel = null;

  overlay.append(title, lead, actionRow, footer);

  if (mode === "title") {
    title.textContent = "Eclipse Solo RPG";
    lead.innerHTML = `
      Pick a class and begin a single-player run through the eclipse ruins.
      The combat is action-heavy, but the build path is pure RPG: stats, relics, and talent choices.
    `;

    const knight = button("Knight", "primary", () => startRun("knight"));
    const ranger = button("Ranger", "", () => startRun("ranger"));
    const mage = button("Mage", "", () => startRun("mage"));
    const practice = button("Quick Tips", "", () => {
      tipCard.innerHTML = `
        <strong>Goal:</strong> clear chapters, defeat enemies, and grow your build like a solo action RPG.
        <br /><strong>Best habit:</strong> pick a class that matches your style, then lean into its strengths.
      `;
    });
    actionRow.append(knight, ranger, mage, practice);
    footer.textContent = "RPG loop: choose a class, survive a chapter, then spend every level-up on a talent.";
    return;
  }

  if (mode === "upgrade") {
    title.textContent = "Talent Gain";
    lead.textContent = "Choose one perk. The run pauses while you decide your next build step.";

    const panel = document.createElement("div");
    panel.className = "upgradePanel";
    ui.upgradePanel = panel;
    for (const choice of state.upgradeChoices) {
      const card = document.createElement("button");
      card.className = "upgradeCard";
      card.innerHTML = `
        <div class="upgradeName">${choice.name}</div>
        <div class="upgradeTag">${choice.tag}</div>
        <div class="upgradeDesc">${choice.desc}</div>
      `;
      card.onclick = () => chooseUpgrade(choice);
      panel.append(card);
    }
    overlay.append(panel);
    footer.textContent = `Level ${state.player.level} reached. Think like an RPG build, not a one-off shooter loadout.`;
    return;
  }

  if (mode === "gameover") {
    title.textContent = "Run Over";
    lead.innerHTML = `
      You were overwhelmed in wave ${state.wave}. Final score: <strong>${Math.floor(state.score)}</strong>.
      Best score: <strong>${state.bestScore}</strong>.
    `;
    const restart = button("Restart", "primary", startRun);
    const titleBtn = button("Back to Title", "", enterTitle);
    actionRow.append(restart, titleBtn);
    footer.textContent = "Each run is short on purpose. Make the next build cleaner and faster.";
  }
}

function button(label, cls, onClick) {
  const btn = document.createElement("button");
  if (cls) btn.className = cls;
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

const keys = new Set();
const pointer = {
  x: 0,
  y: 0,
  worldX: W / 2,
  worldY: H / 2,
  active: false,
  down: false,
};

let dpr = 1;
let viewW = 0;
let viewH = 0;
let camX = 0;
let camY = 0;
let shake = 0;
let shakeX = 0;
let shakeY = 0;
let lastTime = 0;

const bgStars = Array.from({ length: 220 }, () => ({
  x: Math.random(),
  y: Math.random(),
  z: rand(0.25, 1),
  hue: rand(190, 230),
}));

const state = {
  mode: "title",
  classId: "knight",
  score: 0,
  bestScore: Number(localStorage.getItem("nova_drift_best") || 0),
  wave: 1,
  waveTimer: 0,
  waveDuration: 28,
  xp: 0,
  nextLevelXp: 55,
  spawnBudget: 0,
  scorePulse: 0,
  upgradeChoices: [],
  player: null,
  bullets: [],
  enemies: [],
  shards: [],
  particles: [],
  enemyBolts: [],
  drones: [],
  pulseCooldown: 0,
  backgroundPulse: 0,
  dashHintTimer: 0,
};

function freshPlayer(classId = "knight") {
  const base = {
    x: W * 0.5,
    y: H * 0.5 + 180,
    vx: 0,
    vy: 0,
    angle: 0,
    hp: 100,
    maxHp: 100,
    shield: 40,
    maxShield: 40,
    shieldRegen: 7,
    shieldDelay: 0,
    shieldDelayMax: 1.75,
    level: 1,
    fireCd: 0,
    fireDelay: 0.16,
    bulletDamage: 9,
    bulletSpeed: 920,
    bulletCount: 1,
    bulletSpread: 0.06,
    bulletSize: 4,
    moveSpeed: 360,
    accel: 1900,
    drag: 0.86,
    magnet: 120,
    dashCd: 0,
    dashDelay: 1.25,
    dashPower: 1080,
    dashTime: 0,
    dashInvuln: 0,
    pulse: 0,
    pulseDamage: 28,
    pulseRadius: 150,
    pulseCharge: 0,
    pulseChargeMax: 100,
    pulseReady: false,
    critChance: 0.05,
    critMult: 1.7,
    bonusScore: 0,
    aimLock: 0,
  };
  if (classId === "ranger") {
    base.maxHp = 88;
    base.hp = 88;
    base.maxShield = 52;
    base.shield = 52;
    base.fireDelay = 0.12;
    base.bulletDamage = 8;
    base.bulletCount = 2;
    base.bulletSpread = 0.08;
    base.moveSpeed = 410;
    base.magnet = 150;
  } else if (classId === "mage") {
    base.maxHp = 76;
    base.hp = 76;
    base.maxShield = 68;
    base.shield = 68;
    base.fireDelay = 0.1;
    base.bulletDamage = 10;
    base.bulletSpeed = 980;
    base.pulseDamage = 40;
    base.pulseRadius = 190;
    base.shieldRegen = 9;
    base.critChance = 0.08;
  } else {
    base.maxHp = 122;
    base.hp = 122;
    base.maxShield = 36;
    base.shield = 36;
    base.fireDelay = 0.18;
    base.bulletDamage = 11;
    base.dashPower = 1180;
    base.moveSpeed = 330;
  }
  return base;
}

const upgradePool = [
  {
    id: "overclock",
    name: "Overclocked Cannon",
    tag: "Weapon",
    desc: "+30% fire rate and +12% bullet speed. Your ship starts to feel unfair in the best way.",
    apply(p) {
      p.fireDelay *= 0.76;
      p.bulletSpeed *= 1.12;
    },
  },
  {
    id: "splitter",
    name: "Splitter Rounds",
    tag: "Weapon",
    desc: "Fire 2 extra bullets with a wider spread. Great for clearing swarms.",
    apply(p) {
      p.bulletCount += 2;
      p.bulletSpread += 0.08;
    },
  },
  {
    id: "plating",
    name: "Reactive Plating",
    tag: "Defense",
    desc: "+28 max hull and +12 max shield. You can afford a bad dodge or two.",
    apply(p) {
      p.maxHp += 28;
      p.hp += 28;
      p.maxShield += 12;
      p.shield += 12;
    },
  },
  {
    id: "magnet",
    name: "Shard Magnet",
    tag: "Utility",
    desc: "Increase pickup attraction and add a little more room to breathe between fights.",
    apply(p) {
      p.magnet += 110;
      p.moveSpeed *= 1.06;
    },
  },
  {
    id: "dash",
    name: "Afterburn Dash",
    tag: "Mobility",
    desc: "-22% dash cooldown and a longer invulnerability window while dashing.",
    apply(p) {
      p.dashDelay *= 0.78;
      p.dashPower *= 1.08;
      p.dashInvuln = Math.min(0.32, p.dashInvuln + 0.05);
    },
  },
  {
    id: "drone",
    name: "Orbit Drone",
    tag: "Support",
    desc: "Adds a loyal drone that orbits you and auto-fires at the nearest enemy.",
    apply(p) {
      state.drones.push({
        angle: Math.random() * TAU,
        radius: 82,
        fireCd: 0,
        fireDelay: 0.65,
        damage: 7,
        speed: 820,
        size: 5,
      });
    },
  },
  {
    id: "pulse",
    name: "Shock Pulse",
    tag: "Special",
    desc: "Your pulse becomes stronger, larger, and charges faster from kills.",
    apply(p) {
      p.pulseDamage += 18;
      p.pulseRadius += 36;
      p.pulseChargeMax = Math.max(70, p.pulseChargeMax - 10);
    },
  },
  {
    id: "focus",
    name: "Targeting Suite",
    tag: "Weapon",
    desc: "Critical hits become more common and deal extra damage.",
    apply(p) {
      p.critChance += 0.08;
      p.critMult += 0.15;
    },
  },
];

function enterTitle() {
  state.mode = "title";
  state.player = freshPlayer(state.classId);
  state.score = 0;
  state.wave = 1;
  state.waveTimer = 0;
  state.waveDuration = 28;
  state.xp = 0;
  state.nextLevelXp = 55;
  state.spawnBudget = 0;
  state.scorePulse = 0;
  state.upgradeChoices = [];
  state.bullets = [];
  state.enemies = [];
  state.shards = [];
  state.particles = [];
  state.enemyBolts = [];
  state.drones = [];
  state.pulseCooldown = 0;
  state.backgroundPulse = 0;
  state.dashHintTimer = 0;
  camX = state.player.x - viewW * 0.5;
  camY = state.player.y - viewH * 0.5;
  shake = 0;
  buildOverlay("title");
  syncHud();
}

function startRun(classId = state.classId) {
  state.classId = classId;
  state.mode = "playing";
  state.player = freshPlayer(classId);
  state.score = 0;
  state.wave = 1;
  state.waveTimer = 0;
  state.waveDuration = 28;
  state.xp = 0;
  state.nextLevelXp = 55;
  state.spawnBudget = 0;
  state.scorePulse = 0;
  state.upgradeChoices = [];
  state.bullets = [];
  state.enemies = [];
  state.shards = [];
  state.particles = [];
  state.enemyBolts = [];
  state.drones = [];
  state.pulseCooldown = 0;
  state.backgroundPulse = 0;
  state.dashHintTimer = 4;
  camX = state.player.x - viewW * 0.5;
  camY = state.player.y - viewH * 0.5;
  shake = 0;
  overlay.classList.remove("active");
  syncHud();
}

function endRun() {
  state.mode = "gameover";
  state.bestScore = Math.max(state.bestScore, Math.floor(state.score));
  localStorage.setItem("nova_drift_best", String(state.bestScore));
  buildOverlay("gameover");
  syncHud();
}

function levelUp() {
  state.player.level += 1;
  state.player.maxHp += 8;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 16);
  state.player.maxShield += 4;
  state.player.shield = Math.min(state.player.maxShield, state.player.shield + 12);
  state.player.fireDelay = Math.max(0.075, state.player.fireDelay * 0.98);
  state.player.pulseCharge = 0;
  state.player.pulseReady = false;
  state.upgradeChoices = pickUpgrades();
  state.mode = "upgrade";
  buildOverlay("upgrade");
}

function pickUpgrades() {
  const pool = [...upgradePool];
  const picks = [];
  while (picks.length < 3 && pool.length) {
    const idx = randi(0, pool.length - 1);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

function chooseUpgrade(choice) {
  if (state.mode !== "upgrade") return;
  choice.apply(state.player);
  if (state.player.shield > state.player.maxShield) state.player.shield = state.player.maxShield;
  if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
  state.mode = "playing";
  state.upgradeChoices = [];
  overlay.classList.remove("active");
  syncHud();
}

function syncHud() {
  const p = state.player;
  statScore.valueEl.textContent = `${Math.floor(state.score)}`;
  statWave.valueEl.textContent = `${state.wave}`;
  statHull.valueEl.textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
  statShield.valueEl.textContent = `${Math.ceil(p.shield)}/${p.maxShield}`;
  statHull.fillEl.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
  statShield.fillEl.style.width = `${clamp((p.shield / p.maxShield) * 100, 0, 100)}%`;
}

function resize() {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  canvas.width = Math.floor(viewW * dpr);
  canvas.height = Math.floor(viewH * dpr);
  canvas.style.width = `${viewW}px`;
  canvas.style.height = `${viewH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

function screenToWorld(sx, sy) {
  return {
    x: sx + camX,
    y: sy + camY,
  };
}

canvas.addEventListener("pointermove", (ev) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ev.clientX - rect.left;
  pointer.y = ev.clientY - rect.top;
  const world = screenToWorld(pointer.x, pointer.y);
  pointer.worldX = world.x;
  pointer.worldY = world.y;
  pointer.active = true;
});

canvas.addEventListener("pointerdown", (ev) => {
  pointer.down = true;
  pointer.active = true;
  canvas.setPointerCapture(ev.pointerId);
  if (state.mode === "title") startRun();
});

canvas.addEventListener("pointerup", () => {
  pointer.down = false;
});

canvas.addEventListener("pointerleave", () => {
  pointer.down = false;
});

window.addEventListener("keydown", (ev) => {
  if (ev.code === "Space") ev.preventDefault();
  keys.add(ev.code);
  if (ev.code === "Enter" && state.mode === "title") startRun();
  if (ev.code === "Enter" && state.mode === "gameover") startRun();
  if (ev.code === "Escape" && state.mode === "playing") enterTitle();
});

window.addEventListener("keyup", (ev) => {
  keys.delete(ev.code);
});

function addParticle(x, y, vx, vy, life, color, size = 2, glow = 10) {
  state.particles.push({ x, y, vx, vy, life, age: 0, color, size, glow });
}

function addScore(amount, x, y) {
  state.score += amount;
  state.scorePulse = Math.min(1, state.scorePulse + 0.35);
  if (x != null && y != null) {
    for (let i = 0; i < 3; i++) {
      addParticle(x, y, rand(-40, 40), rand(-40, 40), 0.45, "rgba(126,247,212,0.8)", 1.8, 8);
    }
  }
}

function spawnEnemy(type) {
  const side = randi(0, 3);
  const pad = 110;
  let x = 0;
  let y = 0;
  if (side === 0) {
    x = rand(-pad, viewW + pad) + camX;
    y = camY - pad;
  } else if (side === 1) {
    x = camX + viewW + pad;
    y = rand(-pad, viewH + pad) + camY;
  } else if (side === 2) {
    x = rand(-pad, viewW + pad) + camX;
    y = camY + viewH + pad;
  } else {
    x = camX - pad;
    y = rand(-pad, viewH + pad) + camY;
  }

  const difficulty = 1 + (state.wave - 1) * 0.12;
  const base = {
    drone: { hp: 18, speed: 180, damage: 11, r: 13, color: "#67f7d4", score: 10, xp: 10 },
    striker: { hp: 34, speed: 110, damage: 8, r: 18, color: "#8fb5ff", score: 16, xp: 14 },
    brute: { hp: 88, speed: 76, damage: 18, r: 26, color: "#ff7b88", score: 30, xp: 22 },
  }[type];

  return {
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: Math.round(base.hp * difficulty),
    maxHp: Math.round(base.hp * difficulty),
    speed: base.speed * lerp(1, 1.18, Math.min(1, state.wave / 10)),
    damage: base.damage * difficulty,
    r: base.r,
    color: base.color,
    score: base.score,
    xp: base.xp,
    fireCd: type === "striker" ? rand(0.4, 1.1) : 0,
    stun: 0,
    windup: 0,
  };
}

function spawnShard(x, y, value = 8) {
  const a = rand(0, TAU);
  state.shards.push({
    x,
    y,
    vx: Math.cos(a) * rand(30, 130),
    vy: Math.sin(a) * rand(30, 130),
    value,
    life: 8,
    glow: rand(10, 18),
  });
}

function shoot(originX, originY, angle, damageBoost = 1, speedBoost = 1, spread = 0) {
  const p = state.player;
  const shotCount = p.bulletCount;
  const start = -(shotCount - 1) * 0.5;
  for (let i = 0; i < shotCount; i++) {
    const offset = (start + i) * p.bulletSpread;
    const theta = angle + offset + spread;
    state.bullets.push({
      x: originX + Math.cos(theta) * 16,
      y: originY + Math.sin(theta) * 16,
      vx: Math.cos(theta) * p.bulletSpeed * speedBoost,
      vy: Math.sin(theta) * p.bulletSpeed * speedBoost,
      life: 1.3,
      damage: p.bulletDamage * damageBoost,
      r: p.bulletSize,
      color: i === 0 ? "#7ef7d4" : "#8fb5ff",
      pierce: i === 0 ? 1 : 0,
    });
  }
}

function triggerPulse() {
  const p = state.player;
  state.pulseCooldown = 1.2;
  p.pulseReady = false;
  p.pulseCharge = 0;
  state.backgroundPulse = 0.7;
  shake = Math.max(shake, 12);
  for (const enemy of state.enemies) {
    const d = dist(p.x, p.y, enemy.x, enemy.y);
    if (d <= p.pulseRadius * 1.2) {
      enemy.hp -= p.pulseDamage * clamp(1.35 - d / p.pulseRadius, 0.4, 1.35);
      enemy.stun = Math.max(enemy.stun, 0.28);
    }
  }
  for (let i = 0; i < 70; i++) {
    const a = rand(0, TAU);
    const s = rand(p.pulseRadius * 0.5, p.pulseRadius * 1.1);
    addParticle(
      p.x + Math.cos(a) * s,
      p.y + Math.sin(a) * s,
      Math.cos(a) * rand(40, 280),
      Math.sin(a) * rand(40, 280),
      rand(0.4, 0.8),
      "rgba(126,247,212,0.9)",
      rand(1.5, 3.5),
      12,
    );
  }
}

function damagePlayer(amount) {
  const p = state.player;
  if (p.dashInvuln > 0) return;
  let rem = amount;
  if (p.shield > 0) {
    const used = Math.min(p.shield, rem);
    p.shield -= used;
    rem -= used;
    p.shieldDelay = p.shieldDelayMax;
  }
  if (rem > 0) {
    p.hp -= rem;
    p.shieldDelay = p.shieldDelayMax;
    flash.classList.add("show");
    setTimeout(() => flash.classList.remove("show"), 70);
    shake = Math.max(shake, 9);
  }
  if (p.hp <= 0) {
    p.hp = 0;
    endRun();
  }
}

function findAimAngle() {
  const p = state.player;
  if (pointer.active) {
    return Math.atan2(pointer.worldY - p.y, pointer.worldX - p.x);
  }
  let best = null;
  let bestD = Infinity;
  for (const enemy of state.enemies) {
    const d = dist(p.x, p.y, enemy.x, enemy.y);
    if (d < bestD) {
      bestD = d;
      best = enemy;
    }
  }
  if (best) return Math.atan2(best.y - p.y, best.x - p.x);
  return p.angle;
}

function updatePlayer(dt) {
  const p = state.player;
  let mx = 0;
  let my = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) mx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) mx += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) my -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) my += 1;

  if (mx || my) {
    const l = len(mx, my);
    mx /= l;
    my /= l;
    p.vx += mx * p.accel * dt;
    p.vy += my * p.accel * dt;
  }

  const dashPressed = keys.has("Space");
  if (dashPressed && p.dashCd <= 0) {
    const dashAngle = mx || my ? Math.atan2(my, mx) : p.angle;
    p.vx += Math.cos(dashAngle) * p.dashPower;
    p.vy += Math.sin(dashAngle) * p.dashPower;
    p.dashCd = p.dashDelay;
    p.dashTime = 0.16;
    p.dashInvuln = 0.22;
    state.dashHintTimer = 0;
    for (let i = 0; i < 18; i++) {
      const a = dashAngle + Math.PI + rand(-0.55, 0.55);
      addParticle(p.x, p.y, Math.cos(a) * rand(100, 420), Math.sin(a) * rand(100, 420), rand(0.2, 0.5), "rgba(143,181,255,0.8)", rand(1, 2.5), 10);
    }
    shake = Math.max(shake, 4);
  }

  const speed = Math.hypot(p.vx, p.vy);
  const maxSpeed = p.moveSpeed * (p.dashTime > 0 ? 1.35 : 1);
  if (speed > maxSpeed) {
    const m = maxSpeed / speed;
    p.vx *= m;
    p.vy *= m;
  }

  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.vx *= Math.pow(p.drag, dt * 60);
  p.vy *= Math.pow(p.drag, dt * 60);
  p.x = clamp(p.x, 36, W - 36);
  p.y = clamp(p.y, 36, H - 36);

  p.angle = lerp(p.angle, findAimAngle(), 1 - Math.pow(0.001, dt));

  p.fireCd -= dt;
  if (p.fireCd <= 0) {
    const damageBoost = Math.random() < p.critChance ? p.critMult : 1;
    shoot(p.x, p.y, p.angle, damageBoost, 1, 0);
    p.fireCd = p.fireDelay;
  }

  if (p.dashCd > 0) p.dashCd -= dt;
  if (p.dashTime > 0) p.dashTime -= dt;
  if (p.dashInvuln > 0) p.dashInvuln -= dt;

  if (p.shieldDelay > 0) {
    p.shieldDelay -= dt;
  } else if (p.shield < p.maxShield) {
    p.shield = Math.min(p.maxShield, p.shield + p.shieldRegen * dt);
  }

  if (keys.has("KeyE") && state.pulseCooldown <= 0 && p.pulseCharge >= p.pulseChargeMax) {
    triggerPulse();
  }

  if (!keys.has("KeyE") && p.pulseCharge >= p.pulseChargeMax) p.pulseReady = true;

  if (state.dashHintTimer > 0) state.dashHintTimer -= dt;
}

function updateDrones(dt) {
  const p = state.player;
  for (const drone of state.drones) {
    drone.angle += dt * 2.8;
    const dx = p.x + Math.cos(drone.angle) * drone.radius;
    const dy = p.y + Math.sin(drone.angle) * drone.radius;
    drone.x = dx;
    drone.y = dy;
    drone.fireCd -= dt;
    if (drone.fireCd <= 0) {
      let target = null;
      let best = 99999;
      for (const enemy of state.enemies) {
        const d = dist(drone.x, drone.y, enemy.x, enemy.y);
        if (d < best) {
          best = d;
          target = enemy;
        }
      }
      if (target) {
        const a = Math.atan2(target.y - drone.y, target.x - drone.x);
        state.bullets.push({
          x: drone.x,
          y: drone.y,
          vx: Math.cos(a) * drone.speed,
          vy: Math.sin(a) * drone.speed,
          life: 1.2,
          damage: drone.damage,
          r: drone.size,
          color: "#ffd76a",
          pierce: 0,
        });
        drone.fireCd = drone.fireDelay;
      }
    }
  }
}

function updateEnemies(dt) {
  const p = state.player;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.stun > 0) {
      e.stun -= dt;
    }

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d;
    const uy = dy / d;

    if (e.type === "striker") {
      const ideal = 320;
      const chase = d > ideal ? 1 : -0.55;
      e.vx = lerp(e.vx, ux * e.speed * chase, 0.08);
      e.vy = lerp(e.vy, uy * e.speed * chase, 0.08);
      e.fireCd -= dt;
      if (e.fireCd <= 0 && d < 700) {
        const a = Math.atan2(dy, dx);
        state.enemyBolts.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(a) * 480,
          vy: Math.sin(a) * 480,
          life: 2.1,
          damage: 10 + state.wave * 0.9,
          r: 4,
          color: "#8fb5ff",
        });
        e.fireCd = rand(1.0, 1.6);
      }
    } else if (e.type === "brute") {
      if (d > 60) {
        e.vx = lerp(e.vx, ux * e.speed * 0.95, 0.05);
        e.vy = lerp(e.vy, uy * e.speed * 0.95, 0.05);
      } else {
        e.vx *= 0.92;
        e.vy *= 0.92;
      }
    } else {
      e.vx = lerp(e.vx, ux * e.speed, 0.08);
      e.vy = lerp(e.vy, uy * e.speed, 0.08);
    }

    if (e.stun <= 0) {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
    }

    if (d < e.r + 16) {
      damagePlayer(e.damage * dt * 6);
      e.hp -= dt * 18;
      p.pulseCharge = Math.min(p.pulseChargeMax, p.pulseCharge + dt * 15);
    }

    if (e.hp <= 0) {
      killEnemy(i);
    }
  }
}

function killEnemy(index) {
  const e = state.enemies[index];
  state.enemies.splice(index, 1);
  addScore(e.score, e.x, e.y);
  state.xp += e.xp;
  state.player.pulseCharge = Math.min(state.player.pulseChargeMax, state.player.pulseCharge + e.xp * 0.55 + 10);
  state.player.bonusScore += e.score;
  state.backgroundPulse = Math.min(1, state.backgroundPulse + 0.08);
  shake = Math.max(shake, e.type === "brute" ? 6 : 3);
  for (let i = 0; i < (e.type === "brute" ? 18 : 10); i++) {
    const a = rand(0, TAU);
    addParticle(e.x, e.y, Math.cos(a) * rand(80, 280), Math.sin(a) * rand(80, 280), rand(0.25, 0.7), e.color, rand(1.5, 3.5), 12);
  }
  const dropCount = e.type === "brute" ? 5 : e.type === "striker" ? 3 : 2;
  for (let i = 0; i < dropCount; i++) spawnShard(e.x + rand(-18, 18), e.y + rand(-18, 18), e.type === "brute" ? 15 : 8);
}

function updateBullets(dt) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.life <= 0 || b.x < -50 || b.y < -50 || b.x > W + 50 || b.y > H + 50) {
      state.bullets.splice(i, 1);
      continue;
    }
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const e = state.enemies[j];
      if (dist(b.x, b.y, e.x, e.y) < b.r + e.r) {
        const crit = b.color === "#ffd76a" ? 1.15 : 1;
        e.hp -= b.damage * crit;
        for (let k = 0; k < 4; k++) {
          addParticle(b.x, b.y, rand(-120, 120), rand(-120, 120), rand(0.12, 0.28), b.color, rand(1, 2.2), 10);
        }
        if (b.pierce > 0) {
          b.pierce -= 1;
          b.damage *= 0.87;
        } else {
          state.bullets.splice(i, 1);
        }
        if (e.hp <= 0) killEnemy(j);
        break;
      }
    }
  }

  for (let i = state.enemyBolts.length - 1; i >= 0; i--) {
    const b = state.enemyBolts[i];
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.life <= 0 || b.x < -50 || b.y < -50 || b.x > W + 50 || b.y > H + 50) {
      state.enemyBolts.splice(i, 1);
      continue;
    }
    if (dist(b.x, b.y, state.player.x, state.player.y) < b.r + 12) {
      damagePlayer(b.damage);
      state.enemyBolts.splice(i, 1);
      for (let k = 0; k < 5; k++) addParticle(b.x, b.y, rand(-120, 120), rand(-120, 120), rand(0.1, 0.24), b.color, 1.5, 10);
    }
  }
}

function updateShards(dt) {
  const p = state.player;
  for (let i = state.shards.length - 1; i >= 0; i--) {
    const s = state.shards[i];
    s.life -= dt;
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const d = Math.hypot(dx, dy);
    if (d < p.magnet) {
      const pull = 280 + (p.magnet - d) * 3.1;
      s.vx += (dx / (d || 1)) * pull * dt;
      s.vy += (dy / (d || 1)) * pull * dt;
    }
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vx *= Math.pow(0.92, dt * 60);
    s.vy *= Math.pow(0.92, dt * 60);
    if (d < 18) {
      state.xp += s.value;
      state.score += s.value * 0.65;
      state.player.pulseCharge = Math.min(state.player.pulseChargeMax, state.player.pulseCharge + 3);
      state.shards.splice(i, 1);
      for (let k = 0; k < 5; k++) addParticle(s.x, s.y, rand(-80, 80), rand(-80, 80), rand(0.12, 0.32), "rgba(255,215,106,0.95)", 1.5, 9);
    } else if (s.life <= 0) {
      state.shards.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.9, dt * 60);
    p.vy *= Math.pow(0.9, dt * 60);
    if (p.age >= p.life) state.particles.splice(i, 1);
  }
}

function updateWaves(dt) {
  state.waveTimer += dt;
  const p = state.player;
  if (state.waveTimer >= state.waveDuration) {
    state.waveTimer = 0;
    state.wave += 1;
    state.waveDuration = Math.max(18, 28 - state.wave * 0.55);
    state.backgroundPulse = 1;
    shake = Math.max(shake, 3);
  }

  const baseRate = 1.8 + state.wave * 0.7;
  state.spawnBudget += dt * baseRate;
  while (state.spawnBudget >= 1) {
    state.spawnBudget -= 1;
    const roll = Math.random();
    const type = state.wave < 3 ? "drone" : state.wave < 6 ? (roll < 0.72 ? "drone" : "striker") : roll < 0.52 ? "drone" : roll < 0.83 ? "striker" : "brute";
    state.enemies.push(spawnEnemy(type));
  }

  const levelGain = state.xp >= state.nextLevelXp;
  if (levelGain && state.mode === "playing") {
    state.xp -= state.nextLevelXp;
    state.nextLevelXp = Math.floor(state.nextLevelXp * 1.22 + 18);
    levelUp();
  }

  if (p.pulseReady) {
    state.dashHintTimer += dt;
  }
}

function updateCamera(dt) {
  const p = state.player;
  const targetX = clamp(p.x - viewW * 0.5, 0, Math.max(0, W - viewW));
  const targetY = clamp(p.y - viewH * 0.5, 0, Math.max(0, H - viewH));
  camX = lerp(camX, targetX, 1 - Math.pow(0.001, dt));
  camY = lerp(camY, targetY, 1 - Math.pow(0.001, dt));
  if (shake > 0) {
    shake -= dt * 18;
    const intensity = Math.max(0, shake);
    shakeX = rand(-intensity, intensity);
    shakeY = rand(-intensity, intensity);
  } else {
    shakeX = 0;
    shakeY = 0;
  }
}

function update(dt) {
  if (state.mode !== "playing") return;
  updatePlayer(dt);
  updateDrones(dt);
  updateWaves(dt);
  updateEnemies(dt);
  updateBullets(dt);
  updateShards(dt);
  updateParticles(dt);
  updateCamera(dt);
  state.pulseCooldown = Math.max(0, state.pulseCooldown - dt);
  state.backgroundPulse = Math.max(0, state.backgroundPulse - dt * 0.75);
  if (state.score > state.bestScore) {
    state.bestScore = Math.floor(state.score);
    localStorage.setItem("nova_drift_best", String(state.bestScore));
  }
  syncHud();
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, viewH);
  grad.addColorStop(0, "#0a1030");
  grad.addColorStop(0.55, "#050816");
  grad.addColorStop(1, "#03050d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(shakeX, shakeY);
  const glow = ctx.createRadialGradient(viewW * 0.5, viewH * 0.45, 40, viewW * 0.5, viewH * 0.45, Math.max(viewW, viewH) * 0.8);
  glow.addColorStop(0, `rgba(66, 115, 255, ${0.12 + state.backgroundPulse * 0.12})`);
  glow.addColorStop(0.4, "rgba(24, 34, 74, 0.08)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, viewW, viewH);

  for (const s of bgStars) {
    const px = ((s.x * W - camX * (0.12 + s.z * 0.06)) % W + W) % W;
    const py = ((s.y * H - camY * (0.12 + s.z * 0.06)) % H + H) % H;
    const sx = px / W * viewW;
    const sy = py / H * viewH;
    ctx.fillStyle = `hsla(${s.hue}, 90%, ${70 + s.z * 12}%, ${0.32 + s.z * 0.45})`;
    ctx.fillRect(sx, sy, s.z * 1.6, s.z * 1.6);
  }

  const gridStep = 140;
  ctx.strokeStyle = "rgba(143,181,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const startX = -((camX + shakeX) % gridStep);
  const startY = -((camY + shakeY) % gridStep);
  for (let x = startX; x < viewW; x += gridStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewH);
  }
  for (let y = startY; y < viewH; y += gridStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(viewW, y);
  }
  ctx.stroke();

  const borderGlow = ctx.createLinearGradient(0, 0, viewW, viewH);
  borderGlow.addColorStop(0, "rgba(126,247,212,0.22)");
  borderGlow.addColorStop(0.5, "rgba(143,181,255,0.12)");
  borderGlow.addColorStop(1, "rgba(255,110,138,0.18)");
  ctx.strokeStyle = borderGlow;
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, viewW - 28, viewH - 28);
  ctx.restore();
}

function worldToScreen(x, y) {
  return { x: x - camX + shakeX, y: y - camY + shakeY };
}

function drawShard(s) {
  const p = worldToScreen(s.x, s.y);
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = "rgba(255,215,106,0.18)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, s.glow, 0, TAU);
  ctx.fill();
  ctx.restore();
  drawSprite(sprites.shard, p.x, p.y, 2.6, (s.life * 2.5) % TAU);
}

function drawEnemy(e) {
  const p = worldToScreen(e.x, e.y);
  const pulse = 0.6 + Math.sin((lastTime * 0.004) + e.x * 0.01) * 0.1;
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = e.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, e.r * 1.9 + pulse * 2, 0, TAU);
  ctx.fill();
  ctx.restore();
  const sprite = e.type === "drone" ? sprites.drone : e.type === "striker" ? sprites.striker : sprites.brute;
  const scale = e.type === "drone" ? 4 : e.type === "striker" ? 4 : 4;
  drawSprite(sprite, p.x, p.y, scale);

  const hpW = e.r * 2.1;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(-hpW * 0.5, e.r + 10, hpW, 4);
  ctx.fillStyle = "rgba(255,110,138,0.9)";
  ctx.fillRect(-hpW * 0.5, e.r + 10, hpW * clamp(e.hp / e.maxHp, 0, 1), 4);
  ctx.restore();
}

function drawBullet(b) {
  const p = worldToScreen(b.x, b.y);
  const sprite = b.color === "#ff7b88" ? sprites.bolt : sprites.bullet;
  drawSprite(sprite, p.x, p.y, 3);
}

function drawPlayer() {
  const p = state.player;
  const s = worldToScreen(p.x, p.y);
  const sprite = state.classId === "ranger" ? sprites.ranger : state.classId === "mage" ? sprites.mage : sprites.knight;
  if (p.dashTime > 0) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "rgba(126,247,212,0.5)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, 34, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  drawSprite(sprite, s.x, s.y, 5, p.angle + Math.PI * 0.5);

  if (p.shield > 0) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.strokeStyle = `rgba(111,184,255,${0.18 + (p.shield / p.maxShield) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 26 + (p.shield / p.maxShield) * 4, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const s = worldToScreen(p.x, p.y);
    const a = 1 - p.age / p.life;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(s.x, s.y);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.glow;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function drawPulseRing() {
  const p = state.player;
  if (p.pulseReady || p.pulseCharge > 0) {
    const ratio = clamp(p.pulseCharge / p.pulseChargeMax, 0, 1);
    const s = worldToScreen(p.x, p.y);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.strokeStyle = `rgba(126,247,212,${0.1 + ratio * 0.5})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, p.pulseRadius * ratio, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

function drawMinimap() {
  const x = viewW - 168;
  const y = 18;
  const w = 150;
  const h = 150;
  ctx.save();
  ctx.fillStyle = "rgba(11,18,32,0.72)";
  ctx.strokeStyle = "rgba(142,174,255,0.16)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
  const scaleX = w / W;
  const scaleY = h / H;
  ctx.fillStyle = "rgba(126,247,212,0.95)";
  const p = state.player;
  ctx.beginPath();
  ctx.arc(x + p.x * scaleX, y + p.y * scaleY, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,110,138,0.85)";
  for (const e of state.enemies.slice(0, 18)) {
    ctx.fillRect(x + e.x * scaleX, y + e.y * scaleY, 2, 2);
  }
  ctx.restore();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function render() {
  drawBackground();
  drawPulseRing();
  for (const s of state.shards) drawShard(s);
  for (const e of state.enemies) drawEnemy(e);
  for (const b of state.enemyBolts) drawBullet(b);
  for (const b of state.bullets) drawBullet(b);
  drawParticles();
  drawPlayer();
  drawMinimap();

  if (state.mode === "playing" && state.dashHintTimer > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "700 18px Trebuchet MS, sans-serif";
    ctx.fillText("Dash with Space to break the first trap", 30, viewH - 34);
    ctx.restore();
  }
}

function tick(ts) {
  if (!lastTime) lastTime = ts;
  const dt = Math.min(0.033, (ts - lastTime) / 1000);
  lastTime = ts;
  update(dt);
  render();
  requestAnimationFrame(tick);
}

enterTitle();
requestAnimationFrame(tick);
