import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quick_links } from "@/db/schema";
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
    const quickLinks = await db
      .select({
        id: quick_links.id,
        name: quick_links.name,
        URL: quick_links.URL,
      })
      .from(quick_links)
      .where(eq(quick_links.userId, session.user.id));

    if (!quickLinks) {
      throw new Error("Quick links not found");
    }

    return NextResponse.json(quickLinks, { status: 200 });
  } catch (error) {
    console.log("Error fetching quick links:", error);

    return NextResponse.json(
      { error: "Failed to fetch quick links" },
      { status: 500 },
    );
  }
}
