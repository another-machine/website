import { Oscillator } from "./Osciillator";

export class Oscillators {
  context = new AudioContext();

  constructor() {
    this.oscillators = [];
    for (let i = 0; i < 100; i++) {
      this.oscillators.push(new Oscillator(this.context));
    }
  }
}
