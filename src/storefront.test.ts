import { describe, expect, it } from "vitest";
import {
  addCartItem,
  calculateCartSubtotal,
  calculateCartSummary,
  calculateCartTotal,
  calculateShipping,
  calculateTax,
  createOrderConfirmationId,
  formatPrice,
  getVisibleProducts,
  products,
  removeCartItem,
  updateCartItemQuantity,
  validateCheckout,
} from "./storefront";

describe("storefront helpers", () => {
  it("formats product prices in USD", () => {
    expect(formatPrice(1299)).toBe("$12.99");
  });

  it("returns an empty summary for an empty cart", () => {
    expect(calculateCartSummary([], products)).toEqual({
      itemCount: 0,
      subtotalCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  });

  it("aggregates item quantities and subtotals", () => {
    expect(
      calculateCartSummary(
        [
          { productId: "desk-starter-kit", quantity: 2 },
          { productId: "travel-tumbler", quantity: 3 },
        ],
        products,
      ),
    ).toEqual({
      itemCount: 5,
      subtotalCents: 20400,
      shippingCents: 500,
      taxCents: 1632,
      totalCents: 22532,
    });
  });

  it("ignores unknown product ids", () => {
    expect(
      calculateCartSummary(
        [{ productId: "missing-item", quantity: 4 }],
        products,
      ),
    ).toEqual({
      itemCount: 0,
      subtotalCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  });

  it("filters products by category", () => {
    expect(
      getVisibleProducts(products, { category: "drinkware" }).map(
        (product) => product.id,
      ),
    ).toEqual(["travel-tumbler"]);
  });

  it("searches product names case-insensitively", () => {
    expect(
      getVisibleProducts(products, { query: "desk" }).map(
        (product) => product.id,
      ),
    ).toEqual(["desk-starter-kit"]);
  });

  it("searches product descriptions case-insensitively", () => {
    expect(
      getVisibleProducts(products, { query: "COMMUTES" }).map(
        (product) => product.id,
      ),
    ).toEqual(["travel-tumbler"]);
  });

  it("treats a blank query like no query", () => {
    expect(
      getVisibleProducts(products, { category: "bags", query: "   " }).map(
        (product) => product.id,
      ),
    ).toEqual(["weekend-tote"]);
  });

  it("sorts products by price ascending and descending", () => {
    expect(
      getVisibleProducts(products, { sort: "price-asc" }).map(
        (product) => product.id,
      ),
    ).toEqual(["travel-tumbler", "desk-starter-kit", "weekend-tote"]);

    expect(
      getVisibleProducts(products, { sort: "price-desc" }).map(
        (product) => product.id,
      ),
    ).toEqual(["weekend-tote", "desk-starter-kit", "travel-tumbler"]);
  });

  it("preserves source order for featured sorting", () => {
    expect(getVisibleProducts(products).map((product) => product.id)).toEqual([
      "desk-starter-kit",
      "travel-tumbler",
      "weekend-tote",
    ]);

    expect(
      getVisibleProducts(products, { sort: "featured" }).map(
        (product) => product.id,
      ),
    ).toEqual(["desk-starter-kit", "travel-tumbler", "weekend-tote"]);
  });

  it("does not mutate the original product order when sorting", () => {
    const originalOrder = products.map((product) => product.id);

    getVisibleProducts(products, { sort: "price-desc" });

    expect(products.map((product) => product.id)).toEqual(originalOrder);
  });

  it("adds new cart lines and increments existing items without mutating input", () => {
    const cartItems = [{ productId: "desk-starter-kit", quantity: 1 }];

    expect(addCartItem([], "travel-tumbler")).toEqual([
      { productId: "travel-tumbler", quantity: 1 },
    ]);
    expect(addCartItem(cartItems, "desk-starter-kit")).toEqual([
      { productId: "desk-starter-kit", quantity: 2 },
    ]);
    expect(cartItems).toEqual([{ productId: "desk-starter-kit", quantity: 1 }]);
  });

  it("removes only the matching cart line", () => {
    expect(
      removeCartItem(
        [
          { productId: "desk-starter-kit", quantity: 1 },
          { productId: "travel-tumbler", quantity: 2 },
        ],
        "desk-starter-kit",
      ),
    ).toEqual([{ productId: "travel-tumbler", quantity: 2 }]);
  });

  it("updates quantities and removes non-positive quantities", () => {
    const cartItems = [
      { productId: "desk-starter-kit", quantity: 1 },
      { productId: "travel-tumbler", quantity: 2 },
    ];

    expect(updateCartItemQuantity(cartItems, "travel-tumbler", 4)).toEqual([
      { productId: "desk-starter-kit", quantity: 1 },
      { productId: "travel-tumbler", quantity: 4 },
    ]);
    expect(updateCartItemQuantity(cartItems, "travel-tumbler", 0)).toEqual([
      { productId: "desk-starter-kit", quantity: 1 },
    ]);
  });

  it("calculates subtotal, shipping, tax, and total deterministically", () => {
    const cartItems = [{ productId: "desk-starter-kit", quantity: 2 }];

    expect(calculateCartSubtotal(cartItems, products)).toBe(10800);
    expect(
      calculateCartSubtotal([{ productId: "missing", quantity: 3 }], products),
    ).toBe(0);
    expect(calculateShipping(0)).toBe(0);
    expect(calculateShipping(10800)).toBe(500);
    expect(calculateTax(10800)).toBe(864);
    expect(calculateCartTotal(cartItems, products)).toEqual({
      itemCount: 2,
      subtotalCents: 10800,
      shippingCents: 500,
      taxCents: 864,
      totalCents: 12164,
    });
  });

  it("validates checkout details and rejects an empty cart", () => {
    expect(
      validateCheckout(
        { name: " ", email: "bad-email", shippingAddress: "" },
        [],
        products,
      ),
    ).toEqual({
      isValid: false,
      errors: {
        name: "Enter your name.",
        email: "Enter a valid email address.",
        shippingAddress: "Enter a shipping address.",
        cart: "Add at least one catalog item to checkout.",
      },
    });
  });

  it("accepts valid checkout details with a known cart item", () => {
    expect(
      validateCheckout(
        {
          name: "Ada Lovelace",
          email: "ada@example.com",
          shippingAddress: "12 Algorithm Way",
        },
        [{ productId: "desk-starter-kit", quantity: 1 }],
        products,
      ),
    ).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it("creates deterministic order confirmation ids independent of cart order", () => {
    const details = {
      name: " Ada Lovelace ",
      email: "ADA@example.com",
      shippingAddress: " 12 Algorithm Way ",
    };
    const firstCart = [
      { productId: "desk-starter-kit", quantity: 1 },
      { productId: "travel-tumbler", quantity: 2 },
    ];
    const secondCart = [
      { productId: "travel-tumbler", quantity: 2 },
      { productId: "desk-starter-kit", quantity: 1 },
    ];
    const confirmationId = createOrderConfirmationId(
      details,
      firstCart,
      products,
    );

    expect(confirmationId).toMatch(/^X15-[0-9A-Z]+$/);
    expect(createOrderConfirmationId(details, firstCart, products)).toBe(
      confirmationId,
    );
    expect(createOrderConfirmationId(details, secondCart, products)).toBe(
      confirmationId,
    );
  });
});
