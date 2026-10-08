"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/api/reports/dashboard")
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div></div></div></div>;
  if (!data) return <div className="text-red-500">Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
          <Activity size={16} className="text-emerald-500" />
          Live Data Updates
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${Number(data.totalRevenue).toLocaleString()}`}
          icon={<DollarSign size={24} className="text-emerald-600" />}
          trend="+12.5% from last month"
          trendUp={true}
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          icon={<ShoppingCart size={24} className="text-indigo-600" />}
          trend="+5.2% from last month"
          trendUp={true}
        />
        <StatCard
          title="Total Customers"
          value={data.totalCustomers.toLocaleString()}
          icon={<Users size={24} className="text-blue-600" />}
          trend="+18 new this week"
          trendUp={true}
        />
        <StatCard
          title="Active Products"
          value={data.totalProducts.toLocaleString()}
          icon={<Package size={24} className="text-purple-600" />}
          trend="4 items need restock"
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentOrders.map((order: any) => (
                  <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.orderId}</td>
                    <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {data.lowStockItems.length > 0 ? (
              <ul className="space-y-4">
                {data.lowStockItems.map((item: any) => (
                  <li key={item.productId} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500 mt-1">Reorder Level: {item.reorderLevel}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-amber-600">{item.currentStock}</span>
                      <p className="text-xs text-amber-600/80 font-medium uppercase tracking-wider">In Stock</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Package size={24} className="text-emerald-500" />
                </div>
                <p>All inventory levels are healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-gray-50">
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
          }`}>
            {trendUp ? <TrendingUp size={14} className="mr-1" /> : <Activity size={14} className="mr-1" />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
