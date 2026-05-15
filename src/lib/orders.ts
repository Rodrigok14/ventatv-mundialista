import { head, put } from "@vercel/blob";
import { z } from "zod";

export const CustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(8),
  deliveryWindow: z.string().min(3),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productTitle: z.string(),
  priceArs: z.number().int().positive(),
  quantity: z.number().int().min(1).max(5),
  customer: CustomerSchema,
  createdAt: z.string(),
  paymentId: z.string().optional(),
  paymentStatus: z.string().optional(),
  warrantySentAt: z.string().optional(),
  warrantyPdfUrl: z.string().url().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

function orderPath(orderId: string) {
  return `orders/${orderId}.json`;
}

export function createOrderId() {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function readJsonPublic(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
  return res.json();
}

export async function saveOrder(order: Order): Promise<Order> {
  const parsed = OrderSchema.parse(order);
  await put(orderPath(parsed.id), JSON.stringify(parsed), {
    access: "public",
    contentType: "application/json; charset=utf-8",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
  return parsed;
}

export async function getOrder(orderId: string): Promise<Order> {
  const info = await head(orderPath(orderId));
  const payload = await readJsonPublic(info.url);
  return OrderSchema.parse(payload);
}

export async function markWarrantySent(order: Order, paymentId: string, paymentStatus: string, warrantyPdfUrl: string): Promise<Order> {
  const next: Order = {
    ...order,
    paymentId,
    paymentStatus,
    warrantyPdfUrl,
    warrantySentAt: new Date().toISOString(),
  };
  return saveOrder(next);
}

