"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UiConfig,
  OrderItem,
  ProductItem,
  InventoryItem,
  api,
} from "@/lib/api";
import { OverviewTab } from "@/components/overview-tab";
import { HeroScrollerTab } from "@/components/hero-scroller-tab";
import { AnnouncementsTab } from "@/components/announcements-tab";
import { StoreBrandingTab } from "@/components/store-branding-tab";
import { ProductsTab } from "@/components/products-tab";
import { OrdersTab } from "@/components/orders-tab";
import { LivePreviewTab } from "@/components/live-preview-tab";

type TabId =
  | "overview"
  | "hero"
  | "announcements"
  | "branding"
  | "products"
  | "orders"
  | "preview";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [config, setConfig] = useState<UiConfig | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [inventory, setInventory] = useState<{
    variants: InventoryItem[];
    lowStock: InventoryItem[];
  }>({ variants: [], lowStock: [] });
  const [isStoreOnline, setIsStoreOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const online = await api.checkConnection();
    setIsStoreOnline(online);

    if (online) {
      try {
        const [cfg, ords, prods, inv] = await Promise.all([
          api.getUiConfig().catch(() => null),
          api.getOrders().catch(() => []),
          api.getProducts().catch(() => []),
          api.getInventory().catch(() => ({ variants: [], lowStock: [] })),
        ]);
        if (cfg) setConfig(cfg);
        setOrders(ords);
        setProducts(prods);
        setInventory(inv);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    // Background polling every 15 seconds to keep data synchronized
    const timer = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(timer);
  }, [loadData]);

  const navItems: { id: TabId; label: string; icon: string; badge?: string | number }[] = [
    { id: "overview", label: "Dashboard", icon: "🌟" },
    {
      id: "hero",
      label: "Hero Photo Scroller",
      icon: "📸",
      badge: config?.heroPhotos?.filter((p) => p.active !== false).length,
    },
    { id: "announcements", label: "Banners & Promos", icon: "📢" },
    { id: "branding", label: "Store Identity", icon: "🏛️" },
    {
      id: "products",
      label: "Products & Stock",
      icon: "🍬",
      badge: inventory.lowStock?.length ? `⚠️ ${inventory.lowStock.length}` : undefined,
    },
    {
      id: "orders",
      label: "Orders Desk",
      icon: "📦",
      badge: orders.filter((o) => o.status === "pending").length || undefined,
    },
    { id: "preview", label: "Live Store Preview", icon: "👁️" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 glass-panel border-r border-white/10 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#dfb755] via-[#b89130] to-[#0b2f8a] flex items-center justify-center shadow-lg text-lg">
                👑
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white uppercase">
                  Vardayini Sweets
                </h1>
                <p className="text-[10px] font-semibold text-[#dfb755] uppercase tracking-widest">
                  Karigar UI Admin Desk
                </p>
              </div>
            </div>

            {/* Server indicator */}
            <div className="mt-4 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] flex items-center justify-between">
              <span className="text-slate-400">Server:</span>
              <span className="font-mono text-[#dfb755] font-semibold">Port 3001 (Isolated)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#0b2f8a] to-[#1e40af] text-white shadow-md border border-blue-400/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-850/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-[#dfb755] text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Storefront Link */}
        <div className="pt-6 border-t border-slate-800 mt-6 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Customer Store:</span>
            <span
              className={`font-semibold ${
                isStoreOnline ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isStoreOnline ? "● Connected (3000)" : "● Offline"}
            </span>
          </div>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#dfb755]/15 hover:bg-[#dfb755]/25 text-[#dfb755] border border-[#dfb755]/30 transition"
          >
            <span>Launch Storefront ↗</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {isLoading && !config ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#dfb755]"></div>
              <p className="text-xs text-slate-400 font-medium">Connecting to Storefront Server...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                config={config}
                orders={orders}
                products={products}
                inventory={inventory}
                isStoreOnline={isStoreOnline}
                onRefresh={loadData}
                onNavigateTab={(tab) => setActiveTab(tab as TabId)}
              />
            )}

            {activeTab === "hero" && (
              <HeroScrollerTab config={config} onRefresh={loadData} />
            )}

            {activeTab === "announcements" && (
              <AnnouncementsTab config={config} onRefresh={loadData} />
            )}

            {activeTab === "branding" && (
              <StoreBrandingTab config={config} onRefresh={loadData} />
            )}

            {activeTab === "products" && (
              <ProductsTab
                products={products}
                inventory={inventory}
                onRefresh={loadData}
              />
            )}

            {activeTab === "orders" && (
              <OrdersTab orders={orders} onRefresh={loadData} />
            )}

            {activeTab === "preview" && <LivePreviewTab />}
          </>
        )}
      </main>
    </div>
  );
}
