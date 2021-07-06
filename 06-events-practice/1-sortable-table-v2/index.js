export default class SortableTable {
  constructor(
    headerConfig,
    { data = [], sorted = {}, isSortLocally = true } = {}
  ) {
    this.data = data;
    this.headerConfig = headerConfig;
    this.sortId = sorted.id;
    this.sortOrder = sorted.order;
    this.isSortLocally = isSortLocally;

    this.render();
    this.sort(this.sortId, this.sortOrder);
    this.subElements.header.addEventListener("pointerdown", this.sortHandler);
  }

  sortHandler = (event) => {
    if (event.target.closest(".sortable-table__cell[data-id]")) {
      const id = event.target.parentNode.dataset.id;
      const sortable = event.target.parentNode.dataset.sortable;
      let order = event.target.parentNode.dataset.order;

      switch (order) {
        case "asc":
          order = "desc";
          break;
        case "desc":
        default:
          order = "asc";
          break;
      }

      if (sortable === "true") {
        this.sort(id, order);
      }
    }
  };

  getHeader() {
    const header = [];

    for (let item of this.headerConfig) {
      header.push(`
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
          <span>${item.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
          </span>
        </div>
      `);
    }

    return header.map((item) => item).join("");
  }

  getRows(data) {
    const rows = [];

    for (let item of data) {
      const row = [];

      for (let { template, id } of this.headerConfig) {
        row.push(
          template
            ? template(item[id])
            : `<div class="sortable-table__cell">${item[id]}</div>`
        );
      }

      rows.push(`
        <a href="/products/${item.id}" class="sortable-table__row">
          ${row.join("")}
        </a>
      `);
    }

    return rows.join("");
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getRows(this.data)}
        </div>
      </div>
    `;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (let subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  sort(id, order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
    this.sortId = id;
    this.sortOrder = order;

    const allColumns = this.element.querySelectorAll(
      ".sortable-table__cell[data-id]"
    );
    const currentColumn = this.element.querySelector(
      `.sortable-table__cell[data-id="${id}"]`
    );
    allColumns.forEach((column) => {
      column.dataset.order = "";
    });
    currentColumn.dataset.order = order;

    const sortData = this.data;
    const sortType = this.headerConfig.find((x) => x.id === id).sortType;
    const sortDirection = {
      asc: 1,
      desc: -1,
    };

    switch (sortType) {
      case "number":
      default:
        sortData.sort((a, b) => sortDirection[order] * (a[id] - b[id]));
        break;
      case "string":
        sortData.sort(
          (a, b) =>
            sortDirection[order] * a[id].localeCompare(b[id], ["ru", "en"])
        );
        break;
    }

    this.subElements.body.innerHTML = this.getRows(sortData);
  }

  sortOnServer(id, order) {
    this.subElements.body.innerHTML = "";
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
