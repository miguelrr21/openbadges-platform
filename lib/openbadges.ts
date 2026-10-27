import { getIssuer, getBadgeClass, getAssertion } from "./db";
import { formatBaseUrl } from "./urls";
import {
  OpenBadgesIssuer,
  OpenBadgesBadgeClass,
  OpenBadgesAssertion
} from "./types";

export { formatBaseUrl };

export async function buildOpenBadgesIssuer(baseUrl: string): Promise<OpenBadgesIssuer> {
  const issuer = await getIssuer();
  return {
    "@context": "https://w3id.org/openbadges/v2",
    type: "Issuer",
    id: `${baseUrl}/api/badges/issuer`,
    name: issuer.name,
    url: issuer.url || baseUrl,
    image: issuer.image.startsWith("http") ? issuer.image : `${baseUrl}${issuer.image}`,
    email: issuer.email,
    description: issuer.description
  };
}

export async function buildOpenBadgesBadgeClass(
  badgeId: string,
  baseUrl: string
): Promise<OpenBadgesBadgeClass | null> {
  const badge = await getBadgeClass(badgeId);
  if (!badge) return null;

  return {
    "@context": "https://w3id.org/openbadges/v2",
    type: "BadgeClass",
    id: `${baseUrl}/api/badges/class/${badge.id}`,
    name: badge.name,
    description: badge.description,
    criteria: {
      narrative: badge.criteriaNarrative || `Certificado concedido por ${badge.name}.`
    },
    issuer: `${baseUrl}/api/badges/issuer`,
    image: badge.image.startsWith("http") ? badge.image : `${baseUrl}${badge.image}`
  };
}

export async function buildOpenBadgesAssertion(
  assertionId: string,
  baseUrl: string
): Promise<OpenBadgesAssertion | null> {
  const assertion = await getAssertion(assertionId);
  if (!assertion) return null;

  return {
    "@context": "https://w3id.org/openbadges/v2",
    type: "Assertion",
    id: `${baseUrl}/api/badges/assertion/${assertion.id}`,
    recipient: {
      type: "email",
      hashed: assertion.recipient.hashed,
      identity: assertion.recipient.identity,
      salt: assertion.recipient.salt
    },
    issuedOn: assertion.issuedOn,
    verification: {
      type: "HostedBadge"
    },
    badge: `${baseUrl}/api/badges/class/${assertion.badgeClassId}`
  };
}
