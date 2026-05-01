import { describe, expect, it } from "vitest";
import { renderStorefront } from "./main";
import { products } from "./storefront";

describe("renderStorefront", () => {
  it("renders the storefront shell sections", () => {
    const html = renderStorefront(products);

    expect(html).toContain("X15 Store");
    expect(html).toContain('id="products"');
    expect(html).toContain('aria-label="Cart totals"');
    expect(html).toContain("Checkout details");
    expect(html).toContain("data-checkout-form");
  });

  it("renders product cards for the starter catalog", () => {
    const html = renderStorefront(products);

    expect(html).toContain("Desk Starter Kit");
    expect(html).toContain("Travel Tumbler");
    expect(html).toContain("Weekend Tote");
    expect(html).toContain('data-cart-add="desk-starter-kit"');
    expect(html).toContain("Add to cart");
  });

  it("renders catalog browsing controls", () => {
    const html = renderStorefront(products);

    expect(html).toContain("Search products");
    expect(html).toContain('id="catalog-search"');
    expect(html).toContain('id="catalog-category"');
    expect(html).toContain("All categories");
    expect(html).toContain("Workspace");
    expect(html).toContain("Drinkware");
    expect(html).toContain("Bags");
    expect(html).toContain('id="catalog-sort"');
    expect(html).toContain("Featured");
    expect(html).toContain("Price: low to high");
    expect(html).toContain("Price: high to low");
  });

  it("renders a catalog result count", () => {
    const html = renderStorefront(products);

    expect(html).toContain('class="catalog-results__summary"');
    expect(html).toContain("3 products");
  });

  it("renders an empty catalog and cart with zero totals", () => {
    const html = renderStorefront([]);

    expect(html).toContain("Featured products");
    expect(html).toContain("No products match your search.");
    expect(html).toContain("Your cart is empty.");
    expect(html).toContain("0 products");
    expect(html).toContain("$0.00");
    expect(html).toContain("<dd>0</dd>");
  });

  it("renders cart rows and totals from state", () => {
    const html = renderStorefront(products, {
      cartItems: [{ productId: "desk-starter-kit", quantity: 2 }],
    });

    expect(html).toContain("Desk Starter Kit");
    expect(html).toContain('value="2"');
    expect(html).toContain("$108.00");
    expect(html).toContain("$5.00");
    expect(html).toContain("$8.64");
    expect(html).toContain("$121.64");
  });

  it("renders checkout validation errors from state", () => {
    const html = renderStorefront(products, {
      checkoutErrors: {
        name: "Enter your name.",
        email: "Enter a valid email address.",
        shippingAddress: "Enter a shipping address.",
        cart: "Add at least one catalog item to checkout.",
      },
    });

    expect(html).toContain("Enter your name.");
    expect(html).toContain("Enter a valid email address.");
    expect(html).toContain("Enter a shipping address.");
    expect(html).toContain("Add at least one catalog item to checkout.");
  });

  it("renders order confirmation when provided", () => {
    const html = renderStorefront(products, {
      confirmationId: "X15-ABC1234",
    });

    expect(html).toContain("Order confirmed");
    expect(html).toContain("X15-ABC1234");
    expect(html).toContain('aria-live="polite"');
  });
});
