import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import narratorBeforeRolesAudio from "../assets/audio/narrator-before-roles.mp3";
import idleCharacterAnimation from "../assets/lottie/idlecharacteranimation.json";
import talkingCharacterAnimation from "../assets/lottie/talkingcharacteranimation.json";

interface NarratorBeforeRolesScreenProps {
  onContinue: () => void;
}

const NARRATOR_COPY = `Now that you know the roles inside my brain, it's time to choose yours.
Your teacher may have already assigned them, so just tap to check in.
You'll hear different scenarios I face throughout my day, and each of you will answer from your role — but you'll work together as a team to decide what to do.
Thanks for helping me keep my brain balanced. I'm counting on you.`;

function NarratorBeforeRolesScreen({ onContinue }: NarratorBeforeRolesScreenProps) {
  const [isAudioComplete, setIsAudioComplete] = useState(false);
  const [isNarratorTalking, setIsNarratorTalking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(narratorBeforeRolesAudio);
    audio.preload = "auto";
    audioRef.current = audio;
    setIsNarratorTalking(true);

    const handleEnded = () => {
      setIsNarratorTalking(false);
      setIsAudioComplete(true);
      audioRef.current = null;
    };

    audio.addEventListener("ended", handleEnded, { once: true });
    void audio.play().catch(() => {
      // If autoplay is blocked, still allow the class to proceed.
      setIsNarratorTalking(false);
      setIsAudioComplete(true);
      audioRef.current = null;
    });

    return () => {
      setIsNarratorTalking(false);
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, []);

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>Narrator</p>
          <h1 style={styles.title}>Before you choose roles</h1>
        </div>

        <div style={styles.animationFrame}>
          <Lottie
            animationData={isNarratorTalking ? talkingCharacterAnimation : idleCharacterAnimation}
            loop
            autoplay
            style={styles.animation}
          />
        </div>

        <div style={styles.copyCard}>
          {NARRATOR_COPY.split("\n").map((paragraph) => (
            <p key={paragraph} style={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>

        {isAudioComplete && (
          <button type="button" className="app-primary-button" style={styles.button} onClick={onContinue}>
            Select Roles
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
    padding: "clamp(1rem, 2.5vh, 2rem)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "min(820px, 100%)",
    minHeight: "min(640px, calc(100vh - 2rem))",
    padding: "clamp(1.5rem, 4vh, 2.5rem)",
    borderRadius: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(240, 249, 255, 0.78) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(12px)",
  },
  header: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.35rem",
  },
  eyebrow: {
    margin: 0,
    fontSize: "0.82rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "#0369a1",
  },
  title: {
    margin: 0,
    fontSize: "clamp(2rem, 3.4vw, 3.2rem)",
    lineHeight: 1.02,
    color: "#0f172a",
  },
  animationFrame: {
    width: "min(280px, 38vw)",
    height: "min(280px, 38vw)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  copyCard: {
    width: "min(680px, 100%)",
    padding: "clamp(1.4rem, 3vh, 2rem)",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
  },
  paragraph: {
    margin: 0,
    color: "#334155",
    fontSize: "1.05rem",
    lineHeight: 1.7,
  },
  button: {
    padding: "0.9rem 1.7rem",
    borderRadius: "999px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
};

export default NarratorBeforeRolesScreen;
