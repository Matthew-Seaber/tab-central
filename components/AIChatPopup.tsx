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
  const [chatTopic, setChatTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] =
    useState(false);

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
            <CardDescription>
              {chatTopic || "Generating response..."}
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
                setChatTopic(null);
                setMessages([]);
                setMessageLoading(false);

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
