import api from "./api";

export const subscribeToPush = async () => {
  if (!('PushManager' in window)) return;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  });

  // Send to backend
  try {
    const res = await api.post('/api/v1/notifications/subscribe', { subscription: sub.toJSON() });
    console.log(res)
  } catch (error) {
    console.log(error);
  }
};