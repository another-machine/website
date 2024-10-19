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
    for (let i = 0; i < 100; i++) {
      this.oscillators.push(new Oscillator(this.context));
    }
    this.start();
  }

  start() {
    this.oscillators.forEach((oscillator) => oscillator.start());
  }

  stop() {
    this.oscillators.forEach((oscillator) => oscillator.stop());
  }

  evolve({ scrollY }) {
    this.oscillators.forEach((oscillator) => oscillator.evolve(scrollY));
  }
}
