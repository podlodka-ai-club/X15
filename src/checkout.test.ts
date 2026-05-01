import { describe, expect, it } from "vitest";

import type { CartLine } from "./cart";
import {
  createOrderConfirmationId,
  validateCheckout,
  type CheckoutDetails,
} from "./checkout";
import type { Product } from "./main";

const sampleDetails: CheckoutDetails = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  shippingAddress: "12 Market Street",
};

const sampleProduct: Product = {
  id: "sample",
  name: "Sample Product",
  description: "Used for checkout tests.",
  price: 12.5,
  category: "Test",
};

const secondProduct: Product = {
  ...sampleProduct,
  id: "second",
  name: "Second Product",
  price: 8,
};

const cartLines: CartLine[] = [
  { product: sampleProduct, quantity: 1 },
  { product: secondProduct, quantity: 2 },
];

describe("checkout helpers", () => {
  it("returns field errors for missing required details", () => {
    expect(
      validateCheckout({
        name: "",
        email: "",
        shippingAddress: "",
      }),
    ).toEqual({
      valid: false,
      errors: {
        name: "Enter your name.",
        email: "Enter your email.",
        shippingAddress: "Enter your shipping address.",
      },
    });
  });

  it("returns a field error for invalid email", () => {
    expect(
      validateCheckout({
        ...sampleDetails,
        email: "not-an-email",
      }),
    ).toEqual({
      valid: false,
      errors: {
        email: "Enter a valid email.",
      },
    });
  });

  it("returns trimmed details for valid checkout input", () => {
    expect(
      validateCheckout({
        name: " Ada Lovelace ",
        email: " ADA@EXAMPLE.COM ",
        shippingAddress: " 12 Market Street ",
      }),
    ).toEqual({
      valid: true,
      details: sampleDetails,
    });
  });

  it("creates a deterministic confirmation id across repeated calls", () => {
    expect(createOrderConfirmationId(sampleDetails, cartLines)).toBe(
      createOrderConfirmationId(sampleDetails, cartLines),
    );
  });

  it("creates the same confirmation id regardless of cart line order", () => {
    expect(createOrderConfirmationId(sampleDetails, cartLines)).toBe(
      createOrderConfirmationId(sampleDetails, [...cartLines].reverse()),
    );
  });

  it("changes the confirmation id when cart contents change", () => {
    expect(createOrderConfirmationId(sampleDetails, cartLines)).not.toBe(
      createOrderConfirmationId(sampleDetails, [
        { product: sampleProduct, quantity: 2 },
        { product: secondProduct, quantity: 2 },
      ]),
    );
  });
});
