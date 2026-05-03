import { describe, expect, it } from "vitest";

import { addToCart, updateCartQuantity } from "./cart";
import {
  createConfirmationId,
  validateCheckoutDetails,
  type CheckoutDetails,
} from "./checkout";
import type { Product } from "./products";

const mugSet: Product = {
  id: "ceramic-mug-set",
  name: "Ceramic Mug Set",
  description: "Two stackable mugs.",
  category: "Home",
  priceCents: 3200,
};

const planner: Product = {
  id: "desk-planner",
  name: "Desk Planner",
  description: "A weekly planner.",
  category: "Office",
  priceCents: 1850,
};

const details: CheckoutDetails = {
  name: "Avery Stone",
  email: "avery@example.com",
  shippingAddress: "12 Market Street",
};

describe("checkout helpers", () => {
  it("validates and returns normalized checkout details", () => {
    const result = validateCheckoutDetails({
      name: "  Avery Stone  ",
      email: "  AVERY@EXAMPLE.COM ",
      shippingAddress: "  12 Market Street  ",
    });

    expect(result).toEqual({
      isValid: true,
      details,
      errors: [],
    });
  });

  it("returns field-specific errors for missing required fields", () => {
    const result = validateCheckoutDetails({
      name: " ",
      email: "",
      shippingAddress: "   ",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      { field: "name", message: "Name is required." },
      { field: "email", message: "Email is required." },
      {
        field: "shippingAddress",
        message: "Shipping address is required.",
      },
    ]);
  });

  it("returns an email error for invalid email input", () => {
    const result = validateCheckoutDetails({
      ...details,
      email: "avery@example",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      { field: "email", message: "Enter a valid email address." },
    ]);
  });

  it("creates the same confirmation id for equivalent normalized details and cart", () => {
    const cart = addToCart([], mugSet);
    const alternateDetails: CheckoutDetails = {
      name: " Avery Stone ",
      email: "AVERY@EXAMPLE.COM",
      shippingAddress: " 12 Market Street ",
    };

    expect(createConfirmationId(details, cart)).toBe(
      createConfirmationId(alternateDetails, cart),
    );
    expect(createConfirmationId(details, cart)).toMatch(/^ORDER-[0-9A-Z]{8}$/);
  });

  it("changes confirmation id when cart contents or quantities change", () => {
    const cart = addToCart([], mugSet);
    const cartWithDifferentProduct = addToCart(cart, planner);
    const cartWithDifferentQuantity = updateCartQuantity(cart, mugSet.id, 2);

    expect(createConfirmationId(details, cart)).not.toBe(
      createConfirmationId(details, cartWithDifferentProduct),
    );
    expect(createConfirmationId(details, cart)).not.toBe(
      createConfirmationId(details, cartWithDifferentQuantity),
    );
  });
});
