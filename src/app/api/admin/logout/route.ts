import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/app/api/admin/_cookies";

export const runtime = "nodejs";

export async function POST() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}

