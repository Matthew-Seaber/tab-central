"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Message } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { X } from "lucide-react";

type Message = {
  id: string;
  authorType: "user" | "ai";
  content: string;
};

function AIChatPopup() {
  const [chatTopic, setChatTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <MessageScrollerProvider>
      <Card className="absolute bottom-8 right-8 h-144 w-96">
        <CardHeader>
          <CardTitle>AI Answer</CardTitle>
          <CardDescription>
            {chatTopic || "Generating response..."}
          </CardDescription>

          <CardAction>
            <Button variant="outline" size="icon-lg">
              <X />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p>Error loading messages.</p>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message.content}
                      scrollAnchor={message.authorType === "user"}
                    />
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>

              <MessageScrollerButton />
            </MessageScroller>
          )}
        </CardContent>
        <CardFooter>
          
        </CardFooter>
      </Card>
    </MessageScrollerProvider>
  );
}

export default AIChatPopup;
