import { describe, expect, it } from "vitest";

import {
  calculateCartSummary,
  createStorefrontMarkup,
  formatPrice,
  getCatalogProducts,
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

const catalogFixture: Product[] = [
  {
    id: "coffee-kit",
    name: "Starter Coffee Kit",
    description: "A compact pour-over set for reliable weekday brewing.",
    price: 48,
    category: "Kitchen",
  },
  {
    id: "desk-lamp",
    name: "Adjustable Desk Lamp",
    description: "Warm task lighting with a small footprint for focused work.",
    price: 72,
    category: "Workspace",
  },
  {
    id: "linen-tote",
    name: "Linen Market Tote",
    description: "A washable everyday bag with reinforced handles.",
    price: 34,
    category: "Essentials",
  },
  {
    id: "tea-kettle",
    name: "Glass Tea Kettle",
    description: "A stovetop kettle for afternoon tea.",
    price: 40,
    category: "Kitchen",
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
    expect(markup).toContain("data-product-grid");
    expect(markup).toContain("data-catalog-search");
    expect(markup).toContain("data-catalog-category");
    expect(markup).toContain("data-catalog-sort");
    expect(markup).toContain("data-catalog-count");
    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Checkout placeholder");
  });

  it("filters catalog products by exact category", () => {
    const result = getCatalogProducts(catalogFixture, { category: "Kitchen" });

    expect(result.map((product) => product.id)).toEqual([
      "coffee-kit",
      "tea-kettle",
    ]);
  });

  it("searches name, description, and category case-insensitively", () => {
    expect(
      getCatalogProducts(catalogFixture, { searchTerm: "LINEN" }).map(
        (product) => product.id,
      ),
    ).toEqual(["linen-tote"]);
    expect(
      getCatalogProducts(catalogFixture, { searchTerm: "focused" }).map(
        (product) => product.id,
      ),
    ).toEqual(["desk-lamp"]);
    expect(
      getCatalogProducts(catalogFixture, { searchTerm: "kitchen" }).map(
        (product) => product.id,
      ),
    ).toEqual(["coffee-kit", "tea-kettle"]);
  });

  it("sorts catalog products by price", () => {
    expect(
      getCatalogProducts(catalogFixture, { priceSort: "price-asc" }).map(
        (product) => product.id,
      ),
    ).toEqual(["linen-tote", "tea-kettle", "coffee-kit", "desk-lamp"]);
    expect(
      getCatalogProducts(catalogFixture, { priceSort: "price-desc" }).map(
        (product) => product.id,
      ),
    ).toEqual(["desk-lamp", "coffee-kit", "tea-kettle", "linen-tote"]);
  });

  it("combines category, search, and sort criteria", () => {
    const result = getCatalogProducts(catalogFixture, {
      category: "Kitchen",
      searchTerm: "t",
      priceSort: "price-asc",
    });

    expect(result.map((product) => product.id)).toEqual([
      "tea-kettle",
      "coffee-kit",
    ]);
  });

  it("preserves input order and does not mutate the catalog", () => {
    const originalIds = catalogFixture.map((product) => product.id);
    const result = getCatalogProducts(catalogFixture, {
      priceSort: "featured",
    });

    expect(result.map((product) => product.id)).toEqual(originalIds);
    expect(catalogFixture.map((product) => product.id)).toEqual(originalIds);
    expect(result).not.toBe(catalogFixture);
  });
});
