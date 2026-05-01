import { describe, expect, test } from "vitest";
import { createCartSummary, formatCurrency } from "./cart";
import { products } from "./products";
import { renderStorefront } from "./main";

describe("cart summary", () => {
  test("summarizes selected products", () => {
    const summary = createCartSummary(products.slice(0, 2));

    expect(summary).toEqual({
      itemCount: 2,
      subtotal: 72,
      formattedSubtotal: "$72",
    });
  });

  test("handles an empty cart placeholder", () => {
    expect(createCartSummary([])).toEqual({
      itemCount: 0,
      subtotal: 0,
      formattedSubtotal: "$0",
    });
  });
});

describe("storefront rendering", () => {
  test("renders core storefront sections", () => {
    const html = renderStorefront(products);

    expect(html).toContain("Featured products");
    expect(html).toContain("Cart summary");
    expect(html).toContain("Checkout placeholder");
    expect(html).toContain(products[0].name);
  });

  test("formats product prices for display", () => {
    expect(formatCurrency(48)).toBe("$48");
  });
});
