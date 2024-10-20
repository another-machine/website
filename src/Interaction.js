export class Interaction {
  cursorX = window.innerWidth / 2;
  cursorY = window.innerHeight / 2;
  scrollY = 0;
  scrollEase = 2;
  cursorEase = 0.1;

  constructor(props = {}) {
    this._onResize = props.onResize;
    this._onScroll = props.onScroll;
    this.toggleSound = props.toggleSound;
    this.toggleSound.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSound.classList.toggle("active");
      props.onToggleSound();
    });
    this.toggleVisible = props.toggleVisible;
    this.toggleVisible.addEventListener("click", () => {
      this.toggleVisible.classList.toggle("active");
      props.onToggleVisible();
    });
    window.addEventListener("click", () => props.onClick());
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
