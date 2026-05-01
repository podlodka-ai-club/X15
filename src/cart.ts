import type { Product } from "./products";

export type CartSummary = {
  itemCount: number;
  subtotal: number;
  formattedSubtotal: string;
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createCartSummary(items: Product[]): CartSummary {
  const subtotal = items.reduce((total, item) => total + item.price, 0);

  return {
    itemCount: items.length,
    subtotal,
    formattedSubtotal: formatCurrency(subtotal),
  };
}
