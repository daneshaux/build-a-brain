import type { BrainRole, Scenario } from "../types/game";

interface ChoicesSummaryScreenProps {
  scenario: Scenario;
  selectedAnswers: Record<BrainRole, string | null>;
  onBack: () => void;
  onContinue: () => void;
}

const roleDisplayNames: Record<BrainRole, string> = {
  amygdala: "Amygdala",
  prefrontalCortex: "Prefrontal Cortex",
  hippocampus: "Hippocampus",
};

function ChoicesSummaryScreen({
  scenario,
  selectedAnswers,
  onBack,
  onContinue,
}: ChoicesSummaryScreenProps) {
  const selectedChoices = scenario.roleChoices.map((roleGroup) => {
    const selectedChoiceId = selectedAnswers[roleGroup.role];
    const selectedChoice =
      roleGroup.choices.find((choice) => choice.id === selectedChoiceId) ?? roleGroup.choices[0];

    return {
      role: roleGroup.role,
      text: selectedChoice.text,
    };
  });

  return (
    <div style={styles.screen}>
      <div style={styles.canvas}>
        <div style={styles.card}>
          <h1 style={styles.title}>Our choices</h1>

          <div style={styles.list}>
            {selectedChoices.map(({ role, text }) => (
              <div key={role} style={styles.item}>
                <span style={styles.role}>{roleDisplayNames[role].toUpperCase()}</span>
                <span style={styles.arrow}>→</span>
                <span style={styles.choice}>{text}</span>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button className="app-secondary-button" style={styles.secondaryButton} onClick={onBack}>
              Back
            </button>
            <button className="app-primary-button" style={styles.primaryButton} onClick={onContinue}>
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
    width: "min(820px, 100%)",
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
  },
  title: {
    margin: 0,
    fontSize: "2.2rem",
    color: "#0f172a",
    textAlign: "center" as const,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.85rem",
  },
  item: {
    display: "grid",
    gridTemplateColumns: "180px 26px minmax(0, 1fr)",
    alignItems: "start",
    gap: "0.6rem",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, rgba(239, 246, 255, 0.78) 0%, rgba(248, 250, 252, 0.96) 100%)",
    border: "1px solid rgba(191, 219, 254, 0.4)",
    padding: "1rem 1.1rem",
  },
  role: {
    fontSize: "0.92rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#475569",
  },
  arrow: {
    fontSize: "1rem",
    color: "#0ea5e9",
    lineHeight: 1.4,
  },
  choice: {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#1f2937",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "0.85rem",
    marginTop: "0.3rem",
  },
  secondaryButton: {
    padding: "0.9rem 1.45rem",
    fontSize: "1rem",
    fontWeight: 700,
  },
  primaryButton: {
    padding: "0.9rem 1.6rem",
    fontSize: "1rem",
    fontWeight: 700,
  },
};

export default ChoicesSummaryScreen;
