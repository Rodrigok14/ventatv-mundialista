import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminSession } from "@/lib/adminAuth";
import { ADMIN_COOKIE_NAME } from "@/app/api/admin/_cookies";
import { deleteProduct } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ id: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const jar = await cookies();
    const token = jar.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifyAdminSession(token);
    if (!session.ok) return NextResponse.json({ ok: false }, { status: 401 });

    const json = await request.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

    const catalog = await deleteProduct(parsed.data.id);
    return NextResponse.json({ ok: true, catalog });
  } catch (error) {
    console.error("Product delete failed", error);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 500 });
  }
}
