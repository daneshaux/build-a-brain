import type { RegulationState } from "../types/game";

interface DiscussionScreenProps {
  result: RegulationState;
  onContinue: () => void;
  onViewChoices: () => void;
}

function DiscussionScreen({ result, onContinue, onViewChoices }: DiscussionScreenProps) {
  const isBalanced = result === "balanced";
  const questions = isBalanced
    ? [
        "What helped the brain stay in control?",
        "Which choice made the biggest difference?",
      ]
    : [
        "What pushed the brain out of balance?",
        "What could you try instead next time?",
      ];

  return (
    <div style={styles.screen}>
      <div style={styles.canvas}>
        <div style={styles.card}>
          <h1 style={styles.title}>🧠 Let&apos;s talk about it</h1>
          <p style={styles.subtitle}>
            Share your ideas together. There is more than one good answer.
          </p>

          <div style={styles.questionList}>
            {questions.map((question) => (
              <div key={question} style={styles.questionItem}>
                <span style={styles.bullet}>•</span>
                <span style={styles.questionText}>{question}</span>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button className="app-secondary-button" style={styles.secondaryButton} onClick={onViewChoices}>
              View our choices
            </button>
            <button className="app-primary-button" style={styles.button} onClick={onContinue}>
              Continue
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
  card: {
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
    gap: "1.4rem",
    alignItems: "center",
    textAlign: "center" as const,
  },
  title: {
    margin: 0,
    fontSize: "2.3rem",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    maxWidth: "520px",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#475569",
  },
  questionList: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  questionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.8rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(240, 253, 250, 0.9) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.24)",
    padding: "1rem 1.1rem",
    textAlign: "left" as const,
  },
  bullet: {
    fontSize: "1.4rem",
    lineHeight: 1,
    color: "#0ea5e9",
  },
  questionText: {
    fontSize: "1.05rem",
    lineHeight: 1.55,
    color: "#1f2937",
  },
  button: {
    padding: "0.9rem 1.6rem",
    fontSize: "1rem",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "0.85rem",
    flexWrap: "wrap" as const,
  },
  secondaryButton: {
    padding: "0.9rem 1.45rem",
    fontSize: "1rem",
    fontWeight: 700,
  },
};

export default DiscussionScreen;
