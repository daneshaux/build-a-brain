import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { BalanceMeterState } from "./BrainBalanceMeter";
import BrainBalanceMeter from "./BrainBalanceMeter";
import type { RegulationState } from "../types/game";
import BrainGraphic from "./BrainGraphic";

interface ResultScreenProps {
  result: RegulationState;
}

function ResultScreen({ result }: ResultScreenProps) {
  const isBalanced = result === "balanced";
  const meterState: BalanceMeterState = isBalanced ? "balanced" : "dysregulated";
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 96 }, (_, index) => {
        const burstX = -340 + (index / 95) * 680;
        const burstY = -140 - (index % 8) * 14;
        const fallDrift = (index % 2 === 0 ? -1 : 1) * (40 + (index % 10) * 11);
        const delay = 360 + (index % 18) * 28;
        const hue = 130 + ((index * 29) % 210);
        const sizeW = 8 + (index % 5) * 2;
        const sizeH = 10 + (index % 6) * 2;
        return {
          id: index,
          style: {
            left: `${50 + ((index % 5) - 2) * 0.9}%`,
            top: "30%",
            "--confetti-burst-x": `${burstX}px`,
            "--confetti-burst-y": `${burstY}px`,
            "--confetti-fall-drift": `${fallDrift}px`,
            "--confetti-delay": `${delay}ms`,
            "--confetti-duration": `${3200 + (index % 11) * 190}ms`,
            "--confetti-color": `hsl(${hue} 85% 58%)`,
            "--confetti-w": `${sizeW}px`,
            "--confetti-h": `${sizeH}px`,
          } as CSSProperties,
        };
      }),
    [],
  );

  return (
    <div
      className={
        isBalanced ? "result-screen result-screen--balanced" : "result-screen result-screen--dysregulated"
      }
      style={styles.screen}
    >
      <div style={styles.canvas}>
        <div style={styles.content}>
          {isBalanced && (
            <>
              <div className="result-success-glow" style={styles.successGlow} aria-hidden="true" />
              <div style={styles.confettiLayer} aria-hidden="true">
                {confettiPieces.map((piece) => (
                  <span
                    key={piece.id}
                    className="result-confetti-piece"
                    style={piece.style}
                  />
                ))}
              </div>
            </>
          )}
          {!isBalanced && (
            <div className="result-danger-flash" style={styles.dangerFlash} aria-hidden="true" />
          )}

          <BrainGraphic
            className={isBalanced ? "result-brain result-brain--balanced" : "result-brain result-brain--dysregulated"}
            style={styles.brainGraphic}
          />

          <div className={!isBalanced ? "result-meter-shell result-meter-shell--dysregulated" : "result-meter-shell"} style={styles.meterContainer}>
            <BrainBalanceMeter state={meterState} />
          </div>

          <p
            className={isBalanced ? "result-text result-text--balanced" : "result-text result-text--dysregulated"}
            style={styles.resultText}
          >
            {isBalanced ? "✨ Brain Balanced ✨\nNice work." : "🚨 You flipped your lid! 🚨"}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
  },
  canvas: {
    width: "100%",
    maxWidth: "1366px",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    position: "relative" as const,
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "2rem",
    marginTop: "-1rem",
  },
  confettiLayer: {
    position: "absolute" as const,
    inset: "-160px -220px -120px",
    pointerEvents: "none" as const,
    overflow: "hidden" as const,
    zIndex: 20,
  },
  successGlow: {
    position: "absolute" as const,
    top: "4%",
    left: "50%",
    width: "540px",
    height: "540px",
    transform: "translateX(-50%)",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(167, 243, 208, 0.5) 0%, rgba(103, 232, 249, 0.3) 28%, rgba(191, 219, 254, 0.18) 48%, rgba(255,255,255,0) 72%)",
    zIndex: 0,
  },
  dangerFlash: {
    position: "absolute" as const,
    top: "6%",
    left: "50%",
    width: "520px",
    height: "520px",
    transform: "translateX(-50%)",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(248, 113, 113, 0.46) 0%, rgba(251, 146, 60, 0.24) 30%, rgba(252, 165, 165, 0.14) 46%, rgba(255,255,255,0) 74%)",
    zIndex: 0,
  },
  brainGraphic: {
    width: "min(470px, 94%)",
    height: "auto",
    position: "relative" as const,
    zIndex: 2,
  },
  meterContainer: {
    width: "100%",
    position: "relative" as const,
    zIndex: 2,
  },
  resultText: {
    margin: 0,
    fontSize: "2rem",
    color: "#1f1f1f",
    whiteSpace: "pre-line" as const,
    textAlign: "center" as const,
    position: "relative" as const,
    zIndex: 2,
  },
};

export default ResultScreen;
