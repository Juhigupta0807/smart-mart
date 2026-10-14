"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import ConfirmModal from "@/components/ui/confirm-modal";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Search,
  RefreshCw,
  CreditCard,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/orders";

interface OrderRow {
  orderId: number;
  orderDate: string;
  orderStatus: OrderStatus;
  totalAmount: string;
  shippingAddress: string | null;
  customerId: number;
  customerName: string | null;
  customerEmail: string | null;
}

interface OrderDetailResponse extends OrderRow {
  items: {
    orderDetailId: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    productName: string | null;
  }[];
  payment: {
    paymentId: number;
    orderId: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    amount: string;
  } | null;
}

const STATUS_FILTERS: (OrderStatus | "ALL")[] = [
  "ALL",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [customerIdFilter, setCustomerIdFilter] = useState("");

  // Expand state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailResponse | null>(null);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Cancellation confirm modal state
  const [cancelTarget, setCancelTarget] = useState<{ orderId: number; targetStatus: string } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setFeedback(null);

    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (customerIdFilter.trim()) params.append("customerId", customerIdFilter.trim());

    const queryStr = params.toString() ? `?${params.toString()}` : "";

    try {
      const data = await fetchApi<OrderRow[]>(`/api/orders${queryStr}`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load orders.";
      setFeedback({ type: "error", message: msg });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, customerIdFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setOrderDetails(null);
      return;
    }
    setExpandedId(orderId);
    setOrderDetails(null);
    try {
      const details = await fetchApi<OrderDetailResponse>(`/api/orders/${orderId}`);
      setOrderDetails(details);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load order details.";
      setFeedback({ type: "error", message: msg });
    }
  };

  const handleStatusSelect = (orderId: number, newStatus: string) => {
    if (newStatus === "Cancelled") {
      setCancelTarget({ orderId, targetStatus: newStatus });
      return;
    }
    executeStatusChange(orderId, newStatus);
  };

  const executeStatusChange = async (orderId: number, status: string) => {
    setActionLoading(true);
    try {
      await fetchApi(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: status }),
      });
      setFeedback({ type: "success", message: `Order #${orderId} status updated to ${status}.` });
      setCancelTarget(null);
      loadOrders();
      if (expandedId === orderId) {
        const details = await fetchApi<OrderDetailResponse>(`/api/orders/${orderId}`);
        setOrderDetails(details);
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to update order status.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "Pending":
        return <Clock size={15} className="text-amber-500" />;
      case "Confirmed":
        return <CheckCircle size={15} className="text-blue-500" />;
      case "Shipped":
        return <Truck size={15} className="text-indigo-500" />;
      case "Delivered":
        return <Package size={15} className="text-emerald-500" />;
      case "Cancelled":
        return <XCircle size={15} className="text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track order fulfillments, update shipment statuses, and review invoices.
          </p>
        </div>

        <button
          onClick={() => loadOrders()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : "text-slate-500"} />
          Refresh
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-2xs shadow-indigo-200"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {st === "ALL" ? "All Orders" : st}
                </button>
              );
            })}
          </div>

          {/* Customer ID Filter */}
          <div className="flex items-center gap-2 max-w-xs w-full">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                placeholder="Filter by Customer ID"
                value={customerIdFilter}
                onChange={(e) => setCustomerIdFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
            {customerIdFilter && (
              <button
                onClick={() => setCustomerIdFilter("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-indigo-600" />
            Loading orders list...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Order / Date</th>
                  <th className="px-6 py-3.5 font-semibold">Customer</th>
                  <th className="px-6 py-3.5 font-semibold">Total</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <React.Fragment key={order.orderId}>
                    <tr
                      className={`hover:bg-slate-50/70 transition-colors ${
                        expandedId === order.orderId ? "bg-slate-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">#{order.orderId}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {order.customerName || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {order.customerEmail || `Customer ID #${order.customerId}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                          <StatusIcon status={order.orderStatus} />
                          <select
                            value={order.orderStatus}
                            disabled={actionLoading}
                            onChange={(e) => handleStatusSelect(order.orderId, e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:ring-0 cursor-pointer p-0 m-0 outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleExpand(order.orderId)}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="View order details"
                        >
                          {expandedId === order.orderId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Order Details Row */}
                    {expandedId === order.orderId && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={5} className="px-6 py-6 border-t border-slate-100">
                          {orderDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                              {/* Order Items */}
                              <div>
                                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-3">
                                  Purchased Items ({orderDetails.items.length})
                                </h4>
                                <ul className="space-y-2">
                                  {orderDetails.items.map((item) => (
                                    <li
                                      key={item.orderDetailId}
                                      className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs"
                                    >
                                      <div>
                                        <span className="font-semibold text-slate-900 block">
                                          {item.productName || `Item #${item.productId}`}
                                        </span>
                                        <span className="text-slate-400 text-[11px]">
                                          Qty: {item.quantity} × {formatINR(item.unitPrice)}
                                        </span>
                                      </div>
                                      <span className="font-bold text-slate-900">
                                        {formatINR(Number(item.unitPrice) * item.quantity)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Shipping & Payment info */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                                    <MapPin size={13} className="text-slate-400" />
                                    Shipping Destination
                                  </h4>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700 shadow-2xs">
                                    {orderDetails.shippingAddress || "No shipping address provided."}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                                    <CreditCard size={13} className="text-slate-400" />
                                    Payment Transaction
                                  </h4>
                                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                                    {orderDetails.payment ? (
                                      <>
                                        <div className="flex justify-between">
                                          <span className="text-slate-400">Method:</span>
                                          <span className="font-semibold text-slate-800">
                                            {orderDetails.payment.paymentMethod}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-400">Status:</span>
                                          <span
                                            className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                                              orderDetails.payment.paymentStatus === "Completed"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                            }`}
                                          >
                                            {orderDetails.payment.paymentStatus}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-400">Amount Paid:</span>
                                          <span className="font-bold text-slate-900">
                                            {formatINR(orderDetails.payment.amount)}
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-slate-400 italic">No payment record found.</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-slate-500 flex items-center justify-center gap-2">
                              <RefreshCw size={14} className="animate-spin text-indigo-600" />
                              Loading order invoice details...
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmModal
        isOpen={cancelTarget !== null}
        title="Cancel Order Confirmation"
        description={`Are you sure you want to change order #${cancelTarget?.orderId} status to "Cancelled"? This action affects customer fulfillment.`}
        confirmText="Confirm Cancellation"
        cancelText="Keep Order Active"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={() => {
          if (cancelTarget) {
            executeStatusChange(cancelTarget.orderId, cancelTarget.targetStatus);
          }
        }}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
