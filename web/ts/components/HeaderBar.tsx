// @ts-nocheck
import React from "https://esm.sh/react@18.3.1";

export default function HeaderBar({ controlPreset, setControlPreset, controlPresets }) {
  return (
    <header className="top">
      <div className="brand">HEART DIVER</div>
      <div className="topRight">
        <div className="hint">WASD/Arrow Move | Space Attack | E Interact | Shift+Move Dash</div>
        <div className="presetRow">
          <span className="mutedText">Key Preset</span>
          <button className={controlPreset === "wasd" ? "primary" : ""} onClick={() => setControlPreset("wasd")}>
            {controlPresets.wasd}
          </button>
          <button className={controlPreset === "arrows" ? "primary" : ""} onClick={() => setControlPreset("arrows")}>
            {controlPresets.arrows}
          </button>
        </div>
      </div>
    </header>
  );
}
