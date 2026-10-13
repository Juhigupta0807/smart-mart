"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  ChevronDown, 
  Box, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag 
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("Last 30 Days");

  useEffect(() => {
    Promise.all([
      fetchApi<any>("/api/reports/dashboard").catch(() => null),
      fetchApi<any[]>("/api/reports/sales").catch(() => []),
    ])
      .then(([dash, sales]) => {
        setData(dash);
        setSalesData(sales || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = data?.totalRevenue
    ? Number(data.totalRevenue).toLocaleString("en-IN")
    : "24,560";
  const totalOrders = data?.totalOrders ?? 128;
  const totalCustomers = data?.totalCustomers ?? 98;
  const averageOrderValue = 192;

  // Category distribution data (Screen 3)
  const categorySales = [
    { name: "Grains", amount: "8,920", pct: 36, color: "#207B4A" },
    { name: "Dairy", amount: "5,240", pct: 21, color: "#3173DC" },
    { name: "Snacks", amount: "3,420", pct: 14, color: "#E59E28" },
    { name: "Fruits", amount: "2,960", pct: 12, color: "#E45E36" },
    { name: "Beverages", amount: "2,120", pct: 9, color: "#C0392B" },
    { name: "Others", amount: "1,900", pct: 8, color: "#8E44AD" },
  ];

  // Order status distribution
  const orderStatuses = [
    { name: "Delivered", count: 78, pct: 61, color: "#207B4A" },
    { name: "Out for Delivery", count: 22, pct: 17, color: "#E59E28" },
    { name: "Processing", count: 18, pct: 14, color: "#3173DC" },
    { name: "Cancelled", count: 10, pct: 8, color: "#C0392B" },
  ];

  // Top selling products table
  const topProducts = [
    {
      rank: 1,
      name: "Amul Taaza Milk 1L",
      category: "Dairy",
      units: 320,
      revenue: "₹21,760",
      image: "https://images-na.ssl-images-amazon.com/images/P/B018E0HQPE.01._SCLZZZZZZZ_SX500_.jpg",
    },
    {
      rank: 2,
      name: "Daawat Basmati Rice 5kg",
      category: "Grains",
      units: 180,
      revenue: "₹89,820",
      image: "https://www.bbassets.com/media/uploads/p/l/255843_21-daawat-super-basmati-5-kg.jpg",
    },
    {
      rank: 3,
      name: "Lays Classic Salted 52g",
      category: "Snacks",
      units: 150,
      revenue: "₹3,000",
      image: "https://m.media-amazon.com/images/I/71HqDWJt23L._SL1500_.jpg",
    },
    {
      rank: 4,
      name: "Fresh Banana 1kg",
      category: "Fruits",
      units: 120,
      revenue: "₹4,800",
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
    },
    {
      rank: 5,
      name: "Nestle Maggi 70g",
      category: "Noodles",
      units: 110,
      revenue: "₹1,540",
      image: "https://m.media-amazon.com/images/I/71wK8nS4FzL._SL1500_.jpg",
    },
  ];

  // Recent Orders table
  const recentOrders = [
    { id: "#1087", customer: "Riya Sharma", amount: "895", status: "Delivered", date: "8 Oct, 04:12 PM" },
    { id: "#1086", customer: "Aarav Mehta", amount: "1,240", status: "Out for Delivery", date: "8 Oct, 11:30 AM" },
    { id: "#1085", customer: "Sneha Verma", amount: "560", status: "Processing", date: "7 Oct, 07:45 PM" },
    { id: "#1084", customer: "Karan Gupta", amount: "1,320", status: "Delivered", date: "7 Oct, 12:10 PM" },
    { id: "#1083", customer: "Ishita Nair", amount: "745", status: "Cancelled", date: "6 Oct, 09:18 PM" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCF2DE] text-[#1E743A]">Delivered</span>;
      case "Out for Delivery":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFF0D4] text-[#B07212]">Out for Delivery</span>;
      case "Processing":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#E1EDFF] text-[#2462BD]">Processing</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFE4E4] text-[#CF2C2C]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  // Helper for donut chart SVG path arcs
  const createDonutSegments = (items: { pct: number; color: string }[], radius: number, strokeWidth: number) => {
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return items.map((item, idx) => {
      const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += (item.pct / 100) * circumference;

      return (
        <circle
          key={idx}
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke={item.color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 80 80)"
        />
      );
    });
  };

  return (
    <div className="space-y-7">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14231B]">
            Reports &amp; <span className="text-[#207B4A]">Analytics</span>
          </h1>
          <p className="text-sm text-[#66766B] mt-1">
            Get insights into your store&apos;s sales, inventory and customer activity.
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-3 bg-white border border-[#E9E2D5] rounded-2xl px-4 py-2.5 shadow-xs self-start sm:self-auto cursor-pointer hover:border-stone-300 transition-colors">
          <Calendar className="w-4 h-4 text-[#4A5D50]" />
          <span className="text-xs font-semibold text-[#14231B]">{timeRange}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#7D8F82] ml-1" />
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-[#207B4A]">₹</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Revenue</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">₹{totalRevenue}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 18%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-[#3173DC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Orders</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalOrders}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 12%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEEFEA] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#E45E36]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Customers</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalCustomers}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 10%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF6E9] flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-[#D9822B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Average Order Value</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">₹{averageOrderValue}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 8%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Trend (Left 7 cols) & Category-wise Sales Donut (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#14231B]">Sales Trend</h2>
              <p className="text-xs text-[#7D8F82]">Total revenue for the last 7 days.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EAE2D4] px-3 py-1.5 rounded-full text-xs font-medium text-[#4A5D50] cursor-pointer">
              <span>Last 7 Days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="w-full h-56 relative pt-2">
            <svg viewBox="0 0 600 230" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#207B4A" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#207B4A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="30" y1="30" x2="570" y2="30" stroke="#F0EBE1" strokeWidth="1" />
              <line x1="30" y1="85" x2="570" y2="85" stroke="#F0EBE1" strokeWidth="1" />
              <line x1="30" y1="140" x2="570" y2="140" stroke="#F0EBE1" strokeWidth="1" />
              <line x1="30" y1="195" x2="570" y2="195" stroke="#F0EBE1" strokeWidth="1" />

              <text x="2" y="34" className="text-[10px] fill-[#8B9B90]">20K</text>
              <text x="2" y="89" className="text-[10px] fill-[#8B9B90]">15K</text>
              <text x="2" y="144" className="text-[10px] fill-[#8B9B90]">10K</text>
              <text x="8" y="199" className="text-[10px] fill-[#8B9B90]">5K</text>

              <path
                d="M 30,155 Q 70,148 105,140 T 180,100 T 255,122 T 330,82 T 405,40 T 480,88 T 555,55 L 555,200 L 30,200 Z"
                fill="url(#trendGradient)"
              />
              <path
                d="M 30,155 Q 70,148 105,140 T 180,100 T 255,122 T 330,82 T 405,40 T 480,88 T 555,55"
                fill="none"
                stroke="#207B4A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                { x: 30, y: 155, label: "2 Oct" },
                { x: 105, y: 140, label: "3 Oct" },
                { x: 180, y: 100, label: "4 Oct" },
                { x: 255, y: 122, label: "5 Oct" },
                { x: 330, y: 82, label: "6 Oct" },
                { x: 405, y: 40, label: "7 Oct" },
                { x: 480, y: 88, label: "8 Oct" },
                { x: 555, y: 55, label: "9 Oct" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#207B4A" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={pt.x} y="222" textAnchor="middle" className="text-[11px] fill-[#7D8F82]">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Category-wise Sales (Donut + Legend) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-[#14231B]">Category-wise Sales</h2>
              <p className="text-xs text-[#7D8F82]">Sales distribution across product categories.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EAE2D4] px-3 py-1.5 rounded-full text-xs font-medium text-[#4A5D50] cursor-pointer">
              <span>Last 30 Days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {createDonutSegments(categorySales, 55, 22)}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-[#14231B]">₹24,560</span>
                <span className="text-[10px] text-[#7D8F82]">Total Sales</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {categorySales.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-[#4A5D50]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#14231B]">
                    <span>₹{cat.amount}</span>
                    <span className="text-[#7D8F82] font-normal text-[11px]">({cat.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products (Left 7 cols) & Order Status Overview + Recent Orders (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14231B]">Top Selling Products</h2>
            <p className="text-xs text-[#7D8F82]">Products with highest units sold.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                  <th className="pb-3 w-8">#</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 text-center font-medium">Units Sold</th>
                  <th className="pb-3 text-right font-medium">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {topProducts.map((p) => (
                  <tr key={p.rank} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 font-bold text-[#7D8F82]">{p.rank}.</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-8 h-8 rounded-md object-contain bg-stone-50 border border-stone-200"
                        />
                        <span className="font-semibold text-[#14231B]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-[#4A5D50]">{p.category}</td>
                    <td className="py-3 text-center font-bold text-[#14231B]">{p.units}</td>
                    <td className="py-3 text-right font-bold text-[#14231B]">{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Order Status Overview + Recent Orders */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Status Donut Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
            <div className="mb-3">
              <h2 className="text-base font-bold text-[#14231B]">Order Status Overview</h2>
              <p className="text-xs text-[#7D8F82]">Distribution of order statuses.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full">
                  {createDonutSegments(orderStatuses, 52, 20)}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-[#14231B]">128</span>
                  <span className="text-[10px] text-[#7D8F82]">Total Orders</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2 text-xs">
                {orderStatuses.map((st) => (
                  <div key={st.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: st.color }}
                      />
                      <span className="font-medium text-[#4A5D50]">{st.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-[#14231B]">
                      <span>{st.count}</span>
                      <span className="text-[#7D8F82] font-normal text-[11px]">({st.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders small table */}
          <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#14231B]">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-[#207B4A] hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Amount (₹)</th>
                    <th className="pb-2 text-center font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F2EC]">
                  {recentOrders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-2.5 font-bold text-[#14231B]">{ord.id}</td>
                      <td className="py-2.5 font-medium text-[#14231B]">{ord.customer}</td>
                      <td className="py-2.5 font-bold text-[#14231B]">{ord.amount}</td>
                      <td className="py-2.5 text-center">{getStatusBadge(ord.status)}</td>
                      <td className="py-2.5 text-right text-[#7D8F82]">{ord.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
