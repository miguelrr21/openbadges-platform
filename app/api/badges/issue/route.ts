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
import { verifyAdminSessionToken, validateAdminPassword } from "@/lib/auth";
import { isValidEmail, MAX_BULK_RECIPIENTS, sanitizeText } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const [badges, allAssertions, issuer] = await Promise.all([
    getAllBadgeClasses(),
    getAllAssertions(),
    getIssuer()
  ]);

  let assertions = allAssertions;
  if (email) {
    const lower = email.trim().toLowerCase();
    assertions = assertions.filter((a) => a.recipient.email?.toLowerCase() === lower);
  }

  return NextResponse.json({
    issuer,
    badges,
    assertions
  });
}

export async function POST(request: NextRequest) {
  // Authentication check: verify admin cookie or bearer header
  const token = request.cookies.get("admin_session")?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const isAuth =
    verifyAdminSessionToken(token) ||
    (Boolean(bearerToken) && validateAdminPassword(bearerToken!));

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
      const cleanName = sanitizeText(name, 120);
      if (!cleanName) {
        return NextResponse.json({ error: "El nombre de la insignia es obligatorio" }, { status: 400 });
      }

      const id = generateAssertionId();
      const newBadge = await createBadgeClass({
        id,
        name: cleanName,
        description: sanitizeText(description, 500) || "",
        criteriaNarrative: sanitizeText(criteriaNarrative, 300) || `Certificado concedido por ${cleanName}.`,
        image: image || "/logo/logo.svg",
        theme: theme === "hackathon" ? "hackathon" : "gdg",
        eventDates: sanitizeText(eventDates, 80) || new Date().toLocaleDateString("es-ES"),
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

      const cleanName = sanitizeText(recipientName, 100);
      const cleanEmail = (recipientEmail || "").trim().toLowerCase();

      if (!badgeClassId || !cleanName || !cleanEmail) {
        return NextResponse.json(
          { error: "badgeClassId, recipientName y recipientEmail son obligatorios" },
          { status: 400 }
        );
      }

      if (!isValidEmail(cleanEmail)) {
        return NextResponse.json(
          { error: "El correo electrónico no tiene un formato válido" },
          { status: 400 }
        );
      }

      const badge = await getBadgeClass(badgeClassId);
      if (!badge) {
        return NextResponse.json({ error: "La insignia indicada no existe" }, { status: 404 });
      }

      const id = generateAssertionId();
      const salt = `salt_${id.slice(0, 8)}`;
      const { identity } = hashRecipientEmail(cleanEmail, salt);

      const assertion = await createAssertion({
        id,
        badgeClassId,
        recipient: {
          type: "email",
          hashed: true,
          identity,
          salt,
          name: cleanName,
          email: cleanEmail
        },
        issuedOn: new Date().toISOString(),
        metadata: {
          rank: sanitizeText(rank, 50) || undefined,
          group: sanitizeText(group, 50) || undefined,
          role: sanitizeText(role, 50) || "Asistente",
          signers: [
            { name: "Organización GDGoC UHU", role: "Chapter Lead" },
            { name: "Coordinación Académica", role: "Faculty Advisor" }
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

    // BULK ISSUANCE
    if (action === "bulk_issue_assertions") {
      const { badgeClassId, recipients } = body;

      if (!badgeClassId || !Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { error: "badgeClassId y una lista de recipients son obligatorios" },
          { status: 400 }
        );
      }

      // Enforce batch size limit to protect serverless timeout
      if (recipients.length > MAX_BULK_RECIPIENTS) {
        return NextResponse.json(
          {
            error: `El límite máximo por lote es de ${MAX_BULK_RECIPIENTS} participantes para asegurar el rendimiento en Vercel. Por favor divide la lista.`
          },
          { status: 400 }
        );
      }

      const badge = await getBadgeClass(badgeClassId);
      if (!badge) {
        return NextResponse.json({ error: "La insignia indicada no existe" }, { status: 404 });
      }

      const issuedList = [];

      for (const item of recipients) {
        const name = sanitizeText(item.name, 100);
        const email = (item.email || "").trim().toLowerCase();

        // Validate both name and email format
        if (!name || !isValidEmail(email)) continue;

        const id = generateAssertionId();
        const salt = `salt_${id.slice(0, 8)}`;
        const { identity } = hashRecipientEmail(email, salt);

        const assertion = await createAssertion({
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
            rank: sanitizeText(item.rank, 50) || undefined,
            group: sanitizeText(item.group, 50) || undefined,
            role: sanitizeText(item.role, 50) || "Asistente",
            signers: [
              { name: "Organización GDGoC UHU", role: "Chapter Lead" },
              { name: "Coordinación Académica", role: "Faculty Advisor" }
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
