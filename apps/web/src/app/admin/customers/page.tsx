"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Search, Mail, Phone, MapPin, RefreshCw, AlertCircle, X, Users } from "lucide-react";

interface CustomerItem {
  customerId: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchApi<CustomerItem[]>(
        `/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to load customers.";
      setFeedback({ type: "error", message: msg });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse registered customer accounts, contact details, and account creation dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-xs shadow-2xs"
            />
          </div>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-60"
            title="Refresh customers"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className="p-4 rounded-xl text-xs font-medium flex items-center justify-between border bg-rose-50 text-rose-800 border-rose-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden">
        {loading && !customers.length ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-indigo-600" />
            Loading customer accounts...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Customer</th>
                  <th className="px-6 py-3.5 font-semibold">Contact Details</th>
                  <th className="px-6 py-3.5 font-semibold">Registered Address</th>
                  <th className="px-6 py-3.5 font-semibold">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">ID: #{c.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail size={13} className="text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone size={12} className="text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {c.address ? (
                        <div className="flex items-start gap-1.5">
                          <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No address on file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <Users size={28} className="mx-auto text-slate-300 mb-2" />
                      No customers found matching &ldquo;{search}&rdquo;.
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
