export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageLabel: string;
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
    id: "daily-tote",
    name: "Daily Market Tote",
    description:
      "A structured canvas tote sized for grocery runs, errands, and laptops.",
    priceCents: 4800,
    imageLabel: "Canvas tote",
  },
  {
    id: "ceramic-mug",
    name: "Stackable Ceramic Mug",
    description:
      "A warm stoneware mug with a compact shape for small kitchens.",
    priceCents: 2200,
    imageLabel: "Ceramic mug",
  },
  {
    id: "linen-apron",
    name: "Washed Linen Apron",
    description:
      "A durable kitchen apron with deep pockets and adjustable ties.",
    priceCents: 6400,
    imageLabel: "Linen apron",
  },
  {
    id: "counter-journal",
    name: "Counter Notes Journal",
    description:
      "A lay-flat notebook for recipes, shopping lists, and daily plans.",
    priceCents: 1800,
    imageLabel: "Paper journal",
  },
];

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function calculateCartSummary(
  items: CartItem[],
  catalog: Product[],
): CartSummary {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));

  return items.reduce<CartSummary>(
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
