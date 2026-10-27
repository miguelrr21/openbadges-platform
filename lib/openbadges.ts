import { getIssuer, getBadgeClass, getAssertion } from "./db";
import { formatBaseUrl } from "./urls";
import {
  OpenBadgesIssuer,
  OpenBadgesBadgeClass,
  OpenBadgesAssertion
} from "./types";

export { formatBaseUrl };

export function buildOpenBadgesIssuer(baseUrl: string): OpenBadgesIssuer {
  const issuer = getIssuer();
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

export function buildOpenBadgesBadgeClass(
  badgeId: string,
  baseUrl: string
): OpenBadgesBadgeClass | null {
  const badge = getBadgeClass(badgeId);
  if (!badge) return null;

  return {
    "@context": "https://w3id.org/openbadges/v2",
    type: "BadgeClass",
    id: `${baseUrl}/api/badges/class/${badge.id}`,
    name: badge.name,
    description: badge.description,
    criteria: {
      narrative: badge.criteriaNarrative || `Certificate awarded for ${badge.name}.`
    },
    issuer: `${baseUrl}/api/badges/issuer`,
    image: badge.image.startsWith("http") ? badge.image : `${baseUrl}${badge.image}`
  };
}

export function buildOpenBadgesAssertion(
  assertionId: string,
  baseUrl: string
): OpenBadgesAssertion | null {
  const assertion = getAssertion(assertionId);
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
