import type { Product } from "./main";

export const SHIPPING_RATE = 6;
export const TAX_RATE = 0.0825;

export type CartLine = {
  product: Product;
  quantity: number;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

export const addCartLine = (
  cartLines: CartLine[],
  product: Product,
): CartLine[] => {
  const existingLine = cartLines.find((line) => line.product.id === product.id);

  if (!existingLine) {
    return [...cartLines, { product, quantity: 1 }];
  }

  return cartLines.map((line) =>
    line.product.id === product.id
      ? { ...line, quantity: line.quantity + 1 }
      : line,
  );
};

export const removeCartLine = (
  cartLines: CartLine[],
  productId: string,
): CartLine[] => cartLines.filter((line) => line.product.id !== productId);

export const updateCartLineQuantity = (
  cartLines: CartLine[],
  productId: string,
  quantity: number,
): CartLine[] => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return removeCartLine(cartLines, productId);
  }

  return cartLines.map((line) =>
    line.product.id === productId ? { ...line, quantity } : line,
  );
};

export const calculateSubtotal = (cartLines: CartLine[]): number =>
  roundCurrency(
    cartLines.reduce(
      (subtotal, line) => subtotal + line.product.price * line.quantity,
      0,
    ),
  );

export const calculateShipping = (cartLines: CartLine[]): number =>
  cartLines.length === 0 ? 0 : SHIPPING_RATE;

export const calculateTax = (subtotal: number): number =>
  roundCurrency(subtotal * TAX_RATE);

export const calculateCartTotals = (cartLines: CartLine[]): CartTotals => {
  const itemCount = cartLines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = calculateSubtotal(cartLines);
  const shipping = calculateShipping(cartLines);
  const tax = calculateTax(subtotal);

  return {
    itemCount,
    subtotal,
    shipping,
    tax,
    total: roundCurrency(subtotal + shipping + tax),
  };
};
