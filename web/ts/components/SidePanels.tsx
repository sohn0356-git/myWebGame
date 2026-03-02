// @ts-nocheck
import React from "react";

export default function SidePanels({ floorMeta, buildTags, storyBody, logText, archiveHook }) {
  return (
    <aside className="side">
      <div className="box">
        <div className="boxTitle">ONE-SLOT ARCHIVE</div>
        <div className="worldText">{archiveHook}</div>
        <div className="worldText">Keywords: ACCESS / CACHE / INDEX / AUDIT / ROLLBACK / OVERWRITE / CORE / SLOT</div>
      </div>
      <div className="box">
        <div className="boxTitle">
          {floorMeta.name} | {floorMeta.subtitle}
        </div>
        <div className="worldText">Hazard: {floorMeta.hazard}</div>
        <div className="worldText">Enemies: {floorMeta.enemies}</div>
        <div className="worldText">Special item: {floorMeta.items}</div>
      </div>
      <div className="box">
        <div className="boxTitle">Build</div>
        <div className="worldText">{buildTags.length ? buildTags.join(" + ") : "No upgrade selected yet."}</div>
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
