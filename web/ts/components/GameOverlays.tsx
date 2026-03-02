// @ts-nocheck
import React from "react";

export default function GameOverlays({
  showStart,
  ready,
  hasSave,
  onStartRun,
  paused,
  pauseReason,
  setPaused,
  upgradeEvent,
  onUpgradeChoice,
  deathSummary,
  onCopyResult,
  onNewRun,
  goalText,
  runLoopText,
  archiveHook,
  showCutscene,
  cutsceneText,
  onCutsceneNext,
}) {
  return (
    <>
      {showStart ? (
        <div className="overlay startOverlay">
          <div className="overlayTitle">HEART DIVER</div>
          <div className="overlayGoal">{goalText}</div>
          <div className="overlayLoop">{archiveHook}</div>
          <div className="overlayLoop">{runLoopText}</div>
          <div className="overlayControls">
            <div>WASD / Arrow: Move</div>
            <div>Space: Attack</div>
            <div>E: Interact</div>
            <div>Shift+Move: Dash</div>
            <div>Click: Move one tile</div>
          </div>
          <button className="startBtn" onClick={onStartRun} disabled={!ready}>
            {hasSave ? "Start Run (Continue)" : "Start Run"}
          </button>
        </div>
      ) : null}

      {showCutscene ? (
        <div className="overlay cutsceneOverlay">
          <div className="overlayTitle">SYSTEM LOG</div>
          <div className="cutsceneBody">{cutsceneText}</div>
          <button className="cutsceneNext" onClick={onCutsceneNext}>
            Z: NEXT
          </button>
        </div>
      ) : null}

      {paused ? (
        <div className="overlay pauseOverlay">
          <div className="overlayTitle">PAUSED</div>
          <div className="mutedText">{pauseReason || "Paused"}</div>
          <button className="startBtn" onClick={() => setPaused(false)}>
            Resume
          </button>
        </div>
      ) : null}

      {upgradeEvent ? (
        <div className="overlay upgradeOverlay">
          <div className="overlayTitle">{upgradeEvent.title}</div>
          <div className="overlayGoal">{upgradeEvent.subtitle}</div>
          <div className="upgradeChoices">
            {upgradeEvent.choices.map((choice) => (
              <button key={choice.label} onClick={() => onUpgradeChoice(choice)}>
                {choice.label} - {choice.desc}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {deathSummary ? (
        <div className="overlay deathOverlay">
          <div className="overlayTitle">RUN RESULT</div>
          <div className="overlayGoal">
            Floor {deathSummary.floor} | Turn {deathSummary.turn}
          </div>
          <div className="overlayLoop">Build: {deathSummary.build}</div>
          <div className="overlayGoal">Death cause: {deathSummary.reason}</div>
          <div className="buttons">
            <button className="primary" onClick={onCopyResult}>
              Copy run card
            </button>
            <button onClick={onNewRun}>Restart</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
