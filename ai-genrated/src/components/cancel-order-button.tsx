"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function cancel() {
    const res = await fetch(`/api/orders/${orderNumber}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not cancel");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4">
      <button onClick={cancel} className="rounded-full border border-[#6b1d1d]/20 px-4 py-2 text-sm">
        Cancel order
      </button>
      {error ? <p className="mt-2 text-xs text-[#6b1d1d]">{error}</p> : null}
    </div>
  );
}
