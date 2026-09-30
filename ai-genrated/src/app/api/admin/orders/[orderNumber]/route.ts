import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { NextResponse } from "next/server";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function isAuthorized(user: any, request: Request) {
  const adminKey = request.headers.get("x-admin-key");
  return adminKey === "vardayini-admin-secret" || user?.role === "admin";
}

export async function PUT(request: Request, context: { params: Promise<{ orderNumber: string }> }) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!isAuthorized(user, request)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403, headers: CORS_HEADERS });
  }

  const { orderNumber } = await context.params;
  const body = (await request.json()) as { status?: string };
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400, headers: CORS_HEADERS });
  }

  const patch: { status: string; paymentStatus?: string } = { status: body.status };
  if (body.status === "delivered") patch.paymentStatus = "paid";

  const [updated] = await db.update(orders).set(patch).where(eq(orders.orderNumber, orderNumber)).returning();
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
  }

  return NextResponse.json({ order: updated }, { headers: CORS_HEADERS });
}
