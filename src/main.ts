import './styles.css';

import {
  addCartItem,
  getCartTotals,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from './cart';
import {
  createOrderConfirmation,
  validateCheckout,
  type CheckoutConfirmation,
  type CheckoutErrors,
  type CheckoutValues,
} from './checkout';

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

type StorefrontView = 'catalog' | 'cart' | 'checkout';

const storefrontViews: StorefrontView[] = ['catalog', 'cart', 'checkout'];

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

const formatMoney = (price: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

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

const createProductCard = (
  product: Product,
  onAddToCart: (product: Product) => void,
): HTMLElement => {
  const card = createElement('article', 'product-card');
  card.dataset.productId = product.id;

  const category = createElement('p', 'product-card__category', product.category);
  const title = createElement('h3', 'product-card__title', product.name);
  const description = createElement('p', 'product-card__description', product.description);
  const footer = createElement('div', 'product-card__footer');
  const price = createElement('strong', 'product-card__price', formatPrice(product.price));
  const button = createElement('button', 'product-card__button', 'Add to cart');

  button.type = 'button';
  button.setAttribute('aria-label', `Add ${product.name} to cart`);
  button.addEventListener('click', () => onAddToCart(product));
  footer.append(price, button);
  card.append(category, title, description, footer);

  return card;
};

const getStorefrontViewFromHash = (hash: string): StorefrontView => {
  const route = hash.replace(/^#\/?/, '');

  if (storefrontViews.includes(route as StorefrontView)) {
    return route as StorefrontView;
  }

  return 'catalog';
};

export const renderStorefront = (root: HTMLElement): void => {
  root.textContent = '';

  const currentFilters: CatalogFilters = {
    searchTerm: '',
    category: 'all',
    sort: 'featured',
  };

  let cartItems: CartItem[] = [];
  let checkoutValues: CheckoutValues = {
    name: '',
    email: '',
    shippingAddress: '',
  };
  let checkoutErrors: CheckoutErrors = {};
  let confirmation: CheckoutConfirmation | null = null;
  let activeView = getStorefrontViewFromHash(window.location.hash);

  const app = createElement('main', 'storefront');

  const header = createElement('header', 'storefront-header');
  const eyebrow = createElement('p', 'storefront-header__eyebrow', 'Podlodka AI Club');
  const title = createElement('h1', 'storefront-header__title', 'X15 Storefront');
  const summary = createElement(
    'p',
    'storefront-header__summary',
    'A compact ecommerce shell for browsing AI product starter packages.',
  );
  const navigation = createElement('nav', 'storefront-nav');
  navigation.setAttribute('aria-label', 'Storefront pages');
  const navLinks = storefrontViews.map((view) => {
    const link = createElement(
      'a',
      'storefront-nav__link',
      view.charAt(0).toUpperCase() + view.slice(1),
    );
    link.href = `#/${view}`;
    link.dataset.view = view;
    return link;
  });
  navigation.append(...navLinks);
  header.append(eyebrow, title, summary, navigation);

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

    visibleProducts.forEach((product) =>
      productGrid.append(createProductCard(product, handleAddToCart)),
    );
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

  catalog.append(catalogTitle, controls, productGrid);

  const cartSummary = createElement('article', 'cart-summary');
  const cartTitle = createElement('h2', 'section-title', 'Cart summary');

  const checkoutPlaceholder = createElement('article', 'checkout-placeholder');
  const checkoutTitle = createElement('h2', 'section-title', 'Checkout');
  const activePage = createElement('section', 'storefront-page');
  activePage.setAttribute('aria-live', 'polite');

  const renderCartSummary = (): void => {
    const totals = getCartTotals(cartItems);
    const itemLabel = totals.itemCount === 1 ? '1 item' : `${totals.itemCount} items`;
    const cartMeta = createElement(
      'p',
      'cart-summary__meta',
      `${itemLabel} | ${formatMoney(totals.total)} total`,
    );

    if (cartItems.length === 0) {
      const emptyText = createElement('p', 'panel-copy', 'Your cart is empty.');
      cartSummary.replaceChildren(cartTitle, emptyText, cartMeta);
      return;
    }

    const itemsList = createElement('div', 'cart-summary__items');

    cartItems.forEach((item) => {
      const row = createElement('div', 'cart-summary__row');
      row.dataset.productId = item.product.id;

      const details = createElement('div', 'cart-summary__details');
      const name = createElement('strong', 'cart-summary__name', item.product.name);
      const price = createElement(
        'span',
        'cart-summary__line-price',
        `${formatPrice(item.product.price)} each`,
      );
      details.append(name, price);

      const controls = createElement('div', 'cart-summary__quantity');
      const quantityLabel = createElement('label', 'cart-summary__quantity-label', 'Qty');
      const quantityInput = createElement('input', 'cart-summary__quantity-input');
      quantityInput.type = 'number';
      quantityInput.min = '0';
      quantityInput.step = '1';
      quantityInput.value = String(item.quantity);
      quantityInput.setAttribute('aria-label', `Quantity for ${item.product.name}`);
      quantityInput.addEventListener('change', () => {
        cartItems = updateCartItemQuantity(cartItems, item.product.id, Number(quantityInput.value));
        confirmation = null;
        checkoutErrors = validateCheckout(checkoutValues, cartItems);
        renderCartSummary();
        renderCheckout();
      });

      const removeButton = createElement('button', 'cart-summary__remove', 'Remove');
      removeButton.type = 'button';
      removeButton.addEventListener('click', () => {
        cartItems = removeCartItem(cartItems, item.product.id);
        confirmation = null;
        checkoutErrors = validateCheckout(checkoutValues, cartItems);
        renderCartSummary();
        renderCheckout();
      });

      controls.append(quantityLabel, quantityInput, removeButton);
      row.append(details, controls);
      itemsList.append(row);
    });

    const totalsList = createElement('dl', 'cart-summary__totals');
    [
      ['Subtotal', formatMoney(totals.subtotal)],
      ['Shipping', totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping)],
      ['Tax', formatMoney(totals.tax)],
      ['Total', formatMoney(totals.total)],
    ].forEach(([label, value]) => {
      const term = createElement('dt', undefined, label);
      const description = createElement('dd', undefined, value);
      totalsList.append(term, description);
    });

    cartSummary.replaceChildren(cartTitle, itemsList, totalsList, cartMeta);
  };

  const renderCheckout = (): void => {
    const form = createElement('form', 'checkout-form');
    const cartError = checkoutErrors.cart
      ? createElement('p', 'checkout-form__error', checkoutErrors.cart)
      : null;

    const createCheckoutField = (
      id: keyof CheckoutValues,
      labelText: string,
      control: HTMLInputElement | HTMLTextAreaElement,
    ): HTMLElement => {
      const field = createElement('label', 'checkout-form__field');
      const label = createElement('span', 'checkout-form__label', labelText);
      const error = checkoutErrors[id]
        ? createElement('span', 'checkout-form__error', checkoutErrors[id])
        : null;

      control.className = 'checkout-form__input';
      control.name = id;
      control.value = checkoutValues[id];
      control.setAttribute('aria-label', labelText);
      control.addEventListener('input', () => {
        checkoutValues = {
          ...checkoutValues,
          [id]: control.value,
        };
        confirmation = null;
      });

      field.append(label, control);

      if (error) {
        field.append(error);
      }

      return field;
    };

    const nameInput = createCheckoutField('name', 'Name', createElement('input'));
    const emailInput = createCheckoutField('email', 'Email', createElement('input'));
    const addressInput = createCheckoutField(
      'shippingAddress',
      'Shipping address',
      createElement('textarea'),
    );
    const submitButton = createElement(
      'button',
      'checkout-placeholder__button checkout-placeholder__button--primary',
      cartItems.length === 0 ? 'Checkout unavailable' : 'Place order',
    );
    submitButton.type = 'submit';
    submitButton.disabled = cartItems.length === 0;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      checkoutErrors = validateCheckout(checkoutValues, cartItems);

      if (Object.keys(checkoutErrors).length > 0) {
        confirmation = null;
      } else {
        confirmation = createOrderConfirmation(checkoutValues, cartItems);
      }

      renderCheckout();
    });

    form.append(nameInput, emailInput, addressInput);

    if (cartError) {
      form.append(cartError);
    }

    form.append(submitButton);

    if (confirmation) {
      const confirmationPanel = createElement('div', 'checkout-confirmation');
      const confirmationTitle = createElement(
        'h3',
        'checkout-confirmation__title',
        'Order confirmed',
      );
      const confirmationText = createElement(
        'p',
        'checkout-confirmation__text',
        `${confirmation.orderId} for ${confirmation.customerName} | ${formatMoney(
          confirmation.total,
        )}`,
      );
      confirmationPanel.append(confirmationTitle, confirmationText);
      form.append(confirmationPanel);
    }

    checkoutPlaceholder.replaceChildren(checkoutTitle, form);
  };

  const handleAddToCart = (product: Product): void => {
    cartItems = addCartItem(cartItems, product);
    confirmation = null;
    checkoutErrors = validateCheckout(checkoutValues, cartItems);
    renderCartSummary();
    renderCheckout();
  };

  const renderActivePage = (): void => {
    activeView = getStorefrontViewFromHash(window.location.hash);

    navLinks.forEach((link) => {
      const isActive = link.dataset.view === activeView;
      link.classList.toggle('storefront-nav__link--active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (activeView === 'cart') {
      activePage.replaceChildren(cartSummary);
      return;
    }

    if (activeView === 'checkout') {
      activePage.replaceChildren(checkoutPlaceholder);
      return;
    }

    activePage.replaceChildren(catalog);
  };

  renderProducts();
  renderCartSummary();
  renderCheckout();
  renderActivePage();

  window.addEventListener('hashchange', renderActivePage);

  app.append(header, activePage);
  root.append(app);
};

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Storefront root element #app was not found.');
}

renderStorefront(root);
