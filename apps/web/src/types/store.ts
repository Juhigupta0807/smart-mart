export interface Category {
  categoryId: number;
  categoryName: string;
  slug: string;
  imageUrl: string;
  itemCount?: number;
}

export interface Product {
  productId: number;
  productName: string;
  description?: string | null;
  price: number;
  packageSize?: string;
  imageUrl: string;
  categoryId: number;
  categoryName?: string;
  currentStock?: number;
  isActive: boolean;
  isPopular?: boolean;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: "range" | "fresh" | "inventory" | "delivery";
  accentColor: "mint" | "peach";
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: "prices" | "payments" | "returns" | "support";
  accentColor: "peach" | "mint";
}

export interface HeroStat {
  label: string;
  value: string;
}

export type SortOption =
  | "relevance"
  | "price-low-high"
  | "price-high-low"
  | "name-asc"
  | "newest";

export type ViewMode = "grid" | "list";

export interface FilterState {
  category: string;
  maxPrice: number;
  availability: "all" | "in-stock" | "out-of-stock";
  sortBy: SortOption;
  searchQuery: string;
}
