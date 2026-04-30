import { describe, expect, it } from 'vitest';
import { formatPrice, getCartSummary, products } from './store';

describe('products', () => {
  it('provides storefront product fixtures with required fields', () => {
    expect(products).toHaveLength(4);

    products.forEach((product) => {
      expect(product.id).toEqual(expect.any(String));
      expect(product.name).toEqual(expect.any(String));
      expect(product.description).toEqual(expect.any(String));
      expect(product.category).toEqual(expect.any(String));
      expect(product.priceCents).toBeGreaterThan(0);
    });
  });
});

describe('getCartSummary', () => {
  it('returns a deterministic cart placeholder summary', () => {
    expect(getCartSummary(products)).toEqual({
      itemCount: 0,
      subtotalCents: 0,
      label: 'Cart summary placeholder',
    });
  });
});

describe('formatPrice', () => {
  it('formats cents as US dollar prices', () => {
    expect(formatPrice(12800)).toBe('$128.00');
  });
});
