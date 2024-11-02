import { ParticlePool } from "./ParticlePool.js";
import { Particle } from "./Particle.js";

export class Particles {
  particleGroups = { start: [], end: [] };
  // Increase initial pool size to avoid particle creation during runtime
  particlePool = new ParticlePool(5000); // Adjust based on your needs

  constructor({ canvas, context }) {
    this.canvas = canvas;
    this.context = context;
    // Pre-allocate temporary arrays for better performance
    this.tempArray = new Float32Array(2);
  }

  setup() {
    this.particlePool.releaseAll([
      ...this.particleGroups.start,
      ...this.particleGroups.end,
    ]);

    this.particleGroups.start.length = 0;
    this.particleGroups.end.length = 0;

    const particles = this.particlesForText(["a(nother)", "machine"]);
    this.particleGroups.start.push(...particles);

    // Create end groups more efficiently
    particles.forEach((startGroup, i) => {
      const endGroup = startGroup.slice();
      Particles.shuffle(endGroup);
      this.particleGroups.end[i] = endGroup;
    });
  }

  force(forcedParticles, scrollY) {
    const size = Particle.radiusForProgress(scrollY);

    this.particleGroups.start.forEach((particles, i) => {
      this.context.fillStyle = `rgba(255,255,255,${i ? 0.6 : 1})`;
      this.context.beginPath();
      const group = forcedParticles[i % forcedParticles.length];
      particles.forEach((particle, j) => {
        const destination = group[j % group.length];
        particle.force({ destination });
        particle.fill({ context: this.context, size });
      });
      this.context.closePath();
      this.context.fill();
    });
  }

  render({ cursorX, cursorY, scrollY }, offsetY) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const offsetX = 0;
    const size = Particle.radiusForProgress(scrollY);
    const cursorRadius = Math.min(width, height) * 0.5;

    this.particleGroups.start.forEach((particles, i) => {
      this.context.fillStyle = `rgba(255,255,255,${i ? 0.6 : 1})`;
      this.context.beginPath();
      particles.forEach((particle, j) => {
        const destination = this.particleGroups.end[i][j];
        particle.evolve({
          progress: scrollY,
          cursorX,
          cursorY,
          cursorRadius,
          destination,
          width,
          height,
          offsetX,
          offsetY,
        });
        particle.fill({ context: this.context, size });
      });
      this.context.closePath();
      this.context.fill();
    });
  }

  particlesForText(lines) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const particles = [];
    const height = this.canvas.height;
    const width = this.canvas.width;
    const fontSize = Math.min(170, Math.min(height, width) * 0.1);
    const density = Math.max((0.2 / 200) * fontSize, 0.25);

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.font = `${fontSize}px Times New Roman`;
    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.lineWidth = fontSize * 0.07;
    context.textBaseline = "middle";
    context.textAlign = "center";

    const x = width * 0.5;
    const heightOfLines = lines.length * fontSize * 0.5;
    lines.forEach((line, i) => {
      const y = height * 0.5 - heightOfLines * 0.5 + i * fontSize;
      context.fillText(line, x, y);
      context.strokeText(line, x, y);
    });

    const data32 = new Uint32Array(
      context.getImageData(0, 0, width, height).data.buffer
    );
    const dimension = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < data32.length; i++) {
      const alpha = (data32[i] >> 24) & 0xff;
      if (alpha) {
        const alphaGroup = alpha === 255 ? 0 : 1;
        particles[alphaGroup] = particles[alphaGroup] || [];
        const densityFactor = density;
        if (Math.random() < densityFactor) {
          const particle = this.particlePool.acquire({
            x: i % width,
            y: (i / width) | 0,
            centerX,
            centerY,
            alpha,
            dimension,
          });
          particles[alphaGroup].push(particle);
        }
      }
    }

    particles.forEach((group) => Particles.shuffle(group));
    return particles;
  }

  static shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }
}
