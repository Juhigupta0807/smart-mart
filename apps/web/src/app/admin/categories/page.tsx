"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");

  const loadCategories = () => {
    setLoading(true);
    fetchApi<any[]>("/api/categories")
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/api/categories/${isEditing.categoryId}`, {
          method: "PATCH",
          body: JSON.stringify({ categoryName }),
        });
      } else {
        await fetchApi("/api/categories", {
          method: "POST",
          body: JSON.stringify({ categoryName }),
        });
      }
      setCategoryName("");
      setIsEditing(null);
      loadCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await fetchApi(`/api/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{cat.categoryId}</td>
                    <td className="px-6 py-4 text-gray-900">{cat.categoryName}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => { setIsEditing(cat); setCategoryName(cat.categoryName); }}
                        className="text-indigo-600 hover:text-indigo-900 p-1 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.categoryId)}
                        className="text-red-600 hover:text-red-900 p-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {isEditing ? <Edit2 size={20} className="text-indigo-600"/> : <Plus size={20} className="text-indigo-600"/>}
                {isEditing ? "Edit Category" : "Add New Category"}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  >
                    {isEditing ? "Save Changes" : "Create"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => { setIsEditing(null); setCategoryName(""); }}
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
