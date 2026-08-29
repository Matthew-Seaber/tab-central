"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Globe, ScanSearch, Search, Settings, Sparkles } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchMode, setSearchMode] = useState<
    "default" | "search-only" | "ai-only"
  >("default");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen items-center gap-8">
      <nav className="flex w-full items-center justify-between px-4 py-2">
        <Button variant="outline" size="icon" className="p-6">
          <Link href="/settings">
            <Settings className="size-6 text-foreground/90" />
          </Link>
        </Button>
        <Button variant="outline" size="icon"></Button>
      </nav>

      <div className="min-w-3xl flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h1 className="font-semibold text-6xl">Tab Central</h1>
          <p className="font-medium text-muted-foreground">
            The ultimate new tab page for the AI era.
          </p>
        </div>

        <div className="h-16 flex flex-row items-center justify-center px-4 rounded-lg border border-border shadow-lg">
          <Button
            variant="ghost"
            className={`h-full flex flex-row gap-3 rounded-none ${searchMode === "default" ? "border-b-2 border-b-primary" : ""}`}
            onClick={() => setSearchMode("default")}
          >
            <ScanSearch />
            Default Google search
          </Button>

          <Separator orientation="vertical" className="my-auto h-8" />

          <Button
            variant="ghost"
            className={`h-full flex flex-row gap-3 rounded-none ${searchMode === "search-only" ? "border-b-2 border-b-primary" : ""}`}
            onClick={() => setSearchMode("search-only")}
          >
            <Globe />
            Web only mode
          </Button>

          <Separator orientation="vertical" className="my-auto h-8" />

          <Button
            variant="ghost"
            className={`h-full flex flex-row gap-3 rounded-none ${searchMode === "ai-only" ? "border-b-2 border-b-primary" : ""}`}
            onClick={() => setSearchMode("ai-only")}
          >
            <Sparkles />
            AI mode
          </Button>
        </div>

        <InputGroup className="h-20 gap-2 bg-background border border-border shadow-xl">
          <InputGroupAddon className="pl-5">
            <Search className="size-5" />
          </InputGroupAddon>

          <InputGroupInput
            id="search-input"
            placeholder="Search anything..."
            className="text-lg!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <InputGroupAddon align="inline-end" className="pr-0">
            <div className={`relative ${searchMode === "ai-only" ? "size-14 mr-3" : "size-20"}`}>
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
                className="object-contain pointer-events-none"
              />
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
