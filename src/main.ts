import './styles.css';
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
  type CheckoutValidationResult,
  type OrderConfirmation,
  type Product,
} from './store';

function createTextElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createButton(className: string, text: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.textContent = text;
  return button;
}

function createProductCard(
  product: Product,
  onAddProduct: (productId: string) => void,
): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card';

  const addButton = createButton('product-card__button', 'Add to cart');
  addButton.addEventListener('click', () => {
    onAddProduct(product.id);
  });

  card.append(
    createTextElement('p', 'product-card__category', product.category),
    createTextElement('h3', 'product-card__name', product.name),
    createTextElement('p', 'product-card__description', product.description),
    createTextElement(
      'p',
      'product-card__price',
      formatPrice(product.priceCents),
    ),
    addButton,
  );

  return card;
}

function createSelectOption(value: string, text: string): HTMLOptionElement {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  return option;
}

function renderProducts(
  productList: Product[],
  onAddProduct: (productId: string) => void,
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'product-section';
  section.setAttribute('aria-labelledby', 'products-heading');
  const query: CatalogQuery = {
    category: '',
    searchText: '',
    priceSort: 'featured',
  };

  const heading = createTextElement(
    'h2',
    'section-heading',
    'Featured Products',
  );
  heading.id = 'products-heading';

  const controls = document.createElement('div');
  controls.className = 'catalog-controls';

  const searchLabel = createTextElement(
    'label',
    'catalog-controls__label',
    'Search',
  );
  const searchInput = document.createElement('input');
  searchInput.className = 'catalog-controls__field';
  searchInput.id = 'catalog-search';
  searchInput.type = 'search';
  searchInput.placeholder = 'Search products';
  searchLabel.htmlFor = searchInput.id;

  const categoryLabel = createTextElement(
    'label',
    'catalog-controls__label',
    'Category',
  );
  const categorySelect = document.createElement('select');
  categorySelect.className = 'catalog-controls__field';
  categorySelect.id = 'catalog-category';
  categorySelect.append(createSelectOption('', 'All categories'));
  getProductCategories(productList).forEach((category) => {
    categorySelect.append(createSelectOption(category, category));
  });
  categoryLabel.htmlFor = categorySelect.id;

  const sortLabel = createTextElement(
    'label',
    'catalog-controls__label',
    'Sort',
  );
  const sortSelect = document.createElement('select');
  sortSelect.className = 'catalog-controls__field';
  sortSelect.id = 'catalog-sort';
  sortSelect.append(
    createSelectOption('featured', 'Featured'),
    createSelectOption('price-asc', 'Price: low to high'),
    createSelectOption('price-desc', 'Price: high to low'),
  );
  sortLabel.htmlFor = sortSelect.id;

  controls.append(
    searchLabel,
    searchInput,
    categoryLabel,
    categorySelect,
    sortLabel,
    sortSelect,
  );

  const resultCount = createTextElement('p', 'catalog-results', '');

  const grid = document.createElement('div');
  grid.className = 'product-grid';

  function updateProductGrid(): void {
    const matchingProducts = applyCatalogQuery(productList, query);
    grid.replaceChildren();
    resultCount.textContent = `${matchingProducts.length} product${
      matchingProducts.length === 1 ? '' : 's'
    } found`;

    if (matchingProducts.length === 0) {
      grid.append(
        createTextElement(
          'p',
          'catalog-empty',
          'No products match your filters.',
        ),
      );
      return;
    }

    matchingProducts.forEach((product) => {
      grid.append(createProductCard(product, onAddProduct));
    });
  }

  searchInput.addEventListener('input', () => {
    query.searchText = searchInput.value;
    updateProductGrid();
  });

  categorySelect.addEventListener('change', () => {
    query.category = categorySelect.value;
    updateProductGrid();
  });

  sortSelect.addEventListener('change', () => {
    query.priceSort = sortSelect.value as CatalogQuery['priceSort'];
    updateProductGrid();
  });

  updateProductGrid();

  section.append(heading, controls, resultCount, grid);
  return section;
}

function renderCartSummary(
  cartItems: CartItem[],
  onUpdateQuantity: (productId: string, quantity: number) => void,
  onRemoveProduct: (productId: string) => void,
): HTMLElement {
  const summary = getCartSummary(cartItems, products);
  const aside = document.createElement('aside');
  aside.className = 'summary-panel';
  aside.setAttribute('aria-labelledby', 'cart-heading');

  const heading = createTextElement('h2', 'section-heading', 'Cart Summary');
  heading.id = 'cart-heading';

  aside.append(
    heading,
    createTextElement('p', 'summary-panel__note', summary.label),
  );

  if (summary.items.length > 0) {
    const itemList = document.createElement('div');
    itemList.className = 'summary-panel__items';

    summary.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'summary-panel__item';

      const details = document.createElement('div');
      details.className = 'summary-panel__item-details';
      details.append(
        createTextElement('p', 'summary-panel__item-name', item.product.name),
        createTextElement(
          'p',
          'summary-panel__item-price',
          formatPrice(item.lineTotalCents),
        ),
      );

      const controls = document.createElement('div');
      controls.className = 'summary-panel__controls';

      const decreaseButton = createButton('summary-panel__button', '-');
      decreaseButton.setAttribute(
        'aria-label',
        `Decrease ${item.product.name}`,
      );
      decreaseButton.addEventListener('click', () => {
        onUpdateQuantity(item.product.id, item.quantity - 1);
      });

      const quantity = createTextElement(
        'span',
        'summary-panel__quantity',
        item.quantity.toString(),
      );

      const increaseButton = createButton('summary-panel__button', '+');
      increaseButton.setAttribute(
        'aria-label',
        `Increase ${item.product.name}`,
      );
      increaseButton.addEventListener('click', () => {
        onUpdateQuantity(item.product.id, item.quantity + 1);
      });

      const removeButton = createButton('summary-panel__remove', 'Remove');
      removeButton.addEventListener('click', () => {
        onRemoveProduct(item.product.id);
      });

      controls.append(decreaseButton, quantity, increaseButton, removeButton);
      row.append(details, controls);
      itemList.append(row);
    });

    aside.append(itemList);
  }

  aside.append(
    createTextElement(
      'p',
      'summary-panel__line',
      `Items selected: ${summary.itemCount}`,
    ),
    createTextElement(
      'p',
      'summary-panel__line',
      `Subtotal: ${formatPrice(summary.subtotalCents)}`,
    ),
    createTextElement(
      'p',
      'summary-panel__line',
      `Shipping: ${formatPrice(summary.shippingCents)}`,
    ),
    createTextElement(
      'p',
      'summary-panel__line',
      `Tax: ${formatPrice(summary.taxCents)}`,
    ),
    createTextElement(
      'p',
      'summary-panel__line summary-panel__total',
      `Total: ${formatPrice(summary.totalCents)}`,
    ),
  );

  return aside;
}

function renderCheckout(
  cartItems: CartItem[],
  details: CheckoutDetails,
  validationResult: CheckoutValidationResult,
  orderConfirmation: OrderConfirmation | null,
  onDetailsChange: (details: CheckoutDetails) => void,
  onSubmit: () => void,
): HTMLElement {
  const summary = getCartSummary(cartItems, products);
  const section = document.createElement('section');
  section.className = 'checkout-panel';
  section.setAttribute('aria-labelledby', 'checkout-heading');

  const heading = createTextElement('h2', 'section-heading', 'Checkout');
  heading.id = 'checkout-heading';

  const form = document.createElement('form');
  form.className = 'checkout-panel__form';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit();
  });

  const nameInput = createCheckoutInput(
    'name',
    'Name',
    details.name,
    validationResult.errors.name,
    (value) => {
      onDetailsChange({ ...details, name: value });
    },
  );
  const emailInput = createCheckoutInput(
    'email',
    'Email',
    details.email,
    validationResult.errors.email,
    (value) => {
      onDetailsChange({ ...details, email: value });
    },
  );
  const addressInput = createCheckoutInput(
    'shippingAddress',
    'Shipping address',
    details.shippingAddress,
    validationResult.errors.shippingAddress,
    (value) => {
      onDetailsChange({ ...details, shippingAddress: value });
    },
  );
  const submitButton = document.createElement('button');
  submitButton.className = 'checkout-panel__submit';
  submitButton.disabled = summary.itemCount === 0;
  submitButton.type = 'submit';
  submitButton.textContent =
    summary.itemCount === 0 ? 'Add items to checkout' : 'Place order';

  form.append(nameInput, emailInput, addressInput, submitButton);
  section.append(heading, form);

  if (orderConfirmation) {
    section.append(
      createTextElement(
        'p',
        'checkout-panel__confirmation',
        `Order ${orderConfirmation.confirmationId} confirmed for ${formatPrice(
          orderConfirmation.totalCents,
        )}.`,
      ),
    );
  }

  return section;
}

function createCheckoutInput(
  name: keyof CheckoutDetails,
  label: string,
  value: string,
  error: string | undefined,
  onInput: (value: string) => void,
): HTMLElement {
  const field = document.createElement('label');
  field.className = 'checkout-panel__field';

  const labelText = createTextElement('span', 'checkout-panel__label', label);
  const input = document.createElement('input');
  input.className = 'checkout-panel__input';
  input.name = name;
  input.value = value;
  input.autocomplete =
    name === 'email' ? 'email' : name === 'name' ? 'name' : 'street-address';
  input.type = name === 'email' ? 'email' : 'text';
  input.addEventListener('input', () => {
    onInput(input.value);
  });

  field.append(labelText, input);

  if (error) {
    field.append(createTextElement('span', 'checkout-panel__error', error));
  }

  return field;
}

function renderApp(root: HTMLElement): void {
  let cartItems: CartItem[] = [];
  let checkoutDetails: CheckoutDetails = {
    name: '',
    email: '',
    shippingAddress: '',
  };
  let checkoutValidation: CheckoutValidationResult = {
    valid: true,
    errors: {},
  };
  let orderConfirmation: OrderConfirmation | null = null;

  const render = (): void => {
    root.textContent = '';

    const header = document.createElement('header');
    header.className = 'site-header';
    header.append(
      createTextElement('p', 'site-header__eyebrow', 'Podlodka AI Club'),
      createTextElement('h1', 'site-header__title', 'X15 Storefront'),
      createTextElement(
        'p',
        'site-header__copy',
        'A minimal ecommerce shell for product browsing.',
      ),
    );

    const main = document.createElement('main');
    main.className = 'storefront-layout';

    const sideColumn = document.createElement('div');
    sideColumn.className = 'storefront-layout__side';
    sideColumn.append(
      renderCartSummary(
        cartItems,
        (productId, quantity) => {
          cartItems = updateCartItemQuantity(cartItems, productId, quantity);
          orderConfirmation = null;
          render();
        },
        (productId) => {
          cartItems = removeCartItem(cartItems, productId);
          orderConfirmation = null;
          render();
        },
      ),
      renderCheckout(
        cartItems,
        checkoutDetails,
        checkoutValidation,
        orderConfirmation,
        (updatedDetails) => {
          checkoutDetails = updatedDetails;
          checkoutValidation = { valid: true, errors: {} };
          orderConfirmation = null;
          render();
        },
        () => {
          checkoutValidation = validateCheckout(checkoutDetails);
          orderConfirmation = checkoutValidation.valid
            ? createOrderConfirmation(checkoutDetails, cartItems, products)
            : null;
          render();
        },
      ),
    );

    main.append(
      renderProducts(products, (productId) => {
        cartItems = addCartItem(cartItems, productId);
        orderConfirmation = null;
        render();
      }),
      sideColumn,
    );
    root.append(header, main);
  };

  render();
}

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('X15 storefront root element was not found.');
}

renderApp(app);
