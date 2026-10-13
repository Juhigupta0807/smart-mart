"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Calendar,
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
  Lock,
  Search,
  ExternalLink,
  ReceiptText
} from "lucide-react";
import { fetchApi, ApiError } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { OrderSummary, OrderDetail, OrderStatus } from "@/types/orders";

const STATUS_OPTIONS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

export default function OrderHistoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get("status");
  const urlCustomerId = searchParams.get("customerId");

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    (urlStatus as OrderStatus) || "ALL"
  );
  const [customerIdInput, setCustomerIdInput] = useState<string>(urlCustomerId || "");

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthRestricted, setIsAuthRestricted] = useState(false);

  // Expanded order details state
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<number, OrderDetail>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsAuthRestricted(false);

    const params = new URLSearchParams();
    if (selectedStatus !== "ALL") {
      params.append("status", selectedStatus);
    }
    if (customerIdInput.trim()) {
      params.append("customerId", customerIdInput.trim());
    }

    const queryStr = params.toString() ? `?${params.toString()}` : "";

    try {
      const data = await fetchApi<OrderSummary[]>(`/api/orders${queryStr}`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setIsAuthRestricted(true);
      } else if (err instanceof ApiError) {
        setError(err.message || "Failed to load orders from the server.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected network error occurred.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, customerIdInput]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleExpand = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // If not cached, fetch detail
    if (!detailsCache[orderId]) {
      setLoadingDetailsId(orderId);
      try {
        const detail = await fetchApi<OrderDetail>(`/api/orders/${orderId}`);
        setDetailsCache((prev) => ({ ...prev, [orderId]: detail }));
      } catch (err) {
        console.error("Failed to load order details for order #" + orderId, err);
      } finally {
        setLoadingDetailsId(null);
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return {
          icon: Clock,
          color: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500",
        };
      case "Confirmed":
        return {
          icon: CheckCircle2,
          color: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-500",
        };
      case "Shipped":
        return {
          icon: Truck,
          color: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          dot: "bg-indigo-500",
        };
      case "Delivered":
        return {
          icon: Package,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
        };
      case "Cancelled":
        return {
          icon: XCircle,
          color: "bg-rose-50 text-rose-700 border-rose-200/80",
          dot: "bg-rose-500",
        };
      default:
        return {
          icon: Clock,
          color: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Store Header Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
                S
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SmartMart</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-600">Order History</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Store</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Page Title & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ReceiptText className="text-indigo-600" size={28} />
              Customer Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View your order details, real-time shipment status, and itemized receipts.
            </p>
          </div>

          <button
            onClick={() => loadOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-indigo-600" : "text-slate-500"} />
            Refresh
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = selectedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Customer ID Filter Input */}
            <div className="flex items-center gap-2 max-w-xs w-full">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  placeholder="Filter by Customer ID"
                  value={customerIdInput}
                  onChange={(e) => setCustomerIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadOrders()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
              {customerIdInput && (
                <button
                  onClick={() => {
                    setCustomerIdInput("");
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Auth Limitation / Missing Customer Session Banner */}
        {isAuthRestricted && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock size={24} />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-amber-900">
                    Authentication Required for Order History
                  </h3>
                  <p className="text-sm text-amber-800/90 mt-1 leading-relaxed">
                    The SmartMart API order service (<code>/api/orders</code>) currently requires an authenticated session. 
                    Because customer authentication endpoints have not yet been implemented on the backend, only administrator sessions are verified by the existing auth guard.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login?role=admin&redirect=/orders"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-800 text-white hover:bg-amber-900 shadow-sm transition-all"
                  >
                    Sign In with Admin Session
                    <ExternalLink size={14} />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 transition-all"
                  >
                    Return to Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Error State */}
        {error && !isAuthRestricted && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3.5 text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Unable to fetch orders</h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              <button
                onClick={() => loadOrders()}
                className="mt-3 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2"
              >
                Try reloading orders
              </button>
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-slate-200 rounded w-32" />
                  <div className="h-6 bg-slate-200 rounded-full w-24" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-4 bg-slate-100 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-28" />
                  <div className="h-4 bg-slate-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !isAuthRestricted && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Orders Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {selectedStatus !== "ALL"
                ? `No orders matching status "${selectedStatus}". Try selecting "All Orders".`
                : "You haven't placed any orders yet. Start exploring the catalog to place an order."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {selectedStatus !== "ALL" && (
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                >
                  View All Orders
                </button>
              )}
              <Link
                href="/"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
              >
                Browse Store Products
              </Link>
            </div>
          </div>
        )}

        {/* Order Cards List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = getStatusBadge(order.orderStatus);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedOrderId === order.orderId;
              const details = detailsCache[order.orderId];
              const isLoadingDetails = loadingDetailsId === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Card Header Summary */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-slate-900 tracking-tight">
                          Order #{order.orderId}
                        </span>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <BadgeIcon size={13} />
                          {order.orderStatus}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 font-medium block">Total Amount</span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatINR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-slate-400 shrink-0" />
                        <div>
                          <span className="text-slate-400 block font-medium">Order Date</span>
                          <span className="font-medium text-slate-800">
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                      </div>

                      {order.customerName && (
                        <div>
                          <span className="text-slate-400 block font-medium">Customer</span>
                          <span className="font-medium text-slate-800">
                            {order.customerName}
                          </span>
                          {order.customerEmail && (
                            <span className="text-slate-400 block text-[11px] truncate">
                              {order.customerEmail}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-start gap-2 sm:col-span-1">
                        <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block font-medium">Shipping Address</span>
                          <span className="font-medium text-slate-700 line-clamp-1">
                            {order.shippingAddress || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Details Trigger */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {isExpanded ? "Showing order details" : "Click to view purchased items & invoice"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.orderId)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp size={15} />
                          </>
                        ) : (
                          <>
                            <span>View Details</span>
                            <ChevronDown size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Order Details Panel */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 border-t border-slate-200/70 p-5 sm:p-6 space-y-6">
                      {isLoadingDetails && (
                        <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                          <RefreshCw size={15} className="animate-spin text-indigo-600" />
                          Loading order breakdown...
                        </div>
                      )}

                      {!isLoadingDetails && details && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Purchased Items List (2 Columns on large screens) */}
                          <div className="lg:col-span-2 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Purchased Items ({details.items?.length || 0})
                            </h4>

                            <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                              {details.items && details.items.length > 0 ? (
                                details.items.map((item) => (
                                  <div
                                    key={item.orderDetailId}
                                    className="p-3.5 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                        <Package size={16} />
                                      </div>
                                      <div>
                                        <span className="font-semibold text-slate-900 block">
                                          {item.productName || `Product #${item.productId}`}
                                        </span>
                                        <span className="text-slate-400 text-[11px]">
                                          Qty: {item.quantity} × {formatINR(item.unitPrice)}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-bold text-slate-900">
                                      {formatINR(Number(item.unitPrice) * item.quantity)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-xs text-slate-500">
                                  No items registered for this order.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment & Invoice Breakdown */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Payment Information
                              </h4>
                              <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2.5 text-xs shadow-2xs">
                                {details.payment ? (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500 flex items-center gap-1.5">
                                        <CreditCard size={14} className="text-slate-400" />
                                        Method:
                                      </span>
                                      <span className="font-semibold text-slate-800">
                                        {details.payment.paymentMethod}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500">Status:</span>
                                      <span
                                        className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                                          details.payment.paymentStatus === "Completed"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-50 text-amber-700"
                                        }`}
                                      >
                                        {details.payment.paymentStatus}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500">Amount Paid:</span>
                                      <span className="font-bold text-slate-900">
                                        {formatINR(details.payment.amount)}
                                      </span>
                                    </div>

                                    {details.payment.paymentDate && (
                                      <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                                        <span className="text-slate-400">Date:</span>
                                        <span className="text-slate-600">
                                          {formatDate(details.payment.paymentDate)}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-400 italic">No payment record found.</span>
                                )}
                              </div>
                            </div>

                            {/* Delivery Address Summary */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Destination
                              </h4>
                              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 text-xs text-slate-700 shadow-2xs flex items-start gap-2">
                                <MapPin size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                                <span>{details.shippingAddress || "Standard shipping address"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
