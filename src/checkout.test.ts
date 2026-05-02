import { describe, expect, it } from "vitest";

import type { CartLine } from "./cart";
import {
  createOrderConfirmationId,
  validateCheckout,
  type CheckoutDetails,
} from "./checkout";

const validDetails: CheckoutDetails = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  shippingAddress: "12 Engine Way",
};

const cart: CartLine[] = [
  { productId: "sample", quantity: 2 },
  { productId: "special", quantity: 1 },
];

describe("checkout helpers", () => {
  it("returns a name error when name is missing", () => {
    expect(validateCheckout({ ...validDetails, name: " " }).errors.name).toBe(
      "Name is required.",
    );
  });

  it("returns an email error when email is missing or malformed", () => {
    expect(validateCheckout({ ...validDetails, email: "" }).errors.email).toBe(
      "Email is required.",
    );
    expect(
      validateCheckout({ ...validDetails, email: "ada.example.com" }).errors
        .email,
    ).toBe("Enter a valid email address.");
  });

  it("returns a shipping address error when address is missing", () => {
    expect(
      validateCheckout({ ...validDetails, shippingAddress: " " }).errors
        .shippingAddress,
    ).toBe("Shipping address is required.");
  });

  it("returns a valid result for complete details", () => {
    expect(validateCheckout(validDetails)).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it("creates a stable confirmation id for repeated calls", () => {
    expect(createOrderConfirmationId(cart, validDetails)).toBe(
      createOrderConfirmationId(cart, validDetails),
    );
  });

  it("creates the same confirmation id when cart lines are reordered", () => {
    expect(createOrderConfirmationId(cart, validDetails)).toBe(
      createOrderConfirmationId([...cart].reverse(), validDetails),
    );
  });

  it("changes confirmation id when cart contents or email meaning changes", () => {
    const baseId = createOrderConfirmationId(cart, validDetails);

    expect(
      createOrderConfirmationId(
        [{ productId: "sample", quantity: 3 }],
        validDetails,
      ),
    ).not.toBe(baseId);
    expect(
      createOrderConfirmationId(cart, {
        ...validDetails,
        email: "other@example.com",
      }),
    ).not.toBe(baseId);
  });

  it("normalizes surrounding whitespace and email casing for ids", () => {
    expect(createOrderConfirmationId(cart, validDetails)).toBe(
      createOrderConfirmationId(cart, {
        name: " Ada Lovelace ",
        email: " ADA@EXAMPLE.COM ",
        shippingAddress: " 12 Engine Way ",
      }),
    );
  });
});
