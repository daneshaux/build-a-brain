import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import endingDysregulatedAudio from "../assets/audio/ending-dysregulated.mp3";
import endingRegulatedAudio from "../assets/audio/ending-regulated.mp3";
import idleCharacterAnimation from "../assets/lottie/idlecharacteranimation.json";
import talkingCharacterAnimation from "../assets/lottie/talkingcharacteranimation.json";
import type { RegulationState } from "../types/game";

interface FinalCharacterScreenProps {
  result: RegulationState;
  onContinue: () => void;
}

const contentByResult: Record<
  RegulationState,
  {
    heading: string;
    message: string;
    accent: string;
    glow: string;
  }
> = {
  balanced: {
    heading: "You did it!",
    message:
      "Thanks for helping me stay balanced and calm. You did a great job building a brain today.",
    accent: "#1d8a6d",
    glow: "radial-gradient(circle, rgba(167, 243, 208, 0.44) 0%, rgba(103, 232, 249, 0.24) 34%, rgba(255,255,255,0) 70%)",
  },
  dysregulated: {
    heading: "That was a tough situation.",
    message:
      "My brain felt overwhelmed, but that’s okay. Sometimes regulation takes practice. Thanks for trying to help me.",
    accent: "#b45309",
    glow: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(251, 146, 60, 0.2) 34%, rgba(255,255,255,0) 70%)",
  },
};

function FinalCharacterScreen({ result, onContinue }: FinalCharacterScreenProps) {
  const content = contentByResult[result];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const characterAnimation = isPlaying ? talkingCharacterAnimation : idleCharacterAnimation;

  useEffect(() => {
    const audioSrc = result === "balanced" ? endingRegulatedAudio : endingDysregulatedAudio;
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.preload = "auto";

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    const autoplayTimer = window.setTimeout(() => {
      void audio.play().catch(() => {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      });
    }, 120);

    return () => {
      window.clearTimeout(autoplayTimer);
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audioRef.current = null;
    };
  }, [result]);

  const handleAudioControl = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!isPlaying || autoplayBlocked) {
      try {
        audio.muted = false;
        setIsMuted(false);
        await audio.play();
      } catch {
        setAutoplayBlocked(true);
      }
      return;
    }

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div style={styles.screen}>
      <div className="character-intro-card" style={styles.card}>
        <div aria-hidden="true" style={{ ...styles.glow, background: content.glow }} />

        <div style={styles.controlRow}>
          <button
            type="button"
            onClick={handleAudioControl}
            aria-label={
              autoplayBlocked || !isPlaying
                ? "Play final character audio"
                : isMuted
                  ? "Unmute final character audio"
                  : "Mute final character audio"
            }
            style={styles.audioControl}
          >
            {autoplayBlocked || !isPlaying ? "Play audio" : isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        <div className="character-intro-animation" style={styles.animationFrame}>
          <Lottie
            animationData={characterAnimation}
            loop
            autoplay
            style={styles.animation}
          />
        </div>

        <div style={styles.copyBlock}>
          <h2 style={{ ...styles.heading, color: content.accent }}>{content.heading}</h2>
          <p style={styles.message}>{content.message}</p>
          {autoplayBlocked && (
            <p style={styles.audioHint}>
              Autoplay was blocked. Use the audio control to start the final message.
            </p>
          )}
        </div>

        <button className="app-primary-button" style={styles.button} onClick={onContinue}>
          See Results
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
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "relative" as const,
    overflow: "hidden" as const,
    width: "min(780px, 100%)",
    padding: "clamp(1.8rem, 3vw, 2.8rem)",
    borderRadius: "34px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "1rem",
    textAlign: "center" as const,
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(243, 248, 255, 0.72) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    boxShadow: "0 24px 70px rgba(99, 102, 241, 0.12), 0 10px 30px rgba(34, 211, 238, 0.08)",
    backdropFilter: "blur(18px)",
  },
  controlRow: {
    position: "relative" as const,
    zIndex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "-0.15rem",
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
  glow: {
    position: "absolute" as const,
    inset: "8% auto auto 50%",
    width: "420px",
    height: "420px",
    transform: "translateX(-50%)",
    pointerEvents: "none" as const,
  },
  animationFrame: {
    position: "relative" as const,
    zIndex: 1,
    width: "min(420px, 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
  animation: {
    width: "100%",
    maxWidth: "420px",
    height: "auto",
    filter: "drop-shadow(0 22px 42px rgba(56, 189, 248, 0.18))",
  },
  copyBlock: {
    position: "relative" as const,
    zIndex: 1,
    maxWidth: "34rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.7rem",
    alignItems: "center",
  },
  heading: {
    margin: 0,
    fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
    lineHeight: 1.1,
    fontWeight: 700,
  },
  message: {
    margin: 0,
    fontSize: "clamp(1rem, 1.4vw, 1.1rem)",
    lineHeight: 1.7,
    color: "#334155",
  },
  audioHint: {
    margin: 0,
    fontSize: "0.92rem",
    color: "#46617d",
  },
  button: {
    position: "relative" as const,
    zIndex: 1,
    padding: "0.95rem 1.75rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
};

export default FinalCharacterScreen;
