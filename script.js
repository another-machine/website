import { Interaction } from "./src/Interaction.js";
import { Oscillators } from "./src/Oscillators.js";
import { Particles } from "./src/Particles.js";

const canvas = document.getElementById("canvas-main");
const context = canvas.getContext("2d");
const noiseCanvas = document.getElementById("canvas-noise");
const noiseContext = noiseCanvas.getContext("2d");

resizeCanvases();

const oscillators = new Oscillators();
const particles = new Particles({ canvas, context });
particles.setup();
const interaction = new Interaction({
  onResize: () => {
    resizeCanvases();
    particles.setup();
  },
  onClick: () => {
    oscillators.initialize();
  },
});

function resizeCanvases() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  noiseCanvas.width = window.innerWidth;
  noiseCanvas.height = window.innerHeight;
}

animate();

function animate() {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);
  particles.render(interaction);
  oscillators.evolve(interaction);
  addGrainNoise(noiseCanvas, noiseContext, 0.35);
}

function addGrainNoise(canvas, context, intensity = 0.1) {
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
  context.clearRect(0, 0, canvas.width, canvas.height);
  noiseContext.putImageData(imageData, 0, 0);
  context.globalAlpha = intensity;
  context.drawImage(noiseCanvas, 0, 0);
  context.globalAlpha = 1;
}
