import { useEffect, useRef, useState } from "react";

export type BalanceMeterState = "balanced" | "partial" | "dysregulated";

interface BrainBalanceMeterProps {
  state: BalanceMeterState;
}

const fillByState: Record<BalanceMeterState, number> = {
  balanced: 100,
  partial: 56,
  dysregulated: 24,
};

function BrainBalanceMeter({ state }: BrainBalanceMeterProps) {
  const [isShaking, setIsShaking] = useState(false);
  const previousState = useRef<BalanceMeterState | null>(null);

  useEffect(() => {
    if (state === "dysregulated" && previousState.current !== "dysregulated") {
      setIsShaking(true);
      const timerId = window.setTimeout(() => setIsShaking(false), 360);
      previousState.current = state;
      return () => window.clearTimeout(timerId);
    }

    previousState.current = state;
    return undefined;
  }, [state]);

  return (
    <div
      className={`brain-balance-meter ${isShaking ? "is-shaking" : ""}`}
      aria-label={`Regulation meter: ${state}`}
      role="img"
    >
      <div className="brain-balance-meter__track">
        <div
          className={`brain-balance-meter__fill brain-balance-meter__fill--${state}`}
          style={{ width: `${fillByState[state]}%` }}
        />
      </div>
    </div>
  );
}

export default BrainBalanceMeter;
