import {
  cartSummary,
  checkoutPlaceholder,
  products,
  type Product,
} from "./shop-data";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  textContent?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function createHeader(): HTMLElement {
  const header = createElement("header", "site-header");
  const eyebrow = createElement("p", "site-header__eyebrow", "X15 Storefront");
  const title = createElement("h1", undefined, "Commerce skeleton");
  const summary = createElement(
    "p",
    "site-header__summary",
    "A lightweight storefront foundation for catalog, cart, and checkout work.",
  );

  header.append(eyebrow, title, summary);
  return header;
}

function createProductCard(product: Product): HTMLElement {
  const article = createElement("article", "product-card");
  const category = createElement(
    "p",
    "product-card__category",
    product.category,
  );
  const name = createElement("h3", undefined, product.name);
  const description = createElement(
    "p",
    "product-card__description",
    product.description,
  );
  const price = createElement(
    "p",
    "product-card__price",
    currencyFormatter.format(product.price),
  );

  article.append(category, name, description, price);
  return article;
}

function createProductGrid(): HTMLElement {
  const section = createElement("section", "store-section");
  section.setAttribute("aria-labelledby", "products-heading");

  const heading = createElement("h2", undefined, "Product grid");
  heading.id = "products-heading";

  const intro = createElement(
    "p",
    "store-section__intro",
    "Placeholder products rendered from local static data.",
  );
  const grid = createElement("div", "product-grid");
  grid.append(...products.map(createProductCard));

  section.append(heading, intro, grid);
  return section;
}

function createCartSummary(): HTMLElement {
  const section = createElement(
    "section",
    "store-section store-section--summary",
  );
  section.setAttribute("aria-labelledby", "cart-heading");

  const heading = createElement("h2", undefined, "Cart summary");
  heading.id = "cart-heading";

  const body = createElement(
    "p",
    "summary-panel",
    `${cartSummary.itemCount} items selected. Subtotal ${currencyFormatter.format(cartSummary.subtotal)}.`,
  );
  const note = createElement(
    "p",
    "store-section__intro",
    "Cart interactions are intentionally reserved for a future implementation.",
  );

  section.append(heading, body, note);
  return section;
}

function createCheckoutPlaceholder(): HTMLElement {
  const section = createElement(
    "section",
    "store-section store-section--checkout",
  );
  section.setAttribute("aria-labelledby", "checkout-heading");

  const heading = createElement("h2", undefined, "Checkout");
  heading.id = "checkout-heading";

  const body = createElement("p", "summary-panel", checkoutPlaceholder);

  section.append(heading, body);
  return section;
}

function renderStorefront(root: HTMLElement): void {
  const page = createElement("main", "storefront");

  page.append(
    createHeader(),
    createProductGrid(),
    createCartSummary(),
    createCheckoutPlaceholder(),
  );

  root.replaceChildren(page);
}

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("App root not found");
}

renderStorefront(appRoot);
