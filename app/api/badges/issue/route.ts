import { NextRequest, NextResponse } from "next/server";
import {
  createAssertion,
  createBadgeClass,
  getAllAssertions,
  getAllBadgeClasses,
  getBadgeClass,
  getIssuer
} from "@/lib/db";
import { generateAssertionId, hashRecipientEmail } from "@/lib/crypto";
import { formatBaseUrl } from "@/lib/openbadges";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const badges = getAllBadgeClasses();
  let assertions = getAllAssertions();

  if (email) {
    const lower = email.trim().toLowerCase();
    assertions = assertions.filter((a) => a.recipient.email?.toLowerCase() === lower);
  }

  return NextResponse.json({
    issuer: getIssuer(),
    badges,
    assertions
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const baseUrl = formatBaseUrl(host);

    if (action === "create_badge") {
      const { name, description, criteriaNarrative, theme, eventDates, tags, image } = body;
      if (!name) {
        return NextResponse.json({ error: "El nombre de la insignia es obligatorio" }, { status: 400 });
      }

      const id = generateAssertionId();
      const newBadge = createBadgeClass({
        id,
        name,
        description: description || "",
        criteriaNarrative: criteriaNarrative || `Certificate awarded for ${name}.`,
        image: image || "https://gdguam.es/logo/logo.svg",
        theme: theme || "gdg",
        eventDates: eventDates || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        tags: tags || ["GDG", "Certificate"],
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        badge: newBadge,
        classUrl: `${baseUrl}/api/badges/class/${newBadge.id}`
      });
    }

    if (action === "issue_assertion") {
      const { badgeClassId, recipientName, recipientEmail, rank, group, role } = body;

      if (!badgeClassId || !recipientName || !recipientEmail) {
        return NextResponse.json(
          { error: "badgeClassId, recipientName y recipientEmail son obligatorios" },
          { status: 400 }
        );
      }

      const badge = getBadgeClass(badgeClassId);
      if (!badge) {
        return NextResponse.json({ error: "La insignia indicada no existe" }, { status: 404 });
      }

      const id = generateAssertionId();
      const salt = `salt_${id.slice(0, 8)}`;
      const { identity } = hashRecipientEmail(recipientEmail, salt);

      const assertion = createAssertion({
        id,
        badgeClassId,
        recipient: {
          type: "email",
          hashed: true,
          identity,
          salt,
          name: recipientName.trim(),
          email: recipientEmail.trim().toLowerCase()
        },
        issuedOn: new Date().toISOString(),
        metadata: {
          rank: rank || undefined,
          group: group || undefined,
          role: role || "Attendee",
          signers: [
            { name: "José Arbeláez Nieto", role: "President" },
            { name: "Héctor Tablero Díaz", role: "Vicepresident" }
          ]
        }
      });

      return NextResponse.json({
        success: true,
        assertion,
        certUrl: `${baseUrl}/cert/${assertion.id}`,
        assertionUrl: `${baseUrl}/api/badges/assertion/${assertion.id}`
      });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
