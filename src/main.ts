import "./styles.css";

export type Product = {
  name: string;
  category: string;
  price: number;
  description: string;
};

export const products: Product[] = [
  {
    name: "Everyday Tote",
    category: "Bags",
    price: 48,
    description:
      "A structured carryall for daily shopping and work essentials.",
  },
  {
    name: "Ceramic Pour-Over Set",
    category: "Kitchen",
    price: 64,
    description: "Compact coffee kit with a matching server for slow mornings.",
  },
  {
    name: "Linen Market Shirt",
    category: "Apparel",
    price: 72,
    description: "Breathable button-down shirt cut for relaxed weekends.",
  },
  {
    name: "Desk Companion Lamp",
    category: "Home",
    price: 89,
    description:
      "Warm adjustable light for reading, planning, and late checkout reviews.",
  },
];

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

const createProductCards = (items: Product[]): string => {
  if (items.length === 0) {
    return '<p class="empty-products">Products will appear here soon.</p>';
  }

  return items
    .map(
      (product) => `
        <article class="product-card">
          <div>
            <p class="product-category">${product.category}</p>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
          <strong>${formatPrice(product.price)}</strong>
        </article>
      `,
    )
    .join("");
};

export const createStorefrontMarkup = (items: Product[] = products): string => `
  <header class="store-header">
    <div>
      <p class="eyebrow">X15 Store</p>
      <h1>Minimal ecommerce storefront</h1>
    </div>
    <p class="cart-pill">Cart: 0 items</p>
  </header>

  <main class="store-layout">
    <section class="products-section" aria-labelledby="products-heading">
      <div class="section-heading">
        <p class="eyebrow">Catalog</p>
        <h2 id="products-heading">Featured products</h2>
      </div>
      <div class="product-grid">
        ${createProductCards(items)}
      </div>
    </section>

    <aside class="checkout-column" aria-label="Cart and checkout">
      <section class="summary-panel" aria-labelledby="cart-heading">
        <p class="eyebrow">Cart</p>
        <h2 id="cart-heading">Cart summary</h2>
        <p>Your cart is empty. Add-to-cart behavior will be connected in a later iteration.</p>
      </section>

      <section class="summary-panel" aria-labelledby="checkout-heading">
        <p class="eyebrow">Checkout</p>
        <h2 id="checkout-heading">Checkout placeholder</h2>
        <p>Payment and order submission are intentionally out of scope for this skeleton.</p>
      </section>
    </aside>
  </main>
`;

export const renderStorefront = (
  root: HTMLElement,
  items: Product[] = products,
): void => {
  root.innerHTML = createStorefrontMarkup(items);
};

if (typeof document !== "undefined") {
  const root = document.querySelector<HTMLDivElement>("#app");

  if (!root) {
    throw new Error("Storefront root element #app was not found.");
  }

  renderStorefront(root);
}
