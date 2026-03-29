interface RetryScreenProps {
  onRetry: () => void;
}

function RetryScreen({ onRetry }: RetryScreenProps) {
  return (
    <div style={styles.screen}>
      <div style={styles.canvas}>
        <div style={styles.card}>
          <h1 style={styles.title}>That was a tough round.</h1>
          <p style={styles.text}>
            The brain got dysregulated this time. Try again and see if you can help it
            respond in a more balanced way.
          </p>
          <button className="app-primary-button" style={styles.button} onClick={onRetry}>
            Try again
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
    width: "min(700px, 100%)",
    borderRadius: "30px",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow:
      "0 24px 60px rgba(148, 163, 184, 0.16), 0 0 0 4px rgba(255, 255, 255, 0.65)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.2rem",
    alignItems: "center",
    textAlign: "center" as const,
  },
  title: {
    margin: 0,
    fontSize: "2.15rem",
    color: "#0f172a",
  },
  text: {
    margin: 0,
    maxWidth: "540px",
    fontSize: "1.02rem",
    lineHeight: 1.65,
    color: "#475569",
  },
  button: {
    padding: "0.9rem 1.6rem",
    fontSize: "1rem",
    fontWeight: 700,
  },
};

export default RetryScreen;
