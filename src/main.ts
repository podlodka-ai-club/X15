import "./styles.css";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

export const products: Product[] = [
  {
    id: "linen-tote",
    name: "Linen Market Tote",
    category: "Bags",
    price: 48,
    description: "A structured daily carry for errands, laptops, and market runs.",
  },
  {
    id: "ceramic-mug",
    name: "Ceramic Desk Mug",
    category: "Home",
    price: 26,
    description: "A balanced stoneware mug for coffee, tea, and long planning sessions.",
  },
  {
    id: "cotton-throw",
    name: "Cotton Grid Throw",
    category: "Home",
    price: 72,
    description: "A soft woven layer with a clean grid pattern for cool evenings.",
  },
  {
    id: "notebook-set",
    name: "Notebook Set",
    category: "Stationery",
    price: 18,
    description: "Three lay-flat notebooks with dot-grid pages and recycled covers.",
  },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderProductCard(product: Product): string {
  return `
    <article class="product-card" data-product-id="${escapeHtml(product.id)}">
      <div class="product-card__swatch" aria-hidden="true"></div>
      <div class="product-card__body">
        <p class="product-card__category">${escapeHtml(product.category)}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
      </div>
      <div class="product-card__footer">
        <strong>${formatCurrency(product.price)}</strong>
        <button type="button">View</button>
      </div>
    </article>
  `;
}

export function renderStorefront(catalog: Product[] = products): string {
  const productCards =
    catalog.length > 0
      ? catalog.map((product) => renderProductCard(product)).join("")
      : '<p class="empty-state">Products will appear here soon.</p>';

  return `
    <header class="store-header">
      <a class="store-header__brand" href="/" aria-label="X15 home">X15</a>
      <nav class="store-header__nav" aria-label="Storefront">
        <a href="#products">Products</a>
        <a href="#cart">Cart</a>
        <a href="#checkout">Checkout</a>
      </nav>
    </header>

    <main class="storefront">
      <section class="storefront__intro" aria-labelledby="storefront-title">
        <p class="eyebrow">Minimal storefront</p>
        <h1 id="storefront-title">Browse the X15 starter catalog</h1>
        <p>Static products, a cart summary placeholder, and a checkout placeholder for the ecommerce foundation.</p>
      </section>

      <section id="products" class="product-section" aria-labelledby="products-title">
        <div class="section-heading">
          <p class="eyebrow">Catalog</p>
          <h2 id="products-title">Featured products</h2>
        </div>
        <div class="product-grid">${productCards}</div>
      </section>

      <aside id="cart" class="summary-panel" aria-labelledby="cart-title">
        <div>
          <p class="eyebrow">Cart</p>
          <h2 id="cart-title">Cart summary</h2>
        </div>
        <p>Your cart summary will appear here when cart behavior is added.</p>
        <dl>
          <div>
            <dt>Items</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>${formatCurrency(0)}</dd>
          </div>
        </dl>
      </aside>

      <section id="checkout" class="checkout-panel" aria-labelledby="checkout-title">
        <div>
          <p class="eyebrow">Checkout</p>
          <h2 id="checkout-title">Checkout placeholder</h2>
        </div>
        <p>Checkout details will be connected after cart, payment, and fulfillment decisions are in scope.</p>
      </section>
    </main>
  `;
}

export function mountStorefront(): void {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Missing #app root element.");
  }

  app.innerHTML = renderStorefront();
}

if (typeof document !== "undefined") {
  mountStorefront();
}
