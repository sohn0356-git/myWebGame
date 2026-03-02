// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import HeaderBar from "./components/HeaderBar.tsx";
import GameOverlays from "./components/GameOverlays.tsx";
import HudBar from "./components/HudBar.tsx";
import SidePanels from "./components/SidePanels.tsx";

const h = React.createElement;
const SAVE_KEY = "wasm_rogue_save_v4";
const STORY_EFFECTS = {
  heal_2: 1,
  heal_3: 2,
  atk_1: 3,
  shield_1: 4,
  dash_buff: 5,
};

const PAT = { CHARGE: 1, SLAM: 2, MARK: 3, WIPE_LINE: 4, CROSS: 5, SUMMON: 6 };

const TILE = 16;
const VIEW_W = 40;
const VIEW_H = 22;
const FLOOR_INFO = {
  1: {
    name: "재(灰)광로 지대",
    subtitle: "Ash Furnace",
    hazard: "3턴마다 재 분출구 발동 / 재 타일 위 대시 봉인",
    enemies: "재등룡, 송풍충",
    items: "재마스크, 송풍부츠",
  },
  2: {
    name: "용암성 균열",
    subtitle: "Magma Rift",
    hazard: "2턴마다 라인 예고, 다음 턴 용암 분출",
    enemies: "슬래그, 화염 기포",
    items: "흑요석 망토, 균열부적",
  },
  3: {
    name: "빙결 수로",
    subtitle: "Frost Aqueduct",
    hazard: "4턴마다 결빙 파동(2턴), 얼음 위 이동은 미끄러짐",
    enemies: "수로 뱀, 빙결 수리로봇",
    items: "스파이크 부츠, 수문 키",
  },
  4: {
    name: "암흑 균사림",
    subtitle: "Umbral Mycelium",
    hazard: "3턴마다 포자 폭발, 포자 안에서는 시야 교란",
    enemies: "포자 인형, 균사 사냥꾼",
    items: "정화등, 균사절단칼",
  },
};

const CONTROL_PRESETS = {
  wasd: "WASD + Arrow",
  arrows: "Arrow + WASD",
};

const GOAL_TEXT = "목표: 최하층(Floor 4)까지 내려가 보스를 처치하라.";
const RUN_LOOP_TEXT = "탐색 -> 전투 -> 보상 선택 -> 위험 상승";
const SAVE_TOAST_MS = 1400;
const SAFE_TURN_LIMIT = 12;

function randSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function tileKey(x, y) {
  return `${x},${y}`;
}

function parseTileKey(k) {
  const [sx, sy] = k.split(",");
  return [Number(sx), Number(sy)];
}

function makeSprite(drawFn) {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const s = c.getContext("2d");
  s.imageSmoothingEnabled = false;
  drawFn(s);
  return c;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadWasmRuntime() {
  const candidates = ["./rogue.js", "./game.js"];
  let lastError = null;

  for (const src of candidates) {
    try {
      await loadScript(src);
      return;
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("WASM runtime script not found.");
}

async function resolveRuntimeModule() {
  const createModule = window.createModule;
  if (typeof createModule === "function") {
    return await createModule({ locateFile: (p) => `./${p}` });
  }

  const mod = window.Module;
  if (!mod) {
    throw new Error("WASM runtime loaded but neither createModule nor Module exists.");
  }

  if (mod.calledRun || mod.runtimeInitialized) {
    return mod;
  }

  return await new Promise((resolve) => {
    const prev = mod.onRuntimeInitialized;
    mod.onRuntimeInitialized = () => {
      if (typeof prev === "function") prev();
      resolve(mod);
    };
  });
}

function buildSprites() {
  const sprites = {};

  sprites.floor = makeSprite((s) => {
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

  sprites.wall = makeSprite((s) => {
    s.fillStyle = "#10151f";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#2b3647";
    for (let y = 0; y < TILE; y += 4) s.fillRect(0, y, TILE, 1);
    s.fillStyle = "#3e4d66";
    for (let x = 0; x < TILE; x += 6) s.fillRect(x, 0, 1, TILE);
    s.fillStyle = "#1b2433";
    s.fillRect(0, TILE - 2, TILE, 2);
  });

  sprites.player = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(4, 3, 8, 11);
    s.fillStyle = "#f8d763";
    s.fillRect(5, 4, 6, 3);
    s.fillStyle = "#89c6ff";
    s.fillRect(5, 8, 6, 5);
    s.fillStyle = "#e8f1ff";
    s.fillRect(7, 5, 2, 1);
  });

  sprites.enemy = makeSprite((s) => {
    s.fillStyle = "#000000";
    s.fillRect(4, 4, 8, 9);
    s.fillStyle = "#e36b6b";
    s.fillRect(5, 5, 6, 6);
    s.fillStyle = "#ffd1d1";
    s.fillRect(6, 7, 1, 1);
    s.fillRect(9, 7, 1, 1);
  });

  sprites.boss = makeSprite((s) => {
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

  return sprites;
}

function drawShadow(ctx, x, y, alpha = 0.3) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(x * TILE + 2, y * TILE + TILE - 4, TILE - 4, 2);
}

function drawIntroMap(canvas, sprites, title = "PIXEL RPG FIELD") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const grass = makeSprite((s) => {
    s.fillStyle = "#284f2f";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#3d6d3f";
    s.fillRect(0, 0, TILE, 2);
    s.fillStyle = "#4a7f45";
    s.fillRect(2, 6, 1, 2);
    s.fillRect(10, 10, 1, 2);
    s.fillRect(13, 4, 1, 2);
  });

  const path = makeSprite((s) => {
    s.fillStyle = "#7e6b49";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#9a8458";
    s.fillRect(2, 2, 2, 1);
    s.fillRect(10, 7, 1, 2);
    s.fillRect(6, 12, 2, 1);
  });

  const water = makeSprite((s) => {
    s.fillStyle = "#204a7a";
    s.fillRect(0, 0, TILE, TILE);
    s.fillStyle = "#336aa3";
    s.fillRect(0, 2, TILE, 2);
    s.fillRect(0, 10, TILE, 1);
    s.fillStyle = "#5a8ec4";
    s.fillRect(3, 6, 2, 1);
    s.fillRect(12, 13, 2, 1);
  });

  const tree = makeSprite((s) => {
    s.fillStyle = "#1b2a10";
    s.fillRect(6, 10, 4, 5);
    s.fillStyle = "#2f5f2a";
    s.fillRect(3, 2, 10, 10);
    s.fillStyle = "#4d8a41";
    s.fillRect(5, 4, 6, 6);
  });

  const house = makeSprite((s) => {
    s.fillStyle = "#5a4132";
    s.fillRect(2, 7, 12, 8);
    s.fillStyle = "#a35a3c";
    s.fillRect(1, 4, 14, 4);
    s.fillStyle = "#d2c6a8";
    s.fillRect(7, 10, 2, 5);
    s.fillStyle = "#74a6d6";
    s.fillRect(4, 9, 2, 2);
    s.fillRect(10, 9, 2, 2);
  });

  for (let y = 0; y < VIEW_H; y++) {
    for (let x = 0; x < VIEW_W; x++) {
      ctx.drawImage(grass, x * TILE, y * TILE);
    }
  }

  for (let y = 3; y < 9; y++) {
    for (let x = 1; x < 10; x++) {
      ctx.drawImage(water, x * TILE, y * TILE);
    }
  }

  for (let x = 0; x < VIEW_W; x++) {
    ctx.drawImage(path, x * TILE, 14 * TILE);
    if (x % 7 === 0) ctx.drawImage(path, x * TILE, 13 * TILE);
  }

  for (let y = 9; y < 14; y++) {
    ctx.drawImage(path, 18 * TILE, y * TILE);
    ctx.drawImage(path, 19 * TILE, y * TILE);
  }

  for (let i = 0; i < 24; i++) {
    const x = (i * 7 + 3) % VIEW_W;
    const y = (i * 5 + 2) % VIEW_H;
    if (y < 3 || y > 18 || (x > 12 && x < 24 && y > 10 && y < 16)) {
      ctx.drawImage(tree, x * TILE, y * TILE);
    }
  }

  ctx.drawImage(house, 28 * TILE, 7 * TILE);
  ctx.drawImage(house, 31 * TILE, 9 * TILE);

  drawShadow(ctx, 20, 14, 0.35);
  ctx.drawImage(sprites.player, 20 * TILE, 14 * TILE);

  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    10,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.65
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(10, 10, 240, 44);
  ctx.strokeStyle = "#ffd24a";
  ctx.strokeRect(10.5, 10.5, 239, 43);
  ctx.fillStyle = "#f6e9a6";
  ctx.font = "bold 14px monospace";
  ctx.fillText(title, 20, 30);
  ctx.fillStyle = "#cfd7e5";
  ctx.font = "11px monospace";
  ctx.fillText("WASM loading...", 20, 46);
}

export default function App() {
  const canvasRef = useRef(null);

  const runtimeRef = useRef({
    Module: null,
    api: null,
    BOSSES: null,
    STORY: null,
    sprites: buildSprites(),
  });

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [floor, setFloor] = useState(1);
  const [showStart, setShowStart] = useState(true);
  const [hasSave, setHasSave] = useState(() => !!localStorage.getItem(SAVE_KEY));
  const [paused, setPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [toast, setToast] = useState("");
  const [controlPreset, setControlPreset] = useState("wasd");
  const [hpText, setHpText] = useState("HP: --/--");
  const [hpRatio, setHpRatio] = useState(1);
  const [bossText, setBossText] = useState("Boss: --/--");
  const [turnText, setTurnText] = useState("Turn: --");
  const [storyEvent, setStoryEvent] = useState(null);
  const [upgradeEvent, setUpgradeEvent] = useState(null);
  const [buildTags, setBuildTags] = useState([]);
  const [deathSummary, setDeathSummary] = useState(null);
  const [logLines, setLogLines] = useState(["초기 맵 렌더링 완료"]);
  const [fxState, setFxState] = useState({
    hitFlash: 0,
    damageFlash: 0,
    lootFlash: 0,
    spark: null,
  });
  const envRef = useRef({
    lastTurn: -1,
    ash: new Map(),
    lava: new Map(),
    telegraph: new Set(),
    pending: new Set(),
    spores: new Map(),
    freezeUntil: 0,
    ice: (() => {
      const s = new Set();
      const rows = [2, 6, 10, 14, 18];
      const cols = [4, 10, 16, 22, 28, 34];
      for (const y of rows) for (let x = 1; x < VIEW_W - 1; x++) s.add(tileKey(x, y));
      for (const x of cols) for (let y = 1; y < VIEW_H - 1; y++) s.add(tileKey(x, y));
      return s;
    })(),
  });

  const logText = useMemo(() => logLines.join("\n"), [logLines]);
  const floorMeta = useMemo(() => FLOOR_INFO[floor] || FLOOR_INFO[1], [floor]);
  const toastTimerRef = useRef(null);
  const audioRef = useRef({ ctx: null });
  const damageCauseRef = useRef("");

  const logLine = useCallback((line) => {
    setLogLines((prev) => {
      const next = [line, ...prev];
      return next.slice(0, 120);
    });
  }, []);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), SAVE_TOAST_MS);
  }, []);

  const playSfx = useCallback((kind) => {
    let ctx = audioRef.current.ctx;
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      audioRef.current.ctx = ctx;
    }
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = kind === "damage" ? "sawtooth" : "square";
    const base = kind === "damage" ? 130 : kind === "loot" ? 520 : 260;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * (kind === "damage" ? 0.62 : 1.45), now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "damage" ? 0.06 : 0.045, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }, []);

  const emitFx = useCallback((patch) => {
    setFxState((prev) => ({ ...prev, ...patch }));
  }, []);

  const hasBit = useCallback((bit) => {
    const api = runtimeRef.current.api;
    if (!api) return false;
    const f = api.story_get_flags() >>> 0;
    return ((f >>> bit) & 1) === 1;
  }, []);

  const setBit = useCallback((bit) => {
    const api = runtimeRef.current.api;
    if (api) api.story_set_flag_bit(bit);
  }, []);

  const resetEnvironment = useCallback(() => {
    const env = envRef.current;
    env.lastTurn = -1;
    env.ash.clear();
    env.lava.clear();
    env.telegraph.clear();
    env.pending.clear();
    env.spores.clear();
    env.freezeUntil = 0;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFxState((prev) => {
        const next = {
          hitFlash: Math.max(0, prev.hitFlash - 1),
          damageFlash: Math.max(0, prev.damageFlash - 1),
          lootFlash: Math.max(0, prev.lootFlash - 1),
          spark: prev.spark,
        };
        if (next.spark) {
          next.spark = next.spark.life <= 1 ? null : { ...next.spark, life: next.spark.life - 1 };
        }
        return next;
      });
    }, 55);
    return () => clearInterval(id);
  }, []);

  const applyEnvironment = useCallback(() => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const env = envRef.current;
    const turn = api.game_turn();
    if (env.lastTurn === turn) return;
    env.lastTurn = turn;

    for (const [k, ttl] of env.ash) ttl <= 1 ? env.ash.delete(k) : env.ash.set(k, ttl - 1);
    for (const [k, ttl] of env.lava) ttl <= 1 ? env.lava.delete(k) : env.lava.set(k, ttl - 1);
    for (const [k, ttl] of env.spores) ttl <= 1 ? env.spores.delete(k) : env.spores.set(k, ttl - 1);

    const px = api.game_player_x();
    const py = api.game_player_y();
    const pKey = tileKey(px, py);

    if (floor === 1 && turn > 0 && turn % 3 === 0) {
      const vents = [[8, 6], [21, 7], [28, 16], [13, 16]];
      for (const [vx, vy] of vents) {
        if (pKey === tileKey(vx, vy)) api.game_apply_player_damage(1);
        const around = [[vx, vy], [vx + 1, vy], [vx - 1, vy], [vx, vy + 1], [vx, vy - 1]];
        for (const [ax, ay] of around) {
          if (ax >= 0 && ay >= 0 && ax < VIEW_W && ay < VIEW_H) env.ash.set(tileKey(ax, ay), 2);
        }
      }
      logLine("ASH VENT 발동: 재 타일 생성");
    }

    if (floor === 2) {
      if (env.pending.size > 0) {
        for (const k of env.pending) {
          env.lava.set(k, 1);
          if (k === pKey) api.game_apply_player_damage(2);
        }
        env.pending.clear();
        env.telegraph.clear();
      }

      if (turn > 0 && turn % 2 === 0) {
        const rows = [4, 7, 10, 13, 16];
        const cols = [9, 15, 21, 27, 33];
        const row = rows[(turn / 2) % rows.length];
        const col = cols[(turn / 3) % cols.length];
        env.telegraph.clear();
        for (let x = 1; x < VIEW_W - 1; x++) env.telegraph.add(tileKey(x, row));
        for (let y = 1; y < VIEW_H - 1; y++) env.telegraph.add(tileKey(col, y));
        env.pending = new Set(env.telegraph);
      }
      if (env.lava.has(pKey)) api.game_apply_player_damage(1);
    }

    if (floor === 3 && turn > 0 && turn % 4 === 0) {
      env.freezeUntil = turn + 2;
      logLine("FREEZE PULSE: 수로 결빙");
    }

    if (floor === 4 && turn > 0 && turn % 3 === 0) {
      const hubs = [[9, 6], [29, 6], [11, 16], [31, 16], [20, 6], [20, 16]];
      for (const [x, y] of hubs) {
        const around = [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (const [ax, ay] of around) env.spores.set(tileKey(ax, ay), 1);
      }
      if (env.spores.has(pKey)) api.game_apply_player_damage(1);
    }
  }, [floor, logLine]);

  const draw = useCallback(() => {
    const rt = runtimeRef.current;
    const { api, sprites } = rt;
    const canvas = canvasRef.current;
    if (!api || !canvas) return;
    const ctx = canvas.getContext("2d");
    applyEnvironment();

    const w = api.game_w();
    const h = api.game_h();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = api.game_tile(x, y);
        ctx.drawImage(t === "#".charCodeAt(0) ? sprites.wall : sprites.floor, x * TILE, y * TILE);
      }
    }

    const env = envRef.current;
    for (const k of env.ash.keys()) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(160,150,140,0.45)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    for (const k of env.telegraph) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(230,65,49,0.35)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    for (const k of env.lava.keys()) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(255,108,33,0.6)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    if (floor === 3 && api.game_turn() < env.freezeUntil) {
      for (const k of env.ice) {
        const [x, y] = parseTileKey(k);
        ctx.fillStyle = "rgba(130,207,255,0.22)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    for (const k of env.spores.keys()) {
      const [x, y] = parseTileKey(k);
      ctx.fillStyle = "rgba(103,189,128,0.35)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }

    const px = api.game_player_x();
    const py = api.game_player_y();
    drawShadow(ctx, px, py);
    ctx.drawImage(sprites.player, px * TILE, py * TILE);

    if (api.game_enemy_alive() === 1) {
      const ex = api.game_enemy_x();
      const ey = api.game_enemy_y();
      drawShadow(ctx, ex, ey, 0.35);
      ctx.drawImage(sprites.enemy, ex * TILE, ey * TILE);
    }

    if (api.game_boss_alive() === 1) {
      const bx = api.game_boss_x();
      const by = api.game_boss_y();
      drawShadow(ctx, bx, by, 0.38);
      ctx.drawImage(sprites.boss, bx * TILE, by * TILE);
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
    setHpText(`HP: ${hp}/${mhp}`);
    setHpRatio(clamp(hp / Math.max(1, mhp), 0, 1));

    const bossAlive = api.game_boss_alive() === 1;
    const inSpore = floor === 4 && env.spores.has(tileKey(px, py));
    if (bossAlive) {
      if (inSpore) setBossText("Boss: ??? (포자 간섭)");
      else {
        const bhp = api.game_boss_hp();
        const bmhp = api.game_boss_maxhp();
        setBossText(`Boss: ${bhp}/${bmhp}`);
      }
    } else {
      setBossText("Boss: defeated");
    }

    setTurnText(`Turn: ${api.game_turn()}`);

    if (fxState.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,245,185,${0.1 + fxState.hitFlash * 0.035})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (fxState.lootFlash > 0) {
      ctx.fillStyle = `rgba(94,219,171,${0.06 + fxState.lootFlash * 0.03})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (fxState.damageFlash > 0) {
      const edge = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.2,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.68
      );
      edge.addColorStop(0, "rgba(0,0,0,0)");
      edge.addColorStop(1, `rgba(197,37,37,${0.14 + fxState.damageFlash * 0.05})`);
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (fxState.spark) {
      const { x, y, life } = fxState.spark;
      ctx.fillStyle = `rgba(255,198,115,${0.18 + life * 0.1})`;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }

    if (!storyEvent && rt.STORY) {
      const turn = api.game_turn();
      for (const ev of rt.STORY.events) {
        if (typeof ev.onceBit === "number" && hasBit(ev.onceBit)) continue;
        const trigger = ev.trigger;
        if (!trigger) continue;

        let ok = false;
        if (trigger.type === "TURN_EQ" && turn === trigger.value) ok = true;
        if (trigger.type === "BOSS_DEAD" && api.game_boss_alive() !== 1) ok = true;
        if (trigger.type === "FLOOR_START" && turn === 0) ok = true;
        if (typeof trigger.floor === "number" && trigger.floor !== floor) ok = false;

        if (ok) {
          setStoryEvent(ev);
          break;
        }
      }
    }
  }, [applyEnvironment, floor, fxState, hasBit, storyEvent]);

  const saveToLocal = useCallback(() => {
    const rt = runtimeRef.current;
    const { api, Module } = rt;
    if (!api || !Module) return;

    const n = api.game_save_size();
    const ptr = Module._malloc(n);
    api.game_save_write(ptr);
    const bytes = Module.HEAPU8.slice(ptr, ptr + n);
    Module._free(ptr);

    const b64 = btoa(String.fromCharCode(...bytes));
    localStorage.setItem(SAVE_KEY, b64);
    setHasSave(true);
    showToast("저장됨");
  }, [showToast]);

  const loadFromLocal = useCallback(() => {
    const rt = runtimeRef.current;
    const { api, Module } = rt;
    if (!api || !Module) return false;

    const b64 = localStorage.getItem(SAVE_KEY);
    if (!b64) return false;

    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const ptr = Module._malloc(bytes.length);
    Module.HEAPU8.set(bytes, ptr);
    const ok = api.game_load_read(ptr, bytes.length);
    Module._free(ptr);

    logLine(ok ? "Loaded save." : "Load failed (version mismatch).");
    if (ok) showToast("저장 불러오기 완료");
    setHasSave(!!ok || !!localStorage.getItem(SAVE_KEY));
    return !!ok;
  }, [logLine, showToast]);

  const configureBossForFloor = useCallback((floor) => {
    const rt = runtimeRef.current;
    const { BOSSES, api } = rt;
    if (!BOSSES || !api) return;

    const boss = BOSSES.bosses.find((x) => x.floor === floor);
    if (!boss) return;

    api.boss_config_begin(boss.floor, boss.stats.hp, boss.stats.atk);

    for (let i = 0; i < Math.min(3, boss.patterns.length); i++) {
      const p = boss.patterns[i];
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

    const enrage = boss.enrage ?? {};
    api.boss_config_set_enrage(
      enrage.hpPercent ?? 50,
      enrage.cooldownDelta ?? 0,
      enrage.extraMove ?? 0,
      enrage.markRadiusDelta ?? 0,
      enrage.crossRangeDelta ?? 0
    );

    api.boss_config_end();
    api.boss_apply_stats_from_config();
    logLine(`Boss loaded: ${boss.name} (floor ${floor})`);
  }, [logLine]);

  const makeUpgradeChoices = useCallback(() => {
    const pool = [
      { label: "공격 증폭", effect: STORY_EFFECTS.atk_1, tag: "ATK", desc: "+1 ATK (상시)" },
      { label: "강철 방패", effect: STORY_EFFECTS.shield_1, tag: "SHIELD", desc: "피격 완화" },
      { label: "대시 부스터", effect: STORY_EFFECTS.dash_buff, tag: "DASH", desc: "대시 효율 증가" },
      { label: "응급 치료", effect: STORY_EFFECTS.heal_2, tag: "HEAL", desc: "HP +2" },
      { label: "응급 수혈+", effect: STORY_EFFECTS.heal_3, tag: "HEAL", desc: "HP +3" },
    ];
    const picked = [];
    while (picked.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }, []);

  const inferDamageCause = useCallback((snapshot) => {
    const api = runtimeRef.current.api;
    if (!api) return "피해 원인 미확인";
    const px = api.game_player_x();
    const py = api.game_player_y();
    const env = envRef.current;
    const here = tileKey(px, py);
    if (floor === 2 && (env.lava.has(here) || env.pending.has(here) || env.telegraph.has(here))) return "용암 분출 라인";
    if (floor === 4 && env.spores.has(here)) return "포자 폭발 장판";
    if (floor === 1 && env.ash.has(here)) return "재 분출구 화상";
    if (api.game_enemy_alive() === 1) {
      const d = Math.abs(api.game_enemy_x() - px) + Math.abs(api.game_enemy_y() - py);
      if (d <= 1) return "근접 적 공격";
    }
    if (api.game_boss_alive() === 1) {
      const d = Math.abs(api.game_boss_x() - px) + Math.abs(api.game_boss_y() - py);
      if (d <= 2) return "보스 패턴 공격";
    }
    if (snapshot.turn <= SAFE_TURN_LIMIT) return "초반 교전 피해";
    return "지형 또는 적 패턴 피해";
  }, [floor]);

  const stepWithCode = useCallback((code) => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const before = {
      turn: api.game_turn(),
      hp: api.game_player_hp(),
      bossHp: api.game_boss_alive() === 1 ? api.game_boss_hp() : 0,
      enemyAlive: api.game_enemy_alive() === 1,
      px: api.game_player_x(),
      py: api.game_player_y(),
    };
    api.game_step(code);

    const after = {
      turn: api.game_turn(),
      hp: api.game_player_hp(),
      bossHp: api.game_boss_alive() === 1 ? api.game_boss_hp() : 0,
      enemyAlive: api.game_enemy_alive() === 1,
      px: api.game_player_x(),
      py: api.game_player_y(),
    };

    const tookDamage = after.hp < before.hp;
    const dealtBossDamage = after.bossHp < before.bossHp;
    const killedEnemy = before.enemyAlive && !after.enemyAlive;

    if (dealtBossDamage || killedEnemy) {
      emitFx({
        hitFlash: 4,
        spark: { x: after.px, y: after.py, life: 4 },
      });
      playSfx("hit");
    }
    if (tookDamage) {
      const cause = inferDamageCause(before);
      damageCauseRef.current = cause;
      emitFx({ damageFlash: 5 });
      playSfx("damage");
      logLine(`피격: ${cause}`);
    }

    if (after.hp <= 0) {
      setDeathSummary({
        floor,
        turn: after.turn,
        reason: damageCauseRef.current || "원인 미상",
        build: buildTags.length ? buildTags.join(" + ") : "기본 빌드",
      });
    }

    if (after.turn > 0 && after.turn % 6 === 0 && !upgradeEvent && !storyEvent && after.hp > 0) {
      setUpgradeEvent({
        title: "보상 선택",
        subtitle: "지금 빌드를 강화할 특성을 하나 선택하세요.",
        choices: makeUpgradeChoices(),
      });
      emitFx({ lootFlash: 3 });
      playSfx("loot");
    }

    draw();
    saveToLocal();
  }, [buildTags, draw, emitFx, floor, inferDamageCause, logLine, makeUpgradeChoices, playSfx, saveToLocal, storyEvent, upgradeEvent]);

  const dirToCode = useCallback((dx, dy, dash = false) => {
    if (dx === 0 && dy === -1) return dash ? 5 : 1;
    if (dx === 0 && dy === 1) return dash ? 6 : 2;
    if (dx === -1 && dy === 0) return dash ? 7 : 3;
    if (dx === 1 && dy === 0) return dash ? 8 : 4;
    return 0;
  }, []);

  const tryAutoAttack = useCallback(() => {
    const api = runtimeRef.current.api;
    if (!api) return false;

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
  }, [dirToCode, stepWithCode]);

  const stepToward = useCallback((tx, ty, dash = false) => {
    const api = runtimeRef.current.api;
    if (!api) return;

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
    if (code) stepWithCode(code);
  }, [dirToCode, stepWithCode, tryAutoAttack]);

  const inputToCode = useCallback((key, shift) => {
    const dash = shift ? 4 : 0;
    const upA = controlPreset === "arrows" ? ["ArrowUp", "w", "W"] : ["w", "W", "ArrowUp"];
    const downA = controlPreset === "arrows" ? ["ArrowDown", "s", "S"] : ["s", "S", "ArrowDown"];
    const leftA = controlPreset === "arrows" ? ["ArrowLeft", "a", "A"] : ["a", "A", "ArrowLeft"];
    const rightA = controlPreset === "arrows" ? ["ArrowRight", "d", "D"] : ["d", "D", "ArrowRight"];
    if (upA.includes(key)) return 1 + dash;
    if (downA.includes(key)) return 2 + dash;
    if (leftA.includes(key)) return 3 + dash;
    if (rightA.includes(key)) return 4 + dash;
    return 0;
  }, [controlPreset]);

  const normalizeCodeWithEnvironment = useCallback((code) => {
    const api = runtimeRef.current.api;
    if (!api || !code) return code;
    const px = api.game_player_x();
    const py = api.game_player_y();
    const here = tileKey(px, py);
    const env = envRef.current;

    if (floor === 1 && code >= 5 && env.ash.has(here)) {
      logLine("재 타일: 대시 봉인");
      return code - 4;
    }

    if (floor === 3 && code >= 1 && code <= 4 && api.game_turn() < env.freezeUntil && env.ice.has(here)) {
      return code + 4;
    }

    return code;
  }, [floor, logLine]);

  const onNewRun = useCallback(() => {
    const api = runtimeRef.current.api;
    if (!api) return;

    resetEnvironment();
    api.game_new(randSeed());
    api.story_apply_effect(STORY_EFFECTS.shield_1);
    configureBossForFloor(1);
    setFloor(1);
    setStoryEvent(null);
    setUpgradeEvent(null);
    setBuildTags([]);
    setDeathSummary(null);
    damageCauseRef.current = "";
    setShowStart(false);
    logLine("초반 안전 구간: 기본 보호막 적용");
    draw();
    saveToLocal();
  }, [configureBossForFloor, draw, logLine, resetEnvironment, saveToLocal]);

  const onContinue = useCallback(() => {
    const api = runtimeRef.current.api;
    if (!api) return;

    resetEnvironment();
    const ok = loadFromLocal();
    if (!ok) {
      logLine("No save. Starting new run.");
      api.game_new(randSeed());
      configureBossForFloor(1);
      setFloor(1);
    } else {
      const f = clamp(api.game_floor(), 1, 4);
      configureBossForFloor(f);
      setFloor(f);
    }
    setStoryEvent(null);
    setUpgradeEvent(null);
    setDeathSummary(null);
    setShowStart(false);
    draw();
  }, [configureBossForFloor, draw, loadFromLocal, logLine, resetEnvironment]);

  const onStartRun = useCallback(() => {
    if (!ready) return;
    if (hasSave) onContinue();
    else onNewRun();
  }, [hasSave, onContinue, onNewRun, ready]);

  const onNextFloor = useCallback(() => {
    const api = runtimeRef.current.api;
    if (!api) return;
    if (api.game_boss_alive() === 1) return;

    const next = clamp(floor + 1, 1, 4);
    if (next === floor) return;

    resetEnvironment();
    api.game_set_floor(next, randSeed(), 1);
    configureBossForFloor(next);
    setFloor(next);
    setStoryEvent(null);
    setUpgradeEvent(null);
    logLine(`심장실 이동: Floor ${next}`);
    draw();
    saveToLocal();
  }, [configureBossForFloor, draw, floor, logLine, resetEnvironment, saveToLocal]);

  const onClear = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    logLine("Save cleared.");
    setHasSave(false);
    showToast("저장 삭제됨");
  }, [logLine, showToast]);

  const onStoryChoice = useCallback((choice) => {
    const api = runtimeRef.current.api;
    if (!api) return;

    const effectId =
      typeof choice.effect === "number" ? choice.effect : STORY_EFFECTS[choice.effect] ?? 0;

    if (effectId > 0) api.story_apply_effect(effectId);
    if (typeof choice.setBit === "number") setBit(choice.setBit);
    if (choice.log) logLine(choice.log);

    setStoryEvent(null);
    draw();
    saveToLocal();
  }, [draw, logLine, saveToLocal, setBit]);

  const onUpgradeChoice = useCallback((choice) => {
    const api = runtimeRef.current.api;
    if (!api || !choice) return;
    if (choice.effect) api.story_apply_effect(choice.effect);
    if (choice.tag) {
      setBuildTags((prev) => {
        const next = [...prev, choice.tag];
        return next.slice(-6);
      });
    }
    logLine(`획득: ${choice.label} (${choice.desc})`);
    emitFx({ lootFlash: 5 });
    playSfx("loot");
    setUpgradeEvent(null);
    draw();
    saveToLocal();
  }, [draw, emitFx, logLine, playSfx, saveToLocal]);

  const onCopyResult = useCallback(async () => {
    if (!deathSummary) return;
    const text = [
      "[HEART DIVER RUN]",
      `Floor: ${deathSummary.floor}`,
      `Turn: ${deathSummary.turn}`,
      `Build: ${deathSummary.build}`,
      `Death: ${deathSummary.reason}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("결과 카드 복사됨");
    } catch {
      showToast("클립보드 복사 실패");
    }
  }, [deathSummary, showToast]);

  useEffect(() => {
    drawIntroMap(canvasRef.current, runtimeRef.current.sprites);
  }, []);

  useEffect(() => {
    let disposed = false;

    async function boot() {
      try {
        await loadWasmRuntime();
        if (disposed) return;
        const Module = await resolveRuntimeModule();
        if (disposed) return;

        const api = {
          game_new: Module.cwrap("game_new", null, ["number"]),
          game_set_floor: Module.cwrap("game_set_floor", null, ["number", "number", "number"]),
          game_w: Module.cwrap("game_w", "number", []),
          game_h: Module.cwrap("game_h", "number", []),
          game_floor: Module.cwrap("game_floor", "number", []),
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
          game_apply_player_damage: Module.cwrap("game_apply_player_damage", null, ["number"]),

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

        const [bosses, story] = await Promise.all([
          fetch("./bosses.json").then((r) => r.json()),
          fetch("./story.json").then((r) => r.json()),
        ]);

        runtimeRef.current.Module = Module;
        runtimeRef.current.api = api;
        runtimeRef.current.BOSSES = bosses;
        runtimeRef.current.STORY = story;

        if (!loadFromLocal()) {
          api.game_new(randSeed());
          configureBossForFloor(1);
          setFloor(1);
        } else {
          const f = clamp(api.game_floor(), 1, 4);
          configureBossForFloor(f);
          setFloor(f);
        }

        setReady(true);
        draw();
        logLine("Ready.");
      } catch (err) {
        if (disposed) return;
        setLoadError(err?.message || String(err));
        logLine("Game load failed.");
      }
    }

    boot();

    return () => {
      disposed = true;
    };
  }, [configureBossForFloor, draw, loadFromLocal, logLine]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!runtimeRef.current.api || !ready || storyEvent || upgradeEvent || deathSummary || paused || showStart) return;

      if (e.key === " " || e.key === "f" || e.key === "F" || e.key === "e" || e.key === "E") {
        e.preventDefault();
        tryAutoAttack();
        return;
      }

      const code = normalizeCodeWithEnvironment(inputToCode(e.key, e.shiftKey));
      if (!code) return;
      e.preventDefault();
      stepWithCode(code);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deathSummary, inputToCode, normalizeCodeWithEnvironment, paused, ready, showStart, stepWithCode, storyEvent, tryAutoAttack, upgradeEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function onPointerDown(e) {
      if (!runtimeRef.current.api || !ready || storyEvent || upgradeEvent || deathSummary || paused || showStart) return;

      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;

      const tx = clamp(Math.floor(((e.clientX - rect.left) * sx) / TILE), 0, VIEW_W - 1);
      const ty = clamp(Math.floor(((e.clientY - rect.top) * sy) / TILE), 0, VIEW_H - 1);

      stepToward(tx, ty, e.shiftKey);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    return () => canvas.removeEventListener("pointerdown", onPointerDown);
  }, [deathSummary, paused, ready, showStart, stepToward, storyEvent, upgradeEvent]);

  useEffect(() => {
    function pauseByFocus() {
      if (!ready || showStart || deathSummary) return;
      setPaused(true);
      setPauseReason("포커스 아웃: 일시정지됨");
    }
    function onVisibility() {
      if (document.hidden) pauseByFocus();
    }
    window.addEventListener("blur", pauseByFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pauseByFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [deathSummary, ready, showStart]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const storyBody = storyEvent
    ? [
        h("div", { key: "story-text" }, storyEvent.text),
        h(
          "div",
          { key: "story-choice", className: "choiceRow" },
          storyEvent.choices.map((choice, idx) =>
            h(
              "button",
              {
                key: `${choice.label}-${idx}`,
                className: idx === 0 ? "primary" : "",
                onClick: () => onStoryChoice(choice),
              },
              choice.label
            )
          )
        ),
      ]
    : h(
        "div",
        { className: "mutedText" },
        ready ? "이벤트 조건을 만족하면 스토리가 표시됩니다." : "WASM 로딩 중..."
      );

  return h(
    React.Fragment,
    null,
    h(HeaderBar, {
      controlPreset,
      setControlPreset,
      controlPresets: CONTROL_PRESETS,
    }),
    h(
      "main",
      { className: "layout" },
      h(
        "section",
        { className: "panel" },
        h(
          "div",
          { className: "gameStage" },
          h("canvas", { ref: canvasRef, width: 640, height: 352 }),
          h(GameOverlays, {
            showStart,
            ready,
            hasSave,
            onStartRun,
            paused,
            pauseReason,
            setPaused,
            upgradeEvent,
            onUpgradeChoice,
            deathSummary,
            onCopyResult,
            onNewRun,
            goalText: GOAL_TEXT,
            runLoopText: RUN_LOOP_TEXT,
          })
        ),
        h(HudBar, {
          hpText,
          hpRatio,
          bossText,
          turnText,
          floor,
          floorMeta,
          goalText: GOAL_TEXT,
        }),
        h(
          "div",
          { className: "buttons" },
          h("button", { onClick: onNewRun, disabled: !ready }, "New Run"),
          h("button", { onClick: onContinue, disabled: !ready }, "Continue"),
          h("button", { onClick: onNextFloor, disabled: !(ready && runtimeRef.current.api?.game_boss_alive() === 0 && floor < 4) }, "Next Floor"),
          h("button", { onClick: () => setPaused((v) => !v), disabled: !ready || showStart }, paused ? "Resume" : "Pause"),
          h("button", { onClick: onClear }, "Clear Save")
        ),
        loadError ? h("div", { className: "loadError" }, `Game load failed: ${loadError}`) : null
      ),
      h(SidePanels, { floorMeta, buildTags, storyBody, logText })
    ),
    toast ? h("div", { className: "toast" }, toast) : null
  );
}


