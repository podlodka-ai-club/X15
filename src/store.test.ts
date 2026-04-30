import { describe, expect, it } from 'vitest';
import {
  addCartItem,
  applyCatalogQuery,
  createOrderConfirmation,
  formatPrice,
  getCartSummary,
  getProductCategories,
  products,
  removeCartItem,
  updateCartItemQuantity,
  validateCheckout,
  type CatalogQuery,
  type CartItem,
  type CheckoutDetails,
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

describe('cart item helpers', () => {
  it('adds a new item and increments an existing item', () => {
    const cartItems = addCartItem([], 'field-jacket');
    const updatedCartItems = addCartItem(cartItems, 'field-jacket');

    expect(cartItems).toEqual([{ productId: 'field-jacket', quantity: 1 }]);
    expect(updatedCartItems).toEqual([
      { productId: 'field-jacket', quantity: 2 },
    ]);
  });

  it('removes a matching item and leaves other items unchanged', () => {
    const cartItems: CartItem[] = [
      { productId: 'field-jacket', quantity: 1 },
      { productId: 'canvas-tote', quantity: 2 },
    ];

    expect(removeCartItem(cartItems, 'field-jacket')).toEqual([
      { productId: 'canvas-tote', quantity: 2 },
    ]);
    expect(removeCartItem(cartItems, 'missing-product')).toEqual(cartItems);
  });

  it('updates a positive quantity and removes at zero', () => {
    const cartItems: CartItem[] = [{ productId: 'field-jacket', quantity: 1 }];

    expect(updateCartItemQuantity(cartItems, 'field-jacket', 3)).toEqual([
      { productId: 'field-jacket', quantity: 3 },
    ]);
    expect(updateCartItemQuantity(cartItems, 'field-jacket', 0)).toEqual([]);
  });
});

describe('getCartSummary', () => {
  it('returns an empty cart summary with zero totals', () => {
    expect(getCartSummary([], products)).toEqual({
      items: [],
      itemCount: 0,
      subtotalCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
      label: 'Your cart is empty',
    });
  });

  it('returns line items, subtotal, shipping, tax, and total', () => {
    const summary = getCartSummary(
      [
        { productId: 'field-jacket', quantity: 1 },
        { productId: 'canvas-tote', quantity: 2 },
        { productId: 'unknown-product', quantity: 4 },
      ],
      products,
    );

    expect(summary).toEqual({
      items: [
        {
          product: products[0],
          quantity: 1,
          lineTotalCents: 12800,
        },
        {
          product: products[1],
          quantity: 2,
          lineTotalCents: 8400,
        },
      ],
      itemCount: 3,
      subtotalCents: 21200,
      shippingCents: 599,
      taxCents: 1749,
      totalCents: 23548,
      label: 'Ready for checkout',
    });
  });
});

describe('validateCheckout', () => {
  it('returns field errors for invalid checkout details', () => {
    expect(
      validateCheckout({
        name: ' ',
        email: 'not-an-email',
        shippingAddress: '',
      }),
    ).toEqual({
      valid: false,
      errors: {
        name: 'Enter your name.',
        email: 'Enter a valid email address.',
        shippingAddress: 'Enter a shipping address.',
      },
    });
  });

  it('accepts trimmed valid checkout details', () => {
    expect(
      validateCheckout({
        name: ' Ada Lovelace ',
        email: 'ada@example.com ',
        shippingAddress: ' 123 Market Street ',
      }),
    ).toEqual({
      valid: true,
      errors: {},
    });
  });
});

describe('createOrderConfirmation', () => {
  const details: CheckoutDetails = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    shippingAddress: '123 Market Street',
  };

  it('returns the same id for the same details and cart regardless of item order', () => {
    const firstConfirmation = createOrderConfirmation(
      details,
      [
        { productId: 'field-jacket', quantity: 1 },
        { productId: 'canvas-tote', quantity: 2 },
      ],
      products,
    );
    const secondConfirmation = createOrderConfirmation(
      details,
      [
        { productId: 'canvas-tote', quantity: 2 },
        { productId: 'field-jacket', quantity: 1 },
      ],
      products,
    );

    expect(secondConfirmation).toEqual(firstConfirmation);
    expect(firstConfirmation).toEqual({
      confirmationId: expect.stringMatching(/^X15-[0-9A-Z]+$/),
      itemCount: 3,
      totalCents: 23548,
    });
  });

  it('changes the id when confirmation inputs change', () => {
    const firstConfirmation = createOrderConfirmation(
      details,
      [{ productId: 'field-jacket', quantity: 1 }],
      products,
    );
    const secondConfirmation = createOrderConfirmation(
      { ...details, email: 'grace@example.com' },
      [{ productId: 'field-jacket', quantity: 1 }],
      products,
    );

    expect(secondConfirmation.confirmationId).not.toBe(
      firstConfirmation.confirmationId,
    );
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
