"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { formatINR } from "@/lib/format";
import ConfirmModal from "@/components/ui/confirm-modal";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Loader2,
  X
} from "lucide-react";

interface ProductItem {
  productId: number;
  productName: string;
  description: string | null;
  price: string;
  expiryDate: string | null;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: number;
  supplierId: number;
  createdAt: string;
  categoryName: string;
  supplierName: string;
  currentStock: number;
  reorderLevel: number;
}

interface CategoryOption {
  categoryId: number;
  categoryName: string;
}

interface SupplierOption {
  supplierId: number;
  supplierName: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter controls
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Notification banners
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form & Edit state
  const [isEditing, setIsEditing] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    categoryId: "",
    supplierId: "",
    isActive: true,
    initialStock: "0",
    reorderLevel: "10",
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);

    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (selectedCategory) params.append("categoryId", selectedCategory);
    if (selectedStatus) params.append("isActive", selectedStatus);

    const queryStr = params.toString() ? `?${params.toString()}` : "";

    try {
      const [prods, cats, sups] = await Promise.all([
        fetchApi<ProductItem[]>(`/api/products${queryStr}`),
        fetchApi<CategoryOption[]>("/api/categories"),
        fetchApi<SupplierOption[]>("/api/suppliers"),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setSuppliers(Array.isArray(sups) ? sups : []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load products.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    try {
      if (isEditing) {
        await fetchApi(`/api/products/${isEditing.productId}`, {
          method: "PATCH",
          body: JSON.stringify({
            productName: formData.productName,
            description: formData.description,
            price: formData.price,
            categoryId: formData.categoryId,
            supplierId: formData.supplierId,
            isActive: formData.isActive,
          }),
        });
        setFeedback({ type: "success", message: `Product "${formData.productName}" updated successfully.` });
      } else {
        await fetchApi("/api/products", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setFeedback({ type: "success", message: `Product "${formData.productName}" created successfully.` });
      }
      resetForm();
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save product.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await fetchApi(`/api/products/${deleteTarget.productId}`, { method: "DELETE" });
      setFeedback({ type: "success", message: `Product "${deleteTarget.productName}" deleted successfully.` });
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete product.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (prod: ProductItem) => {
    setIsEditing(prod);
    setFormData({
      productName: prod.productName,
      description: prod.description || "",
      price: prod.price,
      categoryId: String(prod.categoryId),
      supplierId: String(prod.supplierId),
      isActive: prod.isActive,
      initialStock: String(prod.currentStock ?? 0),
      reorderLevel: String(prod.reorderLevel ?? 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      productName: "",
      description: "",
      price: "",
      categoryId: "",
      supplierId: "",
      isActive: true,
      initialStock: "0",
      reorderLevel: "10",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your store inventory, pricing, categories, and stock thresholds.
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
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Grid: Products Table (2 Cols) + Add/Edit Form (1 Col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search by Name */}
              <div className="relative sm:col-span-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-indigo-600" />
                Loading product catalog...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">Product</th>
                      <th className="px-6 py-3.5 font-semibold">Price</th>
                      <th className="px-6 py-3.5 font-semibold">Stock</th>
                      <th className="px-6 py-3.5 font-semibold">Status</th>
                      <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => {
                      const isLowStock = prod.currentStock <= prod.reorderLevel;

                      return (
                        <tr key={prod.productId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/70 shrink-0 overflow-hidden">
                                {prod.imageUrl ? (
                                  <img src={prod.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon size={18} className="text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{prod.productName}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {prod.categoryName} • {prod.supplierName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {formatINR(prod.price)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isLowStock
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "text-slate-800"
                              }`}
                            >
                              {prod.currentStock} units
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                prod.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {prod.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditClick(prod)}
                              title="Edit product"
                              className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(prod)}
                              title="Delete product"
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          <Package size={28} className="mx-auto text-slate-300 mb-2" />
                          No products found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Form Panel */}
        <div>
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden sticky top-20">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {isEditing ? <Edit2 size={16} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
                {isEditing ? `Edit: ${isEditing.productName}` : "Add New Product"}
              </h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="p-5">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Organic Almond Milk"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="" disabled>Select...</option>
                      {categories.map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                    <select
                      required
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="" disabled>Select...</option>
                      {suppliers.map((s) => (
                        <option key={s.supplierId} value={s.supplierId}>
                          {s.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isEditing && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialStock}
                        onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short product details..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {actionLoading && <Loader2 size={14} className="animate-spin" />}
                    <span>{isEditing ? "Save Product Changes" : "Create Product"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Destructive Delete */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.productName}"? This action will permanently remove the product and its associated inventory records.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
