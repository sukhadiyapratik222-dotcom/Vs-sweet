import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-[#c45c26]">Join the mithai list</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[#6b1d1d]">Create account</h1>
      <AuthForm mode="register" />
      <p className="mt-4 text-sm text-[#2a1a12]/70">
        Already packing with us? <Link href="/login" className="text-[#c45c26]">Login</Link>
      </p>
    </main>
  );
}
