type SoundName = "click" | "positive" | "negative" | "celebrate" | "alert";

let audioContext: AudioContext | null = null;
const lastPlayedAt = new Map<SoundName, number>();

const cooldownBySound: Record<SoundName, number> = {
  click: 60,
  positive: 120,
  negative: 120,
  celebrate: 900,
  alert: 900,
};

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

function withEnvelope(
  oscillator: OscillatorNode,
  gainNode: GainNode,
  {
    startAt,
    attack = 0.01,
    decay = 0.16,
    peak = 0.08,
    end = 0.0001,
  }: {
    startAt: number;
    attack?: number;
    decay?: number;
    peak?: number;
    end?: number;
  },
) {
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(peak, startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(end, startAt + attack + decay);
  oscillator.start(startAt);
  oscillator.stop(startAt + attack + decay + 0.02);
}

function playTone(
  ctx: AudioContext,
  {
    frequency,
    type = "sine",
    startAt,
    attack,
    decay,
    peak,
  }: {
    frequency: number;
    type?: OscillatorType;
    startAt: number;
    attack?: number;
    decay?: number;
    peak?: number;
  },
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  withEnvelope(oscillator, gainNode, { startAt, attack, decay, peak });
}

export function playUiSound(name: SoundName) {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  const nowMs = performance.now();
  const cooldown = cooldownBySound[name];
  if (nowMs - (lastPlayedAt.get(name) ?? -Infinity) < cooldown) {
    return;
  }
  lastPlayedAt.set(name, nowMs);

  const startAt = ctx.currentTime + 0.001;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  switch (name) {
    case "click":
      playTone(ctx, { frequency: 780, type: "triangle", startAt, attack: 0.003, decay: 0.05, peak: 0.028 });
      break;
    case "positive":
      playTone(ctx, { frequency: 523.25, type: "sine", startAt, attack: 0.01, decay: 0.1, peak: 0.04 });
      playTone(ctx, { frequency: 659.25, type: "sine", startAt: startAt + 0.05, attack: 0.01, decay: 0.12, peak: 0.036 });
      break;
    case "negative":
      playTone(ctx, { frequency: 392, type: "triangle", startAt, attack: 0.01, decay: 0.13, peak: 0.035 });
      playTone(ctx, { frequency: 329.63, type: "triangle", startAt: startAt + 0.06, attack: 0.01, decay: 0.15, peak: 0.03 });
      break;
    case "celebrate":
      playTone(ctx, { frequency: 783.99, type: "triangle", startAt, attack: 0.01, decay: 0.14, peak: 0.05 });
      playTone(ctx, { frequency: 987.77, type: "sine", startAt: startAt + 0.06, attack: 0.01, decay: 0.16, peak: 0.045 });
      playTone(ctx, { frequency: 1318.51, type: "sine", startAt: startAt + 0.12, attack: 0.01, decay: 0.18, peak: 0.04 });
      break;
    case "alert":
      playTone(ctx, { frequency: 440, type: "triangle", startAt, attack: 0.01, decay: 0.12, peak: 0.038 });
      playTone(ctx, { frequency: 349.23, type: "triangle", startAt: startAt + 0.08, attack: 0.01, decay: 0.14, peak: 0.034 });
      break;
  }
}
