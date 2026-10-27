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

const DEFAULT_SALT = "gdguhu_salt_2026";

export function getSeedData(): DatabaseSchema {
  const sampleIdentity = hashRecipientEmail("asistente@alu.uhu.es", DEFAULT_SALT);

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
    badges: {
      "69679d9fa12d24f4a673b54b": {
        id: "69679d9fa12d24f4a673b54b",
        name: "Hackathon GDGoC UHU",
        description: "Reconocimiento a la participación destacada, resolución de problemas y desarrollo de software colaborativo durante el Hackathon anual de GDGoC Universidad de Huelva.",
        criteriaNarrative: "Certificado concedido por la participación y logros técnicos en el Hackathon GDGoC UHU.",
        image: "/logo/logo.svg",
        theme: "hackathon",
        eventDates: "21 - 22 de marzo de 2026",
        tags: ["Hackathon", "GDGoC UHU", "Desarrollo", "Universidad de Huelva"],
        createdAt: "2026-03-22T18:00:00.000Z"
      },
      "6ae00a61a65e3dd2d40bcb0f": {
        id: "6ae00a61a65e3dd2d40bcb0f",
        name: "Jornadas de Desarrollo & Cloud GDGoC UHU",
        description: "Certificado de asistencia a los talleres y conferencias técnicas organizadas por el Google Developer Group on Campus de la Universidad de Huelva.",
        criteriaNarrative: "Certificado de asistencia y aprovechamiento de las jornadas técnicas de GDGoC UHU.",
        image: "/logo/logo.svg",
        theme: "gdg",
        eventDates: "27 de octubre de 2026",
        tags: ["Workshop", "Cloud", "GDGoC UHU"],
        createdAt: "2026-10-27T10:00:00.000Z"
      }
    },
    assertions: {
      "69679d9fa12d24f4a673b54b": {
        id: "69679d9fa12d24f4a673b54b",
        badgeClassId: "69679d9fa12d24f4a673b54b",
        recipient: {
          type: "email",
          hashed: true,
          identity: sampleIdentity.identity,
          salt: DEFAULT_SALT,
          name: "Alejandro Rodríguez",
          email: "asistente@alu.uhu.es"
        },
        issuedOn: "2026-03-22T18:00:00.000Z",
        metadata: {
          rank: "Primer Puesto",
          group: "Equipo UHU Tech",
          role: "Participante Ganador",
          signers: [
            { name: "Equipo Directivo", role: "Lead GDGoC UHU" },
            { name: "Coordinación UHU", role: "Tutor Académico" }
          ]
        }
      },
      "6ae00a61a65e3dd2d40bcb0f": {
        id: "6ae00a61a65e3dd2d40bcb0f",
        badgeClassId: "6ae00a61a65e3dd2d40bcb0f",
        recipient: {
          type: "email",
          hashed: true,
          identity: sampleIdentity.identity,
          salt: DEFAULT_SALT,
          name: "Alejandro Rodríguez",
          email: "asistente@alu.uhu.es"
        },
        issuedOn: "2026-10-27T10:00:00.000Z",
        metadata: {
          role: "Asistente",
          signers: [
            { name: "Equipo Directivo", role: "Lead GDGoC UHU" },
            { name: "Coordinación UHU", role: "Tutor Académico" }
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
