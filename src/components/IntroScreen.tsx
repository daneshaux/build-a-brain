import { useMemo, useState } from "react";

interface IntroScreenProps {
  onStart: () => void;
}

const missionGoals = [
  "Understand what each brain part does",
  "Explain how emotions and thinking work together",
  "Apply your brain skills to real-life situations",
  "Make thoughtful and balanced decisions",
] as const;

const revealedGoalCardThemes = [
  {
    background: "linear-gradient(160deg, rgba(255, 255, 255, 0.985) 0%, rgba(252, 247, 249, 0.97) 100%)",
    border: "rgba(223, 210, 216, 0.42)",
    ambient: "radial-gradient(circle at 24% 24%, rgba(236, 214, 222, 0.11) 0%, rgba(236, 214, 222, 0) 54%), radial-gradient(circle at 76% 70%, rgba(215, 227, 237, 0.07) 0%, rgba(215, 227, 237, 0) 58%)",
    particleOne: "rgba(236, 214, 222, 0.12)",
    particleTwo: "rgba(215, 227, 237, 0.09)",
    particleThree: "rgba(230, 220, 233, 0.09)",
  },
  {
    background: "linear-gradient(160deg, rgba(255, 255, 255, 0.985) 0%, rgba(252, 250, 244, 0.97) 100%)",
    border: "rgba(224, 218, 198, 0.42)",
    ambient: "radial-gradient(circle at 22% 22%, rgba(236, 228, 196, 0.11) 0%, rgba(236, 228, 196, 0) 54%), radial-gradient(circle at 74% 72%, rgba(216, 226, 233, 0.07) 0%, rgba(216, 226, 233, 0) 58%)",
    particleOne: "rgba(236, 228, 196, 0.12)",
    particleTwo: "rgba(216, 226, 233, 0.09)",
    particleThree: "rgba(229, 221, 197, 0.09)",
  },
  {
    background: "linear-gradient(160deg, rgba(255, 255, 255, 0.985) 0%, rgba(248, 246, 252, 0.97) 100%)",
    border: "rgba(216, 210, 226, 0.42)",
    ambient: "radial-gradient(circle at 26% 24%, rgba(224, 216, 238, 0.11) 0%, rgba(224, 216, 238, 0) 54%), radial-gradient(circle at 78% 70%, rgba(214, 224, 235, 0.07) 0%, rgba(214, 224, 235, 0) 58%)",
    particleOne: "rgba(224, 216, 238, 0.12)",
    particleTwo: "rgba(214, 224, 235, 0.09)",
    particleThree: "rgba(230, 222, 240, 0.09)",
  },
  {
    background: "linear-gradient(160deg, rgba(255, 255, 255, 0.985) 0%, rgba(245, 249, 252, 0.97) 100%)",
    border: "rgba(206, 216, 224, 0.42)",
    ambient: "radial-gradient(circle at 24% 22%, rgba(210, 224, 235, 0.11) 0%, rgba(210, 224, 235, 0) 52%), radial-gradient(circle at 78% 72%, rgba(223, 216, 236, 0.07) 0%, rgba(223, 216, 236, 0) 58%)",
    particleOne: "rgba(210, 224, 235, 0.12)",
    particleTwo: "rgba(223, 216, 236, 0.09)",
    particleThree: "rgba(217, 228, 236, 0.09)",
  },
] as const;

function IntroScreen({ onStart }: IntroScreenProps) {
  const [revealedGoals, setRevealedGoals] = useState<boolean[]>(missionGoals.map(() => false));

  const allGoalsActivated = useMemo(
    () => revealedGoals.every(Boolean),
    [revealedGoals],
  );

  const handleActivateGoal = (goalIndex: number) => {
    if (revealedGoals[goalIndex]) {
      return;
    }

    setRevealedGoals((current) => current.map((isRevealed, index) => (index === goalIndex ? true : isRevealed)));
  };

  return (
    <div style={styles.screen}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h1 style={styles.title}>What You&apos;ll Learn</h1>
          <p style={styles.subtitle}>Tap each card to reveal what you'll learn.</p>
        </div>

        <div style={styles.goalGrid}>
          {missionGoals.map((goal, index) => {
            const isRevealed = revealedGoals[index];
            const tileClassName = ["mission-goal-tile", isRevealed ? "is-revealed" : null].filter(Boolean).join(" ");
            const frontFaceClassName = [
              "mission-goal-tile__face",
              "mission-goal-tile__face--front",
              isRevealed ? "is-hidden" : "is-visible",
            ].join(" ");
            const revealedFaceClassName = [
              "mission-goal-tile__face",
              "mission-goal-tile__face--revealed",
              isRevealed ? "is-visible" : "is-hidden",
            ].join(" ");
            const revealedTextClassName = ["mission-goal-text", isRevealed ? "is-visible" : "is-hidden"].join(" ");

            return (
              <button
                key={goal}
                type="button"
                className={tileClassName}
                onClick={() => handleActivateGoal(index)}
                aria-pressed={isRevealed}
                style={{
                  ...styles.goalCard,
                  animationDelay: `${index * 150}ms`,
                  ...(isRevealed ? styles.goalCardActive : undefined),
                }}
              >
                <span className="mission-goal-tile__inner" style={styles.goalTileInner}>
                  <span className={frontFaceClassName} style={styles.goalFaceFront}>
                    <span
                      className="mission-goal-ambient"
                      aria-hidden="true"
                      style={{
                        ...styles.goalAmbient,
                        background: revealedGoalCardThemes[index].ambient,
                      }}
                    />
                    <span
                      className="mission-goal-particle mission-goal-particle--one"
                      aria-hidden="true"
                      style={{ ...styles.goalParticle, background: revealedGoalCardThemes[index].particleOne }}
                    />
                    <span
                      className="mission-goal-particle mission-goal-particle--two"
                      aria-hidden="true"
                      style={{ ...styles.goalParticle, background: revealedGoalCardThemes[index].particleTwo }}
                    />
                    <span
                      className="mission-goal-particle mission-goal-particle--three"
                      aria-hidden="true"
                      style={{ ...styles.goalParticle, background: revealedGoalCardThemes[index].particleThree }}
                    />
                    <span style={styles.goalOrb} aria-hidden="true" />
                  </span>

                  <span
                    className={revealedFaceClassName}
                    style={{
                      ...styles.goalFaceBack,
                      background: revealedGoalCardThemes[index].background,
                      borderColor: revealedGoalCardThemes[index].border,
                    }}
                  >
                    <span
                      className="mission-goal-ambient"
                      aria-hidden="true"
                      style={{
                        ...styles.goalAmbient,
                        background: revealedGoalCardThemes[index].ambient,
                      }}
                    />
                    <span
                      className="mission-goal-particle mission-goal-particle--one"
                      aria-hidden="true"
                      style={{ ...styles.goalParticle, background: revealedGoalCardThemes[index].particleOne }}
                    />
                    <span
                      className="mission-goal-particle mission-goal-particle--two"
                      aria-hidden="true"
                      style={{ ...styles.goalParticle, background: revealedGoalCardThemes[index].particleTwo }}
                    />
                    <span
                      className="mission-goal-particle mission-goal-particle--three"
                      aria-hidden="true"
                      style={{ ...styles.goalParticle, background: revealedGoalCardThemes[index].particleThree }}
                    />
                    <span className="mission-goal-fragment mission-goal-fragment--one" aria-hidden="true" />
                    <span className="mission-goal-fragment mission-goal-fragment--two" aria-hidden="true" />
                    <span className="mission-goal-fragment mission-goal-fragment--three" aria-hidden="true" />
                    <p className={revealedTextClassName} style={styles.goalText}>{goal}</p>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={allGoalsActivated ? "intro-start-button" : undefined}
          style={{
            ...styles.button,
            ...(allGoalsActivated ? styles.buttonEnabled : styles.buttonDisabled),
          }}
          disabled={!allGoalsActivated}
          onClick={onStart}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
    width: "min(1366px, 100%)",
    margin: "0 auto",
    padding: "clamp(1rem, 3vw, 2rem)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "min(940px, 100%)",
    padding: "clamp(1rem, 2vw, 1.75rem) 0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "1.75rem",
  },
  header: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.5rem",
    textAlign: "center" as const,
    maxWidth: "620px",
  },
  title: {
    margin: 0,
    fontSize: "clamp(2.4rem, 5vw, 4rem)",
    lineHeight: 0.98,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    fontSize: "1.05rem",
    lineHeight: 1.55,
    color: "#46617d",
  },
  goalGrid: {
    width: "min(760px, 100%)",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "1rem",
  },
  goalCard: {
    minHeight: "190px",
    padding: 0,
    borderRadius: "26px",
    border: "none",
    background: "transparent",
    boxShadow: "none",
    display: "block",
    textAlign: "left" as const,
    cursor: "pointer",
    animation: "missionTileIdleFloat 5.6s ease-in-out infinite",
  },
  goalCardActive: {
    filter: "none",
  },
  goalTileInner: {
    position: "relative" as const,
    display: "block",
    width: "100%",
    height: "100%",
    minHeight: "190px",
    transition: "transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  },
  goalFaceFront: {
    position: "absolute" as const,
    inset: 0,
    borderRadius: "26px",
    border: "1px solid rgba(191, 219, 254, 0.82)",
    background:
      "linear-gradient(160deg, rgba(255, 255, 255, 0.7) 0%, rgba(239, 246, 255, 0.78) 100%)",
    boxShadow: "0 14px 30px rgba(148, 163, 184, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden" as const,
  },
  goalFaceBack: {
    position: "absolute" as const,
    inset: 0,
    padding: "24px",
    borderRadius: "26px",
    border: "1px solid rgba(34, 211, 238, 0.46)",
    background:
      "linear-gradient(160deg, rgba(240, 253, 250, 0.96) 0%, rgba(224, 242, 254, 0.94) 100%)",
    boxShadow:
      "0 20px 38px rgba(34, 211, 238, 0.18), 0 0 0 1px rgba(134, 239, 172, 0.32), 0 0 34px rgba(103, 232, 249, 0.18)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "0.9rem",
    textAlign: "left" as const,
    overflow: "visible" as const,
  },
  goalOrb: {
    position: "absolute" as const,
    width: "128px",
    height: "128px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(103,232,249,0.2) 0%, rgba(191,219,254,0.12) 40%, rgba(255,255,255,0) 72%)",
    filter: "blur(2px)",
  },
  goalAmbient: {
    position: "absolute" as const,
    inset: "-8%",
    opacity: 0.8,
    pointerEvents: "none" as const,
    zIndex: 0,
  },
  goalParticle: {
    position: "absolute" as const,
    width: "64px",
    height: "64px",
    borderRadius: "999px",
    filter: "blur(16px)",
    opacity: 0.28,
    pointerEvents: "none" as const,
    zIndex: 0,
  },
  goalText: {
    margin: 0,
    width: "100%",
    fontSize: "0.94rem",
    lineHeight: 1.35,
    fontWeight: 700,
    color: "#16324f",
    textAlign: "left" as const,
    maxWidth: "none",
    position: "relative" as const,
    zIndex: 2,
  },
  goalIndicator: {
    width: "2rem",
    height: "2rem",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.84)",
    border: "1px solid rgba(191, 219, 254, 0.9)",
    color: "transparent",
    fontSize: "1.15rem",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(148, 163, 184, 0.14)",
    opacity: 0,
    transform: "scale(0.72)",
    transition: "opacity 140ms ease, transform 180ms ease",
  },
  goalIndicatorActive: {
    background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
    border: "1px solid rgba(34, 211, 238, 0.32)",
    color: "#fff",
    boxShadow: "0 10px 20px rgba(34, 211, 238, 0.2)",
    opacity: 1,
    transform: "scale(1)",
  },
  button: {
    minWidth: "220px",
    padding: "0.98rem 1.8rem",
    borderRadius: "999px",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "opacity 220ms ease, transform 220ms ease, filter 220ms ease",
  },
  buttonDisabled: {
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background: "linear-gradient(135deg, rgba(226, 232, 240, 0.85), rgba(203, 213, 225, 0.78))",
    color: "#64748b",
    cursor: "not-allowed",
    opacity: 0.82,
    boxShadow: "0 10px 24px rgba(148, 163, 184, 0.12)",
  },
  buttonEnabled: {
    border: "1px solid rgba(99, 102, 241, 0.28)",
    color: "#fff",
    cursor: "pointer",
  },
};

export default IntroScreen;
