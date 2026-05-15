import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { optionalEnv } from "@/lib/env";
import { signAdminSession } from "@/lib/adminAuth";
import { ADMIN_COOKIE_NAME, cookieOptions } from "@/app/api/admin/_cookies";

export const runtime = "nodejs";

const BodySchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const expectedUser = "rodrigo";
  const expectedPass = optionalEnv("ADMIN_PASSWORD") ?? "rodri123";

  const { username, password } = parsed.data;
  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = signAdminSession(username);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, token, cookieOptions());
  return NextResponse.json({ ok: true });
}

