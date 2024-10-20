export class GrainNoise {
  constructor({ context, canvas }) {
    this.onCanvas = canvas;
    this.onContext = context;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
  }

  render(intensity = 0.1) {
    this.canvas.width = this.onCanvas.width;
    this.canvas.height = this.onCanvas.height;
    const imageData = this.context.createImageData(
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const grayscale = Math.random() * 255;
      data[i] = data[i + 1] = data[i + 2] = grayscale;
      data[i + 3] = intensity * 255;
    }
    this.onContext.clearRect(0, 0, this.onCanvas.width, this.onCanvas.height);
    this.context.putImageData(imageData, 0, 0);
    this.onContext.globalAlpha = intensity;
    this.onContext.drawImage(this.canvas, 0, 0);
    this.onContext.globalAlpha = 1;
  }
}
