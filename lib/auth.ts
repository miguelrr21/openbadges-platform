import crypto from "crypto";

export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

export function createAdminSessionToken(): string {
  const secret = getAdminPassword();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD no configurada en las variables de entorno");
  }
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac("sha256", secret).update(`admin-session-${timestamp}`).digest("hex");
  return `${timestamp}.${hmac}`;
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const secret = getAdminPassword();
    if (!secret) return false;

    const [timestampStr, hmac] = token.split(".");
    if (!timestampStr || !hmac) return false;

    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 7 days
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedHmac = crypto.createHmac("sha256", secret).update(`admin-session-${timestampStr}`).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}
