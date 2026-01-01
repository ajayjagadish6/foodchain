/* eslint-disable no-undef */
/* Firebase Messaging service worker
 *
 * Note: Vite will serve this file from /firebase-messaging-sw.js
 * You must fill in the Firebase config values in production build steps.
 *
 * For local dev, you can skip web-push entirely.
 */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || undefined,
  authDomain: self.FIREBASE_AUTH_DOMAIN || undefined,
  projectId: self.FIREBASE_PROJECT_ID || undefined,
  storageBucket: self.FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: self.FIREBASE_APP_ID || undefined
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || 'FoodChain'
  const options = {
    body: payload?.notification?.body || '',
    data: payload?.data || {}
  }
  self.registration.showNotification(title, options)
});
