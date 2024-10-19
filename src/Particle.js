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

  resistance = Math.random() * 10;
  enableAttraction = Math.random() > 0.5;
  enableLine = Math.random() > 0.8;

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
    const dx = cursorX - this.x;
    const dy = cursorY - this.y;
    const distToCursor = Math.sqrt(dx * dx + dy * dy);
    const distance = Math.max(width, height);
    const offset = Math.min(offsetX, offsetY);
    const chaosX = this.foreignX * distance + offset;
    const chaosY = this.foreignY * distance + offset;

    const attraction = {};

    if (this.enableAttraction) {
      attraction.distance = distance * 0.5 * progressRelative;
      attraction.strength = progressRelative * (1 - this.resistance);
      attraction.influenceFactor = Math.max(
        0,
        Math.min(1, (attraction.distance - distToCursor) / attraction.distance)
      );

      attraction.x =
        this.x + dx * attraction.strength * attraction.influenceFactor;
      attraction.y =
        this.y + dy * attraction.strength * attraction.influenceFactor;
    }

    // Setting influenced coordinates
    if (attraction && attraction.influenceFactor) {
      this.x =
        (1 - attraction.influenceFactor) * this.x +
        attraction.influenceFactor * attraction.x;
      this.y =
        (1 - attraction.influenceFactor) * this.y +
        attraction.influenceFactor * attraction.y;
    } // Setting the uninfluenced coordinates
    else {
      // 0 - ~50%
      if (progress <= this.midpoint) {
        const factor = progress / this.midpoint;
        this.x = (chaosX - this.initialX) * factor + this.initialX;
        this.y = (chaosY - this.initialY) * factor + this.initialY;
      }
      // ~50% - 100%
      else {
        const factor = (progress - this.midpoint) / (1 - this.midpoint);
        this.x = (destination.initialX - chaosX) * factor + chaosX;
        this.y = (destination.initialY - chaosY) * factor + chaosY;
      }
    }
  }

  fill(context) {
    const dx = Math.sin(this.angle * this.rotateSpeed) * this.radius;
    const dy = Math.cos(this.angle * this.rotateSpeed) * this.radius;
    context.moveTo(this.x + dx, this.y + dy);
    context.arc(this.x + dx, this.y + dy, Particle.radius, 0, Particle.PI2);
    this.angle += this.angleIncrement;
  }

  stroke(context, destination) {
    if (!this.enableLine) {
      return;
    }
    const dx = Math.sin(this.angle * this.rotateSpeed) * this.radius;
    const dy = Math.cos(this.angle * this.rotateSpeed) * this.radius;
    context.moveTo(this.x + dx, this.y + dy);
    context.lineTo(destination.x, destination.y);
  }
}
