import type { CartLine } from "./cart";

export type CheckoutDetails = {
  name: string;
  email: string;
  shippingAddress: string;
};

export type CheckoutValidationResult =
  | { valid: true; details: CheckoutDetails }
  | {
      valid: false;
      errors: Partial<Record<keyof CheckoutDetails, string>>;
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
  const errors: Partial<Record<keyof CheckoutDetails, string>> = {};

  if (!normalizedDetails.name) {
    errors.name = "Enter your name.";
  }

  if (!normalizedDetails.email) {
    errors.email = "Enter your email.";
  } else if (!emailPattern.test(normalizedDetails.email)) {
    errors.email = "Enter a valid email.";
  }

  if (!normalizedDetails.shippingAddress) {
    errors.shippingAddress = "Enter your shipping address.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, details: normalizedDetails };
};

const createStableHash = (value: string): string => {
  let hash = 2_166_136_261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0");
};

export const createOrderConfirmationId = (
  details: CheckoutDetails,
  cartLines: CartLine[],
): string => {
  const normalizedDetails = normalizeDetails(details);
  const normalizedCart = [...cartLines]
    .sort((firstLine, secondLine) =>
      firstLine.product.id.localeCompare(secondLine.product.id),
    )
    .map((line) => `${line.product.id}:${line.quantity}`)
    .join("|");
  const source = [
    normalizedDetails.name.toLowerCase(),
    normalizedDetails.email,
    normalizedDetails.shippingAddress.toLowerCase(),
    normalizedCart,
  ].join("|");

  return `X15-${createStableHash(source)}`;
};
