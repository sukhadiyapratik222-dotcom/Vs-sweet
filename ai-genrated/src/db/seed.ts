import bcrypt from "bcryptjs";
import { db, ensureDbMigrations } from "@/db";
import {
  categories,
  coupons,
  products,
  productVariants,
  stores,
  users,
} from "@/db/schema";

const globalForSeed = globalThis as unknown as {
  __seedingPromise?: Promise<void>;
  __isSeeded?: boolean;
};

export function ensureSeeded() {
  if (globalForSeed.__isSeeded) return Promise.resolve();
  if (!globalForSeed.__seedingPromise) {
    globalForSeed.__seedingPromise = (async () => {
      await seedInternal();
      globalForSeed.__isSeeded = true;
    })();
  }
  return globalForSeed.__seedingPromise;
}

async function seedInternal() {
  await ensureDbMigrations();
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length > 0) return;

  const passwordHash = await bcrypt.hash("sweet123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  await db.insert(users).values([
    {
      name: "Aanya Patel",
      email: "aanya@vardayini.com",
      phone: "9876543210",
      passwordHash,
      role: "customer",
    },
    {
      name: "Vardayini Admin",
      email: "admin@vardayini.com",
      phone: "9000000000",
      passwordHash: adminHash,
      role: "admin",
    },
  ]);

  const categoryRows = await db
    .insert(categories)
    .values([
      {
        name: "Traditional Mithai",
        slug: "traditional-mithai",
        description: "Classic Gujarati and pan-Indian mithai made fresh in ghee.",
        imageUrl: "/images/kaju-katli.jpg",
        sortOrder: 1,
      },
      {
        name: "Ladoos",
        slug: "ladoos",
        description: "Festival ladoos rolled by hand, rich with saffron and ghee.",
        imageUrl: "/images/motichoor.jpg",
        sortOrder: 2,
      },
      {
        name: "Bengali Specials",
        slug: "bengali-specials",
        description: "Syrupy chenna sweets — rasgulla, rasmalai and rajbhog.",
        imageUrl: "/images/rasmalai.jpg",
        sortOrder: 3,
      },
      {
        name: "Dry Fruit Royals",
        slug: "dry-fruit-royals",
        description: "Premium kaju, pista and anjeer mithai for gifting.",
        imageUrl: "/images/kaju-katli.jpg",
        sortOrder: 4,
      },
      {
        name: "Gift Hampers",
        slug: "gift-hampers",
        description: "Assorted boxes wrapped for weddings, Diwali and corporate gifting.",
        imageUrl: "/images/hamper.jpg",
        sortOrder: 5,
      },
      {
        name: "Namkeen & Farsan",
        slug: "namkeen-farsan",
        description: "Crunchy Gujarati farsan to balance every sweet box.",
        imageUrl: "/images/namkeen.jpg",
        sortOrder: 6,
      },
    ])
    .returning();

  const cat = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

  const productData: {
    category: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    tags: string;
    isFeatured: boolean;
    variants: { weight: string; sku: string; price: number; discountedPrice?: number; stock: number }[];
  }[] = [
    {
      category: "dry-fruit-royals",
      name: "Kaju Katli",
      slug: "kaju-katli",
      description:
        "Silky cashew diamonds finished with edible silver leaf. Our most gifted mithai — melt-in-mouth, never grainy, made with premium kaju.",
      imageUrl: "/images/kaju-katli.jpg",
      tags: "best_seller,premium,gift",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "KK-250", price: 320, discountedPrice: 289, stock: 80 },
        { weight: "500 g", sku: "KK-500", price: 620, discountedPrice: 559, stock: 60 },
        { weight: "1 kg", sku: "KK-1000", price: 1199, discountedPrice: 1099, stock: 40 },
      ],
    },
    {
      category: "ladoos",
      name: "Motichoor Ladoo",
      slug: "motichoor-ladoo",
      description:
        "Tiny boondi pearls fried in ghee, soaked in saffron syrup and rolled into festive orange globes. A wedding favourite.",
      imageUrl: "/images/motichoor.jpg",
      tags: "best_seller,festival",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "ML-250", price: 220, stock: 70 },
        { weight: "500 g", sku: "ML-500", price: 420, discountedPrice: 389, stock: 55 },
        { weight: "1 kg", sku: "ML-1000", price: 799, discountedPrice: 749, stock: 35 },
      ],
    },
    {
      category: "traditional-mithai",
      name: "Gulab Jamun",
      slug: "gulab-jamun",
      description:
        "Soft khoya globes fried to a deep caramel and soaked overnight in rose-cardamom syrup. Serve warm.",
      imageUrl: "/images/gulab-jamun.jpg",
      tags: "best_seller,new_arrival",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "GJ-250", price: 180, stock: 90 },
        { weight: "500 g", sku: "GJ-500", price: 340, discountedPrice: 319, stock: 70 },
        { weight: "1 kg", sku: "GJ-1000", price: 640, discountedPrice: 599, stock: 40 },
      ],
    },
    {
      category: "bengali-specials",
      name: "Kesar Rasmalai",
      slug: "kesar-rasmalai",
      description:
        "Pillowy chenna discs floating in chilled saffron milk, finished with pista slivers. Our Bengali counter bestseller.",
      imageUrl: "/images/rasmalai.jpg",
      tags: "premium,best_seller",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "KR-250", price: 260, stock: 50 },
        { weight: "500 g", sku: "KR-500", price: 499, discountedPrice: 459, stock: 40 },
      ],
    },
    {
      category: "bengali-specials",
      name: "Sponge Rasgulla",
      slug: "sponge-rasgulla",
      description:
        "Cloud-light spongy rasgullas in light sugar syrup. Best chilled. Packed in leak-proof mithai dabbas.",
      imageUrl: "/images/rasmalai.jpg",
      tags: "new_arrival",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "RG-250", price: 160, stock: 65 },
        { weight: "500 g", sku: "RG-500", price: 300, discountedPrice: 279, stock: 50 },
        { weight: "1 kg", sku: "RG-1000", price: 560, stock: 30 },
      ],
    },
    {
      category: "traditional-mithai",
      name: "Malai Peda",
      slug: "malai-peda",
      description:
        "Slow-cooked milk pedas with saffron and crushed pistachio. Creamy, grainy in the Mathura style.",
      imageUrl: "/images/peda.jpg",
      tags: "best_seller",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "MP-250", price: 210, stock: 75 },
        { weight: "500 g", sku: "MP-500", price: 399, discountedPrice: 369, stock: 45 },
      ],
    },
    {
      category: "traditional-mithai",
      name: "Jalebi",
      slug: "jalebi",
      description:
        "Crisp saffron spirals fried to order and dunked in sugar syrup. Best eaten within hours — we pack them last.",
      imageUrl: "/images/jalebi.jpg",
      tags: "new_arrival,festival",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "JB-250", price: 140, stock: 100 },
        { weight: "500 g", sku: "JB-500", price: 260, stock: 80 },
      ],
    },
    {
      category: "traditional-mithai",
      name: "Soan Papdi",
      slug: "soan-papdi",
      description:
        "Flaky, melt-away soan papdi with roasted gram and ghee. A tin that never lasts the train journey home.",
      imageUrl: "/images/peda.jpg",
      tags: "gift",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "SP-250", price: 150, stock: 90 },
        { weight: "500 g", sku: "SP-500", price: 280, discountedPrice: 259, stock: 60 },
      ],
    },
    {
      category: "traditional-mithai",
      name: "Mysore Pak",
      slug: "mysore-pak",
      description:
        "The porous, ghee-rich Mysore pak — breaks into golden crumbs. Made in small batches every morning.",
      imageUrl: "/images/kaju-katli.jpg",
      tags: "premium",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "MY-250", price: 240, stock: 40 },
        { weight: "500 g", sku: "MY-500", price: 460, discountedPrice: 429, stock: 30 },
      ],
    },
    {
      category: "ladoos",
      name: "Besan Ladoo",
      slug: "besan-ladoo",
      description:
        "Slow-roasted gram flour ladoos with ghee and cardamom. The taste of every Gujarati kitchen in winter.",
      imageUrl: "/images/motichoor.jpg",
      tags: "festival",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "BL-250", price: 190, stock: 55 },
        { weight: "500 g", sku: "BL-500", price: 360, discountedPrice: 339, stock: 40 },
      ],
    },
    {
      category: "dry-fruit-royals",
      name: "Pista Roll",
      slug: "pista-roll",
      description:
        "Bright pistachio rolls wrapped around a sweet khoya centre. A royal dry-fruit mithai for premium hampers.",
      imageUrl: "/images/kaju-katli.jpg",
      tags: "premium,gift",
      isFeatured: true,
      variants: [
        { weight: "250 g", sku: "PR-250", price: 420, discountedPrice: 389, stock: 35 },
        { weight: "500 g", sku: "PR-500", price: 799, discountedPrice: 749, stock: 22 },
      ],
    },
    {
      category: "dry-fruit-royals",
      name: "Anjeer Barfi",
      slug: "anjeer-barfi",
      description:
        "Fig and mixed-nut barfi with no added sugar beyond the fruit. Dense, wholesome, and gift-ready.",
      imageUrl: "/images/peda.jpg",
      tags: "premium,new_arrival",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "AB-250", price: 380, stock: 28 },
        { weight: "500 g", sku: "AB-500", price: 740, discountedPrice: 699, stock: 18 },
      ],
    },
    {
      category: "gift-hampers",
      name: "Royal Assortment Box",
      slug: "royal-assortment-box",
      description:
        "A curated mix of kaju katli, motichoor, peda and pista roll in a gold-foil box. The house gift since 1986.",
      imageUrl: "/images/hamper.jpg",
      tags: "gift,premium,combo,best_seller",
      isFeatured: true,
      variants: [
        { weight: "500 g box", sku: "RB-500", price: 749, discountedPrice: 699, stock: 40 },
        { weight: "1 kg box", sku: "RB-1000", price: 1399, discountedPrice: 1299, stock: 25 },
      ],
    },
    {
      category: "gift-hampers",
      name: "Diwali Heritage Hamper",
      slug: "diwali-heritage-hamper",
      description:
        "Mithai, dry fruits, a diya and a handwritten shubhkamna card. Corporate and family gifting in one hamper.",
      imageUrl: "/images/hamper.jpg",
      tags: "gift,festival,combo",
      isFeatured: true,
      variants: [
        { weight: "Deluxe", sku: "DH-DLX", price: 1899, discountedPrice: 1699, stock: 20 },
        { weight: "Royal", sku: "DH-RYL", price: 2899, discountedPrice: 2599, stock: 12 },
      ],
    },
    {
      category: "namkeen-farsan",
      name: "Vardayini Mixed Namkeen",
      slug: "mixed-namkeen",
      description:
        "Sev, peanuts, fried dals and curry leaves tossed in our secret masala. The savoury half of every sweet box.",
      imageUrl: "/images/namkeen.jpg",
      tags: "best_seller",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "NM-250", price: 90, stock: 120 },
        { weight: "500 g", sku: "NM-500", price: 170, discountedPrice: 159, stock: 90 },
        { weight: "1 kg", sku: "NM-1000", price: 320, stock: 50 },
      ],
    },
    {
      category: "namkeen-farsan",
      name: "Bhavnagari Gathiya",
      slug: "bhavnagari-gathiya",
      description:
        "Soft, peppery Bhavnagari gathiya made with chilled dough and extra ghee. Best with chai and jalebi.",
      imageUrl: "/images/namkeen.jpg",
      tags: "new_arrival",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "BG-250", price: 80, stock: 100 },
        { weight: "500 g", sku: "BG-500", price: 150, stock: 70 },
      ],
    },
    {
      category: "bengali-specials",
      name: "Rajbhog",
      slug: "rajbhog",
      description:
        "Saffron-stained oversized rasgullas stuffed with dry fruit. A celebration sweet from our Bengali karigars.",
      imageUrl: "/images/rasmalai.jpg",
      tags: "premium,festival",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "RJ-250", price: 240, stock: 36 },
        { weight: "500 g", sku: "RJ-500", price: 460, discountedPrice: 429, stock: 24 },
      ],
    },
    {
      category: "ladoos",
      name: "Dry Fruit Ladoo",
      slug: "dry-fruit-ladoo",
      description:
        "Dates, almonds, cashews and poppy seeds bound with ghee. No refined sugar. Energy for fasts and travel.",
      imageUrl: "/images/motichoor.jpg",
      tags: "premium,new_arrival",
      isFeatured: false,
      variants: [
        { weight: "250 g", sku: "DL-250", price: 340, stock: 32 },
        { weight: "500 g", sku: "DL-500", price: 649, discountedPrice: 599, stock: 20 },
      ],
    },
  ];

  for (const item of productData) {
    const [created] = await db
      .insert(products)
      .values({
        categoryId: cat[item.category],
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.imageUrl,
        tags: item.tags,
        isFeatured: item.isFeatured,
      })
      .returning();

    await db.insert(productVariants).values(
      item.variants.map((variant) => ({
        productId: created.id,
        weight: variant.weight,
        sku: variant.sku,
        price: variant.price,
        discountedPrice: variant.discountedPrice ?? null,
        stock: variant.stock,
      })),
    );
  }

  await db.insert(coupons).values([
    {
      code: "FESTIVE10",
      description: "10% off on orders above ₹499",
      type: "percent",
      value: 10,
      minOrder: 499,
    },
    {
      code: "MITHAI50",
      description: "₹50 off on orders above ₹499",
      type: "flat",
      value: 50,
      minOrder: 499,
    },
    {
      code: "FREEDEL",
      description: "Free delivery on any order",
      type: "free_delivery",
      value: 0,
      minOrder: 0,
    },
  ]);

  await db.insert(stores).values([
    {
      name: "Vardayini Mandvi",
      address: "12, Mandvi Pol, opposite Mahalaxmi Temple, Mandvi",
      city: "Vadodara",
      pincode: "390001",
      phone: "+91 265 242 1186",
      hours: "8:00 AM – 10:30 PM",
      lat: "22.307200",
      lng: "73.181200",
    },
    {
      name: "Vardayini Alkapuri",
      address: "33, RC Dutt Road, Alkapuri",
      city: "Vadodara",
      pincode: "390007",
      phone: "+91 265 233 4411",
      hours: "9:00 AM – 10:00 PM",
      lat: "22.313500",
      lng: "73.171800",
    },
    {
      name: "Vardayini CG Road",
      address: "Ground Floor, Heritage Plaza, CG Road, Navrangpura",
      city: "Ahmedabad",
      pincode: "380009",
      phone: "+91 79 2646 5522",
      hours: "9:00 AM – 11:00 PM",
      lat: "23.033000",
      lng: "72.565000",
    },
  ]);
}
