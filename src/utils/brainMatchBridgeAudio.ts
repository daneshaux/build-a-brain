import amyMatchAudio from "../assets/audio/amy-match.mp3";

let pendingBridgeAudio: HTMLAudioElement | null = null;

function cleanupAudioElement(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
  audio.onended = null;
  audio.onerror = null;
}

export function primeBrainMatchBridgeAudio() {
  if (typeof window === "undefined") {
    return null;
  }

  if (pendingBridgeAudio) {
    cleanupAudioElement(pendingBridgeAudio);
    pendingBridgeAudio = null;
  }

  const audio = new Audio(amyMatchAudio);
  audio.preload = "auto";
  pendingBridgeAudio = audio;

  void audio.play().catch(() => {
    if (pendingBridgeAudio === audio) {
      cleanupAudioElement(audio);
      pendingBridgeAudio = null;
    }
  });

  return audio;
}

export function consumeBrainMatchBridgeAudio() {
  const audio = pendingBridgeAudio;
  pendingBridgeAudio = null;
  return audio;
}

export function retainBrainMatchBridgeAudio(audio: HTMLAudioElement) {
  pendingBridgeAudio = audio;
}

export function clearBrainMatchBridgeAudio() {
  if (!pendingBridgeAudio) {
    return;
  }

  cleanupAudioElement(pendingBridgeAudio);
  pendingBridgeAudio = null;
}
