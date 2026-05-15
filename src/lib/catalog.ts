import { del, head, list, put } from "@vercel/blob";
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  subtitle: z.string().optional().default(""),
  priceArs: z.number().int().positive(),
  previousPriceArs: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().default(""),
  galleryImages: z.array(z.string().url()).max(2).optional().default([]),
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

function catalogSnapshotPath(): string {
  return `catalog/products-${Date.now()}.json`;
}

function defaultCatalog(): Catalog {
  return {
    version: 1,
    updatedAt: nowIso(),
    products: [
      {
        id: "enova-32-hd-google-tv",
        title: "Enova Smart TV 32” HD Google TV",
        subtitle: "Compacta, smart y lista para ver el Mundial en dormitorio, cocina o living chico",
        priceArs: 249999,
        previousPriceArs: 299999,
        imageUrl: "https://ventatv-mundialista.vercel.app/images/products/enova-32-showcase.svg",
        galleryImages: [],
        featured: true,
        active: true,
        stockNote: "Más buscada",
      },
      {
        id: "enova-43-fhd-google-tv",
        title: "Enova Smart TV 43” Full HD Google TV",
        subtitle: "Tamaño ideal para el living, Full HD y apps listas para el partido",
        priceArs: 399999,
        previousPriceArs: 459999,
        imageUrl: "https://ventatv-mundialista.vercel.app/images/products/enova-43-showcase.svg",
        galleryImages: [],
        featured: true,
        active: true,
        stockNote: "Oferta fuerte",
      },
      {
        id: "enova-55-4k-frameless",
        title: "Enova Smart TV 55” 4K UHD Frameless",
        subtitle: "La medida más equilibrada para una experiencia mundialista grande",
        priceArs: 849999,
        previousPriceArs: 949999,
        imageUrl: "https://ventatv-mundialista.vercel.app/images/products/enova-55-showcase.svg",
        galleryImages: [],
        featured: true,
        active: true,
        stockNote: "Recomendada",
      },
      {
        id: "enova-65-4k-frameless",
        title: "Enova Smart TV 65” 4K UHD Frameless",
        subtitle: "Pantalla grande, 4K y diseño sin marco para living principal",
        priceArs: 1249999,
        previousPriceArs: 1399999,
        imageUrl: "https://ventatv-mundialista.vercel.app/images/products/enova-65-showcase.svg",
        galleryImages: [],
        featured: false,
        active: true,
        stockNote: "Stock limitado",
      },
      {
        id: "enova-75-4k-frameless",
        title: "Enova Smart TV 75” 4K UHD Frameless",
        subtitle: "Formato cine en casa para juntadas grandes y máxima inmersión",
        priceArs: 1484999,
        previousPriceArs: 1649999,
        imageUrl: "https://ventatv-mundialista.vercel.app/images/products/enova-75-showcase.svg",
        galleryImages: [],
        featured: false,
        active: true,
        stockNote: "Premium",
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
  const saved = await put(catalogSnapshotPath(), json, {
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
      allowOverwrite: true,
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

export async function deleteImage(urlOrPathname: string): Promise<void> {
  await del(urlOrPathname);
}
