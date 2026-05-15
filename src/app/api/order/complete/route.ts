import { NextResponse } from "next/server";
import { z } from "zod";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { optionalEnv, requiredEnv } from "@/lib/env";
import { getOrder, markWarrantySent } from "@/lib/orders";
import { generateWarrantyPdf } from "@/lib/warranty";
import { sendWarrantyEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1).optional(),
});

function normalizePaymentId(paymentId?: string | null) {
  if (!paymentId || paymentId === "null" || paymentId === "undefined") return undefined;
  return paymentId;
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  let order;
  try {
    order = await getOrder(parsed.data.orderId);
  } catch {
    return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
  }
  const paymentId = normalizePaymentId(parsed.data.paymentId);
  if (!paymentId) return NextResponse.json({ ok: false, error: "missing_payment_id", order }, { status: 400 });

  const mpAccessToken = optionalEnv("MP_ACCESS_TOKEN") ?? requiredEnv("MERCADOPAGO_ACCESS_TOKEN");
  const client = new MercadoPagoConfig({ accessToken: mpAccessToken, options: { timeout: 5000 } });
  const payment = new Payment(client);
  const paymentData = await payment.get({ id: paymentId });
  const status = String(paymentData.status ?? "");

  if (status !== "approved") {
    return NextResponse.json({ ok: false, error: "payment_not_approved", status, order });
  }

  if (order.warrantySentAt && order.warrantyPdfUrl) {
    return NextResponse.json({ ok: true, alreadySent: true, order, whatsappUrl: buildWhatsappUrl(order, paymentId) });
  }

  const warranty = await generateWarrantyPdf(order, paymentId);
  let emailSent = true;
  let emailError: string | undefined;
  try {
    await sendWarrantyEmail(order, paymentId, warranty.buffer);
  } catch (error) {
    emailSent = false;
    emailError = error instanceof Error ? error.message : "email_failed";
  }
  const updated = emailSent ? await markWarrantySent(order, paymentId, status, warranty.url) : { ...order, paymentId, paymentStatus: status, warrantyPdfUrl: warranty.url };

  return NextResponse.json({
    ok: true,
    emailSent,
    emailError,
    order: updated,
    warrantyUrl: warranty.url,
    whatsappUrl: buildWhatsappUrl(updated, paymentId),
  });
}

function buildWhatsappUrl(order: Awaited<ReturnType<typeof getOrder>>, paymentId: string) {
  const message = [
    "Hola Rodrigo, ya realicé la compra de mi TV.",
    `Producto: ${order.productTitle}`,
    `Comprobante Mercado Pago: ${paymentId}`,
    `Nombre: ${order.customer.name}`,
    `Dirección: ${order.customer.address}`,
    `Horario disponible: ${order.customer.deliveryWindow}`,
    `Email garantía: ${order.customer.email}`,
  ].join("\n");
  return `https://wa.me/5493816590235?text=${encodeURIComponent(message)}`;
}
