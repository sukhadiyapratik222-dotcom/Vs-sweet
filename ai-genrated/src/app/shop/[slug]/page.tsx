import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ReviewForm } from "@/components/review-form";
import { WishlistButton } from "@/components/wishlist-button";
import { VariantPicker } from "@/components/variant-picker";
import { getProductBySlug, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = (await listProducts({ category: product.categorySlug, limit: 4 })).filter((p) => p.id !== product.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-[#2a1a12]/50">
        <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${product.categorySlug}`}>{product.categoryName}</Link>
      </p>
      <div className="mt-6 grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] mithai-card">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#c45c26]">{product.categoryName}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[#6b1d1d]">{product.name}</h1>
          <p className="mt-2 text-sm text-[#2a1a12]/70">
            {product.avgRating ? `${product.avgRating} ★ · ${product.reviews.length} reviews` : "Be the first to review"}
          </p>
          <p className="mt-5 text-sm leading-7 text-[#2a1a12]/80">{product.description}</p>
          <VariantPicker variants={product.variants} />
          <div className="mt-4 flex flex-wrap gap-3">
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#6b1d1d]">Reviews</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {product.reviews.length === 0 ? (
            <p className="text-sm text-[#2a1a12]/60">No reviews yet — tell us how the mithai travelled.</p>
          ) : (
            product.reviews.map((review) => (
              <article key={review.id} className="mithai-card rounded-2xl p-4">
                <p className="text-sm font-medium">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                <p className="mt-2 text-sm leading-6">{review.comment}</p>
              </article>
            ))
          )}
        </div>
        <ReviewForm productId={product.id} />
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#6b1d1d]">More from this counter</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
