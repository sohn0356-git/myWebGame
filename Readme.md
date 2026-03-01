# WASM Roguelike (C + WebAssembly + React + TypeScript)

## Overview

- Core gameplay logic is implemented in C and compiled to WebAssembly.
- UI is rendered with React (CDN ESM) and authored in TypeScript (`web/ts`).
- Rendering and game loop are still canvas + WASM for performance.

## Controls

- Move: WASD / Arrow keys / Click
- Dash: Shift + Move
- Attack: Space or F (auto-hit adjacent target)

## Deploy

Push to `main` and GitHub Actions builds WASM and publishes `/web` to `gh-pages`.

## Frontend Build

- Install: `npm install`
- Build TS -> browser JS: `npm run build:web`
- Typecheck: `npm run typecheck:web`

## World Theme

The run progresses through four Heart-biomes:
1. Ash Furnace
2. Magma Rift
3. Frost Aqueduct
4. Umbral Mycelium

## Runtime Script

The UI loader tries to load WASM runtime in this order:
1. `web/rogue.js` (CI build output)
2. `web/game.js` (legacy/local file name)
