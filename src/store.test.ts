import { describe, expect, it } from 'vitest';
import {
  applyCatalogQuery,
  formatPrice,
  getCartSummary,
  getProductCategories,
  products,
  type CatalogQuery,
} from './store';

const defaultQuery: CatalogQuery = {
  category: '',
  searchText: '',
  priceSort: 'featured',
};

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

describe('getProductCategories', () => {
  it('returns unique categories in product order', () => {
    expect(getProductCategories(products)).toEqual([
      'Outerwear',
      'Accessories',
      'Knitwear',
      'Footwear',
    ]);
  });
});

describe('applyCatalogQuery', () => {
  it('filters products by category', () => {
    expect(
      applyCatalogQuery(products, {
        ...defaultQuery,
        category: 'Accessories',
      }).map((product) => product.id),
    ).toEqual(['canvas-tote']);
  });

  it('searches name, description, and category case-insensitively', () => {
    expect(
      applyCatalogQuery(products, {
        ...defaultQuery,
        searchText: 'sneaker',
      }).map((product) => product.id),
    ).toEqual(['trail-sneaker']);

    expect(
      applyCatalogQuery(products, {
        ...defaultQuery,
        searchText: 'DAILY',
      }).map((product) => product.id),
    ).toEqual(['canvas-tote']);

    expect(
      applyCatalogQuery(products, {
        ...defaultQuery,
        searchText: 'footwear',
      }).map((product) => product.id),
    ).toEqual(['trail-sneaker']);
  });

  it('sorts products by ascending price', () => {
    expect(
      applyCatalogQuery(products, {
        ...defaultQuery,
        priceSort: 'price-asc',
      }).map((product) => product.id),
    ).toEqual([
      'canvas-tote',
      'ribbed-sweater',
      'trail-sneaker',
      'field-jacket',
    ]);
  });

  it('sorts products by descending price', () => {
    expect(
      applyCatalogQuery(products, {
        ...defaultQuery,
        priceSort: 'price-desc',
      }).map((product) => product.id),
    ).toEqual([
      'field-jacket',
      'trail-sneaker',
      'ribbed-sweater',
      'canvas-tote',
    ]);
  });

  it('combines category, search, and price sort criteria', () => {
    const productList = [
      ...products,
      {
        id: 'city-sneaker',
        name: 'City Sneaker',
        description: 'Daily sneaker with a cushioned insole.',
        priceCents: 8200,
        category: 'Footwear',
      },
    ];

    expect(
      applyCatalogQuery(productList, {
        category: 'Footwear',
        searchText: 'sneaker',
        priceSort: 'price-asc',
      }).map((product) => product.id),
    ).toEqual(['city-sneaker', 'trail-sneaker']);
  });

  it('does not mutate the original product order', () => {
    const originalOrder = products.map((product) => product.id);

    applyCatalogQuery(products, {
      ...defaultQuery,
      priceSort: 'price-asc',
    });

    expect(products.map((product) => product.id)).toEqual(originalOrder);
  });
});

describe('formatPrice', () => {
  it('formats cents as US dollar prices', () => {
    expect(formatPrice(12800)).toBe('$128.00');
  });
});
