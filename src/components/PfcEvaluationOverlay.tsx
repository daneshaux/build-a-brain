type PfcAgreement = "agree" | "disagree";

interface PfcEvaluationOverlayProps {
  selectedResponseText: string;
  pfcAgreement: PfcAgreement | null;
  discussionTimerProgress: number;
  isContinueEnabled: boolean;
  onSelectAgreement: (agreement: PfcAgreement) => void;
  onContinue: () => void;
}

const DISCUSSION_SECONDS = 30;

function PfcEvaluationOverlay({
  selectedResponseText,
  pfcAgreement,
  discussionTimerProgress,
  isContinueEnabled,
  onSelectAgreement,
  onContinue,
}: PfcEvaluationOverlayProps) {
  const secondsRemaining = Math.max(DISCUSSION_SECONDS - discussionTimerProgress, 0);
  const promptText =
    pfcAgreement === "agree"
      ? "Why do you agree? Talk it out with your group."
      : "Why do you disagree? Talk it out with your group.";

  return (
    <div className="scenario-intro-overlay" aria-live="polite">
      <div className="scenario-intro-overlay__backdrop" />
      <div
        className="scenario-intro-overlay__card"
        style={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pfc-check-prompt"
      >
        <h2 id="pfc-check-prompt" style={styles.title}>PFC, do you agree with Amygdala&apos;s response?</h2>

        <div style={styles.responsePanel}>
          <span style={styles.responseLabel}>Amygdala chose:</span>
          <p style={styles.responseText}>{selectedResponseText}</p>
        </div>

        {pfcAgreement === null ? (
          <div style={styles.buttonRow}>
            <button
              type="button"
              className="scenario-action-button app-secondary-button"
              style={styles.choiceButton}
              onClick={() => onSelectAgreement("agree")}
            >
              Yes, I agree
            </button>
            <button
              type="button"
              className="scenario-action-button app-secondary-button"
              style={styles.choiceButton}
              onClick={() => onSelectAgreement("disagree")}
            >
              No, I disagree
            </button>
          </div>
        ) : (
          <div style={styles.discussionSection}>
            <p style={styles.discussionPrompt}>{promptText}</p>
            <div style={styles.timerWrap} aria-label={`${secondsRemaining} seconds remaining`}>
              <div style={styles.timerTrack}>
                <span
                  style={{
                    ...styles.timerFill,
                    width: `${Math.min((discussionTimerProgress / DISCUSSION_SECONDS) * 100, 100)}%`,
                  }}
                />
              </div>
              <span style={styles.timerText}>{secondsRemaining}s</span>
            </div>
            <button
              type="button"
              className="scenario-action-button app-primary-button"
              style={{
                ...styles.continueButton,
                opacity: isContinueEnabled ? 1 : 0.52,
                cursor: isContinueEnabled ? "pointer" : "not-allowed",
              }}
              disabled={!isContinueEnabled}
              onClick={onContinue}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: "relative" as const,
    width: "min(560px, calc(100vw - 2.5rem))",
    padding: "1.35rem",
    borderRadius: "30px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "stretch",
    gap: "1rem",
    textAlign: "center" as const,
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.8) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.28)",
    boxShadow: "0 28px 80px rgba(15, 23, 42, 0.18), 0 0 0 3px rgba(224, 242, 254, 0.5)",
    backdropFilter: "blur(20px)",
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.55rem, 3vw, 2.15rem)",
    lineHeight: 1.16,
    color: "#0f172a",
  },
  responsePanel: {
    padding: "1rem",
    borderRadius: "22px",
    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(248, 251, 255, 0.86) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.75)",
  },
  responseLabel: {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: "0.86rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#475569",
  },
  responseText: {
    margin: 0,
    color: "#1f2937",
    fontSize: "1.05rem",
    lineHeight: 1.55,
    fontWeight: 600,
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.8rem",
  },
  choiceButton: {
    minHeight: "54px",
    padding: "0.85rem 1rem",
    fontSize: "0.98rem",
    fontWeight: 800,
  },
  discussionSection: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.9rem",
  },
  discussionPrompt: {
    margin: 0,
    color: "#334155",
    fontSize: "1.12rem",
    lineHeight: 1.55,
    fontWeight: 700,
  },
  timerWrap: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  timerTrack: {
    flex: 1,
    height: "12px",
    borderRadius: "999px",
    background: "rgba(226, 232, 240, 0.9)",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.08)",
  },
  timerFill: {
    display: "block",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, rgba(56, 189, 248, 0.95), rgba(34, 197, 94, 0.9))",
    transition: "width 240ms ease",
  },
  timerText: {
    minWidth: "3rem",
    color: "#1d4ed8",
    fontSize: "1rem",
    fontWeight: 800,
  },
  continueButton: {
    padding: "0.85rem 1.45rem",
    fontSize: "0.98rem",
    fontWeight: 800,
    transition: "opacity 180ms ease, filter 180ms ease",
  },
};

export type { PfcAgreement };
export default PfcEvaluationOverlay;
