export type CartLine = {
  productId: string;
  quantity: number;
};

export type CartSummary = {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

type PricedProduct = {
  id: string;
  price: number;
};

const roundToCents = (value: number): number => Math.round(value * 100) / 100;

export const addCartItem = (
  cart: CartLine[],
  productId: string,
): CartLine[] => {
  const existingLine = cart.find((line) => line.productId === productId);

  if (!existingLine) {
    return [...cart, { productId, quantity: 1 }];
  }

  return cart.map((line) =>
    line.productId === productId
      ? { ...line, quantity: line.quantity + 1 }
      : line,
  );
};

export const removeCartItem = (
  cart: CartLine[],
  productId: string,
): CartLine[] => cart.filter((line) => line.productId !== productId);

export const updateCartItemQuantity = (
  cart: CartLine[],
  productId: string,
  quantity: number,
): CartLine[] => {
  const normalizedQuantity = Math.floor(quantity);

  if (normalizedQuantity <= 0) {
    return removeCartItem(cart, productId);
  }

  const existingLine = cart.find((line) => line.productId === productId);

  if (!existingLine) {
    return [...cart, { productId, quantity: normalizedQuantity }];
  }

  return cart.map((line) =>
    line.productId === productId
      ? { ...line, quantity: normalizedQuantity }
      : line,
  );
};

export const calculateSubtotal = (
  cart: CartLine[],
  catalog: PricedProduct[],
): number =>
  roundToCents(
    cart.reduce((subtotal, line) => {
      const product = catalog.find((item) => item.id === line.productId);

      if (!product) {
        return subtotal;
      }

      return subtotal + product.price * line.quantity;
    }, 0),
  );

export const calculateShipping = (subtotal: number): number => {
  if (subtotal === 0 || subtotal >= 100) {
    return 0;
  }

  return 7.5;
};

export const calculateTax = (subtotal: number): number =>
  roundToCents(subtotal * 0.08);

export const calculateOrderTotal = (
  subtotal: number,
  shipping: number,
  tax: number,
): number => roundToCents(subtotal + shipping + tax);

export const calculateCartSummary = (
  cart: CartLine[],
  catalog: PricedProduct[],
): CartSummary => {
  const subtotal = calculateSubtotal(cart, catalog);
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);

  return {
    itemCount: cart.reduce((count, line) => count + line.quantity, 0),
    subtotal,
    shipping,
    tax,
    total: calculateOrderTotal(subtotal, shipping, tax),
  };
};
