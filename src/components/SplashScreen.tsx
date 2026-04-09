import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import neuronSvg from "../assets/neuron.svg";
import "./SplashScreen.css";

interface SplashScreenProps {
  onComplete: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    const exitTimer = window.setTimeout(() => {
      onComplete();
    }, 420);

    return () => {
      window.clearTimeout(exitTimer);
    };
  }, [isClosing, onComplete]);

  const handleContinue = () => {
    setIsClosing(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setPointer({ x: clamp(x, -0.5, 0.5), y: clamp(y, -0.5, 0.5) });
  };

  const styleVars = useMemo(
    () =>
      ({
        "--splash-pointer-x": `${pointer.x * 18}px`,
        "--splash-pointer-y": `${pointer.y * 14}px`,
      }) as CSSProperties,
    [pointer],
  );

  return (
    <div
      className={`splash-screen${isClosing ? " splash-screen--closing" : ""}`}
      style={styleVars}
      onClick={handleContinue}
      onPointerMove={handlePointerMove}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleContinue();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Continue into Build a Brain"
    >
      <div className="splash-screen__backdrop" />
      <div className="splash-screen__wash" />

      <div className="splash-screen__blob splash-screen__blob--one" />
      <div className="splash-screen__blob splash-screen__blob--two" />
      <div className="splash-screen__blob splash-screen__blob--three" />

      <img className="splash-screen__neuron splash-screen__neuron--one" src={neuronSvg} alt="" aria-hidden="true" />
      <img className="splash-screen__neuron splash-screen__neuron--two" src={neuronSvg} alt="" aria-hidden="true" />
      <img className="splash-screen__neuron splash-screen__neuron--three" src={neuronSvg} alt="" aria-hidden="true" />
      <img className="splash-screen__neuron splash-screen__neuron--four" src={neuronSvg} alt="" aria-hidden="true" />
      <img className="splash-screen__neuron splash-screen__neuron--five" src={neuronSvg} alt="" aria-hidden="true" />
      <img className="splash-screen__neuron splash-screen__neuron--six" src={neuronSvg} alt="" aria-hidden="true" />
      <img className="splash-screen__neuron splash-screen__neuron--seven" src={neuronSvg} alt="" aria-hidden="true" />

      <div className="splash-screen__network" aria-hidden="true">
        <span className="splash-screen__line splash-screen__line--one" />
        <span className="splash-screen__line splash-screen__line--two" />
        <span className="splash-screen__node splash-screen__node--one" />
        <span className="splash-screen__node splash-screen__node--two" />
        <span className="splash-screen__sparkle splash-screen__sparkle--one" />
        <span className="splash-screen__sparkle splash-screen__sparkle--two" />
      </div>

      <div className="splash-screen__content">
        <div className="splash-screen__title-aura" aria-hidden="true">
          <span className="splash-screen__title-glow splash-screen__title-glow--one" />
          <span className="splash-screen__title-glow splash-screen__title-glow--two" />
          <span className="splash-screen__title-glow splash-screen__title-glow--three" />
        </div>
        <p className="splash-screen__eyebrow">Brain Balance Game</p>
        <h1 className="splash-screen__title" aria-label="Build a Brain">
          Build a Bra<span className="brain-i">i</span>n
        </h1>
        <p className="splash-screen__tagline">Train your brain. Make better choices.</p>
        <p className="splash-screen__hint">Tap anywhere to continue</p>
      </div>
    </div>
  );
}

export default SplashScreen;
