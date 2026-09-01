"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { authClient } from "@/lib/auth-client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ArrowLeft, Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogin() {
    if (!username || !password) {
      toast.info(
        "Please fill in both the username and password fields to sign in.",
      );
      return;
    }

    setLoading(true);

    const response = await authClient.signIn.username({
      username,
      password,
    });

    if (response.error) {
      toast.error(
        response.error.message ||
          "An error has occured, please try again later.",
      );
      setLoading(false);

      return;
    }

    toast.success("Success! Redirecting you now...");
    router.push("/settings");
  }

  return (
    <div className="flex flex-col min-h-screen items-center gap-8 bg-[radial-gradient(circle_at_50%_35%,#e9edff_0%,#f5f5ff_40%,#ffffff_80%)] dark:bg-[radial-gradient(circle_at_50%_35%,#1e2440_0%,#11131f_40%,#09090b_80%)]">
      <nav className="flex w-full items-center justify-between p-6">
        <Button
          variant="outline"
          size="icon"
          className="p-6"
          onClick={() => router.back()}
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

      <Card className="min-w-xs">
        <CardHeader>
          <CardTitle className="mb-2 text-lg">Sign in</CardTitle>
          <CardDescription>
            Sign in to your Tab Central account to sync settings between
            devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <p className="text-xs text-muted-foreground">
            Not yet got an account?{" "}
            <a href="/signup" className="underline hover:opacity-80">
              Click here
            </a>{" "}
            to sign up now!
          </p>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            className="w-full py-4"
          >
            Sign in
          </Button>
        </CardFooter>
      </Card>

      <Toaster position="top-center" />
    </div>
  );
}
