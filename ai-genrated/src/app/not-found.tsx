import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-[#6b1d1d]">This tray is empty</h1>
      <p className="mt-3 text-sm text-[#2a1a12]/70">That page is not on our counter.</p>
      <Link href="/shop" className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm">
        Back to shop
      </Link>
    </main>
  );
}
