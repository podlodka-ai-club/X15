// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const importStorefront = async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  return import('./main');
};

const getProductNames = (): string[] =>
  [...document.querySelectorAll('.product-card__title')].map((title) => title.textContent ?? '');

const getRequiredElement = <ElementType extends Element>(selector: string): ElementType => {
  const element = document.querySelector<ElementType>(selector);

  if (!element) {
    throw new Error(`Expected element matching ${selector}`);
  }

  return element;
};

const navigateTo = (route: string): void => {
  window.location.hash = route;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

describe('renderStorefront', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  it('filters products by category', async () => {
    const { applyCatalogFilters } = await importStorefront();

    const results = applyCatalogFilters(
      [
        {
          id: 'workflow-kit',
          name: 'AI Workflow Kit',
          description: 'Reusable prompts, checklists, and templates for product teams.',
          price: 49,
          category: 'Templates',
        },
        {
          id: 'research-sprint',
          name: 'Research Sprint',
          description: 'A compact discovery package for validating new product directions.',
          price: 199,
          category: 'Services',
        },
      ],
      { searchTerm: '', category: 'Services', sort: 'featured' },
    );

    expect(results.map((product) => product.name)).toEqual(['Research Sprint']);
  });

  it('searches products by text case-insensitively', async () => {
    const { applyCatalogFilters } = await importStorefront();

    const results = applyCatalogFilters(
      [
        {
          id: 'model-review',
          name: 'Model Review Session',
          description: 'Expert feedback on model behavior, evals, and launch readiness.',
          price: 299,
          category: 'Advisory',
        },
        {
          id: 'launch-pack',
          name: 'Launch Pack',
          description: 'Storefront-ready assets and operating docs for an AI product release.',
          price: 129,
          category: 'Assets',
        },
      ],
      { searchTerm: 'EVALS', category: 'all', sort: 'featured' },
    );

    expect(results.map((product) => product.name)).toEqual(['Model Review Session']);
  });

  it('sorts products by price', async () => {
    const { applyCatalogFilters } = await importStorefront();
    const sampleProducts = [
      {
        id: 'research-sprint',
        name: 'Research Sprint',
        description: 'A compact discovery package for validating new product directions.',
        price: 199,
        category: 'Services',
      },
      {
        id: 'workflow-kit',
        name: 'AI Workflow Kit',
        description: 'Reusable prompts, checklists, and templates for product teams.',
        price: 49,
        category: 'Templates',
      },
      {
        id: 'model-review',
        name: 'Model Review Session',
        description: 'Expert feedback on model behavior, evals, and launch readiness.',
        price: 299,
        category: 'Advisory',
      },
    ];

    const ascending = applyCatalogFilters(sampleProducts, {
      searchTerm: '',
      category: 'all',
      sort: 'price-asc',
    });
    const descending = applyCatalogFilters(sampleProducts, {
      searchTerm: '',
      category: 'all',
      sort: 'price-desc',
    });

    expect(ascending.map((product) => product.name)).toEqual([
      'AI Workflow Kit',
      'Research Sprint',
      'Model Review Session',
    ]);
    expect(descending.map((product) => product.name)).toEqual([
      'Model Review Session',
      'Research Sprint',
      'AI Workflow Kit',
    ]);
    expect(sampleProducts.map((product) => product.name)).toEqual([
      'Research Sprint',
      'AI Workflow Kit',
      'Model Review Session',
    ]);
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
    expect(document.body.textContent).toContain('Add to cart');
  });

  it('renders catalog controls', async () => {
    await importStorefront();

    expect(document.querySelector('.catalog__controls')).not.toBeNull();
    expect(document.querySelector<HTMLInputElement>('.catalog__input')?.placeholder).toBe(
      'Search products',
    );
    expect(document.querySelectorAll<HTMLSelectElement>('.catalog__select')).toHaveLength(2);
  });

  it('renders catalog, cart, and checkout as dedicated hash-routed pages', async () => {
    await importStorefront();

    expect(document.querySelector('.storefront-nav')).not.toBeNull();
    expect(document.querySelector('.catalog')).not.toBeNull();
    expect(document.querySelector('.cart-summary')).toBeNull();
    expect(document.querySelector('.checkout-placeholder')).toBeNull();
    expect(
      getRequiredElement<HTMLAnchorElement>('.storefront-nav__link[aria-current="page"]').href,
    ).toContain('#/catalog');

    navigateTo('#/cart');

    expect(document.querySelector('.catalog')).toBeNull();
    expect(document.querySelector('.cart-summary')).not.toBeNull();
    expect(document.querySelector('.checkout-placeholder')).toBeNull();
    expect(
      getRequiredElement<HTMLAnchorElement>('.storefront-nav__link[aria-current="page"]').href,
    ).toContain('#/cart');

    navigateTo('#/checkout');

    expect(document.querySelector('.catalog')).toBeNull();
    expect(document.querySelector('.cart-summary')).toBeNull();
    expect(document.querySelector('.checkout-placeholder')).not.toBeNull();
    expect(
      getRequiredElement<HTMLAnchorElement>('.storefront-nav__link[aria-current="page"]').href,
    ).toContain('#/checkout');
  });

  it('updates product cards from the search input', async () => {
    await importStorefront();

    const searchInput = document.querySelector('.catalog__input') as HTMLInputElement;
    searchInput.value = 'workflow';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(getProductNames()).toEqual(['AI Workflow Kit']);
  });

  it('updates product cards from the category select', async () => {
    await importStorefront();

    const categorySelect = document.querySelector(
      '.catalog__select[aria-label="Filter by category"]',
    ) as HTMLSelectElement;
    categorySelect.value = 'Advisory';
    categorySelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(getProductNames()).toEqual(['Model Review Session']);
  });

  it('updates product card order from the sort select', async () => {
    await importStorefront();

    const sortSelect = document.querySelector(
      '.catalog__select[aria-label="Sort products"]',
    ) as HTMLSelectElement;
    sortSelect.value = 'price-desc';
    sortSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(getProductNames()).toEqual([
      'Model Review Session',
      'Research Sprint',
      'Launch Pack',
      'AI Workflow Kit',
    ]);
  });

  it('renders an empty catalog message when filters match no products', async () => {
    await importStorefront();

    const searchInput = document.querySelector('.catalog__input') as HTMLInputElement;
    searchInput.value = 'nothing matches this query';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(document.querySelectorAll('.product-card')).toHaveLength(0);
    expect(document.querySelector('.catalog__empty')?.textContent).toBe(
      'No products match the current filters.',
    );
  });

  it('renders empty cart and unavailable checkout states', async () => {
    await importStorefront();

    navigateTo('#/cart');

    expect(document.querySelector('.cart-summary')?.textContent).toContain('Your cart is empty.');
    expect(document.querySelector('.cart-summary')?.textContent).toContain('0 items | $0.00 total');
    expect(document.querySelector('.checkout-placeholder')).toBeNull();

    navigateTo('#/checkout');

    expect(document.querySelector('.checkout-placeholder')?.textContent).toContain('Checkout');
    expect(document.querySelector('.checkout-placeholder__button')?.textContent).toBe(
      'Checkout unavailable',
    );
    expect(getRequiredElement<HTMLButtonElement>('.checkout-placeholder__button').disabled).toBe(
      true,
    );
  });

  it('adds products to the cart and increments quantity without duplicate rows', async () => {
    await importStorefront();

    const addButton = getRequiredElement<HTMLButtonElement>(
      '.product-card[data-product-id="workflow-kit"] .product-card__button',
    );

    addButton.click();
    navigateTo('#/cart');

    expect(document.querySelector('.cart-summary')?.textContent).toContain('AI Workflow Kit');
    expect(document.querySelector('.cart-summary')?.textContent).toContain('Subtotal$49.00');
    expect(document.querySelector('.cart-summary')?.textContent).toContain('Shipping$12.00');
    expect(document.querySelector('.cart-summary')?.textContent).toContain('Tax$3.92');
    expect(document.querySelector('.cart-summary')?.textContent).toContain('Total$64.92');

    navigateTo('#/checkout');

    expect(getRequiredElement<HTMLButtonElement>('.checkout-placeholder__button').disabled).toBe(
      false,
    );

    navigateTo('#/catalog');
    addButton.click();
    navigateTo('#/cart');

    expect(document.querySelectorAll('.cart-summary__row')).toHaveLength(1);
    expect(getRequiredElement<HTMLInputElement>('.cart-summary__quantity-input').value).toBe('2');
    expect(document.querySelector('.cart-summary')?.textContent).toContain(
      '2 items | $117.84 total',
    );
  });

  it('updates and removes cart quantities', async () => {
    await importStorefront();

    getRequiredElement<HTMLButtonElement>(
      '.product-card[data-product-id="workflow-kit"] .product-card__button',
    ).click();
    navigateTo('#/cart');

    const quantityInput = getRequiredElement<HTMLInputElement>('.cart-summary__quantity-input');
    quantityInput.value = '3';
    quantityInput.dispatchEvent(new Event('change'));

    expect(document.querySelector('.cart-summary')?.textContent).toContain(
      '3 items | $170.76 total',
    );

    getRequiredElement<HTMLButtonElement>('.cart-summary__remove').click();

    expect(document.querySelector('.cart-summary')?.textContent).toContain('Your cart is empty.');

    navigateTo('#/checkout');

    expect(getRequiredElement<HTMLButtonElement>('.checkout-placeholder__button').disabled).toBe(
      true,
    );
  });

  it('validates checkout details before confirming an order', async () => {
    await importStorefront();

    getRequiredElement<HTMLButtonElement>(
      '.product-card[data-product-id="workflow-kit"] .product-card__button',
    ).click();
    navigateTo('#/checkout');

    getRequiredElement<HTMLButtonElement>('.checkout-placeholder__button').click();

    expect(document.querySelector('.checkout-placeholder')?.textContent).toContain(
      'Enter your name.',
    );
    expect(document.querySelector('.checkout-placeholder')?.textContent).toContain(
      'Enter your email.',
    );
    expect(document.querySelector('.checkout-placeholder')?.textContent).toContain(
      'Enter a shipping address.',
    );
  });

  it('submits valid checkout details and shows a deterministic confirmation', async () => {
    await importStorefront();

    getRequiredElement<HTMLButtonElement>(
      '.product-card[data-product-id="workflow-kit"] .product-card__button',
    ).click();
    navigateTo('#/checkout');

    const nameInput = getRequiredElement<HTMLInputElement>('input[name="name"]');
    const emailInput = getRequiredElement<HTMLInputElement>('input[name="email"]');
    const addressInput = getRequiredElement<HTMLTextAreaElement>(
      'textarea[name="shippingAddress"]',
    );

    nameInput.value = 'Ada Lovelace';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'ada@example.com';
    emailInput.dispatchEvent(new Event('input'));
    addressInput.value = '12 Engine Way';
    addressInput.dispatchEvent(new Event('input'));

    getRequiredElement<HTMLButtonElement>('.checkout-placeholder__button').click();

    expect(document.querySelector('.checkout-confirmation')?.textContent).toContain(
      'Order confirmed',
    );
    expect(document.querySelector('.checkout-confirmation')?.textContent).toContain(
      'X15-1-6492-9199',
    );
    expect(document.querySelector('.checkout-confirmation')?.textContent).toContain('$64.92');
  });
});
