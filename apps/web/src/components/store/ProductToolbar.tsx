"use client";

import React, { useState } from "react";
import { LayoutGrid, List, ChevronDown, Filter } from "lucide-react";
import { SortOption, ViewMode } from "@/types/store";

interface ProductToolbarProps {
  totalCount: number;
  sortBy: SortOption;
  onSortByChange: (val: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (val: ViewMode) => void;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
}

export function ProductToolbar({
  totalCount,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  activeFilterCount = 0,
}: ProductToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sortLabels: Record<SortOption, string> = {
    relevance: "Relevance",
    "price-low-high": "Price: Low to High",
    "price-high-low": "Price: High to Low",
    "name-asc": "Name (A - Z)",
    newest: "Newest First",
  };

  const sortOptions: SortOption[] = [
    "relevance",
    "price-low-high",
    "price-high-low",
    "name-asc",
    "newest",
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      {/* Left: Eyebrow and Heading */}
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-stone-500 block mb-1.5">
          Products
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          All <span className="text-[#215E3F]">Products</span>
        </h1>
      </div>

      {/* Right Controls: Count, Sort Dropdown, View Toggle, Mobile Filter Button */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-3 sm:gap-4 self-start sm:self-end">
        
        {/* Mobile Filter Button */}
        {onOpenMobileFilters && (
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-700 shadow-2xs hover:bg-stone-50"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#1E4D38] text-white text-[10px] flex items-center justify-center font-bold ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Showing Count */}
        <span className="text-xs sm:text-sm font-medium text-stone-500 whitespace-nowrap">
          Showing {totalCount} {totalCount === 1 ? "product" : "products"}
        </span>

        {/* Sort by Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-stone-500 font-medium hidden md:inline">
              Sort by
            </span>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 shadow-2xs hover:border-stone-300 transition-colors cursor-pointer"
            >
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-stone-200 shadow-card py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      onSortByChange(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs sm:text-sm transition-colors flex items-center justify-between ${
                      sortBy === opt
                        ? "bg-[#E7F2E4] text-[#1E4D38] font-bold"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span>{sortLabels[opt]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Grid / List View Toggle */}
        <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/60">
          <button
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-[#256141] text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            aria-label="List view"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-[#256141] text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
