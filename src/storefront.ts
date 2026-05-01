export type ProductCategory = "workspace" | "drinkware" | "bags";

export type CatalogSort = "featured" | "price-asc" | "price-desc";

export type CatalogBrowseOptions = {
  category?: ProductCategory | "all";
  query?: string;
  sort?: CatalogSort;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
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
    category: "workspace",
    priceCents: 5400,
    imageAlt: "Desk organizer kit",
  },
  {
    id: "travel-tumbler",
    name: "Travel Tumbler",
    description:
      "A stainless tumbler with a leak-resistant lid for commutes and meetings.",
    category: "drinkware",
    priceCents: 3200,
    imageAlt: "Stainless travel tumbler",
  },
  {
    id: "weekend-tote",
    name: "Weekend Tote",
    description:
      "A sturdy canvas tote sized for daily errands, books, and light travel.",
    category: "bags",
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

export function getVisibleProducts(
  catalog: Product[],
  options: CatalogBrowseOptions = {},
): Product[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  const category = options.category ?? "all";
  const sort = options.sort ?? "featured";

  const filtered = catalog.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  if (sort === "price-asc") {
    return [...filtered].sort(
      (first, second) => first.priceCents - second.priceCents,
    );
  }

  if (sort === "price-desc") {
    return [...filtered].sort(
      (first, second) => second.priceCents - first.priceCents,
    );
  }

  return filtered;
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
