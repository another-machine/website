import { COUNT, Oscillator } from "./Oscillator.js";

export class Oscillators {
  initialized = false;

  constructor() {
    this.oscillators = [];
  }

  initialize(interaction) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.context = new AudioContext();
    this.gainNode = new GainNode(this.context);
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
    this.gainNode.connect(this.context.destination);
    const count = COUNT * 8;
    for (let i = 0; i < count; i++) {
      const oscillator = new Oscillator(
        this.context,
        this.gainNode,
        1 / (count * 0.9),
        interaction.scrollY
      );
      this.oscillators.push(oscillator);
      oscillator.evolve(interaction.scrollY);
      oscillator.start();
    }
  }

  start() {
    this.gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 1);
    this.on = true;
  }

  stop() {
    this.on = false;
    this.gainNode.gain.linearRampToValueAtTime(
      0.0001,
      this.context.currentTime + 1
    );
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime + 1.01);
  }

  toggle(interaction) {
    if (this.on) {
      this.stop();
    } else {
      this.initialize(interaction);
      this.start();
    }
  }

  evolve({ scrollY }) {
    this.oscillators.forEach((oscillator) => oscillator.evolve(scrollY));
  }
}
