import { describe, expect, it } from "vitest";

import {
  addCartItem,
  calculateCartSummary,
  calculateOrderTotal,
  calculateShipping,
  calculateSubtotal,
  calculateTax,
  removeCartItem,
  updateCartItemQuantity,
  type CartLine,
} from "./cart";

const sampleCatalog = [
  { id: "sample", price: 12.5 },
  { id: "special", price: 8 },
  { id: "premium", price: 120 },
];

describe("cart helpers", () => {
  it("adds a new product as one line with quantity one", () => {
    expect(addCartItem([], "sample")).toEqual([
      { productId: "sample", quantity: 1 },
    ]);
  });

  it("increments quantity when adding an existing product", () => {
    expect(
      addCartItem([{ productId: "sample", quantity: 1 }], "sample"),
    ).toEqual([{ productId: "sample", quantity: 2 }]);
  });

  it("removes only the requested product", () => {
    const cart: CartLine[] = [
      { productId: "sample", quantity: 1 },
      { productId: "special", quantity: 2 },
    ];

    expect(removeCartItem(cart, "sample")).toEqual([
      { productId: "special", quantity: 2 },
    ]);
  });

  it("updates quantity and removes the line when quantity is zero", () => {
    const cart: CartLine[] = [{ productId: "sample", quantity: 1 }];

    expect(updateCartItemQuantity(cart, "sample", 2.9)).toEqual([
      { productId: "sample", quantity: 2 },
    ]);
    expect(updateCartItemQuantity(cart, "sample", 0)).toEqual([]);
  });

  it("multiplies product price by quantity for the subtotal", () => {
    expect(
      calculateSubtotal(
        [
          { productId: "sample", quantity: 2 },
          { productId: "special", quantity: 1 },
        ],
        sampleCatalog,
      ),
    ).toBe(33);
  });

  it("ignores unknown product ids in the subtotal", () => {
    expect(
      calculateSubtotal(
        [
          { productId: "sample", quantity: 1 },
          { productId: "missing", quantity: 4 },
        ],
        sampleCatalog,
      ),
    ).toBe(12.5);
  });

  it("calculates deterministic shipping tiers", () => {
    expect(calculateShipping(0)).toBe(0);
    expect(calculateShipping(99.99)).toBe(7.5);
    expect(calculateShipping(100)).toBe(0);
  });

  it("rounds tax and total to cents", () => {
    expect(calculateTax(20.555)).toBe(1.64);
    expect(calculateOrderTotal(20.555, 7.5, 1.6444)).toBe(29.7);
  });

  it("derives complete cart summary totals", () => {
    expect(
      calculateCartSummary(
        [
          { productId: "sample", quantity: 2 },
          { productId: "missing", quantity: 5 },
        ],
        sampleCatalog,
      ),
    ).toEqual({
      itemCount: 7,
      subtotal: 25,
      shipping: 7.5,
      tax: 2,
      total: 34.5,
    });
  });
});
