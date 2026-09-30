import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listCategories, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts({
      category: params.category,
      search: params.search,
      sort: params.sort,
      tag: params.tag,
    }),
  ]);

  const heading = params.search
    ? `Results for “${params.search}”`
    : params.category
      ? categories.find((c) => c.slug === params.category)?.name || "Shop"
      : "The mithai counter";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.28em] text-[#c45c26]">Shop</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[#6b1d1d]">{heading}</h1>
      <p className="mt-2 text-sm text-[#2a1a12]/70">{products.length} sweets ready to pack</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full px-4 py-1.5 text-sm ${!params.category ? "bg-[#6b1d1d] text-[#fff8ee]" : "mithai-card"}`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm ${params.category === category.slug ? "bg-[#6b1d1d] text-[#fff8ee]" : "mithai-card"}`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <form className="mt-5 flex flex-wrap gap-3">
        {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search mithai"
          className="min-w-[220px] flex-1 rounded-full border border-[#6b1d1d]/15 px-4 py-2 text-sm"
        />
        <select name="sort" defaultValue={params.sort || ""} className="rounded-full border border-[#6b1d1d]/15 px-4 py-2 text-sm">
          <option value="">Featured</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
        <button className="btn-primary rounded-full px-5 py-2 text-sm">Filter</button>
      </form>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-10 text-center text-[#2a1a12]/60">No mithai matched that search. Try ladoo or kaju.</p>
      ) : null}
    </main>
  );
}
