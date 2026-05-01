import { describe, expect, it } from "vitest";
import {
  calculateCartSummary,
  formatPrice,
  getVisibleProducts,
  products,
} from "./storefront";

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
          { productId: "desk-starter-kit", quantity: 2 },
          { productId: "travel-tumbler", quantity: 3 },
        ],
        products,
      ),
    ).toEqual({
      itemCount: 5,
      subtotalCents: 20400,
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

  it("filters products by category", () => {
    expect(
      getVisibleProducts(products, { category: "drinkware" }).map(
        (product) => product.id,
      ),
    ).toEqual(["travel-tumbler"]);
  });

  it("searches product names case-insensitively", () => {
    expect(
      getVisibleProducts(products, { query: "desk" }).map(
        (product) => product.id,
      ),
    ).toEqual(["desk-starter-kit"]);
  });

  it("searches product descriptions case-insensitively", () => {
    expect(
      getVisibleProducts(products, { query: "COMMUTES" }).map(
        (product) => product.id,
      ),
    ).toEqual(["travel-tumbler"]);
  });

  it("treats a blank query like no query", () => {
    expect(
      getVisibleProducts(products, { category: "bags", query: "   " }).map(
        (product) => product.id,
      ),
    ).toEqual(["weekend-tote"]);
  });

  it("sorts products by price ascending and descending", () => {
    expect(
      getVisibleProducts(products, { sort: "price-asc" }).map(
        (product) => product.id,
      ),
    ).toEqual(["travel-tumbler", "desk-starter-kit", "weekend-tote"]);

    expect(
      getVisibleProducts(products, { sort: "price-desc" }).map(
        (product) => product.id,
      ),
    ).toEqual(["weekend-tote", "desk-starter-kit", "travel-tumbler"]);
  });

  it("preserves source order for featured sorting", () => {
    expect(getVisibleProducts(products).map((product) => product.id)).toEqual([
      "desk-starter-kit",
      "travel-tumbler",
      "weekend-tote",
    ]);

    expect(
      getVisibleProducts(products, { sort: "featured" }).map(
        (product) => product.id,
      ),
    ).toEqual(["desk-starter-kit", "travel-tumbler", "weekend-tote"]);
  });

  it("does not mutate the original product order when sorting", () => {
    const originalOrder = products.map((product) => product.id);

    getVisibleProducts(products, { sort: "price-desc" });

    expect(products.map((product) => product.id)).toEqual(originalOrder);
  });
});
