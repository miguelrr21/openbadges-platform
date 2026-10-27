export function formatBaseUrl(rawHost?: string | null): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
    return url.startsWith("http") ? url : `https://${url}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  if (!rawHost) {
    return "http://localhost:3000";
  }
  const protocol = rawHost.includes("localhost") || rawHost.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${rawHost}`.replace(/\/$/, "");
}

export function generateLinkedInCertUrl(
  badgeName: string,
  issuerName: string,
  assertionId: string,
  issuedOn: string,
  baseUrl: string
): string {
  const date = new Date(issuedOn);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const certUrl = `${baseUrl}/cert/${assertionId}`;

  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: badgeName,
    organizationName: issuerName,
    issueYear: year.toString(),
    issueMonth: month.toString(),
    certUrl: certUrl,
    certId: assertionId
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function generateBadgeCheckUrl(assertionId: string, baseUrl: string): string {
  const assertionUrl = `${baseUrl}/api/badges/assertion/${assertionId}`;
  return `https://badgecheck.io/?url=${encodeURIComponent(assertionUrl)}`;
}
