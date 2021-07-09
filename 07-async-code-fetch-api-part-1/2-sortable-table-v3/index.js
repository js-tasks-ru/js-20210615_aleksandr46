import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  subElements = {};

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');

    if (column) {
      const id = column.dataset.id;
      const order = column.dataset.order === "desc" ? "asc" : "desc";
      this.sort(id, order);
    }
  };

  constructor(
    headerConfig,
    {
      url = "api/rest/products",
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
      start = 0,
      end = 20,
    } = {}
  ) {
    this.url = url;
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.end = end;

    this.render();
  }

  async getData(id = this.sorted.id, order = this.sorted.order) {
    const url = `${BACKEND_URL}/${this.url}`;
    this.data = await fetchJson(
      `${url}?_start=${this.start}&_end=${this.end}&_sort=${id}&_order=${order}`
    );

    this.subElements.body.innerHTML = this.getRows(this.data);
  }

  async update() {
    await this.getData();
    return this.data;
  }

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
    return data
      .map((item) => {
        const row = this.headerConfig
          .map(({ template, id }) =>
            template
              ? template(item[id])
              : `<div class="sortable-table__cell">${item[id]}</div>`
          )
          .join("");

        return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${row}
        </a>
      `;
      })
      .join("");
  }

  async render() {
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
    this.subElements.header.addEventListener("pointerdown", this.onSortClick);

    await this.update();
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

  sort(id = this.sorted.id, order = this.sorted.order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
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
    this.sortArrow(id, order);
  }

  async sortOnServer(id, order) {
    await this.getData(id, order);
    this.sortArrow(id, order);
  }

  sortArrow(id, order) {
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
