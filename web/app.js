const DB_NAME = "rogue_db";
const STORE = "saves";
const KEY = "slot1";

function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

let api = null;
let episodeBoss = null;
const ModuleReady = new Promise((res) => {
  Module.onRuntimeInitialized = () => res();
});

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const logEl = document.getElementById("log");
const hpEl = document.getElementById("hp");
const bossEl = document.getElementById("boss");
const turnEl = document.getElementById("turn");
const stageEl = document.getElementById("stage");

function uiLog(msg) {
  logEl.textContent = msg;
}

function randSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}

function safeCwrap(name, ret, args) {
  try {
    return Module.cwrap(name, ret, args);
  } catch {
    return null;
  }
}

function bind() {
  api = {
    game_new: Module.cwrap("game_new", null, ["number"]),
    game_step: Module.cwrap("game_step", null, ["number"]),
    game_w: Module.cwrap("game_w", "number", []),
    game_h: Module.cwrap("game_h", "number", []),
    game_tile: Module.cwrap("game_tile", "number", ["number", "number"]),
    game_glyph: safeCwrap("game_glyph", "number", ["number", "number"]),
    px: Module.cwrap("game_player_x", "number", []),
    py: Module.cwrap("game_player_y", "number", []),
    php: Module.cwrap("game_player_hp", "number", []),
    pmax: Module.cwrap("game_player_maxhp", "number", []),
    turn: Module.cwrap("game_turn", "number", []),
    enemyCount: safeCwrap("game_enemy_count", "number", []),
    bossAlive: Module.cwrap("game_boss_alive", "number", []),
    bossHp: Module.cwrap("game_boss_hp", "number", []),
    bossMax: Module.cwrap("game_boss_maxhp", "number", []),
    boss_config_begin: Module.cwrap("boss_config_begin", null, [
      "number",
      "number",
      "number",
    ]),
    boss_config_add_pattern: Module.cwrap("boss_config_add_pattern", null, [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]),
    boss_config_set_enrage: Module.cwrap("boss_config_set_enrage", null, [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]),
    boss_config_end: Module.cwrap("boss_config_end", null, []),
    boss_apply_stats_from_config: Module.cwrap("boss_apply_stats_from_config", null, []),
    saveSize: Module.cwrap("game_save_size", "number", []),
    saveWrite: Module.cwrap("game_save_write", null, ["number"]),
    loadRead: Module.cwrap("game_load_read", "number", ["number", "number"]),
  };
}

function tileGlyph(x, y) {
  if (api.game_glyph) return String.fromCharCode(api.game_glyph(x, y));
  if (api.px() === x && api.py() === y) return "@";
  return String.fromCharCode(api.game_tile(x, y));
}

function pset(px, py, scale, color) {
  ctx.fillStyle = color;
  ctx.fillRect(px, py, scale, scale);
}

function drawSprite(px, py, size, sprite) {
  const scale = Math.max(1, Math.floor(size / 16));
  const pw = 16 * scale;
  const ox = px + Math.floor((size - pw) / 2);
  const oy = py + Math.floor((size - pw) / 2);

  for (let y = 0; y < 16; y++) {
    const row = sprite.map[y];
    for (let x = 0; x < 16; x++) {
      const k = row[x];
      if (k === "." || !sprite.palette[k]) continue;
      pset(ox + x * scale, oy + y * scale, scale, sprite.palette[k]);
    }
  }
}

const SPRITES = {
  wall: {
    palette: { a: "#1b2335", b: "#233149", c: "#2a3b56" },
    map: [
      "abababababababab",
      "bccccccccccccccb",
      "acababababababca",
      "bcbbbbcbbbbcbbcb",
      "acabacababacabca",
      "bccccccccccccccb",
      "acbbbbcbbbbcbbca",
      "bcacabacabacabcb",
      "acccccccccccccca",
      "bcbbbbcbbbbcbbcb",
      "acabacababacabca",
      "bccccccccccccccb",
      "acbbbbcbbbbcbbca",
      "bcacabacabacabcb",
      "bccccccccccccccb",
      "abababababababab",
    ],
  },
  floor: {
    palette: { a: "#4f617c", b: "#5a6e8d", c: "#657a9c" },
    map: [
      "aaaaaaaaaaaaaaaa",
      "aaaaabaaaaaaaaaa",
      "aaaaaaaaaacaaaaa",
      "aaacaaaaaaaaaaaa",
      "aaaaaaaaaaaaaaaa",
      "aaaaaabaaaaaaaaa",
      "aaaaaaaaaaaaacaa",
      "aaacaaaaaaaaaaaa",
      "aaaaaaaaaaaaaaaa",
      "aaaaaaaabaaaaaaa",
      "aaaaaaaaaaaaaaca",
      "aabaaaaaaaaaaaaa",
      "aaaaaaaaaaaaaaaa",
      "aaaaacaaaaaaaaaa",
      "aaaaaaaaaaaaabaa",
      "aaaaaaaaaaaaaaaa",
    ],
  },
  water: {
    palette: { a: "#2e5d78", b: "#3f7f9e", c: "#6eb8cf" },
    map: [
      "aaaaaaaaaaaaaaaa",
      "aaabaaaaacaaaaaa",
      "aaaaaacaaaaaabaa",
      "aaaaaaaaaaaaaaaa",
      "aacabaaaaaaacaaa",
      "aaaaaaaaaaaaaaaa",
      "aaaabaaaaacaaaaa",
      "aaaaaaaaaaaaaaab",
      "aaacaaaaaaaaaaaa",
      "aaaaaaaaaacaaaaa",
      "aaaaaaabaaaaaaaa",
      "aaaaaaaaaaaaacaa",
      "aabaaaaaaaaaaaaa",
      "aaaaaaaaaacaaaaa",
      "aaaaacaaaaaaaaaa",
      "aaaaaaaaaaaaaaaa",
    ],
  },
  salt: {
    palette: { a: "#6a7f9f", b: "#d8edff", c: "#f6fbff" },
    map: [
      "aaaaaaaaaaaaaaaa",
      "aaaaaaaaaaaaaaaa",
      "aaaaaaaaabaaaaaa",
      "aaaaaaaabcbbaaaa",
      "aaaaaaabbccbbaaa",
      "aaaaaaabccccbaaa",
      "aaaaaabbccccbbaa",
      "aaaaaabccccccbba",
      "aaaaaabccccccbba",
      "aaaaaabbccccbbaa",
      "aaaaaaabccccbaaa",
      "aaaaaaabbccbbaaa",
      "aaaaaaaabcbbaaaa",
      "aaaaaaaaabaaaaaa",
      "aaaaaaaaaaaaaaaa",
      "aaaaaaaaaaaaaaaa",
    ],
  },
  player: {
    palette: { a: "#ffffff", b: "#9dd2ff", c: "#2f425b" },
    map: [
      "................",
      "......aaaa......",
      ".....abbbba.....",
      "....abbccbba....",
      "...abccccccba...",
      "...abcbccbcb....",
      "...abccccccba...",
      "...abbbbbbbb....",
      "...aaabbbbaaa...",
      "...aabaaaaabaa..",
      "...aabaaaaabaa..",
      "...aaabbbbaaa...",
      "....aabbbbaa....",
      "....aa....aa....",
      "...aa......aa...",
      "................",
    ],
  },
  snail: {
    palette: { a: "#5e8aa0", b: "#8ec3da", c: "#d6eef8" },
    map: [
      "................",
      "................",
      ".......bbbb.....",
      "......bccccb....",
      ".....bcbbbbcb...",
      "....bcbaaaabcb..",
      "...bcbaaaaaabcb.",
      "...bcbaaaaaabcb.",
      "...bcbaaaaaabcb.",
      "...bcbaaaaaabcb.",
      "....bcbaaaabcb..",
      ".....bcbbbbcb...",
      "......bccccb....",
      "....bbb....bbb..",
      "...bb........bb.",
      "................",
    ],
  },
  ghost: {
    palette: { a: "#8f7766", b: "#c6a88f", c: "#e8d7c8" },
    map: [
      "................",
      "......bbbb......",
      ".....bccccb.....",
      "....bcbbbbcb....",
      "...bcbbbbbbcb...",
      "...bcbbbbbbcb...",
      "...bcbbbbbbcb...",
      "...bccbbbbccb...",
      "...bcbbbbbbcb...",
      "...bcbbbbbbcb...",
      "....bcbbbbcb....",
      ".....bccccb.....",
      "...bbb....bbb...",
      "..bb.b....b.bb..",
      ".bb..b....b..bb.",
      "................",
    ],
  },
  boss: {
    palette: { a: "#3f4d63", b: "#7f92aa", c: "#ccd8e8" },
    map: [
      "......bbbb......",
      ".....bccccb.....",
      "...bbbccccbbb...",
      "..bbccbbbbccbb..",
      ".bbcbbaaaabbcbb.",
      ".bcbbabbbbabbbc.",
      ".bcbbbbbbbbbbbc.",
      ".bcbbbaaaabbbbc.",
      ".bcbbbaaaabbbbc.",
      ".bcbbbbbbbbbbbc.",
      ".bcbbabbbbabbbc.",
      ".bbcbbaaaabbcbb.",
      "..bbccbbbbccbb..",
      "...bbbccccbbb...",
      ".....bccccb.....",
      "......bbbb......",
    ],
  },
};

function drawTile(glyph, px, py, size) {
  if (glyph === "#") return drawSprite(px, py, size, SPRITES.wall);
  if (glyph === "~") return drawSprite(px, py, size, SPRITES.water);
  if (glyph === "*") return drawSprite(px, py, size, SPRITES.salt);
  return drawSprite(px, py, size, SPRITES.floor);
}

function drawActor(glyph, px, py, size) {
  if (glyph === "@") return drawSprite(px, py, size, SPRITES.player);
  if (glyph === "s") return drawSprite(px, py, size, SPRITES.snail);
  if (glyph === "g") return drawSprite(px, py, size, SPRITES.ghost);
  if (glyph === "W") return drawSprite(px, py, size, SPRITES.boss);
}

function draw() {
  const w = api.game_w();
  const h = api.game_h();
  const t = Math.min(Math.floor(canvas.width / w), Math.floor(canvas.height / h));
  const ox = Math.floor((canvas.width - w * t) / 2);
  const oy = Math.floor((canvas.height - h * t) / 2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#060c18";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const glyph = tileGlyph(x, y);
      drawTile(glyph, ox + x * t, oy + y * t, t);
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const glyph = tileGlyph(x, y);
      drawActor(glyph, ox + x * t, oy + y * t, t);
    }
  }

  const hp = api.php();
  const max = api.pmax();
  const alive = api.bossAlive();
  const enemyCount = api.enemyCount ? api.enemyCount() : null;

  hpEl.textContent = `HP: ${hp}/${max}`;
  bossEl.textContent = alive
    ? `${episodeBoss?.name ?? "사슬수문장"}: ${api.bossHp()}/${api.bossMax()}`
    : "보스: 격파";
  turnEl.textContent = `Turn: ${api.turn()}`;
  stageEl.textContent = `EP1: 소금비가 내린 날${enemyCount !== null ? ` | 적 ${enemyCount}` : ""}`;

  if (hp <= 0) uiLog("너는 소금비 속에서 쓰러졌다. New Run으로 다시 시작.");
  else if (!alive) uiLog("사슬수문장이 무너지고 조수의 저주가 약해졌다.");
  else uiLog("부두의 사슬이 끊어지기 전에 등대의 불을 지켜라.");
}

function stepFromKey(e) {
  const shift = e.shiftKey;
  switch (e.key) {
    case "ArrowUp":
      return shift ? 5 : 1;
    case "ArrowDown":
      return shift ? 6 : 2;
    case "ArrowLeft":
      return shift ? 7 : 3;
    case "ArrowRight":
      return shift ? 8 : 4;
    default:
      return 0;
  }
}

window.addEventListener(
  "keydown",
  (e) => {
    if (!api) return;
    const input = stepFromKey(e);
    if (!input) return;
    e.preventDefault();
    api.game_step(input);
    saveGame({ silent: true }).catch(() => {});
    draw();
  },
  { passive: false }
);

const PatternType = {
  CHARGE: 1,
  SLAM: 2,
  MARK: 3,
  WIPE_LINE: 4,
  CROSS: 5,
  SUMMON: 6,
};

function applyBossFromConfig(cfg) {
  if (!cfg?.stats) return;
  api.boss_config_begin(cfg.floor ?? 1, cfg.stats.hp ?? 18, cfg.stats.atk ?? 3);

  for (const p of cfg.patterns ?? []) {
    if (p.type === "CHARGE") {
      api.boss_config_add_pattern(PatternType.CHARGE, p.cooldown ?? 3, p.steps ?? 2, p.aoeOnCrash ?? 0, 0);
    } else if (p.type === "SLAM") {
      api.boss_config_add_pattern(PatternType.SLAM, p.cooldown ?? 0, p.knockback ?? 1, p.bonusDmg ?? 0, 0);
    } else if (p.type === "MARK") {
      api.boss_config_add_pattern(PatternType.MARK, p.cooldown ?? 2, p.delay ?? 1, p.radius ?? 0, 0);
    } else if (p.type === "WIPE_LINE") {
      api.boss_config_add_pattern(PatternType.WIPE_LINE, p.cooldown ?? 3, p.range ?? 99, 0, 0);
    } else if (p.type === "CROSS") {
      api.boss_config_add_pattern(PatternType.CROSS, p.cooldown ?? 3, p.range ?? 6, 0, 0);
    } else if (p.type === "SUMMON") {
      api.boss_config_add_pattern(
        PatternType.SUMMON,
        p.cooldown ?? 4,
        p.minionHp ?? 5,
        p.minionAtk ?? 2,
        p.shieldTurns ?? 1
      );
    }
  }

  const enrage = cfg.enrage ?? {};
  api.boss_config_set_enrage(
    enrage.hpPercent ?? 50,
    enrage.cooldownDelta ?? 0,
    enrage.extraMove ?? 0,
    enrage.markRadiusDelta ?? 0,
    enrage.crossRangeDelta ?? 0
  );
  api.boss_config_end();
}

async function loadEpisodeBoss() {
  try {
    const r = await fetch("./bosses.json", { cache: "no-cache" });
    const json = await r.json();
    episodeBoss = (json.bosses ?? []).find((b) => b.floor === 1) ?? null;
  } catch {
    episodeBoss = null;
  }
}

function setupNewRun() {
  if (episodeBoss) applyBossFromConfig(episodeBoss);
  api.game_new(randSeed());
  if (episodeBoss) api.boss_apply_stats_from_config();
}

async function saveGame({ silent = false } = {}) {
  const size = api.saveSize();
  const ptr = Module._malloc(size);
  try {
    api.saveWrite(ptr);
    const bytes = Module.HEAPU8.slice(ptr, ptr + size);
    await idbSet(KEY, bytes);
    if (!silent) uiLog("저장 완료.");
  } finally {
    Module._free(ptr);
  }
}

async function loadGame() {
  const bytes = await idbGet(KEY);
  if (!bytes) {
    uiLog("저장 데이터가 없습니다.");
    return false;
  }

  const size = api.saveSize();
  if (bytes.length !== size) {
    uiLog("세이브 버전이 달라 New Run이 필요합니다.");
    return false;
  }

  const ptr = Module._malloc(size);
  try {
    Module.HEAPU8.set(bytes, ptr);
    const ok = api.loadRead(ptr, size);
    if (!ok) {
      uiLog("로드 실패. New Run을 눌러주세요.");
      return false;
    }
    uiLog("이어하기 로드 성공.");
    return true;
  } finally {
    Module._free(ptr);
  }
}

document.getElementById("new").addEventListener("click", async () => {
  setupNewRun();
  await saveGame({ silent: true });
  draw();
});

document.getElementById("save").addEventListener("click", () => {
  saveGame().catch(() => uiLog("저장 실패"));
});

document.getElementById("load").addEventListener("click", () => {
  loadGame()
    .then((ok) => {
      if (ok) draw();
    })
    .catch(() => uiLog("로드 실패"));
});

(async function boot() {
  await ModuleReady;
  bind();
  await loadEpisodeBoss();

  const loaded = await loadGame();
  if (!loaded) {
    setupNewRun();
    await saveGame({ silent: true });
  }
  draw();
})();
