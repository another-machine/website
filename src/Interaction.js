export class Interaction {
  scrollY = 0;
  scrollEase = 2;
  cursorEase = 0.1;

  constructor({
    onResize,
    onScroll,
    centerX,
    centerY,
    toggleSound,
    onToggleSound,
    toggleVisible,
    onToggleVisible,
    onClick,
  }) {
    this._onResize = onResize;
    this._onScroll = onScroll;
    this.cursorX = centerX;
    this.cursorY = centerY;
    this.toggleSound = toggleSound;
    this.toggleSound.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSound.classList.toggle("active");
      onToggleSound();
    });
    this.toggleVisible = toggleVisible;
    this.toggleVisible.addEventListener("click", () => {
      this.toggleVisible.classList.toggle("active");
      onToggleVisible();
    });
    window.addEventListener("click", () => onClick());
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
    window.addEventListener("mousemove", this.onCursor.bind(this));
    this.onScroll();
  }

  onCursor({ clientX, clientY }) {
    this.cursorX += (clientX - this.cursorX) * this.cursorEase;
    this.cursorY += (clientY - this.cursorY) * this.cursorEase;
  }

  onResize() {
    if (!this._onResize) {
      return;
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this._onResize();
    }, 50);
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
