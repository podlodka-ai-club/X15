import { describe, expect, it } from "vitest";

import { createStorefrontMarkup, products } from "./main";

describe("createStorefrontMarkup", () => {
  it("renders the storefront header", () => {
    const markup = createStorefrontMarkup();

    expect(markup).toContain("X15 Store");
    expect(markup).toContain("Minimal ecommerce storefront");
    expect(markup).toContain("Cart: 0 items");
  });

  it("renders all sample products", () => {
    const markup = createStorefrontMarkup(products);

    for (const product of products) {
      expect(markup).toContain(product.name);
      expect(markup).toContain(product.category);
      expect(markup).toContain(product.description);
    }
  });

  it("renders cart and checkout placeholders", () => {
    const markup = createStorefrontMarkup();

    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Your cart is empty.");
    expect(markup).toContain("Checkout placeholder");
    expect(markup).toContain(
      "Payment and order submission are intentionally out of scope",
    );
  });

  it("renders an empty product state", () => {
    const markup = createStorefrontMarkup([]);

    expect(markup).toContain("Products will appear here soon.");
  });
});
