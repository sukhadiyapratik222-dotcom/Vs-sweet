"use client";

import { useState } from "react";
import { UiConfig, api } from "@/lib/api";

interface AnnouncementsTabProps {
  config: UiConfig | null;
  onRefresh: () => void;
}

export function AnnouncementsTab({ config, onRefresh }: AnnouncementsTabProps) {
  const [enabled, setEnabled] = useState(config?.announcement?.enabled ?? true);
  const [badge, setBadge] = useState(config?.announcement?.badge ?? "DIWALI PRE-ORDERS OPEN");
  const [text, setText] = useState(
    config?.announcement?.text ??
      "Get 15% off pure ghee festive gift boxes with code FESTIVE15 • Same-day dispatch across Gujarat"
  );
  const [linkText, setLinkText] = useState(config?.announcement?.linkText ?? "Order Hampers →");
  const [linkUrl, setLinkUrl] = useState(config?.announcement?.linkUrl ?? "/shop?category=hampers");

  // Promo coupon
  const [couponCode, setCouponCode] = useState(config?.promotions?.couponCode ?? "FESTIVE15");
  const [discountPercent, setDiscountPercent] = useState(config?.promotions?.discountPercent ?? 15);
  const [promoDesc, setPromoDesc] = useState(
    config?.promotions?.description ?? "Flat 15% discount on all orders above ₹999"
  );
  const [promoActive, setPromoActive] = useState(config?.promotions?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateUiConfig({
        announcement: {
          enabled,
          badge,
          text,
          linkText,
          linkUrl,
        },
        promotions: {
          couponCode,
          discountPercent: Number(discountPercent),
          description: promoDesc,
          isActive: promoActive,
        },
      });
      setFeedback("✅ Banners & Announcement configuration saved to storefront!");
      onRefresh();
    } catch {
      setFeedback("❌ Failed to update announcement on storefront.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="p-6 rounded-2xl glass-panel border border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📢 Banners & Announcements Manager</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure the top alert banner and promotional discounts that customers see across all pages on your store.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-xs font-medium bg-slate-900 border border-[#dfb755]/30 text-[#dfb755]">
          {feedback}
        </div>
      )}

      {/* Live Preview of the Banner */}
      <div className="p-6 rounded-2xl glass-card space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#dfb755]">
          Live Top Banner Preview
        </h3>
        <div className="rounded-xl overflow-hidden shadow-inner border border-white/10">
          <div className="bg-[#0b2f8a] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="hidden sm:inline text-white/80 font-medium">
              Vadodara · Since 1976 · 100% Shuddh Desi Ghee
            </span>
            <span className="mx-auto sm:mx-0 font-medium text-[#dfb755] flex items-center gap-2 text-center">
              {badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dfb755] text-slate-950 uppercase">
                  {badge}
                </span>
              )}
              <span>{text}</span>
            </span>
            <span className="hidden md:inline text-white/80 font-mono text-[11px]">
              Call: +91 98250 19760
            </span>
          </div>
        </div>
        {!enabled && (
          <p className="text-xs text-rose-400 font-medium">
            ⚠️ Note: The banner is currently DISABLED and hidden from customers.
          </p>
        )}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Top Announcement Bar */}
        <div className="p-6 rounded-2xl glass-panel space-y-5 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Top Announcement Bar</h3>
              <p className="text-xs text-slate-400">Controls the marquee notice at the very top of header</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">{enabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Badge Tag (e.g. DIWALI SPECIAL, FRESH BATCH)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="DIWALI SPECIAL"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Call to Action Button / Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Order Hampers →"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Main Announcement Message
              </label>
              <textarea
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter message for customers..."
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Promotional Coupon & Discount */}
        <div className="p-6 rounded-2xl glass-panel space-y-5 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Promotional Coupon & Discount</h3>
              <p className="text-xs text-slate-400">Coupon code automatically eligible at checkout</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">{promoActive ? "Active" : "Paused"}</span>
              <button
                type="button"
                onClick={() => setPromoActive(!promoActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  promoActive ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    promoActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Coupon Code
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="FESTIVE15"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white font-mono font-bold tracking-wider focus:border-[#dfb755] outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white font-mono focus:border-[#dfb755] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Offer Terms / Description
              </label>
              <input
                type="text"
                value={promoDesc}
                onChange={(e) => setPromoDesc(e.target.value)}
                placeholder="e.g. Flat 15% discount on all orders above ₹999"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#dfb755] to-[#b89130] text-slate-950 hover:brightness-110 active:scale-95 transition shadow-lg"
          >
            {saving ? "Saving Changes..." : "Save Announcement Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
