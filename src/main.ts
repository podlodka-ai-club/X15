import './styles.css';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export type PriceSort = 'featured' | 'price-asc' | 'price-desc';

export type CatalogFilters = {
  searchTerm: string;
  category: string;
  sort: PriceSort;
};

const products: Product[] = [
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
];

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);

export const applyCatalogFilters = (items: Product[], filters: CatalogFilters): Product[] => {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase();
  const filteredItems = items.filter((product) => {
    const matchesCategory = filters.category === 'all' || product.category === filters.category;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch) ||
      product.category.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  if (filters.sort === 'price-asc') {
    return [...filteredItems].sort((first, second) => first.price - second.price);
  }

  if (filters.sort === 'price-desc') {
    return [...filteredItems].sort((first, second) => second.price - first.price);
  }

  return [...filteredItems];
};

const createElement = <TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  className?: string,
  textContent?: string,
): HTMLElementTagNameMap[TagName] => {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
};

const createProductCard = (product: Product): HTMLElement => {
  const card = createElement('article', 'product-card');
  card.dataset.productId = product.id;

  const category = createElement('p', 'product-card__category', product.category);
  const title = createElement('h3', 'product-card__title', product.name);
  const description = createElement('p', 'product-card__description', product.description);
  const footer = createElement('div', 'product-card__footer');
  const price = createElement('strong', 'product-card__price', formatPrice(product.price));
  const button = createElement('button', 'product-card__button', 'Preview');

  button.type = 'button';
  button.setAttribute('aria-label', `Preview ${product.name}`);
  footer.append(price, button);
  card.append(category, title, description, footer);

  return card;
};

export const renderStorefront = (root: HTMLElement): void => {
  root.textContent = '';

  const currentFilters: CatalogFilters = {
    searchTerm: '',
    category: 'all',
    sort: 'featured',
  };

  const app = createElement('main', 'storefront');

  const header = createElement('header', 'storefront-header');
  const eyebrow = createElement('p', 'storefront-header__eyebrow', 'Podlodka AI Club');
  const title = createElement('h1', 'storefront-header__title', 'X15 Storefront');
  const summary = createElement(
    'p',
    'storefront-header__summary',
    'A compact ecommerce shell for browsing AI product starter packages.',
  );
  header.append(eyebrow, title, summary);

  const catalog = createElement('section', 'catalog');
  catalog.setAttribute('aria-labelledby', 'catalog-title');
  const catalogTitle = createElement('h2', 'section-title', 'Featured products');
  catalogTitle.id = 'catalog-title';

  const controls = createElement('div', 'catalog__controls');

  const searchField = createElement('label', 'catalog__field');
  const searchLabel = createElement('span', 'catalog__label', 'Search');
  const searchInput = createElement('input', 'catalog__input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search products';
  searchInput.setAttribute('aria-label', 'Search products');
  searchField.append(searchLabel, searchInput);

  const categoryField = createElement('label', 'catalog__field');
  const categoryLabel = createElement('span', 'catalog__label', 'Category');
  const categorySelect = createElement('select', 'catalog__select');
  categorySelect.setAttribute('aria-label', 'Filter by category');

  const allCategoriesOption = createElement('option', undefined, 'All categories');
  allCategoriesOption.value = 'all';
  categorySelect.append(allCategoriesOption);
  [...new Set(products.map((product) => product.category))].forEach((category) => {
    const option = createElement('option', undefined, category);
    option.value = category;
    categorySelect.append(option);
  });
  categoryField.append(categoryLabel, categorySelect);

  const sortField = createElement('label', 'catalog__field');
  const sortLabel = createElement('span', 'catalog__label', 'Sort');
  const sortSelect = createElement('select', 'catalog__select');
  sortSelect.setAttribute('aria-label', 'Sort products');

  [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: low to high' },
    { value: 'price-desc', label: 'Price: high to low' },
  ].forEach((sortOption) => {
    const option = createElement('option', undefined, sortOption.label);
    option.value = sortOption.value;
    sortSelect.append(option);
  });
  sortField.append(sortLabel, sortSelect);
  controls.append(searchField, categoryField, sortField);

  const productGrid = createElement('div', 'product-grid');

  const renderProducts = (): void => {
    productGrid.textContent = '';

    const visibleProducts = applyCatalogFilters(products, currentFilters);

    if (visibleProducts.length === 0) {
      productGrid.append(
        createElement('p', 'catalog__empty', 'No products match the current filters.'),
      );
      return;
    }

    visibleProducts.forEach((product) => productGrid.append(createProductCard(product)));
  };

  searchInput.addEventListener('input', () => {
    currentFilters.searchTerm = searchInput.value;
    renderProducts();
  });
  categorySelect.addEventListener('change', () => {
    currentFilters.category = categorySelect.value;
    renderProducts();
  });
  sortSelect.addEventListener('change', () => {
    currentFilters.sort = sortSelect.value as PriceSort;
    renderProducts();
  });

  renderProducts();
  catalog.append(catalogTitle, controls, productGrid);

  const checkoutArea = createElement('section', 'storefront-panels');
  checkoutArea.setAttribute('aria-label', 'Cart and checkout');

  const cartSummary = createElement('article', 'cart-summary');
  const cartTitle = createElement('h2', 'section-title', 'Cart summary');
  const cartText = createElement(
    'p',
    'panel-copy',
    'Selected products will appear here when cart interactions are added.',
  );
  const cartMeta = createElement('p', 'cart-summary__meta', '0 items | $0 total');
  cartSummary.append(cartTitle, cartText, cartMeta);

  const checkoutPlaceholder = createElement('article', 'checkout-placeholder');
  const checkoutTitle = createElement('h2', 'section-title', 'Checkout');
  const checkoutText = createElement(
    'p',
    'panel-copy',
    'Checkout details, payment, and fulfillment will be introduced in a future iteration.',
  );
  const checkoutButton = createElement(
    'button',
    'checkout-placeholder__button',
    'Checkout unavailable',
  );
  checkoutButton.type = 'button';
  checkoutButton.disabled = true;
  checkoutPlaceholder.append(checkoutTitle, checkoutText, checkoutButton);

  checkoutArea.append(cartSummary, checkoutPlaceholder);
  app.append(header, catalog, checkoutArea);
  root.append(app);
};

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Storefront root element #app was not found.');
}

renderStorefront(root);
