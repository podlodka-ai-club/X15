import { getCartTotalCents, type Cart } from "./cart";

export type CheckoutDetails = {
  name: string;
  email: string;
  shippingAddress: string;
};

export type CheckoutValidationError = {
  field: keyof CheckoutDetails;
  message: string;
};

export type CheckoutValidationResult =
  | {
      isValid: true;
      details: CheckoutDetails;
      errors: [];
    }
  | {
      isValid: false;
      details: CheckoutDetails;
      errors: CheckoutValidationError[];
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCheckoutDetails(details: CheckoutDetails): CheckoutDetails {
  return {
    name: details.name.trim(),
    email: details.email.trim().toLowerCase(),
    shippingAddress: details.shippingAddress.trim(),
  };
}

function hashString(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

export function validateCheckoutDetails(
  details: CheckoutDetails,
): CheckoutValidationResult {
  const normalizedDetails = normalizeCheckoutDetails(details);
  const errors: CheckoutValidationError[] = [];

  if (!normalizedDetails.name) {
    errors.push({ field: "name", message: "Name is required." });
  }

  if (!normalizedDetails.email) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!emailPattern.test(normalizedDetails.email)) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  if (!normalizedDetails.shippingAddress) {
    errors.push({
      field: "shippingAddress",
      message: "Shipping address is required.",
    });
  }

  if (errors.length > 0) {
    return { isValid: false, details: normalizedDetails, errors };
  }

  return { isValid: true, details: normalizedDetails, errors: [] };
}

export function createConfirmationId(
  details: CheckoutDetails,
  cart: Cart,
): string {
  const normalizedDetails = normalizeCheckoutDetails(details);
  const cartFragments = cart
    .map(
      (item) =>
        `${item.product.id}:${item.quantity}:${item.product.priceCents}`,
    )
    .sort()
    .join("|");
  const confirmationSeed = [
    normalizedDetails.name,
    normalizedDetails.email,
    normalizedDetails.shippingAddress,
    cartFragments,
    getCartTotalCents(cart).toString(),
  ].join("::");

  return `ORDER-${hashString(confirmationSeed)}`;
}
