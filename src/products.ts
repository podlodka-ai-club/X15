export type ProductCategory = "Bags" | "Apparel" | "Home" | "Office";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  priceCents: number;
};

export const products: Product[] = [
  {
    id: "studio-backpack",
    name: "Studio Backpack",
    description: "A compact everyday pack with organized space for work gear.",
    category: "Bags",
    priceCents: 9800,
  },
  {
    id: "linen-overshirt",
    name: "Linen Overshirt",
    description: "A breathable layer for warm days and cool evenings.",
    category: "Apparel",
    priceCents: 7450,
  },
  {
    id: "ceramic-mug-set",
    name: "Ceramic Mug Set",
    description: "Two stackable mugs with a soft matte glaze.",
    category: "Home",
    priceCents: 3200,
  },
  {
    id: "desk-planner",
    name: "Desk Planner",
    description: "A weekly planner with durable paper and a lay-flat spine.",
    category: "Office",
    priceCents: 1850,
  },
];
