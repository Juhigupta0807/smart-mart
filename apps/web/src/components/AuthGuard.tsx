"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthGuard({ role, children }: { role: "customer" | "admin"; children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;
    const allowed = !!data && data.user.role === role;
    if (!data) {
      router.replace(`${role === "admin" ? "/admin/login" : "/login"}?next=${encodeURIComponent(pathname)}`);
    } else if (!allowed) {
      router.replace("/");
    }
  }, [isPending, data, role, pathname, router]);

  const allowed = !!data && data.user.role === role;
  if (isPending || !allowed) return <p className="p-6 text-sm text-gray-500">Loading...</p>;
  return <>{children}</>;
}
