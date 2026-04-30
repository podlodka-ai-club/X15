export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
};

export type CartSummary = {
  itemCount: number;
  subtotalCents: number;
  label: string;
};

export type PriceSort = 'featured' | 'price-asc' | 'price-desc';

export type CatalogQuery = {
  category: string;
  searchText: string;
  priceSort: PriceSort;
};

export const products: Product[] = [
  {
    id: 'field-jacket',
    name: 'Field Jacket',
    description: 'Water-resistant shell with a clean city fit.',
    priceCents: 12800,
    category: 'Outerwear',
  },
  {
    id: 'canvas-tote',
    name: 'Canvas Tote',
    description: 'Structured daily carry with reinforced handles.',
    priceCents: 4200,
    category: 'Accessories',
  },
  {
    id: 'ribbed-sweater',
    name: 'Ribbed Sweater',
    description: 'Midweight knit for cool mornings and layered looks.',
    priceCents: 9600,
    category: 'Knitwear',
  },
  {
    id: 'trail-sneaker',
    name: 'Trail Sneaker',
    description: 'Low-profile sneaker with a grippy outdoor sole.',
    priceCents: 11400,
    category: 'Footwear',
  },
];

export function getCartSummary(availableProducts: Product[]): CartSummary {
  void availableProducts;

  return {
    itemCount: 0,
    subtotalCents: 0,
    label: 'Cart summary placeholder',
  };
}

export function getProductCategories(productList: Product[]): string[] {
  return Array.from(new Set(productList.map((product) => product.category)));
}

export function applyCatalogQuery(
  productList: Product[],
  query: CatalogQuery,
): Product[] {
  const normalizedSearch = query.searchText.trim().toLowerCase();

  const filteredProducts = productList.filter((product) => {
    const matchesCategory =
      query.category === '' || product.category === query.category;
    const matchesSearch =
      normalizedSearch === '' ||
      [product.name, product.description, product.category].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );

    return matchesCategory && matchesSearch;
  });

  return [...filteredProducts].sort((firstProduct, secondProduct) => {
    if (query.priceSort === 'price-asc') {
      return firstProduct.priceCents - secondProduct.priceCents;
    }

    if (query.priceSort === 'price-desc') {
      return secondProduct.priceCents - firstProduct.priceCents;
    }

    return 0;
  });
}

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100);
}
