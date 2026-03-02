// web/ts/ui.tsx
import React6 from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

// web/ts/app.tsx
import React5, { useCallback, useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";

// web/ts/components/HeaderBar.tsx
import React from "https://esm.sh/react@18.3.1";
function HeaderBar({ controlPreset, setControlPreset, controlPresets }) {
  return /* @__PURE__ */ React.createElement("header", { className: "top" }, /* @__PURE__ */ React.createElement("div", { className: "brand" }, "HEART DIVER"), /* @__PURE__ */ React.createElement("div", { className: "topRight" }, /* @__PURE__ */ React.createElement("div", { className: "hint" }, "WASD/Arrow Move | Space Attack | E Interact | Shift+Move Dash"), /* @__PURE__ */ React.createElement("div", { className: "presetRow" }, /* @__PURE__ */ React.createElement("span", { className: "mutedText" }, "Key Preset"), /* @__PURE__ */ React.createElement("button", { className: controlPreset === "wasd" ? "primary" : "", onClick: () => setControlPreset("wasd") }, controlPresets.wasd), /* @__PURE__ */ React.createElement("button", { className: controlPreset === "arrows" ? "primary" : "", onClick: () => setControlPreset("arrows") }, controlPresets.arrows))));
}

// web/ts/components/GameOverlays.tsx
import React2 from "https://esm.sh/react@18.3.1";
function GameOverlays({
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
  goalText,
  runLoopText,
  archiveHook,
  showCutscene,
  cutsceneText,
  onCutsceneNext
}) {
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, showStart ? /* @__PURE__ */ React2.createElement("div", { className: "overlay startOverlay" }, /* @__PURE__ */ React2.createElement("div", { className: "overlayTitle" }, "HEART DIVER"), /* @__PURE__ */ React2.createElement("div", { className: "overlayGoal" }, goalText), /* @__PURE__ */ React2.createElement("div", { className: "overlayLoop" }, archiveHook), /* @__PURE__ */ React2.createElement("div", { className: "overlayLoop" }, runLoopText), /* @__PURE__ */ React2.createElement("div", { className: "overlayControls" }, /* @__PURE__ */ React2.createElement("div", null, "WASD / Arrow: Move"), /* @__PURE__ */ React2.createElement("div", null, "Space: Attack"), /* @__PURE__ */ React2.createElement("div", null, "E: Interact"), /* @__PURE__ */ React2.createElement("div", null, "Shift+Move: Dash"), /* @__PURE__ */ React2.createElement("div", null, "Click: Move one tile")), /* @__PURE__ */ React2.createElement("button", { className: "startBtn", onClick: onStartRun, disabled: !ready }, hasSave ? "Start Run (Continue)" : "Start Run")) : null, showCutscene ? /* @__PURE__ */ React2.createElement("div", { className: "overlay cutsceneOverlay" }, /* @__PURE__ */ React2.createElement("div", { className: "overlayTitle" }, "SYSTEM LOG"), /* @__PURE__ */ React2.createElement("div", { className: "cutsceneBody" }, cutsceneText), /* @__PURE__ */ React2.createElement("button", { className: "cutsceneNext", onClick: onCutsceneNext }, "Z: NEXT")) : null, paused ? /* @__PURE__ */ React2.createElement("div", { className: "overlay pauseOverlay" }, /* @__PURE__ */ React2.createElement("div", { className: "overlayTitle" }, "PAUSED"), /* @__PURE__ */ React2.createElement("div", { className: "mutedText" }, pauseReason || "Paused"), /* @__PURE__ */ React2.createElement("button", { className: "startBtn", onClick: () => setPaused(false) }, "Resume")) : null, upgradeEvent ? /* @__PURE__ */ React2.createElement("div", { className: "overlay upgradeOverlay" }, /* @__PURE__ */ React2.createElement("div", { className: "overlayTitle" }, upgradeEvent.title), /* @__PURE__ */ React2.createElement("div", { className: "overlayGoal" }, upgradeEvent.subtitle), /* @__PURE__ */ React2.createElement("div", { className: "upgradeChoices" }, upgradeEvent.choices.map((choice) => /* @__PURE__ */ React2.createElement("button", { key: choice.label, onClick: () => onUpgradeChoice(choice) }, choice.label, " - ", choice.desc)))) : null, deathSummary ? /* @__PURE__ */ React2.createElement("div", { className: "overlay deathOverlay" }, /* @__PURE__ */ React2.createElement("div", { className: "overlayTitle" }, "RUN RESULT"), /* @__PURE__ */ React2.createElement("div", { className: "overlayGoal" }, "Floor ", deathSummary.floor, " | Turn ", deathSummary.turn), /* @__PURE__ */ React2.createElement("div", { className: "overlayLoop" }, "Build: ", deathSummary.build), /* @__PURE__ */ React2.createElement("div", { className: "overlayGoal" }, "Death cause: ", deathSummary.reason), /* @__PURE__ */ React2.createElement("div", { className: "buttons" }, /* @__PURE__ */ React2.createElement("button", { className: "primary", onClick: onCopyResult }, "Copy run card"), /* @__PURE__ */ React2.createElement("button", { onClick: onNewRun }, "Restart"))) : null);
}

// web/ts/components/HudBar.tsx
import React3 from "https://esm.sh/react@18.3.1";
function HudBar({ hpText, hpRatio, bossText, turnText, floor, floorMeta, goalText }) {
  return /* @__PURE__ */ React3.createElement("div", { className: "hud" }, /* @__PURE__ */ React3.createElement("div", { className: "hudHp" }, /* @__PURE__ */ React3.createElement("div", { className: "hudLabel" }, hpText), /* @__PURE__ */ React3.createElement("div", { className: "hpBar" }, /* @__PURE__ */ React3.createElement("div", { className: "hpFill", style: { width: `${Math.round(hpRatio * 100)}%` } }))), /* @__PURE__ */ React3.createElement("div", { className: "hudStat" }, bossText), /* @__PURE__ */ React3.createElement("div", { className: "hudStat" }, turnText), /* @__PURE__ */ React3.createElement("div", { className: "hudStat" }, "Floor: ", floor, " ", floorMeta.subtitle), /* @__PURE__ */ React3.createElement("div", { className: "hudGoal" }, goalText));
}

// web/ts/components/SidePanels.tsx
import React4 from "https://esm.sh/react@18.3.1";
function SidePanels({ floorMeta, buildTags, storyBody, logText, archiveHook }) {
  return /* @__PURE__ */ React4.createElement("aside", { className: "side" }, /* @__PURE__ */ React4.createElement("div", { className: "box" }, /* @__PURE__ */ React4.createElement("div", { className: "boxTitle" }, "ONE-SLOT ARCHIVE"), /* @__PURE__ */ React4.createElement("div", { className: "worldText" }, archiveHook), /* @__PURE__ */ React4.createElement("div", { className: "worldText" }, "Keywords: ACCESS / CACHE / INDEX / AUDIT / ROLLBACK / OVERWRITE / CORE / SLOT")), /* @__PURE__ */ React4.createElement("div", { className: "box" }, /* @__PURE__ */ React4.createElement("div", { className: "boxTitle" }, floorMeta.name, " | ", floorMeta.subtitle), /* @__PURE__ */ React4.createElement("div", { className: "worldText" }, "Hazard: ", floorMeta.hazard), /* @__PURE__ */ React4.createElement("div", { className: "worldText" }, "Enemies: ", floorMeta.enemies), /* @__PURE__ */ React4.createElement("div", { className: "worldText" }, "Special item: ", floorMeta.items)), /* @__PURE__ */ React4.createElement("div", { className: "box" }, /* @__PURE__ */ React4.createElement("div", { className: "boxTitle" }, "Build"), /* @__PURE__ */ React4.createElement("div", { className: "worldText" }, buildTags.length ? buildTags.join(" + ") : "No upgrade selected yet.")), /* @__PURE__ */ React4.createElement("div", { className: "box" }, /* @__PURE__ */ React4.createElement("div", { className: "boxTitle" }, "Story"), /* @__PURE__ */ React4.createElement("div", { id: "story" }, storyBody)), /* @__PURE__ */ React4.createElement("div", { className: "box" }, /* @__PURE__ */ React4.createElement("div", { className: "boxTitle" }, "Log"), /* @__PURE__ */ React4.createElement("div", { id: "log" }, logText)));
}

// web/ts/app.tsx
var h = React5.createElement;
var SAVE_KEY = "wasm_rogue_save_v4";
var STORY_EFFECTS = {
  heal_2: 1,
  heal_3: 2,
  atk_1: 3,
  shield_1: 4,
  dash_buff: 5
};
var PAT = { CHARGE: 1, SLAM: 2, MARK: 3, WIPE_LINE: 4, CROSS: 5, SUMMON: 6 };
var TILE = 16;
var VIEW_W = 40;
var VIEW_H = 22;
var FLOOR_INFO = {
  1: {
    name: "\uC7AC(\u7070)\uAD11\uB85C \uC9C0\uB300",
    subtitle: "Ash Furnace",
    hazard: "3\uD134\uB9C8\uB2E4 \uC7AC \uBD84\uCD9C\uAD6C \uBC1C\uB3D9 / \uC7AC \uD0C0\uC77C \uC704 \uB300\uC2DC \uBD09\uC778",
    enemies: "\uC7AC\uB4F1\uB8E1, \uC1A1\uD48D\uCDA9",
    items: "\uC7AC\uB9C8\uC2A4\uD06C, \uC1A1\uD48D\uBD80\uCE20"
  },
  2: {
    name: "\uC6A9\uC554\uC131 \uADE0\uC5F4",
    subtitle: "Magma Rift",
    hazard: "2\uD134\uB9C8\uB2E4 \uB77C\uC778 \uC608\uACE0, \uB2E4\uC74C \uD134 \uC6A9\uC554 \uBD84\uCD9C",
    enemies: "\uC2AC\uB798\uADF8, \uD654\uC5FC \uAE30\uD3EC",
    items: "\uD751\uC694\uC11D \uB9DD\uD1A0, \uADE0\uC5F4\uBD80\uC801"
  },
  3: {
    name: "\uBE59\uACB0 \uC218\uB85C",
    subtitle: "Frost Aqueduct",
    hazard: "4\uD134\uB9C8\uB2E4 \uACB0\uBE59 \uD30C\uB3D9(2\uD134), \uC5BC\uC74C \uC704 \uC774\uB3D9\uC740 \uBBF8\uB044\uB7EC\uC9D0",
    enemies: "\uC218\uB85C \uBC40, \uBE59\uACB0 \uC218\uB9AC\uB85C\uBD07",
    items: "\uC2A4\uD30C\uC774\uD06C \uBD80\uCE20, \uC218\uBB38 \uD0A4"
  },
  4: {
    name: "\uC554\uD751 \uADE0\uC0AC\uB9BC",
    subtitle: "Umbral Mycelium",
    hazard: "3\uD134\uB9C8\uB2E4 \uD3EC\uC790 \uD3ED\uBC1C, \uD3EC\uC790 \uC548\uC5D0\uC11C\uB294 \uC2DC\uC57C \uAD50\uB780",
    enemies: "\uD3EC\uC790 \uC778\uD615, \uADE0\uC0AC \uC0AC\uB0E5\uAFBC",
    items: "\uC815\uD654\uB4F1, \uADE0\uC0AC\uC808\uB2E8\uCE7C"
  }
};
var CONTROL_PRESETS = {
  wasd: "WASD + Arrow",
  arrows: "Arrow + WASD"
};
var BASE_GOAL_TEXT = "\uBAA9\uD45C: \uCD5C\uD558\uCE35(Floor 4)\uAE4C\uC9C0 \uB0B4\uB824\uAC00 \uBCF4\uC2A4\uB97C \uCC98\uCE58\uD558\uB77C.";
var RUN_LOOP_TEXT = "\uD0D0\uC0C9 -> \uC804\uD22C -> \uBCF4\uC0C1 \uC120\uD0DD -> \uC704\uD5D8 \uC0C1\uC2B9";
var SAVE_TOAST_MS = 1400;
var SAFE_TURN_LIMIT = 12;
var ARCHIVE_HOOK = "\uC800\uC7A5 \uC2AC\uB86F\uC740 \uD558\uB098. \uB124\uAC00 \uC0B4\uC544\uB0A8\uC744\uC218\uB85D, \uB204\uAD70\uAC00\uAC00 \uC9C0\uC6CC\uC9C4\uB2E4.";
var LORE = {
  introPages: [
    "[BOOT] ONE-SLOT ARCHIVE v0.9 (DEGRADED)",
    "[INFO] \uAE30\uB85D \uC800\uC7A5\uC18C.\n[WARN] \uC800\uC7A5 \uC2AC\uB86F: 1",
    "[RULE] \uC800\uC7A5 = \uB36E\uC5B4\uC4F0\uAE30.\n[RULE] \uB36E\uC5B4\uC4F0\uAE30 = \uC0AD\uC81C.",
    "[PROC] RECOVERER spawned.\n[TASK] \uC0AD\uC81C\uB41C \uC870\uAC01 \uD68C\uC218.",
    "[NOTE] \uBCF5\uAD6C \uB300\uC0C1: \uBBF8\uC9C0\uC815.\n[NOTE] \uBCF5\uAD6C \uC8FC\uCCB4: \uBD88\uBA85.",
    "[ALERT] \uAD00\uB9AC\uC790 \uD504\uB85C\uC138\uC2A4 \uAC10\uC9C0.\n[ALERT] \uC811\uADFC \uCC28\uB2E8 \uC911.",
    "[HINT] \uC0B4\uC544\uB0A8\uC544\uB77C.\n[HINT] \uADF8\uB9AC\uACE0... \uBB34\uC5C7\uC744 \uC800\uC7A5\uD560\uC9C0 \uC120\uD0DD\uD574\uB77C."
  ],
  floorPages: {
    1: ["1F: CACHE HALL", "[TIP] \uC784\uC2DC \uAE30\uC5B5\uC740 \uBE60\uB974\uB2E4. \uB300\uC2E0 \uC27D\uAC8C \uC0AC\uB77C\uC9C4\uB2E4."],
    2: ["2F: INDEX LIBRARY", "[WARN] \uC0C9\uC778 \uC190\uC0C1. \uBAA9\uC801\uC9C0\uAC00 '\uAC00\uAE4C\uC6CC \uBCF4\uC774\uAC8C' \uC7AC\uBC30\uCE58\uB428."],
    3: ["3F: PERMISSION GATE", "[INFO] \uAD8C\uD55C \uC0C1\uC2B9 \uAC00\uB2A5. \uB2E8, \uAC10\uC2DC \uB808\uBCA8\uB3C4 \uD568\uAED8 \uC0C1\uC2B9."],
    4: ["4F: ROLLBACK GARDEN", "[WARN] \uB3D9\uC77C \uAD6C\uAC04 \uC7AC\uC9C4\uC785 \uC2DC \uC0C1\uD0DC\uAC00 \uACFC\uAC70\uB85C \uB418\uB3CC\uC544\uAC10."]
  },
  bossPages: {
    1: [
      "[KILL] CURATOR terminated.",
      "[DROP] ACCESS TOKEN (LOW)",
      "[VOICE] \uB108\uB294 '\uAD50\uCCB4'\uB2E4. \uC6D0\uBCF8\uC740 \uC774\uBBF8 \uC800\uC7A5\uB410\uB2E4.",
      "[UNLOCK] Door opened: INDEX PATH"
    ],
    2: [
      "[KILL] AUDITOR suspended.",
      "[REPORT] \uD310\uACB0: \uD6A8\uC728\uC801.",
      "[RULE] ONE SLOT. \uB458 \uC911 \uD558\uB098\uB9CC \uC800\uC7A5 \uAC00\uB2A5.",
      "[DROP] PARDON KEY / CONFESSION FILE"
    ],
    4: [
      "[KILL] SLOT ...?",
      "[SYSTEM] \uC800\uC7A5 \uB3D9\uC791\uC774 \uBA48\uCDC4\uB2E4.",
      "[PROMPT] SAVE TARGET: SELF / WORLD / DELETED",
      "[WARNING] \uC800\uC7A5\uD558\uBA74 \uB36E\uC5B4\uC4F4\uB2E4. \uB36E\uC5B4\uC4F0\uBA74 \uC78A\uB294\uB2E4."
    ]
  },
  loreLines: [
    "[LOG] \uC785\uB825 \uC9C0\uC5F0 0.03s. \uB204\uAD70\uAC00 \uB108\uB97C \uAD00\uCC30 \uC911.",
    "[WARN] \uB108\uC758 \uC8FD\uC74C\uC740 \uC2E4\uD328\uAC00 \uC544\uB2C8\uB77C \uC5C5\uB370\uC774\uD2B8\uB2E4.",
    "[INFO] \uC800\uC7A5\uC5D0\uB294 \uC791\uC131\uC790\uAC00 \uC788\uB2E4. \uC791\uC131\uC790\uB294 \uB4DC\uB7EC\uB098\uC9C0 \uC54A\uB294\uB2E4.",
    "[ERROR] \uC6D0\uBCF8 \uB808\uCF54\uB4DC: NOT FOUND",
    "[HINT] \uAD8C\uD55C\uC744 \uC5BB\uC744\uC218\uB85D, \uB108\uB294 \uC0AC\uB78C\uC774 \uC544\uB2C8\uB77C \uD504\uB85C\uC138\uC2A4\uAC00 \uB41C\uB2E4.",
    "[AUDIT] \uB124\uAC00 \uD6D4\uCE5C \uAC74 \uC544\uC774\uD15C\uC774 \uC544\uB2C8\uB77C \uAE30\uD68C\uB2E4.",
    "[NOTE] \uC774 \uBCF5\uB3C4\uB294 \uB108\uB97C \uC704\uD55C \uAE38\uC774 \uC544\uB2C8\uB2E4.",
    "[CACHE] \uC775\uC219\uD568\uC740 \uBE60\uB974\uB2E4. \uADF8\uB9AC\uACE0 \uC704\uD5D8\uD558\uB2E4.",
    "[WARN] \uBCF5\uAD6C\uB77C\uB294 \uB2E8\uC5B4\uB294 \uB9C8\uCF00\uD305\uC774\uB2E4.",
    "[LOG] Z\uB97C \uB204\uB97C \uB54C\uB9C8\uB2E4, \uB108\uB294 \uB354 \uC775\uC219\uD574\uC9C4\uB2E4.",
    "[INFO] \uB124\uAC00 \uAC15\uD574\uC9C8\uC218\uB85D, \uAC10\uC2DC\uB294 \uC815\uD655\uD574\uC9C4\uB2E4.",
    "[ERROR] \uAE30\uC5B5 \uC870\uAC01 \uBB34\uACB0\uC131 \uC190\uC0C1: 12%",
    "[NOTE] \uB108\uC758 \uC774\uB984\uC740 \uD30C\uC77C\uBA85\uC774 \uC544\uB2C8\uB2E4.",
    "[SYSTEM] \uB124 \uC120\uD0DD\uC740 \uC5EC\uAE30\uC11C \uC0AD\uC81C\uB85C \uBD84\uB958\uB41C\uB2E4.",
    "[WARN] \uC624\uBC84\uB77C\uC774\uD2B8\uB294 \uC5B8\uC81C\uB098 \uC870\uC6A9\uD558\uB2E4.",
    "[ALERT] \uBB38\uC774 \uC5F4\uB9B0 \uAC8C \uC544\uB2C8\uB2E4. \uD5C8\uB77D\uB41C \uAC83\uC774\uB2E4.",
    "[LOG] \uB204\uAD70\uAC00 \uB108\uB97C \uC774\uBBF8 \uC800\uC7A5\uD588\uB2E4.",
    "[INFO] \uC9C4\uC9DC \uC801\uC740 \uBAAC\uC2A4\uD130\uAC00 \uC544\uB2C8\uB77C \uADDC\uCE59\uC774\uB2E4.",
    "[AUDIT] \uC790\uBE44\uB294 \uBE44\uC6A9\uC774\uB2E4.",
    "[ERROR] \uAC10\uC815 \uBAA8\uB4C8 \uB85C\uB4DC \uC2E4\uD328. (...\uADFC\uB370 \uC65C \uC544\uD504\uC9C0?)"
  ]
};
function randSeed() {
  return Math.random() * 4294967295 >>> 0;
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
      s.fillRect(i, 6 + i % 3, 1, 1);
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
    s.fillRect(4, 2, 8, 13);
    s.fillStyle = "#f4d78a";
    s.fillRect(5, 3, 6, 3);
    s.fillStyle = "#2f3f63";
    s.fillRect(5, 6, 6, 7);
    s.fillStyle = "#64c4ff";
    s.fillRect(5, 8, 6, 3);
    s.fillStyle = "#eaf6ff";
    s.fillRect(6, 4, 1, 1);
    s.fillRect(9, 4, 1, 1);
    s.fillStyle = "#5be2b6";
    s.fillRect(7, 13, 2, 1);
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
    if (y < 3 || y > 18 || x > 12 && x < 24 && y > 10 && y < 16) {
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
function App() {
  const canvasRef = useRef(null);
  const runtimeRef = useRef({
    Module: null,
    api: null,
    BOSSES: null,
    STORY: null,
    sprites: buildSprites()
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
  const [goalText, setGoalText] = useState(BASE_GOAL_TEXT);
  const [hpText, setHpText] = useState("HP: --/--");
  const [hpRatio, setHpRatio] = useState(1);
  const [bossText, setBossText] = useState("Boss: --/--");
  const [turnText, setTurnText] = useState("Turn: --");
  const [storyEvent, setStoryEvent] = useState(null);
  const [upgradeEvent, setUpgradeEvent] = useState(null);
  const [buildTags, setBuildTags] = useState([]);
  const [deathSummary, setDeathSummary] = useState(null);
  const [cutscenePages, setCutscenePages] = useState(LORE.introPages);
  const [cutsceneIndex, setCutsceneIndex] = useState(0);
  const [showCutscene, setShowCutscene] = useState(true);
  const [logLines, setLogLines] = useState(["\uCD08\uAE30 \uB9F5 \uB80C\uB354\uB9C1 \uC644\uB8CC"]);
  const [fxState, setFxState] = useState({
    hitFlash: 0,
    damageFlash: 0,
    lootFlash: 0,
    spark: null
  });
  const envRef = useRef({
    lastTurn: -1,
    ash: /* @__PURE__ */ new Map(),
    lava: /* @__PURE__ */ new Map(),
    telegraph: /* @__PURE__ */ new Set(),
    pending: /* @__PURE__ */ new Set(),
    spores: /* @__PURE__ */ new Map(),
    freezeUntil: 0,
    ice: (() => {
      const s = /* @__PURE__ */ new Set();
      const rows = [2, 6, 10, 14, 18];
      const cols = [4, 10, 16, 22, 28, 34];
      for (const y of rows) for (let x = 1; x < VIEW_W - 1; x++) s.add(tileKey(x, y));
      for (const x of cols) for (let y = 1; y < VIEW_H - 1; y++) s.add(tileKey(x, y));
      return s;
    })()
  });
  const logText = useMemo(() => logLines.join("\n"), [logLines]);
  const floorMeta = useMemo(() => FLOOR_INFO[floor] || FLOOR_INFO[1], [floor]);
  const toastTimerRef = useRef(null);
  const audioRef = useRef({ ctx: null });
  const damageCauseRef = useRef("");
  const descendRef = useRef({ floor: -1, x: 0, y: 0 });
  const cutsceneQueueRef = useRef([]);
  const prevBossAliveRef = useRef(1);
  const prevFloorRef = useRef(1);
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
    gain.gain.setValueAtTime(1e-4, now);
    gain.gain.exponentialRampToValueAtTime(kind === "damage" ? 0.06 : 0.045, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(1e-4, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }, []);
  const emitFx = useCallback((patch) => {
    setFxState((prev) => ({ ...prev, ...patch }));
  }, []);
  const openCutscene = useCallback((pages) => {
    if (!pages || pages.length === 0) return;
    setCutscenePages(pages);
    setCutsceneIndex(0);
    setShowCutscene(true);
  }, []);
  const queueCutscene = useCallback((pages) => {
    if (!pages || pages.length === 0) return;
    if (showCutscene) cutsceneQueueRef.current.push(pages);
    else openCutscene(pages);
  }, [openCutscene, showCutscene]);
  const onCutsceneNext = useCallback(() => {
    if (!showCutscene) return;
    if (cutsceneIndex + 1 < cutscenePages.length) {
      setCutsceneIndex((v) => v + 1);
      return;
    }
    if (cutsceneQueueRef.current.length > 0) {
      const next = cutsceneQueueRef.current.shift();
      openCutscene(next);
      return;
    }
    setShowCutscene(false);
  }, [cutsceneIndex, cutscenePages.length, openCutscene, showCutscene]);
  const hasBit = useCallback((bit) => {
    const api = runtimeRef.current.api;
    if (!api) return false;
    const f = api.story_get_flags() >>> 0;
    return (f >>> bit & 1) === 1;
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
          spark: prev.spark
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
      logLine("ASH VENT \uBC1C\uB3D9: \uC7AC \uD0C0\uC77C \uC0DD\uC131");
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
        const row = rows[turn / 2 % rows.length];
        const col = cols[turn / 3 % cols.length];
        env.telegraph.clear();
        for (let x = 1; x < VIEW_W - 1; x++) env.telegraph.add(tileKey(x, row));
        for (let y = 1; y < VIEW_H - 1; y++) env.telegraph.add(tileKey(col, y));
        env.pending = new Set(env.telegraph);
      }
      if (env.lava.has(pKey)) api.game_apply_player_damage(1);
    }
    if (floor === 3 && turn > 0 && turn % 4 === 0) {
      env.freezeUntil = turn + 2;
      logLine("FREEZE PULSE: \uC218\uB85C \uACB0\uBE59");
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
    const h2 = api.game_h();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < h2; y++) {
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
    if (floor < 4) {
      const stair = getDescendTile(api);
      const bossDead = api.game_boss_alive() !== 1;
      const onStair = px === stair.x && py === stair.y;
      ctx.fillStyle = bossDead ? "rgba(78,212,147,0.55)" : "rgba(112,126,149,0.4)";
      ctx.fillRect(stair.x * TILE, stair.y * TILE, TILE, TILE);
      ctx.strokeStyle = bossDead ? "#95ffd2" : "#9aa9bf";
      ctx.strokeRect(stair.x * TILE + 1.5, stair.y * TILE + 1.5, TILE - 3, TILE - 3);
      ctx.fillStyle = bossDead ? "#dfffee" : "#d4d9e3";
      ctx.font = "bold 10px monospace";
      ctx.fillText(">", stair.x * TILE + 5, stair.y * TILE + 11);
      const nextGoal = bossDead ? onStair ? "\uCD9C\uAD6C \uD65C\uC131\uD654: E\uB97C \uB20C\uB7EC \uB2E4\uC74C \uCE35\uC73C\uB85C \uB0B4\uB824\uAC00\uC138\uC694." : "\uBCF4\uC2A4 \uCC98\uCE58 \uC644\uB8CC: \uCD08\uB85D \uACC4\uB2E8 \uD0C0\uC77C\uB85C \uC774\uB3D9\uD558\uC138\uC694." : "\uD604\uC7AC \uBAA9\uD45C: \uBCF4\uC2A4\uB97C \uCC98\uCE58\uD574 \uCD9C\uAD6C \uACC4\uB2E8\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694.";
      setGoalText((prev) => prev === nextGoal ? prev : nextGoal);
    } else {
      const nextGoal = "\uCD5C\uC885\uCE35\uC785\uB2C8\uB2E4. \uBCF4\uC2A4\uB97C \uCC98\uCE58\uD558\uACE0 \uB7F0\uC744 \uC644\uC218\uD558\uC138\uC694.";
      setGoalText((prev) => prev === nextGoal ? prev : nextGoal);
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
      if (inSpore) setBossText("Boss: ??? (\uD3EC\uC790 \uAC04\uC12D)");
      else {
        const bhp = api.game_boss_hp();
        const bmhp = api.game_boss_maxhp();
        setBossText(`Boss: ${bhp}/${bmhp}`);
      }
    } else {
      setBossText("Boss: defeated");
    }
    setTurnText(`Turn: ${api.game_turn()}`);
    const currentFloor = clamp(api.game_floor(), 1, 4);
    if (prevFloorRef.current !== currentFloor) {
      prevFloorRef.current = currentFloor;
      queueCutscene(LORE.floorPages[currentFloor] || []);
    }
    const bossAliveNow = api.game_boss_alive();
    if (prevBossAliveRef.current === 1 && bossAliveNow !== 1) {
      queueCutscene(LORE.bossPages[currentFloor] || []);
      showToast("ACCESS GRANTED");
    }
    prevBossAliveRef.current = bossAliveNow;
    if (api.game_turn() > 0 && api.game_turn() % 5 === 0 && Math.random() < 0.2) {
      const line = LORE.loreLines[Math.floor(Math.random() * LORE.loreLines.length)];
      logLine(line);
    }
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
  }, [applyEnvironment, floor, fxState, getDescendTile, hasBit, logLine, queueCutscene, showToast, storyEvent]);
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
    showToast("\uC800\uC7A5\uB428");
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
    if (ok) showToast("\uC800\uC7A5 \uBD88\uB7EC\uC624\uAE30 \uC644\uB8CC");
    setHasSave(!!ok || !!localStorage.getItem(SAVE_KEY));
    return !!ok;
  }, [logLine, showToast]);
  const configureBossForFloor = useCallback((floor2) => {
    const rt = runtimeRef.current;
    const { BOSSES, api } = rt;
    if (!BOSSES || !api) return;
    const boss = BOSSES.bosses.find((x) => x.floor === floor2);
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
    logLine(`Boss loaded: ${boss.name} (floor ${floor2})`);
  }, [logLine]);
  const getDescendTile = useCallback((api) => {
    const cached = descendRef.current;
    if (cached.floor === floor) return cached;
    const w = api.game_w();
    const h2 = api.game_h();
    let found = { floor, x: w - 2, y: h2 - 2 };
    for (let y = h2 - 2; y >= 1; y--) {
      for (let x = w - 2; x >= 1; x--) {
        if (api.game_tile(x, y) !== "#".charCodeAt(0)) {
          found = { floor, x, y };
          y = -1;
          break;
        }
      }
    }
    descendRef.current = found;
    return found;
  }, [floor]);
  const makeUpgradeChoices = useCallback(() => {
    const pool = [
      { label: "\uACF5\uACA9 \uC99D\uD3ED", effect: STORY_EFFECTS.atk_1, tag: "ATK", desc: "+1 ATK (\uC0C1\uC2DC)" },
      { label: "\uAC15\uCCA0 \uBC29\uD328", effect: STORY_EFFECTS.shield_1, tag: "SHIELD", desc: "\uD53C\uACA9 \uC644\uD654" },
      { label: "\uB300\uC2DC \uBD80\uC2A4\uD130", effect: STORY_EFFECTS.dash_buff, tag: "DASH", desc: "\uB300\uC2DC \uD6A8\uC728 \uC99D\uAC00" },
      { label: "\uC751\uAE09 \uCE58\uB8CC", effect: STORY_EFFECTS.heal_2, tag: "HEAL", desc: "HP +2" },
      { label: "\uC751\uAE09 \uC218\uD608+", effect: STORY_EFFECTS.heal_3, tag: "HEAL", desc: "HP +3" }
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
    if (!api) return "\uD53C\uD574 \uC6D0\uC778 \uBBF8\uD655\uC778";
    const px = api.game_player_x();
    const py = api.game_player_y();
    const env = envRef.current;
    const here = tileKey(px, py);
    if (floor === 2 && (env.lava.has(here) || env.pending.has(here) || env.telegraph.has(here))) return "\uC6A9\uC554 \uBD84\uCD9C \uB77C\uC778";
    if (floor === 4 && env.spores.has(here)) return "\uD3EC\uC790 \uD3ED\uBC1C \uC7A5\uD310";
    if (floor === 1 && env.ash.has(here)) return "\uC7AC \uBD84\uCD9C\uAD6C \uD654\uC0C1";
    if (api.game_enemy_alive() === 1) {
      const d = Math.abs(api.game_enemy_x() - px) + Math.abs(api.game_enemy_y() - py);
      if (d <= 1) return "\uADFC\uC811 \uC801 \uACF5\uACA9";
    }
    if (api.game_boss_alive() === 1) {
      const d = Math.abs(api.game_boss_x() - px) + Math.abs(api.game_boss_y() - py);
      if (d <= 2) return "\uBCF4\uC2A4 \uD328\uD134 \uACF5\uACA9";
    }
    if (snapshot.turn <= SAFE_TURN_LIMIT) return "\uCD08\uBC18 \uAD50\uC804 \uD53C\uD574";
    return "\uC9C0\uD615 \uB610\uB294 \uC801 \uD328\uD134 \uD53C\uD574";
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
      py: api.game_player_y()
    };
    api.game_step(code);
    const after = {
      turn: api.game_turn(),
      hp: api.game_player_hp(),
      bossHp: api.game_boss_alive() === 1 ? api.game_boss_hp() : 0,
      enemyAlive: api.game_enemy_alive() === 1,
      px: api.game_player_x(),
      py: api.game_player_y()
    };
    const tookDamage = after.hp < before.hp;
    const dealtBossDamage = after.bossHp < before.bossHp;
    const killedEnemy = before.enemyAlive && !after.enemyAlive;
    if (dealtBossDamage || killedEnemy) {
      emitFx({
        hitFlash: 4,
        spark: { x: after.px, y: after.py, life: 4 }
      });
      playSfx("hit");
    }
    if (tookDamage) {
      const cause = inferDamageCause(before);
      damageCauseRef.current = cause;
      emitFx({ damageFlash: 5 });
      playSfx("damage");
      logLine(`\uD53C\uACA9: ${cause}`);
    }
    if (after.hp <= 0) {
      setDeathSummary({
        floor,
        turn: after.turn,
        reason: damageCauseRef.current || "\uC6D0\uC778 \uBBF8\uC0C1",
        build: buildTags.length ? buildTags.join(" + ") : "\uAE30\uBCF8 \uBE4C\uB4DC"
      });
    }
    if (after.turn > 0 && after.turn % 6 === 0 && !upgradeEvent && !storyEvent && after.hp > 0) {
      setUpgradeEvent({
        title: "\uBCF4\uC0C1 \uC120\uD0DD",
        subtitle: "\uC9C0\uAE08 \uBE4C\uB4DC\uB97C \uAC15\uD654\uD560 \uD2B9\uC131\uC744 \uD558\uB098 \uC120\uD0DD\uD558\uC138\uC694.",
        choices: makeUpgradeChoices()
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
  const inputToCode = useCallback((key, code, shift) => {
    const dash = shift ? 4 : 0;
    const isUp = key === "ArrowUp" || key === "w" || key === "W" || code === "KeyW";
    const isDown = key === "ArrowDown" || key === "s" || key === "S" || code === "KeyS";
    const isLeft = key === "ArrowLeft" || key === "a" || key === "A" || code === "KeyA";
    const isRight = key === "ArrowRight" || key === "d" || key === "D" || code === "KeyD";
    if (isUp) return 1 + dash;
    if (isDown) return 2 + dash;
    if (isLeft) return 3 + dash;
    if (isRight) return 4 + dash;
    return 0;
  }, []);
  const tryInteract = useCallback(() => {
    const api = runtimeRef.current.api;
    if (!api || floor >= 4) return false;
    if (api.game_boss_alive() === 1) {
      showToast("\uBCF4\uC2A4\uB97C \uCC98\uCE58\uD574\uC57C \uACC4\uB2E8\uC774 \uC5F4\uB9BD\uB2C8\uB2E4.");
      return false;
    }
    const stair = getDescendTile(api);
    const onStair = api.game_player_x() === stair.x && api.game_player_y() === stair.y;
    if (!onStair) {
      showToast("\uCD08\uB85D \uACC4\uB2E8 \uD0C0\uC77C \uC704\uC5D0\uC11C E\uB97C \uB204\uB974\uC138\uC694.");
      return false;
    }
    onNextFloor();
    return true;
  }, [floor, getDescendTile, showToast]);
  const normalizeCodeWithEnvironment = useCallback((code) => {
    const api = runtimeRef.current.api;
    if (!api || !code) return code;
    const px = api.game_player_x();
    const py = api.game_player_y();
    const here = tileKey(px, py);
    const env = envRef.current;
    if (floor === 1 && code >= 5 && env.ash.has(here)) {
      logLine("\uC7AC \uD0C0\uC77C: \uB300\uC2DC \uBD09\uC778");
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
    prevFloorRef.current = 1;
    prevBossAliveRef.current = 1;
    setShowStart(false);
    cutsceneQueueRef.current = [];
    queueCutscene(LORE.floorPages[1]);
    logLine("\uCD08\uBC18 \uC548\uC804 \uAD6C\uAC04: \uAE30\uBCF8 \uBCF4\uD638\uB9C9 \uC801\uC6A9");
    draw();
    saveToLocal();
  }, [configureBossForFloor, draw, logLine, queueCutscene, resetEnvironment, saveToLocal]);
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
    cutsceneQueueRef.current = [];
    queueCutscene(LORE.floorPages[clamp(api.game_floor(), 1, 4)]);
    draw();
  }, [configureBossForFloor, draw, loadFromLocal, logLine, queueCutscene, resetEnvironment]);
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
    prevFloorRef.current = next;
    prevBossAliveRef.current = 1;
    logLine(`\uC2EC\uC7A5\uC2E4 \uC774\uB3D9: Floor ${next}`);
    queueCutscene(LORE.floorPages[next] || []);
    draw();
    saveToLocal();
  }, [configureBossForFloor, draw, floor, logLine, queueCutscene, resetEnvironment, saveToLocal]);
  const onClear = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    logLine("Save cleared.");
    setHasSave(false);
    showToast("\uC800\uC7A5 \uC0AD\uC81C\uB428");
  }, [logLine, showToast]);
  const onStoryChoice = useCallback((choice) => {
    const api = runtimeRef.current.api;
    if (!api) return;
    const effectId = typeof choice.effect === "number" ? choice.effect : STORY_EFFECTS[choice.effect] ?? 0;
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
    logLine(`\uD68D\uB4DD: ${choice.label} (${choice.desc})`);
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
      `Death: ${deathSummary.reason}`
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("\uACB0\uACFC \uCE74\uB4DC \uBCF5\uC0AC\uB428");
    } catch {
      showToast("\uD074\uB9BD\uBCF4\uB4DC \uBCF5\uC0AC \uC2E4\uD328");
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
          boss_apply_stats_from_config: Module.cwrap("boss_apply_stats_from_config", null, [])
        };
        const [bosses, story] = await Promise.all([
          fetch("./bosses.json").then((r) => r.json()),
          fetch("./story.json").then((r) => r.json())
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
      if (showCutscene && (e.key === "z" || e.key === "Z" || e.code === "KeyZ")) {
        e.preventDefault();
        onCutsceneNext();
        return;
      }
      if (!runtimeRef.current.api || !ready || upgradeEvent || deathSummary || paused || showStart || showCutscene) return;
      if (e.key === " " || e.key === "f" || e.key === "F") {
        e.preventDefault();
        tryAutoAttack();
        return;
      }
      if (e.key === "e" || e.key === "E" || e.code === "KeyE") {
        e.preventDefault();
        tryInteract();
        return;
      }
      const code = normalizeCodeWithEnvironment(inputToCode(e.key, e.code, e.shiftKey));
      if (!code) return;
      e.preventDefault();
      stepWithCode(code);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deathSummary, inputToCode, normalizeCodeWithEnvironment, onCutsceneNext, paused, ready, showCutscene, showStart, stepWithCode, tryAutoAttack, tryInteract, upgradeEvent]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return void 0;
    function onPointerDown(e) {
      if (!runtimeRef.current.api || !ready || upgradeEvent || deathSummary || paused || showStart || showCutscene) return;
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      const tx = clamp(Math.floor((e.clientX - rect.left) * sx / TILE), 0, VIEW_W - 1);
      const ty = clamp(Math.floor((e.clientY - rect.top) * sy / TILE), 0, VIEW_H - 1);
      stepToward(tx, ty, e.shiftKey);
    }
    canvas.addEventListener("pointerdown", onPointerDown);
    return () => canvas.removeEventListener("pointerdown", onPointerDown);
  }, [deathSummary, paused, ready, showCutscene, showStart, stepToward, upgradeEvent]);
  useEffect(() => {
    function pauseByFocus() {
      if (!ready || showStart || deathSummary) return;
      setPaused(true);
      setPauseReason("\uD3EC\uCEE4\uC2A4 \uC544\uC6C3: \uC77C\uC2DC\uC815\uC9C0\uB428");
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
  const storyBody = storyEvent ? [
    h("div", { key: "story-text" }, storyEvent.text),
    h(
      "div",
      { key: "story-choice", className: "choiceRow" },
      storyEvent.choices.map(
        (choice, idx) => h(
          "button",
          {
            key: `${choice.label}-${idx}`,
            className: idx === 0 ? "primary" : "",
            onClick: () => onStoryChoice(choice)
          },
          choice.label
        )
      )
    )
  ] : h(
    "div",
    { className: "mutedText" },
    ready ? "\uC774\uBCA4\uD2B8 \uC870\uAC74\uC744 \uB9CC\uC871\uD558\uBA74 \uC2A4\uD1A0\uB9AC\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4." : "WASM \uB85C\uB529 \uC911..."
  );
  const cutsceneText = cutscenePages[cutsceneIndex] || "";
  return h(
    React5.Fragment,
    null,
    h(HeaderBar, {
      controlPreset,
      setControlPreset,
      controlPresets: CONTROL_PRESETS
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
            goalText: BASE_GOAL_TEXT,
            runLoopText: RUN_LOOP_TEXT,
            archiveHook: ARCHIVE_HOOK,
            showCutscene,
            cutsceneText,
            onCutsceneNext
          })
        ),
        h(HudBar, {
          hpText,
          hpRatio,
          bossText,
          turnText,
          floor,
          floorMeta,
          goalText
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
      h(SidePanels, { floorMeta, buildTags, storyBody, logText, archiveHook: ARCHIVE_HOOK })
    ),
    toast ? h("div", { className: "toast" }, toast) : null
  );
}

// web/ts/ui.tsx
var rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");
var root = createRoot(rootEl);
root.render(React6.createElement(App));
