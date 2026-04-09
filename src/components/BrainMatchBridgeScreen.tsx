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

const AMY_MATCH_CAPTION = "Great job. Now let's match each brain region to the job it does.";

function BrainMatchBridgeScreen({ onComplete }: BrainMatchBridgeScreenProps) {
  const [isAmyTalking, setIsAmyTalking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

    const audio = consumeBrainMatchBridgeAudio() ?? new Audio(amyMatchAudio);
    audio.preload = "auto";
    audioRef.current = audio;
    setIsAmyTalking(true);

    const finish = () => {
      setIsAmyTalking(false);
      timeoutRef.current = window.setTimeout(() => {
        onComplete();
      }, BRIDGE_PAUSE_MS);
    };

    endedHandlerRef.current = finish;
    audio.addEventListener("ended", finish, { once: true });

    if (!audio.paused) {
      return;
    }

    void audio.play().catch(() => {
      setIsAmyTalking(false);
      clearAudio();
    });
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

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>Nice work</p>
          <h1 style={styles.title}>Your brain team is ready</h1>
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
