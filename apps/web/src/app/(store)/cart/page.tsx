"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/store/Navbar";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    subtotal,
    showToast,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Delivery fee logic: Free over ₹499, else ₹40
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const orderTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
      showToast("Order placed successfully! Thank you for shopping with SmartMart.");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6"
        >
          <Link href="/" className="hover:text-[#1E4D38] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-stone-800">Shopping Cart</span>
        </nav>

        {/* Heading */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {totalCount === 1
                ? "1 item in your basket"
                : `${totalCount} items in your basket`}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Clear Basket
            </button>
          )}
        </div>

        {/* Checkout Complete State */}
        {checkoutComplete ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center my-10 max-w-xl mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#E5EFE2] text-[#1E4D38] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#1E4D38]" />
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900">
              Order Confirmed!
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Your grocery order has been successfully placed. We're packing your fresh essentials right away.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/products"
                onClick={() => setCheckoutComplete(false)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center my-10 max-w-xl mx-auto shadow-2xs space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#FAF5EE] text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10 stroke-1 text-stone-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-800">
                Your cart is empty
              </h2>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Explore our wide range of groceries and essentials!
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Products</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Grid (8 Cols Items + 4 Cols Summary) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            {/* Left Items Column (Cols 8) */}
            <div className="lg:col-span-8 space-y-4">
              {items.map(({ product, quantity }) => {
                const maxStock = product.currentStock ?? 999;
                const formattedPrice = formatINR(product.price).replace(
                  /\.00$/,
                  ""
                );
                const lineTotal = formatINR(
                  product.price * quantity
                ).replace(/\.00$/, "");

                return (
                  <div
                    key={product.productId}
                    className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-2xs gap-4"
                  >
                    {/* Product Image & Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                      <Link
                        href={`/products/${product.productId}`}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-50 border border-stone-200/60 shrink-0 p-1 flex items-center justify-center hover:opacity-90 transition"
                      >
                        <Image
                          src={product.imageUrl}
                          alt={product.productName}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${product.productId}`}
                          className="text-sm sm:text-base font-bold text-stone-900 hover:text-[#1E4D38] transition-colors truncate block"
                        >
                          {product.productName}
                        </Link>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {product.packageSize || product.categoryName}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-stone-800 mt-1">
                          {formattedPrice} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Subtotal & Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-stone-200 rounded-xl bg-[#FAF5EE] px-1.5 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(product.productId, quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-bold text-stone-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.productId, quantity + 1)
                          }
                          disabled={quantity >= maxStock}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-base sm:text-lg font-extrabold text-stone-900 min-w-[70px] text-right">
                        {lineTotal}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product.productId)}
                        aria-label={`Remove ${product.productName} from cart`}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E4D38] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Summary Column (Cols 4) */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs space-y-5">
                <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex justify-between items-center">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-stone-900">
                      {formatINR(subtotal).replace(/\.00$/, "")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    {deliveryFee === 0 ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E5EFE2] text-[#1E4D38]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-stone-900">
                        {formatINR(deliveryFee).replace(/\.00$/, "")}
                      </span>
                    )}
                  </div>

                  {subtotal < 499 && (
                    <div className="p-2.5 rounded-xl bg-[#FAF5EE] text-[11px] text-stone-600">
                      Add items worth{" "}
                      <strong className="text-stone-900">
                        {formatINR(499 - subtotal).replace(/\.00$/, "")}
                      </strong>{" "}
                      more to get <strong className="text-[#1E4D38]">FREE Delivery</strong>!
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-stone-900">
                    Grand Total
                  </span>
                  <span className="text-2xl font-extrabold text-[#1E4D38]">
                    {formatINR(orderTotal).replace(/\.00$/, "")}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm sm:text-base shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="bg-[#EAF3E7] border border-[#D5E5D1] rounded-2xl p-4 flex items-center justify-around text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E4D38]" />
                  <span className="font-semibold">Secure Checkout</span>
                </div>
                <div className="w-px h-4 bg-stone-300" />
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#1E4D38]" />
                  <span className="font-semibold">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
