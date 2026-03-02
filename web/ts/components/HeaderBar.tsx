// @ts-nocheck
import React from "https://esm.sh/react@18.3.1";

export default function HeaderBar({ controlPreset, setControlPreset, controlPresets }) {
  return (
    <header className="top">
      <div className="brand">HEART DIVER</div>
      <div className="topRight">
        <div className="hint">WASD/Arrow 이동 | Space 공격 | E 상호작용 | Shift+이동 대시</div>
        <div className="presetRow">
          <span className="mutedText">키 프리셋</span>
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
