"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Plus, Check, ShoppingBag } from "lucide-react";
import { Product } from "@/types/store";
import { formatINR } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product, isFav: boolean) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (onToggleFavorite) {
      onToggleFavorite(product, nextState);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Format currency cleanly like ₹499 (without .00 if whole)
  const formattedPrice = formatINR(product.price).replace(/\.00$/, "");

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-card hover:border-stone-300 transition-all duration-300">
      
      {/* Top Header: Category / Package tag & Favorite Heart */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
          {product.categoryName || "Grocery"}
        </span>
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className={`p-1.5 rounded-full transition-colors ${
            isFavorite
              ? "text-rose-500 bg-rose-50"
              : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isFavorite ? "fill-rose-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative w-full h-36 sm:h-40 my-2 rounded-xl overflow-hidden flex items-center justify-center bg-stone-50/60">
        {!imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.productName}
            fill
            sizes="(max-width: 768px) 50vw, 220px"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-106"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
            <ShoppingBag className="w-10 h-10 stroke-1" />
            <span className="text-[11px] mt-1 text-stone-400">Product Image</span>
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#1E4D38] transition-colors line-clamp-1 leading-snug">
            {product.productName}
          </h3>
          {product.packageSize && (
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {product.packageSize}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-2">
          <div className="text-base sm:text-lg font-extrabold text-stone-900 mb-3">
            {formattedPrice}
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={!product.isActive}
            className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              isAdded
                ? "bg-[#163C2B] text-white shadow-xs"
                : "bg-[#256141] hover:bg-[#1E4D38] active:bg-[#153A28] text-white shadow-2xs hover:shadow-xs"
            } disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
