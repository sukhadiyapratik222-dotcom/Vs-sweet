import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { formatInr } from "@/lib/money";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#c45c26]">Account</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[#6b1d1d]">{user.name}</h1>
          <p className="mt-2 text-sm text-[#2a1a12]/70">
            {user.email} · {user.phone}
          </p>
        </div>
        <LogoutButton />
      </div>
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#6b1d1d]">Orders</h2>
        <div className="mt-4 space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-[#2a1a12]/60">
              No orders yet. <Link href="/shop" className="text-[#c45c26]">Start a box</Link>
            </p>
          ) : (
            rows.map((order) => (
              <Link key={order.id} href={`/orders/${order.orderNumber}`} className="mithai-card flex items-center justify-between rounded-3xl p-5">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm capitalize text-[#2a1a12]/60">
                    {order.status} · {order.paymentMethod}
                  </p>
                </div>
                <p className="font-semibold">{formatInr(order.total)}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
