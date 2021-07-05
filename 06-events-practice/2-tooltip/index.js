class Tooltip {
  static instance;

  constructor() {
    if (typeof Tooltip.instance === "object") {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
    return this;
  }

  render(text = "") {
    const element = document.createElement("div");
    element.innerHTML = `<div class="tooltip">${text}</div>`;

    Tooltip.instance.element = element.firstElementChild;
    document.body.append(Tooltip.instance.element);
  }

  show(event) {
    if (event.target.closest("[data-tooltip]")) {
      Tooltip.instance.render(event.target.dataset.tooltip);
      document.body.addEventListener("pointermove", Tooltip.instance.move);
    }
  }

  hide(event) {
    if (event.target.closest("[data-tooltip]")) {
      document.body.removeEventListener("pointermove", Tooltip.instance.move);
      Tooltip.instance.remove();
    }
  }

  move(event) {
    if (event.target.closest("[data-tooltip]")) {
      Tooltip.instance.element.style.top = `${event.clientY + 10}px`;
      Tooltip.instance.element.style.left = `${event.clientX + 10}px`;
    }
  }

  initialize() {
    document.body.addEventListener("pointerover", this.show);
    document.body.addEventListener("pointerout", this.hide);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
