export interface IssuerProfile {
  id: string; // URL
  name: string;
  url: string;
  email: string;
  image: string;
  description?: string;
  signers?: Array<{
    name: string;
    role: string;
    signatureUrl?: string;
  }>;
}

export interface BadgeClassDefinition {
  id: string; // e.g. "69679d9fa12d24f4a673b54b"
  name: string;
  description: string;
  image: string;
  criteriaNarrative: string;
  theme: "gdg" | "hackathon" | "classic";
  eventDates?: string;
  tags?: string[];
  createdAt: string;
}

export interface AssertionRecipient {
  type: "email";
  hashed: boolean;
  identity: string; // "sha256$<hash>"
  salt?: string;
  name?: string; // Plaintext for certificate display
  email?: string; // Plaintext for local lookup
}

export interface AssertionRecord {
  id: string; // e.g. "69679d9fa12d24f4a673b54b" or uuid
  badgeClassId: string;
  recipient: AssertionRecipient;
  issuedOn: string;
  revoked?: boolean;
  revocationReason?: string;
  metadata?: {
    rank?: string; // e.g. "Gold Medal"
    group?: string; // e.g. "Test Group"
    role?: string; // e.g. "Attendee", "Speaker", "Winner"
    signers?: Array<{
      name: string;
      role: string;
    }>;
  };
}

// Open Badges v2 Standard Representation types
export interface OpenBadgesIssuer {
  "@context": "https://w3id.org/openbadges/v2";
  type: "Issuer";
  id: string;
  name: string;
  url: string;
  image: string;
  email: string;
  description?: string;
}

export interface OpenBadgesBadgeClass {
  "@context": "https://w3id.org/openbadges/v2";
  type: "BadgeClass";
  id: string;
  name: string;
  description: string;
  criteria: {
    narrative: string;
  };
  issuer: string;
  image: string;
}

export interface OpenBadgesAssertion {
  "@context": "https://w3id.org/openbadges/v2";
  type: "Assertion";
  id: string;
  recipient: {
    type: "email";
    hashed: boolean;
    identity: string;
    salt?: string;
  };
  issuedOn: string;
  verification: {
    type: "HostedBadge";
  };
  badge: string;
}
