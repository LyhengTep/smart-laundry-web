"use client";

import { NotifcationToast } from "@/components/NotificationToast";
import { createContext, ReactNode, useEffect, useState } from "react";
interface ToastContextType {
  toast: ToastType | null;
  setToast?: ((value: ToastType) => void) | null;
  setIsVisible: (value: boolean) => void;
}
type ToastType = {
  error: boolean;
  message?: string;
};
export const ToastContext = createContext<ToastContextType>({
  toast: null,
  setToast: null,
  setIsVisible: (s) => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastType>({
    error: false,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible)
      setToast({
        error: false,
        message: undefined,
      });
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, [isVisible]);
  return (
    <ToastContext.Provider
      value={{
        toast,
        setToast,
        setIsVisible,
      }}
    >
      {children}

      {isVisible && (
        <NotifcationToast
          error={toast.error || false}
          message={toast?.message || undefined}
          onClose={() => {
            setIsVisible(false);
          }}
        />
      )}
    </ToastContext.Provider>
  );
};
