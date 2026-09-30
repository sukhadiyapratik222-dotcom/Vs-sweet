"use client";

import { useState } from "react";
import { OrderItem, api } from "@/lib/api";

interface OrdersTabProps {
  orders: OrderItem[];
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  packed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  shipped: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function OrdersTab({ orders, onRefresh }: OrdersTabProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const handleStatusChange = async (orderNumber: string, newStatus: string) => {
    setUpdatingId(orderNumber);
    try {
      await api.updateOrderStatus(orderNumber, newStatus);
      onRefresh();
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📦 Orders & Dispatch Desk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of fresh mithai & farsan deliveries across Vadodara, Ahmedabad, Surat and Anand.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:border-[#dfb755] outline-none self-start sm:self-auto"
        >
          <option value="all">All Orders ({orders.length})</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((order) => {
                const statusStyle =
                  STATUS_COLORS[order.status] || "bg-slate-800 text-slate-300 border-slate-700";

                return (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-white text-xs">
                        {order.orderNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-300 font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400">{order.deliverySlot}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white">{order.guestName || "Registered User"}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {order.guestPhone || "Direct Member"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#dfb755]">
                        ₹{order.total}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 uppercase font-mono text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        disabled={updatingId === order.orderNumber}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                        className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white outline-none focus:border-[#dfb755]"
                      >
                        {["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map(
                          (st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No orders matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
