import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorised to perform this action" },
      { status: 401 },
    );
  }

  const { newSearchMode } = await request.json();

  if (
    newSearchMode !== "default" &&
    newSearchMode !== "search-only" &&
    newSearchMode !== "ai-only"
  ) {
    return NextResponse.json(
      { error: "Invalid search mode value" },
      { status: 400 },
    );
  }

  try {
    await db
      .update(user_settings)
      .set({
        defaultSearchMode: newSearchMode,
      })
      .where(eq(user_settings.userId, session.user.id));

    return NextResponse.json(
      { message: "Default search mode successfully updated" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating default search mode:", error);

    return NextResponse.json(
      { error: "Failed to update default search mode" },
      { status: 500 },
    );
  }
}
