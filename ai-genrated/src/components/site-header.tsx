"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Me = { id: number; name: string; role: string } | null;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<Me>(null);
  const [open, setOpen] = useState(false);

  const [uiConfig, setUiConfig] = useState<any>({
    announcement: {
      enabled: true,
      text: "✨ Fresh Morning Batch · Free Delivery in Gujarat on orders over ₹799",
      badge: "DIWALI SPECIAL",
    },
    storeInfo: {
      city: "Vadodara",
      established: "1976",
      phone: "+91 98250 19760",
    },
  });

  useEffect(() => {
    fetch("/api/ui-config")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUiConfig(data);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCount(data.count || 0))
      .catch(() => setCount(0));
  }, [pathname]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    setOpen(false);
  }

  const leftNav = [
    { href: "/shop", label: "Shop Mithai" },
    { href: "/shop?category=farsan", label: "Live Farsan" },
    { href: "/shop?category=gift-hampers", label: "Hampers" },
    { href: "/stores", label: "Stores" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#0b2f8a]/8 bg-[#fdfcfa]/90 backdrop-blur-md">
      {/* Top Banner */}
      {uiConfig.announcement?.enabled !== false && (
        <div className="bg-[#0b2f8a] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
            <p className="hidden sm:block text-white/80">
              {uiConfig.storeInfo?.city || "Vadodara"} · Since {uiConfig.storeInfo?.established || "1976"} · 100% Shuddh Desi Ghee
            </p>
            <p className="mx-auto sm:mx-0 text-center font-medium tracking-wide text-[#dfb755]">
              {uiConfig.announcement?.text || "✨ Fresh Morning Batch · Free Delivery in Gujarat on orders over ₹799"}
            </p>
            <div className="hidden sm:flex items-center gap-4 text-white/80">
              <span>Call: {uiConfig.storeInfo?.phone || "+91 98250 19760"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#182230]/80 md:flex">
          {leftNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#0b2f8a]"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/#story" className="transition hover:text-[#0b2f8a]">
            Our Heritage
          </Link>
        </nav>

        {/* Center: Brand Crest / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#dfb755] to-[#b89130] p-0.5 shadow-sm transition group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b2f8a] text-white">
              <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[#dfb755]">
                વ
              </span>
            </div>
          </div>
          <div className="text-left">
            <span className="block font-[family-name:var(--font-display)] text-2xl font-bold leading-none tracking-tight text-[#0b2f8a]">
              VARDAYINI
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b89130]">
              Sweet Mart · 1986
            </span>
          </div>
        </Link>

        {/* Right Navigation & Utilities */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <form onSubmit={onSearch} className="relative hidden lg:block w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kaju katli, khaman..."
              className="w-full rounded-full border border-[#0b2f8a]/12 bg-white px-4 py-2 text-sm text-[#182230] placeholder:text-[#5e6d82]/60 focus:border-[#0b2f8a] focus:ring-2 focus:ring-[#0b2f8a]/10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#5e6d82] hover:text-[#0b2f8a]"
              aria-label="Search"
            >
              🔍
            </button>
          </form>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[#0b2f8a]/10 text-sm text-[#182230]/70 hover:border-[#0b2f8a] hover:text-[#0b2f8a]"
            title="Wishlist"
          >
            ♡
          </Link>

          {/* Account / Login */}
          <Link
            href={user ? "/account" : "/login"}
            className="hidden sm:inline-block text-sm font-medium text-[#182230]/80 hover:text-[#0b2f8a]"
          >
            {user ? user.name.split(" ")[0] : "Login"}
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:inline-block rounded-full bg-[#f4f7fe] px-3 py-1 text-xs font-semibold text-[#0b2f8a]"
            >
              Admin
            </Link>
          )}

          {/* Cart Button */}
          <Link
            href="/cart"
            className="btn-primary flex items-center gap-2 rounded-full px-4 py-2 text-sm"
          >
            <span>Cart</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dfb755] text-[11px] font-bold text-[#0b2f8a]">
              {count}
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0b2f8a]/15 text-lg md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-[#0b2f8a]/10 bg-white px-4 py-4 md:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mithai & farsan..."
              className="w-full rounded-full border border-[#0b2f8a]/15 px-4 py-2 text-sm"
            />
          </form>
          <div className="space-y-3 font-medium text-sm">
            {leftNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-[#182230]/80 hover:text-[#0b2f8a]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="block text-[#182230]/80"
            >
              Wishlist
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="block text-[#182230]/80"
            >
              {user ? "My Account" : "Login"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
