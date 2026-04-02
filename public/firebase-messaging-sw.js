/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
  apiKey: "AIzaSyCarjrrZwKaIYw83jy3qOXna_Prb3kQKsc",
  authDomain: "smartlaundry-ae5d5.firebaseapp.com",
  projectId: "smartlaundry-ae5d5",
  storageBucket: "smartlaundry-ae5d5.firebasestorage.app",
  messagingSenderId: "1034237875310",
  appId: "1:1034237875310:web:a6bd4fa286ada53649c27f",
};

// self.addEventListener("push", (event) => {
//   console.log("🔥 PUSH ARRIVED");

//   if (event.data) {
//     console.log("DATA:", event.data.text());
//   }

//   self.registration.showNotification("Test", {
//     body: "Push received",
//   });
// });

const hasRequiredConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

if (hasRequiredConfig) {
  console.log("init firebase");
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log("init firebase", messaging);

  messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);
    const title = payload.notification?.title || "New notification";
    const options = {
      body: payload.notification?.body || "",
      icon: "/favicon.ico",
    };
    return self.registration.showNotification(title, options);
  });
}
