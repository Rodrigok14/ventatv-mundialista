import crypto from "crypto";
import { optionalEnv } from "@/lib/env";

type SessionPayload = {
  u: string;
  exp: number; // epoch seconds
};

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecodeToString(input: string): string {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function hmacSha256(data: string, secret: string): string {
  return base64UrlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

function getSessionSecret(): string {
  return (
    optionalEnv("ADMIN_SESSION_SECRET") ??
    // Dev fallback only; set ADMIN_SESSION_SECRET in Vercel.
    "dev-only-secret-change-me"
  );
}

export function signAdminSession(username: string, ttlSeconds = 60 * 60 * 12): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { u: username, exp: now + ttlSeconds };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = hmacSha256(encoded, getSessionSecret());
  return `${encoded}.${sig}`;
}

export function verifyAdminSession(token: string | undefined | null): { ok: true; username: string } | { ok: false } {
  if (!token) return { ok: false };
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return { ok: false };

  const expected = hmacSha256(encoded, getSessionSecret());
  if (sig.length !== expected.length) return { ok: false };
  const sigOk = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!sigOk) return { ok: false };

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(encoded)) as SessionPayload;
  } catch {
    return { ok: false };
  }

  if (!payload?.u || !payload?.exp) return { ok: false };
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return { ok: false };
  return { ok: true, username: payload.u };
}
