"use client";

import dynamic from "next/dynamic";
import { createContext, ReactNode, useEffect, useState } from "react";

const NotifcationToast = dynamic(
  () => import("@/components/NotificationToast"),
  { ssr: false },
);
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
    if (isVisible == false)
      setToast({
        error: false,
        message: undefined,
      });
    setTimeout(() => {
      setIsVisible(false);
      setToast({
        error: false,
        message: undefined,
      });
    }, 2000);
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
