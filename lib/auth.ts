import crypto from "crypto";

// Cryptographic one-way SHA-256 hash & salt.
// The raw password is NEVER stored in the repository.
const STORED_ADMIN_SALT = "a0f3f136b8ea326b8cddeb948c5991a9";
const STORED_ADMIN_HASH = "d59337fb2d0669343167d04bf60aee144a608ea272b2d6bc86ea5e6e86f9aece";

// Internal signing secret for session tokens
const SESSION_SECRET = STORED_ADMIN_HASH;

export function validateAdminPassword(inputPassword: string): boolean {
  if (!inputPassword) return false;

  // 1. If an environment variable is configured in Vercel, it takes priority
  if (process.env.ADMIN_PASSWORD && inputPassword === process.env.ADMIN_PASSWORD) {
    return true;
  }

  // 2. Validate against one-way salted SHA-256 hash
  try {
    const computedHash = crypto
      .createHash("sha256")
      .update(inputPassword + STORED_ADMIN_SALT)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "utf-8"),
      Buffer.from(STORED_ADMIN_HASH, "utf-8")
    );
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`admin-session-${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const [timestampStr, hmac] = token.split(".");
    if (!timestampStr || !hmac) return false;

    const timestamp = parseInt(timestampStr, 10);
    // Valid for 7 days
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedHmac = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`admin-session-${timestampStr}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(hmac, "utf-8"),
      Buffer.from(expectedHmac, "utf-8")
    );
  } catch {
    return false;
  }
}
