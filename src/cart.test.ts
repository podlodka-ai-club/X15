import { describe, expect, it } from "vitest";

import {
  addCartLine,
  calculateCartTotals,
  removeCartLine,
  SHIPPING_RATE,
  TAX_RATE,
  updateCartLineQuantity,
  type CartLine,
} from "./cart";
import type { Product } from "./main";

const sampleProduct: Product = {
  id: "sample",
  name: "Sample Product",
  description: "Used for cart tests.",
  price: 12.5,
  category: "Test",
};

const secondProduct: Product = {
  ...sampleProduct,
  id: "second",
  name: "Second Product",
  price: 8,
};

describe("cart helpers", () => {
  it("adds a new product line", () => {
    expect(addCartLine([], sampleProduct)).toEqual([
      { product: sampleProduct, quantity: 1 },
    ]);
  });

  it("increments an existing product without mutating the original line", () => {
    const cartLines: CartLine[] = [{ product: sampleProduct, quantity: 1 }];
    const updatedCartLines = addCartLine(cartLines, sampleProduct);

    expect(updatedCartLines).toEqual([{ product: sampleProduct, quantity: 2 }]);
    expect(cartLines).toEqual([{ product: sampleProduct, quantity: 1 }]);
  });

  it("removes a product line by id", () => {
    const cartLines: CartLine[] = [
      { product: sampleProduct, quantity: 1 },
      { product: secondProduct, quantity: 2 },
    ];

    expect(removeCartLine(cartLines, "sample")).toEqual([
      { product: secondProduct, quantity: 2 },
    ]);
  });

  it("sets an existing product quantity", () => {
    const cartLines: CartLine[] = [{ product: sampleProduct, quantity: 1 }];

    expect(updateCartLineQuantity(cartLines, "sample", 4)).toEqual([
      { product: sampleProduct, quantity: 4 },
    ]);
  });

  it("removes a product line when quantity is zero", () => {
    const cartLines: CartLine[] = [{ product: sampleProduct, quantity: 1 }];

    expect(updateCartLineQuantity(cartLines, "sample", 0)).toEqual([]);
  });

  it("returns zero totals for an empty cart", () => {
    expect(calculateCartTotals([])).toEqual({
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    });
  });

  it("calculates deterministic totals for multiple lines", () => {
    const cartLines: CartLine[] = [
      { product: sampleProduct, quantity: 2 },
      { product: secondProduct, quantity: 3 },
    ];
    const subtotal = 49;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

    expect(calculateCartTotals(cartLines)).toEqual({
      itemCount: 5,
      subtotal,
      shipping: SHIPPING_RATE,
      tax,
      total: 59.04,
    });
  });
});
