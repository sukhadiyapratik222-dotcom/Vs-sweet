import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const productId = Number(new URL(request.url).searchParams.get("productId"));
  if (!productId) return Response.json({ reviews: [] });
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      name: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
  return Response.json({ reviews: rows });
}

export async function POST(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Please log in to review." }, { status: 401 });
  const body = (await request.json()) as { productId?: number; rating?: number; comment?: string };
  const rating = Number(body.rating);
  const comment = body.comment?.trim() || "";
  if (!body.productId || rating < 1 || rating > 5 || comment.length < 4) {
    return Response.json({ error: "Please add a rating and a short review." }, { status: 400 });
  }
  const [created] = await db
    .insert(reviews)
    .values({ productId: body.productId, userId: user.id, rating, comment })
    .returning();
  return Response.json({ review: created });
}
