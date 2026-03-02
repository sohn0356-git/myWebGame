// @ts-nocheck
import React from "https://esm.sh/react@18.3.1";

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
}) {
  return (
    <>
      {showStart ? (
        <div className="overlay startOverlay">
          <div className="overlayTitle">HEART DIVER</div>
          <div className="overlayGoal">{goalText}</div>
          <div className="overlayLoop">{runLoopText}</div>
          <div className="overlayControls">
            <div>WASD / Arrow: 이동</div>
            <div>Space: 공격</div>
            <div>E: 상호작용</div>
            <div>Shift+이동: 대시</div>
            <div>Click: 한 칸 이동</div>
          </div>
          <button className="startBtn" onClick={onStartRun} disabled={!ready}>
            {hasSave ? "Start Run (Continue)" : "Start Run"}
          </button>
        </div>
      ) : null}

      {paused ? (
        <div className="overlay pauseOverlay">
          <div className="overlayTitle">PAUSED</div>
          <div className="mutedText">{pauseReason || "일시정지"}</div>
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
          <div className="overlayLoop">빌드: {deathSummary.build}</div>
          <div className="overlayGoal">사망 원인: {deathSummary.reason}</div>
          <div className="buttons">
            <button className="primary" onClick={onCopyResult}>
              결과 카드 복사
            </button>
            <button onClick={onNewRun}>다시 시작</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
