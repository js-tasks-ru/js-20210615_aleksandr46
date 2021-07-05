export default class NotificationMessage {
  static activeNotification;

  constructor(message, { duration = 2000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    this.durationStyle = this.duration / 1000;
    this.type = type;

    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${this.durationStyle}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
  }

  show(root = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    root.append(this.element);
    this.timer = setTimeout(() => {
      this.remove();
    }, this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    if (this.element) {
      clearTimeout(this.timer);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
