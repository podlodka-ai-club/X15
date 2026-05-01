import "./styles.css";

import {
  addToCart,
  createOrderConfirmationId,
  getCartSubtotal,
  getCartTotal,
  getShippingTotal,
  getTaxTotal,
  removeFromCart,
  updateCartQuantity,
  validateCheckoutDetails,
  type CartItem,
  type CheckoutDetails,
} from "./cart";

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

export type StorefrontState = CatalogState & {
  cart: CartItem[];
  checkout: CheckoutDetails;
  confirmationId?: string;
  checkoutErrors?: Partial<Record<keyof CheckoutDetails, string>>;
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

const defaultCheckoutDetails: CheckoutDetails = {
  name: "",
  email: "",
  shippingAddress: "",
};

const createDefaultState = (): StorefrontState => ({
  ...defaultCatalogState,
  cart: [],
  checkout: { ...defaultCheckoutDetails },
});

const normalizeStorefrontState = (
  state: Partial<StorefrontState> = {},
): StorefrontState => ({
  ...createDefaultState(),
  ...state,
  checkout: {
    ...defaultCheckoutDetails,
    ...state.checkout,
  },
});

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
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
          <div class="product-card-footer">
            <strong>${formatPrice(product.price)}</strong>
            <button type="button" data-add-to-cart="${escapeHtml(product.name)}">
              Add to cart
            </button>
          </div>
        </article>
      `,
    )
    .join("");
};

const getCartItemCount = (cart: CartItem[]): number =>
  cart.reduce((itemCount, cartItem) => itemCount + cartItem.quantity, 0);

const createCartMarkup = (cart: CartItem[]): string => {
  if (cart.length === 0) {
    return '<p class="empty-cart">Your cart is empty.</p>';
  }

  return `
    <div class="cart-lines">
      ${cart
        .map(
          (cartItem) => `
            <div class="cart-line">
              <div>
                <strong>${escapeHtml(cartItem.name)}</strong>
                <span>${formatPrice(cartItem.price * cartItem.quantity)}</span>
              </div>
              <label>
                <span>Qty</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value="${cartItem.quantity}"
                  data-update-cart-quantity="${escapeHtml(cartItem.name)}"
                  aria-label="${escapeHtml(cartItem.name)} quantity"
                />
              </label>
              <button type="button" data-remove-from-cart="${escapeHtml(cartItem.name)}">
                Remove
              </button>
            </div>
          `,
        )
        .join("")}
    </div>
    <dl class="cart-totals">
      <div class="cart-total-row">
        <dt>Subtotal</dt>
        <dd>${formatPrice(getCartSubtotal(cart))}</dd>
      </div>
      <div class="cart-total-row">
        <dt>Shipping</dt>
        <dd>${formatPrice(getShippingTotal(cart))}</dd>
      </div>
      <div class="cart-total-row">
        <dt>Tax</dt>
        <dd>${formatPrice(getTaxTotal(cart))}</dd>
      </div>
      <div class="cart-total-row cart-total-row-strong">
        <dt>Total</dt>
        <dd>${formatPrice(getCartTotal(cart))}</dd>
      </div>
    </dl>
  `;
};

const createCheckoutMarkup = (state: StorefrontState): string => {
  const errors = state.checkoutErrors ?? {};
  const isCartEmpty = state.cart.length === 0;

  return `
    <form class="checkout-form" data-checkout-form>
      <div class="field-group">
        <label for="checkout-name">Full name</label>
        <input
          id="checkout-name"
          name="name"
          autocomplete="name"
          value="${escapeHtml(state.checkout.name)}"
        />
        ${
          errors.name
            ? `<p class="field-error">${escapeHtml(errors.name)}</p>`
            : ""
        }
      </div>
      <div class="field-group">
        <label for="checkout-email">Email</label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          autocomplete="email"
          value="${escapeHtml(state.checkout.email)}"
        />
        ${
          errors.email
            ? `<p class="field-error">${escapeHtml(errors.email)}</p>`
            : ""
        }
      </div>
      <div class="field-group">
        <label for="checkout-shipping-address">Shipping address</label>
        <textarea
          id="checkout-shipping-address"
          name="shippingAddress"
          rows="3"
          autocomplete="shipping street-address"
        >${escapeHtml(state.checkout.shippingAddress)}</textarea>
        ${
          errors.shippingAddress
            ? `<p class="field-error">${escapeHtml(errors.shippingAddress)}</p>`
            : ""
        }
      </div>
      <button type="submit" ${isCartEmpty ? "disabled" : ""}>
        Place order
      </button>
      ${
        state.confirmationId
          ? `<p class="checkout-message">Order confirmed: ${escapeHtml(
              state.confirmationId,
            )}</p>`
          : ""
      }
    </form>
  `;
};

export const createStorefrontMarkup = (
  items: Product[] = products,
  state: Partial<StorefrontState> = createDefaultState(),
): string => {
  const storefrontState = normalizeStorefrontState(state);
  const categories = [
    "All",
    ...Array.from(new Set(items.map((product) => product.category))),
  ];
  const catalogProducts = getCatalogProducts(items, storefrontState);

  return `
  <header class="store-header">
    <div>
      <p class="eyebrow">X15 Store</p>
      <h1>Minimal ecommerce storefront</h1>
    </div>
    <p class="cart-pill">Cart: ${getCartItemCount(storefrontState.cart)} items</p>
  </header>

  <main class="store-layout">
    <section class="products-section" aria-labelledby="products-heading">
      <div class="section-heading">
        <p class="eyebrow">Catalog</p>
        <h2 id="products-heading">Featured products</h2>
      </div>
      ${createCatalogControls(storefrontState, categories)}
      <div class="product-grid">
        ${createProductCards(catalogProducts)}
      </div>
    </section>

    <aside class="checkout-column" aria-label="Cart and checkout">
      <section class="summary-panel" aria-labelledby="cart-heading">
        <p class="eyebrow">Cart</p>
        <h2 id="cart-heading">Cart summary</h2>
        ${createCartMarkup(storefrontState.cart)}
      </section>

      <section class="summary-panel" aria-labelledby="checkout-heading">
        <p class="eyebrow">Checkout</p>
        <h2 id="checkout-heading">Checkout</h2>
        ${createCheckoutMarkup(storefrontState)}
      </section>
    </aside>
  </main>
`;
};

export const renderStorefront = (
  root: HTMLElement,
  items: Product[] = products,
): void => {
  let state = createDefaultState();

  const render = (): void => {
    root.innerHTML = createStorefrontMarkup(items, state);

    const searchInput = root.querySelector<HTMLInputElement>("#catalog-search");
    const categorySelect =
      root.querySelector<HTMLSelectElement>("#catalog-category");
    const sortSelect = root.querySelector<HTMLSelectElement>("#catalog-sort");

    searchInput?.addEventListener("input", () => {
      state = { ...state, search: searchInput.value };
      render();
    });

    categorySelect?.addEventListener("change", () => {
      state = { ...state, category: categorySelect.value };
      render();
    });

    sortSelect?.addEventListener("change", () => {
      state = {
        ...state,
        sort: isPriceSort(sortSelect.value) ? sortSelect.value : "none",
      };
      render();
    });

    root
      .querySelectorAll<HTMLButtonElement>("[data-add-to-cart]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const product = items.find(
            (item) => item.name === button.dataset.addToCart,
          );

          if (!product) {
            return;
          }

          state = {
            ...state,
            cart: addToCart(state.cart, product),
            confirmationId: undefined,
          };
          render();
        });
      });

    root
      .querySelectorAll<HTMLButtonElement>("[data-remove-from-cart]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state = {
            ...state,
            cart: removeFromCart(
              state.cart,
              button.dataset.removeFromCart ?? "",
            ),
            confirmationId: undefined,
          };
          render();
        });
      });

    root
      .querySelectorAll<HTMLInputElement>("[data-update-cart-quantity]")
      .forEach((input) => {
        input.addEventListener("change", () => {
          state = {
            ...state,
            cart: updateCartQuantity(
              state.cart,
              input.dataset.updateCartQuantity ?? "",
              input.valueAsNumber,
            ),
            confirmationId: undefined,
          };
          render();
        });
      });

    root
      .querySelector<HTMLFormElement>("[data-checkout-form]")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (state.cart.length === 0) {
          return;
        }

        const formData = new FormData(event.currentTarget as HTMLFormElement);
        const checkout: CheckoutDetails = {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          shippingAddress: String(formData.get("shippingAddress") ?? ""),
        };
        const result = validateCheckoutDetails(checkout);

        state = {
          ...state,
          checkout,
          checkoutErrors: result.errors,
          confirmationId: result.valid
            ? createOrderConfirmationId(checkout, state.cart)
            : undefined,
        };
        render();
      });
  };

  render();
};

if (typeof document !== "undefined") {
  const root = document.querySelector<HTMLDivElement>("#app");

  if (!root) {
    throw new Error("Storefront root element #app was not found.");
  }

  renderStorefront(root);
}
