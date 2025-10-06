import { subscribeToPush } from "./subscribeToPush";

let deferredPrompt; // For PWA install

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export const promptNotifications = async () => {
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeToPush();
      alert('Notifications enabled!');
    } else {
      alert('Notifications denied. You can enable later in browser settings.');
    }
  }
};

export const promptPwaInstall = async () => {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos) {
    alert('To install Brittoo, tap the Share button and select "Add to Home Screen".');
    return;
  }
  console.log("DEFERRED: ", deferredPrompt);
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      alert('App installed!');
    }
    deferredPrompt = null;
  } else {
    alert('App install prompt not available. Try from browser menu.');
  }
};