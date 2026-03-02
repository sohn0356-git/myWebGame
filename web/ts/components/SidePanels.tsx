// @ts-nocheck
import React from "https://esm.sh/react@18.3.1";

export default function SidePanels({ floorMeta, buildTags, storyBody, logText }) {
  return (
    <aside className="side">
      <div className="box">
        <div className="boxTitle">
          {floorMeta.name} | {floorMeta.subtitle}
        </div>
        <div className="worldText">환경 규칙: {floorMeta.hazard}</div>
        <div className="worldText">출현 개체: {floorMeta.enemies}</div>
        <div className="worldText">특수 아이템: {floorMeta.items}</div>
      </div>
      <div className="box">
        <div className="boxTitle">Build</div>
        <div className="worldText">
          {buildTags.length ? buildTags.join(" + ") : "아직 선택한 업그레이드가 없습니다."}
        </div>
      </div>
      <div className="box">
        <div className="boxTitle">Story</div>
        <div id="story">{storyBody}</div>
      </div>
      <div className="box">
        <div className="boxTitle">Log</div>
        <div id="log">{logText}</div>
      </div>
    </aside>
  );
}
