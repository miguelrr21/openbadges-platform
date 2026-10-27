import { NextRequest, NextResponse } from "next/server";
import { buildOpenBadgesIssuer, formatBaseUrl } from "@/lib/openbadges";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const baseUrl = formatBaseUrl(host);
  const issuerJson = await buildOpenBadgesIssuer(baseUrl);

  return NextResponse.json(issuerJson, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
