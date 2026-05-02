import { describe, expect, it } from 'vitest';

import {
  addCartItem,
  getCartItemCount,
  getCartShipping,
  getCartSubtotal,
  getCartTax,
  getCartTotal,
  getCartTotals,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
  type CartProduct,
} from './cart';

const workflowKit: CartProduct = {
  id: 'workflow-kit',
  name: 'AI Workflow Kit',
  price: 49,
};

const researchSprint: CartProduct = {
  id: 'research-sprint',
  name: 'Research Sprint',
  price: 199,
};

describe('cart helpers', () => {
  it('adds a new item without mutating existing items', () => {
    const items: CartItem[] = [];
    const nextItems = addCartItem(items, workflowKit);

    expect(nextItems).toEqual([{ product: workflowKit, quantity: 1 }]);
    expect(items).toEqual([]);
  });

  it('increments an existing item without adding duplicate rows', () => {
    const items: CartItem[] = [{ product: workflowKit, quantity: 1 }];
    const nextItems = addCartItem(items, workflowKit);

    expect(nextItems).toEqual([{ product: workflowKit, quantity: 2 }]);
    expect(nextItems).toHaveLength(1);
    expect(items[0]?.quantity).toBe(1);
  });

  it('removes an item by product id', () => {
    const items: CartItem[] = [
      { product: workflowKit, quantity: 1 },
      { product: researchSprint, quantity: 1 },
    ];

    expect(removeCartItem(items, workflowKit.id)).toEqual([
      { product: researchSprint, quantity: 1 },
    ]);
  });

  it('updates quantity using whole numbers', () => {
    const items: CartItem[] = [{ product: workflowKit, quantity: 1 }];

    expect(updateCartItemQuantity(items, workflowKit.id, 3.8)).toEqual([
      { product: workflowKit, quantity: 3 },
    ]);
  });

  it('removes an item when quantity is zero or lower', () => {
    const items: CartItem[] = [{ product: workflowKit, quantity: 1 }];

    expect(updateCartItemQuantity(items, workflowKit.id, 0)).toEqual([]);
    expect(updateCartItemQuantity(items, workflowKit.id, -2)).toEqual([]);
  });

  it('calculates subtotal, shipping threshold, tax, total, and count', () => {
    const items: CartItem[] = [
      { product: workflowKit, quantity: 2 },
      { product: researchSprint, quantity: 1 },
    ];

    expect(getCartItemCount(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(297);
    expect(getCartShipping(0)).toBe(0);
    expect(getCartShipping(249)).toBe(12);
    expect(getCartShipping(250)).toBe(0);
    expect(getCartTax(49.99)).toBe(4);
    expect(getCartTotal(items)).toBe(320.76);
    expect(getCartTotals(items)).toEqual({
      itemCount: 3,
      subtotal: 297,
      shipping: 0,
      tax: 23.76,
      total: 320.76,
    });
  });
});
