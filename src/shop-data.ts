export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export const products: Product[] = [
  {
    id: "desk-lamp",
    name: "Desk Lamp",
    description: "A compact lamp for focused evening work.",
    price: 48,
    category: "Workspace",
  },
  {
    id: "canvas-tote",
    name: "Canvas Tote",
    description: "A sturdy everyday bag with a simple storefront-ready shape.",
    price: 32,
    category: "Accessories",
  },
  {
    id: "ceramic-mug",
    name: "Ceramic Mug",
    description: "A warm placeholder product for future catalog details.",
    price: 18,
    category: "Home",
  },
];

export const cartSummary = {
  itemCount: 0,
  subtotal: 0,
};

export const checkoutPlaceholder =
  "Checkout details will be added when cart and order flows are implemented.";
