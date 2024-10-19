export class Interaction {
  cursorX = 0;
  cursorY = 0;
  scrollY = 0;
  scrollEase = 3;

  constructor() {
    window.addEventListener("scroll", this.updateScrollPosition.bind(this));
    window.addEventListener("mousemove", this.updateCursorPosition.bind(this));
    window.addEventListener("touchmove", this.updateCursorPosition.bind(this));
    this.updateScrollPosition();
  }

  updateCursorPosition({ clientX, clientY }) {
    this.cursorX = clientX;
    this.cursorY = clientY;
  }
  updateScrollPosition() {
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
