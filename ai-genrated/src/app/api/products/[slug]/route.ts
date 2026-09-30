import { ensureSeeded } from "@/db/seed";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  await ensureSeeded();
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ product });
}
