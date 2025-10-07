import { subscribeToPush } from "./subscribeToPush";
import Swal from "sweetalert2";

let deferredPrompt;

// --- PWA INSTALL EVENT LISTENER ---
if (!window._pwaListenerAttached) {
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("✅ beforeinstallprompt fired:", e);
    e.preventDefault(); // prevent the mini-infobar
    deferredPrompt = e; // save event for manual trigger
  });
  window._pwaListenerAttached = true;
}

// --- PROMPT FOR PWA INSTALLATION ---
export const promptPwaInstall = async () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isFirefox = ua.includes("firefox");

  if (isIos) {
    Swal.fire({
      title: "📱 iOS Users",
      text: 'To install Brittoo, tap the Share button and select "Add to Home Screen".',
      icon: "info",
      confirmButtonColor: "#22c55e",
    });
    return;
  }

  if (isFirefox) {
    Swal.fire({
      title: "🦊 Firefox Users",
      text: 'Use the browser menu (☰) → "Install" to add Brittoo to your home screen.',
      icon: "info",
      confirmButtonColor: "#22c55e",
    });
    return;
  }

  if (deferredPrompt) {
    console.log("🟢 Prompting PWA install...");
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log("User choice:", outcome);

    if (outcome === "accepted") {
      Swal.fire({
        title: "🎉 Installed!",
        text: "Brittoo has been added to your home screen!",
        icon: "success",
        confirmButtonColor: "#22c55e",
      });
    } else {
      console.log("❌ User declined PWA install");
    }

    deferredPrompt = null;
  } else {
    Swal.fire({
      title: "⚠️ Install Not Available",
      text: "Please use your browser menu to install Brittoo.",
      icon: "warning",
      confirmButtonColor: "#22c55e",
    });
  }
};

// --- PROMPT FOR PUSH NOTIFICATIONS ---
export const promptNotifications = async () => {
  try {
    if (Notification.permission === "denied") {
      Swal.fire({
        title: "🔕 Notifications Blocked",
        text: "You've blocked notifications for this site. Enable them in browser settings to receive alerts.",
        icon: "info",
        confirmButtonColor: "#22c55e",
      });
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        await subscribeToPush();
        Swal.fire({
          title: "🔔 Notifications Enabled",
          text: "You'll now receive important updates from Brittoo!",
          icon: "success",
          confirmButtonColor: "#22c55e",
        });
      } else {
        Swal.fire({
          title: "🚫 Notifications Denied",
          text: "You can enable them later in browser settings.",
          icon: "warning",
          confirmButtonColor: "#22c55e",
        });
      }
    } else {
      // Already granted → just subscribe again safely
      await subscribeToPush();
    }
  } catch (err) {
    console.error("❌ Failed to subscribe to push notifications:", err);

    Swal.fire({
      title: "⚠️ Push Subscription Failed",
      text:
        "Could not enable notifications. This may be due to a missing VAPID key or invalid service worker configuration. Please refresh and try again.",
      icon: "error",
      confirmButtonColor: "#22c55e",
    });
  }
};
