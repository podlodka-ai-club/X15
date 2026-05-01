import { describe, expect, it } from "vitest";

import {
  calculateCartSummary,
  createStorefrontMarkup,
  formatPrice,
  type CartLine,
  type Product,
} from "./main";

const sampleProduct: Product = {
  id: "sample",
  name: "Sample Product",
  description: "Used for cart tests.",
  price: 12.5,
  category: "Test",
};

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

  it("totals multiple cart quantities", () => {
    const cartLines: CartLine[] = [
      { product: sampleProduct, quantity: 2 },
      {
        product: { ...sampleProduct, id: "another", price: 8 },
        quantity: 3,
      },
    ];

    expect(calculateCartSummary(cartLines)).toEqual({
      itemCount: 5,
      subtotal: 49,
    });
  });

  it("includes required storefront sections", () => {
    const markup = createStorefrontMarkup([sampleProduct]);

    expect(markup).toContain("X15 Storefront");
    expect(markup).toContain("product-grid");
    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Checkout placeholder");
  });
});
