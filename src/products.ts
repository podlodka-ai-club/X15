export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
};

export const products: Product[] = [
  {
    id: "studio-backpack",
    name: "Studio Backpack",
    description: "A compact everyday pack with organized space for work gear.",
    priceCents: 9800,
  },
  {
    id: "linen-overshirt",
    name: "Linen Overshirt",
    description: "A breathable layer for warm days and cool evenings.",
    priceCents: 7450,
  },
  {
    id: "ceramic-mug-set",
    name: "Ceramic Mug Set",
    description: "Two stackable mugs with a soft matte glaze.",
    priceCents: 3200,
  },
  {
    id: "desk-planner",
    name: "Desk Planner",
    description: "A weekly planner with durable paper and a lay-flat spine.",
    priceCents: 1850,
  },
];
