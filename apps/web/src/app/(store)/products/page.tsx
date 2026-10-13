import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsPageClient } from "@/components/store/ProductsPageClient";

export const metadata: Metadata = {
  title: "All Products — SmartMart",
  description: "Browse our fresh groceries, dairy, bakery, staples, snacks, beverages and household essentials.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-stone-500 font-medium">
          Loading products...
        </div>
      }
    >
      <ProductsPageClient />
    </Suspense>
  );
}
