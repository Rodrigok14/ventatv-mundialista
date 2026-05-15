import PDFDocument from "pdfkit";
import { put } from "@vercel/blob";
import type { Order } from "@/lib/orders";

function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

function pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function generateWarrantyPdf(order: Order, paymentId: string): Promise<{ buffer: Buffer; url: string }> {
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Garantía Techogar ${order.id}` } });
  const done = pdfToBuffer(doc);

  doc.rect(0, 0, 595.28, 120).fill("#0f172a");
  doc.fillColor("#38bdf8").fontSize(28).font("Helvetica-Bold").text("TECHO", 48, 38, { continued: true });
  doc.fillColor("#facc15").text("GAR");
  doc.fillColor("#e2e8f0").fontSize(10).font("Helvetica").text("Garantía oficial de compra - Smart TV", 50, 78);

  doc.fillColor("#0f172a").fontSize(22).font("Helvetica-Bold").text("Certificado de garantía", 48, 155);
  doc.fillColor("#334155").fontSize(11).font("Helvetica").text(`Emitido: ${new Date().toLocaleString("es-AR")}`, 48, 185);
  doc.text(`Orden: ${order.id}`, 48, 203);
  doc.text(`Comprobante Mercado Pago: ${paymentId}`, 48, 221);

  doc.roundedRect(48, 260, 500, 118, 10).strokeColor("#cbd5e1").stroke();
  doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("Producto", 68, 282);
  doc.fillColor("#334155").fontSize(11).font("Helvetica").text(order.productTitle, 68, 307);
  doc.text(`Cantidad: ${order.quantity}`, 68, 327);
  doc.text(`Importe abonado: ${formatArs(order.priceArs * order.quantity)}`, 68, 347);

  doc.roundedRect(48, 405, 500, 144, 10).strokeColor("#cbd5e1").stroke();
  doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("Cliente y entrega", 68, 427);
  doc.fillColor("#334155").fontSize(11).font("Helvetica").text(`Cliente: ${order.customer.name}`, 68, 452);
  doc.text(`Email: ${order.customer.email}`, 68, 472);
  doc.text(`Teléfono: ${order.customer.phone}`, 68, 492);
  doc.text(`Dirección: ${order.customer.address}`, 68, 512, { width: 450 });
  doc.text(`Horario disponible: ${order.customer.deliveryWindow}`, 68, 532);

  doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("Cobertura", 48, 590);
  doc.fillColor("#334155").fontSize(11).font("Helvetica").text(
    "Garantía comercial Techogar por fallas de funcionamiento, sujeta a revisión técnica, condiciones de uso normal y documentación de compra aprobada. Conservá este certificado junto con el comprobante de Mercado Pago.",
    48,
    616,
    { width: 500, lineGap: 4 }
  );
  doc.fillColor("#64748b").fontSize(9).text("Techogar - Atención por WhatsApp: 3816590235", 48, 760);

  doc.end();
  const buffer = await done;
  const saved = await put(`warranties/${order.id}.pdf`, buffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });

  return { buffer, url: saved.url };
}

