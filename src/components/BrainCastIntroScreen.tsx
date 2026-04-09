import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import amyIntroAudio from "../assets/audio/amy-intro.mp3";
import hippoIntroAudio from "../assets/audio/hippo-intro.mp3";
import pfcIntroAudio from "../assets/audio/pfc-intro.mp3";
import pfcTransitionAudio from "../assets/audio/pfc-transition.mp3";
import hippoIdleAnimation from "../assets/lottie/hippo_idle.json";
import hippoTalkingAnimation from "../assets/lottie/hippo_talking.json";
import mygIdleAnimation from "../assets/lottie/myg_idle.json";
import mygTalkingAnimation from "../assets/lottie/myg_talking.json";
import pfcIdleAnimation from "../assets/lottie/pfc_idle.json";
import pfcTalkingAnimation from "../assets/lottie/pfc_talking.json";

interface BrainCastIntroScreenProps {
  onComplete: () => void;
}

type CharacterId = "amygdala" | "prefrontalCortex" | "hippocampus";

interface IntroStep {
  id: string;
  character: CharacterId;
  caption: string;
  audioSrc: string;
  idleBeforeMs: number;
  idleAfterMs: number;
}

const INTRO_STEPS: IntroStep[] = [
  {
    id: "amygdala-intro",
    character: "amygdala",
    caption: "Hi. I'm the Amygdala. I handle emotions and quick reactions... so yeah, I move fast.",
    audioSrc: amyIntroAudio,
    idleBeforeMs: 650,
    idleAfterMs: 450,
  },
  {
    id: "pfc-intro",
    character: "prefrontalCortex",
    caption: "I'm the Prefrontal Cortex - you can call me PFC. I help you think, plan, and stay in control.",
    audioSrc: pfcIntroAudio,
    idleBeforeMs: 650,
    idleAfterMs: 450,
  },
  {
    id: "hippocampus-intro",
    character: "hippocampus",
    caption: "Hi! I'm the Hippocampus. I store memories and past experiences... the stuff that helps you learn.",
    audioSrc: hippoIntroAudio,
    idleBeforeMs: 650,
    idleAfterMs: 450,
  },
  {
    id: "pfc-transition",
    character: "prefrontalCortex",
    caption: "Now that you've met us... let's see if you know where we belong.",
    audioSrc: pfcTransitionAudio,
    idleBeforeMs: 400,
    idleAfterMs: 280,
  },
];

const OUTRO_TRANSITION_MS = 440;
const INTRO_ENTER_MS = 760;
const FOCUS_TRANSITION_MS = 520;
const CHARACTER_MOTION_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const CHARACTER_OUTRO_EASING = "cubic-bezier(0.22, 0.86, 0.3, 1)";
const CHARACTER_STAGE_POSITIONS: Record<CharacterId, { left: string; top: string }> = {
  amygdala: { left: "18%", top: "52%" },
  prefrontalCortex: { left: "50%", top: "48%" },
  hippocampus: { left: "82%", top: "52%" },
};

const CHARACTER_ENTRY_POSITIONS: Record<CharacterId, { left: string; top: string; scale: number; opacity: number }> = {
  amygdala: { left: "-14%", top: "54%", scale: 0.92, opacity: 0 },
  prefrontalCortex: { left: "50%", top: "-18%", scale: 0.9, opacity: 0 },
  hippocampus: { left: "116%", top: "54%", scale: 0.92, opacity: 0 },
};

const CHARACTER_OUTRO_POSITIONS: Record<CharacterId, { left: string; top: string; scale: number }> = {
  amygdala: { left: "18%", top: "78%", scale: 0.42 },
  prefrontalCortex: { left: "50%", top: "78%", scale: 0.42 },
  hippocampus: { left: "82%", top: "78%", scale: 0.42 },
};

const characterContent: Record<
  CharacterId,
  {
    name: string;
    idleAnimation: object;
    talkingAnimation: object;
    glow: string;
    trayGlow: string;
    captionAccent: string;
  }
> = {
  amygdala: {
    name: "Amygdala",
    idleAnimation: mygIdleAnimation,
    talkingAnimation: mygTalkingAnimation,
    glow: "rgba(248, 113, 113, 0.26)",
    trayGlow: "rgba(239, 68, 68, 0.24)",
    captionAccent: "#b91c1c",
  },
  prefrontalCortex: {
    name: "Prefrontal Cortex",
    idleAnimation: pfcIdleAnimation,
    talkingAnimation: pfcTalkingAnimation,
    glow: "rgba(96, 165, 250, 0.26)",
    trayGlow: "rgba(59, 130, 246, 0.2)",
    captionAccent: "#1d4ed8",
  },
  hippocampus: {
    name: "Hippocampus",
    idleAnimation: hippoIdleAnimation,
    talkingAnimation: hippoTalkingAnimation,
    glow: "rgba(250, 204, 21, 0.28)",
    trayGlow: "rgba(234, 179, 8, 0.22)",
    captionAccent: "#a16207",
  },
};

function BrainCastIntroScreen({ onComplete }: BrainCastIntroScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [introducedCharacters, setIntroducedCharacters] = useState<CharacterId[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeStep = INTRO_STEPS[stepIndex];
  const activeCharacter = characterContent[activeStep.character];

  const triggerNextStep = () => {
    if (stepIndex === INTRO_STEPS.length - 1) {
      setIsTransitioning(true);
      completionTimeoutRef.current = window.setTimeout(() => {
        onComplete();
      }, OUTRO_TRANSITION_MS);
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const clearCurrentAudio = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audioRef.current = null;
  };

  const clearCurrentTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const clearCompletionTimeout = () => {
    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  };

  const startSequence = () => {
    setAutoplayBlocked(false);
    setHasStarted(true);
    setStepIndex(0);
    setIsTalking(false);
    setIsTransitioning(false);
    setIntroducedCharacters([]);
  };

  useEffect(() => {
    startSequence();

    return () => {
      clearCurrentTimeout();
      clearCompletionTimeout();
      clearCurrentAudio();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted || isTransitioning) {
      return;
    }

    clearCurrentTimeout();
    clearCurrentAudio();
    setIsTalking(false);
    setIntroducedCharacters((current) => (
      current.includes(activeStep.character) ? current : [...current, activeStep.character]
    ));

    timeoutRef.current = window.setTimeout(() => {
      const audio = new Audio(activeStep.audioSrc);
      audio.preload = "auto";
      audioRef.current = audio;
      setIsTalking(true);
      let hasAdvanced = false;

      const handleEnded = () => {
        if (hasAdvanced) {
          return;
        }
        hasAdvanced = true;
        setIsTalking(false);
        audioRef.current = null;

        timeoutRef.current = window.setTimeout(() => {
          triggerNextStep();
        }, activeStep.idleAfterMs);
      };

      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener(
        "loadedmetadata",
        () => {
          if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
            return;
          }

          // Backup handoff in case an ended event is missed; keeps the intro from stalling after the final line.
          const fallbackDelay = Math.ceil(audio.duration * 1000) + 120;
          window.setTimeout(() => {
            if (!hasAdvanced && audioRef.current === audio) {
              handleEnded();
            }
          }, fallbackDelay);
        },
        { once: true },
      );

      void audio.play().catch(() => {
        setAutoplayBlocked(true);
        setIsTalking(false);
        clearCurrentAudio();
      });
    }, activeStep.idleBeforeMs);

    return () => {
      clearCurrentTimeout();
      clearCurrentAudio();
    };
  }, [activeStep, hasStarted, isTransitioning, onComplete, stepIndex]);

  const renderCharacter = (characterId: CharacterId) => {
    const content = characterContent[characterId];
    const isFocused = activeStep.character === characterId;
    const hasEntered = introducedCharacters.includes(characterId);
    const animationData =
      isFocused && isTalking
        ? content.talkingAnimation
        : content.idleAnimation;
    const stagePosition = CHARACTER_STAGE_POSITIONS[characterId];
    const entryPosition = CHARACTER_ENTRY_POSITIONS[characterId];
    const outroPosition = CHARACTER_OUTRO_POSITIONS[characterId];

    return (
      <div
        key={`${characterId}-${isFocused ? activeStep.id : "idle"}-${isTransitioning ? "outro" : "stage"}`}
        style={{
          ...styles.characterShell,
          transition: isTransitioning
            ? `left ${OUTRO_TRANSITION_MS}ms ${CHARACTER_OUTRO_EASING}, top ${OUTRO_TRANSITION_MS}ms ${CHARACTER_OUTRO_EASING}, transform ${OUTRO_TRANSITION_MS}ms ${CHARACTER_OUTRO_EASING}, opacity ${OUTRO_TRANSITION_MS}ms ease-out, filter ${FOCUS_TRANSITION_MS}ms ease`
            : styles.characterShell.transition,
          left: isTransitioning
            ? outroPosition.left
            : hasEntered
              ? stagePosition.left
              : entryPosition.left,
          top: isTransitioning
            ? outroPosition.top
            : hasEntered
              ? stagePosition.top
              : entryPosition.top,
          ...(isFocused ? styles.characterShellFocused : styles.characterShellIdle),
          ...(isTransitioning
            ? {
                transform: `translate(-50%, -50%) scale(${outroPosition.scale})`,
                opacity: 0.16,
              }
            : {
                transform: hasEntered
                  ? isFocused
                    ? "translate(-50%, -50%) scale(1.04)"
                    : "translate(-50%, -50%) scale(0.92)"
                  : `translate(-50%, -50%) scale(${entryPosition.scale})`,
                opacity: hasEntered ? (isFocused ? 1 : 0.62) : entryPosition.opacity,
              }),
        }}
      >
        <div
          aria-hidden="true"
          style={{
            ...styles.characterGlow,
            background: `radial-gradient(ellipse at center, ${content.glow} 0%, rgba(255,255,255,0) 72%)`,
            opacity: isTransitioning || !hasEntered ? 0 : isFocused ? 0.78 : 0.24,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            ...styles.characterShadow,
            background: `radial-gradient(ellipse at center, ${content.trayGlow} 0%, rgba(255,255,255,0) 74%)`,
            opacity: isTransitioning || !hasEntered ? 0 : isFocused ? 0.72 : 0.32,
          }}
        />
        <div style={styles.characterFrame}>
          <Lottie animationData={animationData} loop autoplay style={styles.characterAnimation} />
        </div>
      </div>
    );
  };

  return (
    <div style={styles.screen}>
      <div
        style={{
          ...styles.card,
          ...(isTransitioning ? styles.cardTransitioning : {}),
        }}
      >
        <div style={styles.header}>
          <p style={styles.eyebrow}>Meet the team</p>
          <h1 style={styles.title}>Before you build the brain</h1>
        </div>

        <div
          style={{
            ...styles.stage,
            ...(isTransitioning ? styles.stageTransitioning : {}),
          }}
        >
          {renderCharacter("amygdala")}
          {renderCharacter("prefrontalCortex")}
          {renderCharacter("hippocampus")}
        </div>

        <div
          style={{
            ...styles.captionCard,
            ...(isTransitioning ? styles.captionCardTransitioning : {}),
          }}
        >
          <p style={{ ...styles.captionName, color: activeCharacter.captionAccent }}>{activeCharacter.name}</p>
          <p style={styles.captionText}>{activeStep.caption}</p>
        </div>

        {autoplayBlocked && (
          <button
            type="button"
            className="app-primary-button"
            style={styles.button}
            onClick={startSequence}
          >
            Play intro
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
    padding: "clamp(0.75rem, 1.8vh, 1.25rem)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "min(980px, 100%)",
    minHeight: "min(720px, calc(100vh - 1.5rem))",
    padding: "clamp(1rem, 2.2vh, 1.5rem) clamp(1rem, 2.5vw, 1.8rem)",
    borderRadius: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(240, 249, 255, 0.72) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(14px)",
    overflow: "hidden" as const,
    transition: `opacity ${OUTRO_TRANSITION_MS}ms ease, filter ${OUTRO_TRANSITION_MS}ms ease, transform ${OUTRO_TRANSITION_MS}ms ease`,
  },
  cardTransitioning: {
    opacity: 0.94,
    filter: "blur(4px)",
    transform: "scale(0.992)",
  },
  header: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  eyebrow: {
    margin: 0,
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#0369a1",
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
    lineHeight: 1.05,
    color: "#0f172a",
  },
  stage: {
    position: "relative" as const,
    width: "100%",
    minHeight: "420px",
    flex: 1,
    overflow: "hidden" as const,
    transition: `opacity ${OUTRO_TRANSITION_MS}ms ease, filter ${OUTRO_TRANSITION_MS}ms ease`,
  },
  stageTransitioning: {
    opacity: 0.92,
    filter: "blur(2px)",
  },
  characterShell: {
    position: "absolute" as const,
    width: "min(300px, 28vw)",
    height: "min(300px, 28vw)",
    transform: "translate(-50%, -50%) scale(1)",
    transition:
      `left ${INTRO_ENTER_MS}ms ${CHARACTER_MOTION_EASING}, ` +
      `top ${INTRO_ENTER_MS}ms ${CHARACTER_MOTION_EASING}, ` +
      `transform ${FOCUS_TRANSITION_MS}ms ${CHARACTER_MOTION_EASING}, ` +
      `opacity ${FOCUS_TRANSITION_MS}ms ease, ` +
      `filter ${FOCUS_TRANSITION_MS}ms ease`,
  },
  characterShellFocused: {
    filter: "brightness(1.04) saturate(1.06)",
  },
  characterShellIdle: {
    filter: "saturate(0.78) brightness(0.9)",
  },
  characterGlow: {
    position: "absolute" as const,
    left: "22%",
    right: "22%",
    bottom: "12%",
    height: "10%",
    filter: "blur(8px)",
    pointerEvents: "none" as const,
  },
  characterShadow: {
    position: "absolute" as const,
    left: "20%",
    right: "20%",
    bottom: "8%",
    height: "8%",
    filter: "blur(12px)",
    pointerEvents: "none" as const,
  },
  characterFrame: {
    position: "relative" as const,
    width: "100%",
    height: "100%",
    animation: "floatingOrb 3.6s ease-in-out infinite",
  },
  characterAnimation: {
    width: "100%",
    height: "100%",
  },
  captionCard: {
    width: "min(760px, 100%)",
    padding: "1rem 1.1rem",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(226, 232, 240, 0.85)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    textAlign: "center" as const,
    transition: `opacity ${OUTRO_TRANSITION_MS}ms ease, transform ${OUTRO_TRANSITION_MS}ms ease`,
  },
  captionCardTransitioning: {
    opacity: 0.74,
    transform: "translateY(8px) scale(0.985)",
  },
  captionName: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  captionText: {
    margin: "0.35rem 0 0",
    fontSize: "1rem",
    lineHeight: 1.5,
    color: "#334155",
  },
  button: {
    padding: "0.82rem 1.45rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    color: "#fff",
    fontSize: "0.96rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
};

export default BrainCastIntroScreen;
