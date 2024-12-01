// E7
const FREQUENCIES_A = [
  // 41.2, 51.91, 61.74, 73.42, 82.41, 103.83, 123.47, 146.83, 164.81, 207.65,
  246.94, 293.66, 329.63, 415.3, 493.88, 587.33, 659.26, 830.61, 987.77,
  1174.66, 1318.51, 1661.22, 1975.53, 2349.32, 2637.02,
  // 3322.44, 3951.07,
  // 4698.64,
];
// A
const FREQUENCIES_B = [
  55.0, 69.3, 82.41, 110.0, 138.59, 164.81, 220.0, 277.18, 329.63, 440.0,
  554.37, 659.26, 880.0, 1108.73, 1318.51, 1760.0, 2217.46, 2637.02, 3520.0,
  3984.13, 4186.01, 4434.92, 4581.63, 4698.64, 4803.82, 4886.24, 4955.36,
  4978.03,
];

const FREQ_MAX = FREQUENCIES_B[FREQUENCIES_B.length - 1];
const FREQ_MIN = FREQUENCIES_A[0];

export const COUNT = Math.max(FREQUENCIES_A.length, FREQUENCIES_B.length);

export class Oscillator {
  frequencyOff = 1.01 - Math.random() * 0.02;

  // Gate timing parameters
  minGateTime = 0.05; // Minimum time note is held
  maxGateTime = 0.2; // Maximum time note is held
  minSilenceTime = 0.1; // Minimum silence between notes
  maxSilenceTime = 2.0; // Maximum silence between notes

  constructor(context, output, volume, progress) {
    const randomIndex = Math.floor(Math.random() * FREQUENCIES_A.length);
    this.frequencyA = FREQUENCIES_A[randomIndex];
    this.frequencyB =
      FREQUENCIES_B[
        Math.random() < 0.3
          ? Math.floor(Math.random() * FREQUENCIES_B.length)
          : randomIndex
      ];
    this.volume = volume;
    this.volumeFactor = 0;
    this.context = context;
    this.createOscillator(output);
    this.evolve(progress);
    this.isPlaying = false;
    this.gateOff();
  }

  gateOff() {
    this.gated = true;
    this.gainNode.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + 0.02
    );
  }

  gateOn() {
    this.gated = false;
    this.gainNode.gain.linearRampToValueAtTime(
      this.volume * (1 + this.volumeFactor),
      this.context.currentTime + 0.0001
    );
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.oscillatorNode.start();
  }

  stop() {
    if (this.isPlaying) {
      this.oscillatorNode.stop();
      this.isPlaying = false;
    }
  }

  getOscillatorType() {
    const rand = Math.random();
    return rand < 0.25
      ? "square"
      : rand < 0.5
      ? "sawtooth"
      : rand < 0.75
      ? "triangle"
      : "sine";
  }

  createOscillator(output) {
    this.oscillatorNode = new OscillatorNode(this.context);
    this.gainNode = new GainNode(this.context);
    this.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime);
    this.panNode = new StereoPannerNode(this.context);
    this.panNode.pan.setValueAtTime(
      Math.random() * 2 - 1,
      this.context.currentTime
    );

    const type = this.getOscillatorType();
    this.oscillatorNode.type = type;

    this.oscillatorNode.connect(this.panNode);
    this.panNode.connect(this.gainNode);
    this.gainNode.connect(output);
  }

  evolve(progress) {
    const frequency =
      (this.frequencyB - this.frequencyA) * progress + this.frequencyA;
    const variableOffset =
      this.frequencyOff * (1 + (Math.random() * 0.01 - 0.005));

    this.oscillatorNode.frequency.linearRampToValueAtTime(
      frequency * variableOffset,
      this.context.currentTime + 0.001
    );

    this.volumeFactor =
      (1 - (frequency - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 0.05;

    if (this.gated) {
      if (Math.random() > 0.98 + 0.015 * (1 - progress)) this.gateOn();
    } else {
      if (Math.random() > 0.6 + 0.3 * progress) this.gateOff();
    }
  }
}
