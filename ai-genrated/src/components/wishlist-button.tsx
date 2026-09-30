"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WishlistButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function toggle() {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setMsg(data.saved ? "Saved to wishlist" : "Removed from wishlist");
    router.refresh();
  }

  return (
    <button onClick={toggle} className="rounded-full border border-[#6b1d1d]/20 px-4 py-2.5 text-sm hover:bg-[#fff8ee]">
      {msg || "Save to wishlist"}
    </button>
  );
}
