import { subscribeToPush } from "./subscribeToPush";
import Swal from "sweetalert2";

let deferredPrompt;

if (!window._pwaListenerAttached) {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ beforeinstallprompt fired:', e);
    e.preventDefault();
    deferredPrompt = e;
  });
  window._pwaListenerAttached = true;
}

export const promptPwaInstall = async () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isFirefox = ua.includes('firefox');

  if (isIos) {
    Swal.fire({
      title: '📱 iOS Users',
      text: 'To install Brittoo, tap the Share button and select "Add to Home Screen".',
      icon: 'info',
      confirmButtonColor: '#22c55e'
    });
    return;
  }

  if (isFirefox) {
    Swal.fire({
      title: '🦊 Firefox Users',
      text: 'Use the browser menu (☰) → "Install" to add Brittoo to your home screen.',
      icon: 'info',
      confirmButtonColor: '#22c55e'
    });
    return;
  }

  if (deferredPrompt) {
    console.log('🟢 Prompting PWA install...');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('User choice:', outcome);

    if (outcome === 'accepted') {
      Swal.fire({
        title: '🎉 Installed!',
        text: 'Brittoo has been added to your home screen!',
        icon: 'success',
        confirmButtonColor: '#22c55e',
      });
    } else {
      console.log('❌ User declined PWA install');
    }
    deferredPrompt = null;
  } else {
    Swal.fire({
      title: '⚠️ Install Not Available',
      text: 'Please use your browser menu to install Brittoo.',
      icon: 'warning',
      confirmButtonColor: '#22c55e',
    });
  }
};

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