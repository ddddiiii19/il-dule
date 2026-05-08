import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDJACAt-2YlxfAI92BLfO-ry5WIzqYJhQg",
  authDomain: "il-dule.firebaseapp.com",
  projectId: "il-dule",
  storageBucket: "il-dule.firebasestorage.app",
  messagingSenderId: "573404124658",
  appId: "1:573404124658:web:c8db70e200ce966fc0076b"
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export async function requestFCMPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Permiso denegado');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        'BJi6GpRkCAKRV4j-0l86gl5-qmRjam9dQ8JULUHOqPZ2kURAtyt6gCl7olktdR3YvcyAXeIdeGgqFt4dHXjdMkk',
    });

    console.log('FCM TOKEN:', token);

    return token;
  } catch (error) {
    console.error('Error Firebase:', error);
    return null;
  }
}