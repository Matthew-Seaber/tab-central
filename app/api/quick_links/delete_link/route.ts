import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quick_links } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorised to perform this action" },
      { status: 401 },
    );
  }

  const { linkID } = await request.json();

  if (!linkID) {
    return NextResponse.json(
      { error: "Missing parameter (linkID)" },
      { status: 400 },
    );
  }

  try {
    await db
      .delete(quick_links)
      .where(
        and(
          eq(quick_links.id, linkID),
          eq(quick_links.userId, session.user.id),
        ),
      );

    return NextResponse.json(
      { message: "Quick link successfully deleted" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error deleting quick link:", error);

    return NextResponse.json(
      { error: "Failed to delete quick link" },
      { status: 500 },
    );
  }
}
