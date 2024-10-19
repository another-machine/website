import { Interaction } from "./src/Interaction.js";
import { Particles } from "./src/Particles.js";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = new Particles({ canvas, context });
particles.setup();
const interaction = new Interaction();

animate();

function animate() {
  requestAnimationFrame(animate);

  context.clearRect(0, 0, canvas.width, canvas.height);
  particles.render(interaction);
  addGrainNoise(context, canvas, 0.3);
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
