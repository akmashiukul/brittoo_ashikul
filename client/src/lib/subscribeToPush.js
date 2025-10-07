import api from "./api";

// Converts base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export const subscribeToPush = async () => {
  if (!('PushManager' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    });

    // Send subscription to backend
    const res = await api.post('/api/v1/notifications/subscribe', {
      subscription: subscription.toJSON(),
    });

    console.log("✅ Push subscription successful:", res.data);
    return subscription;

  } catch (err) {
    console.error("❌ Failed to subscribe to push notifications:", err);
  }
};
