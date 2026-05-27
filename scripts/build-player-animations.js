const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "web", "assets", "player");
const GRID = 16;
const CELL = 64;
const PIVOT_X = 8;
const PIVOT_Y = 13;

const MOTIONS = [
  {
    id: "idle",
    fps: 4,
    loop: true,
    frames: [
      { bob: 0, cape: 0, backLeg: 0, frontLeg: 0, arm: 0, sword: 0 },
      { bob: 1, cape: 1, backLeg: 0, frontLeg: 0, arm: 0, sword: 0 },
      { bob: 0, cape: -1, backLeg: 0, frontLeg: 0, arm: 0, sword: 0 },
      { bob: -1, cape: 0, backLeg: 0, frontLeg: 0, arm: 0, sword: 0 },
    ],
  },
  {
    id: "walk",
    fps: 8,
    loop: true,
    frames: [
      { bob: 0, cape: 0, backLeg: 0, frontLeg: 0, arm: 0, sword: 0 },
      { bob: 0, cape: 1, backLeg: 1, frontLeg: -1, arm: 1, sword: 1 },
      { bob: -1, cape: 0, backLeg: 1, frontLeg: -1, arm: 0, sword: 1 },
      { bob: 0, cape: -1, backLeg: 0, frontLeg: 0, arm: -1, sword: 0 },
      { bob: 1, cape: 0, backLeg: -1, frontLeg: 1, arm: 0, sword: -1 },
      { bob: 0, cape: 1, backLeg: -1, frontLeg: 1, arm: 1, sword: 0 },
    ],
  },
  {
    id: "run",
    fps: 12,
    loop: true,
    frames: [
      { bob: -1, lean: -1, cape: 0, backLeg: 2, frontLeg: -2, arm: 1, sword: 2 },
      { bob: 0, lean: 0, cape: 1, backLeg: 1, frontLeg: -1, arm: 2, sword: 2 },
      { bob: 0, lean: 1, cape: 0, backLeg: 0, frontLeg: -2, arm: 1, sword: 1 },
      { bob: -1, lean: 1, cape: -1, backLeg: -1, frontLeg: 0, arm: 0, sword: 0 },
      { bob: 0, lean: 0, cape: 0, backLeg: -2, frontLeg: 1, arm: -1, sword: 0 },
      { bob: 1, lean: -1, cape: 1, backLeg: -1, frontLeg: 2, arm: 0, sword: -1 },
      { bob: 0, lean: 0, cape: 0, backLeg: 1, frontLeg: -1, arm: 1, sword: 1 },
    ],
  },
  {
    id: "jump",
    fps: 6,
    loop: false,
    frames: [
      { bob: 2, crouch: 2, cape: 0, backLeg: 1, frontLeg: 1, arm: -1, sword: 0 },
      { bob: 0, crouch: 1, cape: 1, backLeg: 0, frontLeg: 0, arm: 0, sword: 1 },
      { bob: -2, crouch: 0, cape: 0, backLeg: -1, frontLeg: -1, arm: 1, sword: 1 },
      { bob: -1, crouch: 0, cape: -1, backLeg: -1, frontLeg: -2, arm: 0, sword: 0 },
      { bob: 1, crouch: 1, cape: 0, backLeg: 0, frontLeg: 1, arm: -1, sword: 0 },
    ],
  },
  {
    id: "attack",
    fps: 10,
    loop: false,
    frames: [
      { bob: 0, windup: 0, cape: 0, backLeg: 0, frontLeg: 0, arm: 0, sword: 0 },
      { bob: 0, windup: 1, cape: 0, backLeg: 0, frontLeg: -1, arm: 1, sword: 2 },
      { bob: -1, windup: 2, cape: -1, backLeg: 1, frontLeg: -1, arm: 2, sword: 3 },
      { bob: 0, windup: 3, cape: 0, backLeg: 0, frontLeg: 0, arm: 2, sword: 4, slash: true },
      { bob: 0, windup: 2, cape: 1, backLeg: -1, frontLeg: 1, arm: 1, sword: 2 },
      { bob: 0, windup: 1, cape: 0, backLeg: 0, frontLeg: 0, arm: 0, sword: 1 },
    ],
  },
];

const RACES = {
  human: {
    label: "human",
    palettes: {
      hair: "#7a4e2f",
      hairDark: "#4b2f23",
      skin: "#f1c38e",
      shirt: "#dfd3a6",
      shirtDark: "#9d9169",
      cape: "#3b4e64",
      pants: "#4f3d2f",
      boots: "#2f2219",
      belt: "#c69b4b",
      sword: "#cfd9e6",
      swordDark: "#74818f",
      slash: "#e6eef8",
      outline: "#1b1620",
    },
    extras: {},
  },
  elf: {
    label: "elf",
    palettes: {
      hair: "#5f8d63",
      hairDark: "#355538",
      skin: "#d8f0c9",
      shirt: "#82d9c6",
      shirtDark: "#4f9a92",
      cape: "#2d5e5f",
      pants: "#324e47",
      boots: "#1c2f2b",
      belt: "#d7db8f",
      sword: "#e7fff8",
      swordDark: "#8cbfba",
      slash: "#f2fffb",
      outline: "#15201d",
    },
    extras: { ears: true },
  },
  dwarf: {
    label: "dwarf",
    palettes: {
      hair: "#8d6137",
      hairDark: "#5c3c25",
      skin: "#e7b37b",
      shirt: "#d8b56a",
      shirtDark: "#9a7a42",
      cape: "#5a4a2a",
      pants: "#54402f",
      boots: "#372518",
      belt: "#c89d51",
      sword: "#dfe6ef",
      swordDark: "#7c8794",
      slash: "#eef5ff",
      outline: "#1b1614",
    },
    extras: { beard: true, short: true },
  },
  orc: {
    label: "orc",
    palettes: {
      hair: "#355338",
      hairDark: "#203623",
      skin: "#98c97d",
      shirt: "#4f7758",
      shirtDark: "#34533b",
      cape: "#243d2c",
      pants: "#2e412d",
      boots: "#1c251b",
      belt: "#d9a24d",
      sword: "#eef4f0",
      swordDark: "#8f9a94",
      slash: "#f2fff4",
      outline: "#111a13",
    },
    extras: { tusks: true, bulky: true },
  },
  seraph: {
    label: "seraph",
    palettes: {
      hair: "#c9c1ff",
      hairDark: "#7f75c4",
      skin: "#f3e1ff",
      shirt: "#ece0ff",
      shirtDark: "#b7a7eb",
      cape: "#7f8cd6",
      pants: "#5e577c",
      boots: "#3c3554",
      belt: "#f4d26b",
      sword: "#fff9d9",
      swordDark: "#b9ad63",
      slash: "#ffffff",
      outline: "#19172a",
    },
    extras: { halo: true, robe: true },
  },
  shade: {
    label: "shade",
    palettes: {
      hair: "#3b295f",
      hairDark: "#25183d",
      skin: "#c9a2ff",
      shirt: "#7c5ad0",
      shirtDark: "#513a89",
      cape: "#16142a",
      pants: "#241c3d",
      boots: "#16121d",
      belt: "#8fe4d3",
      sword: "#d4c8ff",
      swordDark: "#8b7bd7",
      slash: "#f2ecff",
      outline: "#0e0c16",
    },
    extras: { hood: true, dagger: true },
  },
};

function addRects(list, x, y, w, h, color) {
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      list.push({ x: x + xx, y: y + yy, color });
    }
  }
}

function drawFrame(frame, palette, mirrored = false, extras = {}) {
  const pxs = [];
  const f = frame;
  const bob = f.bob || 0;
  const crouch = f.crouch || 0;
  const lean = f.lean || 0;
  const capeShift = f.cape || 0;
  const backLeg = f.backLeg || 0;
  const frontLeg = f.frontLeg || 0;
  const arm = f.arm || 0;
  const sword = f.sword || 0;

  const draw = (x, y, w, h, color) => {
    const xx = mirrored ? GRID - x - w : x;
    addRects(pxs, xx, y, w, h, color);
  };

  const bodyY = 5 + bob + crouch;
  const legY = 9 + bob + crouch;
  const headY = 1 + bob - Math.max(0, crouch);
  const capeX = mirrored ? 10 - capeShift : 3 + capeShift;
  const torsoX = mirrored ? 6 - lean : 5 + lean;
  const faceX = mirrored ? 6 : 7;
  const hairX = mirrored ? 4 : 4;
  const short = extras.short ? 1 : 0;
  const bulky = extras.bulky ? 1 : 0;
  const robe = extras.robe ? 1 : 0;
  const hood = extras.hood ? 1 : 0;
  const dagger = extras.dagger ? 1 : 0;

  // outline
  draw(4 - short, headY, 8 + short * 2 + bulky, 1, palette.outline);
  draw(4 - short, headY + 1, 1, 4 + hood, palette.outline);
  draw(11 + short + bulky, headY + 1, 1, 4 + hood, palette.outline);
  draw(5 - short, bodyY, 6 + bulky * 2, 1, palette.outline);
  draw(4 - short, bodyY + 1, 1, 4 + robe, palette.outline);
  draw(11 + short + bulky, bodyY + 1, 1, 4 + robe, palette.outline);
  draw(5 - short, legY, 6 + bulky * 2, 1, palette.outline);

  // cape / back cloth
  draw(capeX, 4 + bob, 2 + robe, 7, palette.cape);
  draw(capeX - 1, 5 + bob, 1, 5, palette.cape);

  // head / hair / special tops
  draw(hairX, headY, 7 + bulky, 3, palette.hair);
  draw(hairX + 1, headY + 3, 5 + bulky, 1, palette.hairDark);
  draw(faceX, headY + 1, 3, 2, palette.skin);
  draw(faceX + 1, headY + 2, 2, 1, palette.skin);
  draw(faceX + 1, headY + 1, 1, 1, "#1a1412");

  if (extras.ears) {
    draw(mirrored ? 5 : 10, headY + 1, 1, 2, palette.skin);
    draw(mirrored ? 4 : 11, headY + 2, 1, 1, palette.skin);
  }
  if (extras.beard) {
    draw(faceX - 1, headY + 2, 5 + short, 3, palette.hair);
    draw(faceX, headY + 3, 3, 2, palette.hairDark);
  }
  if (extras.tusks) {
    draw(faceX, headY + 3, 1, 1, "#f0e8c1");
    draw(faceX + 2, headY + 3, 1, 1, "#f0e8c1");
  }
  if (extras.halo) {
    draw(6, headY - 1, 4, 1, palette.belt);
    draw(5, headY, 1, 1, palette.belt);
    draw(10, headY, 1, 1, palette.belt);
  }
  if (hood) {
    draw(5, headY, 6, 3, palette.cape);
    draw(6, headY + 1, 4, 2, palette.hair);
  }

  // torso
  draw(torsoX, bodyY + 1, 5 + bulky, 4 + robe, palette.shirt);
  draw(torsoX, bodyY + 4, 5 + bulky, 1, palette.shirtDark);
  draw(torsoX + 1, bodyY + 2, 3 + bulky, 1, palette.shirtDark);
  draw(torsoX + 1, bodyY + 4, 3 + bulky, 1, palette.belt);
  draw(torsoX + 2, bodyY + 4, 1, 1, "#8b5f22");

  // arms
  draw(mirrored ? 9 - arm : 2 + arm, bodyY + 1, 2, 2, palette.skin);
  draw(mirrored ? 8 - arm : 3 + arm, bodyY + 2, 2, 2, palette.shirtDark);
  draw(mirrored ? 9 + arm : 10 - arm, bodyY + 2, 2, 2, palette.skin);
  draw(mirrored ? 8 + arm : 9 - arm, bodyY + 3, 2, 2, palette.shirtDark);

  // sword / dagger arm and blade
  const swordBaseX = mirrored ? 2 + sword : 11 - sword;
  draw(swordBaseX, bodyY + 1, 1, 2, palette.belt);
  draw(swordBaseX + (mirrored ? -1 : 1), bodyY, 1, 4, palette.swordDark);
  draw(swordBaseX + (mirrored ? -2 : 2), bodyY - 1, 1, 6, palette.sword);
  if (dagger) {
    draw(swordBaseX + (mirrored ? -1 : 1), bodyY + 2, 1, 1, palette.outline);
  }

  if (f.slash) {
    const slashX = mirrored ? 1 : 12;
    const slashY = bodyY + 1;
    draw(slashX, slashY, 2, 1, palette.slash);
    draw(slashX + (mirrored ? -1 : 1), slashY - 1, 1, 3, palette.slash);
    draw(slashX + (mirrored ? -2 : 2), slashY - 2, 1, 5, palette.slash);
  }

  // legs
  draw(mirrored ? 5 - backLeg : 5 + backLeg, legY + 1, 2 + short, 4 + short, palette.pants);
  draw(mirrored ? 5 - backLeg : 5 + backLeg, legY + 5 + short, 2 + short, 1, palette.boots);
  draw(mirrored ? 8 - frontLeg : 8 + frontLeg, legY + 1, 2 + short, 4 + short, palette.pants);
  draw(mirrored ? 8 - frontLeg : 8 + frontLeg, legY + 5 + short, 2 + short, 1, palette.boots);

  // accent pixels
  draw(mirrored ? 5 - backLeg : 5 + backLeg, legY + 4, 1, 1, "#6f5540");
  draw(mirrored ? 8 - frontLeg : 8 + frontLeg, legY + 4, 1, 1, "#6f5540");
  draw(capeX + 1, 5 + bob, 1, 3, "#546b84");

  return pxs;
}

function pxsToSvg(pixels) {
  return pixels
    .map((p) => `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" shape-rendering="crispEdges" />`)
    .join("\n");
}

function writeMotionSvg(raceId, motion, mirrored, extras) {
  const width = motion.frames.length * CELL;
  const height = CELL;
  const parts = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges">`,
  );
  parts.push(`<style>rect{shape-rendering:crispEdges}</style>`);
  motion.frames.forEach((frame, index) => {
    const framePixels = drawFrame(frame, RACES[raceId].palettes, mirrored, extras);
    const frameX = index * CELL;
    parts.push(`<g transform="translate(${frameX},0) scale(${CELL / GRID})">`);
    parts.push(`<rect x="0" y="0" width="${GRID}" height="${GRID}" fill="transparent" />`);
    parts.push(pxsToSvg(framePixels));
    parts.push(`</g>`);
  });
  parts.push(`</svg>`);
  return parts.join("\n");
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = {
    cellWidth: CELL,
    cellHeight: CELL,
    pivotX: PIVOT_X,
    pivotY: PIVOT_Y,
    defaultRaceId: "human",
    races: Object.keys(RACES).map((raceId) => ({
      id: raceId,
      motions: MOTIONS.map((motion) => ({
        id: motion.id,
        fps: motion.fps,
        loop: motion.loop,
        frames: motion.frames.length,
      })),
    })),
  };

  for (const raceId of Object.keys(RACES)) {
    const raceDir = path.join(OUT_DIR, raceId);
    fs.mkdirSync(raceDir, { recursive: true });
    for (const motion of MOTIONS) {
      const right = writeMotionSvg(raceId, motion, false, RACES[raceId].extras);
      const left = writeMotionSvg(raceId, motion, true, RACES[raceId].extras);
      fs.writeFileSync(path.join(raceDir, `${motion.id}-right.svg`), right);
      fs.writeFileSync(path.join(raceDir, `${motion.id}-left.svg`), left);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Wrote player motion sheets to ${OUT_DIR}`);
}

main();
