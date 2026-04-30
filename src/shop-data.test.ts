import { describe, expect, it } from "vitest";

import { cartSummary, checkoutPlaceholder, products } from "./shop-data";

describe("shop data", () => {
  it("provides placeholder products with required storefront fields", () => {
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      expect(product.id).toMatch(/\S/);
      expect(product.name).toMatch(/\S/);
      expect(product.description).toMatch(/\S/);
      expect(product.category).toMatch(/\S/);
      expect(product.price).toBeGreaterThan(0);
    }
  });

  it("keeps cart and checkout data in placeholder state", () => {
    expect(cartSummary).toEqual({
      itemCount: 0,
      subtotal: 0,
    });
    expect(checkoutPlaceholder).toContain("Checkout details will be added");
  });
});
