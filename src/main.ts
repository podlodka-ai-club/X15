import "./styles.css";
import {
  addCartItem,
  calculateCartTotal,
  createOrderConfirmationId,
  formatPrice,
  getVisibleProducts,
  products,
  removeCartItem,
  updateCartItemQuantity,
  validateCheckout,
  type CatalogBrowseOptions,
  type CatalogSort,
  type CartItem,
  type CheckoutValidationResult,
  type Product,
  type ProductCategory,
} from "./storefront";

const categoryLabels: Record<ProductCategory, string> = {
  workspace: "Workspace",
  drinkware: "Drinkware",
  bags: "Bags",
};

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
        <button type="button" data-cart-add="${product.id}">Add to cart</button>
      </div>
    </article>
  `;
}

function getCatalogCategories(catalog: Product[]): ProductCategory[] {
  return Array.from(new Set(catalog.map((product) => product.category)));
}

function renderCatalogControls(catalog: Product[]): string {
  const categoryOptions = getCatalogCategories(catalog)
    .map(
      (category) =>
        `<option value="${category}">${categoryLabels[category]}</option>`,
    )
    .join("");

  return `
    <div class="catalog-toolbar" aria-label="Catalog browsing controls">
      <label class="catalog-toolbar__field">
        <span>Search products</span>
        <input id="catalog-search" type="search" name="catalog-search" placeholder="Search by name or detail" />
      </label>
      <label class="catalog-toolbar__field">
        <span>Category</span>
        <select id="catalog-category" name="catalog-category">
          <option value="all">All categories</option>
          ${categoryOptions}
        </select>
      </label>
      <label class="catalog-toolbar__field">
        <span>Sort by</span>
        <select id="catalog-sort" name="catalog-sort">
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
    </div>
  `;
}

function renderCatalogResults(visibleProducts: Product[]): string {
  const productLabel = visibleProducts.length === 1 ? "product" : "products";
  const productCards = visibleProducts.map(renderProductCard).join("");

  return `
    <p class="catalog-results__summary" aria-live="polite">
      ${visibleProducts.length} ${productLabel}
    </p>
    ${
      visibleProducts.length === 0
        ? `<p class="catalog-empty">No products match your search.</p>`
        : `<div class="product-grid">${productCards}</div>`
    }
  `;
}

type StorefrontRenderState = {
  cartItems?: CartItem[];
  checkoutErrors?: CheckoutValidationResult["errors"];
  confirmationId?: string;
};

function renderCartLines(cartItems: CartItem[], catalog: Product[]): string {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));
  const lines = cartItems
    .map((item) => {
      const product = catalogById.get(item.productId);

      if (!product) {
        return "";
      }

      return `
        <li class="cart-line">
          <div>
            <strong>${product.name}</strong>
            <span>${formatPrice(product.priceCents)} each</span>
          </div>
          <div class="cart-line__actions">
            <button type="button" aria-label="Decrease ${product.name}" data-cart-decrement="${product.id}">-</button>
            <input type="number" min="0" value="${item.quantity}" aria-label="${product.name} quantity" data-cart-quantity="${product.id}" />
            <button type="button" aria-label="Increase ${product.name}" data-cart-increment="${product.id}">+</button>
            <button type="button" data-cart-remove="${product.id}">Remove</button>
          </div>
          <strong>${formatPrice(product.priceCents * item.quantity)}</strong>
        </li>
      `;
    })
    .filter(Boolean)
    .join("");

  if (!lines) {
    return `<p class="empty-cart">Your cart is empty.</p>`;
  }

  return `<ul class="cart-list">${lines}</ul>`;
}

function renderFieldError(error?: string): string {
  return error ? `<p class="field__error">${error}</p>` : "";
}

export function renderStorefront(
  catalog: Product[] = products,
  state: StorefrontRenderState = {},
): string {
  const cartItems = state.cartItems ?? [];
  const cartSummary = calculateCartTotal(cartItems, catalog);
  const visibleProducts = getVisibleProducts(catalog);
  const cartLines = renderCartLines(cartItems, catalog);
  const checkoutErrors = state.checkoutErrors ?? {};
  const confirmationPanel = state.confirmationId
    ? `
        <aside class="confirmation-panel" aria-live="polite">
          <span>Order confirmed</span>
          <strong>${state.confirmationId}</strong>
        </aside>
      `
    : "";

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
          Browse a starter catalog, update an in-memory cart, and confirm checkout
          details without payments or accounts.
        </p>
      </section>

      <section id="products" class="store-section" aria-labelledby="products-title">
        <div class="section-heading">
          <p class="eyebrow">Catalog</p>
          <h2 id="products-title">Featured products</h2>
        </div>
        ${renderCatalogControls(catalog)}
        <div id="catalog-results" class="catalog-results">
          ${renderCatalogResults(visibleProducts)}
        </div>
      </section>

      <section id="cart" class="store-section store-section--split" aria-labelledby="cart-title">
        <div>
          <p class="eyebrow">Cart</p>
          <h2 id="cart-title">Cart summary</h2>
          ${cartLines}
          ${renderFieldError(checkoutErrors.cart)}
        </div>
        <aside class="summary-panel" aria-label="Cart totals">
          <dl class="totals-list">
            <div>
              <dt>Items</dt>
              <dd>${cartSummary.itemCount}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>${formatPrice(cartSummary.subtotalCents)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>${formatPrice(cartSummary.shippingCents)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>${formatPrice(cartSummary.taxCents)}</dd>
            </div>
            <div class="totals-list__total">
              <dt>Total</dt>
              <dd>${formatPrice(cartSummary.totalCents)}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section id="checkout" class="store-section store-section--split" aria-labelledby="checkout-title">
        <div>
          <p class="eyebrow">Checkout</p>
          <h2 id="checkout-title">Checkout details</h2>
          <form class="checkout-form" data-checkout-form>
            <label class="field">
              <span>Name</span>
              <input name="name" autocomplete="name" />
              ${renderFieldError(checkoutErrors.name)}
            </label>
            <label class="field">
              <span>Email</span>
              <input name="email" autocomplete="email" />
              ${renderFieldError(checkoutErrors.email)}
            </label>
            <label class="field">
              <span>Shipping address</span>
              <textarea name="shippingAddress" rows="3" autocomplete="shipping street-address"></textarea>
              ${renderFieldError(checkoutErrors.shippingAddress)}
            </label>
            <button type="submit">Confirm order</button>
          </form>
        </div>
        ${confirmationPanel}
      </section>
    </main>
  `;
}

function readCatalogOptions(): CatalogBrowseOptions {
  const search = document.querySelector<HTMLInputElement>("#catalog-search");
  const category =
    document.querySelector<HTMLSelectElement>("#catalog-category");
  const sort = document.querySelector<HTMLSelectElement>("#catalog-sort");

  return {
    category: category?.value as CatalogBrowseOptions["category"],
    query: search?.value,
    sort: sort?.value as CatalogSort,
  };
}

function bindCatalogControls(): void {
  const search = document.querySelector<HTMLInputElement>("#catalog-search");
  const category =
    document.querySelector<HTMLSelectElement>("#catalog-category");
  const sort = document.querySelector<HTMLSelectElement>("#catalog-sort");
  const results = document.querySelector<HTMLDivElement>("#catalog-results");

  if (!search || !category || !sort || !results) {
    return;
  }

  const updateResults = () => {
    results.innerHTML = renderCatalogResults(
      getVisibleProducts(products, readCatalogOptions()),
    );
  };

  search.addEventListener("input", updateResults);
  category.addEventListener("change", updateResults);
  sort.addEventListener("change", updateResults);
}

const app =
  typeof document === "undefined"
    ? null
    : document.querySelector<HTMLDivElement>("#app");

if (app) {
  let cartItems: CartItem[] = [];
  let checkoutErrors: CheckoutValidationResult["errors"] = {};
  let confirmationId = "";

  const render = () => {
    app.innerHTML = renderStorefront(products, {
      cartItems,
      checkoutErrors,
      confirmationId,
    });
    bindCatalogControls();
  };

  app.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const addProductId = target.dataset.cartAdd;
    const removeProductId = target.dataset.cartRemove;
    const incrementProductId = target.dataset.cartIncrement;
    const decrementProductId = target.dataset.cartDecrement;

    if (addProductId) {
      cartItems = addCartItem(cartItems, addProductId);
    } else if (removeProductId) {
      cartItems = removeCartItem(cartItems, removeProductId);
    } else if (incrementProductId) {
      cartItems = addCartItem(cartItems, incrementProductId);
    } else if (decrementProductId) {
      const currentItem = cartItems.find(
        (item) => item.productId === decrementProductId,
      );

      if (!currentItem) {
        return;
      }

      cartItems = updateCartItemQuantity(
        cartItems,
        decrementProductId,
        currentItem.quantity - 1,
      );
    } else {
      return;
    }

    checkoutErrors = {};
    confirmationId = "";
    render();
  });

  app.addEventListener("change", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) || !target.dataset.cartQuantity) {
      return;
    }

    cartItems = updateCartItemQuantity(
      cartItems,
      target.dataset.cartQuantity,
      Number.parseInt(target.value, 10) || 0,
    );
    checkoutErrors = {};
    confirmationId = "";
    render();
  });

  app.addEventListener("submit", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLFormElement) || !target.dataset.checkoutForm) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(target);
    const details = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      shippingAddress: String(formData.get("shippingAddress") ?? ""),
    };
    const validation = validateCheckout(details, cartItems, products);

    checkoutErrors = validation.errors;
    confirmationId = validation.isValid
      ? createOrderConfirmationId(details, cartItems, products)
      : "";
    render();
  });

  render();
}
