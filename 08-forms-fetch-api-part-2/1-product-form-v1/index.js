import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";
const CATEGORIES_URL = "/api/rest/categories";
const PRODUCTS_URL = "/api/rest/products";

export default class ProductForm {
  element;

  onSelectImage = () => {
    this.inputImage.click();
  };

  onUploadImage = async () => {
    const formData = new FormData();
    formData.append("image", this.inputImage.files[0]);
    const nameImageFile = this.inputImage.files[0].name;

    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: "",
      });

      const imageData = await response.json();

      if (imageData.success) {
        const newImageElement = this.getFormImage(
          imageData.data.link,
          nameImageFile
        );
        this.subElements.sortableList.insertAdjacentHTML(
          "beforeend",
          newImageElement
        );
        this.productData.images.push({
          url: imageData.data.link,
          source: nameImageFile,
        });
      }
    } catch (error) {
      alert("Ошибка загрузки изображения");
      console.error(error);
    }
  };

  save = async () => {
    const { productForm } = this.subElements;

    const dataNew = {
      id: this.productData.id,
      discount: +productForm.querySelector(`#discount`).value,
      price: +productForm.querySelector(`#price`).value,
      quantity: +productForm.querySelector(`#quantity`).value,
      status: +productForm.querySelector(`#status`).value,
      title: productForm.querySelector(`#title`).value,
      description: productForm.querySelector(`#description`).value,
      subcategory: productForm.querySelector(`#subcategory`).value,
      images: this.productData.images,
    };

    try {
      const response = await fetch(`${BACKEND_URL}${PRODUCTS_URL}`, {
        method: "PATCH",
        body: JSON.stringify(dataNew),
        referrer: "",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      let event = new Event("product-updated");
      this.element.dispatchEvent(event);

      return await response.json();
    } catch (error) {
      alert("Ошибка при сохранении товара");
      console.error(error);
    }
  };

  constructor(productId) {
    this.productId = productId;
  }

  async loadCategories(sort = "weight", refs = "subcategory") {
    const url = new URL(CATEGORIES_URL, BACKEND_URL);
    url.searchParams.set("_sort", sort);
    url.searchParams.set("_refs", refs);

    const data = await fetchJson(url);
    return data;
  }

  async loadProduct() {
    const url = new URL(PRODUCTS_URL, BACKEND_URL);
    url.searchParams.set("id", this.productId);

    const data = await fetchJson(url);
    return data;
  }

  async render() {
    const data = await Promise.all([this.loadCategories(), this.loadProduct()]);
    this.categoriesData = data[0];
    this.productData = data[1][0];

    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getForm();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.uploadImage.addEventListener("click", this.onSelectImage);
    this.inputImage.addEventListener("change", this.onUploadImage);
    this.subElements.productForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.save();
    });
  }

  getForm() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input value="${escapeHtml(this.productData.title)}" required="" 
                type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара">
              ${escapeHtml(this.productData.description)}
            </textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            ${this.getFormImages()}
          </div>
          <div class="form-group form-group__half_left">
            ${this.getFormCategories()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input value="${this.productData.price}" required="" 
                type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input value="${this.productData.discount}" required="" 
                type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input value="${this.productData.quantity}" required="" 
              type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            ${this.getFormStatus()}
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
    </div>
    `;
  }

  getFormImages() {
    this.inputImage = document.createElement("input");
    this.inputImage.type = "file";

    const imageItems = this.productData.images
      .map((images) => {
        return this.getFormImage(images.url, images.source);
      })
      .join("");

    return `
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer">
        <ul class="sortable-list" data-element="sortableList">
          ${imageItems}
        </ul>
      </div>
      <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
    `;
  }

  getFormImage(url, source) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" referrerpolicy="no-referrer" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  getFormCategories() {
    const options = this.categoriesData
      .map((category) => {
        return category.subcategories
          .map((subcategory) => {
            const selected =
              this.productData.subcategory === subcategory.id ? "selected" : "";
            return `<option ${selected} value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`;
          })
          .join("");
      })
      .join("");

    return `
      <label class="form-label">Категория</label>
      <select class="form-control" name="subcategory" id="subcategory">
        ${options}        
      </select>
    `;
  }

  getFormStatus() {
    const status = this.productData.status;
    return `
      <label class="form-label">Статус</label>
      <select class="form-control" name="status" id="status">
        <option ${status === 1 ? "selected" : ""} value="1">Активен</option>
        <option ${status === 0 ? "selected" : ""} value="0">Неактивен</option>
      </select>
    `;
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
