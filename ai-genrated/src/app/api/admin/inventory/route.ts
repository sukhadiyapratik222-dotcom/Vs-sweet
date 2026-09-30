import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function isAuthorized(user: any, request: Request) {
  const adminKey = request.headers.get("x-admin-key");
  return adminKey === "vardayini-admin-secret" || user?.role === "admin";
}

export async function GET(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!isAuthorized(user, request)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403, headers: CORS_HEADERS });
  }

  const rows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      weight: productVariants.weight,
      stock: productVariants.stock,
      price: productVariants.price,
      name: products.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(asc(productVariants.stock));

  return NextResponse.json(
    { variants: rows, lowStock: rows.filter((row) => row.stock <= 20) },
    { headers: CORS_HEADERS }
  );
}

export async function PUT(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!isAuthorized(user, request)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403, headers: CORS_HEADERS });
  }

  const body = (await request.json()) as { id?: number; stock?: number };
  if (!body.id || body.stock == null || body.stock < 0) {
    return NextResponse.json({ error: "Invalid stock update" }, { status: 400, headers: CORS_HEADERS });
  }

  const [updated] = await db
    .update(productVariants)
    .set({ stock: body.stock })
    .where(eq(productVariants.id, body.id))
    .returning();

  return NextResponse.json({ variant: updated }, { headers: CORS_HEADERS });
}
