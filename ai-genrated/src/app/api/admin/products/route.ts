import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants, categories } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      imageUrl: products.imageUrl,
      tags: products.tags,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      categoryName: categories.name,
      variantId: productVariants.id,
      sku: productVariants.sku,
      weight: productVariants.weight,
      price: productVariants.price,
      stock: productVariants.stock,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(productVariants, eq(productVariants.productId, products.id));

  return NextResponse.json({ items: allProducts }, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!isAuthorized(user, request)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403, headers: CORS_HEADERS });
  }

  try {
    const body = await request.json();
    const { name, categoryId, description, imageUrl, weight, price, stock, isFeatured } = body;

    if (!name || !categoryId || !price) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const sku = "VSM-" + name.substring(0, 3).toUpperCase() + "-" + (weight || "STD").toUpperCase();

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        categoryId: Number(categoryId),
        description: description || "Freshly made Gujarati delicacy.",
        imageUrl: imageUrl || "/images/mithai-platter-showcase.jpg",
        tags: isFeatured ? "featured,popular" : "popular",
        isFeatured: Boolean(isFeatured),
      })
      .returning();

    const [newVariant] = await db
      .insert(productVariants)
      .values({
        productId: newProduct.id,
        sku,
        weight: weight || "500g",
        price: Number(price),
        stock: Number(stock ?? 50),
      })
      .returning();

    return NextResponse.json({ success: true, product: newProduct, variant: newVariant }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product", details: String(error) }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(request: Request) {
  await ensureSeeded();
  const user = await getAuthUser();
  if (!isAuthorized(user, request)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403, headers: CORS_HEADERS });
  }

  try {
    const body = await request.json();
    const { productId, variantId, name, price, stock, weight, imageUrl, isFeatured } = body;

    if (productId) {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (imageUrl) updateData.imageUrl = imageUrl;
      if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

      if (Object.keys(updateData).length > 0) {
        await db.update(products).set(updateData).where(eq(products.id, Number(productId)));
      }
    }

    if (variantId) {
      const varUpdateData: any = {};
      if (price !== undefined) varUpdateData.price = Number(price);
      if (stock !== undefined) varUpdateData.stock = Number(stock);
      if (weight) varUpdateData.weight = weight;

      if (Object.keys(varUpdateData).length > 0) {
        await db.update(productVariants).set(varUpdateData).where(eq(productVariants.id, Number(variantId)));
      }
    }

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update", details: String(error) }, { status: 500, headers: CORS_HEADERS });
  }
}
