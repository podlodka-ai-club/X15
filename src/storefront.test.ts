import { describe, expect, it } from "vitest";
import { calculateCartSummary, formatPrice, products } from "./storefront";

describe("storefront helpers", () => {
  it("formats product prices in USD", () => {
    expect(formatPrice(1299)).toBe("$12.99");
  });

  it("returns an empty summary for an empty cart", () => {
    expect(calculateCartSummary([], products)).toEqual({
      itemCount: 0,
      subtotalCents: 0,
    });
  });

  it("aggregates item quantities and subtotals", () => {
    expect(
      calculateCartSummary(
        [
          { productId: "daily-tote", quantity: 2 },
          { productId: "ceramic-mug", quantity: 3 },
        ],
        products,
      ),
    ).toEqual({
      itemCount: 5,
      subtotalCents: 16200,
    });
  });

  it("ignores unknown product ids", () => {
    expect(
      calculateCartSummary(
        [{ productId: "missing-item", quantity: 4 }],
        products,
      ),
    ).toEqual({
      itemCount: 0,
      subtotalCents: 0,
    });
  });
});
