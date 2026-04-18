"use client";

import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import {
  getFcmToken,
  requestFirebaseNotificationPermission,
  subscribeForegroundMessages,
} from "@/services/firebaseMessaging";
import { registerDeviceToken } from "@/services/deviceTokenService";
import { UserAuthResponse } from "@/types/auth";
import { useContext, useEffect } from "react";

export default function FirebaseNotificationInit() {
  const toastCtx = useContext(ToastContext);
  const { value: authUser } = useLocalStorage<UserAuthResponse>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  useEffect(() => {
    let unsubscribe: null | (() => void) = null;
    const detectDeviceType = () => {
      if (typeof navigator === "undefined") return "web";
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return "ios";
      if (/android/.test(ua)) return "android";
      return "web";
    };

    const setup = async () => {
      try {
        const permission = await requestFirebaseNotificationPermission();
        if (permission !== "granted") return;

        const token = await getFcmToken();
        if (token) {
          const key = `FCM_SYNCED:${authUser?.id || "anonymous"}`;
          const lastSyncedToken = localStorage.getItem(key);
          if (authUser?.id && lastSyncedToken !== token) {
            await registerDeviceToken({
              user_id: authUser.id,
              driver_id:
                authUser.role === "DRIVER" ? (authUser.driver?.id ?? null) : null,
              token,
              device_type: detectDeviceType(),
            });
            localStorage.setItem(key, token);
          }
        }

        unsubscribe = await subscribeForegroundMessages((payload) => {
          const message =
            payload.notification?.body ||
            payload.notification?.title ||
            "You have a new notification.";
          console.log("message recieved", message);
          toastCtx?.setToast?.({
            error: false,
            message,
          });
          toastCtx?.setIsVisible(true);
        });
      } catch (error) {
        console.error("Firebase notification init failed:", error);
      }
    };

    void setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authUser?.id, authUser?.role, authUser?.driver?.id, toastCtx]);

  return null;
}
