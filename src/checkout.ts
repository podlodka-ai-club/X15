import { getCartItemCount, getCartTotal, type CartItem } from './cart';

export type CheckoutValues = {
  name: string;
  email: string;
  shippingAddress: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutValues | 'cart', string>>;

export type CheckoutConfirmation = {
  orderId: string;
  customerName: string;
  itemCount: number;
  total: number;
};

const normalizeValue = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();

const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);

const getChecksum = (value: string): string => {
  const checksum = [...value].reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  );

  return String(checksum % 10000).padStart(4, '0');
};

const getOrderChecksumInput = (values: CheckoutValues, items: CartItem[]): string => {
  const customerInput = [
    normalizeValue(values.name),
    normalizeValue(values.email),
    normalizeValue(values.shippingAddress),
  ].join('|');
  const cartInput = [...items]
    .sort((firstItem, secondItem) => firstItem.product.id.localeCompare(secondItem.product.id))
    .map((item) => `${item.product.id}:${item.quantity}`)
    .join('|');

  return `${customerInput}|${cartInput}`;
};

export const validateCheckout = (values: CheckoutValues, items: CartItem[]): CheckoutErrors => {
  const errors: CheckoutErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const shippingAddress = values.shippingAddress.trim();

  if (!name) {
    errors.name = 'Enter your name.';
  }

  if (!email) {
    errors.email = 'Enter your email.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email.';
  }

  if (!shippingAddress) {
    errors.shippingAddress = 'Enter a shipping address.';
  }

  if (getCartItemCount(items) === 0) {
    errors.cart = 'Add at least one product before checkout.';
  }

  return errors;
};

export const createOrderConfirmation = (
  values: CheckoutValues,
  items: CartItem[],
): CheckoutConfirmation => {
  const errors = validateCheckout(values, items);

  if (Object.keys(errors).length > 0) {
    throw new Error('Checkout values are invalid.');
  }

  const itemCount = getCartItemCount(items);
  const total = getCartTotal(items);
  const totalCents = Math.round(total * 100);
  const checksum = getChecksum(getOrderChecksumInput(values, items));

  return {
    orderId: `X15-${itemCount}-${totalCents}-${checksum}`,
    customerName: values.name.trim(),
    itemCount,
    total,
  };
};
