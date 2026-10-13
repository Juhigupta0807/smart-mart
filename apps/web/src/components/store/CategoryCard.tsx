"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/store";
import { ShoppingBasket } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  onSelectCategory?: (category: Category) => void;
}

export function CategoryCard({ category, onSelectCategory }: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(category);
    }
  };

  return (
    <Link
      href={`#products`}
      onClick={handleClick}
      className="group flex flex-col items-center shrink-0 w-36 sm:w-40 md:w-44 p-3.5 sm:p-4 rounded-2xl bg-[#F6F1EA] hover:bg-[#EFE8DF] border border-[#EBE3D7]/60 hover:border-[#DFD4C4] transition-all duration-300 hover:-translate-y-1 hover:shadow-card text-center"
    >
      {/* Image Container */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3 rounded-xl overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <Image
            src={category.imageUrl}
            alt={category.categoryName}
            fill
            sizes="160px"
            className="object-contain p-1 transition-transform duration-500 group-hover:scale-108"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#EAE2D5] rounded-xl flex items-center justify-center text-[#1E4D38]">
            <ShoppingBasket className="w-10 h-10 opacity-70" />
          </div>
        )}
      </div>

      {/* Category Name */}
      <span className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#1E4D38] transition-colors line-clamp-2">
        {category.categoryName}
      </span>
    </Link>
  );
}
