export class Interaction {
  cursorX = window.innerWidth / 2;
  cursorY = window.innerHeight / 2;
  scrollY = 0;
  scrollEase = 2;

  constructor(props = {}) {
    this._onResize = props.onResize;
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
    window.addEventListener("mousemove", this.onCursor.bind(this));
    window.addEventListener("touchmove", this.onCursor.bind(this));
    this.onScroll();
  }

  onCursor({ clientX, clientY }) {
    this.cursorX = clientX;
    this.cursorY = clientY;
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
    }, 200);
  }

  onScroll() {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const rawScrollPosition =
      document.documentElement.scrollTop / (documentHeight - windowHeight);
    this.scrollY = this.easeInOut(rawScrollPosition);
  }

  easeInOut(t) {
    return t < 0.5
      ? Math.pow(t * 2, this.scrollEase) / 2
      : 1 - Math.pow((1 - t) * 2, this.scrollEase) / 2;
  }
}
