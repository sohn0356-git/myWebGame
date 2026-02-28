/* global createModule */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const elHP = document.getElementById("hp");
const elBoss = document.getElementById("boss");
const elTurn = document.getElementById("turn");
const elLog = document.getElementById("log");
const elStory = document.getElementById("story");

const btnNew = document.getElementById("btnNew");
const btnContinue = document.getElementById("btnContinue");
const btnClear = document.getElementById("btnClear");

const SAVE_KEY = "wasm_rogue_save_v3";

let Module = null;
let api = null;

let BOSSES = null;
let STORY = null;

const PAT = { CHARGE: 1, SLAM: 2, MARK: 3, WIPE_LINE: 4, CROSS: 5, SUMMON: 6 };

function logLine(s) {
  elLog.textContent = (s + "\n" + elLog.textContent).slice(0, 4000);
}

function randSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// ---------- WASM bindings ----------
function bind() {
  api = {
    // core
    game_new: Module.cwrap("game_new", null, ["number"]),
    game_w: Module.cwrap("game_w", "number", []),
    game_h: Module.cwrap("game_h", "number", []),
    game_tile: Module.cwrap("game_tile", "number", ["number", "number"]),
    game_player_x: Module.cwrap("game_player_x", "number", []),
    game_player_y: Module.cwrap("game_player_y", "number", []),
    game_player_hp: Module.cwrap("game_player_hp", "number", []),
    game_player_maxhp: Module.cwrap("game_player_maxhp", "number", []),
    game_turn: Module.cwrap("game_turn", "number", []),
    game_step: Module.cwrap("game_step", null, ["number"]),
    game_enemy_alive: Module.cwrap("game_enemy_alive", "number", []),
    game_boss_alive: Module.cwrap("game_boss_alive", "number", []),
    game_boss_hp: Module.cwrap("game_boss_hp", "number", []),
    game_boss_maxhp: Module.cwrap("game_boss_maxhp", "number", []),

    // save/load
    game_save_size: Module.cwrap("game_save_size", "number", []),
    game_save_write: Module.cwrap("game_save_write", null, ["number"]),
    game_load_read: Module.cwrap("game_load_read", "number", [
      "number",
      "number",
    ]),

    // story
    story_get_flags: Module.cwrap("story_get_flags", "number", []),
    story_set_flag_bit: Module.cwrap("story_set_flag_bit", null, ["number"]),
    story_apply_effect: Module.cwrap("story_apply_effect", null, ["number"]),

    // boss inject
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
    boss_apply_stats_from_config: Module.cwrap(
      "boss_apply_stats_from_config",
      null,
      []
    ),
  };
}

// ---------- Data loading ----------
async function loadBosses() {
  BOSSES = await fetch("./bosses.json").then((r) => r.json());
}

async function loadStory() {
  STORY = await fetch("./story.json").then((r) => r.json());
}

function configureBossForFloor(floor) {
  if (!BOSSES) return;
  const b = BOSSES.bosses.find((x) => x.floor === floor);
  if (!b) return;

  api.boss_config_begin(b.floor, b.stats.hp, b.stats.atk);

  for (let i = 0; i < Math.min(3, b.patterns.length); i++) {
    const p = b.patterns[i];
    const type = PAT[p.type] ?? 0;
    let cd = p.cooldown ?? 0;
    let p1 = 0,
      p2 = 0,
      p3 = 0;

    if (p.type === "CHARGE") {
      p1 = p.steps ?? 2;
      p2 = p.aoeOnCrash ?? 0;
    } else if (p.type === "SLAM") {
      p1 = p.knockback ?? 2;
      p2 = p.bonusDmg ?? 1;
    } else if (p.type === "MARK") {
      p1 = p.delay ?? 1;
      p2 = p.radius ?? 0;
    } else if (p.type === "WIPE_LINE") {
      p1 = p.range ?? 99;
    } else if (p.type === "CROSS") {
      p1 = p.range ?? 6;
    } else if (p.type === "SUMMON") {
      p1 = p.minionHp ?? 6;
      p2 = p.minionAtk ?? 2;
      p3 = p.shieldTurns ?? 1;
    }

    api.boss_config_add_pattern(type, cd, p1, p2, p3);
  }

  const e = b.enrage ?? {};
  api.boss_config_set_enrage(
    e.hpPercent ?? 50,
    e.cooldownDelta ?? 0,
    e.extraMove ?? 0,
    e.markRadiusDelta ?? 0,
    e.crossRangeDelta ?? 0
  );

  api.boss_config_end();
  api.boss_apply_stats_from_config();

  logLine(`Boss loaded: ${b.name} (floor ${floor})`);
}

// ---------- Save/Load ----------
function saveToLocal() {
  const n = api.game_save_size();
  const ptr = Module._malloc(n);
  api.game_save_write(ptr);
  const bytes = Module.HEAPU8.slice(ptr, ptr + n);
  Module._free(ptr);

  const b64 = btoa(String.fromCharCode(...bytes));
  localStorage.setItem(SAVE_KEY, b64);
  logLine("Saved (1-slot).");
}

function loadFromLocal() {
  const b64 = localStorage.getItem(SAVE_KEY);
  if (!b64) return false;

  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  const ptr = Module._malloc(bytes.length);
  Module.HEAPU8.set(bytes, ptr);

  const ok = api.game_load_read(ptr, bytes.length);
  Module._free(ptr);

  if (ok) logLine("Loaded save.");
  else logLine("Load failed (version mismatch).");
  return !!ok;
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
  logLine("Save cleared.");
}

// ---------- Story ----------
function hasBit(bit) {
  const f = api.story_get_flags() >>> 0;
  return ((f >>> bit) & 1) === 1;
}

function setBit(bit) {
  api.story_set_flag_bit(bit);
}

function renderStoryEvent(ev) {
  elStory.textContent = ev.text;

  // choices
  const row = document.createElement("div");
  row.className = "choiceRow";

  ev.choices.forEach((c, idx) => {
    const b = document.createElement("button");
    b.textContent = c.label;
    if (idx === 0) b.classList.add("primary");

    b.onclick = () => {
      if (typeof c.effect === "number") api.story_apply_effect(c.effect);
      if (typeof c.setBit === "number") setBit(c.setBit);
      elStory.textContent = "";
      row.remove();
      draw();
      saveToLocal();
    };

    row.appendChild(b);
  });

  elStory.appendChild(row);
}

function tryTriggerStory() {
  if (!STORY) return;

  const turn = api.game_turn();
  const bossAlive = api.game_boss_alive() === 1;

  for (const ev of STORY.events) {
    const onceBit = ev.onceBit;
    if (typeof onceBit === "number" && hasBit(onceBit)) continue;

    const t = ev.trigger;
    if (!t) continue;

    let ok = false;
    if (t.type === "TURN_EQ" && turn === t.value) ok = true;
    if (t.type === "BOSS_DEAD" && !bossAlive) ok = true;

    if (ok) {
      renderStoryEvent(ev);
      return;
    }
  }
}

// ---------- Render ----------
const TILE = 16;
const VIEW_W = 40;
const VIEW_H = 22;

function tileColor(ch) {
  if (ch === "#".charCodeAt(0)) return "#1a2130";
  if (ch === ".".charCodeAt(0)) return "#0f141e";
  return "#0f141e";
}

function draw() {
  const w = api.game_w();
  const h = api.game_h();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // map
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = api.game_tile(x, y);
      ctx.fillStyle = tileColor(t);
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);

      // faint grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  // actors
  const px = api.game_player_x();
  const py = api.game_player_y();

  ctx.fillStyle = "#ffd24a";
  ctx.fillRect(px * TILE + 2, py * TILE + 2, TILE - 4, TILE - 4);

  // minion (enemy)
  if (api.game_enemy_alive() === 1) {
    // enemy position isn't exported; simple 표시만: boss 옆에 나올 때가 많아서 최소표현
    // (원하면 enemy x/y export 추가해줄게)
  }

  // boss (position isn't exported either -> 최소표현: 미니맵 같은 HUD로만)
  // (원하면 boss x/y export 추가해줄게)

  // HUD
  const hp = api.game_player_hp();
  const mhp = api.game_player_maxhp();
  elHP.textContent = `HP: ${hp}/${mhp}`;

  const bossAlive = api.game_boss_alive() === 1;
  if (bossAlive) {
    const bhp = api.game_boss_hp();
    const bmhp = api.game_boss_maxhp();
    elBoss.textContent = `Boss: ${bhp}/${bmhp}`;
  } else {
    elBoss.textContent = "Boss: defeated";
  }

  elTurn.textContent = `Turn: ${api.game_turn()}`;

  // trigger story after draw (so UI updates)
  if (elStory.textContent.trim() === "") tryTriggerStory();
}

// ---------- Input ----------
function inputToCode(key, shift) {
  // 1 up,2 down,3 left,4 right, 5~8 dash
  const dash = shift ? 4 : 0;

  if (key === "ArrowUp" || key === "w" || key === "W") return 1 + dash;
  if (key === "ArrowDown" || key === "s" || key === "S") return 2 + dash;
  if (key === "ArrowLeft" || key === "a" || key === "A") return 3 + dash;
  if (key === "ArrowRight" || key === "d" || key === "D") return 4 + dash;
  return 0;
}

window.addEventListener("keydown", (e) => {
  if (!api) return;
  if (elStory.textContent.trim() !== "") return; // 스토리 선택 중엔 이동 막기

  const code = inputToCode(e.key, e.shiftKey);
  if (!code) return;

  e.preventDefault();
  api.game_step(code);
  draw();
  saveToLocal();
});

// ---------- Buttons ----------
btnNew.onclick = () => {
  api.game_new(randSeed());
  configureBossForFloor(1);
  elStory.textContent = "";
  draw();
  saveToLocal();
};

btnContinue.onclick = () => {
  const ok = loadFromLocal();
  if (!ok) {
    logLine("No save. Starting new run.");
    api.game_new(randSeed());
    configureBossForFloor(1);
  }
  elStory.textContent = "";
  draw();
};

btnClear.onclick = () => clearSave();

// ---------- Boot ----------
async function boot() {
  Module = await createModule({
    locateFile: (p) => `./${p}`,
  });

  bind();
  await loadBosses();
  await loadStory();

  // auto-load if exists
  if (!loadFromLocal()) {
    api.game_new(randSeed());
    configureBossForFloor(1);
  }

  draw();
  logLine("Ready.");
}

boot();
