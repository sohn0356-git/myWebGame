import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const h = React.createElement;

function App() {
  return h(
    React.Fragment,
    null,
    h(
      "header",
      { className: "top" },
      h("div", { className: "brand" }, "WASM Rogue"),
      h(
        "div",
        { className: "hint" },
        "Move: WASD/Arrows/Click | Attack: Space/F (adjacent auto-hit) | Dash: Shift+Move"
      )
    ),
    h(
      "main",
      { className: "layout" },
      h(
        "section",
        { className: "panel" },
        h("canvas", { id: "game", width: 640, height: 352 }),
        h(
          "div",
          { className: "hud" },
          h("div", { id: "hp" }),
          h("div", { id: "boss" }),
          h("div", { id: "turn" })
        ),
        h(
          "div",
          { className: "buttons" },
          h("button", { id: "btnNew" }, "New Run"),
          h("button", { id: "btnContinue" }, "Continue"),
          h("button", { id: "btnClear" }, "Clear Save")
        )
      ),
      h(
        "aside",
        { className: "side" },
        h(
          "div",
          { className: "box" },
          h("div", { className: "boxTitle" }, "Story"),
          h("div", { id: "story" })
        ),
        h(
          "div",
          { className: "box" },
          h("div", { className: "boxTitle" }, "Log"),
          h("div", { id: "log" })
        )
      )
    )
  );
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

async function boot() {
  const rootEl = document.getElementById("root");
  const root = createRoot(rootEl);
  root.render(h(App));

  await loadWasmRuntime();
  await import("./app.js");
}

boot().catch((err) => {
  console.error(err);
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML =
      '<div style="padding:16px;color:#fff;background:#111">Game load failed: missing WASM runtime (rogue.js/game.js).</div>';
  }
});
