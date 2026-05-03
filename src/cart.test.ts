import { describe, expect, it } from "vitest";

import {
  addToCart,
  FREE_SHIPPING_THRESHOLD_CENTS,
  getCartItemCount,
  getCartSubtotalCents,
  getCartTotalCents,
  getShippingCents,
  getTaxCents,
  removeFromCart,
  STANDARD_SHIPPING_CENTS,
  updateCartQuantity,
} from "./cart";
import type { Product } from "./products";

const backpack: Product = {
  id: "studio-backpack",
  name: "Studio Backpack",
  description: "A compact everyday pack.",
  category: "Bags",
  priceCents: 9800,
};

const planner: Product = {
  id: "desk-planner",
  name: "Desk Planner",
  description: "A weekly planner.",
  category: "Office",
  priceCents: 1850,
};

describe("cart helpers", () => {
  it("adds the first item without mutating the original cart", () => {
    const cart = addToCart([], backpack);

    expect(cart).toEqual([{ product: backpack, quantity: 1 }]);
  });

  it("increments quantity when adding the same product again", () => {
    const initialCart = addToCart([], backpack);
    const cart = addToCart(initialCart, backpack);

    expect(cart).toEqual([{ product: backpack, quantity: 2 }]);
    expect(cart).not.toBe(initialCart);
    expect(cart[0]).not.toBe(initialCart[0]);
  });

  it("removes an item by product id", () => {
    const cart = [backpack, planner].reduce(addToCart, []);

    expect(removeFromCart(cart, backpack.id)).toEqual([
      { product: planner, quantity: 1 },
    ]);
  });

  it("updates quantity and removes items when quantity is zero", () => {
    const cart = addToCart([], backpack);
    const updatedCart = updateCartQuantity(cart, backpack.id, 3);

    expect(updatedCart).toEqual([{ product: backpack, quantity: 3 }]);
    expect(updateCartQuantity(updatedCart, backpack.id, 0)).toEqual([]);
  });

  it("removes items when quantity is invalid", () => {
    const cart = addToCart([], backpack);

    expect(updateCartQuantity(cart, backpack.id, Number.NaN)).toEqual([]);
  });

  it("counts item quantities across the cart", () => {
    const cart = updateCartQuantity(
      addToCart(addToCart([], backpack), planner),
      backpack.id,
      4,
    );

    expect(getCartItemCount(cart)).toBe(5);
  });

  it("calculates subtotal, shipping, tax, and total in cents", () => {
    const cart = updateCartQuantity(addToCart([], planner), planner.id, 2);
    const subtotalCents = getCartSubtotalCents(cart);

    expect(subtotalCents).toBe(3700);
    expect(getShippingCents(0)).toBe(0);
    expect(getShippingCents(subtotalCents)).toBe(STANDARD_SHIPPING_CENTS);
    expect(getShippingCents(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(getTaxCents(subtotalCents)).toBe(305);
    expect(getCartTotalCents(cart)).toBe(4804);
  });
});
