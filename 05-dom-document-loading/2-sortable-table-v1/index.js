export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.data = data;
    this.headerConfig = headerConfig;
    this.sortField = "";
    this.sortOrder = "";
    this.render();
  }

  getHeader() {
    const header = [];

    for (let item of this.headerConfig) {
      const dataOrder =
        this.sortField === item.id ? `data-order=${this.sortOrder}` : "";

      header.push(`
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" ${dataOrder}>
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

  sort(field, order) {
    this.sortField = field;
    this.sortOrder = order;

    const sortData = [...this.data];
    const sortType = this.headerConfig.find((x) => x.id === field).sortType;
    const sortDirection = {
      asc: 1,
      desc: -1,
    };

    if (sortType === "string") {
      sortData.sort(
        (a, b) =>
          a[field].localeCompare(b[field], ["ru", "en"], {
            caseFirst: "upper",
          }) * sortDirection[order]
      );
    }

    if (sortType === "number") {
      sortData.sort((a, b) => (a[field] - b[field]) * sortDirection[order]);
    }

    this.subElements.header.innerHTML = this.getHeader();
    this.subElements.body.innerHTML = this.getRows(sortData);
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
