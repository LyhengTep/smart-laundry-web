"use client";

import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  buildFirebaseSwUrl,
  getFirebaseMessaging,
  getFirebaseVapidKey,
} from "@/lib/firebase";
import { MessagePayload, getToken, onMessage } from "firebase/messaging";

const FIREBASE_SW_SCOPE = "/";

export const registerFirebaseServiceWorker = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator))
    return null;
  const swUrl = buildFirebaseSwUrl();
  return navigator.serviceWorker.register(swUrl, { scope: FIREBASE_SW_SCOPE });
};

export const requestFirebaseNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window))
    return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
};

export const getFcmToken = async () => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const vapidKey = getFirebaseVapidKey();
  if (!vapidKey) return null;

  const registration = await registerFirebaseServiceWorker();
  if (!registration) return null;

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
};

export const registerFcmTokenForUser = async (
  userId: string,
  msgToken: string,
) => {
  const res = await http.patch(API_ROUTES.UPDATE_USER_MSG_TOKEN(userId), {
    msg_token: msgToken,
  });
  return res.data;
};

export const subscribeForegroundMessages = async (
  handler: (payload: MessagePayload) => void,
) => {
  const messaging = await getFirebaseMessaging();
  console.log("firebase messaging", messaging);
  if (!messaging) return null;
  return onMessage(messaging, handler);
};
