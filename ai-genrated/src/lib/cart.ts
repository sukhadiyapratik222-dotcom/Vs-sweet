import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, coupons, productVariants, products } from "@/db/schema";
import { getAuthUser, getCartSessionId, getCouponCode } from "@/lib/auth";
import { calcTotals, unitPrice } from "@/lib/money";

export type CartLine = {
  id: number;
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl: string;
  weight: string;
  quantity: number;
  price: number;
  discountedPrice: number | null;
  unit: number;
  lineTotal: number;
  stock: number;
};

export async function getCartIdentity() {
  const user = await getAuthUser();
  const sessionId = await getCartSessionId();
  return { user, sessionId };
}

export async function loadCartLines() {
  const { user, sessionId } = await getCartIdentity();
  const rows = await db
    .select({
      id: cartItems.id,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      imageUrl: products.imageUrl,
      weight: productVariants.weight,
      price: productVariants.price,
      discountedPrice: productVariants.discountedPrice,
      stock: productVariants.stock,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      user
        ? or(eq(cartItems.userId, user.id), eq(cartItems.sessionId, sessionId))
        : eq(cartItems.sessionId, sessionId),
    );

  const lines: CartLine[] = rows.map((row) => {
    const unit = unitPrice(row.price, row.discountedPrice);
    return {
      ...row,
      unit,
      lineTotal: unit * row.quantity,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const couponCode = await getCouponCode();
  let discount = 0;
  let freeDelivery = false;
  let couponLabel: string | null = null;

  if (couponCode) {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, couponCode)).limit(1);
    if (coupon && coupon.active && subtotal >= coupon.minOrder) {
      couponLabel = coupon.description;
      if (coupon.type === "percent") discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.type === "flat") discount = coupon.value;
      if (coupon.type === "free_delivery") freeDelivery = true;
    }
  }

  const totals = calcTotals(subtotal, discount, freeDelivery);
  return { lines, totals, couponCode, couponLabel, user };
}

export async function mergeGuestCart(userId: number) {
  const sessionId = await getCartSessionId();
  const guestRows = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  for (const row of guestRows) {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.variantId, row.variantId)))
      .limit(1);
    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + row.quantity })
        .where(eq(cartItems.id, existing.id));
      await db.delete(cartItems).where(eq(cartItems.id, row.id));
    } else {
      await db.update(cartItems).set({ userId, sessionId: null }).where(eq(cartItems.id, row.id));
    }
  }
}

export async function addToCart(variantId: number, quantity: number) {
  const { user, sessionId } = await getCartIdentity();
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);
  if (!variant) throw new Error("Variant not found");
  if (quantity < 1) throw new Error("Quantity must be at least 1");
  if (variant.stock < quantity) throw new Error("Not enough stock");

  const match = user
    ? and(eq(cartItems.userId, user.id), eq(cartItems.variantId, variantId))
    : and(eq(cartItems.sessionId, sessionId), eq(cartItems.variantId, variantId));

  const [existing] = await db.select().from(cartItems).where(match).limit(1);
  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (nextQty > variant.stock) throw new Error("Not enough stock");
    await db.update(cartItems).set({ quantity: nextQty }).where(eq(cartItems.id, existing.id));
    return existing.id;
  }

  const [created] = await db
    .insert(cartItems)
    .values({
      userId: user?.id ?? null,
      sessionId: user ? null : sessionId,
      variantId,
      quantity,
    })
    .returning();
  return created.id;
}

export async function clearCartForIdentity() {
  const { user, sessionId } = await getCartIdentity();
  if (user) {
    await db.delete(cartItems).where(or(eq(cartItems.userId, user.id), eq(cartItems.sessionId, sessionId)));
  } else {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
}

export async function decrementStock(items: { variantId: number; quantity: number }[]) {
  const ids = items.map((item) => item.variantId);
  const variants = await db.select().from(productVariants).where(inArray(productVariants.id, ids));
  const byId = new Map(variants.map((row) => [row.id, row]));
  for (const item of items) {
    const variant = byId.get(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      throw new Error("One or more items are out of stock");
    }
  }
  for (const item of items) {
    const variant = byId.get(item.variantId)!;
    await db
      .update(productVariants)
      .set({ stock: variant.stock - item.quantity })
      .where(eq(productVariants.id, item.variantId));
  }
}
