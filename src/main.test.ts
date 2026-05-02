// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const importStorefront = async () => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  return import('./main');
};

const getProductNames = (): string[] =>
  [...document.querySelectorAll('.product-card__title')].map((title) => title.textContent ?? '');

describe('renderStorefront', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
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
  });

  it('renders catalog controls', async () => {
    await importStorefront();

    expect(document.querySelector('.catalog__controls')).not.toBeNull();
    expect(document.querySelector<HTMLInputElement>('.catalog__input')?.placeholder).toBe(
      'Search products',
    );
    expect(document.querySelectorAll<HTMLSelectElement>('.catalog__select')).toHaveLength(2);
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
