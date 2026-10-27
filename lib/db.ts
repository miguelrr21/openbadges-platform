import fs from "fs";
import path from "path";
import { IssuerProfile, BadgeClassDefinition, AssertionRecord } from "./types";
import { hashRecipientEmail } from "./crypto";

interface DatabaseSchema {
  issuer: IssuerProfile;
  badges: Record<string, BadgeClassDefinition>;
  assertions: Record<string, AssertionRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");

const DEFAULT_SALT = "gdguam_salt_2026";

function getSeedData(): DatabaseSchema {
  const hectorIdentity = hashRecipientEmail("hector.tablero@gdguam.es", DEFAULT_SALT);

  return {
    issuer: {
      id: "/api/badges/issuer",
      name: "Google Developer Group on Campus - Universidad Autónoma de Madrid",
      url: "https://gdguam.es",
      email: "gdguam@gmail.com",
      image: "https://gdguam.es/logo/logo.svg",
      description: "Google Developer Group on Campus - UAM es un grupo universitario sin ánimo de lucro orientado a desarrolladores y estudiantes de tecnología.",
      signers: [
        { name: "José Arbeláez Nieto", role: "President" },
        { name: "Héctor Tablero Díaz", role: "Vicepresident" }
      ]
    },
    badges: {
      "69679d9fa12d24f4a673b54b": {
        id: "69679d9fa12d24f4a673b54b",
        name: "Hackathon GDG x CEUAM",
        description: "Demostración de habilidades excepcionales en diseño, desarrollo y resolución de retos tecnológicos durante el Hackathon GDG x CEUAM.",
        criteriaNarrative: "Certificate awarded to Héctor Tablero Díaz for Hackathon GDG x CEUAM.",
        image: "https://gdguam.es/logo/logo.svg",
        theme: "hackathon",
        eventDates: "March 21, 2026 - March 22, 2026",
        tags: ["Hackathon", "Innovation", "GDG", "AI", "Development"],
        createdAt: "2026-01-14T13:43:59.019Z"
      },
      "6ae00a61a65e3dd2d40bcb0f": {
        id: "6ae00a61a65e3dd2d40bcb0f",
        name: "Google Tech Summit & Workshop Series",
        description: "Participación activa en sesiones técnicas, desarrollo de proyectos colaborativos y aprendizaje de tecnologías punteras.",
        criteriaNarrative: "Certificate awarded to Héctor Tablero Díaz for participation in Google Tech Summit.",
        image: "https://gdguam.es/logo/logo.svg",
        theme: "gdg",
        eventDates: "October 27, 2026",
        tags: ["Workshop", "Tech Talk", "Google Cloud", "Community"],
        createdAt: "2026-10-27T02:20:17.104Z"
      }
    },
    assertions: {
      "69679d9fa12d24f4a673b54b": {
        id: "69679d9fa12d24f4a673b54b",
        badgeClassId: "69679d9fa12d24f4a673b54b",
        recipient: {
          type: "email",
          hashed: true,
          identity: "sha256$e3ffc92ddd62238494d803627f032fc7fe0676c02891a497d90b5ed845d1557c",
          salt: DEFAULT_SALT,
          name: "Héctor Tablero Díaz",
          email: "hector.tablero@gdguam.es"
        },
        issuedOn: "2026-01-14T13:43:59.019Z",
        metadata: {
          rank: "Gold Medal",
          group: "Test Group",
          role: "Participant & Winner",
          signers: [
            { name: "José Arbeláez Nieto", role: "President" },
            { name: "Héctor Tablero Díaz", role: "Vicepresident" }
          ]
        }
      },
      "6ae00a61a65e3dd2d40bcb0f": {
        id: "6ae00a61a65e3dd2d40bcb0f",
        badgeClassId: "6ae00a61a65e3dd2d40bcb0f",
        recipient: {
          type: "email",
          hashed: true,
          identity: "sha256$e3ffc92ddd62238494d803627f032fc7fe0676c02891a497d90b5ed845d1557c",
          salt: DEFAULT_SALT,
          name: "Héctor Tablero Díaz",
          email: "hector.tablero@gdguam.es"
        },
        issuedOn: "2026-10-27T02:20:17.104Z",
        metadata: {
          role: "Attendee",
          signers: [
            { name: "José Arbeláez Nieto", role: "President" },
            { name: "Héctor Tablero Díaz", role: "Vicepresident" }
          ]
        }
      }
    }
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
