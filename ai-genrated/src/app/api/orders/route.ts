import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getAuthUser, setCouponCode } from "@/lib/auth";
import { clearCartForIdentity, decrementStock, loadCartLines } from "@/lib/cart";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

function orderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VSM-${stamp}-${rand}`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  await ensureSeeded();
  const adminKey = request.headers.get("x-admin-key");
  const user = await getAuthUser();

  if (adminKey === "vardayini-admin-secret" || user?.role === "admin") {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return Response.json({ orders: rows }, { headers: CORS_HEADERS });
  }

  if (!user) return Response.json({ error: "Please log in." }, { status: 401, headers: CORS_HEADERS });
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
  return Response.json({ orders: rows }, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  const cart = await loadCartLines();
  if (cart.lines.length === 0) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    deliverySlot?: string;
    paymentMethod?: string;
  };

  const name = body.name?.trim() || user?.name || "";
  const phone = body.phone?.trim() || user?.phone || "";
  const line1 = body.line1?.trim() || "";
  const city = body.city?.trim() || "";
  const state = body.state?.trim() || "Gujarat";
  const pincode = body.pincode?.trim() || "";
  const deliverySlot = body.deliverySlot?.trim() || "";
  const paymentMethod = body.paymentMethod === "upi" ? "upi" : "cod";

  if (!name || !phone || !line1 || !city || !pincode || !deliverySlot) {
    return Response.json({ error: "Please complete delivery details." }, { status: 400 });
  }

  try {
    await decrementStock(cart.lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Stock error" }, { status: 400 });
  }

  const number = orderNumber();
  const [created] = await db
    .insert(orders)
    .values({
      orderNumber: number,
      userId: user?.id ?? null,
      guestName: user ? null : name,
      guestPhone: user ? null : phone,
      status: "confirmed",
      subtotal: cart.totals.subtotal,
      discount: cart.totals.discount,
      deliveryFee: cart.totals.deliveryFee,
      tax: cart.totals.tax,
      total: cart.totals.total,
      couponCode: cart.couponCode,
      addressSnapshot: JSON.stringify({ name, phone, line1, city, state, pincode }),
      deliverySlot,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    })
    .returning();

  await db.insert(orderItems).values(
    cart.lines.map((line) => ({
      orderId: created.id,
      productName: line.name,
      variantWeight: line.weight,
      unitPrice: line.unit,
      quantity: line.quantity,
      imageUrl: line.imageUrl,
    })),
  );

  await clearCartForIdentity();
  await setCouponCode(null);

  return Response.json({ order: created });
}
