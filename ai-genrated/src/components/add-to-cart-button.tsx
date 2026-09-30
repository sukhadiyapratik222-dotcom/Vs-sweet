"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCartButton({
  variantId,
  quantity = 1,
  label = "Add to box",
}: {
  variantId: number;
  quantity?: number;
  label?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function add() {
    setStatus("loading");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productVariantId: variantId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Could not add");
      return;
    }
    setStatus("done");
    setMessage("Added to your mithai box");
    router.refresh();
    setTimeout(() => setStatus("idle"), 1200);
  }

  return (
    <div>
      <button onClick={add} disabled={status === "loading"} className="btn-primary w-full rounded-full px-4 py-2.5 text-sm">
        {status === "loading" ? "Adding..." : status === "done" ? "Added" : label}
      </button>
      {status === "error" ? <p className="mt-2 text-xs text-[#6b1d1d]">{message}</p> : null}
    </div>
  );
}
