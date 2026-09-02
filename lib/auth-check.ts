import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function checkAuth(redirectEnabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    if (redirectEnabled) {
      redirect("/settings");
    }

    return true;
  }

  return false;
}