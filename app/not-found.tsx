"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-8 bg-[radial-gradient(circle_at_50%_35%,#e9edff_0%,#f5f5ff_40%,#ffffff_80%)] dark:bg-[radial-gradient(circle_at_50%_35%,#1e2440_0%,#11131f_40%,#09090b_80%)]">
      <h1 className="text-4xl font-semibold">Page Not Found</h1>

      <Button onClick={() => router.replace("/")} className="px-6 py-6 text-md">
        <Plus className="size-5" />
        New tab
      </Button>
    </div>
  );
}
