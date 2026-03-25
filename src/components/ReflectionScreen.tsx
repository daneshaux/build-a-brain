import { useEffect, useMemo, useState } from "react";
import type { BrainRole, RegulationState, Scenario } from "../types/game";

interface ReflectionScreenProps {
  scenario: Scenario;
  selectedAnswers: Record<BrainRole, string | null>;
  result: RegulationState;
  canRetry: boolean;
  onAction: () => void;
}

const roleDisplayNames: Record<BrainRole, string> = {
  amygdala: "Amygdala",
  prefrontalCortex: "Prefrontal Cortex",
  hippocampus: "Hippocampus",
};

const roleThemes: Record<
  BrainRole,
  {
    background: string;
    border: string;
    accent: string;
    text: string;
  }
> = {
  amygdala: {
    background:
      "linear-gradient(135deg, rgba(255, 243, 245, 0.98) 0%, rgba(255, 231, 235, 0.98) 100%)",
    border: "rgba(229, 90, 111, 0.32)",
    accent: "#a83246",
    text: "#6f2c39",
  },
  prefrontalCortex: {
    background:
      "linear-gradient(135deg, rgba(240, 249, 255, 0.98) 0%, rgba(224, 242, 254, 0.98) 100%)",
    border: "rgba(56, 189, 248, 0.28)",
    accent: "#1d4ed8",
    text: "#294d88",
  },
  hippocampus: {
    background:
      "linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.98) 100%)",
    border: "rgba(245, 158, 11, 0.28)",
    accent: "#a16207",
    text: "#7a5a11",
  },
};

const explanationByRole: Record<
  BrainRole,
  Record<RegulationState, string>
> = {
  amygdala: {
    balanced:
      "This response notices a strong feeling without letting fear take over the whole situation.",
    dysregulated:
      "This response treats the moment like a danger signal, which can quickly push the brain into alarm mode.",
  },
  prefrontalCortex: {
    balanced:
      "This response uses planning and focus to slow things down and guide the brain back toward control.",
    dysregulated:
      "This response gives up careful thinking, so the brain has less support for staying regulated.",
  },
  hippocampus: {
    balanced:
      "This response uses memory in a helpful way by reminding the brain of past success and survival.",
    dysregulated:
      "This response pulls up a discouraging memory, which can make the current moment feel worse than it is.",
  },
};

function ReflectionScreen({
  scenario,
  selectedAnswers,
  result,
  canRetry,
  onAction,
}: ReflectionScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const isBalanced = result === "balanced";
  const finalActionLabel = !isBalanced && canRetry ? "Try again" : "Continue";
  const steps = scenario.roleChoices;
  const isSummaryStep = stepIndex >= steps.length;

  useEffect(() => {
    setStepIndex(0);
  }, [scenario.id, selectedAnswers, result, canRetry]);

  const selectedStepChoices = useMemo(
    () =>
      steps.map((roleGroup) => {
        const selectedChoiceId = selectedAnswers[roleGroup.role];
        return roleGroup.choices.find((choice) => choice.id === selectedChoiceId) ?? roleGroup.choices[0];
      }),
    [selectedAnswers, steps],
  );

  const helpfulChoices = steps
    .map((roleGroup, index) => ({
      role: roleGroup.role,
      choice: selectedStepChoices[index],
    }))
    .filter(({ choice }) => choice.effect === "balanced");

  if (isSummaryStep) {
    return (
      <div style={styles.screen}>
        <div style={styles.canvas}>
          <div style={styles.centerColumn}>
            <div style={styles.mainCard}>
              <p style={styles.stepLabel}>Reflection Summary</p>
              <h2 style={styles.summaryTitle}>
                {isBalanced ? "What helped the brain regulate?" : "What pushed the brain out of balance?"}
              </h2>
              <p style={styles.summaryText}>
                {isBalanced
                  ? "These responses worked together to support regulation."
                  : "These responses show where the brain needed more support and regulation skills."}
              </p>

              <div style={styles.summaryList}>
                {(isBalanced ? helpfulChoices : steps.map((roleGroup, index) => ({
                  role: roleGroup.role,
                  choice: selectedStepChoices[index],
                }))).map(({ role, choice }) => {
                  const theme = roleThemes[role];
                  return (
                    <div
                      key={role}
                      style={{
                        ...styles.summaryItem,
                        background: theme.background,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <span style={{ ...styles.summaryRole, color: theme.accent }}>
                        {roleDisplayNames[role]}
                      </span>
                      <span style={{ ...styles.summaryChoice, color: theme.text }}>{choice.text}</span>
                    </div>
                  );
                })}
              </div>

              {!canRetry && !isBalanced && (
                <p style={styles.retryNote}>You already used your one retry for this scenario.</p>
              )}

              <button style={styles.primaryButton} onClick={onAction}>
                {finalActionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleGroup = steps[stepIndex];
  const role = roleGroup.role;
  const selectedChoice = selectedStepChoices[stepIndex];
  const theme = roleThemes[role];
  const explanation = explanationByRole[role][selectedChoice.effect];

  return (
    <div style={styles.screen}>
      <div style={styles.canvas}>
        <div style={styles.centerColumn}>
          <div style={styles.mainCard}>
            <p style={styles.stepLabel}>
              Step {stepIndex + 1} of {steps.length}
            </p>
            <p style={styles.scenarioEyebrow}>Scenario</p>
            <p style={styles.scenarioText}>{scenario.prompt}</p>

            <div
              style={{
                ...styles.regionCard,
                background: theme.background,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 18px 40px rgba(148, 163, 184, 0.12), 0 0 0 3px rgba(255, 255, 255, 0.55)`,
              }}
            >
              <p style={{ ...styles.regionLabel, color: theme.accent }}>{roleDisplayNames[role]}</p>
              <div style={styles.responseBlock}>
                <p style={styles.responseLabel}>Selected response</p>
                <div
                  style={{
                    ...styles.responseCard,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 10px 24px rgba(15, 23, 42, 0.06)`,
                  }}
                >
                  <p style={{ ...styles.responseText, color: theme.text }}>{selectedChoice.text}</p>
                </div>
              </div>

              <div style={styles.explanationBlock}>
                <p style={styles.explanationLabel}>What this represents</p>
                <p style={styles.explanationText}>{explanation}</p>
              </div>
            </div>

            <button style={styles.primaryButton} onClick={() => setStepIndex((current) => current + 1)}>
              Next
            </button>
          </div>
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
    padding: "2rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  centerColumn: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  mainCard: {
    width: "min(720px, 100%)",
    borderRadius: "30px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow:
      "0 24px 60px rgba(148, 163, 184, 0.16), 0 0 0 4px rgba(255, 255, 255, 0.65)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.35rem",
    alignItems: "center",
    textAlign: "center" as const,
  },
  stepLabel: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#64748b",
  },
  scenarioEyebrow: {
    margin: 0,
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#94a3b8",
  },
  scenarioText: {
    margin: 0,
    maxWidth: "620px",
    fontSize: "1.06rem",
    lineHeight: 1.6,
    color: "#334155",
  },
  regionCard: {
    width: "100%",
    borderRadius: "24px",
    padding: "1.6rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.2rem",
    textAlign: "left" as const,
  },
  regionLabel: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
    textAlign: "center" as const,
  },
  responseBlock: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  responseLabel: {
    margin: 0,
    fontSize: "0.86rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748b",
  },
  responseCard: {
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    padding: "1.15rem 1.2rem",
  },
  responseText: {
    margin: 0,
    fontSize: "1.12rem",
    lineHeight: 1.55,
    fontWeight: 600,
  },
  explanationBlock: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  explanationLabel: {
    margin: 0,
    fontSize: "0.86rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#64748b",
  },
  explanationText: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: 1.65,
    color: "#334155",
  },
  summaryTitle: {
    margin: 0,
    fontSize: "2rem",
    color: "#0f172a",
  },
  summaryText: {
    margin: 0,
    maxWidth: "600px",
    fontSize: "1.04rem",
    lineHeight: 1.6,
    color: "#475569",
  },
  summaryList: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.9rem",
  },
  summaryItem: {
    borderRadius: "18px",
    padding: "1rem 1.1rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.35rem",
    textAlign: "left" as const,
  },
  summaryRole: {
    fontSize: "0.92rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  summaryChoice: {
    fontSize: "1rem",
    lineHeight: 1.5,
    fontWeight: 600,
  },
  retryNote: {
    margin: 0,
    fontSize: "0.96rem",
    color: "#7c2d12",
  },
  primaryButton: {
    border: "1px solid rgba(56, 189, 248, 0.34)",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(239, 246, 255, 0.98) 0%, rgba(219, 234, 254, 0.98) 100%)",
    color: "#1d4ed8",
    padding: "0.9rem 1.6rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow:
      "0 12px 26px rgba(56, 189, 248, 0.18), 0 0 0 2px rgba(224, 242, 254, 0.82)",
  },
};

export default ReflectionScreen;
