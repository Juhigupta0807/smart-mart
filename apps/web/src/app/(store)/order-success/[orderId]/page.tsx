"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  Hash,
  ArrowRight,
  Printer,
  ShoppingBag,
  Info,
  Smartphone,
  Building,
  Banknote,
} from "lucide-react";
import { Navbar } from "@/components/store/Navbar";
import { useCart, OrderDetails } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "SM-2026-1042";
  const { getOrderById } = useCart();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load order by ID from localStorage
    const loadedOrder = getOrderById(orderId);
    if (loadedOrder) {
      setOrder(loadedOrder);
    } else {
      // Fallback sample order if direct link is opened
      setOrder({
        orderId: orderId,
        orderDate: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: [],
        itemCount: 4,
        subtotal: 855,
        deliveryFee: 40,
        discount: 0,
        total: 895,
        shippingAddress: {
          fullName: "Juhi Gupta",
          phoneNumber: "9876543210",
          addressLine: "TT Block, Room 307, VIT Vellore",
          city: "Vellore",
          state: "Tamil Nadu",
          pincode: "632014",
          addressType: "hostel",
        },
        paymentMethod: "upi",
        paymentStatus: "paid",
      });
    }
    setLoading(false);
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-stone-500 font-medium">
        Loading confirmation...
      </div>
    );
  }

  const isCOD = order?.paymentMethod === "cod";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6"
        >
          <Link href="/" className="hover:text-[#1E4D38] transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-stone-800">Order Confirmation</span>
        </nav>

        {/* Success Header Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EAF3E7] text-[#1E4D38] flex items-center justify-center mx-auto ring-8 ring-[#EAF3E7]/50 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Thank you for shopping with SmartMart! Your grocery order has been received and is being prepared for dispatch.
            </p>
          </div>

          {/* Demo Notice Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF5EE] border border-stone-200/80 text-stone-600 text-xs text-left max-w-lg mx-auto">
            <Info className="w-4 h-4 text-[#1E4D38] shrink-0" />
            <span>
              This is a simulated demo order. No actual payment was charged to your account, and no physical delivery will be made.
            </span>
          </div>
        </div>

        {/* Order Details & Summary Sections */}
        {order && (
          <div className="mt-6 space-y-6">
            
            {/* Quick Metadata 4-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#1E4D38] flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-stone-400 font-medium">
                    Order Reference
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 truncate block">
                    {order.orderId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#1E4D38] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-stone-400 font-medium">
                    Order Date
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 truncate block">
                    {order.orderDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#1E4D38] flex items-center justify-center shrink-0">
                  {order.paymentMethod === "upi" ? (
                    <Smartphone className="w-4 h-4" />
                  ) : order.paymentMethod === "card" ? (
                    <CreditCard className="w-4 h-4" />
                  ) : order.paymentMethod === "netbanking" ? (
                    <Building className="w-4 h-4" />
                  ) : (
                    <Banknote className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-stone-400 font-medium">
                    Payment Method
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 uppercase truncate block">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#1E4D38] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-stone-400 font-medium">
                    Payment Status
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold truncate block ${
                      isCOD ? "text-amber-700" : "text-[#1E4D38]"
                    }`}
                  >
                    {isCOD ? "Due on Delivery" : "Paid (Demo)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address & Schedule Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Delivery Address Card */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                  <MapPin className="w-4 h-4 text-[#1E4D38]" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Delivery Address
                  </h3>
                </div>
                <div className="text-xs sm:text-sm space-y-1 text-stone-700">
                  <p className="font-bold text-stone-900">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.addressLine}</p>
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="text-stone-500 pt-1">
                    Phone: {order.shippingAddress.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Delivery Timeline Card */}
              <div className="bg-[#EAF3E7] border border-[#D5E5D1] rounded-3xl p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#D5E5D1]/80">
                  <Truck className="w-4 h-4 text-[#1E4D38]" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Estimated Delivery
                  </h3>
                </div>
                <div className="text-xs sm:text-sm space-y-2 text-stone-700">
                  <p className="font-bold text-stone-900 text-base">
                    Within 2-3 Business Days
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Packed fresh in temperature-controlled boxes. Our delivery agent will contact you before arriving at your doorstep.
                  </p>
                </div>
              </div>

            </div>

            {/* Purchased Items List */}
            {order.items && order.items.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100">
                  Items in this Order ({order.items.length})
                </h3>

                <div className="divide-y divide-stone-100">
                  {order.items.map(({ product, quantity }) => (
                    <div
                      key={product.productId}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl bg-stone-50 border border-stone-200/60 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {product.productName}
                          </h4>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Qty: {quantity} × {formatINR(product.price).replace(/\.00$/, "")}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm font-extrabold text-stone-900 shrink-0">
                        {formatINR(product.price * quantity).replace(/\.00$/, "")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Totals Breakdown */}
                <div className="pt-4 border-t border-stone-100 space-y-2 text-xs sm:text-sm text-stone-600 max-w-sm ml-auto">
                  <div className="flex justify-between items-center">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-stone-900">
                      {formatINR(order.subtotal).replace(/\.00$/, "")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    {order.deliveryFee === 0 ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E5EFE2] text-[#1E4D38]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-stone-900">
                        {formatINR(order.deliveryFee).replace(/\.00$/, "")}
                      </span>
                    )}
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-{formatINR(order.discount).replace(/\.00$/, "")}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-stone-900 text-sm sm:text-base">
                    <span>Total Amount</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#1E4D38]">
                      {formatINR(order.total).replace(/\.00$/, "")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 font-bold text-xs sm:text-sm hover:bg-stone-50 transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
