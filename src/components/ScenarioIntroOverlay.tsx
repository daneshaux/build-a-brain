import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import scenarioIntroAudio from "../assets/audio/scenario-intro.mp3";
import idleCharacterAnimation from "../assets/lottie/idlecharacteranimation.json";
import talkingCharacterAnimation from "../assets/lottie/talkingcharacteranimation.json";

interface ScenarioIntroOverlayProps {
  onDismiss: () => void;
}

const OVERLAY_EXIT_MS = 360;
const AUDIO_START_DELAY_MS = 700;

function ScenarioIntroOverlay({ onDismiss }: ScenarioIntroOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const audio = new Audio(scenarioIntroAudio);
    audioRef.current = audio;
    audio.preload = "auto";

    const startClosing = () => {
      setIsPlaying(false);
      setIsClosing(true);
      dismissTimerRef.current = window.setTimeout(() => {
        onDismiss();
      }, OVERLAY_EXIT_MS);
    };

    const handleEnded = () => {
      startClosing();
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

    autoplayTimerRef.current = window.setTimeout(() => {
      void audio.play().catch(() => {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      });
    }, AUDIO_START_DELAY_MS);

    return () => {
      if (autoplayTimerRef.current !== null) {
        window.clearTimeout(autoplayTimerRef.current);
      }
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audioRef.current = null;
    };
  }, [onDismiss]);

  const handleAudioControl = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!isPlaying || autoplayBlocked) {
      try {
        if (autoplayTimerRef.current !== null) {
          window.clearTimeout(autoplayTimerRef.current);
          autoplayTimerRef.current = null;
        }
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

  const characterAnimation = isPlaying ? talkingCharacterAnimation : idleCharacterAnimation;

  return (
    <div
      className={isClosing ? "scenario-intro-overlay scenario-intro-overlay--closing" : "scenario-intro-overlay"}
      aria-live="polite"
    >
      <div className="scenario-intro-overlay__backdrop" />
      <div className="scenario-intro-overlay__card" style={styles.card}>
        <div style={styles.controlRow}>
          <button
            type="button"
            onClick={handleAudioControl}
            aria-label={autoplayBlocked || !isPlaying ? "Play scenario intro audio" : isMuted ? "Unmute scenario intro audio" : "Mute scenario intro audio"}
            style={styles.audioControl}
          >
            {autoplayBlocked || !isPlaying ? "Play audio" : isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        <div className="scenario-intro-overlay__animation" style={styles.animationFrame}>
          <Lottie
            animationData={characterAnimation}
            loop
            autoplay
            style={styles.animation}
          />
        </div>

        {autoplayBlocked && (
          <p style={styles.audioHint}>
            Autoplay was blocked. Use the audio control to start the scenario intro.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: "relative" as const,
    width: "min(520px, calc(100vw - 2.5rem))",
    padding: "1rem 1.2rem 1.1rem",
    borderRadius: "30px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.6rem",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(240, 249, 255, 0.76) 100%)",
    border: "1px solid rgba(125, 211, 252, 0.28)",
    boxShadow: "0 28px 80px rgba(15, 23, 42, 0.18), 0 0 0 3px rgba(224, 242, 254, 0.5)",
    backdropFilter: "blur(20px)",
  },
  controlRow: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
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
  animationFrame: {
    width: "min(380px, 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "-0.2rem auto 0",
  },
  animation: {
    width: "100%",
    maxWidth: "380px",
    height: "auto",
    filter: "drop-shadow(0 18px 42px rgba(56, 189, 248, 0.16))",
  },
  audioHint: {
    margin: 0,
    fontSize: "0.92rem",
    color: "#46617d",
    textAlign: "center" as const,
  },
};

export default ScenarioIntroOverlay;
