interface IntroScreenProps {
  onStart: () => void;
}

function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div style={styles.screen}>
      <p style={styles.mission}>Today you will work together as different parts of the brain.</p>
      <button className="intro-start-button" style={styles.button} onClick={onStart}>
        Enter the Brain
      </button>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
    width: "min(1366px, 100%)",
    margin: "0 auto",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
  },
  mission: {
    fontSize: "1rem",
    color: "#222",
  },
  button: {
    padding: "0.95rem 1.75rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
};

export default IntroScreen;
