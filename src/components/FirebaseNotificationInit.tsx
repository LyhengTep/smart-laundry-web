"use client";

import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import { registerDeviceToken } from "@/services/deviceTokenService";
import {
  getFcmToken,
  requestFirebaseNotificationPermission,
  subscribeForegroundMessages,
} from "@/services/firebaseMessaging";
import { UserAuthResponse } from "@/types/auth";
import { useContext, useEffect, useRef } from "react";

const detectDeviceType = () => {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "web";
};

export default function FirebaseNotificationInit() {
  const toastCtx = useContext(ToastContext);
  const toastRef = useRef(toastCtx);
  toastRef.current = toastCtx;

  const { value: authUser } = useLocalStorage<UserAuthResponse>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  // Request permission as soon as the page loads — no auth required.
  useEffect(() => {
    void requestFirebaseNotificationPermission();
  }, []);

  // Register token and subscribe to foreground messages when auth is ready.
  useEffect(() => {
    if (!authUser?.id) return;

    let unsubscribe: null | (() => void) = null;

    const setup = async () => {
      try {
        const permission = await requestFirebaseNotificationPermission();
        if (permission !== "granted") return;

        const token = await getFcmToken();
        if (token) {
          const key = `FCM_SYNCED:${authUser.id}`;
          const lastSyncedToken = localStorage.getItem(key);
          if (lastSyncedToken !== token) {
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
          toastRef.current?.setToast?.({ error: false, message });
          toastRef.current?.setIsVisible(true);
        });
      } catch (error) {
        console.error("Firebase notification init failed:", error);
      }
    };

    void setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authUser?.id, authUser?.role, authUser?.driver?.id]);

  return null;
}
