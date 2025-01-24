export class Interaction {
  scrollY = 0;
  scrollEase = 2;
  cursorEase = 0.1;

  constructor({
    canvas,
    onParticles,
    onResize,
    onScroll,
    toggleSound,
    onToggleSound,
    onClick,
  }) {
    this.canvas = canvas;
    this._onResize = onResize;
    this._onScroll = onScroll;
    this._cursorX = window.innerWidth / 2;
    this._cursorY = window.innerHeight / 2;
    this.toggleSound = toggleSound;
    this.toggleSound.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSound.classList.toggle("active");
      onToggleSound();
    });
    document.querySelectorAll("[data-particles]").forEach((a) => {
      a.addEventListener("mouseenter", () =>
        onParticles(a.getAttribute("data-particles").split(" "))
      );
      a.addEventListener("mouseleave", () => onParticles());
    });
    window.addEventListener("click", () => onClick());
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
    window.addEventListener("mousemove", this.onCursor.bind(this));
    this.onScroll();
  }

  get cursorX() {
    return this._cursorX * (this.canvas.width / window.innerWidth);
  }
  get cursorY() {
    return this._cursorY * (this.canvas.height / window.innerHeight);
  }

  onCursor({ clientX, clientY }) {
    this._cursorX += (clientX - this._cursorX) * this.cursorEase;
    this._cursorY += (clientY - this._cursorY) * this.cursorEase;
  }

  onResize() {
    if (!this._onResize) {
      return;
    }
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
    }
    this._resizeTimeout = setTimeout(() => {
      this._onResize();
    }, 100);
  }

  onScroll(args) {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const rawScrollPosition =
      document.documentElement.scrollTop / (documentHeight - windowHeight);
    this.scrollY = this.easeInOut(rawScrollPosition);
    if (args && this._onScroll) {
      this._onScroll(this.scrollY);
    }
  }

  easeInOut(t) {
    return t < 0.5
      ? Math.pow(t * 2, this.scrollEase) / 2
      : 1 - Math.pow((1 - t) * 2, this.scrollEase) / 2;
  }
}
