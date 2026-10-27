import crypto from "crypto";

const BASE_URL = "http://localhost:3000";
const ADMIN_PASSWORD = "wThFDinSTjNKQiIzUlwtB_cu";

async function runTestSuite() {
  console.log("==================================================");
  console.log("🛡️  SUITE DE TESTS QA Y AUDITORÍA DE SEGURIDAD");
  console.log("    GDGoC Universidad de Huelva - Open Badges");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  let adminCookie = null;
  let createdBadgeId = null;
  let createdAssertionId = null;

  // TEST 1: Anti-brute-force delay on invalid login
  try {
    const t0 = Date.now();
    const res = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong_password_attempt" })
    });
    const elapsed = Date.now() - t0;
    assert(
      res.status === 401 && elapsed >= 750,
      "Seguridad: Retardo artificial anti-fuerza bruta en login",
      `Status: ${res.status}, Tiempo transcurrido: ${elapsed}ms (esperado >= 750ms)`
    );
  } catch (err) {
    assert(false, "Seguridad: Retardo anti-fuerza bruta", err.message);
  }

  // TEST 2: Access control without credentials
  try {
    const res = await fetch(`${BASE_URL}/api/badges/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_badge", name: "Hack Event" })
    });
    assert(
      res.status === 401,
      "Control de Acceso: Rechazo 401 a peticiones de emisión sin autenticar",
      `Status: ${res.status}`
    );
  } catch (err) {
    assert(false, "Control de Acceso", err.message);
  }

  // TEST 3: Admin login with correct password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: ADMIN_PASSWORD })
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie && setCookie.includes("admin_session=")) {
      adminCookie = setCookie.split(";")[0];
    }
    assert(
      res.status === 200 && Boolean(adminCookie),
      "Autenticación: Login exitoso con clave maestra y cookie segura",
      `Status: ${res.status}, Cookie recibida: ${Boolean(adminCookie)}`
    );
  } catch (err) {
    assert(false, "Autenticación: Login correcto", err.message);
  }

  // TEST 4: Input validation - Rejected invalid email
  try {
    const res = await fetch(`${BASE_URL}/api/badges/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie || ""
      },
      body: JSON.stringify({
        action: "issue_assertion",
        badgeClassId: "any_id",
        recipientName: "Test User",
        recipientEmail: "correo_sin_arroba_ni_dominio"
      })
    });
    assert(
      res.status === 400,
      "Validación: Rechazo 400 a correos con formato inválido",
      `Status: ${res.status}`
    );
  } catch (err) {
    assert(false, "Validación: Email inválido", err.message);
  }

  // TEST 5: Batch limit enforcement (>150 recipients)
  try {
    const bigList = Array.from({ length: 155 }, (_, i) => ({
      name: `Alumno ${i}`,
      email: `alumno${i}@alu.uhu.es`
    }));

    const res = await fetch(`${BASE_URL}/api/badges/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie || ""
      },
      body: JSON.stringify({
        action: "bulk_issue_assertions",
        badgeClassId: "any_id",
        recipients: bigList
      })
    });
    const data = await res.json();
    assert(
      res.status === 400 && data.error?.includes("150"),
      "Estabilidad: Límite máximo de 150 participantes por lote (anti-timeout de Vercel)",
      `Status: ${res.status}, Error: ${data.error}`
    );
  } catch (err) {
    assert(false, "Límite de lote", err.message);
  }

  // TEST 6: Create BadgeClass
  try {
    const res = await fetch(`${BASE_URL}/api/badges/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie || ""
      },
      body: JSON.stringify({
        action: "create_badge",
        name: "Taller de Ciberseguridad & Open Badges GDGoC UHU",
        description: "Formación práctica en estándares criptográficos e identidad digital universitaria.",
        theme: "gdg",
        eventDates: "Noviembre 2026"
      })
    });
    const data = await res.json();
    if (data.badge?.id) {
      createdBadgeId = data.badge.id;
    }
    assert(
      res.status === 200 && Boolean(createdBadgeId),
      "Funcionalidad: Creación de nueva insignia (BadgeClass)",
      `Badge ID: ${createdBadgeId}`
    );
  } catch (err) {
    assert(false, "Crear BadgeClass", err.message);
  }

  // TEST 7: Issue Assertion to attendee
  try {
    const recipientEmail = "carmen.gomez@alu.uhu.es";
    const res = await fetch(`${BASE_URL}/api/badges/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie || ""
      },
      body: JSON.stringify({
        action: "issue_assertion",
        badgeClassId: createdBadgeId,
        recipientName: "Carmen Gómez Navarro",
        recipientEmail: recipientEmail,
        role: "Asistente Destacada"
      })
    });
    const data = await res.json();
    if (data.assertion?.id) {
      createdAssertionId = data.assertion.id;
    }
    assert(
      res.status === 200 && Boolean(createdAssertionId),
      "Funcionalidad: Emisión de credencial Open Badges a un participante",
      `Assertion ID: ${createdAssertionId}`
    );
  } catch (err) {
    assert(false, "Emitir Assertion", err.message);
  }

  // TEST 8: Open Badges Issuer endpoint compliance
  try {
    const res = await fetch(`${BASE_URL}/api/badges/issuer`);
    const data = await res.json();
    const isValid =
      data["@context"] === "https://w3id.org/openbadges/v2" &&
      data.type === "Issuer" &&
      data.name.includes("Universidad de Huelva") &&
      data.url.includes("uhu");

    assert(
      res.status === 200 && isValid,
      "Estándar Open Badges v2: Endpoint de Emisor (/api/badges/issuer)",
      `Issuer Name: ${data.name}`
    );
  } catch (err) {
    assert(false, "Open Badges Issuer", err.message);
  }

  // TEST 9: Open Badges BadgeClass endpoint compliance
  try {
    const res = await fetch(`${BASE_URL}/api/badges/class/${createdBadgeId}`);
    const data = await res.json();
    const isValid =
      data["@context"] === "https://w3id.org/openbadges/v2" &&
      data.type === "BadgeClass" &&
      data.id.includes(createdBadgeId) &&
      data.issuer.includes("/api/badges/issuer");

    assert(
      res.status === 200 && isValid,
      "Estándar Open Badges v2: Endpoint de Insignia (/api/badges/class/:id)",
      `Badge Name: ${data.name}`
    );
  } catch (err) {
    assert(false, "Open Badges BadgeClass", err.message);
  }

  // TEST 10: Open Badges Assertion endpoint & SHA-256 verification
  try {
    const res = await fetch(`${BASE_URL}/api/badges/assertion/${createdAssertionId}`);
    const data = await res.json();

    const expectedHash = crypto
      .createHash("sha256")
      .update("carmen.gomez@alu.uhu.es" + data.recipient.salt)
      .digest("hex");

    const hashMatches = data.recipient.identity === `sha256$${expectedHash}`;
    const isHosted = data.verification?.type === "HostedBadge";

    assert(
      res.status === 200 && hashMatches && isHosted,
      "Estándar Open Badges v2: Endpoint de Aserción y verificación criptográfica SHA-256",
      `Hosted: ${isHosted}, Hash verificado: ${hashMatches}`
    );
  } catch (err) {
    assert(false, "Open Badges Assertion", err.message);
  }

  // TEST 11: Web Certificate view (/cert/:id)
  try {
    const res = await fetch(`${BASE_URL}/cert/${createdAssertionId}`);
    const html = await res.text();
    const containsName = html.includes("Carmen Gómez Navarro");
    const containsUhu = html.includes("Universidad de Huelva");

    assert(
      res.status === 200 && containsName && containsUhu,
      "Frontend: Visualización limpia del diploma web (/cert/:id)",
      `Status: ${res.status}, Contiene nombre y UHU: ${containsName && containsUhu}`
    );
  } catch (err) {
    assert(false, "Frontend Cert View", err.message);
  }

  // TEST 12: 404 cleanly returned on invalid ID
  try {
    const res = await fetch(`${BASE_URL}/cert/non_existent_fake_id_123`);
    assert(
      res.status === 404,
      "Robustez: Respuesta 404 limpia ante certificado inexistente",
      `Status: ${res.status}`
    );
  } catch (err) {
    assert(false, "Robustez 404", err.message);
  }

  // TEST 13: Logout and session invalidation
  try {
    const resLogout = await fetch(`${BASE_URL}/api/admin/auth`, { method: "DELETE" });
    const resAfter = await fetch(`${BASE_URL}/api/badges/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_badge", name: "Hack" })
    });

    assert(
      resLogout.status === 200 && resAfter.status === 401,
      "Seguridad: Cierre de sesión y revocación inmediata de privilegios",
      `Post-logout status: ${resAfter.status}`
    );
  } catch (err) {
    assert(false, "Logout", err.message);
  }

  console.log("\n==================================================");
  console.log(`📊 RESULTADOS: ${passed} pasados, ${failed} fallidos`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
