"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    categoryId: "",
    supplierId: "",
    isActive: true,
    initialStock: "0",
    reorderLevel: "10"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, sups] = await Promise.all([
        fetchApi<any[]>("/api/products"),
        fetchApi<any[]>("/api/categories"),
        fetchApi<any[]>("/api/suppliers")
      ]);
      setProducts(prods);
      setCategories(cats);
      setSuppliers(sups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/api/products/${isEditing.productId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi("/api/products", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetchApi(`/api/products/${id}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ 
      productName: "", description: "", price: "", categoryId: "", supplierId: "", isActive: true, initialStock: "0", reorderLevel: "10" 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading products...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((prod) => (
                    <tr key={prod.productId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                            {prod.imageUrl ? (
                              <img src={prod.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ImageIcon size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{prod.productName}</div>
                            <div className="text-xs text-gray-500">{prod.categoryName} • {prod.supplierName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">${Number(prod.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${prod.currentStock <= prod.reorderLevel ? 'text-rose-600' : 'text-gray-900'}`}>
                          {prod.currentStock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prod.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prod.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => { 
                            setIsEditing(prod); 
                            setFormData({
                              productName: prod.productName,
                              description: prod.description || "",
                              price: prod.price,
                              categoryId: String(prod.categoryId),
                              supplierId: String(prod.supplierId),
                              isActive: prod.isActive,
                              initialStock: String(prod.currentStock),
                              reorderLevel: String(prod.reorderLevel),
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 transition-colors inline-block"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod.productId)}
                          className="text-red-600 hover:text-red-900 p-1 transition-colors inline-block"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {isEditing ? <Edit2 size={20} className="text-indigo-600"/> : <Plus size={20} className="text-indigo-600"/>}
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === "true"})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      required
                    >
                      <option value="" disabled>Select...</option>
                      {categories.map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier *</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      required
                    >
                      <option value="" disabled>Select...</option>
                      {suppliers.map((s) => (
                        <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isEditing && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialStock}
                        onChange={(e) => setFormData({...formData, initialStock: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Reorder Level</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({...formData, reorderLevel: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  >
                    {isEditing ? "Save Changes" : "Create Product"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
