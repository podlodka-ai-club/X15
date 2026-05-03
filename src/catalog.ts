import type { Product } from "./products";

export type CatalogSort = "featured" | "price-asc" | "price-desc";

export type CatalogFilters = {
  category: "all" | Product["category"];
  query: string;
  sort: CatalogSort;
};

export const defaultCatalogFilters: CatalogFilters = {
  category: "all",
  query: "",
  sort: "featured",
};

export function getCategories(productList: Product[]): Product["category"][] {
  return Array.from(new Set(productList.map((product) => product.category)));
}

export function getCatalogProducts(
  productList: Product[],
  filters: CatalogFilters,
): Product[] {
  const query = filters.query.trim().toLowerCase();

  const results = productList.filter((product) => {
    const matchesCategory =
      filters.category === "all" || product.category === filters.category;
    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  if (filters.sort === "featured") {
    return results;
  }

  return [...results].sort((firstProduct, secondProduct) => {
    const priceDifference = firstProduct.priceCents - secondProduct.priceCents;

    return filters.sort === "price-asc" ? priceDifference : -priceDifference;
  });
}
