import { NextRequest, NextResponse } from "next/server";

import { getRelatedContent } from "@/lib/related-content";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || (type !== "publication" && type !== "project")) {
    return NextResponse.json(
      { error: "Missing or invalid parameters: id, type" },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(getRelatedContent(id, type, 3));
  } catch (error) {
    console.error("[api/related] failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
