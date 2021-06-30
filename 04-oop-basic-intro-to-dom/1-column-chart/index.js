export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    const charts = [];
    if (this.data.length) {
      const columnProps = this.getColumnProps(this.data);
      for (let prop of columnProps) {
        charts.push(`<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`);
      }
    }

    const link = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';

    element.innerHTML = `
      <div class="column-chart ${!charts.length ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${link}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.formatHeading(this.value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${charts.map(item => item).join('')}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
  }

  update(data) {
    this.data = data;
    this.remove();
    this.render();
  }

  initEventListeners () {
    
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
}
