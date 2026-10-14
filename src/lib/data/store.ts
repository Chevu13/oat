import type {
  Category,
  CheckoutInput,
  DashboardStats,
  Order,
  OrderFilter,
  OrderStatus,
  Product,
  ProductInput,
  Inquiry,
  InquiryInput,
} from "@/lib/types";

/** Every backend (Supabase, local demo) implements this contract. */
export interface Store {
  listCategories(): Promise<Category[]>;
  /** Public catalog: active products only, unless includeInactive (admin). */
  listProducts(opts?: { includeInactive?: boolean }): Promise<Product[]>;
  /** Product ids ordered by units sold (cancelled orders excluded). */
  bestsellerIds(limit: number): Promise<string[]>;
  placeOrder(input: CheckoutInput): Promise<{ id: string; number: string }>;
  getOrderPublic(id: string): Promise<Order | null>;

  // admin — callers must run requireAdmin() first
  listOrders(filter: OrderFilter): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
  getProductById(id: string): Promise<Product | null>;
  saveProduct(input: ProductInput): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  saveCategory(input: { id?: string; slug: string; name: string; description: string | null }): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  reorderCategories(ids: string[]): Promise<void>;
  uploadImage(file: File): Promise<string>;
  dashboard(): Promise<DashboardStats>;

  /** Public: the Saradnja contact form. */
  saveInquiry(input: InquiryInput): Promise<void>;
  // admin
  listInquiries(): Promise<Inquiry[]>;
  setInquiryDone(id: string, done: boolean): Promise<void>;
}
