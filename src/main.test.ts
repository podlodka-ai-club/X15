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

  it("includes required storefront shell sections", () => {
    const markup = createStorefrontMarkup(sampleProducts);

    expect(markup).toContain("X15 Storefront");
    expect(markup).toContain("product-grid");
    expect(markup).toContain("Cart summary");
    expect(markup).toContain("Shipping details");
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

  it("escapes product text before rendering markup", () => {
    expect(createStorefrontMarkup(sampleProducts)).toContain(
      "Special &lt;Product&gt;",
    );
  });
});
