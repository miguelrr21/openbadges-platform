import crypto from "crypto";

export function hashRecipientEmail(email: string, salt: string = ""): { identity: string; salt: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const effectiveSalt = salt || crypto.randomBytes(8).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(normalizedEmail + effectiveSalt)
    .digest("hex");
  
  return {
    identity: `sha256$${hash}`,
    salt: effectiveSalt,
  };
}

export function generateAssertionId(): string {
  // Return a 24-char hex string (MongoDB-like ObjectId style, like 69679d9fa12d24f4a673b54b)
  return crypto.randomBytes(12).toString("hex");
}
