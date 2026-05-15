import nodemailer from "nodemailer";
import { optionalEnv, requiredEnv } from "@/lib/env";
import type { Order } from "@/lib/orders";

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

export async function sendWarrantyEmail(order: Order, paymentId: string, pdfBuffer: Buffer) {
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  const host = optionalEnv("SMTP_HOST", "smtp.gmail.com")!;
  const port = Number(optionalEnv("SMTP_PORT", "465"));
  const secure = optionalEnv("SMTP_SECURE", "true") !== "false";
  const from = optionalEnv("SMTP_FROM", `Techogar <${user}>`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: order.customer.email,
    bcc: user,
    subject: `Garantía Techogar - ${order.productTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
        <h2>Gracias por tu compra en Techogar</h2>
        <p>Recibimos tu pago aprobado por <strong>${formatArs(order.priceArs * order.quantity)}</strong>.</p>
        <p><strong>Producto:</strong> ${order.productTitle}</p>
        <p><strong>Dirección de entrega:</strong> ${order.customer.address}</p>
        <p><strong>Horario disponible:</strong> ${order.customer.deliveryWindow}</p>
        <p><strong>Comprobante Mercado Pago:</strong> ${paymentId}</p>
        <p>Adjuntamos tu garantía en PDF. Te contactaremos por WhatsApp para coordinar la entrega.</p>
      </div>
    `,
    attachments: [
      {
        filename: `garantia-techogar-${order.id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

