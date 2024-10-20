export class Particle {
  static PI2 = Math.PI * 2;
  // static dotRadiusMax = 1;
  // static dotRadiusMin = 0.6;
  static dotRadiusMax = 1.2;
  static dotRadiusMin = 0.8;
  static dotRadiusDiff = Particle.dotRadiusMax - Particle.dotRadiusMin;

  static radiusForProgress(progress) {
    return progress * Particle.dotRadiusDiff + Particle.dotRadiusMin;
  }

  angle = Math.random() * Particle.PI2 * 2 - Particle.PI2;
  angleBase = this.angle;
  angleIncrement = Math.random() * 4 - 2;

  chaosX = 0;
  chaosY = 0;

  foreignX = Math.random();
  foreignY = Math.random();

  midpoint = Math.random() * 0.5 + 0.375;

  radius = 0;
  renderX = 0;
  renderY = 0;
  returnSpeed = Math.random() * 0.05 + 0.025;
  rotateSpeed = Math.random() * 0.05 * 2;

  constructor({ x, y, centerX, centerY, alpha, dimension }) {
    this.radiusBase = Math.random() * dimension * 0.1;
    this.endX = centerX + (x - centerX) * 1.3;
    this.endY = centerY + (y - centerY) * 1.3;

    this.startX = centerX + (x - centerX) * 0.7;
    this.startY = centerY + (y - centerY) * 0.7;

    this.x = this.startX;
    this.y = this.startY;
    this.renderX = this.x;
    this.renderY = this.y;

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
    this.radius = (1 - progressNormal * 0.95) * this.radiusBase;

    const offset = Math.min(offsetX, offsetY);
    this.chaosX = this.foreignX * width + offset;
    this.chaosY = this.foreignY * height + offset;

    // 0 - ~50% (before midpoint)
    if (progress <= this.midpoint) {
      const factor = progress / this.midpoint;
      this.x = (this.chaosX - this.startX) * factor + this.startX;
      this.y = (this.chaosY - this.startY) * factor + this.startY;
    }
    // ~50% - 100% (after midpoint)
    else {
      const factor = (progress - this.midpoint) / (1 - this.midpoint);
      this.x = (destination.endX - this.chaosX) * factor + this.chaosX;
      this.y = (destination.endY - this.chaosY) * factor + this.chaosY;
    }

    const distToCursor = Math.sqrt(
      (cursorX - this.x) ** 2 + (cursorY - this.y) ** 2
    );
    const effectiveCursorRadius = cursorRadius * (1 - progressNormal); // Ensure it's at least 1

    // Gradually return to the original position if the cursor is not close
    if (distToCursor > effectiveCursorRadius) {
      this.renderX += (this.x - this.renderX) * this.returnSpeed;
      this.renderY += (this.y - this.renderY) * this.returnSpeed;
    } else {
      const normalizedDist = Math.min(distToCursor / effectiveCursorRadius, 1); // Normalize distance
      const pushStrength = Math.pow(1 - normalizedDist, 3); // Cubic function for a stronger push effect

      // Calculate offsets based on cursor position and push strength
      const influencedX = (this.x - cursorX) * pushStrength;
      const influencedY = (this.y - cursorY) * pushStrength;

      // Apply force to render positions
      this.renderX = this.x + influencedX;
      this.renderY = this.y + influencedY;
    }
  }

  fill({ context, size }) {
    const dx = Math.sin(this.angle * this.rotateSpeed) * this.radius;
    const dy = Math.cos(this.angle * this.rotateSpeed) * this.radius;
    context.moveTo(this.renderX + dx, this.renderY + dy);
    context.arc(this.renderX + dx, this.renderY + dy, size, 0, Particle.PI2);
    this.angle += this.angleIncrement;
  }
}
