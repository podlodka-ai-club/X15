import type { CartLine } from "./cart";

export type CheckoutDetails = {
  name: string;
  email: string;
  shippingAddress: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutDetails, string>>;

export type CheckoutValidationResult = {
  isValid: boolean;
  errors: CheckoutErrors;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeDetails = (details: CheckoutDetails): CheckoutDetails => ({
  name: details.name.trim(),
  email: details.email.trim().toLowerCase(),
  shippingAddress: details.shippingAddress.trim(),
});

export const validateCheckout = (
  details: CheckoutDetails,
): CheckoutValidationResult => {
  const normalizedDetails = normalizeDetails(details);
  const errors: CheckoutErrors = {};

  if (!normalizedDetails.name) {
    errors.name = "Name is required.";
  }

  if (!normalizedDetails.email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(normalizedDetails.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!normalizedDetails.shippingAddress) {
    errors.shippingAddress = "Shipping address is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const createOrderConfirmationId = (
  cart: CartLine[],
  details: CheckoutDetails,
): string => {
  const normalizedDetails = normalizeDetails(details);
  const normalizedCart = [...cart]
    .sort((left, right) => left.productId.localeCompare(right.productId))
    .map((line) => `${line.productId}:${line.quantity}`)
    .join("|");
  const source = [
    normalizedDetails.name,
    normalizedDetails.email,
    normalizedDetails.shippingAddress,
    normalizedCart,
  ].join("::");
  const hash = [...source].reduce(
    (accumulator, character) =>
      (accumulator * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );

  return `X15-${hash.toString(36).toUpperCase().padStart(7, "0")}`;
};
