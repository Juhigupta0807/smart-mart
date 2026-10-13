"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/store/Navbar";
import { ProductToolbar } from "@/components/store/ProductToolbar";
import { ProductFilters } from "@/components/store/ProductFilters";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Pagination } from "@/components/store/Pagination";
import { ALL_PRODUCTS } from "@/data/mockStoreData";
import { Product, SortOption, ViewMode } from "@/types/store";
import { X, Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";

const ITEMS_PER_PAGE = 10;

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Query Sync
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";
  const sortParam = (searchParams.get("sort") as SortOption) || "relevance";

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [availability, setAvailability] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Cart from Global Context
  const { addToCart, showToast } = useCart();

  // Keep in sync if URL params change
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParam]);

  // Handle Category selection
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  // Handle Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...ALL_PRODUCTS];

    // 1. Category Filter
    if (selectedCategory && selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          p.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // 3. Price Filter
    list = list.filter((p) => p.price <= maxPrice);

    // 4. Availability Filter
    if (availability === "in-stock") {
      list = list.filter((p) => (p.currentStock ?? 0) > 0);
    } else if (availability === "out-of-stock") {
      list = list.filter((p) => (p.currentStock ?? 0) === 0);
    }

    // 5. Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case "price-low-high":
          return a.price - b.price;
        case "price-high-low":
          return b.price - a.price;
        case "name-asc":
          return a.productName.localeCompare(b.productName);
        case "newest":
          return b.productId - a.productId;
        case "relevance":
        default:
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }
    });

    return list;
  }, [selectedCategory, searchQuery, maxPrice, availability, sortBy]);

  // Pagination calculation
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const displayedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setMaxPrice(500);
    setAvailability("all");
    setSortBy("relevance");
    setCurrentPage(1);
    showToast("All filters have been reset");
  };

  // Add to Cart handler
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  // Wishlist handler
  const handleToggleFavorite = (product: Product, isFav: boolean) => {
    showToast(
      isFav
        ? `Added "${product.productName}" to wishlist`
        : `Removed "${product.productName}" from wishlist`
    );
  };

  // Active filter count
  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    (availability !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731]">
      
      {/* 1. Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {/* 2. Main Shop Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        
        {/* Page Toolbar (Heading, Product count, Sort, Grid/List toggle) */}
        <ProductToolbar
          totalCount={totalItems}
          sortBy={sortBy}
          onSortByChange={(opt) => {
            setSortBy(opt);
            setCurrentPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Two-Column Layout: Filters on Left (260px) + Product Grid on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Filter Panel (Cols 3 / 12) */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-28">
            <ProductFilters
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              maxPrice={maxPrice}
              onMaxPriceChange={(val) => {
                setMaxPrice(val);
                setCurrentPage(1);
              }}
              availability={availability}
              onAvailabilityChange={(val) => {
                setAvailability(val);
                setCurrentPage(1);
              }}
              sortBy={sortBy}
              onSortByChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
              onResetFilters={activeFilterCount > 0 ? handleResetFilters : undefined}
            />
          </div>

          {/* Right Product Grid Area (Cols 9 / 12) */}
          <div className="lg:col-span-9 xl:col-span-9 w-full">
            <ProductGrid
              products={displayedProducts}
              viewMode={viewMode}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </div>

        </div>

      </main>

      {/* Mobile Filter Drawer / Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#1E4D38]" />
                  <span className="font-bold text-stone-900 text-base">Filters</span>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilters
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                availability={availability}
                onAvailabilityChange={setAvailability}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onResetFilters={handleResetFilters}
              />
            </div>

            <div className="pt-6 mt-4 border-t border-stone-100">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-full bg-[#1E4D38] text-white font-bold text-sm shadow-md"
              >
                Apply Filters ({totalItems})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
