import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { verifyAdminSession } from "@/lib/adminAuth";
import { ADMIN_COOKIE_NAME } from "@/app/api/admin/_cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSession(token);
  if (!session.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const catalog = await getCatalog();
  return NextResponse.json({ ok: true, catalog });
}

