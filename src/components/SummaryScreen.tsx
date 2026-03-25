import type { RegulationState } from "../types/game";

interface SummaryScreenProps {
  result: RegulationState;
  attempts: number;
  flips: number;
  onPlayAgain: () => void;
}

function SummaryScreen({ result, attempts, flips, onPlayAgain }: SummaryScreenProps) {
  const isBalanced = result === "balanced";
  const theme = isBalanced
    ? {
        glow: "0 24px 60px rgba(45, 212, 191, 0.16), 0 0 0 4px rgba(209, 250, 229, 0.7)",
        border: "rgba(52, 211, 153, 0.26)",
        badgeBackground:
          "linear-gradient(135deg, rgba(236, 253, 245, 0.98) 0%, rgba(220, 252, 231, 0.98) 100%)",
        badgeText: "#047857",
        title: "Brain State: Regulated",
        interpretation:
          "The brain worked together to stay steady, think clearly, and respond with control.",
        nextStep:
          "Next step: Talk about which choice helped the most, then see if you can regulate even faster next round.",
      }
    : {
        glow: "0 24px 60px rgba(248, 113, 113, 0.14), 0 0 0 4px rgba(254, 226, 226, 0.74)",
        border: "rgba(248, 113, 113, 0.24)",
        badgeBackground:
          "linear-gradient(135deg, rgba(255, 241, 242, 0.98) 0%, rgba(254, 226, 226, 0.98) 100%)",
        badgeText: "#b91c1c",
        title: "Brain State: Dysregulated",
        interpretation:
          "The brain lost balance, so big feelings took over more than calm thinking and helpful memory.",
        nextStep:
          "Next step: Look for one choice you would change and try a calmer response next time.",
      };

  const metrics = [
    { icon: "🎯", label: "Attempts", value: `${attempts}` },
    { icon: "🚨", label: "Times flipped", value: `${flips}` },
    { icon: "🔁", label: "Retries used", value: `${Math.max(0, attempts - 1)}` },
  ];

  return (
    <div style={styles.screen}>
      <div style={styles.canvas}>
        <div
          style={{
            ...styles.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.glow,
          }}
        >
          <p style={styles.eyebrow}>Game Result</p>
          <div
            style={{
              ...styles.resultBadge,
              background: theme.badgeBackground,
              color: theme.badgeText,
            }}
          >
            {theme.title}
          </div>

          <p style={styles.interpretation}>{theme.interpretation}</p>

          <div style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <div key={metric.label} style={styles.metricCard}>
                <span style={styles.metricIcon}>{metric.icon}</span>
                <span style={styles.metricLabel}>{metric.label}</span>
                <span style={styles.metricValue}>{metric.value}</span>
              </div>
            ))}
          </div>

          <div style={styles.nextStepCard}>
            <p style={styles.nextStepLabel}>Next Step</p>
            <p style={styles.nextStepText}>{theme.nextStep}</p>
          </div>

          <button className="summary-play-button" style={styles.button} onClick={onPlayAgain}>
            Play Again
          </button>
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
    width: "min(760px, 100%)",
    borderRadius: "32px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 252, 0.96) 100%)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.35rem",
    alignItems: "center",
    textAlign: "center" as const,
  },
  eyebrow: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#64748b",
  },
  resultBadge: {
    borderRadius: "999px",
    padding: "0.85rem 1.35rem",
    fontSize: "1.35rem",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  interpretation: {
    margin: 0,
    maxWidth: "620px",
    fontSize: "1.05rem",
    lineHeight: 1.65,
    color: "#334155",
  },
  metricsGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
  },
  metricCard: {
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(239, 246, 255, 0.76) 0%, rgba(248, 250, 252, 0.96) 100%)",
    border: "1px solid rgba(191, 219, 254, 0.4)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.35rem",
    boxShadow: "0 12px 26px rgba(148, 163, 184, 0.12)",
  },
  metricIcon: {
    fontSize: "1.45rem",
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  metricValue: {
    fontSize: "1.55rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  nextStepCard: {
    width: "100%",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(255, 251, 235, 0.86) 0%, rgba(254, 249, 195, 0.92) 100%)",
    border: "1px solid rgba(250, 204, 21, 0.28)",
    padding: "1.1rem 1.2rem",
    textAlign: "left" as const,
  },
  nextStepLabel: {
    margin: "0 0 0.25rem 0",
    fontSize: "0.86rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#a16207",
  },
  nextStepText: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#713f12",
  },
  button: {
    border: "1px solid rgba(99, 102, 241, 0.28)",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 42%, #22d3ee 100%)",
    color: "#fff",
    padding: "0.95rem 1.9rem",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow:
      "0 0 20px rgba(99, 102, 241, 0.34), 0 12px 26px rgba(34, 211, 238, 0.16)",
  },
};

export default SummaryScreen;
