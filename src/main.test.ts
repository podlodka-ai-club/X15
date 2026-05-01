import { describe, expect, it } from "vitest";
import { renderStorefront } from "./main";
import { products } from "./storefront";

describe("renderStorefront", () => {
  it("renders the storefront shell sections", () => {
    const html = renderStorefront(products);

    expect(html).toContain("X15 Store");
    expect(html).toContain('id="products"');
    expect(html).toContain('aria-label="Cart summary placeholder"');
    expect(html).toContain("Checkout placeholder");
  });

  it("renders product cards for the starter catalog", () => {
    const html = renderStorefront(products);

    expect(html).toContain("Desk Starter Kit");
    expect(html).toContain("Travel Tumbler");
    expect(html).toContain("Weekend Tote");
  });

  it("renders shell placeholders with an empty catalog", () => {
    const html = renderStorefront([]);

    expect(html).toContain("Featured products");
    expect(html).toContain("0 items");
    expect(html).toContain("$0.00");
  });
});
