import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorised to perform this action" },
      { status: 401 },
    );
  }

  try {
    const userSettings = await db
      .select({
        showQuickLinks: user_settings.showQuickLinks,
        defaultSearchMode: user_settings.defaultSearchMode,
      })
      .from(user_settings)
      .where(eq(user_settings.userId, session.user.id))
      .limit(1);

    if (!userSettings || userSettings.length === 0) {
      throw new Error("User settings not found");
    }

    return NextResponse.json(userSettings[0], { status: 200 });
  } catch (error) {
    console.log("Error fetching user settings:", error);

    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 },
    );
  }
}
