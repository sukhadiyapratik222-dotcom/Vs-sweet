import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { mergeGuestCart } from "@/lib/cart";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase() || "";
  const password = body.password || "";
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return Response.json({ error: "Invalid email or password." }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return Response.json({ error: "Invalid email or password." }, { status: 401 });
  await setAuthCookie(user.id);
  await mergeGuestCart(user.id);
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
}
