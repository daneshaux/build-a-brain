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
  volume?: number;
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
    volume: 0.7,
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
    volume: 0.7,
    idleBeforeMs: 400,
    idleAfterMs: 280,
  },
];

const OUTRO_TRANSITION_MS = 440;
const INTRO_ENTER_MS = 900;
const FOCUS_TRANSITION_MS = 560;
const CHARACTER_MOTION_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const CHARACTER_OUTRO_EASING = "cubic-bezier(0.22, 0.86, 0.3, 1)";
const CHARACTER_STAGE_POSITIONS: Record<CharacterId, { left: string; top: string }> = {
  amygdala: { left: "18%", top: "52%" },
  prefrontalCortex: { left: "50%", top: "48%" },
  hippocampus: { left: "82%", top: "52%" },
};

const CHARACTER_ENTRY_POSITIONS: Record<CharacterId, { left: string; top: string; scale: number; opacity: number }> = {
  amygdala: { left: "-10%", top: "54%", scale: 0.9, opacity: 0.04 },
  prefrontalCortex: { left: "50%", top: "-12%", scale: 0.88, opacity: 0.04 },
  hippocampus: { left: "110%", top: "54%", scale: 0.9, opacity: 0.04 },
};

const CHARACTER_OUTRO_POSITIONS: Record<CharacterId, { left: string; top: string; scale: number }> = {
  amygdala: { left: "18%", top: "82%", scale: 0.5 },
  prefrontalCortex: { left: "50%", top: "82%", scale: 0.5 },
  hippocampus: { left: "82%", top: "82%", scale: 0.5 },
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
    captionGlow: string;
    captionBorder: string;
  }
> = {
  amygdala: {
    name: "Amygdala",
    idleAnimation: mygIdleAnimation,
    talkingAnimation: mygTalkingAnimation,
    glow: "rgba(248, 113, 113, 0.26)",
    trayGlow: "rgba(239, 68, 68, 0.24)",
    captionAccent: "#b91c1c",
    captionGlow: "rgba(248, 113, 113, 0.18)",
    captionBorder: "rgba(248, 113, 113, 0.36)",
  },
  prefrontalCortex: {
    name: "Prefrontal Cortex",
    idleAnimation: pfcIdleAnimation,
    talkingAnimation: pfcTalkingAnimation,
    glow: "rgba(96, 165, 250, 0.26)",
    trayGlow: "rgba(59, 130, 246, 0.2)",
    captionAccent: "#1d4ed8",
    captionGlow: "rgba(96, 165, 250, 0.18)",
    captionBorder: "rgba(96, 165, 250, 0.34)",
  },
  hippocampus: {
    name: "Hippocampus",
    idleAnimation: hippoIdleAnimation,
    talkingAnimation: hippoTalkingAnimation,
    glow: "rgba(250, 204, 21, 0.28)",
    trayGlow: "rgba(234, 179, 8, 0.22)",
    captionAccent: "#a16207",
    captionGlow: "rgba(250, 204, 21, 0.18)",
    captionBorder: "rgba(250, 204, 21, 0.34)",
  },
};

function BrainCastIntroScreen({ onComplete }: BrainCastIntroScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [introducedCharacters, setIntroducedCharacters] = useState<CharacterId[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);

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
    setIsMuted(false);
    mutedRef.current = false;
    setIsPlaying(false);
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
      audio.volume = activeStep.volume ?? 1;
      audio.muted = mutedRef.current;
      audioRef.current = audio;
      setIsTalking(true);
      let hasAdvanced = false;

      const handleEnded = () => {
        if (hasAdvanced) {
          return;
        }
        hasAdvanced = true;
        setIsTalking(false);
        setIsPlaying(false);
        audioRef.current = null;

        timeoutRef.current = window.setTimeout(() => {
          triggerNextStep();
        }, activeStep.idleAfterMs);
      };

      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("play", () => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }, { once: true });
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
        setIsPlaying(false);
        clearCurrentAudio();
      });
    }, activeStep.idleBeforeMs);

    return () => {
      clearCurrentTimeout();
      clearCurrentAudio();
    };
  }, [activeStep, hasStarted, isTransitioning, onComplete, stepIndex]);

  const handleAudioControl = async () => {
    const audio = audioRef.current;

    if (!isPlaying || autoplayBlocked || !audio) {
      startSequence();
      return;
    }

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    mutedRef.current = nextMuted;
    setIsMuted(nextMuted);
  };

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
                opacity: 0.08,
                filter: "blur(5px) brightness(0.92)",
              }
            : {
                transform: hasEntered
                  ? isFocused
                    ? "translate(-50%, -50%) scale(1.055)"
                    : "translate(-50%, -50%) scale(0.92)"
                  : `translate(-50%, -50%) scale(${entryPosition.scale})`,
                opacity: hasEntered ? (isFocused ? 1 : 0.6) : entryPosition.opacity,
                filter: hasEntered
                  ? undefined
                  : "blur(10px) saturate(0.92) brightness(0.98)",
              }),
        }}
      >
        <div
          aria-hidden="true"
          style={{
            ...styles.characterGlow,
            background: `radial-gradient(ellipse at center, ${content.glow} 0%, rgba(255,255,255,0) 72%)`,
            opacity: isTransitioning || !hasEntered ? 0 : isFocused ? (isTalking ? 0.9 : 0.76) : 0.2,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            ...styles.characterShadow,
            background: `radial-gradient(ellipse at center, ${content.trayGlow} 0%, rgba(255,255,255,0) 74%)`,
            opacity: isTransitioning || !hasEntered ? 0 : isFocused ? 0.76 : 0.3,
          }}
        />
        <div
          style={{
            ...styles.characterFrame,
            ...(isFocused ? styles.characterFrameFocused : styles.characterFrameIdle),
            ...(isTransitioning ? styles.characterFrameTransitioning : null),
          }}
        >
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
        <div style={styles.controlRow}>
          <button
            type="button"
            onClick={handleAudioControl}
            aria-label={autoplayBlocked || !isPlaying ? "Play brain team audio" : isMuted ? "Unmute brain team audio" : "Mute brain team audio"}
            style={styles.audioControl}
          >
            {autoplayBlocked || !isPlaying ? "Play audio" : isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Meet the Brain Team</h1>
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
            borderTopColor: activeCharacter.captionBorder,
            boxShadow: `0 10px 24px rgba(15, 23, 42, 0.05), 0 0 0 1px ${activeCharacter.captionGlow}, 0 0 24px ${activeCharacter.captionGlow}`,
            ...(isTransitioning ? styles.captionCardTransitioning : {}),
          }}
        >
          <div key={activeStep.id} style={styles.captionContent}>
            <p style={{ ...styles.captionName, color: activeCharacter.captionAccent }}>{activeCharacter.name}</p>
            <p style={styles.captionText}>{activeStep.caption}</p>
          </div>
        </div>
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
    width: "min(960px, 100%)",
    minHeight: "min(650px, calc(100vh - 4rem))",
    padding: "clamp(1.5rem, 2.8vh, 2rem) clamp(1.5rem, 2.8vw, 2rem)",
    borderRadius: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
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
  controlRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "-0.2rem",
  },
  audioControl: {
    padding: "0.55rem 0.9rem",
    borderRadius: "999px",
    border: "1px solid rgba(96, 165, 250, 0.28)",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.84), rgba(224, 242, 254, 0.72))",
    color: "#1d4f78",
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    boxShadow: "0 10px 24px rgba(56, 189, 248, 0.12)",
    backdropFilter: "blur(12px)",
  },
  header: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
    marginBottom: "0.05rem",
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
    minHeight: "350px",
    flex: 1,
    overflow: "hidden" as const,
    transition: `opacity ${OUTRO_TRANSITION_MS}ms ease, filter ${OUTRO_TRANSITION_MS}ms ease`,
  },
  stageTransitioning: {
    opacity: 0.9,
    filter: "blur(3px)",
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
    filter: "brightness(1.08) saturate(1.08)",
  },
  characterShellIdle: {
    filter: "saturate(0.78) brightness(0.88)",
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
  characterFrameFocused: {
    animation: "floatingOrb 3.2s ease-in-out infinite, introCharacterFocusPulse 2.8s ease-in-out infinite",
  },
  characterFrameIdle: {
    animation: "floatingOrb 3.8s ease-in-out infinite",
  },
  characterFrameTransitioning: {
    animation: "none",
  },
  characterAnimation: {
    width: "100%",
    height: "100%",
  },
  captionCard: {
    width: "min(760px, 100%)",
    padding: "1rem 1.1rem",
    marginTop: "-1rem",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(226, 232, 240, 0.85)",
    borderTopWidth: "3px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    textAlign: "center" as const,
    transition:
      `opacity ${OUTRO_TRANSITION_MS}ms ease, ` +
      `transform ${OUTRO_TRANSITION_MS}ms ease, ` +
      `box-shadow ${FOCUS_TRANSITION_MS}ms ease, ` +
      `border-top-color ${FOCUS_TRANSITION_MS}ms ease`,
  },
  captionCardTransitioning: {
    opacity: 0.68,
    transform: "translateY(12px) scale(0.982)",
    filter: "blur(2px)",
  },
  captionContent: {
    animation: "introDialogueReveal 380ms cubic-bezier(0.22, 1, 0.36, 1)",
    maxWidth: "640px",
    width: "100%",
    margin: "0 auto",
    textAlign: "center" as const,
  },
  captionName: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
  },
  captionText: {
    margin: "0.35rem 0 0",
    fontSize: "0.96rem",
    lineHeight: 1.5,
    color: "#334155",
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
  },
};

export default BrainCastIntroScreen;
