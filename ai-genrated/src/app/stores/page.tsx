import { db } from "@/db";
import { stores } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  await ensureSeeded();
  const rows = await db.select().from(stores);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.28em] text-[#c45c26]">Visit us</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[#6b1d1d]">Store locator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#2a1a12]/70">
        Walk in for a sample, watch jalebi being fried, or collect a hamper. All counters accept prepaid online orders.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {rows.map((store) => (
          <article key={store.id} className="mithai-card rounded-3xl p-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#6b1d1d]">{store.name}</h2>
            <p className="mt-3 text-sm leading-7 text-[#2a1a12]/75">
              {store.address}
              <br />
              {store.city} {store.pincode}
            </p>
            <p className="mt-3 text-sm">{store.hours}</p>
            <p className="mt-1 text-sm text-[#c45c26]">{store.phone}</p>
          </article>
        ))}
      </div>
      <div className="relative mt-10 overflow-hidden rounded-[2rem]">
        <img src="/images/shop.jpg" alt="Vardayini shop interior" className="h-[360px] w-full object-cover" />
      </div>
    </main>
  );
}
