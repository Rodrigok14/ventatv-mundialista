import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifyAdminSession } from "@/lib/adminAuth";
import { ADMIN_COOKIE_NAME } from "@/app/api/admin/_cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSession(token);
  if (!session.ok) return NextResponse.json({ ok: false }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });

  const safeName = (file.name || "imagen").replaceAll(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`images/${safeName}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ ok: true, url: blob.url });
}

