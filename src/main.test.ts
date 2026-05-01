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

  it("renders shell placeholders with an empty catalog", () => {
    const html = renderStorefront([]);

    expect(html).toContain("Featured products");
    expect(html).toContain("No products match your search.");
    expect(html).toContain("0 items");
    expect(html).toContain("$0.00");
  });
});
