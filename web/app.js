// ===== Minimal IndexedDB single-slot save =====
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

// ===== WASM bindings =====
let api = null;
let ModuleReady = new Promise((res) => {
  // rogue.js (emscripten output) will define Module global
  Module.onRuntimeInitialized = () => res();
});

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const logEl = document.getElementById("log");
const hpEl = document.getElementById("hp");
const bossEl = document.getElementById("boss");
const turnEl = document.getElementById("turn");

function log(msg) {
  logEl.textContent = msg;
}

function randSeed() {
  // 32-bit seed
  return (Math.random() * 0xffffffff) >>> 0;
}

function bind() {
  api = {
    game_new: Module.cwrap("game_new", null, ["number"]),
    game_step: Module.cwrap("game_step", null, ["number"]),
    game_w: Module.cwrap("game_w", "number", []),
    game_h: Module.cwrap("game_h", "number", []),
    game_tile: Module.cwrap("game_tile", "number", ["number", "number"]),
    px: Module.cwrap("game_player_x", "number", []),
    py: Module.cwrap("game_player_y", "number", []),
    php: Module.cwrap("game_player_hp", "number", []),
    pmax: Module.cwrap("game_player_maxhp", "number", []),
    turn: Module.cwrap("game_turn", "number", []),
    bossAlive: Module.cwrap("game_boss_alive", "number", []),
    bossHp: Module.cwrap("game_boss_hp", "number", []),
    bossMax: Module.cwrap("game_boss_maxhp", "number", []),
    saveSize: Module.cwrap("game_save_size", "number", []),
    saveWrite: Module.cwrap("game_save_write", null, ["number"]),
    loadRead: Module.cwrap("game_load_read", "number", ["number", "number"]),
  };
}

function draw() {
  const w = api.game_w();
  const h = api.game_h();

  // tile size auto-fit
  const tw = Math.floor(canvas.width / w);
  const th = Math.floor(canvas.height / h);
  const t = Math.min(tw, th);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${t}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textBaseline = "top";

  const ox = Math.floor((canvas.width - w * t) / 2);
  const oy = Math.floor((canvas.height - h * t) / 2);

  const px = api.px();
  const py = api.py();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tile = api.game_tile(x, y);
      const ch = String.fromCharCode(tile);
      // quick tile shading
      ctx.globalAlpha = ch === "#" ? 0.8 : 1.0;
      ctx.fillText(ch, ox + x * t, oy + y * t);
    }
  }
  ctx.globalAlpha = 1.0;

  // Player
  ctx.fillText("@", ox + px * t, oy + py * t);

  // HUD
  const hp = api.php();
  const max = api.pmax();
  hpEl.textContent = `HP: ${hp}/${max}`;

  const alive = api.bossAlive();
  if (alive) {
    bossEl.textContent = `Boss: ${api.bossHp()}/${api.bossMax()}`;
  } else {
    bossEl.textContent = `Boss: defeated`;
  }

  turnEl.textContent = `Turn: ${api.turn()}`;

  if (hp <= 0) log("당신은 쓰러졌다. New Run으로 다시 시작.");
  else if (!alive) log("보스를 쓰러뜨렸다. (MVP) 이제 스토리/층 확장하면 됨!");
  else log("벽(#)을 이용해 보스 돌진을 유도해봐. (3턴마다 돌진)");
}

// ===== input =====
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
    if (input) {
      e.preventDefault();
      api.game_step(input);
      // autosave on each successful player action (MVP)
      saveGame().catch(() => {});
      draw();
    }
  },
  { passive: false }
);

// ===== Save/Load glue =====
async function saveGame() {
  const size = api.saveSize();
  const ptr = Module._malloc(size);
  try {
    api.saveWrite(ptr);
    const bytes = Module.HEAPU8.slice(ptr, ptr + size);
    await idbSet(KEY, bytes);
    log("저장 완료(1슬롯).");
  } finally {
    Module._free(ptr);
  }
}

async function loadGame() {
  const bytes = await idbGet(KEY);
  if (!bytes) {
    log("저장 데이터 없음. New Run으로 시작해줘.");
    return;
  }
  const size = api.saveSize();
  if (bytes.length !== size) {
    log("세이브 포맷 불일치. (버전 변경 가능) New Run 권장.");
    return;
  }
  const ptr = Module._malloc(size);
  try {
    Module.HEAPU8.set(bytes, ptr);
    const ok = api.loadRead(ptr, size);
    log(ok ? "이어하기 로드 성공!" : "로드 실패. New Run 권장.");
  } finally {
    Module._free(ptr);
  }
  draw();
}

// ===== Buttons =====
document.getElementById("new").addEventListener("click", () => {
  api.game_new(randSeed());
  saveGame().catch(() => {});
  draw();
});

document.getElementById("save").addEventListener("click", () => {
  saveGame().catch(() => log("저장 실패"));
});

document.getElementById("load").addEventListener("click", () => {
  loadGame().catch(() => log("로드 실패"));
});

// ===== Boot =====
(async function boot() {
  await ModuleReady;
  bind();
  // Try continue; if none, start new.
  const exists = await idbGet(KEY);
  if (exists) await loadGame();
  else {
    api.game_new(randSeed());
    await saveGame();
    draw();
  }
})();
