import { describe, expect, it } from "vitest";

import { getCatalogProducts, getCategories } from "./catalog";
import { products } from "./products";

describe("catalog", () => {
  it("returns unique categories in first-seen order", () => {
    expect(getCategories(products)).toEqual([
      "Bags",
      "Apparel",
      "Home",
      "Office",
    ]);
  });

  it("filters products by category", () => {
    const results = getCatalogProducts(products, {
      category: "Home",
      query: "",
      sort: "featured",
    });

    expect(results.map((product) => product.id)).toEqual(["ceramic-mug-set"]);
  });

  it("searches product names and descriptions case-insensitively", () => {
    const nameResults = getCatalogProducts(products, {
      category: "all",
      query: "LiNeN",
      sort: "featured",
    });
    const descriptionResults = getCatalogProducts(products, {
      category: "all",
      query: "MATTE GLAZE",
      sort: "featured",
    });

    expect(nameResults.map((product) => product.id)).toEqual([
      "linen-overshirt",
    ]);
    expect(descriptionResults.map((product) => product.id)).toEqual([
      "ceramic-mug-set",
    ]);
  });

  it("sorts products by price ascending and descending", () => {
    const ascending = getCatalogProducts(products, {
      category: "all",
      query: "",
      sort: "price-asc",
    });
    const descending = getCatalogProducts(products, {
      category: "all",
      query: "",
      sort: "price-desc",
    });

    expect(ascending.map((product) => product.id)).toEqual([
      "desk-planner",
      "ceramic-mug-set",
      "linen-overshirt",
      "studio-backpack",
    ]);
    expect(descending.map((product) => product.id)).toEqual([
      "studio-backpack",
      "linen-overshirt",
      "ceramic-mug-set",
      "desk-planner",
    ]);
  });

  it("does not mutate the original product order when sorting", () => {
    const originalOrder = products.map((product) => product.id);

    getCatalogProducts(products, {
      category: "all",
      query: "",
      sort: "price-asc",
    });

    expect(products.map((product) => product.id)).toEqual(originalOrder);
  });
});
