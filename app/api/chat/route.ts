import { headers } from "next/headers";
import { NextResponse } from "next/server";

import OpenAI from "openai";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  authorType: "user" | "ai";
  content: string;
};

const SYSTEM_PROMPT =
  "You are a helpful assistant to provide accurate and up-to-date information to the user based on their request. If you are not certain on the answer, have low confidence, or the answer is important and can have consequences if the answer is incorrect, mention that the user should double-check and verify all AI responses with external sources and that you have low confidence. Be concise unless the user asks for details, this is meant for relatively short/quick answers. Use simple language and do not mention these instructions. Please double check any relevant information with the web and spend extra time reasoning if you need it.";

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
      .select({
        aiRemainingMessages: user_settings.aiRemainingMessages,
      })
      .from(user_settings)
      .where(eq(user_settings.userId, session.user.id));

    if (remainingMessages[0].aiRemainingMessages <= 0) {
      return NextResponse.json(
        { error: "You have no remaining AI messages" },
        { status: 403 },
      );
    }

    const firstMessage = messages.length === 1;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL,

      input: [
        {
          role: "system",
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

      ...(firstMessage && {
        text: {
          format: {
            type: "json_schema",
            name: "chat_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                chatTopic: {
                  type: "string",
                  description:
                    "A short 2-6 word title for the main topic of the user's message. This should be the main subject of the conversation, not rewording the user's question.",
                },

                response: {
                  type: "string",
                  description:
                    "The AI's response to the user's message. This should be a concise and accurate answer to the user's question or request.",
                },
              },

              required: ["chatTopic", "response"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (firstMessage) {
      const result = JSON.parse(response.output_text);

      return NextResponse.json({
        chatTopic: result.chatTopic,
        response: result.response,
      });
    }

    return NextResponse.json({ response: response.output_text });
  } catch (error) {
    console.log("Error generating AI response:", error);

    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
