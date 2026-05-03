import "./styles.css";

import {
  defaultCatalogFilters,
  getCatalogProducts,
  getCategories,
  type CatalogFilters,
  type CatalogSort,
} from "./catalog";
import {
  addToCart,
  getCartItemCount,
  getCartSubtotalCents,
  getCartTotalCents,
  getShippingCents,
  getTaxCents,
  removeFromCart,
  updateCartQuantity,
  type Cart,
} from "./cart";
import {
  createConfirmationId,
  validateCheckoutDetails,
  type CheckoutDetails,
  type CheckoutValidationError,
} from "./checkout";
import { products, type Product } from "./products";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(priceCents: number): string {
  return currencyFormatter.format(priceCents / 100);
}

export function renderProductCard(
  product: Product,
  onAddToCart?: (product: Product) => void,
): HTMLElement {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.productId = product.id;

  const title = document.createElement("h3");
  title.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const footer = document.createElement("div");
  footer.className = "product-card__footer";

  const price = document.createElement("span");
  price.className = "product-card__price";
  price.textContent = formatPrice(product.priceCents);

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Add";
  button.setAttribute("aria-label", `Add ${product.name} to cart`);
  button.addEventListener("click", () => {
    onAddToCart?.(product);
  });

  footer.append(price, button);
  card.append(title, description, footer);

  return card;
}

export function updateProductGrid(
  productGrid: HTMLElement,
  productList: Product[],
  onAddToCart?: (product: Product) => void,
): void {
  productGrid.replaceChildren();

  if (productList.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "catalog__empty";
    emptyState.textContent = "No products are available yet.";
    productGrid.append(emptyState);
  } else {
    productGrid.append(
      ...productList.map((product) => renderProductCard(product, onAddToCart)),
    );
  }
}

export function renderCatalogControls(
  productList: Product[],
  filters: CatalogFilters,
  onChange: (filters: CatalogFilters) => void,
): HTMLElement {
  let currentFilters = filters;

  const controls = document.createElement("div");
  controls.className = "catalog__controls";

  const categoryLabel = document.createElement("label");
  categoryLabel.className = "catalog__control";
  categoryLabel.textContent = "Category";

  const categorySelect = document.createElement("select");
  categorySelect.name = "category";

  const allCategoryOption = document.createElement("option");
  allCategoryOption.value = "all";
  allCategoryOption.textContent = "All categories";
  categorySelect.append(allCategoryOption);

  categorySelect.append(
    ...getCategories(productList).map((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;

      return option;
    }),
  );
  categorySelect.value = filters.category;

  const searchLabel = document.createElement("label");
  searchLabel.className = "catalog__control";
  searchLabel.textContent = "Search";

  const searchInput = document.createElement("input");
  searchInput.name = "search";
  searchInput.type = "search";
  searchInput.placeholder = "Search products";
  searchInput.value = filters.query;

  const sortLabel = document.createElement("label");
  sortLabel.className = "catalog__control";
  sortLabel.textContent = "Sort";

  const sortSelect = document.createElement("select");
  sortSelect.name = "sort";

  const sortOptions: { label: string; value: CatalogSort }[] = [
    { label: "Featured", value: "featured" },
    { label: "Price: low to high", value: "price-asc" },
    { label: "Price: high to low", value: "price-desc" },
  ];

  sortSelect.append(
    ...sortOptions.map((sortOption) => {
      const option = document.createElement("option");
      option.value = sortOption.value;
      option.textContent = sortOption.label;

      return option;
    }),
  );
  sortSelect.value = filters.sort;

  categorySelect.addEventListener("change", () => {
    currentFilters = {
      ...currentFilters,
      category: categorySelect.value as CatalogFilters["category"],
    };
    onChange(currentFilters);
  });

  searchInput.addEventListener("input", () => {
    currentFilters = { ...currentFilters, query: searchInput.value };
    onChange(currentFilters);
  });

  sortSelect.addEventListener("change", () => {
    currentFilters = {
      ...currentFilters,
      sort: sortSelect.value as CatalogSort,
    };
    onChange(currentFilters);
  });

  categoryLabel.append(categorySelect);
  searchLabel.append(searchInput);
  sortLabel.append(sortSelect);
  controls.append(categoryLabel, searchLabel, sortLabel);

  return controls;
}

export function renderStorefront(
  root: HTMLElement,
  productList = products,
): void {
  let cart: Cart = [];
  let checkoutDetails: CheckoutDetails = {
    name: "",
    email: "",
    shippingAddress: "",
  };
  let checkoutErrors: CheckoutValidationError[] = [];
  let confirmationId = "";

  root.replaceChildren();

  const shell = document.createElement("main");
  shell.className = "storefront";

  const header = document.createElement("header");
  header.className = "storefront__header";

  const eyebrow = document.createElement("p");
  eyebrow.className = "storefront__eyebrow";
  eyebrow.textContent = "X15 Storefront";

  const heading = document.createElement("h1");
  heading.textContent = "Curated essentials for everyday work";

  const intro = document.createElement("p");
  intro.textContent =
    "Browse a small static catalog while cart and checkout foundations are prepared for future ecommerce flows.";

  header.append(eyebrow, heading, intro);

  const content = document.createElement("div");
  content.className = "storefront__content";

  const catalogSection = document.createElement("section");
  catalogSection.className = "catalog";
  catalogSection.setAttribute("aria-labelledby", "catalog-heading");

  const catalogHeading = document.createElement("h2");
  catalogHeading.id = "catalog-heading";
  catalogHeading.textContent = "Products";

  let filters: CatalogFilters = { ...defaultCatalogFilters };

  const productGrid = document.createElement("div");
  productGrid.className = "product-grid";

  const handleAddToCart = (selectedProduct: Product): void => {
    cart = addToCart(cart, selectedProduct);
    checkoutErrors = [];
    confirmationId = "";
    renderSidebar();
  };

  const catalogControls = renderCatalogControls(
    productList,
    filters,
    (nextFilters) => {
      filters = nextFilters;
      updateProductGrid(
        productGrid,
        getCatalogProducts(productList, filters),
        handleAddToCart,
      );
    },
  );

  updateProductGrid(
    productGrid,
    getCatalogProducts(productList, filters),
    handleAddToCart,
  );

  catalogSection.append(catalogHeading, catalogControls, productGrid);

  const sidebar = document.createElement("aside");
  sidebar.className = "checkout-panel";

  function getErrorMessage(field: keyof CheckoutDetails): string {
    return checkoutErrors.find((error) => error.field === field)?.message ?? "";
  }

  function renderCartSummary(): HTMLElement {
    const cartSummary = document.createElement("section");
    cartSummary.className = "summary-card";
    cartSummary.setAttribute("aria-labelledby", "cart-heading");

    const cartHeading = document.createElement("h2");
    cartHeading.id = "cart-heading";
    cartHeading.textContent = "Cart Summary";

    const itemCount = document.createElement("p");
    itemCount.className = "cart-count";
    itemCount.textContent = `${getCartItemCount(cart)} items`;

    cartSummary.append(cartHeading, itemCount);

    if (cart.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "cart-empty";
      emptyState.textContent = "Your cart is empty.";
      cartSummary.append(emptyState);
    } else {
      const cartList = document.createElement("div");
      cartList.className = "cart-list";

      cart.forEach((item) => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.dataset.productId = item.product.id;

        const itemName = document.createElement("span");
        itemName.textContent = item.product.name;

        const itemControls = document.createElement("div");
        itemControls.className = "cart-item__controls";

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = "0";
        quantityInput.value = item.quantity.toString();
        quantityInput.setAttribute(
          "aria-label",
          `Quantity for ${item.product.name}`,
        );
        quantityInput.addEventListener("change", () => {
          const quantity = Number.parseInt(quantityInput.value, 10);
          cart = updateCartQuantity(cart, item.product.id, quantity);
          confirmationId = "";
          renderSidebar();
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.setAttribute(
          "aria-label",
          `Remove ${item.product.name} from cart`,
        );
        removeButton.addEventListener("click", () => {
          cart = removeFromCart(cart, item.product.id);
          checkoutErrors = [];
          confirmationId = "";
          renderSidebar();
        });

        itemControls.append(quantityInput, removeButton);
        cartItem.append(itemName, itemControls);
        cartList.append(cartItem);
      });

      cartSummary.append(cartList);
    }

    const subtotalCents = getCartSubtotalCents(cart);
    const cartTotals = document.createElement("dl");
    cartTotals.className = "cart-totals";

    [
      ["Subtotal", formatPrice(subtotalCents)],
      ["Shipping", formatPrice(getShippingCents(subtotalCents))],
      ["Tax", formatPrice(getTaxCents(subtotalCents))],
      ["Total", formatPrice(getCartTotalCents(cart))],
    ].forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;

      const description = document.createElement("dd");
      description.textContent = value;

      cartTotals.append(term, description);
    });

    cartSummary.append(cartTotals);

    return cartSummary;
  }

  function renderCheckoutForm(): HTMLElement {
    const checkout = document.createElement("section");
    checkout.className = "summary-card";
    checkout.setAttribute("aria-labelledby", "checkout-heading");

    const checkoutHeading = document.createElement("h2");
    checkoutHeading.id = "checkout-heading";
    checkoutHeading.textContent = "Checkout";

    const form = document.createElement("form");
    form.className = "checkout-form";
    form.noValidate = true;

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Name";
    const nameInput = document.createElement("input");
    nameInput.name = "name";
    nameInput.autocomplete = "name";
    nameInput.value = checkoutDetails.name;
    nameLabel.append(nameInput);

    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email";
    const emailInput = document.createElement("input");
    emailInput.name = "email";
    emailInput.type = "email";
    emailInput.autocomplete = "email";
    emailInput.value = checkoutDetails.email;
    emailLabel.append(emailInput);

    const addressLabel = document.createElement("label");
    addressLabel.textContent = "Shipping address";
    const addressInput = document.createElement("textarea");
    addressInput.name = "shippingAddress";
    addressInput.rows = 3;
    addressInput.autocomplete = "shipping street-address";
    addressInput.value = checkoutDetails.shippingAddress;
    addressLabel.append(addressInput);

    [nameLabel, emailLabel, addressLabel].forEach((label) => {
      const input = label.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea",
      );
      const errorMessage = input
        ? getErrorMessage(input.name as keyof CheckoutDetails)
        : "";

      if (errorMessage) {
        const error = document.createElement("span");
        error.className = "form-error";
        error.textContent = errorMessage;
        label.append(error);
      }
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.disabled = cart.length === 0;
    submitButton.textContent = "Place order";

    form.append(nameLabel, emailLabel, addressLabel, submitButton);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      checkoutDetails = {
        name: nameInput.value,
        email: emailInput.value,
        shippingAddress: addressInput.value,
      };

      const validationResult = validateCheckoutDetails(checkoutDetails);
      checkoutDetails = validationResult.details;
      checkoutErrors = validationResult.errors;
      confirmationId = validationResult.isValid
        ? createConfirmationId(validationResult.details, cart)
        : "";
      renderSidebar();
    });

    checkout.append(checkoutHeading, form);

    if (confirmationId) {
      const confirmation = document.createElement("p");
      confirmation.className = "confirmation";
      confirmation.textContent = `Confirmation ${confirmationId}`;
      checkout.append(confirmation);
    }

    return checkout;
  }

  function renderSidebar(): void {
    sidebar.replaceChildren(renderCartSummary(), renderCheckoutForm());
  }

  renderSidebar();

  content.append(catalogSection, sidebar);
  shell.append(header, content);
  root.append(shell);
}

export function mountStorefront(): void {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("App root element was not found.");
  }

  renderStorefront(app);
}

if (import.meta.env.MODE !== "test") {
  mountStorefront();
}
