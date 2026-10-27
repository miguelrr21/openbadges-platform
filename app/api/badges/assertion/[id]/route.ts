import { NextRequest, NextResponse } from "next/server";
import { buildOpenBadgesAssertion, formatBaseUrl } from "@/lib/openbadges";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const baseUrl = formatBaseUrl(host);
  const assertionJson = await buildOpenBadgesAssertion(id, baseUrl);

  if (!assertionJson) {
    return NextResponse.json(
      { error: `Assertion with id '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(assertionJson, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
