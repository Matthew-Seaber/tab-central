import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { quick_links } from "@/db/schema";

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

  const { name, URL } = await request.json();

  if (!name || !URL) {
    return NextResponse.json(
      { error: "Missing parameter(s) (name or URL)" },
      { status: 400 },
    );
  }

  try {
    const result = await db
      .insert(quick_links)
      .values({
        userId: session.user.id,
        name,
        URL,
      })
      .returning({ id: quick_links.id });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.log("Error adding quick link:", error);

    return NextResponse.json(
      { error: "Failed to add quick link" },
      { status: 500 },
    );
  }
}
