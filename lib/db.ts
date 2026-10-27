import fs from "fs";
import path from "path";
import { IssuerProfile, BadgeClassDefinition, AssertionRecord } from "./types";

interface DatabaseSchema {
  issuer: IssuerProfile;
  badges: Record<string, BadgeClassDefinition>;
  assertions: Record<string, AssertionRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");

export function getSeedData(): DatabaseSchema {
  return {
    issuer: {
      id: "/api/badges/issuer",
      name: "Google Developer Group on Campus - Universidad de Huelva",
      url: "https://gdguhu.es",
      email: "gdguhu@gmail.com",
      image: "/logo/logo.svg",
      description: "GDGoC UHU (Google Developer Group on Campus Universidad de Huelva) es la comunidad tecnológica universitaria de la Universidad de Huelva.",
      signers: [
        { name: "Organización GDGoC UHU", role: "Chapter Lead" },
        { name: "Coordinación Académica", role: "Faculty Advisor" }
      ]
    },
    badges: {},
    assertions: {}
  };
}

function ensureDataFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const seed = getSeedData();
      fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
      return seed;
    }
    const content = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading db file, using seed fallback:", err);
    return getSeedData();
  }
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

export function getIssuer(): IssuerProfile {
  const db = ensureDataFile();
  return db.issuer;
}

export function updateIssuer(profile: Partial<IssuerProfile>): IssuerProfile {
  const db = ensureDataFile();
  db.issuer = { ...db.issuer, ...profile };
  saveDatabase(db);
  return db.issuer;
}

export function getBadgeClass(id: string): BadgeClassDefinition | null {
  const db = ensureDataFile();
  return db.badges[id] || null;
}

export function getAllBadgeClasses(): BadgeClassDefinition[] {
  const db = ensureDataFile();
  return Object.values(db.badges);
}

export function createBadgeClass(badge: BadgeClassDefinition): BadgeClassDefinition {
  const db = ensureDataFile();
  db.badges[badge.id] = badge;
  saveDatabase(db);
  return badge;
}

export function getAssertion(id: string): AssertionRecord | null {
  const db = ensureDataFile();
  return db.assertions[id] || null;
}

export function getAllAssertions(): AssertionRecord[] {
  const db = ensureDataFile();
  return Object.values(db.assertions);
}

export function getAssertionsByEmail(email: string): AssertionRecord[] {
  const db = ensureDataFile();
  const lower = email.trim().toLowerCase();
  return Object.values(db.assertions).filter(
    (a) => a.recipient.email?.toLowerCase() === lower
  );
}

export function createAssertion(assertion: AssertionRecord): AssertionRecord {
  const db = ensureDataFile();
  db.assertions[assertion.id] = assertion;
  saveDatabase(db);
  return assertion;
}
