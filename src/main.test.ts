import { describe, expect, it } from "vitest";

import {
  calculateCartSummary,
  createStorefrontMarkup,
  formatPrice,
  products,
  type Product,
} from "./main";

const sampleProducts: Product[] = [
  {
    id: "sample",
    name: "Sample Product",
    description: "Used for cart tests.",
    price: 12.5,
    category: "Test",
  },
  {
    id: "special",
    name: "Special <Product>",
    description: "Escapes unsafe & quoted text.",
    price: 8,
    category: "Test",
  },
];

describe("storefront helpers", () => {
  it("formats prices as USD", () => {
    expect(formatPrice(48)).toBe("$48.00");
  });

  it("returns zero values for an empty cart", () => {
    expect(calculateCartSummary([])).toEqual({
      itemCount: 0,
      subtotal: 0,
    });
  });

  it("totals selected product ids and ignores unknown ids", () => {
    expect(
      calculateCartSummary(["sample", "missing", "special"], sampleProducts),
    ).toEqual({
      itemCount: 2,
      subtotal: 20.5,
    });
  });

  it("includes required storefront shell sections", () => {
    const markup = createStorefrontMarkup(sampleProducts);

    expect(markup).toContain("X15 Storefront");
    expect(markup).toContain("product-grid");
    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Checkout placeholder");
  });

  it("renders every product card name", () => {
    const markup = createStorefrontMarkup(products);

    for (const product of products) {
      expect(markup).toContain(product.name);
    }
  });

  it("includes cart summary and checkout placeholders", () => {
    const markup = createStorefrontMarkup(sampleProducts, {
      itemCount: 2,
      subtotal: 20.5,
    });

    expect(markup).toContain("data-cart-summary");
    expect(markup).toContain("2 items selected, $20.50 subtotal");
    expect(markup).toContain(
      "Shipping, payment, and order review steps will appear here",
    );
  });

  it("renders a stable empty catalog state", () => {
    expect(createStorefrontMarkup([])).toContain(
      "No products are available yet.",
    );
  });

  it("escapes product text before rendering markup", () => {
    expect(createStorefrontMarkup(sampleProducts)).toContain(
      "Special &lt;Product&gt;",
    );
  });
});
