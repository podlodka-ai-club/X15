export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

export const products: Product[] = [
  {
    id: "desk-lamp",
    name: "Focus Desk Lamp",
    category: "Workspace",
    price: 48,
    description: "A compact lamp with warm dimming for evening project sessions.",
  },
  {
    id: "notebook-set",
    name: "Planning Notebook Set",
    category: "Stationery",
    price: 24,
    description: "Three lay-flat notebooks for sketches, checklists, and launch notes.",
  },
  {
    id: "travel-mug",
    name: "Insulated Travel Mug",
    category: "Daily Gear",
    price: 32,
    description: "Keeps coffee steady through commutes, standups, and deep work blocks.",
  },
  {
    id: "cable-kit",
    name: "Cable Organizer Kit",
    category: "Accessories",
    price: 18,
    description: "Reusable ties and labels for keeping a small desk setup tidy.",
  },
];
