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
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

export type CheckoutDetails = {
  name: string;
  email: string;
  shippingAddress: string;
};

export type CheckoutValidationResult = {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    shippingAddress?: string;
    cart?: string;
  };
};

type CartBaseSummary = {
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

export function addCartItem(
  cartItems: CartItem[],
  productId: string,
): CartItem[] {
  const existingItem = cartItems.find((item) => item.productId === productId);

  if (!existingItem) {
    return [...cartItems, { productId, quantity: 1 }];
  }

  return cartItems.map((item) =>
    item.productId === productId
      ? { ...item, quantity: item.quantity + 1 }
      : item,
  );
}

export function removeCartItem(
  cartItems: CartItem[],
  productId: string,
): CartItem[] {
  return cartItems.filter((item) => item.productId !== productId);
}

export function updateCartItemQuantity(
  cartItems: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return removeCartItem(cartItems, productId);
  }

  return cartItems.map((item) =>
    item.productId === productId ? { ...item, quantity } : item,
  );
}

function calculateCartBaseSummary(
  cartItems: CartItem[],
  catalog: Product[],
): CartBaseSummary {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));

  return cartItems.reduce<CartBaseSummary>(
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

export function calculateCartSubtotal(
  cartItems: CartItem[],
  catalog: Product[],
): number {
  return calculateCartBaseSummary(cartItems, catalog).subtotalCents;
}

export function calculateShipping(subtotalCents: number): number {
  return subtotalCents > 0 ? 500 : 0;
}

export function calculateTax(subtotalCents: number): number {
  return Math.round(subtotalCents * 0.08);
}

export function calculateCartTotal(
  cartItems: CartItem[],
  catalog: Product[],
): CartSummary {
  const baseSummary = calculateCartBaseSummary(cartItems, catalog);
  const shippingCents = calculateShipping(baseSummary.subtotalCents);
  const taxCents = calculateTax(baseSummary.subtotalCents);

  return {
    ...baseSummary,
    shippingCents,
    taxCents,
    totalCents: baseSummary.subtotalCents + shippingCents + taxCents,
  };
}

export function calculateCartSummary(
  cartItems: CartItem[],
  catalog: Product[],
): CartSummary {
  return calculateCartTotal(cartItems, catalog);
}

function hasValidEmailShape(email: string): boolean {
  const atIndex = email.indexOf("@");
  const hasSingleAt = atIndex !== -1 && atIndex === email.lastIndexOf("@");
  const domain = hasSingleAt ? email.slice(atIndex + 1) : "";

  return (
    hasSingleAt && atIndex > 0 && domain.includes(".") && !domain.endsWith(".")
  );
}

function normalizeCheckoutDetails(details: CheckoutDetails): CheckoutDetails {
  return {
    name: details.name.trim().toLowerCase(),
    email: details.email.trim().toLowerCase(),
    shippingAddress: details.shippingAddress.trim().toLowerCase(),
  };
}

function getKnownCartLines(
  cartItems: CartItem[],
  catalog: Product[],
): CartItem[] {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));

  return cartItems
    .filter((item) => catalogById.has(item.productId) && item.quantity > 0)
    .map((item) => ({ ...item }))
    .sort((first, second) => first.productId.localeCompare(second.productId));
}

function hashOrderInput(input: string): string {
  let hash = 0;

  for (const character of input) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).toUpperCase().padStart(7, "0");
}

export function validateCheckout(
  details: CheckoutDetails,
  cartItems: CartItem[],
  catalog: Product[],
): CheckoutValidationResult {
  const normalizedDetails = normalizeCheckoutDetails(details);
  const errors: CheckoutValidationResult["errors"] = {};

  if (!normalizedDetails.name) {
    errors.name = "Enter your name.";
  }

  if (!normalizedDetails.email) {
    errors.email = "Enter your email.";
  } else if (!hasValidEmailShape(normalizedDetails.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!normalizedDetails.shippingAddress) {
    errors.shippingAddress = "Enter a shipping address.";
  }

  if (calculateCartTotal(cartItems, catalog).itemCount === 0) {
    errors.cart = "Add at least one catalog item to checkout.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function createOrderConfirmationId(
  details: CheckoutDetails,
  cartItems: CartItem[],
  catalog: Product[],
): string {
  const normalizedDetails = normalizeCheckoutDetails(details);
  const cartLines = getKnownCartLines(cartItems, catalog)
    .map((item) => `${item.productId}:${item.quantity}`)
    .join("|");
  const totalCents = calculateCartTotal(cartItems, catalog).totalCents;
  const orderInput = [
    normalizedDetails.name,
    normalizedDetails.email,
    normalizedDetails.shippingAddress,
    cartLines,
    totalCents.toString(),
  ].join("|");

  return `X15-${hashOrderInput(orderInput)}`;
}
