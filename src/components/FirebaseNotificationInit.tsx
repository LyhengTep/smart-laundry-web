"use client";

import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import {
  getFcmToken,
  registerFcmTokenForUser,
  requestFirebaseNotificationPermission,
  subscribeForegroundMessages,
} from "@/services/firebaseMessaging";
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

    const setup = async () => {
      try {
        const permission = await requestFirebaseNotificationPermission();
        if (permission !== "granted") return;

        const token = await getFcmToken();
        if (token) {
          const key = `FCM_SYNCED:${authUser?.id || "anonymous"}`;
          const lastSyncedToken = localStorage.getItem(key);
          console.log("Called update message token", authUser?.id);
          if (authUser?.id && lastSyncedToken !== token) {
            await registerFcmTokenForUser(authUser.id, token);
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
  }, [authUser?.id, toastCtx]);

  return null;
}
