import { NextResponse } from "next/server";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { requiredEnv, optionalEnv } from "@/lib/env";
import { getCatalog } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(5).default(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.id === parsed.data.productId && p.active);
  if (!product) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const mpAccessToken = requiredEnv("MERCADOPAGO_ACCESS_TOKEN");
  const siteUrl = optionalEnv("SITE_URL");

  const client = new MercadoPagoConfig({ accessToken: mpAccessToken, options: { timeout: 5000 } });
  const preference = new Preference(client);

  const title = product.subtitle ? `${product.title} — ${product.subtitle}` : product.title;
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const inferred = `${proto}://${host}`;
  const backUrlBase = siteUrl ?? inferred ?? "http://localhost:3000";

  const result = await preference.create({
    body: {
      items: [
        {
          id: product.id,
          title,
          quantity: parsed.data.quantity,
          unit_price: product.priceArs,
          currency_id: "ARS",
          picture_url: product.imageUrl || undefined,
        },
      ],
      back_urls: {
        success: `${backUrlBase}/gracias?status=success`,
        pending: `${backUrlBase}/gracias?status=pending`,
        failure: `${backUrlBase}/gracias?status=failure`,
      },
      auto_return: "approved",
      external_reference: `mundial-tv:${product.id}:${Date.now()}`,
      statement_descriptor: "MUNDIAL TV",
    },
  });

  return NextResponse.json({
    ok: true,
    init_point: result.init_point ?? null,
    sandbox_init_point: result.sandbox_init_point ?? null,
  });
}
