import type { Product } from "./products";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Cart = CartItem[];

export const STANDARD_SHIPPING_CENTS = 799;
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000;
export const TAX_RATE = 0.0825;

export function addToCart(cart: Cart, product: Product): Cart {
  const existingItem = cart.find((item) => item.product.id === product.id);

  if (!existingItem) {
    return [...cart, { product, quantity: 1 }];
  }

  return cart.map((item) =>
    item.product.id === product.id
      ? { ...item, quantity: item.quantity + 1 }
      : item,
  );
}

export function removeFromCart(cart: Cart, productId: string): Cart {
  return cart.filter((item) => item.product.id !== productId);
}

export function updateCartQuantity(
  cart: Cart,
  productId: string,
  quantity: number,
): Cart {
  if (quantity <= 0 || !Number.isFinite(quantity)) {
    return removeFromCart(cart, productId);
  }

  return cart.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item,
  );
}

export function getCartItemCount(cart: Cart): number {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

export function getCartSubtotalCents(cart: Cart): number {
  return cart.reduce(
    (subtotal, item) => subtotal + item.product.priceCents * item.quantity,
    0,
  );
}

export function getShippingCents(subtotalCents: number): number {
  if (subtotalCents <= 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 0;
  }

  return STANDARD_SHIPPING_CENTS;
}

export function getTaxCents(subtotalCents: number): number {
  return Math.round(subtotalCents * TAX_RATE);
}

export function getCartTotalCents(cart: Cart): number {
  const subtotalCents = getCartSubtotalCents(cart);

  return (
    subtotalCents + getShippingCents(subtotalCents) + getTaxCents(subtotalCents)
  );
}
