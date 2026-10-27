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
import { formatBaseUrl } from "@/lib/urls";
import { verifyAdminSessionToken, getAdminPassword } from "@/lib/auth";

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
  // Authentication check: verify admin cookie or bearer header
  const token = request.cookies.get("admin_session")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const adminSecret = getAdminPassword();

  const isAuth =
    verifyAdminSessionToken(token) ||
    (Boolean(adminSecret) && bearerToken === adminSecret);

  if (!isAuth) {
    return NextResponse.json(
      { error: "No autorizado. Debes iniciar sesión como administrador para emitir certificados." },
      { status: 401 }
    );
  }

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
        criteriaNarrative: criteriaNarrative || `Certificado concedido por ${name}.`,
        image: image || "/logo/logo.svg",
        theme: theme || "gdg",
        eventDates: eventDates || new Date().toLocaleDateString("es-ES"),
        tags: tags || ["GDGoC UHU", "Certificado"],
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
          role: role || "Asistente",
          signers: [
            { name: "Equipo Directivo", role: "Lead GDGoC UHU" },
            { name: "Coordinación UHU", role: "Tutor Académico" }
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

    // BULK ISSUANCE (25+ attendees at once)
    if (action === "bulk_issue_assertions") {
      const { badgeClassId, recipients } = body;

      if (!badgeClassId || !Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { error: "badgeClassId y una lista de recipients son obligatorios" },
          { status: 400 }
        );
      }

      const badge = getBadgeClass(badgeClassId);
      if (!badge) {
        return NextResponse.json({ error: "La insignia indicada no existe" }, { status: 404 });
      }

      const issuedList = [];

      for (const item of recipients) {
        const name = (item.name || "").trim();
        const email = (item.email || "").trim().toLowerCase();

        if (!name || !email) continue;

        const id = generateAssertionId();
        const salt = `salt_${id.slice(0, 8)}`;
        const { identity } = hashRecipientEmail(email, salt);

        const assertion = createAssertion({
          id,
          badgeClassId,
          recipient: {
            type: "email",
            hashed: true,
            identity,
            salt,
            name,
            email
          },
          issuedOn: new Date().toISOString(),
          metadata: {
            rank: item.rank?.trim() || undefined,
            group: item.group?.trim() || undefined,
            role: item.role?.trim() || "Asistente",
            signers: [
              { name: "Equipo Directivo", role: "Lead GDGoC UHU" },
              { name: "Coordinación UHU", role: "Tutor Académico" }
            ]
          }
        });

        issuedList.push({
          id: assertion.id,
          name: assertion.recipient.name,
          email: assertion.recipient.email,
          certUrl: `${baseUrl}/cert/${assertion.id}`,
          assertionUrl: `${baseUrl}/api/badges/assertion/${assertion.id}`
        });
      }

      return NextResponse.json({
        success: true,
        count: issuedList.length,
        issued: issuedList
      });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
