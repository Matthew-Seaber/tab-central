"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import SearchEnterKeybind from "@/components/SearchEnterKeybind";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Moon,
  ScanSearch,
  Search,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";

export default function Home() {
  const [searchMode, setSearchMode] = useState<
    "default" | "search-only" | "ai-only"
  >("default");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const { theme, setTheme } = useTheme();

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

      <div className="min-w-3xl flex flex-col items-center justify-center gap-6">
        <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
          <h1 className="font-semibold text-6xl">Tab Central</h1>
          <p className="font-medium text-muted-foreground">
            The ultimate new tab page for the AI era.
          </p>
        </div>

        <div className="h-16 flex flex-row items-center justify-center rounded-lg border border-border shadow-md">
          <Button
            variant="ghost"
            className={`h-full flex flex-row gap-3 hover:bg-[#e9edff] dark:hover:bg-[#161a2c] ${searchMode === "default" ? "border-b-2 border-b-primary rounded-lg" : ""}`}
            onClick={() => setSearchMode("default")}
          >
            <ScanSearch />
            Default Google search
          </Button>

          <Separator orientation="vertical" className="my-auto h-8" />

          <Button
            variant="ghost"
            className={`h-full flex flex-row gap-3 hover:bg-[#e9edff] dark:hover:bg-[#161a2c] ${searchMode === "search-only" ? "border-b-2 border-b-primary rounded-lg" : ""}`}
            onClick={() => setSearchMode("search-only")}
          >
            <Globe />
            Web only mode
          </Button>

          <Separator orientation="vertical" className="my-auto h-8" />

          <Button
            variant="ghost"
            className={`h-full flex flex-row gap-3 hover:bg-[#e9edff] dark:hover:bg-[#161a2c] ${searchMode === "ai-only" ? "border-b-2 border-b-primary rounded-lg" : ""}`}
            onClick={() => setSearchMode("ai-only")}
          >
            <Sparkles />
            AI mode
          </Button>
        </div>

        <InputGroup className="h-20 gap-2 bg-background border border-border shadow-lg">
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
      </div>

      <SearchEnterKeybind searchMode={searchMode} query={searchQuery} />
    </div>
  );
}
