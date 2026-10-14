"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { 
  Package, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  Search, 
  RefreshCw, 
  ArrowRight,
  Filter,
  X,
  Loader2
} from "lucide-react";

interface InventoryItem {
  inventoryId: number;
  productId: number;
  currentStock: number;
  reorderLevel: number;
  lastUpdated: string;
  productName: string;
  categoryName: string;
  supplierName: string;
  isActive: boolean;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [search, setSearch] = useState("");

  // Edit row state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockInput, setStockInput] = useState("");
  const [reorderInput, setReorderInput] = useState("");

  // Notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);

    const params = new URLSearchParams();
    if (onlyLowStock) params.append("lowStock", "true");
    const queryStr = params.toString() ? `?${params.toString()}` : "";

    try {
      const data = await fetchApi<InventoryItem[]>(`/api/inventory${queryStr}`);
      setInventory(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load inventory.";
      setFeedback({ type: "error", message: msg });
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [onlyLowStock]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInventory = useMemo(() => {
    if (!search.trim()) return inventory;
    const q = search.toLowerCase().trim();
    return inventory.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        item.supplierName?.toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const handleStartEdit = (inv: InventoryItem) => {
    setEditingId(inv.productId);
    setStockInput(String(inv.currentStock));
    setReorderInput(String(inv.reorderLevel));
    setFeedback(null);
  };

  const handleSave = async (item: InventoryItem) => {
    const nextStock = Number(stockInput);
    const nextReorder = Number(reorderInput);

    if (isNaN(nextStock) || nextStock < 0 || isNaN(nextReorder) || nextReorder < 0) {
      setFeedback({ type: "error", message: "Stock and reorder level must be non-negative integers." });
      return;
    }

    setActionLoading(true);
    try {
      await fetchApi(`/api/inventory/${item.productId}`, {
        method: "PATCH",
        body: JSON.stringify({ currentStock: nextStock, reorderLevel: nextReorder }),
      });
      setFeedback({ type: "success", message: `Stock updated for "${item.productName}".` });
      setEditingId(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to update inventory.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time warehouse stock, track reorder thresholds, and adjust inventory levels.
          </p>
        </div>

        <button
          onClick={() => loadData()}
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, category, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Low Stock Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              onlyLowStock
                ? "bg-rose-50 text-rose-700 border-rose-200 shadow-2xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle size={14} className={onlyLowStock ? "text-rose-600" : "text-slate-400"} />
            Low Stock Alerts Only
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-indigo-600" />
            Loading warehouse stock...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Product Item</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Current Stock</th>
                  <th className="px-6 py-3.5 font-semibold">Reorder Threshold</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((inv) => {
                  const isLowStock = inv.currentStock <= inv.reorderLevel;
                  const isEditing = editingId === inv.productId;

                  return (
                    <tr
                      key={inv.productId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isLowStock ? "bg-rose-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Package size={16} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{inv.productName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {inv.categoryName} • {inv.supplierName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle size={12} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Healthy
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={stockInput}
                            onChange={(e) => setStockInput(e.target.value)}
                            className="w-24 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span
                            className={`font-bold ${
                              isLowStock ? "text-rose-600" : "text-slate-900"
                            }`}
                          >
                            {inv.currentStock} units
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={reorderInput}
                            onChange={(e) => setReorderInput(e.target.value)}
                            className="w-24 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-slate-600 font-medium">{inv.reorderLevel} units</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleSave(inv)}
                              className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 disabled:opacity-60"
                            >
                              {actionLoading && <Loader2 size={12} className="animate-spin" />}
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(inv)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            Update <ArrowRight size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No inventory records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
