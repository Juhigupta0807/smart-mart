"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  PieChart,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Filter,
  ShoppingBag,
  Award
} from "lucide-react";
import { OrderSummary, OrderStatus } from "@/types/orders";

interface ProductSalePerformance {
  productId: number;
  productName: string;
  totalQty: number;
  totalRevenue: string;
}

interface DashboardReportsData {
  totalOrders: number;
  totalRevenue: string;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: {
    status: OrderStatus;
    count: number;
  }[];
}

interface DailyTrendPoint {
  dateKey: string;
  label: string;
  orders: number;
  revenue: number;
}

export default function ReportsAnalyticsPage() {
  const [salesData, setSalesData] = useState<ProductSalePerformance[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardReportsData | null>(null);
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filters
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [activePreset, setActivePreset] = useState<string>("all");

  // Chart view toggle
  const [trendMetric, setTrendMetric] = useState<"revenue" | "orders">("revenue");
  const [hoveredPoint, setHoveredPoint] = useState<DailyTrendPoint | null>(null);

  const applyPreset = (preset: "7d" | "30d" | "ytd" | "all") => {
    setActivePreset(preset);
    const now = new Date();

    if (preset === "all") {
      setFromDate("");
      setToDate("");
      return;
    }

    const endStr = now.toISOString().split("T")[0];
    setToDate(endStr);

    if (preset === "7d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      setFromDate(start.toISOString().split("T")[0]);
    } else if (preset === "30d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      setFromDate(start.toISOString().split("T")[0]);
    } else if (preset === "ytd") {
      const start = new Date(now.getFullYear(), 0, 1);
      setFromDate(start.toISOString().split("T")[0]);
    }
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    const salesParams = new URLSearchParams();
    if (fromDate) salesParams.append("from", fromDate);
    if (toDate) salesParams.append("to", toDate);
    const salesQuery = salesParams.toString() ? `?${salesParams.toString()}` : "";

    try {
      const [salesRes, dashRes, ordersRes] = await Promise.all([
        fetchApi<ProductSalePerformance[]>(`/api/reports/sales${salesQuery}`),
        fetchApi<DashboardReportsData>("/api/reports/dashboard"),
        fetchApi<OrderSummary[]>("/api/orders").catch(() => []),
      ]);

      setSalesData(Array.isArray(salesRes) ? salesRes : []);
      setDashboardData(dashRes);
      setAllOrders(Array.isArray(ordersRes) ? ordersRes : []);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to load reports from the analytics service.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while fetching analytics.");
      }
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Aggregate orders for the trend chart within the selected date range
  const trendPoints: DailyTrendPoint[] = useMemo(() => {
    if (!allOrders || allOrders.length === 0) return [];

    let filtered = allOrders;

    if (fromDate) {
      const fromTime = new Date(fromDate).getTime();
      filtered = filtered.filter((o) => new Date(o.orderDate).getTime() >= fromTime);
    }
    if (toDate) {
      const toTime = new Date(`${toDate}T23:59:59`).getTime();
      filtered = filtered.filter((o) => new Date(o.orderDate).getTime() <= toTime);
    }

    const grouped: Record<string, { orders: number; revenue: number; rawDate: Date }> = {};

    filtered.forEach((o) => {
      const d = new Date(o.orderDate);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().split("T")[0];

      if (!grouped[key]) {
        grouped[key] = { orders: 0, revenue: 0, rawDate: d };
      }
      grouped[key].orders += 1;
      grouped[key].revenue += parseFloat(o.totalAmount) || 0;
    });

    const sortedKeys = Object.keys(grouped).sort();
    return sortedKeys.map((k) => ({
      dateKey: k,
      label: grouped[k].rawDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      orders: grouped[k].orders,
      revenue: Math.round(grouped[k].revenue),
    }));
  }, [allOrders, fromDate, toDate]);

  // Summary Metrics calculated from period sales data
  const periodMetrics = useMemo(() => {
    const totalSalesRevenue = salesData.reduce((acc, curr) => acc + (parseFloat(curr.totalRevenue) || 0), 0);
    const totalUnitsSold = salesData.reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);
    const topProduct = salesData.length > 0 ? salesData[0] : null;

    return {
      totalSalesRevenue,
      totalUnitsSold,
      topProduct,
      uniqueProductsSold: salesData.length,
    };
  }, [salesData]);

  // Order status distribution
  const statusDistribution = useMemo(() => {
    if (!dashboardData?.ordersByStatus) return [];
    const total = dashboardData.ordersByStatus.reduce((acc, curr) => acc + curr.count, 0);

    return dashboardData.ordersByStatus.map((item) => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return {
        ...item,
        percentage: pct,
      };
    });
  }, [dashboardData]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return { barBg: "bg-emerald-500", text: "text-emerald-700", icon: CheckCircle2 };
      case "Shipped":
        return { barBg: "bg-indigo-500", text: "text-indigo-700", icon: Truck };
      case "Confirmed":
        return { barBg: "bg-blue-500", text: "text-blue-700", icon: CheckCircle2 };
      case "Pending":
        return { barBg: "bg-amber-500", text: "text-amber-700", icon: Clock };
      case "Cancelled":
        return { barBg: "bg-rose-500", text: "text-rose-700", icon: XCircle };
      default:
        return { barBg: "bg-slate-400", text: "text-slate-700", icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-indigo-600" size={26} />
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified financial reports, product performance metrics, and sales trends.
          </p>
        </div>

        <button
          onClick={() => loadReports()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : "text-slate-500"} />
          Refresh Data
        </button>
      </div>

      {/* Date Range & Preset Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Period:
            </span>
            <button
              onClick={() => applyPreset("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === "all"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => applyPreset("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === "7d"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => applyPreset("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === "30d"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => applyPreset("ytd")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === "ytd"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Year to Date
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Calendar size={14} className="text-slate-400" />
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setActivePreset("custom");
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setActivePreset("custom");
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => applyPreset("all")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm flex items-start gap-3.5 text-rose-800"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Analytics Error</h3>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            <button
              onClick={() => loadReports()}
              className="mt-3 text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
            >
              Retry loading report data
            </button>
          </div>
        </div>
      )}

      {/* Period Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <DollarSign size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Period Product Revenue
            </h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {formatINR(periodMetrics.totalSalesRevenue)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {fromDate || toDate ? "Filtered timeframe" : "All recorded sales"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <ShoppingBag size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Units Sold
            </h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {periodMetrics.totalUnitsSold.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">Items fulfilled across orders</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
              <Package size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Products Sold
            </h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {periodMetrics.uniqueProductsSold.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">Catalog items with sales activity</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Award size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Top Selling Item
            </h3>
            <p className="text-lg font-bold text-slate-900 tracking-tight mt-1 truncate">
              {periodMetrics.topProduct?.productName || "None"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {periodMetrics.topProduct
                ? `${periodMetrics.topProduct.totalQty} units • ${formatINR(periodMetrics.topProduct.totalRevenue)}`
                : "No sales recorded"}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue & Order Trends Chart (2 Cols) + Order Status Distribution (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-600" />
                Revenue & Order Volume Trend
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily timeline aggregated from verified customer orders
              </p>
            </div>

            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                onClick={() => setTrendMetric("revenue")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  trendMetric === "revenue"
                    ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setTrendMetric("orders")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  trendMetric === "orders"
                    ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Chart Graphic */}
          {trendPoints.length > 0 ? (
            <div className="space-y-4">
              <div className="relative h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2">
                <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-2 border-b border-slate-200 pointer-events-none" />

                {(() => {
                  const maxVal = Math.max(
                    ...trendPoints.map((p) => (trendMetric === "revenue" ? p.revenue : p.orders)),
                    1
                  );

                  return trendPoints.map((pt) => {
                    const currentVal = trendMetric === "revenue" ? pt.revenue : pt.orders;
                    const heightPct = Math.max(Math.round((currentVal / maxVal) * 100), 6);

                    return (
                      <div
                        key={pt.dateKey}
                        className="flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                            hoveredPoint?.dateKey === pt.dateKey
                              ? "bg-indigo-600 shadow-md shadow-indigo-200 scale-105"
                              : "bg-indigo-100 hover:bg-indigo-200"
                          }`}
                        />
                        <span className="text-[10px] font-medium text-slate-500 mt-2 block truncate max-w-[48px]">
                          {pt.label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Point Inspector */}
              <div className="h-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                {hoveredPoint ? (
                  <>
                    <span className="font-medium text-slate-700">{hoveredPoint.label}:</span>
                    <span className="font-bold text-indigo-600">
                      {trendMetric === "revenue"
                        ? formatINR(hoveredPoint.revenue)
                        : `${hoveredPoint.orders} order${hoveredPoint.orders === 1 ? "" : "s"}`}
                    </span>
                  </>
                ) : (
                  <span className="italic text-slate-400">
                    Hover over bars to inspect daily financial totals.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Calendar size={24} />
              <p className="text-xs">No orders recorded in the selected period.</p>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <PieChart size={18} className="text-indigo-600" />
                Order Statuses
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {dashboardData?.totalOrders ?? 0} Total
              </span>
            </div>

            {statusDistribution.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-2xs">
                  {statusDistribution.map((item) => {
                    const style = getStatusColor(item.status);
                    return (
                      <div
                        key={item.status}
                        style={{ width: `${item.percentage}%` }}
                        className={`${style.barBg} transition-all`}
                        title={`${item.status}: ${item.count} (${item.percentage}%)`}
                      />
                    );
                  })}
                </div>

                <div className="space-y-2.5 pt-2">
                  {statusDistribution.map((item) => {
                    const style = getStatusColor(item.status);
                    const StatusIcon = style.icon;

                    return (
                      <div
                        key={item.status}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <StatusIcon size={14} className={style.text} />
                          <span className="font-semibold text-slate-700">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.count}</span>
                          <span className="text-[11px] text-slate-400">({item.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No status breakdown data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Product Sales Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by revenue contribution from <code>/api/reports/sales</code>
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {salesData.length} item{salesData.length === 1 ? "" : "s"} with sales
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5 font-semibold w-16">Rank</th>
                <th className="px-6 py-3.5 font-semibold">Product Name</th>
                <th className="px-6 py-3.5 font-semibold">Units Sold</th>
                <th className="px-6 py-3.5 font-semibold">Total Revenue</th>
                <th className="px-6 py-3.5 font-semibold w-48">Share of Period Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesData.map((item, index) => {
                const totalPeriodRev = periodMetrics.totalSalesRevenue;
                const itemRev = parseFloat(item.totalRevenue) || 0;
                const sharePct = totalPeriodRev > 0 ? Math.round((itemRev / totalPeriodRev) * 100) : 0;

                return (
                  <tr key={item.productId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">ID #{item.productId}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.totalQty.toLocaleString()} units
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatINR(item.totalRevenue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>{sharePct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${sharePct}%` }}
                            className="h-full bg-indigo-600 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {salesData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No product sales registered for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
