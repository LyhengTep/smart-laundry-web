"use client";

import { getCurrentUser } from "@/services/authService";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const resolveHomeByRole = (role?: string) => {
  if (role === "DRIVER") return "/drivers/tasks";
  if (role === "MERCHANT") return "/businesses-admin";
  if (role === "ADMIN") return "/admin/drivers";
  return "/";
};

export default function AuthRouteGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const isDriverArea = pathname.startsWith("/drivers");

    if (user.role === "DRIVER" && !isDriverArea) {
      router.replace("/drivers/tasks");
      return;
    }

    if (user.role !== "DRIVER" && isDriverArea) {
      router.replace(resolveHomeByRole(user.role));
    }
  }, [pathname, router]);

  return null;
}
