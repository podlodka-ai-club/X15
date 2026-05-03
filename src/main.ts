import "./styles.css";

import { products, type Product } from "./products";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(priceCents: number): string {
  return currencyFormatter.format(priceCents / 100);
}

export function renderProductCard(product: Product): HTMLElement {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.productId = product.id;

  const title = document.createElement("h3");
  title.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const footer = document.createElement("div");
  footer.className = "product-card__footer";

  const price = document.createElement("span");
  price.className = "product-card__price";
  price.textContent = formatPrice(product.priceCents);

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Add";
  button.setAttribute("aria-label", `Add ${product.name} to cart`);

  footer.append(price, button);
  card.append(title, description, footer);

  return card;
}

export function renderStorefront(
  root: HTMLElement,
  productList = products,
): void {
  root.replaceChildren();

  const shell = document.createElement("main");
  shell.className = "storefront";

  const header = document.createElement("header");
  header.className = "storefront__header";

  const eyebrow = document.createElement("p");
  eyebrow.className = "storefront__eyebrow";
  eyebrow.textContent = "X15 Storefront";

  const heading = document.createElement("h1");
  heading.textContent = "Curated essentials for everyday work";

  const intro = document.createElement("p");
  intro.textContent =
    "Browse a small static catalog while cart and checkout foundations are prepared for future ecommerce flows.";

  header.append(eyebrow, heading, intro);

  const content = document.createElement("div");
  content.className = "storefront__content";

  const catalogSection = document.createElement("section");
  catalogSection.className = "catalog";
  catalogSection.setAttribute("aria-labelledby", "catalog-heading");

  const catalogHeading = document.createElement("h2");
  catalogHeading.id = "catalog-heading";
  catalogHeading.textContent = "Products";

  const productGrid = document.createElement("div");
  productGrid.className = "product-grid";

  if (productList.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "catalog__empty";
    emptyState.textContent = "No products are available yet.";
    productGrid.append(emptyState);
  } else {
    productGrid.append(
      ...productList.map((product) => renderProductCard(product)),
    );
  }

  catalogSection.append(catalogHeading, productGrid);

  const sidebar = document.createElement("aside");
  sidebar.className = "checkout-panel";

  const cartSummary = document.createElement("section");
  cartSummary.className = "summary-card";
  cartSummary.setAttribute("aria-labelledby", "cart-heading");

  const cartHeading = document.createElement("h2");
  cartHeading.id = "cart-heading";
  cartHeading.textContent = "Cart Summary";

  const cartCopy = document.createElement("p");
  cartCopy.textContent = "Your cart is ready for future item tracking.";

  const cartTotal = document.createElement("strong");
  cartTotal.textContent = "0 items - $0.00";

  cartSummary.append(cartHeading, cartCopy, cartTotal);

  const checkout = document.createElement("section");
  checkout.className = "summary-card";
  checkout.setAttribute("aria-labelledby", "checkout-heading");

  const checkoutHeading = document.createElement("h2");
  checkoutHeading.id = "checkout-heading";
  checkoutHeading.textContent = "Checkout";

  const checkoutCopy = document.createElement("p");
  checkoutCopy.textContent =
    "Checkout details will connect here when payments and fulfillment are in scope.";

  const checkoutButton = document.createElement("button");
  checkoutButton.type = "button";
  checkoutButton.disabled = true;
  checkoutButton.textContent = "Checkout placeholder";

  checkout.append(checkoutHeading, checkoutCopy, checkoutButton);
  sidebar.append(cartSummary, checkout);

  content.append(catalogSection, sidebar);
  shell.append(header, content);
  root.append(shell);
}

export function mountStorefront(): void {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("App root element was not found.");
  }

  renderStorefront(app);
}

if (import.meta.env.MODE !== "test") {
  mountStorefront();
}
