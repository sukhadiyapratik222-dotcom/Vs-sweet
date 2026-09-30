import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const { id } = await context.params;
  await db.delete(wishlistItems).where(and(eq(wishlistItems.id, Number(id)), eq(wishlistItems.userId, user.id)));
  return Response.json({ ok: true });
}
