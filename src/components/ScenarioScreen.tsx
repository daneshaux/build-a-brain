import { useState } from "react";
import type { BrainRole, Scenario } from "../types/game";
import BrainBalanceMeter from "./BrainBalanceMeter";
import type { BalanceMeterState } from "./BrainBalanceMeter";
import BrainGraphic from "./BrainGraphic";
import ScenarioIntroOverlay from "./ScenarioIntroOverlay";
import { playUiSound } from "../utils/sound";

interface ScenarioScreenProps {
  scenario: Scenario;
  showIntroOverlay: boolean;
  currentRoleIndex: number;
  selectedAnswers: Record<BrainRole, string | null>;
  regulationMeterState: BalanceMeterState;
  isAdvancing: boolean;
  onSelectAnswer: (role: BrainRole, choiceId: string) => void;
  onNext: (role: BrainRole) => void;
  onIntroOverlayDismiss: () => void;
}

function ScenarioScreen({
  scenario,
  showIntroOverlay,
  currentRoleIndex,
  selectedAnswers,
  regulationMeterState,
  isAdvancing,
  onSelectAnswer,
  onNext,
  onIntroOverlayDismiss,
}: ScenarioScreenProps) {
  const [hoveredChoiceId, setHoveredChoiceId] = useState<string | null>(null);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const currentRoleGroup = scenario.roleChoices[currentRoleIndex];
  const currentRole = currentRoleGroup.role;
  const currentPlayerTheme = currentRoleThemes[currentRole];

  const roleDisplayNames: Record<BrainRole, string> = {
    amygdala: "Amygdala",
    prefrontalCortex: "Prefrontal Cortex",
    hippocampus: "Hippocampus",
  };

  const selectedChoiceId = selectedAnswers[currentRole];
  const roleStages = scenario.roleChoices.map((roleGroup) => roleGroup.role);
  const hintMessage = hintByRole[currentRole];
  const scenarioThought = scenario.prompt
    .replace(/^You’re\b/, "I’m")
    .replace(/^You are\b/, "I am")
    .replace(/\bYour\b/g, "My")
    .replace(/\byour\b/g, "my");

  return (
    <div style={styles.screen}>
      {showIntroOverlay && (
        <ScenarioIntroOverlay onDismiss={onIntroOverlayDismiss} />
      )}

      {isHintOpen && (
        <div
          className="scenario-hint-overlay"
          onClick={() => setIsHintOpen(false)}
          role="presentation"
        >
          <div
            className="scenario-hint-card"
            style={styles.hintOverlayCard}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${roleDisplayNames[currentRole]} hint`}
          >
            <p style={styles.hintOverlayLabel}>Hint for {roleDisplayNames[currentRole]}</p>
            <p style={styles.hintOverlayText}>{hintMessage}</p>
            <button
              type="button"
              className="scenario-action-button app-secondary-button"
              style={styles.hintOverlayButton}
              onClick={() => setIsHintOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div style={styles.canvas}>
        <div style={styles.topGrid}>
          <div style={styles.leftColumn}>
            <div style={styles.brainPanel}>
              <BrainGraphic
                style={styles.brainGraphic}
                activeRegion={currentRole}
              />
            </div>

            <div style={styles.meterContainer}>
              <BrainBalanceMeter state={regulationMeterState} />
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div style={styles.progressSection}>
              <h2 style={styles.progressTitle}>
                Role {currentRoleIndex + 1} of {scenario.roleChoices.length}:{" "}
                {roleDisplayNames[currentRole]}
              </h2>
              <div style={styles.progressTrack}>
                {roleStages.map((role, index) => {
                  const stageTheme = currentRoleThemes[role];
                  const isCompleted = index < currentRoleIndex;
                  const isActive = index === currentRoleIndex;

                  return (
                    <div
                      key={role}
                      style={{
                        ...styles.progressSegment,
                        background: isCompleted || isActive ? stageTheme.background : styles.progressSegment.background,
                        border: `1px solid ${
                          isCompleted || isActive ? stageTheme.border : "rgba(148, 163, 184, 0.18)"
                        }`,
                        boxShadow: isActive
                          ? `inset 0 1px 0 rgba(255, 255, 255, 0.85), ${stageTheme.shadow}`
                          : isCompleted
                            ? "inset 0 1px 0 rgba(255, 255, 255, 0.82), 0 4px 10px rgba(148, 163, 184, 0.12)"
                            : "inset 0 1px 0 rgba(255, 255, 255, 0.72)",
                        opacity: isCompleted || isActive ? 1 : 0.6,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div style={styles.scenarioBubbleWrap}>
              <div style={styles.scenarioBubble}>
                <div style={styles.scenarioThoughtDotLarge} aria-hidden="true" />
                <div style={styles.scenarioThoughtDotMedium} aria-hidden="true" />
                <div style={styles.scenarioThoughtDotSmall} aria-hidden="true" />
                <p style={styles.scenarioText}>{scenarioThought}</p>
              </div>
            </div>

            <div style={styles.currentPlayerWrap}>
              <div
                className="scenario-current-player-badge"
                style={{
                  ...styles.currentPlayerBadge,
                  background: currentPlayerTheme.background,
                  border: `1px solid ${currentPlayerTheme.border}`,
                  boxShadow: currentPlayerTheme.shadow,
                }}
              >
                <span style={styles.currentPlayerLabel}>Current Player</span>
                <span style={{ ...styles.currentPlayerValue, color: currentPlayerTheme.text }}>
                  <span aria-hidden="true" style={styles.currentPlayerIcon}>
                    ✦
                  </span>
                  {roleDisplayNames[currentRole]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.choicesContainer}>
          {currentRoleGroup.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const isHovered = hoveredChoiceId === choice.id && !isAdvancing;

            return (
              <button
                key={choice.id}
                disabled={isAdvancing || showIntroOverlay}
                onClick={() => onSelectAnswer(currentRole, choice.id)}
                onMouseEnter={() => setHoveredChoiceId(choice.id)}
                onMouseLeave={() => setHoveredChoiceId((current) => (current === choice.id ? null : current))}
                style={{
                  ...styles.choiceButton,
                  ...(isAdvancing ? styles.disabledChoiceButton : {}),
                  ...(isSelected ? styles.selectedChoiceButton : {}),
                  ...(isHovered ? styles.hoveredChoiceButton : {}),
                }}
              >
                {choice.text}
              </button>
            );
          })}
        </div>

        <div style={styles.bottomRow}>
          <button
            className="scenario-action-button scenario-action-button--next app-primary-button"
            style={{
              ...styles.nextButton,
              opacity: selectedChoiceId && !isAdvancing && !showIntroOverlay ? 1 : 0.5,
              cursor: selectedChoiceId && !isAdvancing && !showIntroOverlay ? "pointer" : "not-allowed",
            }}
            onClick={() => {
              const selectedChoice = currentRoleGroup.choices.find((choice) => choice.id === selectedChoiceId);
              if (selectedChoice) {
                playUiSound(selectedChoice.effect === "balanced" ? "positive" : "negative");
              }
              onNext(currentRole);
            }}
            disabled={!selectedChoiceId || isAdvancing || showIntroOverlay}
          >
            {isAdvancing ? "Updating..." : "Next"}
          </button>
          <button
            className="scenario-action-button scenario-action-button--hint app-secondary-button"
            style={{
              ...styles.hintButton,
              opacity: showIntroOverlay ? 0.5 : 1,
              cursor: showIntroOverlay ? "not-allowed" : "pointer",
            }}
            onClick={() => setIsHintOpen(true)}
            disabled={showIntroOverlay}
          >
            ⚡ Hint
          </button>
        </div>
      </div>
    </div>
  );
}

const currentRoleThemes: Record<
  BrainRole,
  {
    background: string;
    border: string;
    text: string;
    shadow: string;
  }
> = {
  amygdala: {
    background:
      "linear-gradient(135deg, rgba(255, 243, 245, 0.98) 0%, rgba(255, 231, 235, 0.98) 100%)",
    border: "rgba(229, 90, 111, 0.44)",
    text: "#a83246",
    shadow:
      "0 12px 28px rgba(229, 90, 111, 0.18), 0 0 0 3px rgba(255, 221, 226, 0.86), 0 0 26px rgba(244, 114, 182, 0.2)",
  },
  prefrontalCortex: {
    background:
      "linear-gradient(135deg, rgba(240, 249, 255, 0.98) 0%, rgba(224, 242, 254, 0.98) 100%)",
    border: "rgba(56, 189, 248, 0.42)",
    text: "#1d4ed8",
    shadow:
      "0 12px 28px rgba(56, 189, 248, 0.18), 0 0 0 3px rgba(224, 242, 254, 0.92), 0 0 28px rgba(125, 211, 252, 0.24)",
  },
  hippocampus: {
    background:
      "linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.98) 100%)",
    border: "rgba(245, 158, 11, 0.42)",
    text: "#a16207",
    shadow:
      "0 12px 28px rgba(245, 158, 11, 0.16), 0 0 0 3px rgba(254, 243, 199, 0.92), 0 0 28px rgba(250, 204, 21, 0.2)",
  },
};

const hintByRole: Record<BrainRole, string> = {
  amygdala: "Your amygdala handles emotions 👀 Is this response driven by feelings?",
  prefrontalCortex:
    "Your prefrontal cortex helps you think things through. What’s the most thoughtful choice?",
  hippocampus:
    "Your hippocampus pulls from memory. What have you learned from past experiences?",
};

const styles = {
  screen: {
    minHeight: "100vh",
  },
  canvas: {
    width: "100%",
    maxWidth: "1366px",
    margin: "0 auto",
    minHeight: "100vh",
    padding: "1.75rem 2rem 1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
    gap: "1rem",
    alignItems: "stretch",
    width: "100%",
  },
  leftColumn: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
  },
  brainPanel: {
    width: "100%",
    minHeight: "340px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  brainGraphic: {
    width: "min(370px, 94%)",
    height: "auto",
  },
  meterContainer: {
    width: "100%",
  },
  rightColumn: {
    width: "100%",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: "0.4rem",
  },
  progressSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.7rem",
  },
  progressTitle: {
    margin: 0,
    fontSize: "1.95rem",
    fontWeight: 500,
    color: "#111",
  },
  progressTrack: {
    width: "100%",
    height: "12px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(226, 232, 240, 0.9) 100%)",
    padding: "2px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "4px",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 3px 10px rgba(148, 163, 184, 0.12)",
  },
  progressSegment: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(226, 232, 240, 0.82) 100%)",
  },
  scenarioBubbleWrap: {
    position: "relative" as const,
    paddingLeft: "1.2rem",
    display: "flex",
    alignItems: "center",
    minHeight: "100%",
  },
  scenarioBubble: {
    position: "relative" as const,
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.34)",
    borderRadius: "42px 46px 38px 44px / 36px 40px 34px 38px",
    padding: "1.1rem 1.5rem",
    minHeight: "0",
    boxShadow:
      "0 18px 40px rgba(148, 163, 184, 0.18), 0 0 0 3px rgba(224, 242, 254, 0.8), 0 0 28px rgba(186, 230, 253, 0.32)",
  },
  scenarioThoughtDotLarge: {
    position: "absolute" as const,
    left: "-16px",
    top: "72%",
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.28)",
    boxShadow: "0 10px 22px rgba(148, 163, 184, 0.14)",
  },
  scenarioThoughtDotMedium: {
    position: "absolute" as const,
    left: "-34px",
    top: "83%",
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.24)",
    boxShadow: "0 8px 18px rgba(148, 163, 184, 0.12)",
  },
  scenarioThoughtDotSmall: {
    position: "absolute" as const,
    left: "-48px",
    top: "94%",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.22)",
    boxShadow: "0 6px 14px rgba(148, 163, 184, 0.1)",
  },
  scenarioText: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#334155",
    lineHeight: 1.55,
  },
  currentPlayerWrap: {
    display: "flex",
    justifyContent: "center",
    alignSelf: "end",
  },
  currentPlayerBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    flexWrap: "wrap" as const,
    padding: "0.9rem 1.35rem",
    borderRadius: "999px",
    minHeight: "68px",
    textAlign: "center" as const,
    animation: "scenarioStatusBadgeFloat 2.8s ease-in-out infinite",
  },
  currentPlayerLabel: {
    fontSize: "0.86rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#475569",
  },
  currentPlayerValue: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    fontSize: "1.3rem",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  currentPlayerIcon: {
    fontSize: "1rem",
  },
  choicesContainer: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    marginTop: "40px",
    gap: "24px",
  },
  choiceButton: {
    minHeight: "160px",
    padding: "1.4rem 1.5rem",
    borderRadius: "20px",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 247, 251, 0.96) 100%)",
    color: "#1f2937",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "center" as const,
    lineHeight: 1.5,
    boxShadow: "0 12px 28px rgba(148, 163, 184, 0.18), 0 2px 8px rgba(15, 23, 42, 0.06)",
    transform: "translateY(0)",
    transition:
      "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
  },
  disabledChoiceButton: {
    opacity: 0.7,
    cursor: "default",
  },
  hoveredChoiceButton: {
    transform: "translateY(-4px)",
    border: "1px solid rgba(125, 211, 252, 0.5)",
    boxShadow:
      "0 18px 36px rgba(148, 163, 184, 0.24), 0 0 0 4px rgba(191, 219, 254, 0.55), 0 0 24px rgba(186, 230, 253, 0.35)",
  },
  selectedChoiceButton: {
    border: "1px solid rgba(56, 189, 248, 0.5)",
    background:
      "linear-gradient(180deg, rgba(248, 252, 255, 1) 0%, rgba(232, 244, 255, 0.96) 100%)",
    boxShadow:
      "0 16px 34px rgba(125, 211, 252, 0.24), 0 0 0 4px rgba(186, 230, 253, 0.6)",
  },
  bottomRow: {
    width: "calc((100% - 1rem) * 2 / 3)",
    marginLeft: "auto",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.15rem",
  },
  hintButton: {
    padding: "0.85rem 1.45rem",
    border: "1px solid rgba(125, 211, 252, 0.38)",
    background:
      "linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.98) 100%)",
    color: "#7c5800",
    fontSize: "1.05rem",
    fontWeight: 700,
    boxShadow:
      "0 10px 24px rgba(245, 158, 11, 0.16), 0 0 0 2px rgba(254, 243, 199, 0.8)",
    transition: "transform 180ms ease, filter 180ms ease, box-shadow 180ms ease",
  },
  hintOverlayCard: {
    width: "min(460px, calc(100vw - 2rem))",
    padding: "1.4rem 1.45rem",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.9rem",
    textAlign: "center" as const,
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 251, 255, 0.92) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.28)",
    boxShadow:
      "0 24px 50px rgba(15, 23, 42, 0.18), 0 0 0 3px rgba(224, 242, 254, 0.72)",
    backdropFilter: "blur(16px)",
  },
  hintOverlayLabel: {
    margin: 0,
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#4f46e5",
  },
  hintOverlayText: {
    margin: 0,
    fontSize: "1.05rem",
    lineHeight: 1.65,
    color: "#334155",
  },
  hintOverlayButton: {
    padding: "0.82rem 1.35rem",
    fontSize: "0.96rem",
    fontWeight: 700,
  },
  nextButton: {
    padding: "0.85rem 1.4rem",
    fontSize: "0.98rem",
    fontWeight: 700,
    transition: "transform 180ms ease, filter 180ms ease, box-shadow 180ms ease",
  },
};

export default ScenarioScreen;
