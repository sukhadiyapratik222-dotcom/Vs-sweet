"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const SLOTS = [
  "Today, 5:00–7:00 PM",
  "Today, 7:00–9:00 PM",
  "Tomorrow, 10:00 AM–12:00 PM",
  "Tomorrow, 4:00–7:00 PM",
  "Tomorrow, 7:00–9:00 PM",
];

export function CheckoutForm({ defaultName, defaultPhone }: { defaultName: string; defaultPhone: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        line1: form.get("line1"),
        city: form.get("city"),
        state: form.get("state"),
        pincode: form.get("pincode"),
        deliverySlot: form.get("deliverySlot"),
        paymentMethod: form.get("paymentMethod"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not place order");
      return;
    }
    router.push(`/orders/${data.order.orderNumber}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mithai-card mt-8 space-y-4 rounded-3xl p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Name
          <input name="name" required defaultValue={defaultName} className="mt-1 w-full rounded-2xl border border-[#6b1d1d]/15 px-3 py-2" />
        </label>
        <label className="text-sm">
          Phone
          <input name="phone" required defaultValue={defaultPhone} className="mt-1 w-full rounded-2xl border border-[#6b1d1d]/15 px-3 py-2" />
        </label>
      </div>
      <label className="block text-sm">
        Address
        <input name="line1" required placeholder="House, street, landmark" className="mt-1 w-full rounded-2xl border border-[#6b1d1d]/15 px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <input name="city" required defaultValue="Vadodara" className="rounded-2xl border border-[#6b1d1d]/15 px-3 py-2 text-sm" />
        <input name="state" required defaultValue="Gujarat" className="rounded-2xl border border-[#6b1d1d]/15 px-3 py-2 text-sm" />
        <input name="pincode" required placeholder="Pincode" className="rounded-2xl border border-[#6b1d1d]/15 px-3 py-2 text-sm" />
      </div>
      <label className="block text-sm">
        Delivery slot
        <select name="deliverySlot" className="mt-1 w-full rounded-2xl border border-[#6b1d1d]/15 px-3 py-2">
          {SLOTS.map((slot) => (
            <option key={slot}>{slot}</option>
          ))}
        </select>
      </label>
      <fieldset className="text-sm">
        <legend className="mb-2">Payment</legend>
        <label className="mr-4">
          <input type="radio" name="paymentMethod" value="cod" defaultChecked className="mr-2" />
          Cash on delivery
        </label>
        <label>
          <input type="radio" name="paymentMethod" value="upi" className="mr-2" />
          UPI (demo, auto-paid)
        </label>
      </fieldset>
      {error ? <p className="text-sm text-[#6b1d1d]">{error}</p> : null}
      <button disabled={loading} className="btn-primary w-full rounded-full py-3 text-sm">
        {loading ? "Placing order..." : "Place order"}
      </button>
    </form>
  );
}
