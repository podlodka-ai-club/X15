import { describe, expect, it } from 'vitest';

import { type CartItem } from './cart';
import { createOrderConfirmation, validateCheckout, type CheckoutValues } from './checkout';

const validValues: CheckoutValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  shippingAddress: '12 Engine Way',
};

const workflowKit = {
  id: 'workflow-kit',
  name: 'AI Workflow Kit',
  price: 49,
};

const researchSprint = {
  id: 'research-sprint',
  name: 'Research Sprint',
  price: 199,
};

const cartItems: CartItem[] = [
  { product: workflowKit, quantity: 2 },
  { product: researchSprint, quantity: 1 },
];

describe('checkout helpers', () => {
  it('requires a customer name', () => {
    expect(validateCheckout({ ...validValues, name: ' ' }, cartItems)).toMatchObject({
      name: 'Enter your name.',
    });
  });

  it('requires a valid email', () => {
    expect(validateCheckout({ ...validValues, email: '' }, cartItems)).toMatchObject({
      email: 'Enter your email.',
    });
    expect(validateCheckout({ ...validValues, email: 'ada.example.com' }, cartItems)).toMatchObject(
      {
        email: 'Enter a valid email.',
      },
    );
  });

  it('requires a shipping address', () => {
    expect(validateCheckout({ ...validValues, shippingAddress: '' }, cartItems)).toMatchObject({
      shippingAddress: 'Enter a shipping address.',
    });
  });

  it('rejects an empty cart', () => {
    expect(validateCheckout(validValues, [])).toMatchObject({
      cart: 'Add at least one product before checkout.',
    });
  });

  it('returns no errors for valid checkout values and cart items', () => {
    expect(validateCheckout(validValues, cartItems)).toEqual({});
  });

  it('creates a deterministic confirmation id', () => {
    expect(createOrderConfirmation(validValues, cartItems)).toEqual({
      orderId: 'X15-3-32076-7603',
      customerName: 'Ada Lovelace',
      itemCount: 3,
      total: 320.76,
    });
    expect(createOrderConfirmation(validValues, cartItems)).toEqual(
      createOrderConfirmation(validValues, cartItems),
    );
  });

  it('changes the order id when customer details or cart items change', () => {
    const confirmation = createOrderConfirmation(validValues, cartItems);
    const changedDetails = createOrderConfirmation(
      { ...validValues, shippingAddress: '99 Difference Road' },
      cartItems,
    );
    const changedCart = createOrderConfirmation(validValues, [
      { product: workflowKit, quantity: 1 },
    ]);

    expect(changedDetails.orderId).not.toBe(confirmation.orderId);
    expect(changedCart.orderId).not.toBe(confirmation.orderId);
  });

  it('throws when creating a confirmation with invalid values', () => {
    expect(() => createOrderConfirmation({ ...validValues, email: 'invalid' }, cartItems)).toThrow(
      'Checkout values are invalid.',
    );
  });
});
