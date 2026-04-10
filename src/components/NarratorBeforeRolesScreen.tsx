import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import narratorBeforeRolesAudio from "../assets/audio/narrator-before-roles.mp3";
import idleCharacterAnimation from "../assets/lottie/idlecharacteranimation.json";
import talkingCharacterAnimation from "../assets/lottie/talkingcharacteranimation.json";

interface NarratorBeforeRolesScreenProps {
  onContinue: () => void;
}

const NARRATION_START_DELAY_MS = 650;

function NarratorBeforeRolesScreen({ onContinue }: NarratorBeforeRolesScreenProps) {
  const [isAudioComplete, setIsAudioComplete] = useState(false);
  const [isNarratorTalking, setIsNarratorTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(narratorBeforeRolesAudio);
    audio.preload = "auto";
    audioRef.current = audio;
    setIsMuted(false);
    setIsPlaying(false);
    setAutoplayBlocked(false);

    const handleEnded = () => {
      setIsNarratorTalking(false);
      setIsPlaying(false);
      setIsAudioComplete(true);
    };

    const handlePause = () => {
      setIsNarratorTalking(false);
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsNarratorTalking(true);
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    const autoplayTimer = window.setTimeout(() => {
      void audio.play().catch(() => {
        // If autoplay is blocked, still allow the class to proceed.
        setIsNarratorTalking(false);
        setIsPlaying(false);
        setAutoplayBlocked(true);
        setIsAudioComplete(true);
      });
    }, NARRATION_START_DELAY_MS);

    return () => {
      window.clearTimeout(autoplayTimer);
      setIsNarratorTalking(false);
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audioRef.current = null;
    };
  }, []);

  const handleAudioControl = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!isPlaying) {
      try {
        audio.currentTime = 0;
        audio.muted = false;
        setIsMuted(false);
        setIsAudioComplete(false);
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
        <div style={styles.controlRow}>
          <button
            type="button"
            onClick={handleAudioControl}
            aria-label={!isPlaying ? "Play narrator audio" : isMuted ? "Unmute narrator audio" : "Mute narrator audio"}
            style={styles.audioControl}
          >
            {!isPlaying ? "Play audio" : isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        <h1 style={styles.title}>Before you choose roles</h1>

        <div className="character-intro-animation" style={styles.animationFrame}>
          <Lottie
            animationData={isNarratorTalking ? talkingCharacterAnimation : idleCharacterAnimation}
            loop
            autoplay
            style={styles.animation}
          />
        </div>

        <button
          type="button"
          className={isAudioComplete ? "app-primary-button character-intro-continue-button" : "app-primary-button"}
          style={{
            ...styles.button,
            ...(isAudioComplete ? null : styles.buttonDisabled),
          }}
          onClick={onContinue}
          disabled={!isAudioComplete}
        >
          Select Roles
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
    width: "min(760px, 100%)",
    minHeight: "min(640px, calc(100vh - 4rem))",
    padding: "clamp(1.75rem, 3vw, 2.75rem)",
    borderRadius: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    textAlign: "center" as const,
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(243, 248, 255, 0.7) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    boxShadow: "0 24px 70px rgba(99, 102, 241, 0.12), 0 10px 30px rgba(34, 211, 238, 0.08)",
    backdropFilter: "blur(18px)",
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
  title: {
    margin: 0,
    fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)",
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "#21456f",
  },
  animationFrame: {
    width: "min(560px, 100%)",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0.25rem auto 0.45rem",
  },
  animation: {
    width: "100%",
    maxWidth: "560px",
    height: "auto",
    filter: "drop-shadow(0 22px 42px rgba(56, 189, 248, 0.18))",
  },
  button: {
    padding: "0.95rem 1.75rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  buttonDisabled: {
    cursor: "not-allowed",
    opacity: 0.58,
    animation: "none",
    boxShadow: "0 10px 22px rgba(148, 163, 184, 0.14)",
    filter: "saturate(0.8)",
  },
};

export default NarratorBeforeRolesScreen;
