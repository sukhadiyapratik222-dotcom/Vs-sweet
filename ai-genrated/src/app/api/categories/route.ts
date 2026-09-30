import { ensureSeeded } from "@/db/seed";
import { listCategories } from "@/lib/products";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  await ensureSeeded();
  const categories = await listCategories();
  return NextResponse.json({ categories }, { headers: CORS_HEADERS });
}
