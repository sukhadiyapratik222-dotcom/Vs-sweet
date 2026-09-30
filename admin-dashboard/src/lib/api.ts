export interface HeroPhoto {
  id: string;
  name: string;
  image: string;
  category?: string;
  active: boolean;
  order: number;
}

export interface UiConfig {
  heroPhotos: HeroPhoto[];
  heroSettings: {
    autoScroll: boolean;
    intervalSeconds: number;
  };
  announcement: {
    enabled: boolean;
    badge: string;
    text: string;
    linkText: string;
    linkUrl: string;
  };
  storeInfo: {
    name: string;
    tagline: string;
    established: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    hours: string;
  };
  promotions: {
    couponCode: string;
    discountPercent: number;
    description: string;
    isActive: boolean;
  };
}

export interface ProductItem {
  id: number;
  productId?: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  tags: string;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  variantId: number;
  sku: string;
  weight: string;
  price: number;
  stock: number;
}

export interface OrderItem {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliverySlot: string;
  guestName?: string | null;
  guestPhone?: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  weight: string;
  stock: number;
  price: number;
  name: string;
}

const STORE_API_BASE = process.env.NEXT_PUBLIC_STORE_API || "http://localhost:3000";
const ADMIN_KEY = "vardayini-admin-secret";

export const api = {
  // Check storefront connectivity
  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${STORE_API_BASE}/api/ui-config`, {
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // UI Configuration
  async getUiConfig(): Promise<UiConfig> {
    const res = await fetch(`${STORE_API_BASE}/api/ui-config`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load UI configuration");
    return res.json();
  },

  async updateUiConfig(data: Partial<UiConfig>): Promise<{ success: boolean; config: UiConfig }> {
    const res = await fetch(`${STORE_API_BASE}/api/ui-config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update UI configuration");
    return res.json();
  },

  // Products
  async getProducts(): Promise<ProductItem[]> {
    const res = await fetch(`${STORE_API_BASE}/api/admin/products`, {
      headers: {
        "x-admin-key": ADMIN_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    return data.items || [];
  },

  async createProduct(product: Partial<ProductItem>): Promise<any> {
    const res = await fetch(`${STORE_API_BASE}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  async updateProduct(product: Partial<ProductItem>): Promise<any> {
    const res = await fetch(`${STORE_API_BASE}/api/admin/products`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  // Orders
  async getOrders(): Promise<OrderItem[]> {
    const res = await fetch(`${STORE_API_BASE}/api/orders`, {
      headers: {
        "x-admin-key": ADMIN_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load orders");
    const data = await res.json();
    return data.orders || [];
  },

  async updateOrderStatus(orderNumber: string, status: string): Promise<any> {
    const res = await fetch(`${STORE_API_BASE}/api/admin/orders/${orderNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return res.json();
  },

  // Inventory
  async getInventory(): Promise<{ variants: InventoryItem[]; lowStock: InventoryItem[] }> {
    const res = await fetch(`${STORE_API_BASE}/api/admin/inventory`, {
      headers: {
        "x-admin-key": ADMIN_KEY,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to load inventory");
    return res.json();
  },

  async updateStock(id: number, stock: number): Promise<any> {
    const res = await fetch(`${STORE_API_BASE}/api/admin/inventory`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_KEY,
      },
      body: JSON.stringify({ id, stock }),
    });
    if (!res.ok) throw new Error("Failed to update stock");
    return res.json();
  },
};
