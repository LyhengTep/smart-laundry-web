"use client";
import AuthRouteGate from "@/components/AuthRouteGate";
import FirebaseNotificationInit from "@/components/FirebaseNotificationInit";
import { DialogProvider } from "@/contexts/DialogProvider";
import { ToastProvider } from "@/contexts/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <DialogProvider>
        <ToastProvider>
          <AuthRouteGate />
          <FirebaseNotificationInit />
          {children}
        </ToastProvider>
      </DialogProvider>
    </QueryClientProvider>
  );
}
