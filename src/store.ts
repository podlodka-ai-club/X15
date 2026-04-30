export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartLineItem = {
  product: Product;
  quantity: number;
  lineTotalCents: number;
};

export type CartTotals = {
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

export type CartSummary = CartTotals & {
  items: CartLineItem[];
  label: string;
};

export type PriceSort = 'featured' | 'price-asc' | 'price-desc';

export type CatalogQuery = {
  category: string;
  searchText: string;
  priceSort: PriceSort;
};

export type CheckoutDetails = {
  name: string;
  email: string;
  shippingAddress: string;
};

export type CheckoutValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof CheckoutDetails, string>>;
};

export type OrderConfirmation = {
  confirmationId: string;
  totalCents: number;
  itemCount: number;
};

const SHIPPING_CENTS = 599;
const TAX_RATE = 0.0825;

export const products: Product[] = [
  {
    id: 'field-jacket',
    name: 'Field Jacket',
    description: 'Water-resistant shell with a clean city fit.',
    priceCents: 12800,
    category: 'Outerwear',
  },
  {
    id: 'canvas-tote',
    name: 'Canvas Tote',
    description: 'Structured daily carry with reinforced handles.',
    priceCents: 4200,
    category: 'Accessories',
  },
  {
    id: 'ribbed-sweater',
    name: 'Ribbed Sweater',
    description: 'Midweight knit for cool mornings and layered looks.',
    priceCents: 9600,
    category: 'Knitwear',
  },
  {
    id: 'trail-sneaker',
    name: 'Trail Sneaker',
    description: 'Low-profile sneaker with a grippy outdoor sole.',
    priceCents: 11400,
    category: 'Footwear',
  },
];

export function addCartItem(
  cartItems: CartItem[],
  productId: string,
): CartItem[] {
  const existingItem = cartItems.find((item) => item.productId === productId);

  if (!existingItem) {
    return [...cartItems, { productId, quantity: 1 }];
  }

  return cartItems.map((item) =>
    item.productId === productId
      ? { ...item, quantity: item.quantity + 1 }
      : item,
  );
}

export function removeCartItem(
  cartItems: CartItem[],
  productId: string,
): CartItem[] {
  return cartItems.filter((item) => item.productId !== productId);
}

export function updateCartItemQuantity(
  cartItems: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return removeCartItem(cartItems, productId);
  }

  const nextQuantity = Math.floor(quantity);

  return cartItems.map((item) =>
    item.productId === productId ? { ...item, quantity: nextQuantity } : item,
  );
}

export function getCartSummary(
  cartItems: CartItem[],
  availableProducts: Product[],
): CartSummary {
  const items = cartItems.flatMap<CartLineItem>((cartItem) => {
    const product = availableProducts.find(
      (availableProduct) => availableProduct.id === cartItem.productId,
    );

    if (!product || cartItem.quantity <= 0) {
      return [];
    }

    return [
      {
        product,
        quantity: cartItem.quantity,
        lineTotalCents: product.priceCents * cartItem.quantity,
      },
    ];
  });

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotalCents = items.reduce(
    (total, item) => total + item.lineTotalCents,
    0,
  );
  const shippingCents = itemCount > 0 ? SHIPPING_CENTS : 0;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    items,
    itemCount,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    label: itemCount > 0 ? 'Ready for checkout' : 'Your cart is empty',
  };
}

export function validateCheckout(
  details: CheckoutDetails,
): CheckoutValidationResult {
  const errors: CheckoutValidationResult['errors'] = {};

  if (!details.name.trim()) {
    errors.name = 'Enter your name.';
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(details.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!details.shippingAddress.trim()) {
    errors.shippingAddress = 'Enter a shipping address.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createOrderConfirmation(
  details: CheckoutDetails,
  cartItems: CartItem[],
  availableProducts: Product[],
): OrderConfirmation {
  const summary = getCartSummary(cartItems, availableProducts);
  const normalizedCart = [...cartItems]
    .sort((firstItem, secondItem) =>
      firstItem.productId.localeCompare(secondItem.productId),
    )
    .map((item) => `${item.productId}:${item.quantity}`)
    .join('|');
  const hashInput = [
    details.name.trim().toLowerCase(),
    details.email.trim().toLowerCase(),
    details.shippingAddress.trim().toLowerCase(),
    normalizedCart,
    summary.totalCents.toString(),
  ].join('::');
  let hash = 0;

  for (const character of hashInput) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return {
    confirmationId: `X15-${hash.toString(36).toUpperCase().padStart(6, '0')}`,
    totalCents: summary.totalCents,
    itemCount: summary.itemCount,
  };
}

export function getProductCategories(productList: Product[]): string[] {
  return Array.from(new Set(productList.map((product) => product.category)));
}

export function applyCatalogQuery(
  productList: Product[],
  query: CatalogQuery,
): Product[] {
  const normalizedSearch = query.searchText.trim().toLowerCase();

  const filteredProducts = productList.filter((product) => {
    const matchesCategory =
      query.category === '' || product.category === query.category;
    const matchesSearch =
      normalizedSearch === '' ||
      [product.name, product.description, product.category].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );

    return matchesCategory && matchesSearch;
  });

  return [...filteredProducts].sort((firstProduct, secondProduct) => {
    if (query.priceSort === 'price-asc') {
      return firstProduct.priceCents - secondProduct.priceCents;
    }

    if (query.priceSort === 'price-desc') {
      return secondProduct.priceCents - firstProduct.priceCents;
    }

    return 0;
  });
}

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100);
}
