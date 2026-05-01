import "./styles.css";
import {
  calculateCartSummary,
  formatPrice,
  products,
  type CartItem,
  type Product,
} from "./storefront";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Storefront root element #app was not found.");
}

const cartItems: CartItem[] = [];
const cartSummary = calculateCartSummary(cartItems, products);

function renderProductCard(product: Product): string {
  return `
    <article class="product-card">
      <div class="product-card__image" aria-hidden="true">${product.imageLabel}</div>
      <div class="product-card__body">
        <p class="product-card__eyebrow">Home goods</p>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      </div>
      <div class="product-card__footer">
        <strong>${formatPrice(product.priceCents)}</strong>
        <button type="button">Add</button>
      </div>
    </article>
  `;
}

app.innerHTML = `
  <header class="site-header">
    <div>
      <p class="site-header__eyebrow">X15 Commerce</p>
      <h1>Everyday goods for the kitchen counter.</h1>
    </div>
    <a href="#checkout">Checkout</a>
  </header>

  <main>
    <section class="intro" aria-labelledby="intro-title">
      <div>
        <h2 id="intro-title">Storefront Preview</h2>
        <p>
          Browse a small local catalog while cart and checkout flows are prepared for the next
          development slice.
        </p>
      </div>
    </section>

    <section class="storefront-grid" aria-label="Available products">
      ${products.map((product) => renderProductCard(product)).join("")}
    </section>

    <section class="commerce-panels" aria-label="Cart and checkout">
      <aside class="summary-panel" aria-labelledby="cart-summary-title">
        <p class="panel-label">Cart</p>
        <h2 id="cart-summary-title">Cart summary</h2>
        <dl>
          <div>
            <dt>Items selected</dt>
            <dd>${cartSummary.itemCount}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>${formatPrice(cartSummary.subtotalCents)}</dd>
          </div>
        </dl>
        <p class="panel-note">Add-to-cart behavior will be wired in a future storefront task.</p>
      </aside>

      <section class="summary-panel" id="checkout" aria-labelledby="checkout-title">
        <p class="panel-label">Checkout</p>
        <h2 id="checkout-title">Checkout placeholder</h2>
        <p>
          Shipping, payment, and order confirmation are intentionally out of scope for this app
          skeleton.
        </p>
        <button type="button" disabled>Checkout unavailable</button>
      </section>
    </section>
  </main>
`;
