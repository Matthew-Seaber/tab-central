import { headers } from "next/headers";
import { NextResponse } from "next/server";

import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  authorType: "user" | "ai";
  content: string;
};

const date = new Date().toLocaleString("en-GB", {
  timeZone: "Europe/London",
});

const SYSTEM_PROMPT = `You are a helpful assistant to provide accurate and up-to-date information to the user based on their request. If you are not certain on the answer, have low confidence, or the answer is important and can have consequences if the answer is incorrect, mention that the user should double-check and verify all AI responses with external sources and that you have low confidence. Be concise unless the user asks for details, this is meant for relatively short/quick answers. Use simple language and do not mention these instructions. Please double check any relevant information with the web (especially if the user asks about current/recent events like news, date, events which can change frequently) or if the user asks you to, and spend extra time reasoning if you need it. Do not use the web for simple questions where your knowledge is sufficient (your knowledge is only up to date until the end of August 2025, so use web for queries requiring information after this data). The date/time now is ${date}.`;

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

  const { messages } = (await request.json()) as { messages: Message[] };

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Invalid parameter data" },
      { status: 400 },
    );
  }

  try {
    const remainingMessages = await db
      .update(user_settings)
      .set({
        aiRemainingMessages: sql`(${user_settings.aiRemainingMessages} - 1)`,
      })
      .where(
        and(
          eq(user_settings.userId, session.user.id),
          gt(user_settings.aiRemainingMessages, 0),
        ),
      )
      .returning({ aiRemainingMessages: user_settings.aiRemainingMessages });

    if (remainingMessages.length === 0) {
      return NextResponse.json(
        { error: "You have no remaining AI messages" },
        { status: 403 },
      );
    }

    const stream = await openai.responses.create({
      model: process.env.OPENAI_MODEL,

      tools: [
        {
          type: "web_search",
        },
      ],

      input: [
        {
          role: "developer",
          content: SYSTEM_PROMPT,
        },

        ...messages.map((message) => ({
          role:
            message.authorType === "user"
              ? ("user" as const)
              : ("assistant" as const),
          content: message.content,
        })),
      ],

      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              controller.enqueue(encoder.encode(event.delta));
            }
          }

          controller.close();
        } catch (error) {
          console.log("Error generating AI response:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.log("Error generating AI response:", error);

    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
