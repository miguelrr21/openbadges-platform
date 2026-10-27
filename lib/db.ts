import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { IssuerProfile, BadgeClassDefinition, AssertionRecord } from "./types";

interface DatabaseSchema {
  issuer: IssuerProfile;
  badges: Record<string, BadgeClassDefinition>;
  assertions: Record<string, AssertionRecord>;
}

const REDIS_KEY = "openbadges_db_v2";
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");
const TMP_PATH = path.join("/tmp", "openbadges_store.json");

let memoryCache: DatabaseSchema | null = null;

function getRedisClient(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_API_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

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

function loadLocalFile(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Try DB_PATH
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      memoryCache = JSON.parse(content);
      return memoryCache!;
    }
  } catch {}

  // 2. Try /tmp path
  try {
    if (fs.existsSync(TMP_PATH)) {
      const content = fs.readFileSync(TMP_PATH, "utf-8");
      memoryCache = JSON.parse(content);
      return memoryCache!;
    }
  } catch {}

  const seed = getSeedData();
  memoryCache = seed;
  saveLocalFile(seed);
  return seed;
}

function saveLocalFile(data: DatabaseSchema): void {
  memoryCache = data;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return;
  } catch {
    try {
      fs.writeFileSync(TMP_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch {}
  }
}

async function loadDatabase(): Promise<DatabaseSchema> {
  const redis = getRedisClient();
  if (redis) {
    try {
      let raw = await redis.get<any>(REDIS_KEY);

      // Handle if returned as string
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw);
        } catch {}
      }

      if (raw && typeof raw === "object") {
        if (!raw.badges) raw.badges = {};
        if (!raw.assertions) raw.assertions = {};
        if (!raw.issuer) raw.issuer = getSeedData().issuer;

        memoryCache = raw;
        return raw;
      }

      // Seed if key does not exist yet
      const seed = loadLocalFile();
      await redis.set(REDIS_KEY, JSON.stringify(seed));
      memoryCache = seed;
      return seed;
    } catch (err) {
      console.error("Error reading from Redis/KV:", err);
    }
  }

  return loadLocalFile();
}

async function saveDatabase(data: DatabaseSchema): Promise<void> {
  memoryCache = data;
  saveLocalFile(data);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Error writing to Redis/KV:", err);
    }
  }
}

export async function getIssuer(): Promise<IssuerProfile> {
  const db = await loadDatabase();
  return db.issuer;
}

export async function updateIssuer(profile: Partial<IssuerProfile>): Promise<IssuerProfile> {
  const db = await loadDatabase();
  db.issuer = { ...db.issuer, ...profile };
  await saveDatabase(db);
  return db.issuer;
}

export async function getBadgeClass(id: string): Promise<BadgeClassDefinition | null> {
  const db = await loadDatabase();
  return db.badges[id] || null;
}

export async function getAllBadgeClasses(): Promise<BadgeClassDefinition[]> {
  const db = await loadDatabase();
  return Object.values(db.badges);
}

export async function createBadgeClass(badge: BadgeClassDefinition): Promise<BadgeClassDefinition> {
  const db = await loadDatabase();
  db.badges[badge.id] = badge;
  await saveDatabase(db);
  return badge;
}

export async function getAssertion(id: string): Promise<AssertionRecord | null> {
  const db = await loadDatabase();
  return db.assertions[id] || null;
}

export async function getAllAssertions(): Promise<AssertionRecord[]> {
  const db = await loadDatabase();
  return Object.values(db.assertions);
}

export async function getAssertionsByEmail(email: string): Promise<AssertionRecord[]> {
  const db = await loadDatabase();
  const lower = email.trim().toLowerCase();
  return Object.values(db.assertions).filter(
    (a) => a.recipient.email?.toLowerCase() === lower
  );
}

export async function createAssertion(assertion: AssertionRecord): Promise<AssertionRecord> {
  const db = await loadDatabase();
  db.assertions[assertion.id] = assertion;
  await saveDatabase(db);
  return assertion;
}
