const FREQUENCIES_A = [
  103.83, 130.81, 155.56, 185.0, 207.65, 261.63, 311.13, 370.0, 415.3, 523.25,
  622.25, 739.99, 830.61, 1046.5, 1244.51, 1479.98,
];
const FREQUENCIES_B = [
  123.48, 155.56, 185.0, 220.0, 246.94, 311.12, 370.0, 440.0, 493.88, 622.26,
  739.98, 880.0, 987.76, 1244.5, 1479.98, 1760.0,
];
const FREQUENCIES_C = [
  69.3, 87.31, 103.83, 138.59, 174.61, 207.65, 277.18, 349.23, 415.3, 554.37,
  698.46, 830.61, 1108.73, 1396.91, 1661.22,
];

export class Oscillator {
  frequencyA = FREQUENCIES_A[Math.floor(Math.random() * FREQUENCIES_A.length)];
  frequencyB = FREQUENCIES_B[Math.floor(Math.random() * FREQUENCIES_B.length)];
  frequencyC = FREQUENCIES_C[Math.floor(Math.random() * FREQUENCIES_C.length)];
  frequencyOff = 1.025 - Math.random() * 0.05;
  pan = Math.random() * 2 - 1;
  volume = 1 / 100;
  chance = 0.3 + Math.random() * 0.7;

  constructor(context) {
    this.context = context;
    this.createOscillator();
    this.isPlaying = false;
  }

  createOscillator() {
    const real = Oscillator.randomReal();
    const imag = new Float32Array(real.length);
    const waveform = this.context.createPeriodicWave(real, imag);

    this.oscillatorNode = new OscillatorNode(this.context);
    this.gainNode = new GainNode(this.context);
    this.panNode = new StereoPannerNode(this.context, { pan: this.pan });

    // this.oscillatorNode.type = "triangle";
    this.oscillatorNode.setPeriodicWave(waveform);

    this.oscillatorNode.connect(this.panNode);
    this.panNode.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
  }

  static randomReal() {
    return new Float32Array([
      0, // No DC offset
      randomizeHarmonic(1, 1), // Fundamental
      randomizeHarmonic(0.5, 1), // 2nd harmonic
      randomizeHarmonic(0.25, 1), // 3rd harmonic
      randomizeHarmonic(0.125, 1), // 4th harmonic
    ]);

    function randomizeHarmonic(baseValue, variance) {
      return baseValue + (Math.random() * 2 - 1) * variance;
    }
  }

  start() {
    if (this.isPlaying) {
      return;
    }
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.volume,
      this.context.currentTime + 2
    );
    this.oscillatorNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (this.isPlaying) {
      this.oscillatorNode.stop();
      this.isPlaying = false;
    }
  }

  evolve(progress) {
    const frequency =
      (this.frequencyC - this.frequencyA) * progress + this.frequencyA;

    this.oscillatorNode.frequency.linearRampToValueAtTime(
      frequency * this.frequencyOff,
      this.context.currentTime + 0.2
    );
  }
}
