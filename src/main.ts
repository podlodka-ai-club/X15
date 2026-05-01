import "./styles.css";

export type Product = {
  name: string;
  category: string;
  price: number;
  description: string;
};

export type PriceSort = "none" | "price-asc" | "price-desc";

export type CatalogState = {
  category: string;
  search: string;
  sort: PriceSort;
};

export const defaultCatalogState: CatalogState = {
  category: "All",
  search: "",
  sort: "none",
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

const escapeAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const isPriceSort = (value: string): value is PriceSort =>
  value === "none" || value === "price-asc" || value === "price-desc";

export const getCatalogProducts = (
  items: Product[],
  state: CatalogState,
): Product[] => {
  const search = state.search.trim().toLowerCase();
  const filteredProducts = items.filter((product) => {
    const matchesCategory =
      state.category === "All" || product.category === state.category;
    const matchesSearch =
      search.length === 0 ||
      [product.name, product.category, product.description].some((value) =>
        value.toLowerCase().includes(search),
      );

    return matchesCategory && matchesSearch;
  });

  if (state.sort === "price-asc") {
    return [...filteredProducts].sort((a, b) => a.price - b.price);
  }

  if (state.sort === "price-desc") {
    return [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  return filteredProducts;
};

const createCatalogControls = (
  state: CatalogState,
  categories: string[],
): string => `
  <div class="catalog-controls" aria-label="Catalog controls">
    <div class="catalog-field">
      <label for="catalog-search">Search</label>
      <input
        id="catalog-search"
        name="search"
        type="search"
        value="${escapeAttribute(state.search)}"
        placeholder="Product or category"
      />
    </div>

    <div class="catalog-field">
      <label for="catalog-category">Category</label>
      <select id="catalog-category" name="category">
        ${categories
          .map(
            (category) => `
              <option value="${escapeAttribute(category)}"${
                category === state.category ? " selected" : ""
              }>${category}</option>
            `,
          )
          .join("")}
      </select>
    </div>

    <div class="catalog-field">
      <label for="catalog-sort">Price sort</label>
      <select id="catalog-sort" name="sort">
        <option value="none"${state.sort === "none" ? " selected" : ""}>Featured</option>
        <option value="price-asc"${state.sort === "price-asc" ? " selected" : ""}>Low to high</option>
        <option value="price-desc"${state.sort === "price-desc" ? " selected" : ""}>High to low</option>
      </select>
    </div>
  </div>
`;

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

export const createStorefrontMarkup = (
  items: Product[] = products,
  state: CatalogState = defaultCatalogState,
): string => {
  const categories = [
    "All",
    ...Array.from(new Set(items.map((product) => product.category))),
  ];
  const catalogProducts = getCatalogProducts(items, state);

  return `
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
      ${createCatalogControls(state, categories)}
      <div class="product-grid">
        ${createProductCards(catalogProducts)}
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
};

export const renderStorefront = (
  root: HTMLElement,
  items: Product[] = products,
): void => {
  let state: CatalogState = { ...defaultCatalogState };

  const renderWithState = (): void => {
    root.innerHTML = createStorefrontMarkup(items, state);

    const searchInput = root.querySelector<HTMLInputElement>("#catalog-search");
    const categorySelect =
      root.querySelector<HTMLSelectElement>("#catalog-category");
    const sortSelect = root.querySelector<HTMLSelectElement>("#catalog-sort");

    searchInput?.addEventListener("input", () => {
      state = { ...state, search: searchInput.value };
      renderWithState();
    });

    categorySelect?.addEventListener("change", () => {
      state = { ...state, category: categorySelect.value };
      renderWithState();
    });

    sortSelect?.addEventListener("change", () => {
      state = {
        ...state,
        sort: isPriceSort(sortSelect.value) ? sortSelect.value : "none",
      };
      renderWithState();
    });
  };

  renderWithState();
};

if (typeof document !== "undefined") {
  const root = document.querySelector<HTMLDivElement>("#app");

  if (!root) {
    throw new Error("Storefront root element #app was not found.");
  }

  renderStorefront(root);
}
