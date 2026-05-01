import { describe, expect, it } from "vitest";

import {
  createStorefrontMarkup,
  defaultCatalogState,
  getCatalogProducts,
  products,
} from "./main";

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

  it("renders cart and checkout panels", () => {
    const markup = createStorefrontMarkup();

    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Your cart is empty.");
    expect(markup).toContain("Checkout");
    expect(markup).toContain("Full name");
    expect(markup).toContain("Email");
    expect(markup).toContain("Shipping address");
  });

  it("renders a prefilled cart summary", () => {
    const markup = createStorefrontMarkup(products, {
      cart: [{ name: "Everyday Tote", price: 48, quantity: 2 }],
      checkout: {
        name: "",
        email: "",
        shippingAddress: "",
      },
    });

    expect(markup).toContain("Cart: 2 items");
    expect(markup).toContain("Everyday Tote");
    expect(markup).toContain("Subtotal");
    expect(markup).toContain("Shipping");
    expect(markup).toContain("Tax");
    expect(markup).toContain("Total");
  });

  it("renders an empty product state", () => {
    const markup = createStorefrontMarkup([]);

    expect(markup).toContain("Products will appear here soon.");
  });

  it("renders catalog controls", () => {
    const markup = createStorefrontMarkup(products);

    expect(markup).toContain("Search");
    expect(markup).toContain('id="catalog-search"');
    expect(markup).toContain("Category");
    expect(markup).toContain('id="catalog-category"');
    expect(markup).toContain("Price sort");
    expect(markup).toContain('id="catalog-sort"');
    expect(markup).toContain('value="price-asc"');
    expect(markup).toContain('value="price-desc"');
  });

  it("renders an empty product state for filtered results", () => {
    const markup = createStorefrontMarkup(products, {
      ...defaultCatalogState,
      search: "not in catalog",
    });

    expect(markup).toContain("Products will appear here soon.");
  });
});

describe("getCatalogProducts", () => {
  it("filters products by category", () => {
    const catalogProducts = getCatalogProducts(products, {
      ...defaultCatalogState,
      category: "Kitchen",
    });

    expect(catalogProducts).toHaveLength(1);
    expect(
      catalogProducts.every((product) => product.category === "Kitchen"),
    ).toBe(true);
  });

  it("searches products case-insensitively by partial text", () => {
    const catalogProducts = getCatalogProducts(products, {
      ...defaultCatalogState,
      search: "LAMP",
    });

    expect(catalogProducts.map((product) => product.name)).toEqual([
      "Desk Companion Lamp",
    ]);
  });

  it("sorts products by price ascending", () => {
    const catalogProducts = getCatalogProducts(products, {
      ...defaultCatalogState,
      sort: "price-asc",
    });

    expect(catalogProducts.map((product) => product.price)).toEqual([
      48, 64, 72, 89,
    ]);
  });

  it("sorts products by price descending", () => {
    const catalogProducts = getCatalogProducts(products, {
      ...defaultCatalogState,
      sort: "price-desc",
    });

    expect(catalogProducts.map((product) => product.price)).toEqual([
      89, 72, 64, 48,
    ]);
  });

  it("combines category, search, and sort", () => {
    const catalogProducts = getCatalogProducts(products, {
      category: "Kitchen",
      search: "coffee",
      sort: "price-desc",
    });

    expect(catalogProducts.map((product) => product.name)).toEqual([
      "Ceramic Pour-Over Set",
    ]);
  });
});
