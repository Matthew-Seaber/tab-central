"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { authClient } from "@/lib/auth-client";

import SearchEnterKeybind from "@/components/SearchEnterKeybind";
import AIChatPopup from "@/components/AIChatPopup";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Check,
  Globe,
  Moon,
  Pencil,
  Plus,
  ScanSearch,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";

type QuickLink = {
  id: string;
  name: string;
  URL: string;
};

export default function Home() {
  const [searchMode, setSearchMode] = useState<
    "default" | "search-only" | "ai-only"
  >("default");
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [quickLinksVisible, setQuickLinksVisible] = useState(false);
  const [keybindPromptHidden, setKeybindPromptHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newQuickLinkName, setNewQuickLinkName] = useState("");
  const [newQuickLinkURL, setNewQuickLinkURL] = useState("");
  const [focusedLinkID, setFocusedLinkID] = useState<string | null>(null);
  const [addQuickLinkDialogOpen, setAddQuickLinkDialogOpen] = useState(false);
  const [removeQuickLinkDialogOpen, setRemoveQuickLinkDialogOpen] =
    useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function fetchPageData() {
      const session = await authClient.getSession();

      if (session.data) {
        const userSettingsResponse = await fetch(
          "/api/user_settings/fetch_all",
          {
            method: "GET",
          },
        );

        if (!userSettingsResponse.ok) {
          toast.error(
            "Failed to fetch your preferences. Please try again later.",
          );
        } else {
          const userSettingsData = await userSettingsResponse.json();

          const fetchedSearchMode = userSettingsData.defaultSearchMode;

          setQuickLinksVisible(userSettingsData.showQuickLinks);
          setSearchMode(fetchedSearchMode);
        }

        const quickLinksResponse = await fetch("/api/quick_links/fetch_links", {
          method: "GET",
        });

        if (!quickLinksResponse.ok) {
          toast.error(
            "Failed to fetch your quick links. Please try again later.",
          );
        } else {
          const quickLinksData = await quickLinksResponse.json();

          setQuickLinks(quickLinksData);
        }
      } else {
        setQuickLinksVisible(true);
      }
    }

    fetchPageData();

    setTimeout(() => {
      setKeybindPromptHidden(true);
    }, 3000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.repeat) {
          return;
        }

        setKeybindPromptHidden(false);

        if (event.key === "1") {
          setSearchMode("default");
        } else if (event.key === "2") {
          setSearchMode("search-only");
        } else if (event.key === "3") {
          setSearchMode("ai-only");
        }

        return;
      }

      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.altKey || event.metaKey) {
        return;
      }

      searchInputRef.current?.focus();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key == "Control") {
        setKeybindPromptHidden(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function validateURL(url: string) {
    try {
      const parsedURL = new URL(url);

      return parsedURL.protocol === "http:" || parsedURL.protocol === "https:";
    } catch {
      return false;
    }
  }

  function getFaviconURL(url: string) {
    try {
      const formattedURL = url.startsWith("http")
        ? new URL(url)
        : new URL(`http://${url}`);

      return `https://www.google.com/s2/favicons?domain=${formattedURL.hostname}&sz=48`;
    } catch (error) {
      console.error("Error fetching favicon:", error);
      return "/globe.svg";
    }
  }

  async function handleAddQuickLink() {
    let url = newQuickLinkURL.trim();

    if (!newQuickLinkName || !newQuickLinkURL) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!validateURL(url)) {
      url = `https://${url}`;
    }

    const response = await fetch("/api/quick_links/add_link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newQuickLinkName, URL: url }),
    });

    if (!response.ok) {
      toast.error("Failed to create quick link. Please try again later.");
    } else {
      toast.success("Quick link created.");

      const data = await response.json();
      const newQuickLinkID = data.id;

      setQuickLinks((prev) => [
        ...prev,
        { id: newQuickLinkID, name: newQuickLinkName, URL: url },
      ]);
      setNewQuickLinkName("");
      setNewQuickLinkURL("");
    }
  }

  async function handleDeleteQuickLink() {
    if (focusedLinkID === null) {
      toast.error("Error deleting quick link. Please try again later.");
      return;
    }

    const response = await fetch("/api/quick_links/delete_link", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ linkID: focusedLinkID }),
    });

    if (!response.ok) {
      toast.error("Failed to delete quick link. Please try again later.");
      setFocusedLinkID(null);
    } else {
      toast.success("Quick link deleted.");

      setQuickLinks((prev) => prev.filter((link) => link.id !== focusedLinkID));
      setFocusedLinkID(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center gap-8 bg-[radial-gradient(circle_at_50%_35%,#e9edff_0%,#f5f5ff_40%,#ffffff_80%)] dark:bg-[radial-gradient(circle_at_50%_35%,#1e2440_0%,#11131f_40%,#09090b_80%)]">
      <nav className="flex w-full items-center justify-between p-6">
        <Button
          variant="outline"
          size="icon"
          className="p-6"
          onClick={() => router.push("/settings")}
        >
          <Settings className="size-6 text-foreground/95" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="p-6"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "dark" ? (
            <Sun className="size-6 text-foreground/95" />
          ) : (
            <Moon className="size-6 text-foreground/95" />
          )}
        </Button>
      </nav>

      <div className="min-w-3xl px-16 flex flex-col items-center justify-center gap-6">
        <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
          <h1 className="font-semibold text-6xl">Tab Central</h1>
          <p className="font-medium text-muted-foreground">
            The ultimate new tab page for the AI era.
          </p>
        </div>

        <div className="h-20 flex flex-row items-center justify-center rounded-lg border border-border shadow-md">
          <Button
            variant="ghost"
            className={`h-full px-4 flex flex-col hover:bg-[#e9edff] dark:hover:bg-[#161a2c] ${searchMode === "default" ? "border-b-2 border-b-primary rounded-lg" : ""} ${keybindPromptHidden ? "gap-0" : "gap-2"}`}
            onClick={() => setSearchMode("default")}
          >
            <div className="flex flex-row gap-3">
              <ScanSearch />
              Default Google search
            </div>

            <KbdGroup
              className={`overflow-hidden transition-all duration-300 ${keybindPromptHidden ? "opacity-0 max-h-0 scale-90" : "opacity-100 max-h-10 scale-100"}`}
            >
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>1</Kbd>
            </KbdGroup>
          </Button>

          <Separator orientation="vertical" className="my-auto h-8" />

          <Button
            variant="ghost"
            className={`h-full px-4 flex flex-col hover:bg-[#e9edff] dark:hover:bg-[#161a2c] ${searchMode === "search-only" ? "border-b-2 border-b-primary rounded-lg" : ""} ${keybindPromptHidden ? "gap-0" : "gap-2"}`}
            onClick={() => setSearchMode("search-only")}
          >
            <div className="flex flex-row gap-3">
              <Globe />
              Web only mode
            </div>

            <KbdGroup
              className={`overflow-hidden transition-all duration-300 ${keybindPromptHidden ? "opacity-0 max-h-0 scale-90" : "opacity-100 max-h-10 scale-100"}`}
            >
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>2</Kbd>
            </KbdGroup>
          </Button>

          <Separator orientation="vertical" className="my-auto h-8" />

          <Button
            variant="ghost"
            className={`h-full px-4 flex flex-col hover:bg-[#e9edff] dark:hover:bg-[#161a2c] ${searchMode === "ai-only" ? "border-b-2 border-b-primary rounded-lg" : ""} ${keybindPromptHidden ? "gap-0" : "gap-2"}`}
            onClick={() => setSearchMode("ai-only")}
          >
            <div className="flex flex-row gap-3">
              <Sparkles />
              AI mode
            </div>

            <KbdGroup
              className={`overflow-hidden transition-all duration-300 ${keybindPromptHidden ? "opacity-0 max-h-0 scale-90" : "opacity-100 max-h-10 scale-100"}`}
            >
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>3</Kbd>
            </KbdGroup>
          </Button>
        </div>

        <InputGroup className="h-20 gap-2 bg-background border border-border shadow-lg">
          <InputGroupAddon className="pl-5">
            <Search className="size-5" />
          </InputGroupAddon>

          <InputGroupInput
            id="search-input"
            ref={searchInputRef}
            placeholder="Search anything..."
            autoFocus
            className="text-lg!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();

                searchInputRef.current?.blur();

                return;
              }
            }}
          />

          <InputGroupAddon align="inline-end" className="pr-0">
            <div
              className={`relative ${searchMode === "ai-only" ? "size-14 mr-3" : "size-20"}`}
            >
              <Image
                src={
                  searchMode !== "ai-only"
                    ? "/google-logo.png"
                    : theme === "dark"
                      ? "/openai-logo-white.png"
                      : "/openai-logo-black.png"
                }
                alt="Search provider logo"
                fill
                sizes="120px"
                preload={false}
                className="object-contain pointer-events-none"
              />
            </div>
          </InputGroupAddon>
        </InputGroup>

        {quickLinksVisible && (
          <div className="mt-12 flex flex-col w-full gap-6">
            <div className="flex flex-row items-center justify-between gap-6">
              <h2 className="text-2xl font-semibold">Quick Links</h2>
              <div className="flex flex-row items-center gap-2">
                {editModeEnabled && (
                  <Button
                    variant="outline"
                    onClick={() => setAddQuickLinkDialogOpen(true)}
                  >
                    <Plus />
                    Add
                  </Button>
                )}

                <Button
                  variant={editModeEnabled ? "default" : "outline"}
                  onClick={() => setEditModeEnabled(!editModeEnabled)}
                >
                  {editModeEnabled ? <Check /> : <Pencil />}
                  {editModeEnabled ? "Done" : "Edit"}
                </Button>
              </div>
            </div>

            {quickLinks.length === 0 ? (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                You have no quick links yet.{" "}
                {editModeEnabled
                  ? 'Click "add" to create one or hide this section in settings.'
                  : 'Click "edit" to add some or hide this section in settings.'}
              </p>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {quickLinks.map((link) => (
                  <Card
                    key={link.id}
                    onClick={() => {
                      if (editModeEnabled) {
                        setFocusedLinkID(link.id);
                        setRemoveQuickLinkDialogOpen(true);
                      } else {
                        router.replace(link.URL);
                      }
                    }}
                    className="w-full aspect-square cursor-pointer hover:bg-accent/50"
                  >
                    <CardContent className="h-full flex items-center justify-center">
                      {editModeEnabled ? (
                        <div className="flex flex-col gap-2 items-center justify-center">
                          <Trash2 className="size-12 text-red-500" />

                          <h4>{link.name}</h4>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-center justify-center">
                          <Image
                            src={getFaviconURL(link.URL)}
                            alt={"Icon for " + link.name}
                            width={48}
                            height={48}
                          />

                          <h4>{link.name}</h4>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SearchEnterKeybind searchMode={searchMode} query={searchQuery} />

      <AIChatPopup />

      <Toaster position="top-center" />

      <Dialog
        open={addQuickLinkDialogOpen}
        onOpenChange={setAddQuickLinkDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add quick link</DialogTitle>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="quickLinkName">Name</FieldLabel>
            <Input
              id="quickLinkName"
              placeholder="Enter a display name for the link"
              required
              value={newQuickLinkName}
              onChange={(e) => setNewQuickLinkName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="quickLinkURL">Link URL</FieldLabel>
            <Input
              id="quickLinkURL"
              placeholder="Enter the link's URL"
              required
              value={newQuickLinkURL}
              onChange={(e) => setNewQuickLinkURL(e.target.value)}
            />
          </Field>

          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              onClick={() => {
                setAddQuickLinkDialogOpen(false);
                handleAddQuickLink();
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removeQuickLinkDialogOpen}
        onOpenChange={setRemoveQuickLinkDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove quick link</DialogTitle>
            <DialogDescription>
              Are you sure you wannt to remove this quick link?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setRemoveQuickLinkDialogOpen(false);
                handleDeleteQuickLink();
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
