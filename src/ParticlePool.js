import { Particle } from "./Particle.js";

export class ParticlePool {
  constructor(initialSize = 1000) {
    // Pre-allocate array instead of using Set
    this.pool = new Array(initialSize);
    this.size = initialSize;

    // Pre-create particles
    for (let i = 0; i < initialSize; i++) {
      this.pool[i] = new Particle();
    }
  }

  acquire({ x, y, centerX, centerY, alpha, dimension }) {
    let particle;

    if (this.size > 0) {
      // Get particle from pool
      particle = this.pool[--this.size];
      particle.reset({ x, y, centerX, centerY, alpha, dimension });
    } else {
      // Create new particle if pool is empty
      particle = new Particle({
        x,
        y,
        centerX,
        centerY,
        alpha,
        dimension,
      });
    }

    return particle;
  }

  release(particle) {
    if (particle && this.size < this.pool.length) {
      this.pool[this.size++] = particle;
    }
  }

  releaseAll(particles) {
    particles.forEach((group) => {
      group.forEach((particle) => {
        if (this.size < this.pool.length) {
          this.pool[this.size++] = particle;
        }
      });
    });
  }
}
