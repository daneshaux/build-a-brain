import { useEffect, useRef, useState } from "react";
import type { BrainRole, RoleInfo } from "../types/game";

interface RoleSelectionScreenProps {
  roles: RoleInfo[];
  selectedRoles: BrainRole[];
  onSelectRole: (role: BrainRole) => void;
  onContinue: () => void;
}

const ROLE_TIMER_SECONDS = 30;

function RoleSelectionScreen({
  roles,
  selectedRoles,
  onSelectRole,
  onContinue,
}: RoleSelectionScreenProps) {
  const allRolesSelected = selectedRoles.length === roles.length;
  const [hoveredRole, setHoveredRole] = useState<BrainRole | null>(null);
  const [focusedRole, setFocusedRole] = useState<BrainRole | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(ROLE_TIMER_SECONDS * 1000);
  const [countdownPulseTick, setCountdownPulseTick] = useState(0);
  const onContinueRef = useRef(onContinue);
  const previousSecondRef = useRef(ROLE_TIMER_SECONDS);
  const roleThemes: Record<
    BrainRole,
    {
      cardBackground: string;
      cardBorder: string;
      titleColor: string;
      descriptionColor: string;
      buttonBackground: string;
      buttonText: string;
      buttonBorder: string;
      selectedOutline: string;
      selectedTextColor: string;
      accentShadow: string;
      hoverGlow: string;
    }
  > = {
    amygdala: {
      cardBackground: "#fcf8f8",
      cardBorder: "rgba(199, 94, 107, 0.42)",
      titleColor: "#8e2f3d",
      descriptionColor: "#6d4a4f",
      buttonBackground: "#b24758",
      buttonText: "#ffffff",
      buttonBorder: "rgba(120, 35, 49, 0.2)",
      selectedOutline: "#9d3b4d",
      selectedTextColor: "#8e2f3d",
      accentShadow: "0 7px 18px rgba(155, 59, 77, 0.14)",
      hoverGlow: "0 0 0 3px rgba(178, 71, 88, 0.18), 0 10px 24px rgba(178, 71, 88, 0.2)",
    },
    prefrontalCortex: {
      cardBackground: "#f7f9fc",
      cardBorder: "rgba(94, 128, 181, 0.4)",
      titleColor: "#2f4f82",
      descriptionColor: "#495f7f",
      buttonBackground: "#3c5f94",
      buttonText: "#ffffff",
      buttonBorder: "rgba(37, 66, 108, 0.22)",
      selectedOutline: "#34578d",
      selectedTextColor: "#2f4f82",
      accentShadow: "0 7px 18px rgba(52, 87, 141, 0.14)",
      hoverGlow: "0 0 0 3px rgba(60, 95, 148, 0.16), 0 10px 24px rgba(60, 95, 148, 0.2)",
    },
    hippocampus: {
      cardBackground: "#fdfbf4",
      cardBorder: "rgba(192, 162, 82, 0.42)",
      titleColor: "#8d6f24",
      descriptionColor: "#6f613f",
      buttonBackground: "#b5953f",
      buttonText: "#ffffff",
      buttonBorder: "rgba(138, 109, 30, 0.22)",
      selectedOutline: "#9c7e2e",
      selectedTextColor: "#84671f",
      accentShadow: "0 7px 18px rgba(156, 126, 46, 0.14)",
      hoverGlow: "0 0 0 3px rgba(181, 149, 63, 0.16), 0 10px 24px rgba(181, 149, 63, 0.2)",
    },
  };

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    const endTime = Date.now() + ROLE_TIMER_SECONDS * 1000;

    const timerId = window.setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        window.clearInterval(timerId);
        onContinueRef.current();
      }
    }, 100);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const displayedSeconds = Math.ceil(timeLeftMs / 1000);

  useEffect(() => {
    if (displayedSeconds !== previousSecondRef.current) {
      if (displayedSeconds <= 5 && displayedSeconds > 0) {
        setCountdownPulseTick((value) => value + 1);
      }
      previousSecondRef.current = displayedSeconds;
    }
  }, [displayedSeconds]);

  const progressRatio = timeLeftMs / (ROLE_TIMER_SECONDS * 1000);
  const ringDegrees = Math.max(0, Math.min(360, progressRatio * 360));
  const isFinalCountdown = displayedSeconds <= 5 && displayedSeconds > 0;
  const finalCountdownStep = isFinalCountdown ? 6 - displayedSeconds : 0;
  const timerRingSize = 138 + finalCountdownStep * 10;
  const timeLabel = isFinalCountdown ? `${displayedSeconds}` : `${displayedSeconds}s`;

  return (
    <div style={styles.screen}>
      <div style={styles.content}>
        <div style={styles.topRow}>
          <div>
            <p style={styles.sectionLabel}>Role Lobby</p>
            <p style={styles.instructions}>Each player taps to select their role</p>
          </div>
          <div style={styles.timerShell}>
            <div
              key={countdownPulseTick}
              className={isFinalCountdown ? "role-selection-timer-ring-pulse" : ""}
              style={{
                ...styles.timerRing,
                width: `${timerRingSize}px`,
                height: `${timerRingSize}px`,
                background: `conic-gradient(from -90deg, #22d3ee 0deg, #38bdf8 ${ringDegrees}deg, rgba(56, 189, 248, 0.18) ${ringDegrees}deg 360deg)`,
              }}
            >
              <div style={styles.timer}>
                <span
                  key={timeLabel}
                  className={isFinalCountdown ? "role-selection-timer-number-pulse" : ""}
                >
                  {timeLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.cardContainer}>
          {roles.map((role) => {
            const isSelected = selectedRoles.includes(role.id);
            const theme = roleThemes[role.id];
            const isHovered = hoveredRole === role.id;
            const isFocused = focusedRole === role.id;

            return (
              <div
                key={role.id}
                className="role-selection-card-shell"
                style={{
                  width: "320px",
                  height: "232px",
                  animationDelay:
                    role.id === "amygdala" ? "0s" : role.id === "prefrontalCortex" ? "0.5s" : "1s",
                }}
              >
                <div
                  style={{
                    ...styles.card,
                    backgroundColor: theme.cardBackground,
                    border: `1px solid ${theme.cardBorder}`,
                    boxShadow: isHovered ? `${theme.accentShadow}, ${theme.hoverGlow}` : theme.accentShadow,
                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                    ...(isSelected ? { outline: `3px solid ${theme.selectedOutline}` } : {}),
                  }}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  <h2 style={{ ...styles.cardTitle, color: theme.titleColor }}>{role.name}</h2>
                  <p style={{ ...styles.cardDescription, color: theme.descriptionColor }}>{role.description}</p>

                  {isSelected ? (
                    <p style={{ ...styles.selectedText, color: theme.selectedTextColor }}>✓ Selected</p>
                  ) : (
                    <button
                      style={{
                        ...styles.smallButton,
                        backgroundColor: theme.buttonBackground,
                        color: theme.buttonText,
                        border: `1px solid ${theme.buttonBorder}`,
                        boxShadow: isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.22)" : "none",
                        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                      }}
                      onClick={() => onSelectRole(role.id)}
                      onFocus={() => setFocusedRole(role.id)}
                      onBlur={() => setFocusedRole((current) => (current === role.id ? null : current))}
                    >
                      I am {role.name === "Prefrontal Cortex" ? "PFC" : role.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allRolesSelected && (
          <button style={styles.button} onClick={onContinue}>
            Start
          </button>
        )}
      </div>
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
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "min(1160px, 100%)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.2rem",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  sectionLabel: {
    margin: 0,
    letterSpacing: "0.05em",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#155e75",
  },
  timerShell: {
    padding: "0.4rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.35)",
    background: "linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(45, 212, 191, 0.16))",
    boxShadow: "0 10px 24px rgba(79, 70, 229, 0.16)",
  },
  timerRing: {
    borderRadius: "50%",
    padding: "8px",
    boxShadow: "0 0 22px rgba(34, 211, 238, 0.4)",
    transition: "width 280ms ease, height 280ms ease",
  },
  timer: {
    alignSelf: "flex-end",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "4px solid rgba(147, 197, 253, 0.7)",
    background:
      "radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.7), rgba(147, 197, 253, 0.35) 70%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "1.45rem",
    color: "#1e3a8a",
    textShadow: "0 1px 8px rgba(255, 255, 255, 0.55)",
  },
  instructions: {
    fontSize: "1.2rem",
    fontWeight: 500,
    color: "#1f2937",
    margin: 0,
  },
  cardContainer: {
    display: "flex",
    gap: "1.5rem",
    justifyContent: "center",
    flexWrap: "nowrap" as const,
    alignItems: "stretch",
  },
  card: {
    borderRadius: "12px",
    padding: "1.5rem 1.5rem 1rem",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.8rem",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.25rem",
  },
  cardDescription: {
    margin: 0,
  },
  smallButton: {
    alignSelf: "center",
    marginTop: "auto",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 160ms ease, box-shadow 160ms ease",
  },
  selectedText: {
    margin: 0,
    marginTop: "auto",
    alignSelf: "center",
    fontWeight: 600,
  },
  button: {
    alignSelf: "center",
    padding: "0.8rem 1.5rem",
    borderRadius: "999px",
    border: "1px solid rgba(45, 212, 191, 0.4)",
    background: "linear-gradient(135deg, #0f766e, #0e7490)",
    color: "#f0fdfa",
    cursor: "pointer",
    fontWeight: 600,
    letterSpacing: "0.01em",
    boxShadow: "0 10px 20px rgba(14, 116, 144, 0.24)",
  },
};

export default RoleSelectionScreen;
