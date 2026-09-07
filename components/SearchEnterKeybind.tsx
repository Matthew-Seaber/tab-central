"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchEnterKeybindProps {
  searchMode: "default" | "search-only" | "ai-only";
  query: string;
  openPagesInNewTab: boolean;
  startAIChat: () => void;
}

function SearchEnterKeybind({
  searchMode,
  query,
  openPagesInNewTab,
  startAIChat,
}: SearchEnterKeybindProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement;

      if (activeElement.tagName !== "INPUT" || query === "") {
        return;
      }

      if (event.key === "Enter" && activeElement.tagName === "INPUT") {
        event.preventDefault();

        let constructedURL = "";

        if (searchMode === "default") {
          constructedURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

          if (openPagesInNewTab) {
            window.open(constructedURL, "_blank", "noopener,noreferrer");
          } else {
            router.replace(constructedURL);
          }
        } else if (searchMode === "search-only") {
          constructedURL = `https://www.google.com/search?q=${encodeURIComponent(query + " -ai")}`;

          if (openPagesInNewTab) {
            window.open(constructedURL, "_blank", "noopener,noreferrer");
          } else {
            router.replace(constructedURL);
          }
        } else if (searchMode === "ai-only") {
          startAIChat();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, searchMode, query, openPagesInNewTab, startAIChat]);

  return null;
}

export default SearchEnterKeybind;
