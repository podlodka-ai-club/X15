import "./styles.css";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export type CartSummary = {
  itemCount: number;
  subtotal: number;
};

export const products: Product[] = [
  {
    id: "coffee-kit",
    name: "Starter Coffee Kit",
    description: "A compact pour-over set for reliable weekday brewing.",
    price: 48,
    category: "Kitchen",
  },
  {
    id: "desk-lamp",
    name: "Adjustable Desk Lamp",
    description: "Warm task lighting with a small footprint for focused work.",
    price: 72,
    category: "Workspace",
  },
  {
    id: "linen-tote",
    name: "Linen Market Tote",
    description: "A washable everyday bag with reinforced handles.",
    price: 34,
    category: "Essentials",
  },
  {
    id: "notebook-set",
    name: "Notebook Set",
    description: "Three lay-flat notebooks for planning and sketching.",
    price: 22,
    category: "Stationery",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (price: number): string =>
  currencyFormatter.format(price);

export const calculateCartSummary = (
  selectedProductIds: string[],
  catalog: Product[] = products,
): CartSummary =>
  selectedProductIds.reduce<CartSummary>(
    (summary, productId) => {
      const product = catalog.find((item) => item.id === productId);

      if (!product) {
        return summary;
      }

      return {
        itemCount: summary.itemCount + 1,
        subtotal: summary.subtotal + product.price,
      };
    },
    { itemCount: 0, subtotal: 0 },
  );

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createProductCards = (catalog: Product[]): string => {
  if (catalog.length === 0) {
    return `
      <p class="empty-state">No products are available yet.</p>
    `;
  }

  return catalog
    .map(
      (product) => `
        <article class="product-card" data-product-card>
          <p class="product-card__category">${escapeHtml(product.category)}</p>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <div class="product-card__footer">
            <strong>${formatPrice(product.price)}</strong>
            <button type="button" data-product-id="${escapeHtml(product.id)}">
              Add to cart
            </button>
          </div>
        </article>
      `,
    )
    .join("");
};

export const createStorefrontMarkup = (
  catalog: Product[] = products,
  cartSummary: CartSummary = { itemCount: 0, subtotal: 0 },
): string => `
  <header class="store-header">
    <div>
      <p class="eyebrow">X15 Storefront</p>
      <h1>Everyday goods for focused work</h1>
    </div>
    <nav aria-label="Store sections">
      <a href="#products">Products</a>
      <a href="#cart">Cart</a>
      <a href="#checkout">Checkout</a>
    </nav>
    <p class="cart-count" aria-live="polite">
      <span data-cart-count>${cartSummary.itemCount}</span> items
    </p>
  </header>

  <main class="store-layout">
    <section class="products-section" id="products" aria-labelledby="products-title">
      <div class="section-heading">
        <p class="eyebrow">Catalog</p>
        <h2 id="products-title">Featured products</h2>
      </div>
      <div class="product-grid">
        ${createProductCards(catalog)}
      </div>
    </section>

    <aside class="cart-panel" id="cart" aria-labelledby="cart-title">
      <p class="eyebrow">Cart</p>
      <h2 id="cart-title">Cart summary</h2>
      <p data-cart-summary>
        ${cartSummary.itemCount} items selected, ${formatPrice(cartSummary.subtotal)} subtotal
      </p>
      <p class="muted">Cart persistence and line-item editing will be added later.</p>
    </aside>

    <section class="checkout-panel" id="checkout" aria-labelledby="checkout-title">
      <p class="eyebrow">Checkout</p>
      <h2 id="checkout-title">Checkout placeholder</h2>
      <p>
        Shipping, payment, and order review steps will appear here in a future iteration.
      </p>
    </section>
  </main>
`;

const updateCartSummary = (selectedProductIds: string[]): void => {
  const summary = calculateCartSummary(selectedProductIds);
  const countElement = document.querySelector<HTMLElement>("[data-cart-count]");
  const summaryElement = document.querySelector<HTMLElement>(
    "[data-cart-summary]",
  );

  if (countElement) {
    countElement.textContent = String(summary.itemCount);
  }

  if (summaryElement) {
    summaryElement.textContent = `${summary.itemCount} items selected, ${formatPrice(
      summary.subtotal,
    )} subtotal`;
  }
};

export const mountStorefront = (root: HTMLElement): void => {
  const selectedProductIds: string[] = [];

  root.innerHTML = createStorefrontMarkup(
    products,
    calculateCartSummary(selectedProductIds),
  );

  root.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>("[data-product-id]");

    if (!button) {
      return;
    }

    const product = products.find(
      (item) => item.id === button.dataset.productId,
    );

    if (!product) {
      return;
    }

    selectedProductIds.push(product.id);
    updateCartSummary(selectedProductIds);
  });
};

if (typeof document !== "undefined") {
  const app = document.querySelector<HTMLElement>("#app");

  if (app) {
    mountStorefront(app);
  }
}
