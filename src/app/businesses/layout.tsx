"use client";

import { getCurrentUser } from "@/services/authService";
import { notFound } from "next/navigation";
import { useEffect } from "react";

export default function BussinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const user = getCurrentUser();
    console.log("Current User in Business Layout:", user);
    if (!user || user.role !== "MERCHANT") {
      notFound();
    }
  }, []);

  return <>{children}</>;
}
