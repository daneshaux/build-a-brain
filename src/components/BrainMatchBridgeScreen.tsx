import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import amyMatchAudio from "../assets/audio/amy-match.mp3";
import hippoIdleAnimation from "../assets/lottie/hippo_idle.json";
import mygIdleAnimation from "../assets/lottie/myg_idle.json";
import mygTalkingAnimation from "../assets/lottie/myg_talking.json";
import pfcIdleAnimation from "../assets/lottie/pfc_idle.json";
import {
  clearBrainMatchBridgeAudio,
  consumeBrainMatchBridgeAudio,
  retainBrainMatchBridgeAudio,
} from "../utils/brainMatchBridgeAudio";

interface BrainMatchBridgeScreenProps {
  onComplete: () => void;
}

type CharacterId = "amygdala" | "prefrontalCortex" | "hippocampus";

const BRIDGE_PAUSE_MS = 240;
const BRIDGE_START_DELAY_MS = 1000;
const BRIDGE_POST_LINE_DELAY_MS = 600;
const BRIDGE_EXIT_TRANSITION_MS = 420;

const characters: Record<
  CharacterId,
  {
    name: string;
    idleAnimation: object;
    talkingAnimation?: object;
    left: string;
    top: string;
    glow: string;
    shadow: string;
    accent: string;
  }
> = {
  amygdala: {
    name: "Amygdala",
    idleAnimation: mygIdleAnimation,
    talkingAnimation: mygTalkingAnimation,
    left: "18%",
    top: "52%",
    glow: "rgba(248, 113, 113, 0.24)",
    shadow: "rgba(239, 68, 68, 0.18)",
    accent: "#b91c1c",
  },
  prefrontalCortex: {
    name: "Prefrontal Cortex",
    idleAnimation: pfcIdleAnimation,
    left: "50%",
    top: "48%",
    glow: "rgba(96, 165, 250, 0.22)",
    shadow: "rgba(59, 130, 246, 0.16)",
    accent: "#1d4ed8",
  },
  hippocampus: {
    name: "Hippocampus",
    idleAnimation: hippoIdleAnimation,
    left: "82%",
    top: "52%",
    glow: "rgba(250, 204, 21, 0.22)",
    shadow: "rgba(234, 179, 8, 0.16)",
    accent: "#a16207",
  },
};

const AMY_MATCH_CAPTION = "I guess that was pretty good. But let's test your memory...do you remember what we do?";

function BrainMatchBridgeScreen({ onComplete }: BrainMatchBridgeScreenProps) {
  const [isAmyTalking, setIsAmyTalking] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const endedHandlerRef = useRef<(() => void) | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const detachEndedHandler = () => {
    const audio = audioRef.current;
    const handler = endedHandlerRef.current;
    if (!audio || !handler) {
      return;
    }

    audio.removeEventListener("ended", handler);
    endedHandlerRef.current = null;
  };

  const clearAudio = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    detachEndedHandler();
    setIsPlaying(false);
    audio.pause();
    audio.currentTime = 0;
    audioRef.current = null;
  };

  const preserveAudioForRemount = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    detachEndedHandler();
    retainBrainMatchBridgeAudio(audio);
    audioRef.current = null;
  };

  const startBridge = () => {
    clearTimers();
    clearAudio();
    setIsAmyTalking(false);
    setIsPlaying(false);

    timeoutRef.current = window.setTimeout(() => {
      const audio = consumeBrainMatchBridgeAudio() ?? new Audio(amyMatchAudio);
      audio.preload = "auto";
      audio.muted = mutedRef.current;
      audioRef.current = audio;
      setIsAmyTalking(true);

      const finish = () => {
        setIsAmyTalking(false);
        setIsPlaying(false);
        timeoutRef.current = window.setTimeout(() => {
          setIsExiting(true);
          timeoutRef.current = window.setTimeout(() => {
            onComplete();
          }, BRIDGE_EXIT_TRANSITION_MS);
        }, BRIDGE_POST_LINE_DELAY_MS + BRIDGE_PAUSE_MS);
      };

      endedHandlerRef.current = finish;
      audio.addEventListener("ended", finish, { once: true });
      audio.addEventListener("play", () => {
        setIsPlaying(true);
      }, { once: true });

      if (!audio.paused) {
        setIsPlaying(true);
        return;
      }

      void audio.play().catch(() => {
        setIsAmyTalking(false);
        setIsPlaying(false);
        clearAudio();
      });
    }, BRIDGE_START_DELAY_MS);
  };

  useEffect(() => {
    startBridge();

    return () => {
      clearTimers();
      if (audioRef.current && !audioRef.current.ended) {
        preserveAudioForRemount();
        return;
      }

      clearAudio();
      clearBrainMatchBridgeAudio();
    };
  }, []);

  const handleAudioControl = async () => {
    const audio = audioRef.current;

    if (!isPlaying || !audio) {
      setIsMuted(false);
      mutedRef.current = false;
      startBridge();
      return;
    }

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    mutedRef.current = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div
      style={{
        ...styles.screen,
        ...(isExiting ? styles.screenExiting : null),
      }}
    >
      <div
        style={{
          ...styles.card,
          ...(isExiting ? styles.cardExiting : null),
        }}
      >
        <div style={styles.controlRow}>
          <button
            type="button"
            onClick={handleAudioControl}
            aria-label={!isPlaying ? "Play bridge audio" : isMuted ? "Unmute bridge audio" : "Mute bridge audio"}
            style={styles.audioControl}
          >
            {!isPlaying ? "Play audio" : isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        <div style={styles.stage}>
          {(Object.entries(characters) as Array<[CharacterId, (typeof characters)[CharacterId]]>).map(
            ([characterId, character]) => {
              const isFocused = characterId === "amygdala";
              const animationData =
                isFocused && isAmyTalking && character.talkingAnimation
                  ? character.talkingAnimation
                  : character.idleAnimation;

              return (
                <div
                  key={characterId}
                  style={{
                    ...styles.characterShell,
                    left: character.left,
                    top: character.top,
                    ...(isFocused ? styles.characterShellFocused : styles.characterShellIdle),
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      ...styles.characterGlow,
                      background: `radial-gradient(ellipse at center, ${character.glow} 0%, rgba(255,255,255,0) 74%)`,
                      opacity: isFocused ? 0.78 : 0.24,
                    }}
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      ...styles.characterShadow,
                      background: `radial-gradient(ellipse at center, ${character.shadow} 0%, rgba(255,255,255,0) 76%)`,
                      opacity: isFocused ? 0.72 : 0.32,
                    }}
                  />
                  <div style={styles.characterFrame}>
                    <Lottie animationData={animationData} loop autoplay style={styles.characterAnimation} />
                  </div>
                </div>
              );
            },
          )}
        </div>

        <div style={styles.captionCard}>
          <p style={{ ...styles.captionName, color: characters.amygdala.accent }}>{characters.amygdala.name}</p>
          <p style={styles.captionText}>{AMY_MATCH_CAPTION}</p>
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
    transition: `opacity ${BRIDGE_EXIT_TRANSITION_MS}ms ease, transform ${BRIDGE_EXIT_TRANSITION_MS}ms cubic-bezier(0.22, 0.86, 0.3, 1)`,
  },
  screenExiting: {
    opacity: 0,
    transform: "scale(0.985)",
  },
  card: {
    width: "min(980px, 100%)",
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
    transition:
      `opacity ${BRIDGE_EXIT_TRANSITION_MS}ms ease, ` +
      `transform ${BRIDGE_EXIT_TRANSITION_MS}ms cubic-bezier(0.22, 0.86, 0.3, 1), ` +
      `filter ${BRIDGE_EXIT_TRANSITION_MS}ms ease`,
  },
  cardExiting: {
    opacity: 0.88,
    transform: "scale(0.985)",
    filter: "blur(4px)",
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
  stage: {
    position: "relative" as const,
    width: "100%",
    minHeight: "350px",
    flex: 1,
    overflow: "hidden" as const,
  },
  characterShell: {
    position: "absolute" as const,
    width: "min(300px, 28vw)",
    height: "min(300px, 28vw)",
    transform: "translate(-50%, -50%)",
    transition: "transform 420ms ease, opacity 420ms ease, filter 420ms ease",
  },
  characterShellFocused: {
    opacity: 1,
    filter: "brightness(1.04) saturate(1.06)",
    transform: "translate(-50%, -50%) scale(1.04)",
  },
  characterShellIdle: {
    opacity: 0.62,
    filter: "saturate(0.82) brightness(0.9)",
    transform: "translate(-50%, -50%) scale(0.92)",
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
    marginTop: "-1rem",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(226, 232, 240, 0.85)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    textAlign: "center" as const,
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
};

export default BrainMatchBridgeScreen;
