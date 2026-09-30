"use client";

import { useState } from "react";

export function LivePreviewTab() {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [key, setKey] = useState(Date.now());

  const handleReload = () => {
    setKey(Date.now());
  };

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👁️ Live Customer Storefront Preview</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live view of your customer website running on <span className="text-[#dfb755] font-mono">http://localhost:3000</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Device Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                device === "desktop"
                  ? "bg-[#dfb755] text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                device === "tablet"
                  ? "bg-[#dfb755] text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                device === "mobile"
                  ? "bg-[#dfb755] text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📲 Mobile
            </button>
          </div>

          <button
            onClick={handleReload}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reload Preview"
          >
            🔄
          </button>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0b2f8a] hover:bg-[#1a44b5] text-white transition flex items-center gap-1.5 shadow"
          >
            <span>Open in Tab ↗</span>
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center p-4 rounded-3xl glass-card border border-white/10 bg-slate-950/60 min-h-[750px]">
        <div
          className={`transition-all duration-300 w-full ${getDeviceWidth()} h-[750px] rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-white`}
        >
          <iframe
            key={key}
            src="http://localhost:3000"
            className="w-full h-full border-0"
            title="Customer Storefront Live Preview"
          />
        </div>
      </div>
    </div>
  );
}
