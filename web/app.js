const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const norm = (x, y) => {
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
};

const STAGES = [
  { id: 1, title: "캐릭터 선택", desc: "6종족 중 하나를 고르세요." },
  { id: 2, title: "맵 구성", desc: "시작 마을과 월드맵이 생성됩니다." },
  { id: 3, title: "맵 이동", desc: "다음 지역으로 이동하세요." },
  { id: 4, title: "첫 조우", desc: "첫 전투 노드에서 적과 마주칩니다." },
  { id: 5, title: "전투 클리어", desc: "전투를 정리하고 다음 지역을 엽니다." },
  { id: 6, title: "레벨업", desc: "전투 보상으로 재능을 하나 고르세요." },
  { id: 7, title: "장비 장착", desc: "유물 하나를 장착해 빌드를 만드세요." },
  { id: 8, title: "퀘스트 수락", desc: "보스 사냥 목표를 수락합니다." },
  { id: 9, title: "보스 관문", desc: "보스 지역으로 들어가기 전 관문입니다." },
  { id: 10, title: "보스사냥", desc: "최종 보스를 쓰러뜨리세요." },
];

const RACES = [
  {
    id: "human",
    name: "Human",
    role: "Balanced Knight",
    color: "#9fb8ff",
    hp: 120,
    armor: 5,
    speed: 180,
    mana: 45,
    attackDamage: 16,
    attackCooldown: 0.46,
    attackKind: "slash",
    crit: 0.08,
    specialName: "Guard Stance",
    specialCost: 18,
    desc: "균형형. 방어와 공격이 안정적이다.",
  },
  {
    id: "elf",
    name: "Elf",
    role: "Swift Archer",
    color: "#7ef7d4",
    hp: 92,
    armor: 2,
    speed: 232,
    mana: 70,
    attackDamage: 13,
    attackCooldown: 0.34,
    attackKind: "bolt",
    crit: 0.18,
    specialName: "Arrow Rain",
    specialCost: 24,
    desc: "빠르고 치명타가 높다. 원거리 중심.",
  },
  {
    id: "dwarf",
    name: "Dwarf",
    role: "Iron Hammer",
    color: "#ffd76a",
    hp: 150,
    armor: 8,
    speed: 158,
    mana: 30,
    attackDamage: 20,
    attackCooldown: 0.68,
    attackKind: "slam",
    crit: 0.06,
    specialName: "Earth Shock",
    specialCost: 20,
    desc: "튼튼하고 무겁다. 광역 제압에 강하다.",
  },
  {
    id: "orc",
    name: "Orc",
    role: "Berserker",
    color: "#ff7b88",
    hp: 168,
    armor: 5,
    speed: 170,
    mana: 28,
    attackDamage: 22,
    attackCooldown: 0.58,
    attackKind: "cleave",
    crit: 0.05,
    specialName: "Blood Rage",
    specialCost: 22,
    desc: "높은 체력과 폭발적인 근접 피해.",
  },
  {
    id: "seraph",
    name: "Seraph",
    role: "Holy Mage",
    color: "#f0d8ff",
    hp: 104,
    armor: 4,
    speed: 206,
    mana: 90,
    attackDamage: 14,
    attackCooldown: 0.4,
    attackKind: "holy",
    crit: 0.1,
    specialName: "Radiant Heal",
    specialCost: 26,
    desc: "회복과 방어가 강한 성스러운 종족.",
  },
  {
    id: "shade",
    name: "Shade",
    role: "Shadow Rogue",
    color: "#b39cff",
    hp: 84,
    armor: 2,
    speed: 244,
    mana: 60,
    attackDamage: 18,
    attackCooldown: 0.32,
    attackKind: "shadow",
    crit: 0.28,
    specialName: "Shadow Step",
    specialCost: 18,
    desc: "가장 빠르고 가장 위험하다. 치명타 중심.",
  },
];

const TALENTS = [
  {
    id: "vitality",
    name: "Vitality",
    tag: "Defense",
    desc: "+24 HP and +6 armor.",
    apply(p) {
      p.maxHp += 24;
      p.hp += 24;
      p.armor += 6;
    },
  },
  {
    id: "quickdraw",
    name: "Quickdraw",
    tag: "Offense",
    desc: "-18% attack cooldown and +10% projectile speed.",
    apply(p) {
      p.attackCooldown = Math.max(0.16, p.attackCooldown * 0.82);
      p.projectileSpeed *= 1.1;
    },
  },
  {
    id: "focus",
    name: "Focus",
    tag: "Crit",
    desc: "+12% critical chance and +1 mana regen.",
    apply(p) {
      p.crit += 0.12;
      p.manaRegen += 1;
    },
  },
];

const RELICS = [
  {
    id: "sunblade",
    name: "Sunblade",
    tag: "Weapon",
    desc: "+8 damage, attacks burn enemies for a moment.",
    apply(p) {
      p.attackDamage += 8;
      p.burn = true;
    },
  },
  {
    id: "moonmantle",
    name: "Moon Mantle",
    tag: "Defense",
    desc: "+18 shield and faster shield regen.",
    apply(p) {
      p.maxShield += 18;
      p.shield += 18;
      p.shieldRegen += 2;
    },
  },
  {
    id: "windboots",
    name: "Wind Boots",
    tag: "Mobility",
    desc: "+24 speed and longer dash.",
    apply(p) {
      p.speed += 24;
      p.dashDistance += 34;
    },
  },
];

const ENEMY_DEFS = {
  raider: {
    name: "Raider",
    hp: 34,
    speed: 120,
    damage: 7,
    color: "#ff7b88",
    r: 14,
    score: 20,
    xp: 14,
  },
  wisp: {
    name: "Wisp",
    hp: 24,
    speed: 160,
    damage: 5,
    color: "#7ef7d4",
    r: 12,
    score: 18,
    xp: 12,
    ranged: true,
  },
  brute: {
    name: "Brute",
    hp: 62,
    speed: 86,
    damage: 11,
    color: "#ffd76a",
    r: 18,
    score: 34,
    xp: 22,
  },
  archer: {
    name: "Ash Archer",
    hp: 26,
    speed: 148,
    damage: 6,
    color: "#9fb8ff",
    r: 12,
    score: 22,
    xp: 15,
    ranged: true,
  },
  shaman: {
    name: "Rune Shaman",
    hp: 30,
    speed: 112,
    damage: 4,
    color: "#b39cff",
    r: 14,
    score: 28,
    xp: 18,
    support: true,
  },
  stalker: {
    name: "Stalker",
    hp: 22,
    speed: 198,
    damage: 8,
    color: "#67f7d4",
    r: 11,
    score: 25,
    xp: 16,
    dashy: true,
  },
  shield: {
    name: "Shield Bearer",
    hp: 88,
    speed: 72,
    damage: 10,
    color: "#ffd76a",
    r: 20,
    score: 38,
    xp: 26,
    armored: true,
  },
  voidling: {
    name: "Voidling",
    hp: 16,
    speed: 176,
    damage: 4,
    color: "#7ef7d4",
    r: 10,
    score: 12,
    xp: 9,
  },
  boss: {
    name: "Eclipse Tyrant",
    hp: 420,
    speed: 104,
    damage: 13,
    color: "#b39cff",
    r: 28,
    score: 150,
    xp: 120,
    boss: true,
  },
};

const WORLD_PATH = [
  { id: "village", name: "Village of Dawn", kind: "safe", bg: ["#1d2a46", "#101726"], note: "시작 마을", stepTag: 2 },
  { id: "road", name: "Ember Road", kind: "combat", bg: ["#33212b", "#12131d"], note: "첫 조우", stepTag: 4 },
  { id: "forest", name: "Whisper Forest", kind: "reward", bg: ["#193523", "#0d1710"], note: "레벨업", stepTag: 6 },
  { id: "ruins", name: "Fallen Ruins", kind: "relic", bg: ["#313148", "#171723"], note: "장비", stepTag: 7 },
  { id: "shrine", name: "Moon Shrine", kind: "quest", bg: ["#25324a", "#141924"], note: "퀘스트", stepTag: 8 },
  { id: "pass", name: "Ash Pass", kind: "travel", bg: ["#3b2d25", "#17120e"], note: "보스 지역 접근", stepTag: 9 },
  { id: "gate", name: "Gate of Ash", kind: "bossPrep", bg: ["#4b2a3b", "#1b1016"], note: "보스 관문", stepTag: 9 },
  { id: "throne", name: "Eclipse Throne", kind: "boss", bg: ["#20203d", "#0d0d1a"], note: "최종 전투", stepTag: 10 },
];

const nodePositions = [
  { x: 140, y: 310 },
  { x: 300, y: 260 },
  { x: 470, y: 330 },
  { x: 650, y: 250 },
  { x: 840, y: 330 },
  { x: 1010, y: 245 },
  { x: 1180, y: 320 },
  { x: 1360, y: 255 },
];

const rootWrap = document.createElement("div");
rootWrap.className = "app";

const canvas = document.createElement("canvas");
canvas.className = "gameCanvas";
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context unavailable");
ctx.imageSmoothingEnabled = false;

const overlay = document.createElement("div");
overlay.className = "overlay";

const hud = document.createElement("div");
hud.className = "hud";

const topBar = document.createElement("div");
topBar.className = "topBar";

const leftInfo = document.createElement("div");
leftInfo.className = "panel";
leftInfo.innerHTML = `
  <div class="panelTitle">Eclipse Solo RPG</div>
  <div class="panelText">6종족, 10단계 진행, 솔로 보스사냥 루프.</div>
  <div class="panelSmall">단계: 캐릭터 선택 → 맵 구성 → 이동 → 전투 → 보스사냥</div>
`;

const stats = document.createElement("div");
stats.className = "stats";

const statStage = statBox("Stage", "1 / 10");
const statHp = statBox("HP", "0 / 0");
const statMana = statBox("Mana", "0 / 0");
const statGold = statBox("Gold", "0");
stats.append(statStage.box, statHp.box, statMana.box, statGold.box);
topBar.append(leftInfo, stats);

const bottomRow = document.createElement("div");
bottomRow.className = "bottomRow";

const stageList = document.createElement("div");
stageList.className = "stageList";

const objectiveBox = document.createElement("div");
objectiveBox.className = "panel objective";
objectiveBox.innerHTML = `
  <div class="panelTitle">Objective</div>
  <div class="panelText" id="objectiveText">캐릭터를 선택하세요.</div>
  <div class="panelSmall" id="subObjective">다음 진행을 위해 첫 단계부터 시작합니다.</div>
`;

const stageBanner = document.createElement("div");
stageBanner.className = "stageBanner";
stageBanner.textContent = "STAGE 1 - 캐릭터 선택";

const actionPanel = document.createElement("div");
actionPanel.className = "actionPanel";

bottomRow.append(stageList, objectiveBox, actionPanel);
hud.append(topBar, bottomRow);

rootWrap.append(canvas, stageBanner, overlay, hud);
root.append(rootWrap);

function statBox(label, value) {
  const box = document.createElement("div");
  box.className = "statBox";
  box.innerHTML = `
    <div class="statLabel">${label}</div>
    <div class="statValue">${value}</div>
  `;
  return {
    box,
    valueEl: box.querySelector(".statValue"),
  };
}

function makeButton(label, onClick, cls = "") {
  const btn = document.createElement("button");
  if (cls) btn.className = cls;
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

function makeCanvasSprite(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) throw new Error("Sprite canvas context unavailable");
  g.imageSmoothingEnabled = false;
  draw(g);
  return c;
}

function p(g, x, y, w, h, color) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function buildSprites() {
  return {
    human: makeCanvasSprite(16, 16, (g) => {
      p(g, 6, 1, 4, 2, "#dfe8ff");
      p(g, 5, 3, 6, 4, "#6f8fcc");
      p(g, 4, 6, 8, 6, "#24304b");
      p(g, 3, 7, 2, 5, "#9fb8ff");
      p(g, 11, 7, 2, 5, "#9fb8ff");
      p(g, 6, 11, 4, 3, "#edf3ff");
      p(g, 12, 5, 1, 7, "#ffd76a");
    }),
    elf: makeCanvasSprite(16, 16, (g) => {
      p(g, 6, 1, 4, 2, "#7ef7d4");
      p(g, 4, 3, 8, 4, "#22404f");
      p(g, 5, 6, 6, 6, "#10202c");
      p(g, 3, 7, 2, 5, "#7ef7d4");
      p(g, 11, 7, 2, 5, "#7ef7d4");
      p(g, 6, 11, 4, 3, "#edf3ff");
      p(g, 12, 4, 2, 8, "#ffd76a");
    }),
    dwarf: makeCanvasSprite(16, 16, (g) => {
      p(g, 5, 1, 6, 2, "#ffd76a");
      p(g, 4, 3, 8, 4, "#6c4b2d");
      p(g, 3, 6, 10, 6, "#3b2a2a");
      p(g, 4, 7, 2, 5, "#8d5c2c");
      p(g, 10, 7, 2, 5, "#8d5c2c");
      p(g, 6, 11, 4, 3, "#edf3ff");
      p(g, 12, 6, 2, 5, "#9fb8ff");
    }),
    orc: makeCanvasSprite(16, 16, (g) => {
      p(g, 5, 1, 6, 2, "#ffb06a");
      p(g, 4, 3, 8, 4, "#3c1520");
      p(g, 3, 6, 10, 6, "#0f2218");
      p(g, 3, 7, 2, 5, "#ff7b88");
      p(g, 11, 7, 2, 5, "#ff7b88");
      p(g, 6, 11, 4, 3, "#edf3ff");
      p(g, 12, 5, 2, 7, "#ffd76a");
    }),
    seraph: makeCanvasSprite(16, 16, (g) => {
      p(g, 6, 1, 4, 2, "#f0d8ff");
      p(g, 4, 3, 8, 4, "#6b5aa8");
      p(g, 3, 6, 10, 6, "#2f2d64");
      p(g, 2, 7, 2, 5, "#f0d8ff");
      p(g, 12, 7, 2, 5, "#f0d8ff");
      p(g, 6, 11, 4, 3, "#edf3ff");
      p(g, 12, 4, 1, 8, "#ffd76a");
    }),
    shade: makeCanvasSprite(16, 16, (g) => {
      p(g, 6, 1, 4, 2, "#b39cff");
      p(g, 4, 3, 8, 4, "#32265e");
      p(g, 3, 6, 10, 6, "#151427");
      p(g, 3, 7, 2, 5, "#8fb5ff");
      p(g, 11, 7, 2, 5, "#8fb5ff");
      p(g, 6, 11, 4, 3, "#edf3ff");
      p(g, 12, 5, 2, 7, "#67f7d4");
    }),
    archer: makeCanvasSprite(14, 14, (g) => {
      p(g, 5, 1, 4, 2, "#dfe8ff");
      p(g, 4, 3, 6, 4, "#27425f");
      p(g, 3, 6, 8, 5, "#132130");
      p(g, 2, 5, 2, 5, "#ffd76a");
      p(g, 10, 5, 2, 5, "#ffd76a");
      p(g, 4, 7, 6, 1, "#ff7b88");
      p(g, 5, 9, 2, 2, "#7ef7d4");
      p(g, 8, 9, 2, 2, "#7ef7d4");
      p(g, 11, 4, 2, 6, "#9fb8ff");
    }),
    shaman: makeCanvasSprite(16, 16, (g) => {
      p(g, 6, 1, 4, 2, "#f0d8ff");
      p(g, 4, 3, 8, 4, "#4f2f6f");
      p(g, 3, 6, 10, 7, "#221531");
      p(g, 2, 8, 2, 4, "#67f7d4");
      p(g, 12, 8, 2, 4, "#67f7d4");
      p(g, 5, 5, 6, 1, "#67f7d4");
      p(g, 5, 8, 6, 1, "#ff7b88");
      p(g, 6, 11, 4, 3, "#b39cff");
      p(g, 12, 5, 2, 7, "#ffd76a");
    }),
    stalker: makeCanvasSprite(14, 14, (g) => {
      p(g, 5, 1, 4, 2, "#9fb8ff");
      p(g, 4, 3, 6, 4, "#17394d");
      p(g, 3, 6, 8, 5, "#111826");
      p(g, 2, 7, 2, 3, "#b39cff");
      p(g, 10, 7, 2, 3, "#b39cff");
      p(g, 4, 8, 6, 1, "#ff7b88");
      p(g, 6, 10, 2, 2, "#67f7d4");
      p(g, 11, 4, 1, 6, "#ff7b88");
    }),
    shield: makeCanvasSprite(18, 18, (g) => {
      p(g, 6, 1, 6, 3, "#ffd76a");
      p(g, 4, 4, 10, 8, "#2e4d6e");
      p(g, 3, 6, 2, 5, "#9fb8ff");
      p(g, 13, 6, 2, 5, "#9fb8ff");
      p(g, 5, 12, 8, 2, "#102033");
      p(g, 6, 7, 2, 2, "#edf3ff");
      p(g, 10, 7, 2, 2, "#edf3ff");
      p(g, 5, 13, 8, 2, "#67f7d4");
      p(g, 5, 2, 2, 2, "#ff7b88");
      p(g, 11, 2, 2, 2, "#ff7b88");
    }),
    voidling: makeCanvasSprite(12, 12, (g) => {
      p(g, 5, 1, 2, 2, "#67f7d4");
      p(g, 3, 3, 6, 6, "#2a1e46");
      p(g, 4, 4, 4, 4, "#b39cff");
      p(g, 2, 5, 2, 2, "#7ef7d4");
      p(g, 8, 5, 2, 2, "#7ef7d4");
      p(g, 3, 8, 6, 1, "#ff7b88");
      p(g, 5, 9, 2, 2, "#edf3ff");
    }),
    raider: makeCanvasSprite(14, 14, (g) => {
      p(g, 5, 1, 4, 2, "#ff7b88");
      p(g, 4, 3, 6, 4, "#4a1d2c");
      p(g, 3, 6, 8, 5, "#25151f");
      p(g, 3, 7, 2, 3, "#ffb06a");
      p(g, 9, 7, 2, 3, "#ffb06a");
      p(g, 4, 8, 6, 1, "#ffd76a");
      p(g, 6, 10, 2, 2, "#ffd76a");
    }),
    wisp: makeCanvasSprite(14, 14, (g) => {
      p(g, 5, 1, 4, 2, "#7ef7d4");
      p(g, 4, 3, 6, 6, "#203348");
      p(g, 5, 4, 4, 4, "#9fb8ff");
      p(g, 3, 6, 2, 2, "#67f7d4");
      p(g, 9, 6, 2, 2, "#67f7d4");
      p(g, 4, 9, 6, 1, "#b39cff");
    }),
    brute: makeCanvasSprite(18, 18, (g) => {
      p(g, 6, 1, 6, 3, "#ffd76a");
      p(g, 4, 4, 10, 7, "#6a2230");
      p(g, 3, 6, 2, 5, "#ff7b88");
      p(g, 13, 6, 2, 5, "#ff7b88");
      p(g, 5, 12, 8, 2, "#2b1220");
      p(g, 6, 7, 2, 2, "#edf3ff");
      p(g, 10, 7, 2, 2, "#edf3ff");
      p(g, 5, 3, 2, 2, "#ff7b88");
      p(g, 11, 3, 2, 2, "#ff7b88");
    }),
    boss: makeCanvasSprite(24, 24, (g) => {
      p(g, 7, 1, 10, 4, "#b39cff");
      p(g, 6, 5, 12, 10, "#2a1a44");
      p(g, 5, 7, 2, 8, "#ff7b88");
      p(g, 17, 7, 2, 8, "#ff7b88");
      p(g, 8, 11, 8, 4, "#0d0f1c");
      p(g, 9, 12, 2, 2, "#67f7d4");
      p(g, 13, 12, 2, 2, "#67f7d4");
      p(g, 6, 2, 3, 2, "#ff7b88");
      p(g, 15, 2, 3, 2, "#ff7b88");
      p(g, 8, 14, 8, 2, "#ffd76a");
    }),
  };
}

const SPRITES = buildSprites();

function drawSprite(sprite, x, y, size, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const w = sprite.width * size;
  const h = sprite.height * size;
  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function createWorld() {
  return WORLD_PATH.map((node, index) => ({
    ...node,
    index,
    x: nodePositions[index].x,
    y: nodePositions[index].y,
    cleared: index === 0,
  }));
}

function createPlayer(race) {
  return {
    raceId: race.id,
    name: race.name,
    role: race.role,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    facing: 0,
    hp: race.hp,
    maxHp: race.hp,
    shield: 20,
    maxShield: 20,
    shieldRegen: 2,
    mana: race.mana,
    maxMana: race.mana,
    manaRegen: 2,
    armor: race.armor,
    speed: race.speed,
    attackDamage: race.attackDamage,
    attackCooldown: race.attackCooldown,
    attackTimer: 0,
    attackKind: race.attackKind,
    projectileSpeed: race.attackKind === "bolt" || race.attackKind === "holy" || race.attackKind === "shadow" ? 520 : 0,
    crit: race.crit,
    specialName: race.specialName,
    specialCost: race.specialCost,
    dashDistance: 70,
    burn: false,
    level: 1,
    xp: 0,
    nextXp: 50,
    gold: 0,
    talentPoints: 0,
    relics: [],
    specialTimer: 0,
    dashTimer: 0,
  };
}

const state = {
  phase: "title",
  stage: 1,
  race: null,
  player: null,
  world: createWorld(),
  currentNodeIndex: 0,
  targetNodeIndex: 0,
  travelT: 0,
  travelFrom: 0,
  travelTo: 0,
  mapFocus: 0,
  combat: null,
  projectiles: [],
  enemyProjectiles: [],
  particles: [],
  enemies: [],
  enemySpawnBudget: 0,
  overlayMode: "title",
  overlayData: null,
  lootChoices: [],
  talentChoices: [],
  questText: "",
  log: [],
  boss: null,
  time: 0,
  pointerX: 0,
  pointerY: 0,
  pointerWorldX: 0,
  pointerWorldY: 0,
  pointerDown: false,
  keys: new Set(),
  worldW: 1480,
  worldH: 420,
  arenaW: 920,
  arenaH: 540,
  overlayShown: true,
};

function logLine(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 5);
}

function updateStage(stage, objective, detail) {
  state.stage = stage;
  const objectiveText = document.getElementById("objectiveText");
  const subObjective = document.getElementById("subObjective");
  if (objectiveText) objectiveText.textContent = objective;
  if (subObjective) subObjective.textContent = detail || STAGES[stage - 1]?.desc || "";
  stageBanner.textContent = `STAGE ${stage} - ${STAGES[stage - 1]?.title || objective}`;
  stageBanner.classList.add("show");
  clearTimeout(updateStage._bannerTimer);
  updateStage._bannerTimer = setTimeout(() => stageBanner.classList.remove("show"), 1200);
  renderStageList();
  statStage.valueEl.textContent = `${stage} / 10`;
}

function renderStageList() {
  stageList.innerHTML = "";
  for (const item of STAGES) {
    const row = document.createElement("div");
    row.className = `stageRow ${item.id < state.stage ? "done" : item.id === state.stage ? "active" : ""}`;
    row.innerHTML = `
      <div class="stageNum">${item.id}</div>
      <div class="stageText">
        <div class="stageTitle">${item.title}</div>
        <div class="stageDesc">${item.desc}</div>
      </div>
    `;
    stageList.append(row);
  }
}

function setOverlay(mode, data = null) {
  state.overlayMode = mode;
  state.overlayData = data;
  overlay.innerHTML = "";
  overlay.classList.toggle("show", mode !== "none");

  if (mode === "none") return;

  const card = document.createElement("div");
  card.className = "overlayCard";
  overlay.append(card);

  if (mode === "title") {
    card.innerHTML = `
      <div class="overlayTitle">Eclipse Solo RPG</div>
      <div class="overlayLead">6종족을 고르고, 월드맵을 이동하고, 보스까지 잡는 솔로 액션 RPG입니다.</div>
      <div class="overlayMini">진행 흐름: 캐릭터 선택 -> 맵 구성 -> 이동 -> 첫 조우 -> 전투 -> 레벨업 -> 장비 -> 퀘스트 -> 관문 -> 보스사냥</div>
    `;
    const row = document.createElement("div");
    row.className = "buttonRow";
    row.append(
      makeButton("시작하기", () => {
        setOverlay("race");
      }, "primary"),
    );
    card.append(row);
    return;
  }

  if (mode === "race") {
    card.innerHTML = `
      <div class="overlayTitle">캐릭터 선택</div>
      <div class="overlayLead">6종족 중 하나를 선택하세요. 종족마다 체력, 이동, 공격 방식이 다릅니다.</div>
    `;
    const grid = document.createElement("div");
    grid.className = "raceGrid";
    for (const race of RACES) {
      const btn = document.createElement("button");
      btn.className = "raceCard";
      const icon = SPRITES[race.id];
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const g = c.getContext("2d");
      if (g && icon) {
        g.imageSmoothingEnabled = false;
        g.fillStyle = "rgba(255,255,255,0.04)";
        g.fillRect(0, 0, 64, 64);
        g.drawImage(icon, 8, 8, 48, 48);
      }
      btn.append(c);
      const meta = document.createElement("div");
      meta.className = "raceMeta";
      meta.innerHTML = `
        <div class="raceName">${race.name}</div>
        <div class="raceRole">${race.role}</div>
        <div class="raceDesc">${race.desc}</div>
      `;
      btn.append(meta);
      btn.onclick = () => chooseRace(race);
      grid.append(btn);
    }
    card.append(grid);
    return;
  }

  if (mode === "reward") {
    card.innerHTML = `
      <div class="overlayTitle">레벨업</div>
      <div class="overlayLead">재능 하나를 고르세요.</div>
    `;
    const grid = document.createElement("div");
    grid.className = "choiceGrid";
    for (const talent of state.talentChoices) {
      const btn = document.createElement("button");
      btn.className = "choiceCard";
      btn.innerHTML = `
        <div class="choiceTitle">${talent.name}</div>
        <div class="choiceTag">${talent.tag}</div>
        <div class="choiceDesc">${talent.desc}</div>
      `;
      btn.onclick = () => applyTalent(talent);
      grid.append(btn);
    }
    card.append(grid);
    return;
  }

  if (mode === "loot") {
    card.innerHTML = `
      <div class="overlayTitle">장비 장착</div>
      <div class="overlayLead">유물 하나를 선택하세요.</div>
    `;
    const grid = document.createElement("div");
    grid.className = "choiceGrid";
    for (const relic of state.lootChoices) {
      const btn = document.createElement("button");
      btn.className = "choiceCard";
      btn.innerHTML = `
        <div class="choiceTitle">${relic.name}</div>
        <div class="choiceTag">${relic.tag}</div>
        <div class="choiceDesc">${relic.desc}</div>
      `;
      btn.onclick = () => applyRelic(relic);
      grid.append(btn);
    }
    card.append(grid);
    return;
  }

  if (mode === "quest") {
    card.innerHTML = `
      <div class="overlayTitle">퀘스트 수락</div>
      <div class="overlayLead">당신은 보스를 사냥해야 합니다.</div>
      <div class="overlayMini">${state.questText || "보스의 심장부로 가는 길을 열어야 합니다."}</div>
    `;
    const row = document.createElement("div");
    row.className = "buttonRow";
    row.append(
      makeButton("수락", () => {
        logLine("Quest accepted: boss hunt started.");
        setOverlay("none");
        updateStage(8, "보스 관문으로 이동하세요.", "이제 마지막 지역으로 진행할 수 있습니다.");
        enterWorldNode("pass");
      }, "primary"),
    );
    card.append(row);
    return;
  }

  if (mode === "bossPrep") {
    card.innerHTML = `
      <div class="overlayTitle">보스 관문</div>
      <div class="overlayLead">최종 보스 구역 앞입니다. 준비를 마치고 문을 여세요.</div>
      <div class="overlayMini">이 구역에서는 적의 압박이 강합니다. 마지막 전투를 위한 준비 단계입니다.</div>
    `;
    const row = document.createElement("div");
    row.className = "buttonRow";
    row.append(
      makeButton("관문 열기", () => {
        setOverlay("none");
        updateStage(10, "보스사냥", "Eclipse Tyrant를 쓰러뜨리세요.");
        enterBossFight();
      }, "primary"),
    );
    card.append(row);
    return;
  }

  if (mode === "victory") {
    card.innerHTML = `
      <div class="overlayTitle">보스 격파</div>
      <div class="overlayLead">Eclipse Tyrant를 쓰러뜨렸습니다.</div>
      <div class="overlayMini">최종 점수: ${Math.floor(state.player.gold)} 골드. 새 캐릭터로 다시 시작할 수 있습니다.</div>
    `;
    const row = document.createElement("div");
    row.className = "buttonRow";
    row.append(
      makeButton("다시 하기", () => {
        setOverlay("title");
      }, "primary"),
    );
    card.append(row);
  }
}

function chooseRace(race) {
  state.race = race;
  state.player = createPlayer(race);
  state.world = createWorld();
  state.currentNodeIndex = 0;
  state.targetNodeIndex = 0;
  state.travelT = 0;
  state.combat = null;
  state.projectiles = [];
  state.enemyProjectiles = [];
  state.particles = [];
  state.enemies = [];
  state.lootChoices = [];
  state.talentChoices = [];
  state.questText = "보스의 심장부를 추적하세요.";
  state.boss = null;
  state.player.x = nodePositions[0].x;
  state.player.y = nodePositions[0].y;
  state.player.tx = state.player.x;
  state.player.ty = state.player.y;
  updateStage(2, "맵 구성", "시작 마을에서 월드맵이 생성되었습니다.");
  logLine(`Chosen race: ${race.name}`);
  setOverlay("none");
  renderActionPanel();
  enterWorldNode("village");
}

function renderActionPanel() {
  actionPanel.innerHTML = "";
  const node = state.world[state.currentNodeIndex];
  if (!node) return;
  const btns = [];
  if (state.overlayMode === "none" && state.phase === "world") {
    if (state.currentNodeIndex < state.world.length - 1) {
      btns.push(makeButton("다음 맵으로 이동", () => travelToNode(state.currentNodeIndex + 1), "primary"));
    }
    if (state.currentNodeIndex > 0) {
      btns.push(makeButton("이전 맵으로 이동", () => travelToNode(state.currentNodeIndex - 1)));
    }
  }
  if (state.phase === "combat") {
    btns.push(makeButton("공격", () => performAttack(), "primary"));
    btns.push(makeButton("특수기", () => performSpecial()));
  }
  if (state.phase === "bossFight") {
    btns.push(makeButton("공격", () => performAttack(), "primary"));
    btns.push(makeButton("특수기", () => performSpecial()));
  }
  if (state.phase === "world" || state.phase === "combat" || state.phase === "bossFight") {
    btns.push(makeButton("상태 초기화", () => centerCamera()));
  }
  for (const b of btns) actionPanel.append(b);
}

function travelToNode(index) {
  if (state.phase !== "world") return;
  if (index < 0 || index >= state.world.length) return;
  if (Math.abs(index - state.currentNodeIndex) !== 1) return;
  state.phase = "travel";
  state.travelFrom = state.currentNodeIndex;
  state.travelTo = index;
  state.travelT = 0;
  state.targetNodeIndex = index;
  updateStage(Math.max(state.stage, 3), "맵 이동", `이동 중: ${state.world[index].name}`);
  logLine(`Travel to ${state.world[index].name}`);
  renderActionPanel();
}

function enterWorldNode(id) {
  const index = state.world.findIndex((n) => n.id === id);
  if (index < 0) return;
  state.currentNodeIndex = index;
  state.targetNodeIndex = index;
  state.player.tx = nodePositions[index].x;
  state.player.ty = nodePositions[index].y;
  state.player.x = nodePositions[index].x;
  state.player.y = nodePositions[index].y;
  state.phase = "world";
  const node = state.world[index];
  logLine(`Entered ${node.name}`);
  if (index === 0) {
    updateStage(2, "맵 구성", "시작 마을에서 출발할 준비를 마쳤습니다.");
  }
  if (node.kind === "combat" && !node.cleared) {
    if (node.id === "road") {
      updateStage(4, "첫 조우", "첫 전투 지역에 도착했습니다.");
      startCombat(node);
      return;
    }
    startCombat(node);
    return;
  }
  if (node.kind === "reward") {
    if (state.stage < 6) {
      updateStage(6, "레벨업", "전투 보상으로 재능을 선택하세요.");
    }
    openTalentChoice();
    return;
  }
  if (node.kind === "relic") {
    updateStage(7, "장비 장착", "유물을 하나 장착하세요.");
    openRelicChoice();
    return;
  }
  if (node.kind === "quest") {
    updateStage(8, "퀘스트 수락", "보스 사냥 퀘스트를 받아야 합니다.");
    openQuest();
    return;
  }
  if (node.kind === "bossPrep") {
    updateStage(9, "보스 관문", "최종 관문 앞입니다.");
    openBossPrep();
    return;
  }
  if (node.kind === "boss") {
    updateStage(10, "보스사냥", "최종 보스전입니다.");
    enterBossFight();
    return;
  }
  state.phase = "world";
  renderActionPanel();
}

function spawnCombatNode(node) {
  state.enemies = [];
  state.projectiles = [];
  state.enemyProjectiles = [];
  state.particles = [];
  state.player.x = state.arenaW / 2;
  state.player.y = state.arenaH / 2;
  state.player.tx = state.player.x;
  state.player.ty = state.player.y;
  const packs = node.id === "road"
    ? ["raider", "wisp", "archer", "raider", "stalker"]
    : node.id === "forest"
      ? ["wisp", "shaman", "stalker", "voidling", "raider"]
      : node.id === "pass"
        ? ["shield", "raider", "archer", "brute", "voidling"]
        : ["raider", "archer", "brute", "stalker", "shaman", "voidling"];
  for (const type of packs) {
    const e = createEnemy(type);
    e.x = rand(80, state.arenaW - 80);
    e.y = rand(80, state.arenaH - 80);
    state.enemies.push(e);
  }
  state.combat = { nodeId: node.id, clearTimer: 0 };
  state.phase = "combat";
  renderActionPanel();
}

function startCombat(node) {
  updateStage(node.stepTag || 4, STAGES[(node.stepTag || 4) - 1].title, `전투 지역: ${node.name}`);
  spawnCombatNode(node);
  logLine(`Combat started in ${node.name}`);
}

function createEnemy(type) {
  const def = ENEMY_DEFS[type];
  return {
    type,
    name: def.name,
    x: rand(100, state.arenaW - 100),
    y: rand(100, state.arenaH - 100),
    vx: 0,
    vy: 0,
    hp: def.hp + state.stage * 2,
    maxHp: def.hp + state.stage * 2,
    speed: def.speed,
    damage: def.damage,
    r: def.r,
    color: def.color,
    score: def.score,
    xp: def.xp,
    attackTimer: rand(0.3, 1.1),
    ranged: !!def.ranged,
    support: !!def.support,
    dashy: !!def.dashy,
    armored: !!def.armored,
    boss: !!def.boss,
    age: 0,
    spawnTimer: rand(2.5, 4.5),
  };
}

function openTalentChoice() {
  state.talentChoices = [...TALENTS].sort(() => Math.random() - 0.5).slice(0, 3);
  updateStage(6, "레벨업", "재능을 하나 고르세요.");
  setOverlay("reward");
}

function applyTalent(talent) {
  talent.apply(state.player);
  logLine(`Talent gained: ${talent.name}`);
  setOverlay("none");
  state.phase = "world";
  state.world[state.currentNodeIndex].cleared = true;
  updateStage(6, "레벨업", "재능을 선택했습니다. 다음 맵으로 진행하세요.");
  renderActionPanel();
}

function openRelicChoice() {
  state.lootChoices = [...RELICS].sort(() => Math.random() - 0.5).slice(0, 3);
  setOverlay("loot");
}

function applyRelic(relic) {
  relic.apply(state.player);
  state.player.relics.push(relic.id);
  logLine(`Relic equipped: ${relic.name}`);
  setOverlay("none");
  state.phase = "world";
  state.world[state.currentNodeIndex].cleared = true;
  updateStage(7, "장비 장착", "유물을 장착했습니다. 다음 지역으로 이동하세요.");
  renderActionPanel();
}

function openQuest() {
  state.questText = "Moon Shrine의 봉인을 통해 보스 영역이 드러났습니다. 심장부를 추적하세요.";
  setOverlay("quest");
}

function openBossPrep() {
  state.phase = "bossPrep";
  state.boss = null;
  setOverlay("bossPrep");
  renderActionPanel();
}

function enterBossFight() {
  state.phase = "bossFight";
  state.enemies = [];
  state.projectiles = [];
  state.enemyProjectiles = [];
  state.particles = [];
  state.boss = createEnemy("boss");
  state.boss.x = state.arenaW / 2;
  state.boss.y = 130;
  state.boss.hp = 420;
  state.boss.maxHp = 420;
  state.boss.phase = 1;
  state.boss.attackTimer = 0.8;
  state.boss.summonTimer = 4;
  state.player.x = state.arenaW / 2;
  state.player.y = state.arenaH - 120;
  state.player.tx = state.player.x;
  state.player.ty = state.player.y;
  renderActionPanel();
}

function beginVictory() {
  state.phase = "victory";
  setOverlay("victory");
  updateStage(10, "보스사냥", "클리어했습니다.");
  renderActionPanel();
  logLine("Boss defeated.");
}

function centerCamera() {
  state.mapFocus = 0;
}

function attackAngle() {
  if (state.phase === "world") return 0;
  return Math.atan2(state.pointerWorldY - state.player.y, state.pointerWorldX - state.player.x);
}

function performAttack() {
  if (!["combat", "bossFight"].includes(state.phase)) return;
  if (state.player.attackTimer > 0) return;
  const p = state.player;
  const a = attackAngle();
  const crit = Math.random() < p.crit;
  const damage = p.attackDamage * (crit ? 1.8 : 1);
  p.attackTimer = p.attackCooldown;

  if (p.attackKind === "slash" || p.attackKind === "cleave" || p.attackKind === "slam") {
    const radius = p.attackKind === "slam" ? 88 : p.attackKind === "cleave" ? 78 : 62;
    const arc = p.attackKind === "cleave" ? 1.35 : 1.0;
    damageNearbyEnemies(p.x, p.y, radius, damage * arc, a, p.attackKind);
    for (let i = 0; i < 10; i++) addParticle(p.x, p.y, rand(-220, 220), rand(-220, 220), rand(0.12, 0.3), p.raceId === "orc" ? "#ff7b88" : "#9fb8ff", 2, 8);
  } else {
    state.projectiles.push({
      x: p.x,
      y: p.y,
      vx: Math.cos(a) * p.projectileSpeed,
      vy: Math.sin(a) * p.projectileSpeed,
      life: 1.8,
      damage,
      r: 4,
      color: p.raceId === "shade" ? "#b39cff" : p.raceId === "seraph" ? "#f0d8ff" : "#7ef7d4",
    });
  }
}

function performSpecial() {
  const p = state.player;
  if (!["combat", "bossFight"].includes(state.phase)) return;
  if (p.mana < p.specialCost) return;
  p.mana -= p.specialCost;
  const a = attackAngle();
  if (p.raceId === "human") {
    p.shield = Math.min(p.maxShield + 24, p.shield + 24);
    addParticle(p.x, p.y, 0, 0, 0.5, "#9fb8ff", 8, 14);
  } else if (p.raceId === "elf") {
    for (let i = -1; i <= 1; i++) {
      state.projectiles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(a + i * 0.18) * (p.projectileSpeed + 120),
        vy: Math.sin(a + i * 0.18) * (p.projectileSpeed + 120),
        life: 1.4,
        damage: p.attackDamage * 0.95,
        r: 4,
        color: "#7ef7d4",
      });
    }
  } else if (p.raceId === "dwarf") {
    damageNearbyEnemies(p.x, p.y, 110, p.attackDamage * 1.6, a, "slam");
    stunEnemies(110, 0.8);
  } else if (p.raceId === "orc") {
    p.attackDamage += 6;
    p.specialTimer = 5;
  } else if (p.raceId === "seraph") {
    p.hp = Math.min(p.maxHp, p.hp + 34);
    p.shield = Math.min(p.maxShield, p.shield + 16);
    addParticle(p.x, p.y, 0, 0, 0.6, "#f0d8ff", 10, 16);
  } else if (p.raceId === "shade") {
    p.x = clamp(p.x + Math.cos(a) * p.dashDistance, 48, state.arenaW - 48);
    p.y = clamp(p.y + Math.sin(a) * p.dashDistance, 48, state.arenaH - 48);
    p.dashTimer = 0.35;
    damageNearbyEnemies(p.x, p.y, 76, p.attackDamage * 1.3, a, "dash");
  }
  logLine(`${p.specialName} used.`);
}

function stunEnemies(radius, duration) {
  for (const e of state.enemies) {
    if (dist(state.player.x, state.player.y, e.x, e.y) <= radius) e.stun = Math.max(e.stun || 0, duration);
  }
  if (state.boss && dist(state.player.x, state.player.y, state.boss.x, state.boss.y) <= radius) {
    state.boss.stun = Math.max(state.boss.stun || 0, duration);
  }
}

function damageNearbyEnemies(x, y, radius, damage, angle, mode) {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    const d = dist(x, y, e.x, e.y);
    if (d <= radius) {
      const dealt = damage * clamp(1.2 - d / radius, 0.4, 1.2);
      e.hp -= dealt;
      if (state.player.burn) e.burn = 1.5;
      if (e.hp <= 0) killEnemy(i);
    }
  }
  if (state.boss) {
    const d = dist(x, y, state.boss.x, state.boss.y);
    if (d <= radius + 10) {
      state.boss.hp -= damage * clamp(1.2 - d / (radius + 10), 0.35, 1.15);
      if (state.boss.hp <= 0) finishBoss();
    }
  }
  addParticle(x, y, Math.cos(angle) * 120, Math.sin(angle) * 120, 0.2, mode === "dash" ? "#b39cff" : "#ffd76a", 4, 10);
}

function killEnemy(index) {
  const e = state.enemies[index];
  state.enemies.splice(index, 1);
  state.player.gold += e.score;
  state.player.xp += e.xp;
  state.player.mana = Math.min(state.player.maxMana, state.player.mana + 4);
  logLine(`${e.name} defeated.`);
  for (let i = 0; i < 10; i++) addParticle(e.x, e.y, rand(-180, 180), rand(-180, 180), rand(0.15, 0.45), e.color, 2, 10);
  if (state.player.xp >= state.player.nextXp) {
    state.player.xp -= state.player.nextXp;
    state.player.nextXp = Math.floor(state.player.nextXp * 1.2 + 20);
    state.player.level += 1;
    state.player.maxHp += 8;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 16);
    openTalentChoiceAfterCombat();
  }
}

function openTalentChoiceAfterCombat() {
  state.phase = "reward";
  state.talentChoices = [...TALENTS].sort(() => Math.random() - 0.5).slice(0, 3);
  setOverlay("reward");
  updateStage(6, "레벨업", "재능을 하나 고르세요.");
}

function clearCombat() {
  const node = state.world[state.currentNodeIndex];
  node.cleared = true;
  state.phase = "world";
  state.combat = null;
  if (node.id === "road") {
    updateStage(5, "전투 클리어", "첫 전투를 클리어했습니다.");
    logLine("First combat cleared.");
  }
  renderActionPanel();
}

function applyTalent(talent) {
  talent.apply(state.player);
  logLine(`Talent chosen: ${talent.name}`);
  setOverlay("none");
  state.phase = "world";
  if (state.world[state.currentNodeIndex].id === "forest") {
    updateStage(6, "레벨업", "재능을 적용했습니다.");
  }
  renderActionPanel();
}

function applyRelic(relic) {
  relic.apply(state.player);
  state.player.relics.push(relic.id);
  logLine(`Relic equipped: ${relic.name}`);
  setOverlay("none");
  state.phase = "world";
  renderActionPanel();
}

function finishBoss() {
  state.phase = "victory";
  state.boss = null;
  setOverlay("victory");
  renderActionPanel();
}

function openTalentChoice() {
  state.phase = "reward";
  state.talentChoices = [...TALENTS].sort(() => Math.random() - 0.5).slice(0, 3);
  setOverlay("reward");
}

function openRelicChoice() {
  state.phase = "loot";
  state.lootChoices = [...RELICS].sort(() => Math.random() - 0.5).slice(0, 3);
  setOverlay("loot");
}

function updatePlayer(dt) {
  const p = state.player;
  if (!p) return;
  p.attackTimer = Math.max(0, p.attackTimer - dt);
  p.specialTimer = Math.max(0, p.specialTimer - dt);
  p.dashTimer = Math.max(0, p.dashTimer - dt);
  p.mana = Math.min(p.maxMana, p.mana + p.manaRegen * dt);
  p.shield = Math.min(p.maxShield, p.shield + p.shieldRegen * dt);

  if (state.phase === "combat" || state.phase === "bossFight") {
    let mx = 0;
    let my = 0;
    if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) my -= 1;
    if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) my += 1;
    if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) mx -= 1;
    if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) mx += 1;
    if (mx || my) {
      const l = Math.hypot(mx, my) || 1;
      mx /= l;
      my /= l;
      p.vx += mx * p.speed * 6 * dt;
      p.vy += my * p.speed * 6 * dt;
    }
    const aim = attackAngle();
    p.facing = aim;
    const speed = Math.hypot(p.vx, p.vy);
    const maxSpeed = p.speed * (p.dashTimer > 0 ? 1.45 : 1);
    if (speed > maxSpeed) {
      const m = maxSpeed / speed;
      p.vx *= m;
      p.vy *= m;
    }
    p.x = clamp(p.x + p.vx * dt, 34, state.arenaW - 34);
    p.y = clamp(p.y + p.vy * dt, 34, state.arenaH - 34);
    p.vx *= Math.pow(0.88, dt * 60);
    p.vy *= Math.pow(0.88, dt * 60);
    if (state.keys.has("Space")) performAttack();
    if (state.keys.has("KeyE")) performSpecial();
  }
  if (state.phase === "world") {
    p.x = lerp(p.x, p.tx, 0.18);
    p.y = lerp(p.y, p.ty, 0.18);
  }
}

function updateEnemies(dt) {
  const p = state.player;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    e.age += dt;
    if (e.stun > 0) {
      e.stun -= dt;
      continue;
    }
    e.spawnTimer -= dt;
    const d = dist(p.x, p.y, e.x, e.y) || 1;
    const ux = (p.x - e.x) / d;
    const uy = (p.y - e.y) / d;
    if (e.type === "stalker" && d < 220) {
      const burst = d < 90 ? 1.6 : 1.1;
      e.vx = lerp(e.vx, ux * e.speed * burst, 0.18);
      e.vy = lerp(e.vy, uy * e.speed * burst, 0.18);
    } else if (e.type === "shield") {
      e.vx = lerp(e.vx, ux * e.speed * 0.6, 0.03);
      e.vy = lerp(e.vy, uy * e.speed * 0.6, 0.03);
    } else if (e.type === "wisp" || e.type === "archer" || e.type === "shaman") {
      const ideal = e.type === "shaman" ? 180 : 240;
      const drift = d > ideal ? 1 : -0.5;
      e.vx = lerp(e.vx, ux * e.speed * drift, 0.08);
      e.vy = lerp(e.vy, uy * e.speed * drift, 0.08);
    } else {
      e.vx = lerp(e.vx, ux * e.speed, 0.06);
      e.vy = lerp(e.vy, uy * e.speed, 0.06);
    }
    if (e.dashy && e.spawnTimer <= 0) {
      e.vx += ux * 260;
      e.vy += uy * 260;
      e.spawnTimer = rand(2.2, 3.2);
    }
    if (e.support && e.spawnTimer <= 0) {
      const add = createEnemy("voidling");
      add.x = clamp(e.x + rand(-24, 24), 40, state.arenaW - 40);
      add.y = clamp(e.y + rand(-24, 24), 40, state.arenaH - 40);
      state.enemies.push(add);
      e.spawnTimer = rand(3.8, 5.2);
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.x = clamp(e.x, 36, state.arenaW - 36);
    e.y = clamp(e.y, 36, state.arenaH - 36);
    e.attackTimer -= dt;
    if (d < e.r + 18) {
      damagePlayer(e.damage * dt * 5);
    }
    if ((e.ranged || e.type === "archer") && e.attackTimer <= 0 && d < 360) {
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      state.enemyProjectiles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * 280,
        vy: Math.sin(a) * 280,
        life: 2,
        damage: e.damage,
        color: e.color,
        r: 4,
      });
      e.attackTimer = 1.2;
    }
    if (e.type === "shaman" && e.attackTimer <= 0 && d < 320) {
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      state.enemyProjectiles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * 220,
        vy: Math.sin(a) * 220,
        life: 2.3,
        damage: e.damage + 2,
        color: "#b39cff",
        r: 5,
      });
      e.attackTimer = 1.6;
    }
    if (e.armored && d < e.r + 24) {
      p.shield = Math.max(0, p.shield - dt * 8);
    }
    if (e.burn) {
      e.burn -= dt;
      e.hp -= dt * 5;
    }
    if (e.hp <= 0) killEnemy(i);
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.life <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const e = state.enemies[j];
      if (dist(b.x, b.y, e.x, e.y) < b.r + e.r) {
        e.hp -= b.damage;
        if (e.hp <= 0) killEnemy(j);
        for (let k = 0; k < 4; k++) addParticle(b.x, b.y, rand(-100, 100), rand(-100, 100), 0.18, b.color, 2, 8);
        state.projectiles.splice(i, 1);
        break;
      }
    }
    if (state.boss && dist(b.x, b.y, state.boss.x, state.boss.y) < b.r + state.boss.r) {
      state.boss.hp -= b.damage;
      for (let k = 0; k < 4; k++) addParticle(b.x, b.y, rand(-120, 120), rand(-120, 120), 0.2, b.color, 2, 10);
      state.projectiles.splice(i, 1);
      if (state.boss.hp <= 0) finishBoss();
    }
  }
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const b = state.enemyProjectiles[i];
    b.life -= dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.life <= 0) {
      state.enemyProjectiles.splice(i, 1);
      continue;
    }
    if (dist(b.x, b.y, state.player.x, state.player.y) < b.r + 14) {
      damagePlayer(b.damage);
      state.enemyProjectiles.splice(i, 1);
    }
  }
}

function damagePlayer(amount) {
  const p = state.player;
  let dmg = Math.max(1, amount - p.armor * 0.45);
  if (p.shield > 0) {
    const used = Math.min(p.shield, dmg);
    p.shield -= used;
    dmg -= used;
  }
  if (dmg > 0) p.hp -= dmg;
  if (p.hp <= 0) {
    p.hp = 0;
    setOverlay("victory");
    overlay.querySelector(".overlayTitle").textContent = "패배";
    overlay.querySelector(".overlayLead").textContent = "플레이어가 쓰러졌습니다. 다시 시도할 수 있습니다.";
  }
}

function updateTravel(dt) {
  if (state.phase !== "travel") return;
  state.travelT += dt * 1.35;
  if (state.travelT >= 1) {
    state.travelT = 1;
    state.currentNodeIndex = state.travelTo;
    state.player.tx = nodePositions[state.currentNodeIndex].x;
    state.player.ty = nodePositions[state.currentNodeIndex].y;
    state.player.x = state.player.tx;
    state.player.y = state.player.ty;
    state.phase = "world";
    const node = state.world[state.currentNodeIndex];
    if (node.kind === "combat" && !node.cleared) {
      if (node.id === "road") {
        updateStage(4, "첫 조우", "첫 전투 노드에 도착했습니다.");
        startCombat(node);
        return;
      }
    }
    if (node.kind === "reward") {
      updateStage(6, "레벨업", "레벨업 재능을 고르세요.");
      openTalentChoice();
      return;
    }
    if (node.kind === "relic") {
      updateStage(7, "장비 장착", "유물을 장착하세요.");
      openRelicChoice();
      return;
    }
    if (node.kind === "quest") {
      updateStage(8, "퀘스트 수락", "보스 사냥 퀘스트를 받으세요.");
      openQuest();
      return;
    }
    if (node.kind === "bossPrep") {
      updateStage(9, "보스 관문", "최종 관문이 열렸습니다.");
      openBossPrep();
      return;
    }
    if (node.kind === "boss") {
      updateStage(10, "보스사냥", "최종 보스전입니다.");
      enterBossFight();
      return;
    }
    renderActionPanel();
  }
}

function updateBoss(dt) {
  if (!state.boss) return;
  const b = state.boss;
  b.attackTimer -= dt;
  b.summonTimer -= dt;
  const p = state.player;
  const d = dist(p.x, p.y, b.x, b.y) || 1;
  const ux = (p.x - b.x) / d;
  const uy = (p.y - b.y) / d;
  if (b.stun > 0) {
    b.stun -= dt;
    return;
  }
  if (b.hp > 280) {
    b.x += ux * b.speed * 0.45 * dt;
    b.y += uy * b.speed * 0.45 * dt;
  } else if (b.hp > 150) {
    b.x += Math.cos(state.time * 0.8) * 18 * dt;
    b.y += Math.sin(state.time * 1.1) * 12 * dt;
  } else {
    b.x += ux * b.speed * 0.7 * dt;
    b.y += uy * b.speed * 0.7 * dt;
  }
  b.x = clamp(b.x, 80, state.arenaW - 80);
  b.y = clamp(b.y, 70, state.arenaH - 70);

  if (b.attackTimer <= 0) {
    const a = Math.atan2(p.y - b.y, p.x - b.x);
    const burst = b.hp > 220 ? 1 : b.hp > 120 ? 2 : 3;
    for (let i = -burst; i <= burst; i++) {
      state.enemyProjectiles.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(a + i * 0.12) * (260 + burst * 20),
        vy: Math.sin(a + i * 0.12) * (260 + burst * 20),
        life: 2.2,
        damage: 12 + burst * 3,
        color: "#b39cff",
        r: 5,
      });
    }
    b.attackTimer = b.hp > 120 ? 1.3 : 0.9;
  }
  if (b.summonTimer <= 0 && b.hp < 240) {
    for (let i = 0; i < 2; i++) {
      const pool = b.hp < 120 ? ["raider", "wisp", "archer", "stalker", "voidling"] : ["raider", "wisp", "archer"];
      const add = createEnemy(pool[Math.floor(Math.random() * pool.length)]);
      add.x = rand(120, state.arenaW - 120);
      add.y = rand(100, state.arenaH - 100);
      state.enemies.push(add);
    }
    b.summonTimer = b.hp > 150 ? 4.5 : 3.2;
  }
}

function update(dt) {
  state.time += dt;
  updatePlayer(dt);
  updateTravel(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateBoss(dt);
  if (state.phase === "combat" && state.enemies.length === 0) {
    clearCombat();
  }
  if (state.phase === "bossFight" && state.boss && state.boss.hp <= 0) {
    finishBoss();
  }
  if (state.phase === "bossFight" && state.boss) {
    state.boss.hp = Math.max(0, state.boss.hp);
  }
  if (state.phase === "world") {
    state.player.x = lerp(state.player.x, state.player.tx, 0.1);
    state.player.y = lerp(state.player.y, state.player.ty, 0.1);
  }
  if (state.phase === "world" || state.phase === "combat" || state.phase === "bossFight") {
    renderHudStats();
  }
}

function renderHudStats() {
  const p = state.player;
  if (!p) return;
  statHp.valueEl.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  statMana.valueEl.textContent = `${Math.ceil(p.mana)} / ${p.maxMana}`;
  statGold.valueEl.textContent = `${Math.floor(p.gold)}`;
  statStage.valueEl.textContent = `${state.stage} / 10`;
}

function drawBackground(node) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const bg = node?.bg || ["#171b2b", "#0d111a"];
  grad.addColorStop(0, bg[0]);
  grad.addColorStop(1, bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.08)" : "rgba(126,247,212,0.08)";
    const x = (i * 89 + state.time * 12) % canvas.width;
    const y = (i * 53 + state.time * 20) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
}

function drawWorldMap() {
  const node = state.world[state.currentNodeIndex];
  drawBackground(node);
  ctx.save();
  ctx.translate((canvas.width - state.worldW) / 2, (canvas.height - state.worldH) / 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(142,174,255,0.25)";
  for (let i = 0; i < state.world.length - 1; i++) {
    const a = state.world[i];
    const b = state.world[i + 1];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (const n of state.world) {
    const active = n.index === state.currentNodeIndex;
    const cleared = n.cleared;
    ctx.fillStyle = cleared ? "rgba(126,247,212,0.9)" : "rgba(255,255,255,0.45)";
    if (n.kind === "boss") ctx.fillStyle = "rgba(179,156,255,0.95)";
    ctx.beginPath();
    ctx.arc(n.x, n.y, active ? 18 : 14, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(n.x, n.y, active ? 7 : 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#edf3ff";
    ctx.font = "bold 16px Trebuchet MS, sans-serif";
    ctx.fillText(n.name, n.x - 42, n.y - 24);
  }
  drawPlayerMarker(state.world[state.currentNodeIndex].x, state.world[state.currentNodeIndex].y, true);
  ctx.restore();
}

function drawPlayerMarker(x, y, worldMode = false) {
  ctx.save();
  ctx.translate((canvas.width - state.worldW) / 2 + x, (canvas.height - state.worldH) / 2 + y);
  ctx.fillStyle = "rgba(126,247,212,0.2)";
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, TAU);
  ctx.fill();
  const raceId = state.player?.raceId || "human";
  drawSprite(SPRITES[raceId], 0, 0, 1.3);
  ctx.restore();
}

function drawArena() {
  const node = state.world[state.currentNodeIndex];
  drawBackground(node);
  const ox = (canvas.width - state.arenaW) / 2;
  const oy = 42;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, 0, state.arenaW, state.arenaH);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.strokeRect(0, 0, state.arenaW, state.arenaH);
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.03)" : "rgba(126,247,212,0.03)";
    ctx.fillRect((i * 41) % state.arenaW, (i * 77) % state.arenaH, 24, 24);
  }
  ctx.restore();
  return { ox, oy };
}

function worldToArena(x, y, ox, oy) {
  return { x: ox + x, y: oy + y };
}

function drawCombat(ox, oy) {
  const p = state.player;
  for (const proj of state.projectiles) {
    const x = ox + proj.x;
    const y = oy + proj.y;
    ctx.fillStyle = proj.color;
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
  for (const proj of state.enemyProjectiles) {
    const x = ox + proj.x;
    const y = oy + proj.y;
    ctx.fillStyle = proj.color;
    ctx.fillRect(x - 3, y - 3, 6, 6);
  }
  for (const e of state.enemies) {
    const sx = ox + e.x;
    const sy = oy + e.y + Math.sin(state.time * 4 + e.x * 0.05) * 1.5;
    const sprite = SPRITES[e.type] || SPRITES.raider;
    const scale = e.type === "shield" ? 1.6 : e.type === "brute" ? 1.5 : e.type === "shaman" ? 1.25 : 1.2;
    drawSprite(sprite, sx, sy, scale);
    const barW = 28;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(sx - barW / 2, sy + 16, barW, 4);
    ctx.fillStyle = "#ff7b88";
    ctx.fillRect(sx - barW / 2, sy + 16, barW * (e.hp / e.maxHp), 4);
  }
  if (state.boss) {
    const b = state.boss;
    const sx = ox + b.x;
    const sy = oy + b.y;
    drawSprite(SPRITES.boss, sx, sy, 2);
    const barW = 180;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(state.arenaW / 2 - barW / 2, 10, barW, 8);
    ctx.fillStyle = "#b39cff";
    ctx.fillRect(state.arenaW / 2 - barW / 2, 10, barW * (b.hp / b.maxHp), 8);
  }
  const px = ox + p.x;
  const py = oy + p.y;
  ctx.save();
  if (p.dashTimer > 0) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#7ef7d4";
    ctx.beginPath();
    ctx.arc(px, py, 30, 0, TAU);
    ctx.fill();
  }
  drawSprite(SPRITES[p.raceId], px, py, 1.5, p.facing + Math.PI / 2);
  ctx.restore();
}

function renderLog() {
  const small = document.createElement("div");
  small.className = "logBox";
  small.innerHTML = `<div class="panelTitle">Log</div>`;
  for (const line of state.log) {
    const div = document.createElement("div");
    div.className = "logLine";
    div.textContent = line;
    small.append(div);
  }
  return small;
}

function renderFrame() {
  const node = state.world[state.currentNodeIndex];
  if (state.phase === "world" || state.phase === "travel" || state.phase === "reward" || state.phase === "loot" || state.phase === "quest" || state.phase === "bossPrep") {
    drawWorldMap();
  } else if (state.phase === "combat" || state.phase === "bossFight") {
    const { ox, oy } = drawArena();
    drawCombat(ox, oy);
  } else {
    drawBackground(node);
  }
}

function tick(ts) {
  if (!state.lastTs) state.lastTs = ts;
  const dt = Math.min(0.033, (ts - state.lastTs) / 1000);
  state.lastTs = ts;
  update(dt);
  renderFrame();
  requestAnimationFrame(tick);
}

function openBossPrep() {
  state.phase = "bossPrep";
  renderActionPanel();
  setOverlay("bossPrep");
}

function createOverlayLog() {
  const box = document.createElement("div");
  box.className = "logWrap";
  box.append(renderLog());
  return box;
}

function renderActionPanel() {
  actionPanel.innerHTML = "";
  const node = state.world[state.currentNodeIndex];
  const row = document.createElement("div");
  row.className = "actionRow";
  if (state.phase === "world") {
    if (state.currentNodeIndex < state.world.length - 1) row.append(makeButton("다음 맵", () => travelToNode(state.currentNodeIndex + 1), "primary"));
    if (state.currentNodeIndex > 0) row.append(makeButton("이전 맵", () => travelToNode(state.currentNodeIndex - 1)));
    row.append(makeButton("중앙 맞추기", centerCamera));
  }
  if (state.phase === "combat" || state.phase === "bossFight") {
    row.append(makeButton("공격", performAttack, "primary"));
    row.append(makeButton("특수기", performSpecial));
    row.append(makeButton("후퇴 카메라", centerCamera));
  }
  if (state.phase === "reward" || state.phase === "loot" || state.phase === "quest" || state.phase === "bossPrep") {
    row.append(makeButton("진행 준비", () => {}, "primary"));
  }
  actionPanel.append(row);
  actionPanel.append(createOverlayLog());
}

function init() {
  const style = document.createElement("style");
  style.textContent = "";
  document.head.append(style);
  renderStageList();
  updateStage(1, "캐릭터 선택", "6종족 중 하나를 골라주세요.");
  renderHudStats();
  setOverlay("title");
  renderActionPanel();
  resize();
  requestAnimationFrame(tick);
}

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (e) => {
  state.keys.add(e.code);
  if (e.code === "Enter" && state.phase === "title") setOverlay("race");
  if (e.code === "Escape" && state.phase === "world") centerCamera();
  if (e.code === "Space") {
    if (state.phase === "combat" || state.phase === "bossFight") performAttack();
  }
  if (e.code === "KeyE") {
    if (state.phase === "combat" || state.phase === "bossFight") performSpecial();
  }
});
window.addEventListener("keyup", (e) => state.keys.delete(e.code));

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  state.pointerX = e.clientX - r.left;
  state.pointerY = e.clientY - r.top;
  if (state.phase === "combat" || state.phase === "bossFight") {
    const ox = (canvas.width - state.arenaW) / 2;
    const oy = 42;
    state.pointerWorldX = clamp(state.pointerX - ox, 0, state.arenaW);
    state.pointerWorldY = clamp(state.pointerY - oy, 0, state.arenaH);
  }
});

canvas.addEventListener("pointerdown", () => {
  state.pointerDown = true;
  if (state.phase === "title") setOverlay("race");
  if (state.phase === "combat" || state.phase === "bossFight") performAttack();
});
window.addEventListener("pointerup", () => {
  state.pointerDown = false;
});

function damagePlayer(amount) {
  const p = state.player;
  if (!p) return;
  let dmg = Math.max(1, amount - p.armor * 0.45);
  if (p.shield > 0) {
    const used = Math.min(p.shield, dmg);
    p.shield -= used;
    dmg -= used;
  }
  if (dmg > 0) p.hp -= dmg;
  if (p.hp <= 0) {
    p.hp = 0;
    state.phase = "victory";
    overlay.innerHTML = "";
    setOverlay("victory");
  }
}

init();
