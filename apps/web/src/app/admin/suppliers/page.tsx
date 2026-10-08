"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    supplierName: "",
    contactNumber: "",
    email: "",
    address: ""
  });

  const loadSuppliers = () => {
    setLoading(true);
    fetchApi<any[]>("/api/suppliers")
      .then(setSuppliers)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/api/suppliers/${isEditing.supplierId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi("/api/suppliers", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      resetForm();
      loadSuppliers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await fetchApi(`/api/suppliers/${id}`, { method: "DELETE" });
      loadSuppliers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ supplierName: "", contactNumber: "", email: "", address: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Suppliers</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading suppliers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Supplier</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suppliers.map((sup) => (
                    <tr key={sup.supplierId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{sup.supplierName}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{sup.address || "No address provided"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{sup.contactNumber}</div>
                        <div className="text-gray-500 text-xs mt-1">{sup.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button 
                          onClick={() => { 
                            setIsEditing(sup); 
                            setFormData({
                              supplierName: sup.supplierName,
                              contactNumber: sup.contactNumber,
                              email: sup.email || "",
                              address: sup.address || ""
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 transition-colors inline-block"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(sup.supplierId)}
                          className="text-red-600 hover:text-red-900 p-1 transition-colors inline-block"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No suppliers found.</td>
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
                {isEditing ? "Edit Supplier" : "Add New Supplier"}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier Name *</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number *</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                  >
                    {isEditing ? "Save Changes" : "Create Supplier"}
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
