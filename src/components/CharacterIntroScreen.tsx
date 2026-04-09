import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import idleCharacterAnimation from "../assets/lottie/idlecharacteranimation.json";
import talkingCharacterAnimation from "../assets/lottie/talkingcharacteranimation.json";

interface CharacterIntroScreenProps {
  onContinue: () => void;
  audioSrc: string;
  ctaLabel: string;
}

function CharacterIntroScreen({ onContinue, audioSrc, ctaLabel }: CharacterIntroScreenProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [shouldPromptContinue, setShouldPromptContinue] = useState(false);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.preload = "auto";
    setIsMuted(false);
    setIsPlaying(false);
    setAutoplayBlocked(false);
    setShouldPromptContinue(false);

    const handleEnded = () => {
      setIsPlaying(false);
      setShouldPromptContinue(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };

    const handleTimeUpdate = () => {
      if (!Number.isFinite(audio.duration)) {
        return;
      }

      if (audio.duration - audio.currentTime <= 1.8) {
        setShouldPromptContinue(true);
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);

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
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current = null;
    };
  }, [audioSrc]);

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

  const characterAnimation = isPlaying ? talkingCharacterAnimation : idleCharacterAnimation;

  return (
    <div style={styles.screen}>
      <div className="character-intro-card" style={styles.card}>
        <div style={styles.controlRow}>
          <button
            type="button"
            onClick={handleAudioControl}
            aria-label={autoplayBlocked || !isPlaying ? "Play intro audio" : isMuted ? "Unmute intro audio" : "Mute intro audio"}
            style={styles.audioControl}
          >
            {autoplayBlocked || !isPlaying ? "Play audio" : isMuted ? "Unmute" : "Mute"}
          </button>
        </div>

        <p style={styles.eyebrow}>Meet your brain buddy</p>

        <div className="character-intro-animation" style={styles.animationFrame}>
          <Lottie
            animationData={characterAnimation}
            loop
            autoplay
            style={styles.animation}
          />
        </div>

        {autoplayBlocked && (
          <p style={styles.audioHint}>
            Autoplay was blocked. Use the audio control to start the intro narration.
          </p>
        )}

        <button
          className={shouldPromptContinue ? "intro-start-button character-intro-continue-button" : "intro-start-button"}
          style={styles.button}
          onClick={onContinue}
        >
          {ctaLabel}
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
    padding: "clamp(1.75rem, 3vw, 2.75rem)",
    borderRadius: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.9rem",
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
  eyebrow: {
    margin: 0,
    fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)",
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "#21456f",
  },
  animationFrame: {
    width: "min(560px, 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0.15rem auto 0.35rem",
  },
  animation: {
    width: "100%",
    maxWidth: "560px",
    height: "auto",
    filter: "drop-shadow(0 22px 42px rgba(56, 189, 248, 0.18))",
  },
  audioHint: {
    margin: 0,
    fontSize: "0.92rem",
    color: "#46617d",
  },
  button: {
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

export default CharacterIntroScreen;
