import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

const AUTH_COOKIE = "vs_session";
const CART_COOKIE = "vs_cart";
const COUPON_COOKIE = "vs_coupon";

function secret() {
  return process.env.SESSION_SECRET || "vardayini-dev-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function getCartSessionId() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const id = randomBytes(16).toString("hex");
  try {
    store.set(CART_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch {
    // Server Components cannot set cookies; middleware attaches vs_cart.
  }
  return id;
}

export async function setAuthCookie(userId: number) {
  const payload = JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 });
  const token = Buffer.from(payload).toString("base64url") + "." + sign(payload);
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function getAuthUser() {
  await ensureSeeded();
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const [raw, signature] = token.split(".");
  if (!raw || !signature) return null;
  const payload = Buffer.from(raw, "base64url").toString("utf8");
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const data = JSON.parse(payload) as { userId: number; exp: number };
  if (data.exp < Date.now()) return null;
  const [user] = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function getCouponCode() {
  const store = await cookies();
  return store.get(COUPON_COOKIE)?.value || null;
}

export async function setCouponCode(code: string | null) {
  const store = await cookies();
  if (!code) {
    store.delete(COUPON_COOKIE);
    return;
  }
  store.set(COUPON_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;
