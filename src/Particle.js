export class Particle {
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
  rotateSpeed = Math.random() * 0.05 * 2;

  midpoint = Math.random() * 0.5 + 0.375;

  resistance = Math.random();

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
    const progressNormal = Math.abs(progress - 0.5) / 0.5;
    const progressRelative = 1 - progressNormal;
    this.radius = (1 - progressNormal * 0.95) * this.radiusBase;

    const distance = Math.max(width, height);
    const offset = Math.min(offsetX, offsetY);
    const chaosX = this.foreignX * distance + offset;
    const chaosY = this.foreignY * distance + offset;

    const attractionDistance = distance * (progressRelative * 10);
    const attractionStrength = 0.8 * progressRelative * (1 - this.resistance);
    const dx = cursorX - this.x;
    const dy = cursorY - this.y;
    const distToCursor = Math.sqrt(dx * dx + dy * dy);

    const attractionInfluenceFactor = Math.max(
      0,
      Math.min(1, (attractionDistance - distToCursor) / attractionDistance)
    );

    const adjustedX =
      this.x + dx * attractionStrength * attractionInfluenceFactor;
    const adjustedY =
      this.y + dy * attractionStrength * attractionInfluenceFactor;

    // Setting the uninfluenced coordinates
    if (progress <= this.midpoint) {
      const factor = progress / this.midpoint;
      this.x = (chaosX - this.initialX) * factor + this.initialX;
      this.y = (chaosY - this.initialY) * factor + this.initialY;
    } else {
      const factor = (progress - this.midpoint) / (1 - this.midpoint);
      this.x = (destination.initialX - chaosX) * factor + chaosX;
      this.y = (destination.initialY - chaosY) * factor + chaosY;
    }

    // Setting influenced coordinates
    if (attractionInfluenceFactor) {
      this.x =
        (1 - attractionInfluenceFactor) * this.x +
        attractionInfluenceFactor * adjustedX;
      this.y =
        (1 - attractionInfluenceFactor) * this.y +
        attractionInfluenceFactor * adjustedY;
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
