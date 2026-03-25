import { useEffect, useMemo, useState } from "react";
import type { BrainRole } from "../types/game";
import BrainGraphic from "./BrainGraphic";

interface AnalyzingScreenProps {
  onComplete: () => void;
}

const ANALYSIS_DURATION_MS = 4200;
const ANALYSIS_ROLES: BrainRole[] = ["amygdala", "prefrontalCortex", "hippocampus"];
const PHASE_ONE_RATIO = 0.33;
const PHASE_TWO_RATIO = 0.75;

function AnalyzingScreen({ onComplete }: AnalyzingScreenProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let completionTimeoutId: number | null = null;

    const frameId = window.setInterval(() => {
      const nextElapsed = Math.min(ANALYSIS_DURATION_MS, performance.now() - startTime);
      setElapsedMs(nextElapsed);

      if (nextElapsed >= ANALYSIS_DURATION_MS) {
        window.clearInterval(frameId);
        completionTimeoutId = window.setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, 50);

    return () => {
      window.clearInterval(frameId);
      if (completionTimeoutId !== null) {
        window.clearTimeout(completionTimeoutId);
      }
    };
  }, [onComplete]);

  const progressRatio = elapsedMs / ANALYSIS_DURATION_MS;
  const ringDegrees = Math.max(0, Math.min(360, progressRatio * 360));
  const phase = useMemo(() => {
    if (progressRatio < PHASE_ONE_RATIO) {
      return 1;
    }
    if (progressRatio < PHASE_TWO_RATIO) {
      return 2;
    }
    return 3;
  }, [progressRatio]);
  const phaseProgress = useMemo(() => {
    if (phase === 1) {
      return progressRatio / PHASE_ONE_RATIO;
    }
    if (phase === 2) {
      return (progressRatio - PHASE_ONE_RATIO) / (PHASE_TWO_RATIO - PHASE_ONE_RATIO);
    }
    return (progressRatio - PHASE_TWO_RATIO) / (1 - PHASE_TWO_RATIO);
  }, [phase, progressRatio]);
  const activeRole = useMemo(() => {
    if (phase === 1) {
      return null;
    }
    if (phase === 2) {
      const phaseTwoIndex = Math.min(
        ANALYSIS_ROLES.length - 1,
        Math.floor(phaseProgress * ANALYSIS_ROLES.length),
      );
      return ANALYSIS_ROLES[phaseTwoIndex];
    }
    return "hippocampus";
  }, [phase, phaseProgress]);
  const statusLabel = useMemo(() => {
    if (phase === 1) {
      return "Scanning signals...";
    }
    if (phase === 2) {
      return "Cross-checking responses...";
    }
    return "Finalizing regulation...";
  }, [phase]);
  const finalScale = phase === 3 ? 1 + phaseProgress * 0.08 : 1;
  const shellGlow = phase === 3 ? 0.22 + phaseProgress * 0.18 : phase === 2 ? 0.16 : 0.1;

  return (
    <div style={styles.screen}>
      <div style={styles.canvas}>
        <div style={styles.centerContent}>
          <div style={styles.visualShell}>
            <div
              className={phase === 3 ? "analyzing-brain-shell is-finalizing" : "analyzing-brain-shell"}
              style={{
                ...styles.brainPulseShell,
                transform: `scale(${finalScale})`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.55), 0 0 34px rgba(103, 232, 249, ${shellGlow})`,
              }}
            >
              <div
                className={phase >= 2 ? "analyzing-brain-sweep" : undefined}
                style={{
                  ...styles.brainSweep,
                  opacity: phase >= 2 ? 1 : 0,
                }}
              />
              <BrainGraphic
                className={phase === 3 ? "analyzing-brain-graphic is-finalizing" : "analyzing-brain-graphic"}
                style={styles.brainGraphic}
                activeRegion={activeRole}
                ariaLabel="Analyzing brain activity"
              />
            </div>

            <div
              style={{
                ...styles.spinnerTrack,
                background: `conic-gradient(from -90deg, #86efac 0deg, #67e8f9 ${ringDegrees}deg, rgba(203, 213, 225, 0.28) ${ringDegrees}deg 360deg)`,
                boxShadow:
                  phase === 3
                    ? "0 0 0 1px rgba(134, 239, 172, 0.2), 0 18px 48px rgba(148, 163, 184, 0.16), 0 0 52px rgba(103, 232, 249, 0.26)"
                    : styles.spinnerTrack.boxShadow,
              }}
            >
              <div style={styles.spinnerInner}>
                <span style={styles.progressValue}>{Math.round(progressRatio * 100)}%</span>
              </div>
            </div>
          </div>
          <p style={styles.label}>Analyzing brain activity...</p>
          <p style={styles.status}>{statusLabel}</p>
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
  centerContent: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "1rem",
  },
  visualShell: {
    position: "relative" as const,
    width: "360px",
    height: "360px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brainPulseShell: {
    position: "absolute" as const,
    zIndex: 2,
    width: "276px",
    height: "276px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255, 255, 255, 0.42) 0%, rgba(224, 242, 254, 0.24) 38%, rgba(186, 230, 253, 0.1) 58%, rgba(240, 249, 255, 0) 76%)",
    animation: "analyzingBrainPulse 2.2s ease-in-out infinite",
    overflow: "hidden" as const,
    transition: "transform 220ms ease-out, box-shadow 220ms ease-out",
  },
  brainSweep: {
    position: "absolute" as const,
    inset: "-18% -34%",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(186,230,253,0.14) 35%, rgba(255,255,255,0.6) 50%, rgba(167,243,208,0.16) 65%, rgba(255,255,255,0) 100%)",
    filter: "blur(14px)",
    animation: "analyzingBrainSweep 2.8s ease-in-out infinite",
    pointerEvents: "none" as const,
    transition: "opacity 180ms ease",
  },
  brainGraphic: {
    width: "246px",
    height: "auto",
    position: "relative" as const,
    zIndex: 1,
  },
  spinnerTrack: {
    position: "absolute" as const,
    zIndex: 1,
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 0 0 1px rgba(134, 239, 172, 0.16), 0 18px 48px rgba(148, 163, 184, 0.16), 0 0 42px rgba(103, 232, 249, 0.16)",
  },
  spinnerInner: {
    width: "306px",
    height: "306px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(248, 250, 252, 0.02) 56%, rgba(226, 232, 240, 0.12) 100%)",
    boxShadow:
      "inset 0 0 0 1px rgba(255, 255, 255, 0.22)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: "1.25rem",
    pointerEvents: "none" as const,
  },
  progressValue: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "0.06em",
    textShadow: "0 1px 8px rgba(255, 255, 255, 0.8)",
  },
  label: {
    margin: 0,
    fontSize: "1.9rem",
    color: "#202020",
  },
  status: {
    margin: 0,
    fontSize: "1rem",
    color: "#64748b",
  },
};

export default AnalyzingScreen;
