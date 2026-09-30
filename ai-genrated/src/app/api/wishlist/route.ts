import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, wishlistItems } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!user) return Response.json({ items: [] });
  const items = await db
    .select({
      id: wishlistItems.id,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      imageUrl: products.imageUrl,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, user.id))
    .orderBy(desc(wishlistItems.createdAt));
  return Response.json({ items });
}

export async function POST(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Please log in to save favourites." }, { status: 401 });
  const body = (await request.json()) as { productId?: number };
  if (!body.productId) return Response.json({ error: "productId required" }, { status: 400 });
  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, body.productId)))
    .limit(1);
  if (existing) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
    return Response.json({ saved: false });
  }
  await db.insert(wishlistItems).values({ userId: user.id, productId: body.productId });
  return Response.json({ saved: true });
}
