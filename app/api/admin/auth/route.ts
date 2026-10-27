import { NextRequest, NextResponse } from "next/server";
import {
  getAdminPassword,
  createAdminSessionToken,
  verifyAdminSessionToken
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const isValid = verifyAdminSessionToken(token);

  return NextResponse.json({ authenticated: isValid });
}

export async function POST(request: NextRequest) {
  try {
    const expectedPassword = getAdminPassword();

    if (!expectedPassword) {
      return NextResponse.json(
        { error: "Error del servidor: La variable ADMIN_PASSWORD no está configurada en el hosting." },
        { status: 500 }
      );
    }

    const { password } = await request.json();

    if (!password || password !== expectedPassword) {
      return NextResponse.json({ error: "Clave de administrador incorrecta" }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const response = NextResponse.json({ success: true, message: "Sesión de administrador iniciada" });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Sesión cerrada" });
  response.cookies.delete("admin_session");
  return response;
}
