export class Particle {
  static PI2 = Math.PI * 2;
  static dotRadiusMax = 1.2;
  static dotRadiusMin = 0.8;
  static dotRadiusDiff = Particle.dotRadiusMax - Particle.dotRadiusMin;
  static tableSize = 360 * 1;
  static sin = new Float32Array(Particle.tableSize);
  static cos = new Float32Array(Particle.tableSize);

  static {
    for (let i = 0; i < Particle.tableSize; i++) {
      const rad = (i * Math.PI) / (Particle.tableSize / 4);
      Particle.sin[i] = Math.sin(rad);
      Particle.cos[i] = Math.cos(rad);
    }
  }

  static radiusForProgress(progress) {
    return progress * Particle.dotRadiusDiff + Particle.dotRadiusMin;
  }

  constructor(settings) {
    this.reset(settings);
  }

  reset(
    settings = {
      x: 0,
      y: 0,
      centerX: 0,
      centerY: 0,
      alpha: 0,
      dimension: 0,
    }
  ) {
    const { x, y, centerX, centerY, alpha, dimension } = settings;
    this.angle = Math.random() * Particle.PI2 * 2 - Particle.PI2;
    this.angleBase = this.angle;
    this.angleClockwise = Math.random() < 0.5;
    this.angleIncrement = Math.random() * 3 + 1.5;

    this.foreignX = Math.random();
    this.foreignY = Math.random();

    this.midpoint = Math.random() * 0.5 + 0.375;

    this.radius = 0;
    this.renderRadius = 0;
    this.returnSpeed = Math.random() * 0.2 + 0.02;
    this.rotateSpeed = Math.random() * 0.4 + 0.2;
    this.positionStart = new Float32Array([
      centerX + (x - centerX) * 0.7,
      centerY + (y - centerY) * 0.7,
    ]);
    this.positionEnd = new Float32Array([
      centerX + (x - centerX) * 1.3,
      centerY + (y - centerY) * 1.3,
    ]);
    this.positionChaos = new Float32Array([0, 0]);
    this.position = new Float32Array([
      this.positionStart[0],
      this.positionStart[1],
    ]);
    this.render = new Float32Array([this.position[0], this.position[1]]);
    this.chaosRadius = Math.random() * dimension * 0.1;
    this.radius = this.chaosRadius * 0.05;

    this.alpha = alpha;
  }

  evolve({
    progress,
    cursorX,
    cursorY,
    cursorRadius,
    destination,
    width,
    height,
    offsetX,
    offsetY,
  }) {
    const progressNormal = (Math.abs(progress - 0.5) / 0.5) * 0.9999 + 0.0001;
    this.renderRadius =
      (1 - progressNormal) * (this.chaosRadius - this.radius) + this.radius;

    const offset = Math.min(offsetX, offsetY);
    this.positionChaos[0] = this.foreignX * width + offset;
    this.positionChaos[1] = this.foreignY * height + offset;

    // 0 - ~50% (before midpoint)
    if (progress <= this.midpoint) {
      const factor = progress / this.midpoint;
      this.position[0] =
        (this.positionChaos[0] - this.positionStart[0]) * factor +
        this.positionStart[0];
      this.position[1] =
        (this.positionChaos[1] - this.positionStart[1]) * factor +
        this.positionStart[1];
    }
    // ~50% - 100% (after midpoint)
    else {
      const factor = (progress - this.midpoint) / (1 - this.midpoint);
      this.position[0] =
        (destination.positionEnd[0] - this.positionChaos[0]) * factor +
        this.positionChaos[0];
      this.position[1] =
        (destination.positionEnd[1] - this.positionChaos[1]) * factor +
        this.positionChaos[1];
    }

    const distToCursor = Math.sqrt(
      (cursorX - this.position[0]) ** 2 + (cursorY - this.position[1]) ** 2
    );
    const effectiveCursorRadius = cursorRadius * (1 - progressNormal);

    // Gradually return to the original position if the cursor is not close
    if (distToCursor > effectiveCursorRadius) {
      this.render[0] += (this.position[0] - this.render[0]) * this.returnSpeed;
      this.render[1] += (this.position[1] - this.render[1]) * this.returnSpeed;
    } else {
      const normalizedDistance = Math.min(
        distToCursor / effectiveCursorRadius,
        1
      );
      const pushStrength = Math.pow(normalizedDistance, 0.5);

      // Calculate offsets based on cursor position and push strength
      const influencedX = (this.position[0] - cursorX) * pushStrength;
      const influencedY = (this.position[1] - cursorY) * pushStrength;

      const newX = this.position[0] + influencedX;
      const newY = this.position[1] + influencedY;

      // Apply force to render positions
      this.render[0] =
        (newX - this.render[0]) * this.returnSpeed + this.render[0];
      this.render[1] =
        (newY - this.render[1]) * this.returnSpeed + this.render[1];
    }
  }

  force({ destination }) {
    this.render[0] =
      (destination.position[0] - this.render[0]) * this.returnSpeed +
      this.render[0];
    this.render[1] =
      (destination.position[1] - this.render[1]) * this.returnSpeed +
      this.render[1];
    this.renderRadius =
      (this.radius - this.renderRadius) * this.returnSpeed + this.renderRadius;
  }

  fill({ context, size }) {
    const angleIndex = (this.angle * this.rotateSpeed) % Particle.tableSize | 0;
    const dx = Particle.sin[angleIndex] * this.renderRadius;
    const dy =
      (this.angleClockwise ? -1 : 1) *
      Particle.cos[angleIndex] *
      this.renderRadius;
    const x = this.render[0] + dx;
    const y = this.render[1] + dy;

    context.moveTo(x, y);
    context.arc(x, y, size, 0, Particle.PI2);
    this.angle += this.angleIncrement;
  }
}
