import { head, list, put } from "@vercel/blob";
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  subtitle: z.string().optional().default(""),
  priceArs: z.number().int().positive(),
  imageUrl: z.string().url().optional().default(""),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  stockNote: z.string().optional().default("Stock limitado"),
});

export type Product = z.infer<typeof ProductSchema>;

const CatalogSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  products: z.array(ProductSchema),
});

export type Catalog = z.infer<typeof CatalogSchema>;

const CATALOG_POINTER_PATHNAME = "catalog/catalog-pointer.json";
const DEFAULT_PRODUCTS_PATHNAME = "catalog/products.json";

function nowIso(): string {
  return new Date().toISOString();
}

function defaultCatalog(): Catalog {
  return {
    version: 1,
    updatedAt: nowIso(),
    products: [
      {
        id: "tv-55-4k",
        title: "Smart TV 55” 4K Mundialista",
        subtitle: "Edición Argentina — imagen brutal para ver cada jugada",
        priceArs: 999999,
        imageUrl: "",
        featured: true,
        active: true,
        stockNote: "Stock limitado (Mundial)",
      },
      {
        id: "tv-43-4k",
        title: "Smart TV 43” 4K Full Fútbol",
        subtitle: "Listo para el Mundial — colores vivos y sonido potente",
        priceArs: 699999,
        imageUrl: "",
        featured: false,
        active: true,
        stockNote: "Últimas unidades",
      },
    ],
  };
}

async function readJsonPublic(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`);
  return res.json();
}

export async function getCatalog(): Promise<Catalog> {
  try {
    const pointerInfo = await head(CATALOG_POINTER_PATHNAME);
    const pointer = await readJsonPublic(pointerInfo.url);
    const parsedPointer = z.object({ productsUrl: z.string().url() }).safeParse(pointer);
    if (!parsedPointer.success) throw new Error("Invalid catalog pointer");

    const productsPayload = await readJsonPublic(parsedPointer.data.productsUrl);
    const parsedCatalog = CatalogSchema.safeParse(productsPayload);
    if (!parsedCatalog.success) throw new Error("Invalid catalog data");
    return parsedCatalog.data;
  } catch {
    try {
      const info = await head(DEFAULT_PRODUCTS_PATHNAME);
      const payload = await readJsonPublic(info.url);
      const parsed = CatalogSchema.safeParse(payload);
      if (!parsed.success) throw new Error("Invalid catalog data");
      return parsed.data;
    } catch {
      return defaultCatalog();
    }
  }
}

export async function saveCatalog(catalog: Catalog): Promise<void> {
  const parsed = CatalogSchema.safeParse(catalog);
  if (!parsed.success) throw new Error("Invalid catalog");

  const json = JSON.stringify(parsed.data);
  const saved = await put(DEFAULT_PRODUCTS_PATHNAME, json, {
    access: "public",
    contentType: "application/json; charset=utf-8",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });

  await put(
    CATALOG_POINTER_PATHNAME,
    JSON.stringify({ productsUrl: saved.url, updatedAt: nowIso() }),
    {
      access: "public",
      contentType: "application/json; charset=utf-8",
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
    }
  );
}

export async function upsertProduct(nextProduct: Product): Promise<Catalog> {
  const catalog = await getCatalog();
  const validated = ProductSchema.parse(nextProduct);

  const products = catalog.products.slice();
  const idx = products.findIndex((p) => p.id === validated.id);
  if (idx >= 0) products[idx] = validated;
  else products.unshift(validated);

  const next: Catalog = { version: 1, updatedAt: nowIso(), products };
  await saveCatalog(next);
  return next;
}

export async function deleteProduct(productId: string): Promise<Catalog> {
  const catalog = await getCatalog();
  const products = catalog.products.filter((p) => p.id !== productId);
  const next: Catalog = { version: 1, updatedAt: nowIso(), products };
  await saveCatalog(next);
  return next;
}

export async function listImages(prefix = "images/"): Promise<string[]> {
  const items: string[] = [];
  let cursor: string | undefined;
  while (true) {
    const res = await list({ prefix, cursor, limit: 1000 });
    for (const blob of res.blobs) items.push(blob.url);
    if (!res.hasMore) break;
    cursor = res.cursor ?? undefined;
  }
  return items;
}

