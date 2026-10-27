export const MAX_BULK_RECIPIENTS = 150;

// Standard RFC 5322 compliant regex for practical email validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean.length > 254) return false;
  return EMAIL_REGEX.test(clean);
}

export function sanitizeText(text?: string | null, maxLength: number = 200): string {
  if (!text) return "";
  return text.trim().slice(0, maxLength);
}
