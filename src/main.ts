import "./styles.css";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export type CartSummary = {
  itemCount: number;
  subtotal: number;
};

export type PriceSort = "featured" | "price-asc" | "price-desc";

export type CatalogOptions = {
  category?: string;
  searchTerm?: string;
  priceSort?: PriceSort;
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

export const calculateCartSummary = (cartLines: CartLine[]): CartSummary =>
  cartLines.reduce<CartSummary>(
    (summary, line) => ({
      itemCount: summary.itemCount + line.quantity,
      subtotal: summary.subtotal + line.product.price * line.quantity,
    }),
    { itemCount: 0, subtotal: 0 },
  );

export const getCatalogProducts = (
  catalog: Product[],
  options: CatalogOptions = {},
): Product[] => {
  const category = options.category?.trim() ?? "";
  const searchTerm = options.searchTerm?.trim().toLocaleLowerCase() ?? "";

  const matches = catalog.filter((product) => {
    const matchesCategory =
      category.length === 0 || product.category.trim() === category;
    const matchesSearch =
      searchTerm.length === 0 ||
      [product.name, product.description, product.category].some((value) =>
        value.toLocaleLowerCase().includes(searchTerm),
      );

    return matchesCategory && matchesSearch;
  });

  if (options.priceSort === "price-asc") {
    return [...matches].sort((first, second) => first.price - second.price);
  }

  if (options.priceSort === "price-desc") {
    return [...matches].sort((first, second) => second.price - first.price);
  }

  return [...matches];
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getCatalogCategories = (catalog: Product[]): string[] => [
  ...new Set(catalog.map((product) => product.category)),
];

const renderProductCards = (catalog: Product[]): string => {
  if (catalog.length === 0) {
    return `
      <div class="catalog-empty">
        <h3>No products found</h3>
        <p>Try another search term, category, or sort option.</p>
      </div>
    `;
  }

  return catalog
    .map(
      (product) => `
        <article class="product-card">
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

const renderCatalogStatus = (
  visibleCount: number,
  totalCount: number,
): string => `${visibleCount} of ${totalCount} products shown`;

export const createStorefrontMarkup = (
  catalog: Product[] = products,
  cartSummary: CartSummary = { itemCount: 0, subtotal: 0 },
): string => {
  const categoryOptions = getCatalogCategories(catalog)
    .map(
      (category) => `
        <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
      `,
    )
    .join("");
  const productCards = renderProductCards(catalog);

  return `
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
        <div class="catalog-controls" aria-label="Catalog filters">
          <label>
            <span>Search</span>
            <input
              type="search"
              name="catalog-search"
              placeholder="Search products"
              data-catalog-search
            />
          </label>
          <label>
            <span>Category</span>
            <select name="catalog-category" data-catalog-category>
              <option value="">All categories</option>
              ${categoryOptions}
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select name="catalog-sort" data-catalog-sort>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
        <p class="catalog-status" data-catalog-count aria-live="polite">
          ${renderCatalogStatus(catalog.length, catalog.length)}
        </p>
        <div class="product-grid" data-product-grid>
          ${productCards}
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
};

const updateCartSummary = (cartLines: CartLine[]): void => {
  const summary = calculateCartSummary(cartLines);
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

const mountStorefront = (root: HTMLElement): void => {
  const cartLines: CartLine[] = [];
  const browseOptions: CatalogOptions = { priceSort: "featured" };

  root.innerHTML = createStorefrontMarkup(
    products,
    calculateCartSummary(cartLines),
  );

  const renderCatalog = (): void => {
    const visibleProducts = getCatalogProducts(products, browseOptions);
    const gridElement = root.querySelector<HTMLElement>("[data-product-grid]");
    const countElement = root.querySelector<HTMLElement>(
      "[data-catalog-count]",
    );

    if (gridElement) {
      gridElement.innerHTML = renderProductCards(visibleProducts);
    }

    if (countElement) {
      countElement.textContent = renderCatalogStatus(
        visibleProducts.length,
        products.length,
      );
    }
  };

  root.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const input = target.closest("[data-catalog-search]");

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    browseOptions.searchTerm = input.value;
    renderCatalog();
  });

  root.addEventListener("change", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const categorySelect = target.closest("[data-catalog-category]");

    if (categorySelect instanceof HTMLSelectElement) {
      browseOptions.category = categorySelect.value;
      renderCatalog();
      return;
    }

    const sortSelect = target.closest("[data-catalog-sort]");

    if (sortSelect instanceof HTMLSelectElement) {
      browseOptions.priceSort = sortSelect.value as PriceSort;
      renderCatalog();
    }
  });

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

    const cartLine = cartLines.find((line) => line.product.id === product.id);

    if (cartLine) {
      cartLine.quantity += 1;
    } else {
      cartLines.push({ product, quantity: 1 });
    }

    updateCartSummary(cartLines);
  });
};

if (typeof document !== "undefined") {
  const app = document.querySelector<HTMLElement>("#app");

  if (app) {
    mountStorefront(app);
  }
}
