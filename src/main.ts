import "./styles.css";

import {
  addCartLine,
  calculateCartTotals,
  removeCartLine,
  updateCartLineQuantity,
  type CartLine,
  type CartTotals,
} from "./cart";
import {
  createOrderConfirmationId,
  validateCheckout,
  type CheckoutDetails,
} from "./checkout";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export type { CartLine, CartTotals };

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

export const calculateCartSummary = (cartLines: CartLine[]): CartSummary => {
  const totals = calculateCartTotals(cartLines);

  return {
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
  };
};

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

const createCartLinesMarkup = (cartLines: CartLine[]): string => {
  if (cartLines.length === 0) {
    return `<p class="muted">Your cart is empty.</p>`;
  }

  return `
    <ul class="cart-lines">
      ${cartLines
        .map(
          (line) => `
            <li class="cart-line">
              <div>
                <strong>${escapeHtml(line.product.name)}</strong>
                <span>${formatPrice(line.product.price)} each</span>
              </div>
              <label>
                <span class="visually-hidden">Quantity for ${escapeHtml(line.product.name)}</span>
                <input
                  min="0"
                  type="number"
                  value="${line.quantity}"
                  data-cart-action="quantity"
                  data-product-id="${escapeHtml(line.product.id)}"
                />
              </label>
              <button
                class="button-secondary"
                type="button"
                data-cart-action="remove"
                data-product-id="${escapeHtml(line.product.id)}"
              >
                Remove
              </button>
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
};

const createCartTotalsMarkup = (cartTotals: CartTotals): string => `
  <dl class="cart-totals">
    <div>
      <dt>Subtotal</dt>
      <dd>${formatPrice(cartTotals.subtotal)}</dd>
    </div>
    <div>
      <dt>Shipping</dt>
      <dd>${formatPrice(cartTotals.shipping)}</dd>
    </div>
    <div>
      <dt>Tax</dt>
      <dd>${formatPrice(cartTotals.tax)}</dd>
    </div>
    <div class="cart-totals__total">
      <dt>Total</dt>
      <dd>${formatPrice(cartTotals.total)}</dd>
    </div>
  </dl>
`;

const createCheckoutMessageMarkup = (message = ""): string =>
  message
    ? `<p class="checkout-message" data-checkout-message>${escapeHtml(message)}</p>`
    : `<p class="checkout-message" data-checkout-message></p>`;

export const createStorefrontMarkup = (
  catalog: Product[] = products,
  cartLines: CartLine[] = [],
): string => {
  const cartTotals = calculateCartTotals(cartLines);
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
        <span data-cart-count>${cartTotals.itemCount}</span> items
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
          ${cartTotals.itemCount} items selected, ${formatPrice(cartTotals.subtotal)} subtotal
        </p>
        <div data-cart-lines>
          ${createCartLinesMarkup(cartLines)}
        </div>
        <div data-cart-totals>
          ${createCartTotalsMarkup(cartTotals)}
        </div>
      </aside>

      <section class="checkout-panel" id="checkout" aria-labelledby="checkout-title">
        <p class="eyebrow">Checkout</p>
        <h2 id="checkout-title">Shipping details</h2>
        <form class="checkout-form" data-checkout-form>
          <label>
            Name
            <input autocomplete="name" name="name" type="text" />
            <span class="field-error" data-checkout-error="name"></span>
          </label>
          <label>
            Email
            <input autocomplete="email" name="email" type="email" />
            <span class="field-error" data-checkout-error="email"></span>
          </label>
          <label>
            Shipping address
            <textarea autocomplete="shipping street-address" name="shippingAddress" rows="3"></textarea>
            <span class="field-error" data-checkout-error="shippingAddress"></span>
          </label>
          <button type="submit" data-checkout-submit disabled>Place order</button>
        </form>
        ${createCheckoutMessageMarkup()}
      </section>
    </main>
  `;
};

const updateCheckoutErrors = (
  root: HTMLElement,
  errors: Partial<Record<keyof CheckoutDetails, string>> = {},
): void => {
  root
    .querySelectorAll<HTMLElement>("[data-checkout-error]")
    .forEach((item) => {
      const field = item.dataset.checkoutError as keyof CheckoutDetails;

      item.textContent = errors[field] ?? "";
    });
};

const updateCartView = (
  root: HTMLElement,
  cartLines: CartLine[],
  message = "",
): void => {
  const totals = calculateCartTotals(cartLines);
  const countElement = root.querySelector<HTMLElement>("[data-cart-count]");
  const summaryElement = root.querySelector<HTMLElement>(
    "[data-cart-summary]",
  );
  const linesElement = root.querySelector<HTMLElement>("[data-cart-lines]");
  const totalsElement = root.querySelector<HTMLElement>("[data-cart-totals]");
  const submitButton = root.querySelector<HTMLButtonElement>(
    "[data-checkout-submit]",
  );
  const messageElement = root.querySelector<HTMLElement>(
    "[data-checkout-message]",
  );

  if (countElement) {
    countElement.textContent = String(totals.itemCount);
  }

  if (summaryElement) {
    summaryElement.textContent = `${totals.itemCount} items selected, ${formatPrice(
      totals.subtotal,
    )} subtotal`;
  }

  if (linesElement) {
    linesElement.innerHTML = createCartLinesMarkup(cartLines);
  }

  if (totalsElement) {
    totalsElement.innerHTML = createCartTotalsMarkup(totals);
  }

  if (submitButton) {
    submitButton.disabled = cartLines.length === 0;
  }

  if (messageElement) {
    messageElement.textContent = message;
  }
};

const mountStorefront = (root: HTMLElement): void => {
  let cartLines: CartLine[] = [];
  const browseOptions: CatalogOptions = { priceSort: "featured" };

  root.innerHTML = createStorefrontMarkup(products, cartLines);

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

    const searchInput = target.closest("[data-catalog-search]");

    if (searchInput instanceof HTMLInputElement) {
      browseOptions.searchTerm = searchInput.value;
      renderCatalog();
      return;
    }

    const quantityInput = target.closest<HTMLInputElement>(
      '[data-cart-action="quantity"]',
    );

    if (!quantityInput) {
      return;
    }

    cartLines = updateCartLineQuantity(
      cartLines,
      quantityInput.dataset.productId ?? "",
      Number(quantityInput.value),
    );
    updateCheckoutErrors(root);
    updateCartView(root, cartLines);
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

    const removeButton = target.closest<HTMLButtonElement>(
      '[data-cart-action="remove"]',
    );

    if (removeButton) {
      cartLines = removeCartLine(
        cartLines,
        removeButton.dataset.productId ?? "",
      );
      updateCheckoutErrors(root);
      updateCartView(root, cartLines);
      return;
    }

    const button = target.closest<HTMLButtonElement>(
      "button[data-product-id]:not([data-cart-action])",
    );

    if (!button) {
      return;
    }

    const product = products.find(
      (item) => item.id === button.dataset.productId,
    );

    if (!product) {
      return;
    }

    cartLines = addCartLine(cartLines, product);
    updateCheckoutErrors(root);
    updateCartView(root, cartLines);
  });

  root.addEventListener("submit", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLFormElement)) {
      return;
    }

    if (!target.matches("[data-checkout-form]")) {
      return;
    }

    event.preventDefault();
    updateCheckoutErrors(root);

    if (cartLines.length === 0) {
      updateCartView(root, cartLines, "Add at least one item before checkout.");
      return;
    }

    const formData = new FormData(target);
    const details: CheckoutDetails = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      shippingAddress: String(formData.get("shippingAddress") ?? ""),
    };
    const result = validateCheckout(details);

    if (!result.valid) {
      updateCheckoutErrors(root, result.errors);
      updateCartView(root, cartLines, "Review the highlighted fields.");
      return;
    }

    const confirmationId = createOrderConfirmationId(result.details, cartLines);
    updateCartView(root, cartLines, `Order confirmed: ${confirmationId}`);
  });
};

if (typeof document !== "undefined") {
  const app = document.querySelector<HTMLElement>("#app");

  if (app) {
    mountStorefront(app);
  }
}
