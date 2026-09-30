"use client";

import { useState } from "react";
import { UiConfig, HeroPhoto, api } from "@/lib/api";

interface HeroScrollerTabProps {
  config: UiConfig | null;
  onRefresh: () => void;
}

const PRESET_IMAGES = [
  { name: "Kaju Katli (Silver Foil Luxury)", url: "/images/kaju-katli-showcase.jpg", category: "Mithai" },
  { name: "Motichoor Ladoo (Pure Ghee)", url: "/images/motichoor-showcase.jpg", category: "Mithai" },
  { name: "Nylon Khaman (Live Morning Steamed)", url: "/images/khaman-showcase.jpg", category: "Farsan" },
  { name: "Surati Khandvi (Tempered Rolls)", url: "/images/khandvi-showcase.jpg", category: "Farsan" },
  { name: "Shahi Mithai Platter (Royal Hamper)", url: "/images/mithai-platter-showcase.jpg", category: "Festive" },
  { name: "Mithai Wide Row Banner", url: "/images/mithai-row-banner.png", category: "Banner" },
];

export function HeroScrollerTab({ config, onRefresh }: HeroScrollerTabProps) {
  const [photos, setPhotos] = useState<HeroPhoto[]>(config?.heroPhotos || []);
  const [autoScroll, setAutoScroll] = useState<boolean>(config?.heroSettings?.autoScroll ?? true);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(config?.heroSettings?.intervalSeconds ?? 4);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New photo form state
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("/images/kaju-katli-showcase.jpg");
  const [newCategory, setNewCategory] = useState("Mithai");

  // Save changes to storefront API
  const handleSaveAll = async (updatedPhotos = photos, updatedAuto = autoScroll, updatedInterval = intervalSeconds) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await api.updateUiConfig({
        heroPhotos: updatedPhotos,
        heroSettings: {
          autoScroll: updatedAuto,
          intervalSeconds: updatedInterval,
        },
      });
      setFeedback({
        message: "✅ Successfully saved! Customer storefront (http://localhost:3000) updated live.",
        type: "success",
      });
      onRefresh();
    } catch (err) {
      setFeedback({
        message: "❌ Failed to save changes to storefront server.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = (index: number) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], active: !updated[index].active };
    setPhotos(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    // update order field
    updated.forEach((p, idx) => (p.order = idx + 1));
    setPhotos(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === photos.length - 1) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    updated.forEach((p, idx) => (p.order = idx + 1));
    setPhotos(updated);
  };

  const handleDelete = (index: number) => {
    if (!confirm("Are you sure you want to remove this photo from the scroller?")) return;
    const updated = photos.filter((_, idx) => idx !== index);
    updated.forEach((p, idx) => (p.order = idx + 1));
    setPhotos(updated);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newImage.trim()) {
      alert("Please provide a photo name and image URL.");
      return;
    }

    const newPhoto: HeroPhoto = {
      id: "photo-" + Date.now(),
      name: newName.trim(),
      image: newImage.trim(),
      category: newCategory,
      active: true,
      order: photos.length + 1,
    };

    const updated = [...photos, newPhoto];
    setPhotos(updated);
    setNewName("");
    handleSaveAll(updated);
  };

  return (
    <div className="space-y-8">
      {/* Tab Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📸 Hero Photo Scroller Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage the scrolling photos displayed on the customer-facing hero section. All text labels have been removed from the photos for clean visual browsing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#dfb755] to-[#b89130] text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg flex items-center gap-2"
          >
            {isSaving ? "Saving to Store..." : "Save All to Storefront"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Scroller Global Settings */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#dfb755]">
          🎠 Scroller Behavior & Speed Controls
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          {/* Setting 1: Auto-Scroll Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-sm font-medium text-white">Auto-Scroll</p>
              <p className="text-xs text-slate-400">Automatically cycles slides</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoScroll ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoScroll ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Interval Speed */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Rotation Interval</span>
              <span className="text-[#dfb755] font-bold font-mono">{intervalSeconds}s per photo</span>
            </div>
            <select
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(Number(e.target.value))}
              className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 p-2 text-white"
            >
              <option value={2}>Fast (2 seconds)</option>
              <option value={3}>Brisk (3 seconds)</option>
              <option value={4}>Smooth Recommended (4 seconds)</option>
              <option value={5}>Relaxed (5 seconds)</option>
              <option value={8}>Slow Showcase (8 seconds)</option>
            </select>
          </div>

          {/* Setting 3: Total Slides Count */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Active in Carousel</p>
              <p className="text-2xl font-bold text-white mt-1">
                {photos.filter((p) => p.active !== false).length}{" "}
                <span className="text-xs font-normal text-slate-500">/ {photos.length} total</span>
              </p>
            </div>
            <span className="text-2xl">📸</span>
          </div>
        </div>
      </div>

      {/* Photos List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Current Scroller Photos ({photos.length})
          </h3>
          <span className="text-xs text-slate-400">Use arrows to adjust order position</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {photos.map((photo, index) => {
            const isActive = photo.active !== false;
            return (
              <div
                key={photo.id || index}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card transition border ${
                  isActive
                    ? "border-slate-800 bg-slate-900/70"
                    : "border-slate-900 bg-slate-950/40 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Position badge */}
                  <span className="h-8 w-8 rounded-xl bg-slate-800 text-[#dfb755] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>

                  {/* Image preview */}
                  <div className="h-16 w-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 relative">
                    <img
                      src={photo.image}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Photo Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">{photo.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {photo.category || "Sweets"}
                      </span>
                      {!isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate max-w-xs sm:max-w-sm mt-1">
                      {photo.image}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Reorder Up */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move earlier in carousel"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800/80 transition"
                  >
                    ▲
                  </button>

                  {/* Reorder Down */}
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === photos.length - 1}
                    title="Move later in carousel"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800/80 transition"
                  >
                    ▼
                  </button>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(index)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {isActive ? "Active" : "Hidden"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(index)}
                    title="Delete photo"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Photo Form */}
      <div className="p-6 rounded-2xl glass-panel space-y-4 border border-white/10">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>➕ Add New Photo to Scroller</span>
        </h3>
        <p className="text-xs text-slate-400">
          Add any new product or promotional banner photo to your live carousel.
        </p>

        <form onSubmit={handleAddPhoto} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Photo Title / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kesar Peda, Anjeer Roll"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              >
                <option value="Mithai">Mithai (Pure Ghee Sweets)</option>
                <option value="Farsan">Farsan (Snacks & Savouries)</option>
                <option value="Festive">Festive Hampers & Gifts</option>
                <option value="Special">Special Daily Live</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Image URL or Path
              </label>
              <input
                type="text"
                placeholder="/images/... or https://..."
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none font-mono"
              />
            </div>
          </div>

          {/* Quick presets picker */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">
              Or pick from high-res image library:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNewImage(preset.url);
                    if (!newName) setNewName(preset.name.split(" ")[0]);
                  }}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition ${
                    newImage === preset.url
                      ? "bg-[#dfb755]/20 border-[#dfb755] text-[#dfb755]"
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-[#0b2f8a] hover:bg-[#1a44b5] text-white transition shadow-md"
            >
              + Add to Scroller & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
