import type { Metadata } from "next";
import { Suspense } from "react";
import OrderHistoryClient from "./order-history-client";

export const metadata: Metadata = {
  title: "Order History | SmartMart",
  description: "View and track your previous customer orders, shipping status, and itemized receipts on SmartMart.",
};

export default function OrderHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading order history...</p>
          </div>
        </div>
      }
    >
      <OrderHistoryClient />
    </Suspense>
  );
}
