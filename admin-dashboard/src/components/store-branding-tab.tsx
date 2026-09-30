"use client";

import { useState } from "react";
import { UiConfig, api } from "@/lib/api";

interface StoreBrandingTabProps {
  config: UiConfig | null;
  onRefresh: () => void;
}

export function StoreBrandingTab({ config, onRefresh }: StoreBrandingTabProps) {
  const [storeName, setStoreName] = useState(config?.storeInfo?.name ?? "Vardayini Sweet Mart");
  const [tagline, setTagline] = useState(
    config?.storeInfo?.tagline ?? "Pure Ghee Gujarati Mithai & Live Morning Farsan"
  );
  const [established, setEstablished] = useState(config?.storeInfo?.established ?? "1976");
  const [phone, setPhone] = useState(config?.storeInfo?.phone ?? "+91 98250 19760");
  const [whatsapp, setWhatsapp] = useState(config?.storeInfo?.whatsapp ?? "+91 98250 19760");
  const [email, setEmail] = useState(config?.storeInfo?.email ?? "orders@vardayini.com");
  const [address, setAddress] = useState(
    config?.storeInfo?.address ?? "Opp. Swaminarayan Temple, Station Road, Anand, Gujarat 388001"
  );
  const [city, setCity] = useState(config?.storeInfo?.city ?? "Vadodara & Anand");
  const [hours, setHours] = useState(config?.storeInfo?.hours ?? "7:00 AM – 10:30 PM (All 7 Days)");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateUiConfig({
        storeInfo: {
          name: storeName,
          tagline,
          established,
          phone,
          whatsapp,
          email,
          address,
          city,
          hours,
        },
      });
      setFeedback("✅ Store branding and contact details updated successfully!");
      onRefresh();
    } catch {
      setFeedback("❌ Failed to update store information.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="p-6 rounded-2xl glass-panel border border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏛️ Store Identity & Contact Information</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize your business identity, operating hours, phone numbers, and WhatsApp ordering details.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-xs font-medium bg-slate-900 border border-[#dfb755]/30 text-[#dfb755]">
          {feedback}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl glass-panel space-y-4 border border-white/10">
          <h3 className="text-base font-bold text-white">Brand Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand / Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Established Year
              </label>
              <input
                type="text"
                value={established}
                onChange={(e) => setEstablished(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tagline / Hero Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-4 border border-white/10">
          <h3 className="text-base font-bold text-white">Contact & Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Customer Support Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                WhatsApp Direct Order Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Operating Timings
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="7:00 AM – 10:30 PM (All 7 Days)"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-[#dfb755] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Physical Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
            {saving ? "Saving Changes..." : "Save Store Identity"}
          </button>
        </div>
      </form>
    </div>
  );
}
