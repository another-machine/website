// import { App } from "./App.js";

// const app = new App();
// app.initialize();

class Particle {
  static PI2 = Math.PI * 2;
  static radius = 0.75;

  angle = Math.random() * Particle.PI2 * 2 - Particle.PI2;
  angleBase = this.angle;
  angleIncrement = Math.random() * 4 - 2;

  baseX = 0;
  baseY = 0;

  foreignX = Math.random();
  foreignY = Math.random();

  radius = 0;
  rotateSpeed = Math.random() * 0.05;

  midpoint = Math.random() * 0.5 + 0.375;

  constructor({ x, y, alpha, dimension }) {
    this.radiusBase = Math.random() * dimension * 0.1;
    this.initialX = x;
    this.initialY = y;

    this.x = this.initialX;
    this.y = this.initialY;
    this.alpha = alpha;
  }

  evolve(scrollPosition, destination, width, height, offsetX, offsetY) {
    this.radius =
      (1 - (Math.abs(scrollPosition - 0.5) / 0.5) * 0.95) * this.radiusBase;

    const distance = Math.max(width, height);
    const offset = Math.min(offsetX, offsetY);
    const chaosX = this.foreignX * distance + offset;
    const chaosY = this.foreignY * distance + offset;

    if (scrollPosition <= this.midpoint) {
      const progress = scrollPosition / this.midpoint;
      this.x = (chaosX - this.initialX) * progress + this.initialX;
      this.y = (chaosY - this.initialY) * progress + this.initialY;
    } else {
      const progress = (scrollPosition - this.midpoint) / (1 - this.midpoint);
      this.x = (destination.initialX - chaosX) * progress + chaosX;
      this.y = (destination.initialY - chaosY) * progress + chaosY;
    }
  }

  draw(context) {
    const dx = Math.sin(this.angle * this.rotateSpeed) * this.radius;
    const dy = Math.cos(this.angle * this.rotateSpeed) * this.radius;
    context.moveTo(this.x + dx, this.y + dy);
    context.arc(this.x + dx, this.y + dy, Particle.radius, 0, Particle.PI2);
    this.angle += this.angleIncrement;
  }
}

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = generate();

let scrollPosition = 0;
window.addEventListener("scroll", updateScrollPosition);
updateScrollPosition();
animate();

function easeInOut(t, easingFactor) {
  return t < 0.5
    ? Math.pow(t * 2, easingFactor) / 2
    : 1 - Math.pow((1 - t) * 2, easingFactor) / 2;
}

function updateScrollPosition() {
  const documentHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const rawScrollPosition =
    document.documentElement.scrollTop / (documentHeight - windowHeight);
  scrollPosition = easeInOut(rawScrollPosition, 4);
}

function generate() {
  const particles = { a: [], b: [] };
  const fontSize = Math.min(canvas.height, canvas.width) * 0.15;
  const density = (0.5 / 200) * fontSize;
  context.font = `${fontSize}px Arial Black`;
  context.fillStyle = "#fff";
  context.strokeStyle = "rgba(255,255,255,0.3)";
  context.lineWidth = fontSize * 0.07;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(
    "a(nother)",
    canvas.width * 0.5,
    canvas.height * 0.5 - fontSize / 2
  );
  context.fillText(
    "machine",
    canvas.width * 0.5,
    canvas.height * 0.5 + fontSize / 2
  );
  context.strokeText(
    "a(nother)",
    canvas.width * 0.5,
    canvas.height * 0.5 - fontSize / 2
  );
  context.strokeText(
    "machine",
    canvas.width * 0.5,
    canvas.height * 0.5 + fontSize / 2
  );

  const data32 = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );
  const dimension = Math.min(canvas.width, canvas.height);

  for (let i = 0; i < data32.length; i++) {
    const alpha = (data32[i] >> 24) & 0xff;
    if (alpha) {
      const alphaGroup = alpha === 255 ? 0 : 1;
      particles.a[alphaGroup] = particles.a[alphaGroup] || [];
      const densityFactor = alphaGroup ? density : density * 0.5;
      if (Math.random() < densityFactor) {
        particles.a[alphaGroup].push(
          new Particle({
            x: i % canvas.width,
            y: (i / canvas.width) | 0,
            alpha,
            dimension,
          })
        );
      }
    }
  }
  particles.a.map((a, i) => {
    particles.b[i] = [...a];
    shuffle(particles.b[i]);
  });
  return particles;
}

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const width = canvas.width * 1.5;
  const height = canvas.height * 1.5;
  const offsetX = canvas.width * -0.25;
  const offsetY = canvas.height * -0.25;
  const other = Math.abs(scrollPosition - 0.5) / 0.5;
  particles.a.forEach((alphaGroup, i) => {
    context.fillStyle = `rgba(255,255,255,${i ? 0.2 : other})`;
    context.beginPath();
    alphaGroup.forEach((particle, j) => {
      const destination = particles.b[i][j];
      particle.evolve(
        scrollPosition,
        destination,
        width,
        height,
        offsetX,
        offsetY
      );
      particle.draw(context);
    });
    context.closePath();
    context.fill();
  });
  addGrainNoise(context, canvas, 0.3);
  requestAnimationFrame(animate);
}

function shuffle(array) {
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

function addGrainNoise(context, canvas, intensity = 0.1) {
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = canvas.width;
  noiseCanvas.height = canvas.height;
  const noiseContext = noiseCanvas.getContext("2d");

  const imageData = noiseContext.createImageData(
    noiseCanvas.width,
    noiseCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grayscale = Math.random() * 255;
    data[i] = data[i + 1] = data[i + 2] = grayscale;
    data[i + 3] = intensity * 255;
  }
  noiseContext.putImageData(imageData, 0, 0);
  context.globalAlpha = intensity;
  context.drawImage(noiseCanvas, 0, 0);
  context.globalAlpha = 1;
}
