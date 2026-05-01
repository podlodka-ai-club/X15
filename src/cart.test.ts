import { describe, expect, it } from "vitest";

import {
  addToCart,
  createOrderConfirmationId,
  getCartSubtotal,
  getCartTotal,
  getShippingTotal,
  getTaxTotal,
  removeFromCart,
  updateCartQuantity,
  validateCheckoutDetails,
  type CartItem,
  type CheckoutDetails,
} from "./cart";

const tote = { name: "Everyday Tote", price: 48 };
const shirt = { name: "Linen Market Shirt", price: 72 };

describe("cart helpers", () => {
  it("adds a new item", () => {
    const cart = addToCart([], tote);

    expect(cart).toEqual([{ ...tote, quantity: 1 }]);
  });

  it("increments quantity when adding an existing item", () => {
    const cart = addToCart([{ ...tote, quantity: 1 }], tote);

    expect(cart).toEqual([{ ...tote, quantity: 2 }]);
  });

  it("removes an item", () => {
    const cart = removeFromCart(
      [
        { ...tote, quantity: 1 },
        { ...shirt, quantity: 1 },
      ],
      tote.name,
    );

    expect(cart).toEqual([{ ...shirt, quantity: 1 }]);
  });

  it("updates quantity and removes zero quantities", () => {
    const cart = [{ ...tote, quantity: 1 }];

    expect(updateCartQuantity(cart, tote.name, 3)).toEqual([
      { ...tote, quantity: 3 },
    ]);
    expect(updateCartQuantity(cart, tote.name, 0)).toEqual([]);
    expect(updateCartQuantity(cart, tote.name, Number.NaN)).toEqual([]);
  });

  it("calculates subtotal, shipping, tax, and total", () => {
    const cart: CartItem[] = [
      { ...tote, quantity: 2 },
      { name: "Sticker Pack", price: 0, quantity: 1 },
    ];

    expect(getCartSubtotal(cart)).toBe(96);
    expect(getShippingTotal(cart)).toBe(7);
    expect(getTaxTotal(cart)).toBe(7.68);
    expect(getCartTotal(cart)).toBe(110.68);
  });

  it("returns free shipping at the threshold and no shipping for empty carts", () => {
    expect(getShippingTotal([])).toBe(0);
    expect(getShippingTotal([{ ...shirt, quantity: 2 }])).toBe(0);
  });
});

describe("checkout helpers", () => {
  const details: CheckoutDetails = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    shippingAddress: "12 Algorithm Ave",
  };

  it("validates required checkout details", () => {
    const result = validateCheckoutDetails({
      name: " ",
      email: "not-an-email",
      shippingAddress: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      name: "Enter your full name.",
      email: "Enter a valid email address.",
      shippingAddress: "Enter a shipping address.",
    });
  });

  it("returns no errors for valid checkout details", () => {
    const result = validateCheckoutDetails(details);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("creates a deterministic confirmation id", () => {
    const cart = [
      { ...shirt, quantity: 1 },
      { ...tote, quantity: 2 },
    ];
    const sameCartDifferentOrder = [
      { ...tote, quantity: 2 },
      { ...shirt, quantity: 1 },
    ];

    expect(createOrderConfirmationId(details, cart)).toBe(
      createOrderConfirmationId(
        {
          name: " Ada Lovelace ",
          email: "ADA@example.com",
          shippingAddress: "12 Algorithm Ave",
        },
        sameCartDifferentOrder,
      ),
    );
    expect(createOrderConfirmationId(details, cart)).not.toBe(
      createOrderConfirmationId(details, [{ ...shirt, quantity: 2 }]),
    );
  });
});
