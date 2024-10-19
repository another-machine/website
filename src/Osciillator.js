export class Oscillator {
  constructor(context) {
    this.context = context;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  // Create the oscillator and gain nodes
  createOscillator(frequency = 440, type = "sine") {
    this.oscillator = this.context.createOscillator();
    this.gainNode = this.context.createGain();

    // Set the oscillator properties
    this.oscillator.type = type; // sine, square, sawtooth, triangle
    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.context.currentTime
    );

    // Connect the oscillator to the gain node, and the gain node to the output
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    // Set an initial gain value (volume)
    this.gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
  }

  // Start the oscillator
  start(frequency = 440, type = "sine") {
    if (this.isPlaying) return; // Avoid creating multiple oscillators
    this.createOscillator(frequency, type);
    this.oscillator.start();
    this.isPlaying = true;
  }

  // Stop the oscillator
  stop() {
    if (this.isPlaying) {
      this.oscillator.stop();
      this.isPlaying = false;
    }
  }

  // Change the oscillator frequency
  setFrequency(frequency) {
    if (this.oscillator) {
      this.oscillator.frequency.setValueAtTime(
        frequency,
        this.context.currentTime
      );
    }
  }

  // Change the oscillator waveform type
  setWaveform(type) {
    if (this.oscillator) {
      this.oscillator.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    }
  }

  // Adjust the volume of the synth
  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    }
  }
}
