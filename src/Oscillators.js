import { Oscillator } from "./Oscillator.js";

export class Oscillators {
  initialized = false;

  constructor() {
    this.oscillators = [];
  }

  initialize() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.context = new AudioContext();
    this.gainNode = new GainNode(this.context);
    this.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime);
    this.gainNode.connect(this.context.destination);
    for (let i = 0; i < 100; i++) {
      this.oscillators.push(new Oscillator(this.context, this.gainNode));
    }
    this.oscillators.forEach((oscillator) => oscillator.start());
  }

  start() {
    if (!this.initialized) {
      this.initialize();
    }
    this.on = true;
    this.gainNode.gain.setValueAtTime(0.000001, this.context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 1);
  }

  stop() {
    this.on = false;
    this.gainNode.gain.linearRampToValueAtTime(
      0.0001,
      this.context.currentTime + 1
    );
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime + 1.01);
  }

  toggle() {
    if (this.on) {
      this.stop();
    } else {
      this.start();
    }
  }

  evolve({ scrollY }) {
    this.oscillators.forEach((oscillator) => oscillator.evolve(scrollY));
  }
}
