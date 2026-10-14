export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
};

export type Variant = {
  id: string;
  product_id: string;
  name: string;
  price: number; // RSD, whole dinars
  sale_price: number | null;
  stock: number;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  images: string[];
  accent: string;
  ingredients: string | null;
  allergens: string | null;
  weight: string | null;
  /** Fields the client still has to confirm before launch — shown as warnings in admin. */
  missing_info: string[];
  is_active: boolean;
  is_featured: boolean;
  sort: number;
  created_at: string;
  variants: Variant[];
};

export const ORDER_STATUSES = ["nova", "u_obradi", "poslata", "isporucena", "otkazana"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const STATUS_LABEL: Record<OrderStatus, string> = {
  nova: "Nova",
  u_obradi: "U obradi",
  poslata: "Poslata",
  isporucena: "Isporučena",
  otkazana: "Otkazana",
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  customer_name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postal_code: string;
  note: string | null;
  payment_method: "pouzece";
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  items: OrderItem[];
};

export type CheckoutInput = {
  customer_name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postal_code: string;
  note: string | null;
  payment_method: "pouzece";
  items: { variant_id: string; quantity: number }[];
};

export type ProductInput = {
  id?: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  images: string[];
  accent: string;
  ingredients: string | null;
  allergens: string | null;
  weight: string | null;
  missing_info: string[];
  is_active: boolean;
  is_featured: boolean;
  sort: number;
  variants: { id?: string; name: string; price: number; sale_price: number | null; stock: number }[];
};

export type OrderFilter = { q?: string; status?: OrderStatus; from?: string; to?: string };

export type DashboardStats = {
  totalOrders: number;
  newOrders: number;
  totalValue: number; // excludes cancelled
  recentOrders: Order[];
  bestsellers: { product_name: string; quantity: number; revenue: number }[];
  lowStock: { product_name: string; variant_name: string; stock: number; product_id: string }[];
};

/** Thrown by placeOrder when the cart can't be fulfilled; message is customer-facing Serbian. */
export class OrderError extends Error {}
