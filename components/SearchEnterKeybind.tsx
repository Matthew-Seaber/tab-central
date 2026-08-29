"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchEnterKeybindProps {
  searchMode: "default" | "search-only" | "ai-only";
  query: string;
}

function SearchEnterKeybind({ searchMode, query }: SearchEnterKeybindProps) {
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
          router.replace(constructedURL);
        } else if (searchMode === "search-only") {
          constructedURL = `https://www.google.com/search?q=${encodeURIComponent(query + " -ai")}`;
          router.replace(constructedURL);
        } else if (searchMode === "ai-only") {
          console.log("ai-only");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, searchMode, query]);

  return null;
}

export default SearchEnterKeybind;
