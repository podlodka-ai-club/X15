import "./styles.css";
import {
  calculateCartSummary,
  formatPrice,
  products,
  type Product,
} from "./storefront";

function renderProductCard(product: Product): string {
  return `
    <article class="product-card">
      <div class="product-card__media" aria-label="${product.imageAlt}">
        ${product.name.charAt(0)}
      </div>
      <div class="product-card__body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      </div>
      <div class="product-card__footer">
        <strong>${formatPrice(product.priceCents)}</strong>
        <button type="button" disabled>Add soon</button>
      </div>
    </article>
  `;
}

export function renderStorefront(catalog: Product[] = products): string {
  const cartSummary = calculateCartSummary([], catalog);
  const productCards = catalog.map(renderProductCard).join("");

  return `
    <header class="site-header">
      <nav class="site-header__nav" aria-label="Storefront navigation">
        <a class="brand" href="/">X15 Store</a>
        <div class="site-header__links">
          <a href="#products">Products</a>
          <a href="#cart">Cart</a>
          <a href="#checkout">Checkout</a>
        </div>
      </nav>
    </header>

    <main>
      <section class="intro" aria-labelledby="intro-title">
        <p class="eyebrow">Minimal ecommerce foundation</p>
        <h1 id="intro-title">A small storefront shell for X15.</h1>
        <p>
          Browse a starter catalog, review the cart placeholder, and keep checkout
          ready for future product work.
        </p>
      </section>

      <section id="products" class="store-section" aria-labelledby="products-title">
        <div class="section-heading">
          <p class="eyebrow">Catalog</p>
          <h2 id="products-title">Featured products</h2>
        </div>
        <div class="product-grid">
          ${productCards}
        </div>
      </section>

      <section id="cart" class="store-section store-section--split" aria-labelledby="cart-title">
        <div>
          <p class="eyebrow">Cart</p>
          <h2 id="cart-title">Cart summary</h2>
          <p>Your cart is ready for future item selection work.</p>
        </div>
        <aside class="summary-panel" aria-label="Cart summary placeholder">
          <span>${cartSummary.itemCount} items</span>
          <strong>${formatPrice(cartSummary.subtotalCents)}</strong>
        </aside>
      </section>

      <section id="checkout" class="store-section store-section--split" aria-labelledby="checkout-title">
        <div>
          <p class="eyebrow">Checkout</p>
          <h2 id="checkout-title">Checkout placeholder</h2>
          <p>Payment, shipping, accounts, and fulfillment are intentionally out of scope.</p>
        </div>
        <button type="button" disabled>Checkout coming soon</button>
      </section>
    </main>
  `;
}

const app =
  typeof document === "undefined"
    ? null
    : document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = renderStorefront(products);
}
