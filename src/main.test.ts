import { describe, expect, it } from "vitest";

import { escapeHtml, formatCurrency, renderProductCard, renderStorefront } from "./main";

describe("formatCurrency", () => {
  it("formats whole-dollar product prices", () => {
    expect(formatCurrency(48)).toBe("$48");
  });
});

describe("renderStorefront", () => {
  it("renders the storefront shell and ecommerce placeholders", () => {
    const html = renderStorefront();

    expect(html).toContain("Browse the X15 starter catalog");
    expect(html).toContain("Featured products");
    expect(html).toContain("Cart summary");
    expect(html).toContain("Checkout placeholder");
    expect(html).toContain("Linen Market Tote");
  });

  it("renders a stable empty state when no products are available", () => {
    expect(renderStorefront([])).toContain("Products will appear here soon.");
  });
});

describe("renderProductCard", () => {
  it("escapes dynamic product fields", () => {
    const html = renderProductCard({
      id: "test-product",
      name: "<Special Mug>",
      category: "Home & Office",
      price: 24,
      description: 'Good for "coffee" and tea.',
    });

    expect(html).toContain("&lt;Special Mug&gt;");
    expect(html).toContain("Home &amp; Office");
    expect(html).toContain("&quot;coffee&quot;");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-sensitive characters", () => {
    expect(escapeHtml(`<script>"Tom & Jerry's"</script>`)).toBe(
      "&lt;script&gt;&quot;Tom &amp; Jerry&#039;s&quot;&lt;/script&gt;",
    );
  });
});
