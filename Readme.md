# WASM Roguelike (C + WebAssembly + React UI)

## Overview

- Core gameplay logic is implemented in C and compiled to WebAssembly.
- UI is rendered with React (CDN ESM).
- Rendering and game loop are still canvas + WASM for performance.

## Controls

- Move: WASD / Arrow keys / Click
- Dash: Shift + Move
- Attack: Space or F (auto-hit adjacent target)

## Deploy

Push to `main` and GitHub Actions builds WASM and publishes `/web` to `gh-pages`.

## Runtime Script

The UI loader tries to load WASM runtime in this order:
1. `web/rogue.js` (CI build output)
2. `web/game.js` (legacy/local file name)
