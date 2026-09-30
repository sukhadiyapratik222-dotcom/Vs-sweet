import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { GlassyHeroShowcase } from "@/components/glassy-hero-showcase";
import { HeritageHeroBanner } from "@/components/heritage-hero-banner";
import { listCategories, listProducts } from "@/lib/products";
import { formatInr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, bestsellers] = await Promise.all([
    listCategories(),
    listProducts({ featured: true, limit: 8 }),
    listProducts({ tag: "best_seller", limit: 4 }),
  ]);

  return (
    <main className="space-y-16 pb-20">
      {/* Heritage Craftsmanship Hero Banner — Tradition Preserved Since 1976 */}
      <HeritageHeroBanner />

      {/* Featured Showcase Section with Scrolling Photo Gallery */}
      <section className="relative overflow-hidden pt-4 pb-12 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0b2f8a]/15 bg-[#eef3ff] px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#0b2f8a]">
                <span>✨ EST. 1976</span>
                <span className="text-[#0b2f8a]/30">•</span>
                <span>AUTHENTIC GUJARATI MITHAI & FARSAN</span>
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight text-[#182230] sm:text-6xl lg:text-7xl">
                Handcrafted <span className="text-[#0b2f8a]">Mithai</span> & Fresh Daily <span className="text-[#b89130]">Farsan</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#5e6d82] sm:text-lg">
                Pure ghee sweets & savoury farsan delivered fresh across Gujarat. From silver-foiled Kaju Katli to morning-steamed Nylon Khaman Dhokla, crafted the authentic way since 1976.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="btn-gold rounded-full px-8 py-3.5 text-sm font-semibold shadow-sm transition hover:scale-105"
                >
                  Order Fresh Mithai →
                </Link>
                <Link
                  href="/shop?category=gift-hampers"
                  className="rounded-full border-2 border-[#0b2f8a] bg-white px-7 py-3 text-sm font-semibold text-[#0b2f8a] transition hover:bg-[#0b2f8a] hover:text-white"
                >
                  Festive Hampers
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 border-t border-[#0b2f8a]/10 pt-6">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0b2f8a]">
                    48+ Yrs
                  </p>
                  <p className="text-xs text-[#5e6d82]">Serving Gujarat</p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0b2f8a]">
                    100%
                  </p>
                  <p className="text-xs text-[#5e6d82]">Shuddh Desi Ghee</p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0b2f8a]">
                    4.9 ★
                  </p>
                  <p className="text-xs text-[#5e6d82]">Over 12k Reviews</p>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase — Interactive Glassmorphic Product Gallery */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <GlassyHeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#182230]">
              Browse By Category
            </h2>
            <p className="text-sm text-[#5e6d82]">
              Select from our freshly rolled sweets and steaming hot snacks
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold text-[#0b2f8a] hover:underline"
          >
            View Full Menu →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          <Link href="/shop" className="category-pill active">
            All Items
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="category-pill"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0b2f8a]">
              Karigars&apos; Choice
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#182230] sm:text-4xl">
              Fresh Daily Specials
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-block text-sm font-semibold text-[#0b2f8a] hover:underline"
          >
            See all 24+ items →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Vardayini Promise / Heritage Banner */}
      <section id="story" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-[#0b2f8a] p-8 md:p-14 text-white shadow-xl relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-[#dfb755]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#dfb755]">
              Our Heritage · Vadodara
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
              Three generations of uncompromising taste.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-white/80">
              Vardayini began as a modest Mandvi counter packing festive ladoos in 1976. Today, we still roast besan slowly in pure cow ghee, never compromise on ingredients, and pack orders fresh the same morning.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/stores"
                className="btn-gold rounded-full px-6 py-2.5 text-sm font-semibold shadow-md"
              >
                Find Our Stores
              </Link>
              <Link
                href="/shop?category=gift-hampers"
                className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Custom Gift Boxes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* House Bestsellers Ranking */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#182230]">
          Customer Favorites
        </h2>
        <p className="mt-1 text-sm text-[#5e6d82]">
          Our most-ordered boxes across Vadodara & Ahmedabad
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {bestsellers.map((product, index) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="mithai-card flex items-center gap-4 p-4 hover:border-[#0b2f8a]/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ff] font-[family-name:var(--font-display)] text-xl font-bold text-[#0b2f8a]">
                #{index + 1}
              </span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#faf7f0]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🍬
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-[#182230]">
                  {product.name}
                </p>
                <p className="text-xs text-[#5e6d82]">{product.categoryName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0b2f8a]">
                  {formatInr(product.fromPrice)}
                </p>
                <span className="text-[11px] text-[#5e6d82]">View Box →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3 Quality Pillars */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8 md:grid-cols-3">
        {[
          {
            icon: "🥛",
            title: "100% Shuddh Desi Ghee",
            body: "Prepared purely in pure cow and buffalo desi ghee. Absolutely zero hydrogenated oils or dalda.",
          },
          {
            icon: "🌿",
            title: "Zero Preservatives",
            body: "Prepared in dawn batches daily. Packed immediately to retain natural moisture and crispness.",
          },
          {
            icon: "🎁",
            title: "Custom Festive Gifting",
            body: "Choose custom box compartments, handpicked assorted mithai, and personalized Shubhkamna gift cards.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="mithai-card rounded-3xl p-6 space-y-3"
          >
            <div className="text-3xl">{item.icon}</div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#182230]">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-[#5e6d82]">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
