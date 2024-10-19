import { Particle } from "./Particle.js";

export class Particles {
  groups = { a: [], b: [] };

  constructor({ canvas, context }) {
    this.canvas = canvas;
    this.context = context;
  }

  setup() {
    this.groups.a.splice(0, this.groups.a.length);
    this.groups.b.splice(0, this.groups.b.length);
    const height = this.canvas.height;
    const width = this.canvas.width;
    const fontSize = Math.min(height, width) * 0.15;
    const density = Math.max((0.2 / 200) * fontSize, 0.2);

    this.context.clearRect(0, 0, width, height);
    this.context.font = `${fontSize}px Times New Roman`;
    this.context.fillStyle = "rgba(255,255,255,1.0)";
    this.context.strokeStyle = "rgba(255,255,255,0.3)";
    this.context.lineWidth = fontSize * 0.07;
    this.context.textBaseline = "middle";
    this.context.textAlign = "center";
    const line1 = { x: width * 0.5, y: height * 0.5 - fontSize / 2 };
    const line2 = { x: width * 0.5, y: height * 0.5 + fontSize / 2 };
    this.context.fillText("a(nother)", line1.x, line1.y);
    this.context.strokeText("a(nother)", line1.x, line1.y);
    this.context.fillText("machine", line2.x, line2.y);
    this.context.strokeText("machine", line2.x, line2.y);

    const data32 = new Uint32Array(
      this.context.getImageData(0, 0, width, height).data.buffer
    );
    const dimension = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < data32.length; i++) {
      const alpha = (data32[i] >> 24) & 0xff;
      if (alpha) {
        const alphaGroup = alpha === 255 ? 0 : 1;
        this.groups.a[alphaGroup] = this.groups.a[alphaGroup] || [];
        const densityFactor = density;
        if (Math.random() < densityFactor) {
          this.groups.a[alphaGroup].push(
            new Particle({
              x: i % width,
              y: (i / width) | 0,
              centerX,
              centerY,
              alpha,
              dimension,
            })
          );
        }
      }
    }
    this.groups.a.forEach((a, i) => {
      this.groups.b[i] = [...a];
      Particles.shuffle(this.groups.b[i]);
    });
  }

  render({ cursorX, cursorY, scrollY }) {
    const width = this.canvas.width * 1;
    const height = this.canvas.height * 1;
    const offsetX = this.canvas.width * 0;
    const offsetY = this.canvas.height * 0;
    const relativeProgress = Math.abs(scrollY - 0.5) / 0.5;
    const size = Particle.radiusForProgress(scrollY);
    const cursorRadius = Math.min(width, height) * 0.5;

    this.context.lineWidth = Particle.dotRadiusMin * 0.01;

    this.groups.a.forEach((particles, i) => {
      this.context.fillStyle = `rgba(255,255,255,${i ? 0.6 : 1})`;
      this.context.beginPath();
      particles.forEach((particle, j) => {
        const destination = this.groups.b[i][j];
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
