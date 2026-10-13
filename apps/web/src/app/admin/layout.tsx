"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Tags, 
  PackageSearch, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  Truck, 
  FileText,
  LogOut 
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: PackageSearch },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { href: "/admin/supplier-orders", label: "Supplier Orders", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  // In apps/web/src/app/admin/layout.tsx
useEffect(() => {
  fetchApi<any>("/api/admin/me")
    .then((data) => setAdmin(data))
    .catch(() => router.push("/admin/login"));
}, [router]);

const handleLogout = async () => {
  try {
    await authClient.signOut();
    router.push("/admin/login");
  } catch (err) {
    console.error(err);
  }
};


  if (!admin && pathname !== "/admin/login") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
  }

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SmartMart</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={20} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 px-3 flex flex-col">
            <span className="text-sm font-semibold text-gray-900">{admin?.name}</span>
            <span className="text-xs text-gray-500 truncate">{admin?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
