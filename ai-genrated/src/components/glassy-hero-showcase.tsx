"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface ProductPhoto {
  id: string;
  name: string;
  image: string;
}

const PRODUCTS: ProductPhoto[] = [
  {
    id: "kaju-katli",
    name: "Kaju Katli",
    image: "/images/kaju-katli-showcase.jpg",
  },
  {
    id: "motichoor-ladoo",
    name: "Motichoor Ladoo",
    image: "/images/motichoor-showcase.jpg",
  },
  {
    id: "nylon-khaman",
    name: "Nylon Khaman",
    image: "/images/khaman-showcase.jpg",
  },
  {
    id: "surati-khandvi",
    name: "Surati Khandvi",
    image: "/images/khandvi-showcase.jpg",
  },
  {
    id: "festive-platter",
    name: "Shahi Platter",
    image: "/images/mithai-platter-showcase.jpg",
  },
];

export function GlassyHeroShowcase() {
  const [products, setProducts] = useState<ProductPhoto[]>(PRODUCTS);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [intervalMs, setIntervalMs] = useState(4000);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    fetch("/api/ui-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.heroPhotos && Array.isArray(data.heroPhotos)) {
          const activePhotos = data.heroPhotos
            .filter((p: any) => p.active !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          if (activePhotos.length > 0) {
            setProducts(activePhotos);
          }
        }
        if (data.heroSettings) {
          if (data.heroSettings.autoScroll !== undefined) {
            setAutoScrollEnabled(data.heroSettings.autoScroll);
          }
          if (data.heroSettings.intervalSeconds) {
            setIntervalMs(data.heroSettings.intervalSeconds * 1000);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Scroll to a specific slide index smoothly
  const scrollToSlide = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetLeft = index * container.clientWidth;
    isProgrammaticScroll.current = true;
    container.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
    setActiveIndex(index);
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }, []);

  const handleNext = useCallback(() => {
    if (products.length === 0) return;
    const nextIndex = (activeIndex + 1) % products.length;
    scrollToSlide(nextIndex);
  }, [activeIndex, products.length, scrollToSlide]);

  const handlePrev = useCallback(() => {
    if (products.length === 0) return;
    const prevIndex = (activeIndex - 1 + products.length) % products.length;
    scrollToSlide(prevIndex);
  }, [activeIndex, products.length, scrollToSlide]);

  // Sync activeIndex when user scrolls/swipes manually
  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    const container = scrollContainerRef.current;
    if (!container || container.clientWidth === 0) return;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    if (newIndex >= 0 && newIndex < products.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Smooth auto-scroll, pauses on hover or manual interaction
  useEffect(() => {
    if (isPaused || !autoScrollEnabled || products.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, autoScrollEnabled, products.length, intervalMs, handleNext]);

  return (
    <div
      className="relative w-full max-w-xl mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Ambient background glow orbs for glass refraction */}
      <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#dfb755]/25 via-[#b89130]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-gradient-to-tr from-[#0b2f8a]/20 via-[#4068cc]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Panel Container */}
      <div className="relative rounded-[2.5rem] p-3 sm:p-4 glass-panel border border-white/80 shadow-[0_25px_60px_-15px_rgba(11,47,138,0.18)]">
        {/* Scrollable Photo Viewport — 100% Unobstructed Clean Photos */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/90 to-amber-50/50 shadow-inner group">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((prod, idx) => (
              <div
                key={prod.id}
                className="relative aspect-[4/3] sm:aspect-[16/11] w-full shrink-0 snap-center overflow-hidden"
              >
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  priority={idx === 0}
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 560px"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Glassy Floating Left & Right Scroll Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full backdrop-blur-xl bg-white/75 hover:bg-white border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#0b2f8a] transition-all duration-300 hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100 z-10"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full backdrop-blur-xl bg-white/75 hover:bg-white border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#0b2f8a] transition-all duration-300 hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100 z-10"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Minimal Glass Progress Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/30 border border-white/20 z-10 pointer-events-none">
            {products.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Glassy Product Photo Thumbnail Strip — Scroll & Click to Switch */}
        <div className="mt-3 sm:mt-4 pt-1">
          <div className="flex items-center justify-between pb-1.5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0b2f8a]/75">
              Swipe or tap photo to scroll
            </span>
            <span className="text-[11px] font-semibold text-[#5e6d82]">
              {products.length > 0 ? activeIndex + 1 : 0} / {products.length}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {products.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSlide(idx)}
                  className={`group relative flex-1 min-w-[70px] max-w-[120px] flex flex-col items-center rounded-2xl p-1.5 transition-all duration-300 ${
                    isSelected
                      ? "backdrop-blur-xl bg-white/95 border-2 border-[#0b2f8a] shadow-md -translate-y-1 scale-105"
                      : "backdrop-blur-md bg-white/50 border border-white/80 hover:bg-white/80 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-amber-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="100px"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 ring-2 ring-inset ring-[#0b2f8a] rounded-xl" />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 block text-center text-[11px] font-medium leading-tight truncate w-full px-0.5 ${
                      isSelected ? "text-[#0b2f8a] font-bold" : "text-[#5e6d82]"
                    }`}
                  >
                    {item.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
