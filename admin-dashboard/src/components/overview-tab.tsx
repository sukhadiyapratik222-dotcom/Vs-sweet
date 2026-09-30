"use client";

import { useState } from "react";
import { UiConfig, OrderItem, ProductItem, InventoryItem, api } from "@/lib/api";

interface OverviewTabProps {
  config: UiConfig | null;
  orders: OrderItem[];
  products: ProductItem[];
  inventory: { variants: InventoryItem[]; lowStock: InventoryItem[] };
  isStoreOnline: boolean;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export function OverviewTab({
  config,
  orders,
  products,
  inventory,
  isStoreOnline,
  onRefresh,
  onNavigateTab,
}: OverviewTabProps) {
  const [updating, setUpdating] = useState(false);
  const activePhotos = config?.heroPhotos?.filter((p) => p.active !== false).length ?? 0;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const toggleAnnouncement = async () => {
    if (!config) return;
    setUpdating(true);
    try {
      await api.updateUiConfig({
        announcement: {
          ...config.announcement,
          enabled: !config.announcement.enabled,
        },
      });
      onRefresh();
    } catch (err) {
      alert("Failed to toggle announcement");
    } finally {
      setUpdating(false);
    }
  };

  const toggleAutoScroll = async () => {
    if (!config) return;
    setUpdating(true);
    try {
      await api.updateUiConfig({
        heroSettings: {
          ...config.heroSettings,
          autoScroll: !config.heroSettings.autoScroll,
        },
      });
      onRefresh();
    } catch (err) {
      alert("Failed to toggle auto-scroll");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Status Notification */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStoreOnline ? "bg-emerald-400" : "bg-rose-500"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                isStoreOnline ? "bg-emerald-500" : "bg-rose-500"
              }`}
            ></span>
          </span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Storefront Status:{" "}
              <span className={isStoreOnline ? "text-emerald-400" : "text-rose-400"}>
                {isStoreOnline ? "Online & Synchronized (port 3000)" : "Connecting..."}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Admin controls running in dedicated server on <span className="text-[#dfb755] font-mono">http://localhost:3001</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0b2f8a]/80 hover:bg-[#0b2f8a] text-white border border-blue-400/20 transition shadow-sm"
          >
            <span>Visit Customer Store</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onRefresh}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          onClick={() => onNavigateTab("hero")}
          className="cursor-pointer p-5 rounded-2xl glass-card hover:border-[#dfb755]/40 transition duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Hero Scrolling Photos</span>
            <span className="p-2 rounded-xl bg-[#dfb755]/10 text-[#dfb755]">📸</span>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-[#dfb755] transition">
            {activePhotos}{" "}
            <span className="text-xs font-normal text-slate-400">
              / {config?.heroPhotos?.length || 0} active
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Rotation: {config?.heroSettings?.intervalSeconds || 4}s interval</span>
            <span className="text-[#dfb755] font-medium ml-auto">Manage →</span>
          </p>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => onNavigateTab("products")}
          className="cursor-pointer p-5 rounded-2xl glass-card hover:border-[#dfb755]/40 transition duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Products</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">🍬</span>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-[#dfb755] transition">
            {products.length || 0}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>{inventory.variants?.length || 0} weight variants</span>
            <span className="text-[#dfb755] font-medium ml-auto">Catalog →</span>
          </p>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => onNavigateTab("orders")}
          className="cursor-pointer p-5 rounded-2xl glass-card hover:border-[#dfb755]/40 transition duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Orders</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">📦</span>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-[#dfb755] transition">
            {pendingOrders}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>{orders.length} total orders recorded</span>
            <span className="text-[#dfb755] font-medium ml-auto">Orders →</span>
          </p>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => onNavigateTab("products")}
          className="cursor-pointer p-5 rounded-2xl glass-card hover:border-[#dfb755]/40 transition duration-300 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Low Stock Alerts</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-rose-400">
            {inventory.lowStock?.length || 0}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>Stock &lt; 20 units threshold</span>
            <span className="text-[#dfb755] font-medium ml-auto">Restock →</span>
          </p>
        </div>
      </div>

      {/* Quick UI Control Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Switch 1: Announcement Banner */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[#dfb755]/15 text-[#dfb755]">📢</span>
              <div>
                <h3 className="text-base font-semibold text-white">Top Announcement Bar</h3>
                <p className="text-xs text-slate-400">Shows notice at the very top of storefront</p>
              </div>
            </div>
            <button
              onClick={toggleAnnouncement}
              disabled={updating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.announcement?.enabled ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.announcement?.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-[#dfb755] mr-2">
              [{config?.announcement?.badge || "ACTIVE"}]:
            </span>
            {config?.announcement?.text || "No announcement text currently set."}
          </div>
          <button
            onClick={() => onNavigateTab("announcements")}
            className="text-xs text-[#dfb755] hover:underline font-medium inline-flex items-center gap-1"
          >
            Edit Announcement Content & Link →
          </button>
        </div>

        {/* Quick Switch 2: Hero Carousel Auto-Scroll */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[#0b2f8a]/40 text-blue-300">🎠</span>
              <div>
                <h3 className="text-base font-semibold text-white">Photo Scroller Auto-Rotate</h3>
                <p className="text-xs text-slate-400">Cycles photos automatically on the storefront</p>
              </div>
            </div>
            <button
              onClick={toggleAutoScroll}
              disabled={updating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.heroSettings?.autoScroll ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.heroSettings?.autoScroll ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Interval between slides:</span>
            <span className="font-mono text-[#dfb755] font-semibold">
              {config?.heroSettings?.intervalSeconds || 4} seconds
            </span>
          </div>
          <button
            onClick={() => onNavigateTab("hero")}
            className="text-xs text-[#dfb755] hover:underline font-medium inline-flex items-center gap-1"
          >
            Manage Photos, Order & Scroller Settings →
          </button>
        </div>
      </div>

      {/* Live Storefront Quick Preview Strip */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Live Carousel Photos</h3>
            <p className="text-xs text-slate-400">Photos currently live in the customer hero showcase</p>
          </div>
          <button
            onClick={() => onNavigateTab("hero")}
            className="text-xs text-[#dfb755] hover:underline font-medium"
          >
            + Add or Reorder Photos
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {config?.heroPhotos?.map((photo, i) => (
            <div
              key={photo.id || i}
              className={`relative rounded-xl overflow-hidden border p-2 transition ${
                photo.active !== false
                  ? "border-[#dfb755]/30 bg-slate-900/50"
                  : "border-slate-800 bg-slate-950/40 opacity-50"
              }`}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800">
                <img
                  src={photo.image}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                  #{i + 1}
                </span>
              </div>
              <p className="text-xs font-medium text-white truncate mt-1.5">{photo.name}</p>
              <span className="text-[10px] text-slate-400">{photo.category || "Item"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
