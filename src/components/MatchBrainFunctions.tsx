import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BrainRole } from "../types/game";

interface MatchBrainFunctionsProps {
  onComplete: () => void;
}

interface FunctionOption {
  id: string;
  label: string;
  role: BrainRole;
}

interface LinePoint {
  roleId: BrainRole;
  functionId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
}

const roleItems: Array<{ id: BrainRole; label: string }> = [
  { id: "amygdala", label: "Amygdala" },
  { id: "prefrontalCortex", label: "Prefrontal Cortex" },
  { id: "hippocampus", label: "Hippocampus" },
];

const functionItems: FunctionOption[] = [
  {
    id: "memory",
    label: "Memory and past experiences",
    role: "hippocampus",
  },
  {
    id: "thinking",
    label: "Thinking, planning, and control",
    role: "prefrontalCortex",
  },
  {
    id: "emotions",
    label: "Handles emotions and quick reactions",
    role: "amygdala",
  },
];

function MatchBrainFunctions({ onComplete }: MatchBrainFunctionsProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Partial<Record<BrainRole, HTMLButtonElement | null>>>({});
  const rightRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
  const matchFeedbackTimeoutRef = useRef<number | null>(null);
  const [isEntering, setIsEntering] = useState(true);
  const [selectedRole, setSelectedRole] = useState<BrainRole | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Partial<Record<BrainRole, string>>>({});
  const [linePoints, setLinePoints] = useState<LinePoint[]>([]);
  const [incorrectRole, setIncorrectRole] = useState<BrainRole | null>(null);
  const [incorrectFunctionId, setIncorrectFunctionId] = useState<string | null>(null);
  const [recentMatchedRole, setRecentMatchedRole] = useState<BrainRole | null>(null);
  const [recentMatchedFunctionId, setRecentMatchedFunctionId] = useState<string | null>(null);

  const allMatched = Object.keys(matchedPairs).length === roleItems.length;

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const boardRect = board.getBoundingClientRect();
    const nextLinePoints = roleItems.flatMap((roleItem) => {
      const matchedFunctionId = matchedPairs[roleItem.id];
      if (!matchedFunctionId) {
        return [];
      }

      const leftNode = leftRefs.current[roleItem.id];
      const rightNode = rightRefs.current[matchedFunctionId];
      if (!leftNode || !rightNode) {
        return [];
      }

      const leftRect = leftNode.getBoundingClientRect();
      const rightRect = rightNode.getBoundingClientRect();

      return [
        {
          roleId: roleItem.id,
          functionId: matchedFunctionId,
          x1: leftRect.right - boardRect.left,
          y1: leftRect.top + leftRect.height / 2 - boardRect.top,
          x2: rightRect.left - boardRect.left,
          y2: rightRect.top + rightRect.height / 2 - boardRect.top,
          length: Math.hypot(
            rightRect.left - leftRect.right,
            rightRect.top + rightRect.height / 2 - (leftRect.top + leftRect.height / 2),
          ),
        },
      ];
    });

    setLinePoints(nextLinePoints);
  }, [matchedPairs]);

  useEffect(() => {
    const enterTimer = window.setTimeout(() => {
      setIsEntering(false);
    }, 30);

    return () => {
      window.clearTimeout(enterTimer);
      if (matchFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(matchFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateLines = () => {
      const board = boardRef.current;
      if (!board) {
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const nextLinePoints = roleItems.flatMap((roleItem) => {
        const matchedFunctionId = matchedPairs[roleItem.id];
        if (!matchedFunctionId) {
          return [];
        }

        const leftNode = leftRefs.current[roleItem.id];
        const rightNode = rightRefs.current[matchedFunctionId];
        if (!leftNode || !rightNode) {
          return [];
        }

        const leftRect = leftNode.getBoundingClientRect();
        const rightRect = rightNode.getBoundingClientRect();

        return [
          {
            roleId: roleItem.id,
            functionId: matchedFunctionId,
            x1: leftRect.right - boardRect.left,
            y1: leftRect.top + leftRect.height / 2 - boardRect.top,
            x2: rightRect.left - boardRect.left,
            y2: rightRect.top + rightRect.height / 2 - boardRect.top,
            length: Math.hypot(
              rightRect.left - leftRect.right,
              rightRect.top + rightRect.height / 2 - (leftRect.top + leftRect.height / 2),
            ),
          },
        ];
      });

      setLinePoints(nextLinePoints);
    };

    updateLines();
    window.addEventListener("resize", updateLines);

    return () => {
      window.removeEventListener("resize", updateLines);
    };
  }, [matchedPairs]);

  const handleRoleSelect = (role: BrainRole) => {
    if (matchedPairs[role]) {
      return;
    }

    setSelectedRole(role);
  };

  const handleFunctionSelect = (option: FunctionOption) => {
    if (!selectedRole || Object.values(matchedPairs).includes(option.id)) {
      return;
    }

    if (option.role === selectedRole) {
      const matchedRole = selectedRole;
      // Lock a correct pair so it can no longer be selected and draw its connector.
      setMatchedPairs((current) => ({
        ...current,
        [matchedRole]: option.id,
      }));
      setRecentMatchedRole(matchedRole);
      setRecentMatchedFunctionId(option.id);
      if (matchFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(matchFeedbackTimeoutRef.current);
      }
      matchFeedbackTimeoutRef.current = window.setTimeout(() => {
        setRecentMatchedRole((current) => (current === matchedRole ? null : current));
        setRecentMatchedFunctionId((current) => (current === option.id ? null : current));
      }, 560);
      setSelectedRole(null);
      return;
    }

    // Briefly flag the incorrect pair without locking either side.
    setIncorrectRole(selectedRole);
    setIncorrectFunctionId(option.id);
    setSelectedRole(null);

    window.setTimeout(() => {
      setIncorrectRole((current) => (current === selectedRole ? null : current));
      setIncorrectFunctionId((current) => (current === option.id ? null : current));
    }, 420);
  };

  return (
    <div
      style={{
        ...styles.screen,
        ...(isEntering ? styles.screenEntering : null),
      }}
    >
      <div
        style={{
          ...styles.card,
          ...(isEntering ? styles.cardEntering : null),
        }}
      >
        <div style={styles.header}>
          <h1 style={styles.title}>Match each role to its function</h1>
          <p style={styles.description}>
            Tap a brain region on the left, then tap the matching function on the right.
          </p>
        </div>

        <div ref={boardRef} style={styles.board}>
          <svg aria-hidden="true" style={styles.linesLayer}>
            {linePoints.map((line, index) => (
              <line
                key={`${line.x1}-${line.y1}-${index}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                style={{
                  ...styles.line,
                  ...(recentMatchedRole === line.roleId && recentMatchedFunctionId === line.functionId
                    ? {
                        "--line-length": line.length,
                        strokeDasharray: `${line.length} ${line.length}`,
                        strokeDashoffset: line.length,
                        animation: "matchLineDraw 340ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
                      }
                    : null),
                }}
              />
            ))}
          </svg>

          <div style={styles.column}>
            <p style={styles.columnLabel}>Brain Regions</p>
            {roleItems.map((roleItem) => {
              const isMatched = Boolean(matchedPairs[roleItem.id]);
              const isSelected = selectedRole === roleItem.id;
              const isIncorrect = incorrectRole === roleItem.id;
              const isRecentlyMatched = recentMatchedRole === roleItem.id;

              return (
                <button
                  key={roleItem.id}
                  ref={(node) => {
                    leftRefs.current[roleItem.id] = node;
                  }}
                  type="button"
                  onClick={() => handleRoleSelect(roleItem.id)}
                  disabled={isMatched}
                  style={{
                    ...styles.itemCard,
                    ...(isSelected ? styles.selectedCard : {}),
                    ...(isMatched ? styles.matchedCard : {}),
                    ...(isIncorrect ? styles.incorrectCard : {}),
                    animation: isIncorrect
                      ? "meterShake 280ms ease"
                      : isRecentlyMatched
                        ? "matchCardSuccessPop 420ms cubic-bezier(0.22, 1, 0.36, 1), matchGlowPulse 520ms ease-out"
                        : "none",
                    cursor: isMatched ? "default" : "pointer",
                  }}
                >
                  <span style={styles.itemTitle}>{roleItem.label}</span>
                  {isMatched && (
                    <span
                      style={{
                        ...styles.checkmark,
                        animation: isRecentlyMatched ? "matchCheckPop 300ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={styles.column}>
            <p style={styles.columnLabel}>Functions</p>
            {functionItems.map((option) => {
              const isMatched = Object.values(matchedPairs).includes(option.id);
              const isIncorrect = incorrectFunctionId === option.id;
              const isRecentlyMatched = recentMatchedFunctionId === option.id;

              return (
                <button
                  key={option.id}
                  ref={(node) => {
                    rightRefs.current[option.id] = node;
                  }}
                  type="button"
                  onClick={() => handleFunctionSelect(option)}
                  disabled={isMatched}
                  style={{
                    ...styles.itemCard,
                    ...(isMatched ? styles.matchedCard : {}),
                    ...(isIncorrect ? styles.incorrectCard : {}),
                    ...(selectedRole && !isMatched ? styles.selectableCard : {}),
                    animation: isIncorrect
                      ? "meterShake 280ms ease"
                      : isRecentlyMatched
                        ? "matchCardSuccessPop 420ms cubic-bezier(0.22, 1, 0.36, 1), matchGlowPulse 520ms ease-out"
                        : "none",
                    cursor: isMatched ? "default" : selectedRole ? "pointer" : "not-allowed",
                    opacity: !selectedRole && !isMatched ? 0.82 : 1,
                  }}
                >
                  <span style={styles.itemTitle}>{option.label}</span>
                  {isMatched && (
                    <span
                      style={{
                        ...styles.checkmark,
                        animation: isRecentlyMatched ? "matchCheckPop 300ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="app-primary-button"
          style={{
            ...styles.button,
            opacity: allMatched ? 1 : 0.5,
            cursor: allMatched ? "pointer" : "not-allowed",
          }}
          disabled={!allMatched}
          onClick={onComplete}
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
    padding: "clamp(0.75rem, 1.8vh, 1.25rem)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 460ms ease, transform 460ms cubic-bezier(0.22, 1, 0.36, 1)",
  },
  screenEntering: {
    opacity: 0,
    transform: "scale(0.988)",
  },
  card: {
    width: "min(980px, 100%)",
    padding: "clamp(1rem, 2vh, 1.4rem) clamp(1rem, 2.4vw, 1.6rem)",
    borderRadius: "28px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(241, 245, 249, 0.68) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    boxShadow: "0 14px 36px rgba(15, 23, 42, 0.07)",
    backdropFilter: "blur(12px)",
    transition: "opacity 460ms ease, transform 460ms cubic-bezier(0.22, 1, 0.36, 1), filter 460ms ease",
  },
  cardEntering: {
    opacity: 0,
    transform: "scale(0.988)",
    filter: "blur(4px)",
  },
  header: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    maxWidth: "640px",
    margin: "0 auto",
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.7rem, 3vw, 2.35rem)",
    lineHeight: 1.1,
    color: "#0f172a",
  },
  description: {
    margin: 0,
    fontSize: "0.93rem",
    lineHeight: 1.35,
    color: "#475569",
  },
  board: {
    position: "relative" as const,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "clamp(2.5rem, 7vw, 5rem)",
    padding: "1.1rem 0.3rem 0",
    alignItems: "start",
  },
  linesLayer: {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    overflow: "visible" as const,
  },
  line: {
    stroke: "#38bdf8",
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    opacity: 0.92,
    filter: "drop-shadow(0 0 6px rgba(56, 189, 248, 0.22))",
    strokeDasharray: "10 0",
    transition: "filter 220ms ease, opacity 220ms ease",
  },
  column: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    zIndex: 1,
  },
  columnLabel: {
    margin: 0,
    fontSize: "0.86rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#0f766e",
    textAlign: "center" as const,
  },
  itemCard: {
    minHeight: "88px",
    padding: "0.95rem 1rem",
    borderRadius: "20px",
    border: "1px solid rgba(226, 232, 240, 0.92)",
    background: "rgba(255, 255, 255, 0.76)",
    color: "#0f172a",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.8rem",
    textAlign: "left" as const,
    transition: "transform 140ms ease, box-shadow 140ms ease, opacity 160ms ease, background 160ms ease",
  },
  selectedCard: {
    background: "rgba(224, 242, 254, 0.92)",
    border: "1px solid rgba(56, 189, 248, 0.58)",
    boxShadow: "0 0 0 3px rgba(186, 230, 253, 0.6), 0 12px 24px rgba(14, 165, 233, 0.14)",
    transform: "translateY(-1px) scale(1.02)",
  },
  selectableCard: {
    boxShadow: "0 10px 22px rgba(14, 165, 233, 0.08)",
  },
  matchedCard: {
    background: "rgba(236, 253, 245, 0.86)",
    color: "#166534",
    opacity: 0.74,
    boxShadow: "0 10px 24px rgba(34, 197, 94, 0.1)",
  },
  incorrectCard: {
    background: "rgba(254, 242, 242, 0.92)",
    boxShadow: "0 8px 18px rgba(239, 68, 68, 0.08)",
  },
  itemTitle: {
    fontSize: "0.98rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  checkmark: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "#16a34a",
    flexShrink: 0,
    transformOrigin: "center",
  },
  button: {
    alignSelf: "center" as const,
    padding: "0.78rem 1.45rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    color: "#fff",
    fontSize: "0.96rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
};

export default MatchBrainFunctions;
