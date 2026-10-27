import { NextRequest, NextResponse } from "next/server";
import { buildOpenBadgesBadgeClass, formatBaseUrl } from "@/lib/openbadges";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const baseUrl = formatBaseUrl(host);
  const badgeJson = buildOpenBadgesBadgeClass(id, baseUrl);

  if (!badgeJson) {
    return NextResponse.json(
      { error: `BadgeClass with id '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(badgeJson, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
