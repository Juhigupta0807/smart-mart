import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ALL_PRODUCTS, getProductById } from "@/data/mockStoreData";
import { ProductDetailsClient } from "@/components/store/ProductDetailsClient";
import { Navbar } from "@/components/store/Navbar";
import { ShoppingBag, ArrowLeft } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found — SmartMart",
      description: "The requested grocery product could not be found.",
    };
  }

  return {
    title: `${product.productName} — SmartMart`,
    description:
      product.description ||
      `Buy ${product.productName} at the best price online on SmartMart. Fresh delivery to your doorstep.`,
  };
}

export function generateStaticParams() {
  return ALL_PRODUCTS.map((product) => ({
    id: String(product.productId),
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#EAF3E7] text-[#1E4D38] flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 stroke-1" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Product Not Found
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-md">
            We couldn't find the product you're looking for. It may be temporarily unavailable or the link might be incorrect.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#256141] hover:bg-[#1E4D38] text-white font-bold text-sm shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Products</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <ProductDetailsClient product={product} />;
}
