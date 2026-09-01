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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleSignUp() {
    if (!email || !username || !password) {
      toast.info("You must fill in all fields to sign up.");
      return;
    }

    setLoading(true);

    const response = await authClient.signUp.email({
      email,
      name: username,
      password,
      username,
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
          <CardTitle className="mb-2 text-lg">Sign up</CardTitle>
          <CardDescription>
            Create a Tab Central account to customise your new tab page and save
            settings across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="username">Email</FieldLabel>
            <Input
              id="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <i className="text-xs text-muted-foreground">
              Note: this will be used to sign in to your account, not your
              email.
            </i>
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
            Already got an account?{" "}
            <a href="/login" className="underline hover:opacity-80">
              Click here
            </a>{" "}
            to log in now!
          </p>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-4"
            onClick={handleSignUp}
          >
            Create account
          </Button>
        </CardFooter>
      </Card>

      <Toaster position="top-center" />
    </div>
  );
}
