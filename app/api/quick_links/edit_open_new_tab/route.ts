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

  const { newValue } = await request.json();

  try {
    await db
      .update(user_settings)
      .set({
        openPagesInNewTab: newValue,
      })
      .where(eq(user_settings.userId, session.user.id));

    return NextResponse.json(
      { message: "'Pages open in new tab' setting successfully updated" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating the 'pages open in new tab' setting:", error);

    return NextResponse.json(
      { error: "Failed to update the 'pages open in new tab' setting" },
      { status: 500 },
    );
  }
}
