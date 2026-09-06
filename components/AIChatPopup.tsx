"use client";

import { useEffect, useState } from "react";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowUp, Trash2, TriangleAlert } from "lucide-react";

type AIChatPopupProps = {
  open: boolean;
  query: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
};

type Message = {
  id: string;
  authorType: "user" | "ai";
  content: string;
};

function AIChatPopup({ open, query, inputRef, onClose }: AIChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageLoading, setMessageLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] =
    useState(false);

  const initialQuery = query;

  async function fetchAIResponse(messageID: string, messages: Message[]) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let complete = false;

      while (!complete) {
        const { value, done } = await reader.read();

        if (done) {
          complete = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === messageID
              ? { ...message, content: message.content + chunk }
              : message,
          ),
        );
      }
    } catch (error) {
      console.log("Error generating AI response:", error);
    } finally {
      setMessageLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !initialQuery.trim()) {
      return;
    }

    inputRef.current?.focus();

    const initialMessage: Message = {
      id: crypto.randomUUID(),
      authorType: "user",
      content: initialQuery.trim(),
    };

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      authorType: "ai",
      content: "",
    };

    setMessages([initialMessage, aiMessage]);

    fetchAIResponse(aiMessage.id, [initialMessage]);
  }, [open]);

  function handleSendMessage() {
    setMessageLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: crypto.randomUUID(),
        authorType: "user",
        content: newMessage,
      },
    ]);
    setNewMessage("");
  }

  if (!open) {
    return null;
  }

  return (
    <>
      <MessageScrollerProvider>
        <Card className="absolute bottom-8 right-8 h-144 w-96 z-20">
          <CardHeader>
            <CardTitle>AI Mode</CardTitle>
            <CardDescription className="flex flex-row gap-2 items-center">
              <span
                className={`h-2 w-2 rounded-full ${messageLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
              />
              <p>{messageLoading ? "Generating response..." : "Ready"}</p>
            </CardDescription>

            <CardAction>
              <Button
                variant="destructive"
                size="icon-lg"
                onClick={() => setDeleteConfirmationDialogOpen(true)}
              >
                <Trash2 />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {messages.length === 0 ? (
              <div className="mt-4 flex flex-row gap-2 items-center justify-center">
                <TriangleAlert className="size-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Error loading messages.
                </p>
              </div>
            ) : (
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        align={message.authorType === "user" ? "end" : "start"}
                      >
                        <MessageContent>{message.content}</MessageContent>
                      </Message>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>

                <MessageScrollerButton />
              </MessageScroller>
            )}
          </CardContent>
          <CardFooter>
            <InputGroup className="py-6 px-2">
              <InputGroupInput
                placeholder="Ask a follow up question..."
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();

                    inputRef.current?.blur();

                    return;
                  }
                }}
              />

              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="default"
                  size="icon-sm"
                  disabled={messageLoading || newMessage.trim() === ""}
                  onClick={handleSendMessage}
                >
                  <ArrowUp />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </CardFooter>
        </Card>
      </MessageScrollerProvider>

      <Dialog
        open={deleteConfirmationDialogOpen}
        onOpenChange={setDeleteConfirmationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete AI chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this AI chat?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmationDialogOpen(false);
                setNewMessage("");
                setMessages([]);
                setMessageLoading(true);

                onClose();
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AIChatPopup;
