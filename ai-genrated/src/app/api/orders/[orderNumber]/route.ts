import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ orderNumber: string }> }) {
  await ensureSeeded();
  const { orderNumber } = await context.params;
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  const user = await getAuthUser();
  if (order.userId && user?.role !== "admin" && user?.id !== order.userId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return Response.json({ order, items });
}

export async function POST(request: Request, context: { params: Promise<{ orderNumber: string }> }) {
  await ensureSeeded();
  const { orderNumber } = await context.params;
  const body = (await request.json()) as { action?: string };
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  const user = await getAuthUser();
  if (body.action === "cancel") {
    if (order.userId && user?.id !== order.userId && user?.role !== "admin") {
      return Response.json({ error: "Not allowed" }, { status: 403 });
    }
    if (order.status === "delivered" || order.status === "cancelled") {
      return Response.json({ error: "This order cannot be cancelled." }, { status: 400 });
    }
    const [updated] = await db
      .update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, order.id))
      .returning();
    return Response.json({ order: updated });
  }
  return Response.json({ error: "Unknown action" }, { status: 400 });
}
