export type CartProduct = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

export const addCartItem = (items: CartItem[], product: CartProduct): CartItem[] => {
  const existingItem = items.find((item) => item.product.id === product.id);

  if (!existingItem) {
    return [...items, { product, quantity: 1 }];
  }

  return items.map((item) =>
    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
  );
};

export const removeCartItem = (items: CartItem[], productId: string): CartItem[] =>
  items.filter((item) => item.product.id !== productId);

export const updateCartItemQuantity = (
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] => {
  if (quantity <= 0) {
    return removeCartItem(items, productId);
  }

  const wholeQuantity = Math.floor(quantity);

  return items.map((item) =>
    item.product.id === productId ? { ...item, quantity: wholeQuantity } : item,
  );
};

export const getCartItemCount = (items: CartItem[]): number =>
  items.reduce((count, item) => count + item.quantity, 0);

export const getCartSubtotal = (items: CartItem[]): number =>
  roundCurrency(items.reduce((subtotal, item) => subtotal + item.product.price * item.quantity, 0));

export const getCartShipping = (subtotal: number): number => {
  if (subtotal <= 0 || subtotal >= 250) {
    return 0;
  }

  return 12;
};

export const getCartTax = (subtotal: number): number => roundCurrency(subtotal * 0.08);

export const getCartTotal = (items: CartItem[]): number => {
  const subtotal = getCartSubtotal(items);

  return roundCurrency(subtotal + getCartShipping(subtotal) + getCartTax(subtotal));
};

export const getCartTotals = (items: CartItem[]): CartTotals => {
  const subtotal = getCartSubtotal(items);
  const shipping = getCartShipping(subtotal);
  const tax = getCartTax(subtotal);

  return {
    itemCount: getCartItemCount(items),
    subtotal,
    shipping,
    tax,
    total: roundCurrency(subtotal + shipping + tax),
  };
};
