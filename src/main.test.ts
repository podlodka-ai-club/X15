/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";

import {
  formatPrice,
  mountStorefront,
  renderProductCard,
  renderStorefront,
} from "./main";
import { products, type Product } from "./products";

describe("storefront", () => {
  it("formats cents as a USD price", () => {
    expect(formatPrice(1850)).toBe("$18.50");
  });

  it("renders a product card with details and an add button", () => {
    const product: Product = {
      id: "test-product",
      name: "Test Product",
      description: "Useful test merchandise.",
      category: "Office",
      priceCents: 1299,
    };

    const card = renderProductCard(product);

    expect(card.dataset.productId).toBe(product.id);
    expect(card.querySelector("h3")?.textContent).toBe(product.name);
    expect(card.textContent).toContain(product.description);
    expect(card.textContent).toContain("$12.99");
    expect(card.querySelector("button")?.getAttribute("aria-label")).toBe(
      "Add Test Product to cart",
    );
  });

  it("renders the storefront header and all product cards", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    expect(root.querySelector("h1")?.textContent).toBe(
      "Curated essentials for everyday work",
    );
    expect(root.querySelectorAll(".product-card")).toHaveLength(
      products.length,
    );
  });

  it("renders an empty cart state and disabled checkout submit", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    expect(root.textContent).toContain("Cart Summary");
    expect(root.textContent).toContain("0 items");
    expect(root.textContent).toContain("Your cart is empty.");
    expect(root.textContent).toContain("Checkout");
    expect(
      root.querySelector<HTMLButtonElement>("button[type='submit']")?.disabled,
    ).toBe(true);
  });

  it("updates the cart count and total when adding a product", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    root
      .querySelector<HTMLButtonElement>(
        `[aria-label="Add ${products[0].name} to cart"]`,
      )
      ?.click();

    expect(root.querySelector(".cart-count")?.textContent).toBe("1 items");
    expect(root.textContent).toContain(products[0].name);
    expect(root.textContent).toContain("Total");
    expect(root.textContent).toContain("$114.08");
  });

  it("increments quantity when adding the same product twice", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    const addButton = root.querySelector<HTMLButtonElement>(
      `[aria-label="Add ${products[0].name} to cart"]`,
    );
    addButton?.click();
    addButton?.click();

    expect(root.querySelector(".cart-count")?.textContent).toBe("2 items");
    expect(
      root.querySelector<HTMLInputElement>(
        `[aria-label="Quantity for ${products[0].name}"]`,
      )?.value,
    ).toBe("2");
  });

  it("removes an item and restores the empty cart state", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    root
      .querySelector<HTMLButtonElement>(
        `[aria-label="Add ${products[0].name} to cart"]`,
      )
      ?.click();
    root
      .querySelector<HTMLButtonElement>(
        `[aria-label="Remove ${products[0].name} from cart"]`,
      )
      ?.click();

    expect(root.querySelector(".cart-count")?.textContent).toBe("0 items");
    expect(root.textContent).toContain("Your cart is empty.");
    expect(
      root.querySelector<HTMLButtonElement>("button[type='submit']")?.disabled,
    ).toBe(true);
  });

  it("shows validation errors after invalid checkout submit", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    root
      .querySelector<HTMLButtonElement>(
        `[aria-label="Add ${products[0].name} to cart"]`,
      )
      ?.click();
    root
      .querySelector<HTMLFormElement>(".checkout-form")
      ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(root.textContent).toContain("Name is required.");
    expect(root.textContent).toContain("Email is required.");
    expect(root.textContent).toContain("Shipping address is required.");
  });

  it("shows a deterministic order confirmation after valid checkout submit", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    root
      .querySelector<HTMLButtonElement>(
        `[aria-label="Add ${products[0].name} to cart"]`,
      )
      ?.click();

    const nameInput =
      root.querySelector<HTMLInputElement>("input[name='name']");
    const emailInput = root.querySelector<HTMLInputElement>(
      "input[name='email']",
    );
    const addressInput = root.querySelector<HTMLTextAreaElement>(
      "textarea[name='shippingAddress']",
    );

    if (nameInput) {
      nameInput.value = "Avery Stone";
    }
    if (emailInput) {
      emailInput.value = "avery@example.com";
    }
    if (addressInput) {
      addressInput.value = "12 Market Street";
    }

    root
      .querySelector<HTMLFormElement>(".checkout-form")
      ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(root.querySelector(".confirmation")?.textContent).toMatch(
      /^Confirmation ORDER-[0-9A-Z]{8}$/,
    );
  });

  it("renders catalog category, search, and sort controls", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    expect(root.querySelector('select[name="category"]')).not.toBeNull();
    expect(root.querySelector('input[name="search"]')).not.toBeNull();
    expect(root.querySelector('select[name="sort"]')).not.toBeNull();
    expect(root.textContent).toContain("All categories");
    expect(root.textContent).toContain("Price: low to high");
  });

  it("filters product cards when category changes", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    const categorySelect = root.querySelector<HTMLSelectElement>(
      'select[name="category"]',
    );
    categorySelect!.value = "Home";
    categorySelect!.dispatchEvent(new Event("change", { bubbles: true }));

    const cards = root.querySelectorAll<HTMLElement>(".product-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]?.dataset.productId).toBe("ceramic-mug-set");
  });

  it("filters product cards when a search query is typed", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    const searchInput = root.querySelector<HTMLInputElement>(
      'input[name="search"]',
    );
    searchInput!.value = "planner";
    searchInput!.dispatchEvent(new Event("input", { bubbles: true }));

    const cards = root.querySelectorAll<HTMLElement>(".product-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]?.dataset.productId).toBe("desk-planner");
  });

  it("updates product card order when price sort changes", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    const sortSelect = root.querySelector<HTMLSelectElement>(
      'select[name="sort"]',
    );
    sortSelect!.value = "price-asc";
    sortSelect!.dispatchEvent(new Event("change", { bubbles: true }));

    expect(
      Array.from(root.querySelectorAll<HTMLElement>(".product-card")).map(
        (card) => card.dataset.productId,
      ),
    ).toEqual([
      "desk-planner",
      "ceramic-mug-set",
      "linen-overshirt",
      "studio-backpack",
    ]);
  });

  it("renders an empty catalog state without crashing", () => {
    const root = document.createElement("div");

    renderStorefront(root, []);

    expect(root.querySelectorAll(".product-card")).toHaveLength(0);
    expect(root.textContent).toContain("No products are available yet.");
  });

  it("throws a clear error when the app root is missing", () => {
    document.body.replaceChildren();

    expect(() => mountStorefront()).toThrow("App root element was not found.");
  });
});
