"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatInr, unitPrice } from "@/lib/money";

type Variant = {
  id: number;
  weight: string;
  price: number;
  discountedPrice: number | null;
  stock: number;
};

export function VariantPicker({ variants }: { variants: Variant[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const selected = useMemo(() => variants.find((v) => v.id === variantId) ?? variants[0], [variants, variantId]);
  if (!selected) return null;
  const unit = unitPrice(selected.price, selected.discountedPrice);

  return (
    <div className="mt-6 space-y-4">
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold">{formatInr(unit)}</span>
        {selected.discountedPrice ? (
          <span className="text-sm text-[#2a1a12]/45 line-through">{formatInr(selected.price)}</span>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setVariantId(variant.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              variant.id === selected.id ? "bg-[#6b1d1d] text-[#fff8ee]" : "mithai-card"
            }`}
          >
            {variant.weight}
          </button>
        ))}
      </div>
      <p className="text-xs text-[#2a1a12]/55">{selected.stock} packs left</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-[#6b1d1d]/15">
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.min(selected.stock, q + 1))}>
            +
          </button>
        </div>
        <div className="flex-1">
          <AddToCartButton variantId={selected.id} quantity={qty} label="Add to mithai box" />
        </div>
      </div>
    </div>
  );
}
