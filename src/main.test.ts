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

  it("renders cart and checkout placeholders", () => {
    const root = document.createElement("div");

    renderStorefront(root);

    expect(root.textContent).toContain("Cart Summary");
    expect(root.textContent).toContain("0 items - $0.00");
    expect(root.textContent).toContain("Checkout");
    expect(root.querySelector("button:disabled")?.textContent).toBe(
      "Checkout placeholder",
    );
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
