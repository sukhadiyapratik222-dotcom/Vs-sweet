"use client";

import { useState } from "react";
import { ProductItem, InventoryItem, api } from "@/lib/api";

interface ProductsTabProps {
  products: ProductItem[];
  inventory: { variants: InventoryItem[]; lowStock: InventoryItem[] };
  onRefresh: () => void;
}

export function ProductsTab({ products, inventory, onRefresh }: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // New product form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState(1);
  const [newWeight, setNewWeight] = useState("500g");
  const [newPrice, setNewPrice] = useState(350);
  const [newStock, setNewStock] = useState(50);
  const [newImageUrl, setNewImageUrl] = useState("/images/kaju-katli-showcase.jpg");
  const [newDesc, setNewDesc] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const categories = Array.from(new Set(products.map((p) => p.categoryName || "General")));

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.categoryName === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (p: ProductItem) => {
    setEditingId(p.variantId);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  const handleSaveEdit = async (variantId: number, productId: number) => {
    setSaving(true);
    try {
      await api.updateProduct({
        variantId,
        productId,
        price: editPrice,
        stock: editStock,
      });
      setEditingId(null);
      onRefresh();
    } catch {
      alert("Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert("Please enter product name");
    setSaving(true);
    try {
      await api.createProduct({
        name: newTitle.trim(),
        categoryId: newCategoryId,
        weight: newWeight,
        price: newPrice,
        stock: newStock,
        imageUrl: newImageUrl,
        description: newDesc,
        isFeatured,
      });
      setShowAddModal(false);
      setNewTitle("");
      onRefresh();
    } catch (err) {
      alert("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🍬 Products & Inventory Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your authentic Gujarati sweets, live farsan items, pricing, packaging weights, and live stock levels.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#dfb755] to-[#b89130] text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg self-start sm:self-auto"
        >
          + Add New Sweet / Farsan
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by sweet name, farsan, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-3 text-white focus:border-[#dfb755] outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-3 text-white focus:border-[#dfb755] outline-none"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Weight / SKU</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const isEditing = editingId === item.variantId;
                const isLow = item.stock <= 20;

                return (
                  <tr key={`${item.id}-${item.variantId}`} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white truncate max-w-xs">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{item.sku}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.categoryName}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-300">
                      {item.weight}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded bg-slate-900 border border-[#dfb755] text-[#dfb755] outline-none"
                        />
                      ) : (
                        <span className="text-[#dfb755]">₹{item.price}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white outline-none"
                        />
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isLow ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {item.stock} left {isLow && "⚠️"}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {item.isFeatured ? (
                        <span className="text-[10px] font-bold text-[#dfb755]">★ FEATURED</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Regular</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(item.variantId, item.id)}
                            disabled={saving}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px]"
                        >
                          Edit Price/Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Product to Store</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kesar Peda, Fafda Jalebi Combo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none focus:border-[#dfb755]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none"
                  >
                    <option value={1}>Mithai (Pure Ghee)</option>
                    <option value={2}>Live Farsan</option>
                    <option value={3}>Dry Fruits & Namkeen</option>
                    <option value={4}>Festive Hampers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Weight / Pack</label>
                  <input
                    type="text"
                    placeholder="250g, 500g, 1kg"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Traditional recipe prepared with pure cow ghee..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#dfb755]"
                />
                <label htmlFor="featured-check" className="text-slate-300">
                  Feature on Homepage Showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#dfb755] to-[#b89130] text-slate-950 font-bold"
                >
                  {saving ? "Adding..." : "Add to Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
