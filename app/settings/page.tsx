"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen items-center gap-8 bg-[radial-gradient(circle_at_50%_35%,#e9edff_0%,#f5f5ff_40%,#ffffff_80%)] dark:bg-[radial-gradient(circle_at_50%_35%,#1e2440_0%,#11131f_40%,#09090b_80%)]">
      <nav className="flex w-full items-center justify-between p-6">
        <Button
          variant="outline"
          size="icon"
          className="p-6"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="size-6 text-foreground/95" />
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
        <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-semibold text-4xl">Settings</h1>
          <p className="font-medium text-muted-foreground">
            Customise the new tab page to your liking.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-row gap-2 items-center justify-center">
            <Spinner />
            <p>Loading...</p>
          </div>
        ) : loggedIn ? (
          <div className="w-full flex flex-col gap-6">
            <Field orientation="horizontal">
              <Checkbox id="quick-links" />
              <FieldLabel htmlFor="quick-links">Show quick links</FieldLabel>
            </Field>

            <Field className="w-1/3">
              <FieldLabel htmlFor="search-mode">Default search mode</FieldLabel>
              <Select id="search-mode" defaultValue="Normal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Web only">Web only</SelectItem>
                  <SelectItem value="AI only">AI only</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : (
          <div className="flex flex-row gap-4">
            <Button
              variant="outline"
              className="py-6 px-8"
              onClick={() => router.push("/login")}
            >
              Log in
            </Button>
            <Button
              className="py-6 px-8"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
