import { checkAuth } from "@/lib/auth-check";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await checkAuth(true);

  if (!authenticated) {
    return <>{children}</>;
  }
}
