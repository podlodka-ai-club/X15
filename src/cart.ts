export type CartItem = {
  name: string;
  price: number;
  quantity: number;
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

const SHIPPING_RATE = 7;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.08;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const normalizeCheckoutDetails = (
  details: CheckoutDetails,
): CheckoutDetails => ({
  name: details.name.trim(),
  email: details.email.trim().toLowerCase(),
  shippingAddress: details.shippingAddress.trim(),
});

export const addToCart = (
  cart: CartItem[],
  item: Pick<CartItem, "name" | "price">,
): CartItem[] => {
  const existingItem = cart.find((cartItem) => cartItem.name === item.name);

  if (!existingItem) {
    return [...cart, { name: item.name, price: item.price, quantity: 1 }];
  }

  return cart.map((cartItem) =>
    cartItem.name === item.name
      ? { ...cartItem, quantity: cartItem.quantity + 1 }
      : cartItem,
  );
};

export const removeFromCart = (cart: CartItem[], name: string): CartItem[] =>
  cart.filter((cartItem) => cartItem.name !== name);

export const updateCartQuantity = (
  cart: CartItem[],
  name: string,
  quantity: number,
): CartItem[] => {
  const nextQuantity = Math.floor(quantity);

  if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
    return removeFromCart(cart, name);
  }

  return cart.map((cartItem) =>
    cartItem.name === name ? { ...cartItem, quantity: nextQuantity } : cartItem,
  );
};

export const getCartSubtotal = (cart: CartItem[]): number =>
  roundMoney(
    cart.reduce(
      (subtotal, cartItem) => subtotal + cartItem.price * cartItem.quantity,
      0,
    ),
  );

export const getShippingTotal = (cart: CartItem[]): number => {
  const subtotal = getCartSubtotal(cart);

  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return SHIPPING_RATE;
};

export const getTaxTotal = (cart: CartItem[]): number =>
  roundMoney(getCartSubtotal(cart) * TAX_RATE);

export const getCartTotal = (cart: CartItem[]): number =>
  roundMoney(
    getCartSubtotal(cart) + getShippingTotal(cart) + getTaxTotal(cart),
  );

export const validateCheckoutDetails = (
  details: CheckoutDetails,
): CheckoutValidationResult => {
  const normalizedDetails = normalizeCheckoutDetails(details);
  const errors: Partial<Record<keyof CheckoutDetails, string>> = {};

  if (!normalizedDetails.name) {
    errors.name = "Enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedDetails.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!normalizedDetails.shippingAddress) {
    errors.shippingAddress = "Enter a shipping address.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const createOrderConfirmationId = (
  details: CheckoutDetails,
  cart: CartItem[],
): string => {
  const normalizedDetails = normalizeCheckoutDetails(details);
  const payload = [
    normalizedDetails.name,
    normalizedDetails.email,
    normalizedDetails.shippingAddress,
    ...[...cart]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((cartItem) =>
        [cartItem.name, cartItem.price, cartItem.quantity].join(":"),
      ),
  ].join("|");

  let hash = 0;

  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash * 31 + payload.charCodeAt(index)) >>> 0;
  }

  return `X15-${hash.toString(36).toUpperCase().padStart(6, "0")}`;
};
