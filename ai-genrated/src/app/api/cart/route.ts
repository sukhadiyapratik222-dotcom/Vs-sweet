import { addToCart, loadCartLines } from "@/lib/cart";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const cart = await loadCartLines();
  return Response.json({
    items: cart.lines,
    totals: cart.totals,
    couponCode: cart.couponCode,
    couponLabel: cart.couponLabel,
    count: cart.lines.reduce((sum, line) => sum + line.quantity, 0),
  });
}

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as { productVariantId?: number; variantId?: number; quantity?: number };
  const variantId = body.productVariantId ?? body.variantId;
  const quantity = body.quantity ?? 1;
  if (!variantId) return Response.json({ error: "productVariantId is required" }, { status: 400 });
  try {
    await addToCart(Number(variantId), Number(quantity));
    const cart = await loadCartLines();
    return Response.json({
      ok: true,
      items: cart.lines,
      totals: cart.totals,
      count: cart.lines.reduce((sum, line) => sum + line.quantity, 0),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not add to cart" }, { status: 400 });
  }
}
