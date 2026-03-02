// @ts-nocheck
import React from "react";

export default function HudBar({ hpText, hpRatio, bossText, turnText, floor, floorMeta, goalText }) {
  return (
    <div className="hud">
      <div className="hudHp">
        <div className="hudLabel">{hpText}</div>
        <div className="hpBar">
          <div className="hpFill" style={{ width: `${Math.round(hpRatio * 100)}%` }} />
        </div>
      </div>
      <div className="hudStat">{bossText}</div>
      <div className="hudStat">{turnText}</div>
      <div className="hudStat">
        Floor: {floor} {floorMeta.subtitle}
      </div>
      <div className="hudGoal">{goalText}</div>
    </div>
  );
}
