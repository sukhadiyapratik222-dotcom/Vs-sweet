import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { formatInr } from "@/lib/money";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  await ensureSeeded();
  const { orderNumber } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) notFound();
  const user = await getAuthUser();
  if (order.userId && user?.role !== "admin" && user?.id !== order.userId) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const address = JSON.parse(order.addressSnapshot) as {
    name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.28em] text-[#c45c26]">Order placed</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[#6b1d1d]">{order.orderNumber}</h1>
      <p className="mt-2 capitalize text-sm text-[#2a1a12]/70">
        {order.status} · {order.paymentStatus} · {order.paymentMethod}
      </p>
      <div className="mithai-card mt-6 space-y-4 rounded-3xl p-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
              <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-[#2a1a12]/60">
                {item.variantWeight} × {item.quantity}
              </p>
            </div>
            <p>{formatInr(item.unitPrice * item.quantity)}</p>
          </div>
        ))}
        <div className="flex justify-between border-t border-[#6b1d1d]/10 pt-4 font-semibold">
          <span>Total</span>
          <span>{formatInr(order.total)}</span>
        </div>
      </div>
      <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
        <article className="mithai-card rounded-3xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#6b1d1d]">Deliver to</h2>
          <p className="mt-2 leading-7">
            {address.name}
            <br />
            {address.line1}
            <br />
            {address.city}, {address.state} {address.pincode}
            <br />
            {address.phone}
          </p>
        </article>
        <article className="mithai-card rounded-3xl p-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#6b1d1d]">Slot</h2>
          <p className="mt-2">{order.deliverySlot}</p>
          {order.status !== "cancelled" && order.status !== "delivered" ? (
            <CancelOrderButton orderNumber={order.orderNumber} />
          ) : null}
        </article>
      </div>
      <Link href="/shop" className="mt-8 inline-block text-sm text-[#c45c26]">
        Continue shopping →
      </Link>
    </main>
  );
}
