import { describe, expect, it } from "vitest";

import {
  calculateCartSummary,
  createStorefrontMarkup,
  formatPrice,
  getVisibleProducts,
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

const catalogProducts: Product[] = [
  {
    id: "ceramic-mug",
    name: "Ceramic Mug",
    description: "Keeps coffee warm during planning sessions.",
    price: 18,
    category: "Kitchen",
  },
  {
    id: "standing-mat",
    name: "Standing Mat",
    description: "Supportive mat for focused workspace routines.",
    price: 46,
    category: "Workspace",
  },
  {
    id: "paper-notes",
    name: "Paper Notes",
    description: "Compact notes for daily sketches.",
    price: 9,
    category: "Stationery",
  },
];

describe("storefront helpers", () => {
  it("formats prices as USD", () => {
    expect(formatPrice(48)).toBe("$48.00");
  });

  it("returns zero values for an empty cart", () => {
    expect(calculateCartSummary([], sampleProducts)).toEqual({
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    });
  });

  it("totals selected product ids and ignores unknown ids", () => {
    expect(
      calculateCartSummary(
        [
          { productId: "sample", quantity: 1 },
          { productId: "missing", quantity: 3 },
          { productId: "special", quantity: 1 },
        ],
        sampleProducts,
      ),
    ).toEqual({
      itemCount: 5,
      subtotal: 20.5,
      shipping: 7.5,
      tax: 1.64,
      total: 29.64,
    });
  });

  it("filters products by exact category", () => {
    expect(
      getVisibleProducts(catalogProducts, {
        category: "Workspace",
        searchTerm: "",
        priceSort: "featured",
      }).map((product) => product.id),
    ).toEqual(["standing-mat"]);
  });

  it("searches product name, description, and category case-insensitively", () => {
    expect(
      getVisibleProducts(catalogProducts, {
        category: "",
        searchTerm: "COFFEE",
        priceSort: "featured",
      }).map((product) => product.id),
    ).toEqual(["ceramic-mug"]);

    expect(
      getVisibleProducts(catalogProducts, {
        category: "",
        searchTerm: "workspace",
        priceSort: "featured",
      }).map((product) => product.id),
    ).toEqual(["standing-mat"]);
  });

  it("sorts products by price ascending and descending", () => {
    expect(
      getVisibleProducts(catalogProducts, {
        category: "",
        searchTerm: "",
        priceSort: "price-asc",
      }).map((product) => product.id),
    ).toEqual(["paper-notes", "ceramic-mug", "standing-mat"]);

    expect(
      getVisibleProducts(catalogProducts, {
        category: "",
        searchTerm: "",
        priceSort: "price-desc",
      }).map((product) => product.id),
    ).toEqual(["standing-mat", "ceramic-mug", "paper-notes"]);
  });

  it("combines category filtering, search, and price sorting", () => {
    expect(
      getVisibleProducts(
        [
          ...catalogProducts,
          {
            id: "desk-shelf",
            name: "Desk Shelf",
            description: "Raises screens above a focused workspace.",
            price: 28,
            category: "Workspace",
          },
        ],
        {
          category: "Workspace",
          searchTerm: "focused",
          priceSort: "price-asc",
        },
      ).map((product) => product.id),
    ).toEqual(["desk-shelf", "standing-mat"]);
  });

  it("does not mutate the source catalog when sorting", () => {
    const originalOrder = catalogProducts.map((product) => product.id);

    getVisibleProducts(catalogProducts, {
      category: "",
      searchTerm: "",
      priceSort: "price-asc",
    });

    expect(catalogProducts.map((product) => product.id)).toEqual(originalOrder);
  });

  it("includes required storefront shell sections", () => {
    const markup = createStorefrontMarkup(sampleProducts);

    expect(markup).toContain("X15 Storefront");
    expect(markup).toContain("product-grid");
    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Shipping details");
  });

  it("renders catalog controls and product grid hooks", () => {
    const markup = createStorefrontMarkup(sampleProducts);

    expect(markup).toContain("data-category-filter");
    expect(markup).toContain("data-product-search");
    expect(markup).toContain("data-price-sort");
    expect(markup).toContain("data-product-grid");
  });

  it("renders every product card name", () => {
    const markup = createStorefrontMarkup(products);

    for (const product of products) {
      expect(markup).toContain(product.name);
    }
  });

  it("includes cart totals and checkout controls", () => {
    const markup = createStorefrontMarkup(
      sampleProducts,
      calculateCartSummary(
        [{ productId: "sample", quantity: 2 }],
        sampleProducts,
      ),
      [{ productId: "sample", quantity: 2 }],
    );

    expect(markup).toContain("data-cart-summary");
    expect(markup).toContain("<dd>$25.00</dd>");
    expect(markup).toContain('data-cart-quantity-id="sample"');
    expect(markup).toContain("data-checkout-form");
  });

  it("renders a stable empty catalog state", () => {
    expect(createStorefrontMarkup([])).toContain(
      "No products are available yet.",
    );
  });

  it("renders a filtered empty catalog message", () => {
    expect(
      createStorefrontMarkup(
        sampleProducts,
        calculateCartSummary([], sampleProducts),
        {
          category: "Missing",
          searchTerm: "",
          priceSort: "featured",
        },
      ),
    ).toContain("No products match your filters.");
  });

  it("escapes product text before rendering markup", () => {
    expect(createStorefrontMarkup(sampleProducts)).toContain(
      "Special &lt;Product&gt;",
    );
  });
});
