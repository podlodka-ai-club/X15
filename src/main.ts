import "./styles.css";

import {
  addCartItem,
  calculateCartSummary as calculateCartSummaryForCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartLine,
  type CartSummary,
} from "./cart";
import {
  createOrderConfirmationId,
  validateCheckout,
  type CheckoutDetails,
  type CheckoutErrors,
} from "./checkout";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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

export { calculateCartSummaryForCart as calculateCartSummary };
export type { CartLine, CartSummary } from "./cart";

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

type CheckoutState = {
  details: CheckoutDetails;
  errors: CheckoutErrors;
  cartError: string;
  confirmationId: string;
};

const emptyCheckoutDetails: CheckoutDetails = {
  name: "",
  email: "",
  shippingAddress: "",
};

const createEmptyCheckoutState = (): CheckoutState => ({
  details: { ...emptyCheckoutDetails },
  errors: {},
  cartError: "",
  confirmationId: "",
});

const createCartLinesMarkup = (
  catalog: Product[],
  cart: CartLine[],
): string => {
  if (cart.length === 0) {
    return `<p class="muted" data-cart-empty>Your cart is empty.</p>`;
  }

  return `
    <div class="cart-lines">
      ${cart
        .map((line) => {
          const product = catalog.find((item) => item.id === line.productId);

          if (!product) {
            return "";
          }

          return `
            <article class="cart-line" data-cart-line>
              <div>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${formatPrice(product.price)} each</p>
              </div>
              <div class="cart-line__controls">
                <label>
                  Qty
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value="${line.quantity}"
                    data-cart-quantity-id="${escapeHtml(line.productId)}"
                    aria-label="${escapeHtml(product.name)} quantity"
                  />
                </label>
                <button type="button" data-cart-decrement-id="${escapeHtml(line.productId)}">
                  -
                </button>
                <button type="button" data-cart-increment-id="${escapeHtml(line.productId)}">
                  +
                </button>
                <button type="button" data-cart-remove-id="${escapeHtml(line.productId)}">
                  Remove
                </button>
              </div>
              <strong>${formatPrice(product.price * line.quantity)}</strong>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
};

const createCartTotalsMarkup = (cartSummary: CartSummary): string => `
  <dl class="cart-totals" data-cart-summary>
    <div>
      <dt>Items</dt>
      <dd>${cartSummary.itemCount}</dd>
    </div>
    <div>
      <dt>Subtotal</dt>
      <dd>${formatPrice(cartSummary.subtotal)}</dd>
    </div>
    <div>
      <dt>Shipping</dt>
      <dd>${formatPrice(cartSummary.shipping)}</dd>
    </div>
    <div>
      <dt>Tax</dt>
      <dd>${formatPrice(cartSummary.tax)}</dd>
    </div>
    <div class="cart-totals__total">
      <dt>Total</dt>
      <dd>${formatPrice(cartSummary.total)}</dd>
    </div>
  </dl>
`;

const createCheckoutErrorMarkup = (
  id: string,
  error: string | undefined,
): string =>
  error
    ? `<p class="field-error" id="${id}" role="alert">${escapeHtml(error)}</p>`
    : "";

const createCheckoutMarkup = (checkoutState: CheckoutState): string => {
  const nameErrorId = "checkout-name-error";
  const emailErrorId = "checkout-email-error";
  const addressErrorId = "checkout-address-error";

  return `
    ${
      checkoutState.confirmationId
        ? `<p class="checkout-confirmation" data-checkout-confirmation>
            Order confirmed: ${escapeHtml(checkoutState.confirmationId)}
          </p>`
        : ""
    }
    ${
      checkoutState.cartError
        ? `<p class="field-error" role="alert">${escapeHtml(checkoutState.cartError)}</p>`
        : ""
    }
    <form class="checkout-form" data-checkout-form>
      <label>
        Name
        <input
          type="text"
          name="name"
          value="${escapeHtml(checkoutState.details.name)}"
          data-checkout-name
          ${checkoutState.errors.name ? `aria-describedby="${nameErrorId}"` : ""}
        />
      </label>
      ${createCheckoutErrorMarkup(nameErrorId, checkoutState.errors.name)}
      <label>
        Email
        <input
          type="email"
          name="email"
          value="${escapeHtml(checkoutState.details.email)}"
          data-checkout-email
          ${checkoutState.errors.email ? `aria-describedby="${emailErrorId}"` : ""}
        />
      </label>
      ${createCheckoutErrorMarkup(emailErrorId, checkoutState.errors.email)}
      <label>
        Shipping address
        <textarea
          name="shippingAddress"
          rows="3"
          data-checkout-address
          ${checkoutState.errors.shippingAddress ? `aria-describedby="${addressErrorId}"` : ""}
        >${escapeHtml(checkoutState.details.shippingAddress)}</textarea>
      </label>
      ${createCheckoutErrorMarkup(
        addressErrorId,
        checkoutState.errors.shippingAddress,
      )}
      <button type="submit">Confirm order</button>
    </form>
  `;
};

export const createStorefrontMarkup = (
  catalog: Product[] = products,
  cartSummary: CartSummary = calculateCartSummaryForCart([], catalog),
  cart: CartLine[] = [],
  checkoutState: CheckoutState = createEmptyCheckoutState(),
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
      ${createCartLinesMarkup(catalog, cart)}
      ${createCartTotalsMarkup(cartSummary)}
    </aside>

    <section class="checkout-panel" id="checkout" aria-labelledby="checkout-title">
      <p class="eyebrow">Checkout</p>
      <h2 id="checkout-title">Shipping details</h2>
      ${createCheckoutMarkup(checkoutState)}
    </section>
  </main>
`;

export const mountStorefront = (root: HTMLElement): void => {
  let cart: CartLine[] = [];
  let checkoutState = createEmptyCheckoutState();

  const render = (): void => {
    root.innerHTML = createStorefrontMarkup(
      products,
      calculateCartSummaryForCart(cart, products),
      cart,
      checkoutState,
    );
  };

  render();

  root.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const addButton = target.closest<HTMLButtonElement>("[data-product-id]");

    if (addButton) {
      const product = products.find(
        (item) => item.id === addButton.dataset.productId,
      );

      if (!product) {
        return;
      }

      cart = addCartItem(cart, product.id);
      checkoutState = { ...checkoutState, cartError: "", confirmationId: "" };
      render();
      return;
    }

    const removeButton = target.closest<HTMLButtonElement>(
      "[data-cart-remove-id]",
    );

    if (removeButton?.dataset.cartRemoveId) {
      cart = removeCartItem(cart, removeButton.dataset.cartRemoveId);
      checkoutState = { ...checkoutState, confirmationId: "" };
      render();
      return;
    }

    const decrementButton = target.closest<HTMLButtonElement>(
      "[data-cart-decrement-id]",
    );

    if (decrementButton?.dataset.cartDecrementId) {
      const line = cart.find(
        (item) => item.productId === decrementButton.dataset.cartDecrementId,
      );

      if (!line) {
        return;
      }

      cart = updateCartItemQuantity(cart, line.productId, line.quantity - 1);
      checkoutState = { ...checkoutState, confirmationId: "" };
      render();
      return;
    }

    const incrementButton = target.closest<HTMLButtonElement>(
      "[data-cart-increment-id]",
    );

    if (incrementButton?.dataset.cartIncrementId) {
      cart = addCartItem(cart, incrementButton.dataset.cartIncrementId);
      checkoutState = { ...checkoutState, confirmationId: "" };
      render();
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (!target.dataset.cartQuantityId) {
      return;
    }

    cart = updateCartItemQuantity(
      cart,
      target.dataset.cartQuantityId,
      Number(target.value),
    );
    checkoutState = { ...checkoutState, confirmationId: "" };
    render();
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

    const details: CheckoutDetails = {
      name:
        target.querySelector<HTMLInputElement>("[data-checkout-name]")?.value ??
        "",
      email:
        target.querySelector<HTMLInputElement>("[data-checkout-email]")
          ?.value ?? "",
      shippingAddress:
        target.querySelector<HTMLTextAreaElement>("[data-checkout-address]")
          ?.value ?? "",
    };
    const validation = validateCheckout(details);

    if (cart.length === 0) {
      checkoutState = {
        details,
        errors: validation.errors,
        cartError: "Add at least one item before checkout.",
        confirmationId: "",
      };
      render();
      return;
    }

    if (!validation.isValid) {
      checkoutState = {
        details,
        errors: validation.errors,
        cartError: "",
        confirmationId: "",
      };
      render();
      return;
    }

    checkoutState = {
      details,
      errors: {},
      cartError: "",
      confirmationId: createOrderConfirmationId(cart, details),
    };
    render();
  });
};

if (typeof document !== "undefined") {
  const app = document.querySelector<HTMLElement>("#app");

  if (app) {
    mountStorefront(app);
  }
}
