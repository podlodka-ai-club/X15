// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const importStorefront = async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  return import('./main');
};

describe('renderStorefront', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the storefront header', async () => {
    await importStorefront();

    expect(document.querySelector('.storefront-header')).not.toBeNull();
    expect(document.querySelector('h1')?.textContent).toBe('X15 Storefront');
  });

  it('renders all product cards', async () => {
    await importStorefront();

    const cards = document.querySelectorAll('.product-card');

    expect(cards).toHaveLength(4);
    expect(document.body.textContent).toContain('AI Workflow Kit');
    expect(document.body.textContent).toContain('Launch Pack');
  });

  it('renders the cart summary placeholder', async () => {
    await importStorefront();

    expect(document.querySelector('.cart-summary')?.textContent).toContain('0 items | $0 total');
    expect(document.querySelector('.cart-summary')?.textContent).toContain(
      'Selected products will appear here',
    );
  });

  it('renders the checkout placeholder', async () => {
    await importStorefront();

    expect(document.querySelector('.checkout-placeholder')?.textContent).toContain('Checkout');
    expect(document.querySelector('.checkout-placeholder__button')?.textContent).toBe(
      'Checkout unavailable',
    );
  });
});
