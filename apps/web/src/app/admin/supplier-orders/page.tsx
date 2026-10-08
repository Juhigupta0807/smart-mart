"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Plus, Edit2, Trash2, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For the create modal/form
  const [showCreate, setShowCreate] = useState(false);
  const [newOrder, setNewOrder] = useState({ supplierId: "", notes: "" });
  const [items, setItems] = useState<{ productId: string; quantity: string; unitCost: string }[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, supRes, prodRes] = await Promise.all([
        fetchApi<any[]>("/api/supplier-orders"),
        fetchApi<any[]>("/api/suppliers"),
        fetchApi<any[]>("/api/products")
      ]);
      setOrders(ordRes);
      setSuppliers(supRes);
      setProducts(prodRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/api/supplier-orders", {
        method: "POST",
        body: JSON.stringify({
          supplierId: Number(newOrder.supplierId),
          notes: newOrder.notes,
          items: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity), unitCost: Number(i.unitCost) }))
        }),
      });
      setShowCreate(false);
      setNewOrder({ supplierId: "", notes: "" });
      setItems([]);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReceive = async (id: number) => {
    if (!confirm("Mark as received? This will update inventory stock.")) return;
    try {
      await fetchApi(`/api/supplier-orders/${id}/receive`, { method: "PATCH" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this purchase order?")) return;
    try {
      await fetchApi(`/api/supplier-orders/${id}/cancel`, { method: "PATCH" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Supplier Purchase Orders</h1>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          {showCreate ? "Cancel" : <><Plus size={16} /> New PO</>}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Purchase Order</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier *</label>
                <select
                  value={newOrder.supplierId}
                  onChange={(e) => setNewOrder({...newOrder, supplierId: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  required
                >
                  <option value="" disabled>Select a supplier...</option>
                  {suppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Order Items *</label>
                <button 
                  type="button"
                  onClick={() => setItems([...items, { productId: "", quantity: "1", unitCost: "0.00" }])}
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].productId = e.target.value;
                        setItems(newItems);
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                      required
                    >
                      <option value="" disabled>Select product...</option>
                      {products.filter(p => !newOrder.supplierId || p.supplierId === Number(newOrder.supplierId)).map(p => (
                        <option key={p.productId} value={p.productId}>{p.productName}</option>
                      ))}
                    </select>
                    <input 
                      type="number" min="1" placeholder="Qty"
                      value={item.quantity} onChange={(e) => { const n=[...items]; n[idx].quantity=e.target.value; setItems(n); }}
                      className="w-20 px-3 py-1.5 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" required
                    />
                    <input 
                      type="number" step="0.01" min="0" placeholder="Unit Cost"
                      value={item.unitCost} onChange={(e) => { const n=[...items]; n[idx].unitCost=e.target.value; setItems(n); }}
                      className="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" required
                    />
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && <div className="text-sm text-gray-500 italic py-2">No items added. Click "+ Add Item" above.</div>}
              </div>
            </div>

            <button type="submit" disabled={items.length === 0} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
              Submit Purchase Order
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading purchase orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">PO ID / Date</th>
                  <th className="px-6 py-4 font-medium">Supplier</th>
                  <th className="px-6 py-4 font-medium">Total Cost</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((po) => (
                  <tr key={po.supplierOrderId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">PO #{po.supplierOrderId}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(po.orderDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {po.supplierName}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      ${Number(po.totalCost).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {po.status === 'Pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock size={12}/> Pending</span>}
                      {po.status === 'Received' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle size={12}/> Received</span>}
                      {po.status === 'Cancelled' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800"><XCircle size={12}/> Cancelled</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {po.status === 'Pending' && (
                        <>
                          <button onClick={() => handleReceive(po.supplierOrderId)} className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-medium border border-emerald-200 transition-colors">
                            Receive
                          </button>
                          <button onClick={() => handleCancel(po.supplierOrderId)} className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded text-xs font-medium border border-rose-200 transition-colors">
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No purchase orders found.</td>
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
