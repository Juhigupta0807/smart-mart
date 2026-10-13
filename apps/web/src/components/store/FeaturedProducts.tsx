"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/store";
import { MOCK_FEATURED_PRODUCTS } from "@/data/mockStoreData";
import { ProductCard } from "./ProductCard";

interface FeaturedProductsProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product, isFav: boolean) => void;
  onViewAllClick?: () => void;
}

export function FeaturedProducts({
  products = MOCK_FEATURED_PRODUCTS,
  onAddToCart,
  onToggleFavorite,
  onViewAllClick,
}: FeaturedProductsProps) {
  return (
    <section id="products" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-stone-500 block mb-2">
              Featured Products
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Popular Picks <span className="text-[#215E3F]">for You</span>
            </h2>
          </div>

          {/* View All Link */}
          <Link
            href="#products"
            onClick={onViewAllClick}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-800 hover:text-[#1E4D38] group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 5 Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
