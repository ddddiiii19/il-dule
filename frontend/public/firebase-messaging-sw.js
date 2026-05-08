importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDJACAt-2YlxfAI92BLfO-ry5WIzqYJhQg",
  authDomain: "il-dule.firebaseapp.com",
  projectId: "il-dule",
  storageBucket: "il-dule.firebasestorage.app",
  messagingSenderId: "573404124658",
  appId: "1:573404124658:web:c8db70e200ce966fc0076b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 Mensaje recibido:', payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/logo192.png',
    }
  );
});