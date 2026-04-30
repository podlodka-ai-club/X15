import './styles.css';
import { formatPrice, getCartSummary, products, type Product } from './store';

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

function createProductCard(product: Product): HTMLElement {
  const card = document.createElement('article');
  card.className = 'product-card';

  card.append(
    createTextElement('p', 'product-card__category', product.category),
    createTextElement('h3', 'product-card__name', product.name),
    createTextElement('p', 'product-card__description', product.description),
    createTextElement(
      'p',
      'product-card__price',
      formatPrice(product.priceCents),
    ),
  );

  return card;
}

function renderProducts(productList: Product[]): HTMLElement {
  const section = document.createElement('section');
  section.className = 'product-section';
  section.setAttribute('aria-labelledby', 'products-heading');

  const heading = createTextElement(
    'h2',
    'section-heading',
    'Featured Products',
  );
  heading.id = 'products-heading';

  const grid = document.createElement('div');
  grid.className = 'product-grid';
  productList.forEach((product) => {
    grid.append(createProductCard(product));
  });

  section.append(heading, grid);
  return section;
}

function renderCartSummary(): HTMLElement {
  const summary = getCartSummary(products);
  const aside = document.createElement('aside');
  aside.className = 'summary-panel';
  aside.setAttribute('aria-labelledby', 'cart-heading');

  const heading = createTextElement('h2', 'section-heading', 'Cart Summary');
  heading.id = 'cart-heading';

  aside.append(
    heading,
    createTextElement('p', 'summary-panel__note', summary.label),
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
  );

  return aside;
}

function renderCheckoutPlaceholder(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'checkout-panel';
  section.setAttribute('aria-labelledby', 'checkout-heading');

  const heading = createTextElement(
    'h2',
    'section-heading',
    'Checkout Placeholder',
  );
  heading.id = 'checkout-heading';

  section.append(
    heading,
    createTextElement(
      'p',
      'checkout-panel__copy',
      'Checkout flow is reserved for a future implementation.',
    ),
  );

  return section;
}

function renderApp(root: HTMLElement): void {
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
  sideColumn.append(renderCartSummary(), renderCheckoutPlaceholder());

  main.append(renderProducts(products), sideColumn);
  root.append(header, main);
}

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('X15 storefront root element was not found.');
}

renderApp(app);
