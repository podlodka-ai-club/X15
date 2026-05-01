export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageAlt: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartSummary = {
  itemCount: number;
  subtotalCents: number;
};

export const products: Product[] = [
  {
    id: "desk-starter-kit",
    name: "Desk Starter Kit",
    description:
      "A focused bundle with a notebook, cable clips, and a compact desk tray.",
    priceCents: 5400,
    imageAlt: "Desk organizer kit",
  },
  {
    id: "travel-tumbler",
    name: "Travel Tumbler",
    description:
      "A stainless tumbler with a leak-resistant lid for commutes and meetings.",
    priceCents: 3200,
    imageAlt: "Stainless travel tumbler",
  },
  {
    id: "weekend-tote",
    name: "Weekend Tote",
    description:
      "A sturdy canvas tote sized for daily errands, books, and light travel.",
    priceCents: 6800,
    imageAlt: "Canvas weekend tote",
  },
];

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function calculateCartSummary(
  cartItems: CartItem[],
  catalog: Product[],
): CartSummary {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));

  return cartItems.reduce<CartSummary>(
    (summary, item) => {
      const product = catalogById.get(item.productId);

      if (!product) {
        return summary;
      }

      return {
        itemCount: summary.itemCount + item.quantity,
        subtotalCents:
          summary.subtotalCents + product.priceCents * item.quantity,
      };
    },
    {
      itemCount: 0,
      subtotalCents: 0,
    },
  );
}
