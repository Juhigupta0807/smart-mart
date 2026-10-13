"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Check, ShoppingCart, ShoppingBag } from "lucide-react";
import { Product } from "@/types/store";
import { formatINR } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product, isFav: boolean) => void;
}

export function ProductCard({
  product,
  viewMode = "grid",
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
  const isInStock = (product.currentStock ?? 1) > 0;

  // --- LIST VIEW PRESENTATION ---
  if (viewMode === "list") {
    return (
      <div className="group relative flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-card hover:border-stone-300 transition-all duration-300 gap-4">
        {/* Left: Product Image */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center p-2">
          {!imgError ? (
            <Image
              src={product.imageUrl}
              alt={product.productName}
              fill
              sizes="150px"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
              <ShoppingBag className="w-8 h-8 stroke-1" />
            </div>
          )}
        </div>

        {/* Center: Details */}
        <div className="flex-1 w-full sm:w-auto text-left space-y-1">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#1E4D38] transition-colors leading-snug">
              {product.productName}
            </h3>
            <button
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              className={`p-1.5 rounded-full transition-colors sm:hidden ${
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

          <div className="text-xs text-stone-500 font-medium">
            {product.categoryName || "Grocery"}
          </div>

          {product.packageSize && (
            <div className="text-xs text-stone-500 font-medium">
              {product.packageSize}
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-1.5 pt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isInStock ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span
              className={`text-xs font-semibold ${
                isInStock ? "text-[#1E4D38]" : "text-rose-600"
              }`}
            >
              {isInStock ? `In Stock (${product.currentStock})` : "Out of Stock"}
            </span>
          </div>
        </div>

        {/* Right: Price & Add to Cart */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-44 gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="flex items-center gap-3">
            <div className="text-xl font-extrabold text-stone-900">
              {formattedPrice}
            </div>
            <button
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              className={`hidden sm:block p-1.5 rounded-full transition-colors ${
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

          <button
            onClick={handleAddToCartClick}
            disabled={!product.isActive || !isInStock}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
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
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- GRID VIEW PRESENTATION (DEFAULT) ---
  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs hover:shadow-card hover:border-stone-300 transition-all duration-300">
      
      {/* Top Header: Favorite Heart */}
      <div className="flex items-center justify-end">
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
      <div className="relative w-full h-36 sm:h-40 my-1 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
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
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50 rounded-xl">
            <ShoppingBag className="w-10 h-10 stroke-1" />
            <span className="text-[11px] mt-1 text-stone-400">Grocery</span>
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#1E4D38] transition-colors line-clamp-1 leading-snug">
            {product.productName}
          </h3>

          <div className="text-xs text-stone-500 font-normal mt-0.5">
            {product.categoryName || "Grocery"}
          </div>

          {product.packageSize && (
            <div className="text-xs text-stone-500 font-normal mt-0.5">
              {product.packageSize}
            </div>
          )}
        </div>

        {/* Price & Stock & Action Button */}
        <div className="mt-3">
          <div className="text-base sm:text-lg font-extrabold text-stone-900">
            {formattedPrice}
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-1.5 my-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isInStock ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span
              className={`text-xs font-semibold ${
                isInStock ? "text-[#1E4D38]" : "text-rose-600"
              }`}
            >
              {isInStock ? `In Stock (${product.currentStock})` : "Out of Stock"}
            </span>
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={!product.isActive || !isInStock}
            className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
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
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
