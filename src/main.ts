import "./styles.css";
import {
  calculateCartSummary,
  formatPrice,
  getVisibleProducts,
  products,
  type CatalogBrowseOptions,
  type CatalogSort,
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
        <button type="button" disabled>Add soon</button>
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

export function renderStorefront(catalog: Product[] = products): string {
  const cartSummary = calculateCartSummary([], catalog);
  const visibleProducts = getVisibleProducts(catalog);

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
          Browse a starter catalog, review the cart placeholder, and keep checkout
          ready for future product work.
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
          <p>Your cart is ready for future item selection work.</p>
        </div>
        <aside class="summary-panel" aria-label="Cart summary placeholder">
          <span>${cartSummary.itemCount} items</span>
          <strong>${formatPrice(cartSummary.subtotalCents)}</strong>
        </aside>
      </section>

      <section id="checkout" class="store-section store-section--split" aria-labelledby="checkout-title">
        <div>
          <p class="eyebrow">Checkout</p>
          <h2 id="checkout-title">Checkout placeholder</h2>
          <p>Payment, shipping, accounts, and fulfillment are intentionally out of scope.</p>
        </div>
        <button type="button" disabled>Checkout coming soon</button>
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
  app.innerHTML = renderStorefront(products);
  bindCatalogControls();
}
