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
const STORY_EFFECTS = {
  heal_2: 1,
  heal_3: 2,
  atk_1: 3,
  shield_1: 4,
  dash_buff: 5,
};

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
    game_enemy_x: Module.cwrap("game_enemy_x", "number", []),
    game_enemy_y: Module.cwrap("game_enemy_y", "number", []),
    game_boss_x: Module.cwrap("game_boss_x", "number", []),
    game_boss_y: Module.cwrap("game_boss_y", "number", []),

    game_save_size: Module.cwrap("game_save_size", "number", []),
    game_save_write: Module.cwrap("game_save_write", null, ["number"]),
    game_load_read: Module.cwrap("game_load_read", "number", ["number", "number"]),

    story_get_flags: Module.cwrap("story_get_flags", "number", []),
    story_set_flag_bit: Module.cwrap("story_set_flag_bit", null, ["number"]),
    story_apply_effect: Module.cwrap("story_apply_effect", null, ["number"]),

    boss_config_begin: Module.cwrap("boss_config_begin", null, ["number", "number", "number"]),
    boss_config_add_pattern: Module.cwrap("boss_config_add_pattern", null, ["number", "number", "number", "number", "number"]),
    boss_config_set_enrage: Module.cwrap("boss_config_set_enrage", null, ["number", "number", "number", "number", "number"]),
    boss_config_end: Module.cwrap("boss_config_end", null, []),
    boss_apply_stats_from_config: Module.cwrap("boss_apply_stats_from_config", null, []),
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
    const cd = p.cooldown ?? 0;
    let p1 = 0;
    let p2 = 0;
    let p3 = 0;

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

  const row = document.createElement("div");
  row.className = "choiceRow";

  ev.choices.forEach((c, idx) => {
    const b = document.createElement("button");
    b.textContent = c.label;
    if (idx === 0) b.classList.add("primary");

    b.onclick = () => {
      const effectId =
        typeof c.effect === "number" ? c.effect : STORY_EFFECTS[c.effect] ?? 0;
      if (effectId > 0) api.story_apply_effect(effectId);
      if (typeof c.setBit === "number") setBit(c.setBit);
      if (c.log) logLine(c.log);
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
const SPRITES = {};

function makeSprite(drawFn) {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const s = c.getContext("2d");
  s.imageSmoothingEnabled = false;
  drawFn(s);
  return c;
}

function drawShadow(x, y, alpha = 0.3) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(x * TILE + 2, y * TILE + TILE - 4, TILE - 4, 2);
}

function initSprites() {
  SPRITES.floor = makeSprite((s) => {
    s.fillStyle = "#1a202c";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#222b3a";
    s.fillRect(0, 0, TILE, 2);
    s.fillRect(0, 0, 2, TILE);
    s.fillStyle = "#2d384a";
    for (let i = 2; i < TILE - 2; i += 4) {
      s.fillRect(i, 6 + (i % 3), 1, 1);
      s.fillRect((i + 5) % TILE, 12, 1, 1);
    }
  });

  SPRITES.wall = makeSprite((s) => {
    s.fillStyle = "#10151f";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#2b3647";
    for (let y = 0; y < TILE; y += 4) s.fillRect(0, y, TILE, 1);
    s.fillStyle = "#3e4d66";
    for (let x = 0; x < TILE; x += 6) s.fillRect(x, 0, 1, TILE);
    s.fillStyle = "#1b2433";
    s.fillRect(0, TILE - 2, TILE, 2);
  });

  SPRITES.player = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(4, 3, 8, 11);
    s.fillStyle = "#f8d763";
    s.fillRect(5, 4, 6, 3);
    s.fillStyle = "#89c6ff";
    s.fillRect(5, 8, 6, 5);
    s.fillStyle = "#e8f1ff";
    s.fillRect(7, 5, 2, 1);
  });

  SPRITES.enemy = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(4, 4, 8, 9);
    s.fillStyle = "#e36b6b";
    s.fillRect(5, 5, 6, 6);
    s.fillStyle = "#ffd1d1";
    s.fillRect(6, 7, 1, 1);
    s.fillRect(9, 7, 1, 1);
  });

  SPRITES.boss = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(2, 2, 12, 12);
    s.fillStyle = "#9a7cff";
    s.fillRect(3, 3, 10, 10);
    s.fillStyle = "#ccbaff";
    s.fillRect(5, 6, 2, 2);
    s.fillRect(9, 6, 2, 2);
    s.fillStyle = "#6e54b8";
    s.fillRect(4, 11, 8, 2);
  });
}

function draw() {
  const w = api.game_w();
  const h = api.game_h();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = api.game_tile(x, y);
      ctx.drawImage(t === "#".charCodeAt(0) ? SPRITES.wall : SPRITES.floor, x * TILE, y * TILE);
    }
  }

  const px = api.game_player_x();
  const py = api.game_player_y();
  drawShadow(px, py);
  ctx.drawImage(SPRITES.player, px * TILE, py * TILE);

  if (api.game_enemy_alive() === 1) {
    const ex = api.game_enemy_x();
    const ey = api.game_enemy_y();
    drawShadow(ex, ey, 0.35);
    ctx.drawImage(SPRITES.enemy, ex * TILE, ey * TILE);
  }

  if (api.game_boss_alive() === 1) {
    const bx = api.game_boss_x();
    const by = api.game_boss_y();
    drawShadow(bx, by, 0.38);
    ctx.drawImage(SPRITES.boss, bx * TILE, by * TILE);
  }

  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    10,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.65
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  if (elStory.textContent.trim() === "") tryTriggerStory();
}

// ---------- Input ----------
function stepWithCode(code) {
  api.game_step(code);
  draw();
  saveToLocal();
}

function inputToCode(key, shift) {
  const dash = shift ? 4 : 0;

  if (key === "ArrowUp" || key === "w" || key === "W") return 1 + dash;
  if (key === "ArrowDown" || key === "s" || key === "S") return 2 + dash;
  if (key === "ArrowLeft" || key === "a" || key === "A") return 3 + dash;
  if (key === "ArrowRight" || key === "d" || key === "D") return 4 + dash;
  return 0;
}

function dirToCode(dx, dy, dash = false) {
  if (dx === 0 && dy === -1) return dash ? 5 : 1;
  if (dx === 0 && dy === 1) return dash ? 6 : 2;
  if (dx === -1 && dy === 0) return dash ? 7 : 3;
  if (dx === 1 && dy === 0) return dash ? 8 : 4;
  return 0;
}

function tryAutoAttack() {
  const px = api.game_player_x();
  const py = api.game_player_y();
  const candidates = [];

  if (api.game_enemy_alive() === 1) {
    candidates.push({ x: api.game_enemy_x(), y: api.game_enemy_y(), priority: 1 });
  }
  if (api.game_boss_alive() === 1) {
    candidates.push({ x: api.game_boss_x(), y: api.game_boss_y(), priority: 0 });
  }

  candidates.sort((a, b) => a.priority - b.priority);

  for (const t of candidates) {
    const md = Math.abs(t.x - px) + Math.abs(t.y - py);
    if (md !== 1) continue;

    const code = dirToCode(Math.sign(t.x - px), Math.sign(t.y - py), false);
    if (!code) continue;

    stepWithCode(code);
    return true;
  }

  return false;
}

function stepToward(tx, ty, dash = false) {
  const px = api.game_player_x();
  const py = api.game_player_y();
  const ddx = tx - px;
  const ddy = ty - py;

  if (ddx === 0 && ddy === 0) {
    tryAutoAttack();
    return;
  }

  let dx = 0;
  let dy = 0;
  if (Math.abs(ddx) >= Math.abs(ddy)) dx = Math.sign(ddx);
  else dy = Math.sign(ddy);

  const code = dirToCode(dx, dy, dash);
  if (!code) return;

  stepWithCode(code);
}

window.addEventListener("keydown", (e) => {
  if (!api) return;
  if (elStory.textContent.trim() !== "") return;

  if (e.key === " " || e.key === "f" || e.key === "F") {
    e.preventDefault();
    tryAutoAttack();
    return;
  }

  const code = inputToCode(e.key, e.shiftKey);
  if (!code) return;

  e.preventDefault();
  stepWithCode(code);
});

canvas.addEventListener("pointerdown", (e) => {
  if (!api) return;
  if (elStory.textContent.trim() !== "") return;

  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;

  const tx = clamp(Math.floor(((e.clientX - rect.left) * sx) / TILE), 0, VIEW_W - 1);
  const ty = clamp(Math.floor(((e.clientY - rect.top) * sy) / TILE), 0, VIEW_H - 1);

  stepToward(tx, ty, e.shiftKey);
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
  Module = await createModule({ locateFile: (p) => `./${p}` });

  bind();
  await loadBosses();
  await loadStory();
  initSprites();

  if (!loadFromLocal()) {
    api.game_new(randSeed());
    configureBossForFloor(1);
  }

  draw();
  logLine("Ready.");
}

boot();

