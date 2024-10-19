export class Particle {
  static PI2 = Math.PI * 2;
  static radius = 0.75;

  angle = Math.random() * Particle.PI2 * 2 - Particle.PI2;
  angleBase = this.angle;
  angleIncrement = Math.random() * 4 - 2;

  baseX = 0;
  baseY = 0;

  controlX = [0, 0];
  controlY = [0, 0];

  enableLine = Math.random() > 0.9;

  foreignX = Math.random();
  foreignY = Math.random();

  radius = 0;
  rotateSpeed = Math.random() * 0.05 * 2;

  midpoint = Math.random() * 0.5 + 0.375;

  constructor({ x, y, alpha, dimension }) {
    this.radiusBase = Math.random() * dimension * 0.1;
    this.initialX = x;
    this.initialY = y;

    this.x = this.initialX;
    this.y = this.initialY;
    this.alpha = alpha;
  }

  evolve({
    progress,
    cursorX,
    cursorY,
    destination,
    width,
    height,
    offsetX,
    offsetY,
  }) {
    const progressNormal = (Math.abs(progress - 0.5) / 0.5) * 0.9999 + 0.0001;
    this.radius = (1 - progressNormal * 0.95) * this.radiusBase;

    const distance = Math.max(width, height);
    const offset = Math.min(offsetX, offsetY);
    const chaosX = this.foreignX * distance + offset;
    const chaosY = this.foreignY * distance + offset;

    // 0 - ~50% (before midpoint)
    if (progress <= this.midpoint) {
      const factor = progress / this.midpoint;
      this.x = (chaosX - this.initialX) * factor + this.initialX;
      this.y = (chaosY - this.initialY) * factor + this.initialY;
    }
    // ~50% - 100% (after midpoint)
    else {
      const factor = (progress - this.midpoint) / (1 - this.midpoint);
      this.x = (destination.initialX - chaosX) * factor + chaosX;
      this.y = (destination.initialY - chaosY) * factor + chaosY;
    }

    // The curve control point used in stroke
    const startX = this.x;
    const startY = this.y;
    const endX = destination.x;
    const endY = destination.y;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const distToCursor = Math.sqrt(
      (cursorX - midX) ** 2 + (cursorY - midY) ** 2
    );

    const curveAmount = Math.min(1, Math.max(0, distToCursor / 200));
    this.controlX = [
      midX + (cursorX - midX) * curveAmount * 0.25,
      midX + (cursorX - midX) * curveAmount * 0.75,
    ];
    this.controlY = [
      midY + (cursorY - midY) * curveAmount * 0.25,
      midY + (cursorY - midY) * curveAmount * 0.75,
    ];
  }

  fill({ context }) {
    const dx = Math.sin(this.angle * this.rotateSpeed) * this.radius;
    const dy = Math.cos(this.angle * this.rotateSpeed) * this.radius;
    context.moveTo(this.x + dx, this.y + dy);
    context.arc(this.x + dx, this.y + dy, Particle.radius, 0, Particle.PI2);
    this.angle += this.angleIncrement;
  }

  stroke({ context, destination }) {
    if (!this.enableLine) {
      return;
    }

    const dx = Math.sin(this.angle * this.rotateSpeed) * this.radius;
    const dy = Math.cos(this.angle * this.rotateSpeed) * this.radius;

    const startX = this.x + dx;
    const startY = this.y + dy;
    const endX = destination.x;
    const endY = destination.y;

    context.moveTo(startX, startY);
    context.bezierCurveTo(
      this.controlX[0],
      this.controlY[0],
      this.controlX[1],
      this.controlY[1],
      endX,
      endY
    );
  }
}
