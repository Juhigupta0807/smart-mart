"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Box, 
  Users, 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  ArrowUpRight,
  ChevronRight,
  PackageCheck,
  RotateCcw,
  BarChart3,
  FileSpreadsheet
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salesRange, setSalesRange] = useState("Last 7 Days");

  useEffect(() => {
    fetchApi<any>("/api/reports/dashboard")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data load error:", err);
        setLoading(false);
      });
  }, []);

  // Fallback defaults matching design when DB is freshly seeded
  const totalProducts = data?.totalProducts ?? 250;
  const totalOrders = data?.totalOrders ?? 128;
  const totalCustomers = data?.totalCustomers ?? 98;
  const totalRevenue = data?.totalRevenue ? Number(data.totalRevenue).toLocaleString("en-IN") : "24,560";

  // Low stock products (from API or design fallbacks)
  const lowStockProducts = data?.lowStockItems?.length
    ? data.lowStockItems.slice(0, 5)
    : [
        {
          name: "Daawat Basmati Rice 5kg",
          stock: 5,
          reorder: 20,
          image: "https://www.bbassets.com/media/uploads/p/l/255843_21-daawat-super-basmati-5-kg.jpg"
        },
        {
          name: "Amul Taaza Milk 1L",
          stock: 8,
          reorder: 30,
          image: "https://images-na.ssl-images-amazon.com/images/P/B018E0HQPE.01._SCLZZZZZZZ_SX500_.jpg"
        },
        {
          name: "Lays Classic Salted 52g",
          stock: 12,
          reorder: 30,
          image: "https://m.media-amazon.com/images/I/71HqDWJt23L._SL1500_.jpg"
        },
        {
          name: "Fresh Banana 1kg",
          stock: 15,
          reorder: 50,
          image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80"
        },
        {
          name: "Aashirvaad Atta 5kg",
          stock: 18,
          reorder: 40,
          image: "https://cdn.grofers.com/da/cms-assets/cms/product/a79ec60d-7acb-4cbf-bee2-12c135542d7b.jpg"
        },
      ];

  // Recent orders (from API or design mock data)
  const recentOrders = data?.recentOrders?.length
    ? data.recentOrders.map((o: any) => ({
        id: `#${o.orderId}`,
        customer: o.customerName || "Customer",
        items: 4,
        amount: `₹${Number(o.totalAmount).toLocaleString("en-IN")}`,
        status: o.orderStatus,
        date: new Date(o.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      }))
    : [
        { id: "#1087", customer: "Riya Sharma", items: 4, amount: "₹895", status: "Delivered", date: "8 Oct, 04:12 PM" },
        { id: "#1086", customer: "Aarav Mehta", items: 5, amount: "₹1,240", status: "Out for Delivery", date: "8 Oct, 11:30 AM" },
        { id: "#1085", customer: "Sneha Verma", items: 3, amount: "₹560", status: "Processing", date: "7 Oct, 07:45 PM" },
        { id: "#1084", customer: "Karan Gupta", items: 6, amount: "₹1,320", status: "Delivered", date: "7 Oct, 12:10 PM" },
        { id: "#1083", customer: "Ishita Nair", items: 2, amount: "₹745", status: "Cancelled", date: "6 Oct, 09:18 PM" },
      ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCF2DE] text-[#1E743A]">Delivered</span>;
      case "Out for Delivery":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFF0D4] text-[#B07212]">Out for Delivery</span>;
      case "Processing":
      case "Confirmed":
      case "Pending":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#E1EDFF] text-[#2462BD]">Processing</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFE4E4] text-[#CF2C2C]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  // SVG Chart points for Sales Overview curve matching Screenshot 1
  // Points: (0, 160), (80, 140), (160, 95), (240, 120), (320, 80), (400, 35), (460, 85), (540, 50)
  const chartPoints = [
    { x: 30, y: 155, label: "2 Oct", val: "5K" },
    { x: 105, y: 140, label: "3 Oct", val: "6.5K" },
    { x: 180, y: 100, label: "4 Oct", val: "10.2K" },
    { x: 255, y: 122, label: "5 Oct", val: "8.1K" },
    { x: 330, y: 82, label: "6 Oct", val: "12.3K" },
    { x: 405, y: 40, label: "7 Oct", val: "16.8K" },
    { x: 480, y: 88, label: "8 Oct", val: "12K" },
    { x: 555, y: 55, label: "9 Oct", val: "15.4K" },
  ];

  const svgPathD = "M 30,155 Q 70,148 105,140 T 180,100 T 255,122 T 330,82 T 405,40 T 480,88 T 555,55";
  const areaPathD = `${svgPathD} L 555,200 L 30,200 Z`;

  return (
    <div className="space-y-7">
      {/* Page Title & Date Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14231B]">
            Admin <span className="text-[#207B4A]">Dashboard</span>
          </h1>
          <p className="text-sm text-[#66766B] mt-1">
            Overview of your store&apos;s inventory, orders and sales.
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-3 bg-white border border-[#E9E2D5] rounded-2xl px-4 py-2.5 shadow-xs self-start sm:self-auto cursor-pointer hover:border-stone-300 transition-colors">
          <Calendar className="w-4 h-4 text-[#4A5D50]" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-[#7D8F82] tracking-wider leading-none">Today</span>
            <span className="text-xs font-semibold text-[#14231B] leading-tight">8 Oct 2026</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#7D8F82] ml-1" />
        </div>
      </div>

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6 text-[#207B4A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Products</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalProducts}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +12%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEEFEA] flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-[#E45E36]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Orders</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalOrders}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +18%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#3173DC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Customers</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalCustomers}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +10%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FDEDE9] flex items-center justify-center shrink-0">
            <span className="text-2xl font-extrabold text-[#D94F3D]">₹</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Revenue</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">₹{totalRevenue}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +18%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Overview Chart (left) & Low Stock Products (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#14231B]">Sales Overview</h2>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EAE2D4] px-3 py-1.5 rounded-full text-xs font-medium text-[#4A5D50] cursor-pointer">
              <span>{salesRange}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-56 relative pt-2">
            <svg viewBox="0 0 600 230" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#207B4A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#207B4A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1="30" x2="570" y2="30" stroke="#F0EBE1" strokeWidth="1" />
              <line x1="30" y1="85" x2="570" y2="85" stroke="#F0EBE1" strokeWidth="1" />
              <line x1="30" y1="140" x2="570" y2="140" stroke="#F0EBE1" strokeWidth="1" />
              <line x1="30" y1="195" x2="570" y2="195" stroke="#F0EBE1" strokeWidth="1" />

              {/* Y Axis text */}
              <text x="2" y="34" className="text-[10px] fill-[#8B9B90]">20K</text>
              <text x="2" y="89" className="text-[10px] fill-[#8B9B90]">15K</text>
              <text x="2" y="144" className="text-[10px] fill-[#8B9B90]">10K</text>
              <text x="8" y="199" className="text-[10px] fill-[#8B9B90]">5K</text>

              {/* Area fill */}
              <path d={areaPathD} fill="url(#chartGradient)" />

              {/* Trend Line */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#207B4A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {chartPoints.map((pt, i) => (
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

        {/* Low Stock Products */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#14231B]">Low Stock Products</h2>
            <Link
              href="/admin/management"
              className="text-xs font-semibold text-[#207B4A] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium text-left">
                  <th className="pb-2.5 font-medium">Product</th>
                  <th className="pb-2.5 text-center font-medium">Current Stock</th>
                  <th className="pb-2.5 text-center font-medium">Reorder Level</th>
                  <th className="pb-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {lowStockProducts.map((p: any, i: number) => {
                  const name = p.productName || p.name;
                  const currentStock = p.currentStock ?? p.stock;
                  const reorderLevel = p.reorderLevel ?? p.reorder;
                  const img = p.imageUrl || p.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";

                  return (
                    <tr key={i} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-2.5 flex items-center gap-2.5">
                        <img
                          src={img}
                          alt={name}
                          className="w-7 h-7 rounded-md object-contain bg-stone-50 border border-stone-200"
                        />
                        <span className="font-semibold text-[#14231B] truncate max-w-[140px]">{name}</span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-[#D94F3D]">{currentStock}</td>
                      <td className="py-2.5 text-center text-[#5A6C60]">{reorderLevel}</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#FCEAEA] text-[#D94F3D]">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders Table (left) & Quick Actions (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#14231B]">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#207B4A] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 text-center font-medium">Items</th>
                  <th className="pb-3 font-medium">Total Amount</th>
                  <th className="pb-3 text-center font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {recentOrders.map((order: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 font-bold text-[#14231B]">{order.id}</td>
                    <td className="py-3 font-medium text-[#14231B]">{order.customer}</td>
                    <td className="py-3 text-center text-[#5A6C60]">{order.items}</td>
                    <td className="py-3 font-bold text-[#14231B]">{order.amount}</td>
                    <td className="py-3 text-center">{getStatusBadge(order.status)}</td>
                    <td className="py-3 text-right text-[#7D8F82]">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Grid (2x2) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <h2 className="text-base font-bold text-[#14231B] mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Manage Products */}
            <Link
              href="/admin/management"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#207B4A]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5 text-[#207B4A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#207B4A]">
                    Manage Products
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Add, update or remove products</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#207B4A] group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Update Inventory */}
            <Link
              href="/admin/management"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#E45E36]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2EA] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-[#E45E36]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#E45E36]">
                    Update Inventory
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Restock or modify stock levels</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#E45E36] group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* View Orders */}
            <Link
              href="/admin/orders"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#3173DC]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-[#3173DC]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#3173DC]">
                    View Orders
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Track and manage all orders</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#3173DC] group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* View Reports */}
            <Link
              href="/admin/reports"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#8E44AD]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F6EEFA] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-[#8E44AD]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#8E44AD]">
                    View Reports
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Sales, inventory and customer insights</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#8E44AD] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
