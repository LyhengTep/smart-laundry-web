"use client";
import { DialogProvider } from "@/contexts/DialogProvider";
import { ToastProvider } from "@/contexts/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [toastValues, setToastValues] = useState({
    show: false,
    error: false,
  });
  return (
    <QueryClientProvider client={client}>
      <DialogProvider>
        <ToastProvider>{children}</ToastProvider>
      </DialogProvider>
    </QueryClientProvider>
  );
}
