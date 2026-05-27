const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "web", "assets", "player");
const CELL = 64;
const MOTIONS = [
  { id: "idle", fps: 4, loop: true, frames: 4 },
  { id: "walk", fps: 8, loop: true, frames: 6 },
  { id: "run", fps: 12, loop: true, frames: 7 },
  { id: "jump", fps: 6, loop: false, frames: 5 },
  { id: "attack", fps: 10, loop: false, frames: 6 },
];

const RACES = {
  human: {
    shirt: "#d7d0a9",
    shirt2: "#a89b74",
    skin: "#efc796",
    hair: "#7d5332",
    hair2: "#563621",
    pants: "#564538",
    boots: "#2f241d",
    cape: "#42566f",
    accent: "#caa14e",
    metal: "#d7dee7",
    metal2: "#7d8793",
    outline: "#1f1a25",
    face: "human",
    weapon: "sword",
  },
  elf: {
    shirt: "#7dd8c0",
    shirt2: "#4e9d8f",
    skin: "#d8f0c9",
    hair: "#5f8f64",
    hair2: "#345338",
    pants: "#324b47",
    boots: "#1d2d2a",
    cape: "#295f60",
    accent: "#d9e08f",
    metal: "#e7fff8",
    metal2: "#8cc0bb",
    outline: "#17211f",
    face: "elf",
    weapon: "sword",
  },
  dwarf: {
    shirt: "#d2a95e",
    shirt2: "#9e7b41",
    skin: "#e4b07b",
    hair: "#8d6137",
    hair2: "#5c3c25",
    pants: "#544131",
    boots: "#382619",
    cape: "#5a4b2c",
    accent: "#c99d50",
    metal: "#cfd6df",
    metal2: "#7a8794",
    outline: "#1b1614",
    face: "dwarf",
    weapon: "hammer",
  },
  orc: {
    shirt: "#4f7458",
    shirt2: "#34533b",
    skin: "#9bcf83",
    hair: "#314f35",
    hair2: "#203323",
    pants: "#2f4330",
    boots: "#1b241a",
    cape: "#253d2e",
    accent: "#d9a24d",
    metal: "#edf3f0",
    metal2: "#8b9892",
    outline: "#121a13",
    face: "orc",
    weapon: "axe",
  },
  seraph: {
    shirt: "#eee0ff",
    shirt2: "#b9a8eb",
    skin: "#f1dfff",
    hair: "#c9c1ff",
    hair2: "#8379c7",
    pants: "#5f5880",
    boots: "#3c3555",
    cape: "#8a96e0",
    accent: "#f1d46b",
    metal: "#fff9dc",
    metal2: "#b9ad63",
    outline: "#1a172a",
    face: "seraph",
    weapon: "staff",
  },
  shade: {
    shirt: "#7d5ad0",
    shirt2: "#52398f",
    skin: "#c9a2ff",
    hair: "#3a285c",
    hair2: "#24163b",
    pants: "#241d3d",
    boots: "#17131f",
    cape: "#16142a",
    accent: "#8fe4d3",
    metal: "#d6caff",
    metal2: "#8b7bd7",
    outline: "#0e0d16",
    face: "shade",
    weapon: "dagger",
  },
};

function esc(v) {
  return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function svgEl(tag, attrs = {}, body = "") {
  const attr = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}="${esc(v)}"`)
    .join(" ");
  return body ? `<${tag} ${attr}>${body}</${tag}>` : `<${tag} ${attr} />`;
}

function defsForRace(race) {
  const id = race;
  return `
    <defs>
      <linearGradient id="${id}-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${RACES[race].shirt}" />
        <stop offset="100%" stop-color="${RACES[race].shirt2}" />
      </linearGradient>
      <linearGradient id="${id}-skin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${RACES[race].skin}" />
        <stop offset="100%" stop-color="${shade(RACES[race].skin, -18)}" />
      </linearGradient>
      <linearGradient id="${id}-hair" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${RACES[race].hair}" />
        <stop offset="100%" stop-color="${RACES[race].hair2}" />
      </linearGradient>
      <linearGradient id="${id}-pants" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${RACES[race].pants}" />
        <stop offset="100%" stop-color="${shade(RACES[race].pants, -16)}" />
      </linearGradient>
      <linearGradient id="${id}-metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${RACES[race].metal}" />
        <stop offset="100%" stop-color="${RACES[race].metal2}" />
      </linearGradient>
      <filter id="${id}-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.2" />
      </filter>
    </defs>
  `;
}

function shade(color, amount) {
  const n = color.replace("#", "");
  const r = clampHex(parseInt(n.slice(0, 2), 16) + amount);
  const g = clampHex(parseInt(n.slice(2, 4), 16) + amount);
  const b = clampHex(parseInt(n.slice(4, 6), 16) + amount);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clampHex(v) {
  return Math.max(0, Math.min(255, v));
}

function toHex(v) {
  return v.toString(16).padStart(2, "0");
}

function motionOffset(frame) {
  return {
    bob: frame.bob || 0,
    lean: frame.lean || 0,
    crouch: frame.crouch || 0,
    windup: frame.windup || 0,
    cape: frame.cape || 0,
    backLeg: frame.backLeg || 0,
    frontLeg: frame.frontLeg || 0,
    arm: frame.arm || 0,
    weapon: frame.weapon || 0,
  };
}

function bodyColor(race) {
  return `url(#${race}-shirt)`;
}

function skinColor(race) {
  return `url(#${race}-skin)`;
}

function hairColor(race) {
  return `url(#${race}-hair)`;
}

function pantsColor(race) {
  return `url(#${race}-pants)`;
}

function metalColor(race) {
  return `url(#${race}-metal)`;
}

function shadowEllipse(x, y, rx, ry) {
  return svgEl("ellipse", {
    cx: x,
    cy: y,
    rx,
    ry,
    fill: "rgba(0,0,0,0.18)",
  });
}

function makeBody(race, frame, mirrored) {
  const palette = RACES[race];
  const o = motionOffset(frame);
  const dir = mirrored ? -1 : 1;
  const y = 0 + o.bob;
  const lean = o.lean * dir;
  const crouch = o.crouch;
  const chestY = 25 + y + crouch;
  const headY = 12 + y - Math.max(0, crouch);
  const legY = 36 + y + crouch;
  const shoulderX = 32 + lean * 2;
  const faceX = 32 + dir * 1;
  const capeX = 24 - o.cape * dir * 1.2;
  const frontLegX = 29 + o.frontLeg * dir * 1.6;
  const backLegX = 36 + o.backLeg * dir * 1.6;
  const armFrontX = 41 - o.arm * dir * 1.2;
  const armBackX = 23 + o.arm * dir * 0.8;

  const group = [];
  group.push(svgEl("ellipse", { cx: 32, cy: 52 + y, rx: 12, ry: 3, fill: "rgba(0,0,0,0.2)", opacity: 0.45 }));

  if (race === "seraph") {
    group.push(svgEl("ellipse", { cx: 32, cy: headY - 2, rx: 7, ry: 2, fill: palette.accent, opacity: 0.9 }));
  }

  // Cape
  group.push(
    svgEl("path", {
      d: `M ${capX(capeX, dir)} 26 C ${capX(capeX - 8, dir)} 31, ${capX(capeX - 8, dir)} 42, ${capX(capeX, dir)} 50 C ${capX(capeX + 5, dir)} 43, ${capX(capeX + 4, dir)} 33, ${capX(capeX, dir)} 26 Z`,
      fill: palette.cape,
      opacity: 0.95,
    }),
  );

  // Legs
  group.push(legShape(frontLegX, legY, palette, race, true, dir));
  group.push(legShape(backLegX, legY, palette, race, false, dir));

  // Torso
  const torsoW = race === "dwarf" ? 18 : race === "orc" ? 18 : 16;
  const torsoH = race === "seraph" ? 18 : 17;
  group.push(
    svgEl("path", {
      d: roundedRect(shoulderX - torsoW / 2, chestY, torsoW, torsoH, 6),
      fill: bodyColor(race),
      stroke: palette.outline,
      "stroke-width": 1.2,
      "stroke-linejoin": "round",
    }),
  );
  group.push(
    svgEl("path", {
      d: roundedRect(shoulderX - torsoW / 2 + 2, chestY + 4, torsoW - 4, 5, 4),
      fill: palette.accent,
      opacity: 0.75,
    }),
  );

  if (race === "dwarf") {
    group.push(svgEl("path", { d: roundedRect(shoulderX - 10, chestY - 4, 20, 6, 5), fill: palette.hair2, stroke: palette.outline, "stroke-width": 1 }));
    group.push(svgEl("path", { d: roundedRect(shoulderX - 8, chestY - 7, 16, 7, 5), fill: palette.hair, stroke: palette.outline, "stroke-width": 1 }));
  }

  // Head
  const headRx = race === "dwarf" ? 8 : race === "orc" ? 8.5 : 7.3;
  const headRy = race === "dwarf" ? 8.5 : 7.7;
  group.push(
    svgEl("ellipse", {
      cx: faceX,
      cy: headY,
      rx: headRx,
      ry: headRy,
      fill: skinColor(race),
      stroke: palette.outline,
      "stroke-width": 1.2,
    }),
  );

  // Hair / helm / hood
  if (race === "dwarf") {
    group.push(
      svgEl("path", {
        d: `M ${faceX - 10} ${headY - 4} Q ${faceX} ${headY - 12}, ${faceX + 10} ${headY - 4} L ${faceX + 8} ${headY + 2} Q ${faceX} ${headY - 1}, ${faceX - 8} ${headY + 2} Z`,
        fill: palette.hair,
        stroke: palette.outline,
        "stroke-width": 1,
      }),
    );
    group.push(svgEl("ellipse", { cx: faceX, cy: headY - 7, rx: 11, ry: 5, fill: palette.metal, stroke: palette.outline, "stroke-width": 1 }));
    group.push(svgEl("rect", { x: faceX - 7, y: headY - 6, width: 14, height: 2, rx: 1, fill: palette.accent, opacity: 0.7 }));
  } else if (race === "shade") {
    group.push(svgEl("path", { d: hoodPath(faceX, headY, dir), fill: palette.cape, stroke: palette.outline, "stroke-width": 1 }));
  } else {
    group.push(
      svgEl("path", {
        d: hairPath(faceX, headY, race, dir),
        fill: hairColor(race),
        stroke: palette.outline,
        "stroke-width": 1,
      }),
    );
  }

  // Face details
  if (race === "elf") {
    group.push(earShape(faceX + dir * 7.4, headY - 1.2, dir));
    group.push(earShape(faceX - dir * 7.4, headY - 1.2, -dir));
  }
  if (race === "orc") {
    group.push(tuskShape(faceX - 2.6, headY + 4.2));
    group.push(tuskShape(faceX + 2.6, headY + 4.2));
  }
  if (race === "seraph") {
    group.push(svgEl("path", { d: haloPath(faceX, headY - 10), fill: "none", stroke: palette.accent, "stroke-width": 2.2, "stroke-linecap": "round" }));
  }
  group.push(eyeDot(faceX - 2.6, headY - 0.8));
  group.push(eyeDot(faceX + 2.8, headY - 0.8));
  group.push(svgEl("path", { d: smilePath(faceX, headY + 2.6, race), fill: "none", stroke: palette.outline, "stroke-width": 1, "stroke-linecap": "round" }));

  if (race === "dwarf") {
    group.push(beardShape(faceX, headY + 5.5, palette, dir));
  } else {
    group.push(
      svgEl("path", {
        d: `M ${faceX - 5} ${headY + 4} Q ${faceX} ${headY + 7} ${faceX + 5} ${headY + 4} L ${faceX + 4} ${headY + 7} Q ${faceX} ${headY + 9} ${faceX - 4} ${headY + 7} Z`,
        fill: palette.accent,
        opacity: 0.08,
      }),
    );
  }

  // Arms
  group.push(armShape(armBackX, chestY + 1, false, palette, race, dir));
  group.push(armShape(armFrontX, chestY + 1, true, palette, race, dir));

  // Weapon
  group.push(weaponShape(race, palette, chestY, armFrontX, dir, o.weapon, frame));

  // Shadow under weapon arc if attack
  if (frame.slash) {
    group.push(svgEl("path", { d: slashPath(race, dir), fill: "none", stroke: palette.metal, "stroke-width": 2.5, "stroke-linecap": "round", opacity: 0.9 }));
  }

  return group.join("\n");
}

function roundedRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}

function capX(x, dir) {
  return dir < 0 ? 64 - x : x;
}

function earShape(x, y, dir) {
  return svgEl("path", {
    d: `M ${x} ${y} Q ${x + dir * 3} ${y - 3} ${x + dir * 5} ${y + 1} Q ${x + dir * 2} ${y + 3} ${x} ${y} Z`,
    fill: "#d9cfaf",
    stroke: "rgba(0,0,0,0.18)",
    "stroke-width": 0.8,
  });
}

function tuskShape(x, y) {
  return svgEl("path", {
    d: `M ${x} ${y} Q ${x - 1} ${y + 4} ${x + 1} ${y + 6}`,
    fill: "none",
    stroke: "#f2e7c2",
    "stroke-width": 1.2,
    "stroke-linecap": "round",
  });
}

function eyeDot(x, y) {
  return svgEl("circle", { cx: x, cy: y, r: 0.9, fill: "#17131f" });
}

function smilePath(x, y, race) {
  if (race === "orc") return `M ${x - 2} ${y} Q ${x} ${y + 1} ${x + 2} ${y}`;
  if (race === "shade") return `M ${x - 1.5} ${y} Q ${x} ${y + 0.6} ${x + 1.5} ${y}`;
  return `M ${x - 2} ${y} Q ${x} ${y + 1.5} ${x + 2} ${y}`;
}

function haloPath(x, y) {
  return `M ${x - 6} ${y} Q ${x} ${y - 4} ${x + 6} ${y}`;
}

function beardShape(x, y, palette, dir) {
  const sign = dir < 0 ? -1 : 1;
  const base = `
    M ${x - 9 * sign} ${y}
    Q ${x - 11 * sign} ${y + 10} ${x} ${y + 13}
    Q ${x + 11 * sign} ${y + 10} ${x + 9 * sign} ${y}
    Q ${x + 5 * sign} ${y + 5} ${x} ${y + 3}
    Q ${x - 5 * sign} ${y + 5} ${x - 9 * sign} ${y}
    Z`;
  return svgEl("path", {
    d: base,
    fill: `url(#dwarf-hair)`,
    stroke: palette.outline,
    "stroke-width": 1,
  });
}

function hairPath(x, y, race, dir) {
  if (race === "elf") {
    return `M ${x - 8} ${y - 4} Q ${x} ${y - 11} ${x + 8} ${y - 4} Q ${x + 7} ${y + 4} ${x} ${y + 5} Q ${x - 7} ${y + 4} ${x - 8} ${y - 4} Z`;
  }
  if (race === "seraph") {
    return `M ${x - 7} ${y - 4} Q ${x} ${y - 9} ${x + 7} ${y - 4} Q ${x + 6} ${y + 3} ${x} ${y + 4} Q ${x - 6} ${y + 3} ${x - 7} ${y - 4} Z`;
  }
  return `M ${x - 7} ${y - 3} Q ${x} ${y - 10} ${x + 7} ${y - 3} Q ${x + 6} ${y + 3} ${x} ${y + 4} Q ${x - 6} ${y + 3} ${x - 7} ${y - 3} Z`;
}

function hoodPath(x, y, dir) {
  return `M ${x - 9} ${y - 4} Q ${x} ${y - 12} ${x + 9} ${y - 4} Q ${x + 10} ${y + 6} ${x + 6} ${y + 10} Q ${x} ${y + 7} ${x - 6} ${y + 10} Q ${x - 10} ${y + 6} ${x - 9} ${y - 4} Z`;
}

function legShape(x, y, palette, race, front, dir) {
  const lift = front ? -1.5 : 0;
  const width = race === "dwarf" ? 7.5 : race === "orc" ? 6.8 : 6.2;
  const height = race === "dwarf" ? 12 : 11;
  const ankle = race === "dwarf" ? 6 : 5;
  return [
    svgEl("path", {
      d: roundedRect(x - width / 2, y + lift, width, height, 3),
      fill: `url(#${race}-pants)`,
      stroke: palette.outline,
      "stroke-width": 1,
    }),
    svgEl("path", {
      d: roundedRect(x - width / 2 + 1, y + lift + 2, width - 2, 3, 2),
      fill: palette.accent,
      opacity: 0.12,
    }),
    svgEl("path", {
      d: roundedRect(x - ankle / 2, y + height - 1, ankle, 4, 2),
      fill: palette.boots,
      stroke: palette.outline,
      "stroke-width": 1,
    }),
  ].join("\n");
}

function armShape(x, y, front, palette, race, dir) {
  const raised = front ? -2 : 0;
  const angle = front ? (race === "orc" ? -16 : -12) : 10;
  const width = race === "dwarf" ? 6.5 : 5.5;
  const height = race === "orc" ? 12 : 10;
  return svgEl("g", {
    transform: `translate(${x} ${y}) rotate(${angle * dir})`,
  }, [
    svgEl("path", {
      d: roundedRect(-width / 2, raised, width, height, 3),
      fill: skinColor(race),
      stroke: palette.outline,
      "stroke-width": 1,
    }),
    svgEl("path", {
      d: roundedRect(-width / 2 + 1, raised + 2, width - 2, 4, 2),
      fill: palette.shirt,
      opacity: 0.8,
    }),
  ].join("\n"));
}

function weaponShape(race, palette, chestY, armFrontX, dir, lift, frame) {
  const baseX = armFrontX + dir * 7;
  const baseY = chestY + 2 + (frame.bob || 0) * 0.2;
  if (race === "dwarf") {
    return svgEl("g", { transform: `translate(${baseX} ${baseY}) rotate(${dir > 0 ? -8 : 8})` }, [
      svgEl("rect", { x: -1, y: -4, width: 2, height: 12, rx: 1, fill: palette.metal2, stroke: palette.outline, "stroke-width": 0.8 }),
      svgEl("rect", { x: -7, y: -6, width: 12, height: 5, rx: 2, fill: `url(#dwarf-metal)`, stroke: palette.outline, "stroke-width": 0.8 }),
      svgEl("rect", { x: -1, y: -7, width: 2, height: 16, rx: 1, fill: palette.metal2, opacity: 0.25 }),
    ].join("\n"));
  }
  if (race === "orc") {
    return svgEl("g", { transform: `translate(${baseX} ${baseY}) rotate(${dir > 0 ? 20 : -20})` }, [
      svgEl("path", { d: `M -1 -5 L 1 -5 L 0 12 Z`, fill: palette.metal2, stroke: palette.outline, "stroke-width": 0.8 }),
      svgEl("path", { d: `M -8 -3 Q -5 -9 1 -8 Q 2 -1 -2 2 Z`, fill: `url(#orc-metal)`, stroke: palette.outline, "stroke-width": 0.8 }),
    ].join("\n"));
  }
  if (race === "seraph") {
    return svgEl("g", { transform: `translate(${baseX} ${baseY}) rotate(${dir > 0 ? -6 : 6})` }, [
      svgEl("rect", { x: -1, y: -7, width: 2, height: 18, rx: 1, fill: palette.metal2, stroke: palette.outline, "stroke-width": 0.8 }),
      svgEl("circle", { cx: 0, cy: -8, r: 4.3, fill: palette.accent, stroke: palette.outline, "stroke-width": 0.8 }),
      svgEl("circle", { cx: 0, cy: -8, r: 1.8, fill: palette.metal }),
    ].join("\n"));
  }
  if (race === "shade") {
    return svgEl("g", { transform: `translate(${baseX} ${baseY}) rotate(${dir > 0 ? -18 : 18})` }, [
      svgEl("rect", { x: -1, y: -3, width: 2, height: 10, rx: 1, fill: palette.metal2, stroke: palette.outline, "stroke-width": 0.8 }),
      svgEl("rect", { x: -5, y: -1, width: 7, height: 2, rx: 1, fill: palette.accent, stroke: palette.outline, "stroke-width": 0.8 }),
    ].join("\n"));
  }
  return svgEl("g", { transform: `translate(${baseX} ${baseY}) rotate(${dir > 0 ? -10 : 10})` }, [
    svgEl("rect", { x: -1, y: -6, width: 2, height: 15, rx: 1, fill: palette.metal2, stroke: palette.outline, "stroke-width": 0.8 }),
    svgEl("rect", { x: -1.5, y: -7, width: 3, height: 2, rx: 1, fill: palette.accent, stroke: palette.outline, "stroke-width": 0.8 }),
    svgEl("path", { d: `M -1 -4 L 1 -4 L 0 10 Z`, fill: palette.metal, opacity: 0.75 }),
  ].join("\n"));
}

function slashPath(race, dir) {
  const d = dir > 0 ? "M 42 26 Q 53 16 48 8" : "M 22 26 Q 11 16 16 8";
  return race === "shade" ? d : dir > 0 ? "M 40 30 Q 52 22 51 10" : "M 24 30 Q 12 22 13 10";
}

function frameData(frame) {
  return {
    bob: frame.bob || 0,
    lean: frame.lean || 0,
    crouch: frame.crouch || 0,
    windup: frame.windup || 0,
    cape: frame.cape || 0,
    backLeg: frame.backLeg || 0,
    frontLeg: frame.frontLeg || 0,
    arm: frame.arm || 0,
    weapon: frame.weapon || 0,
    slash: !!frame.slash,
  };
}

function motionFrames() {
  return {
    idle: [
      { bob: 0, cape: 0 },
      { bob: 1, cape: 1 },
      { bob: 0, cape: -1 },
      { bob: -1, cape: 0 },
    ],
    walk: [
      { bob: 0, backLeg: 0, frontLeg: 0, arm: 0 },
      { bob: 0, backLeg: 1, frontLeg: -1, arm: 1 },
      { bob: -1, backLeg: 1, frontLeg: -1, arm: 0 },
      { bob: 0, backLeg: 0, frontLeg: 0, arm: -1 },
      { bob: 1, backLeg: -1, frontLeg: 1, arm: 0 },
      { bob: 0, backLeg: -1, frontLeg: 1, arm: 1 },
    ],
    run: [
      { bob: -1, lean: -1, backLeg: 2, frontLeg: -2, arm: 1 },
      { bob: 0, lean: 0, backLeg: 1, frontLeg: -1, arm: 2 },
      { bob: 0, lean: 1, backLeg: 0, frontLeg: -2, arm: 1 },
      { bob: -1, lean: 1, backLeg: -1, frontLeg: 0, arm: 0 },
      { bob: 0, lean: 0, backLeg: -2, frontLeg: 1, arm: -1 },
      { bob: 1, lean: -1, backLeg: -1, frontLeg: 2, arm: 0 },
      { bob: 0, lean: 0, backLeg: 1, frontLeg: -1, arm: 1 },
    ],
    jump: [
      { bob: 2, crouch: 2, backLeg: 1, frontLeg: 1, arm: -1 },
      { bob: 0, crouch: 1, backLeg: 0, frontLeg: 0, arm: 0 },
      { bob: -2, crouch: 0, backLeg: -1, frontLeg: -1, arm: 1 },
      { bob: -1, crouch: 0, backLeg: -1, frontLeg: -2, arm: 0 },
      { bob: 1, crouch: 1, backLeg: 0, frontLeg: 1, arm: -1 },
    ],
    attack: [
      { bob: 0, windup: 0, backLeg: 0, frontLeg: 0, arm: 0 },
      { bob: 0, windup: 1, backLeg: 0, frontLeg: -1, arm: 1 },
      { bob: -1, windup: 2, backLeg: 1, frontLeg: -1, arm: 2 },
      { bob: 0, windup: 3, backLeg: 0, frontLeg: 0, arm: 2, slash: true },
      { bob: 0, windup: 2, backLeg: -1, frontLeg: 1, arm: 1 },
      { bob: 0, windup: 1, backLeg: 0, frontLeg: 0, arm: 0 },
    ],
  };
}

function renderFrame(race, motionId, frame, mirrored) {
  const f = frameData(frame);
  const d = mirrored ? `translate(64,0) scale(-1,1)` : "";
  const body = makeBody(race, f, mirrored);
  return `
    <g${d ? ` transform="${d}"` : ""}>
      ${shadowEllipse(32, 55, race === "dwarf" ? 14 : 12, 4)}
      ${body}
    </g>
  `;
}

function renderSheet(race, motionId, mirrored) {
  const frames = motionFrames()[motionId];
  const width = CELL * frames.length;
  const defs = defsForRace(race);
  const content = frames
    .map((frame, index) => `<g transform="translate(${index * CELL},0)">${renderFrame(race, motionId, frame, mirrored)}</g>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${CELL}" width="${width}" height="${CELL}" shape-rendering="geometricPrecision">
  ${defs}
  <rect width="100%" height="100%" fill="transparent" />
  ${content}
</svg>
`;
}

function writeAll() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {
    cellWidth: CELL,
    cellHeight: CELL,
    pivotX: 32,
    pivotY: 42,
    defaultRaceId: "human",
    assetVersion: "clean-v1",
    races: Object.keys(RACES).map((id) => ({
      id,
      motions: MOTIONS.map((m) => ({ id: m.id, fps: m.fps, loop: m.loop, frames: m.frames })),
    })),
  };

  for (const race of Object.keys(RACES)) {
    const raceDir = path.join(OUT_DIR, race);
    fs.mkdirSync(raceDir, { recursive: true });
    for (const motion of MOTIONS) {
      fs.writeFileSync(path.join(raceDir, `${motion.id}-right.svg`), renderSheet(race, motion.id, false));
      fs.writeFileSync(path.join(raceDir, `${motion.id}-left.svg`), renderSheet(race, motion.id, true));
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Wrote clean character sheets to ${OUT_DIR}`);
}

writeAll();
