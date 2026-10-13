"use client";

import React from "react";
import { Product, ViewMode } from "@/types/store";
import { ProductCard } from "./ProductCard";
import { SearchX, RotateCcw } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  viewMode: ViewMode;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product, isFav: boolean) => void;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  viewMode,
  onAddToCart,
  onToggleFavorite,
  onResetFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-2xs space-y-4 my-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-stone-400 flex items-center justify-center mx-auto">
          <SearchX className="w-8 h-8 stroke-1 text-stone-400" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-lg font-bold text-stone-800">
            No products match your criteria
          </h3>
          <p className="text-sm text-stone-500 font-normal">
            Try adjusting your category, price range, or availability filter to find what you're looking for.
          </p>
        </div>
        {onResetFilters && (
          <div className="pt-2">
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#1E4D38] hover:bg-[#163C2B] transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            viewMode="list"
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  // 5 columns on wide desktop (xl:grid-cols-5) matching screenshot!
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          viewMode="grid"
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
