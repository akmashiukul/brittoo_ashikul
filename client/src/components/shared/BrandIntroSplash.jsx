import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import brittoLogo from "../../assets/brittoo-logo.png";

const BrandIntroSplash = () => {
  const [stage, setStage] = useState("center"); // 'center' | 'docking' | 'done'
  const [targetCoords, setTargetCoords] = useState(null);

  useEffect(() => {
    // Check session storage so it runs on fresh site load
    const hasSeenIntro = sessionStorage.getItem("brittoo_intro_loaded");
    if (hasSeenIntro) {
      setStage("done");
      return;
    }

    // Measure exact position of navbar logo
    const updateTargetPosition = () => {
      const navLogo = document.getElementById("navbar-brand-logo");
      if (navLogo) {
        const rect = navLogo.getBoundingClientRect();
        setTargetCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);

    // Timeline:
    // 0ms - 1400ms: Center loading state
    // 1400ms - 2200ms: Glides smoothly to navbar top-left
    // 2200ms: Docked, handover to static navbar
    const dockingTimer = setTimeout(() => {
      updateTargetPosition();
      setStage("docking");
    }, 1500);

    const doneTimer = setTimeout(() => {
      setStage("done");
      sessionStorage.setItem("brittoo_intro_loaded", "true");
    }, 2300);

    return () => {
      clearTimeout(dockingTimer);
      clearTimeout(doneTimer);
      window.removeEventListener("resize", updateTargetPosition);
    };
  }, []);

  if (stage === "done") return null;

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          key="brand-splash-backdrop"
          initial={{ opacity: 1 }}
          animate={{
            opacity: stage === "docking" ? 0 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed inset-0 z-50 select-none flex items-center justify-center bg-white/95 backdrop-blur-xl transition-opacity ${
            stage === "docking" ? "pointer-events-none" : "pointer-events-auto cursor-wait"
          }`}
        >
          {/* Soft ambient emerald radial glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: stage === "center" ? [0.9, 1.1, 0.95] : 0.6,
                opacity: stage === "center" ? 0.35 : 0,
              }}
              transition={{
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                opacity: { duration: 0.6 },
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] rounded-full blur-3xl bg-gradient-to-tr from-emerald-300 via-green-200 to-lime-200"
            />
          </div>

          {/* Central Logo & Tagline Stage */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Logo Container with Smooth Entry & Float */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 15 }}
              animate={{
                scale: stage === "center" ? 1 : 0.45,
                opacity: stage === "center" ? 1 : 0,
                y: stage === "center" ? 0 : -80,
              }}
              transition={{
                duration: stage === "center" ? 0.7 : 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center justify-center mb-6"
            >
              <div className="p-4 sm:p-6 rounded-3xl bg-white/95 shadow-2xl shadow-green-600/10 border border-green-50/80 ring-1 ring-black/5">
                <img
                  src={brittoLogo}
                  alt="Brittoo Logo"
                  className="h-16 sm:h-22 md:h-26 object-contain drop-shadow-sm"
                />
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: stage === "center" ? 1 : 0,
                y: stage === "center" ? 0 : -20,
              }}
              transition={{
                delay: stage === "center" ? 0.25 : 0,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="text-center px-4"
            >
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                <span className="text-emerald-500 drop-shadow-sm">Own Less,</span>{" "}
                <span>Access More</span>
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm font-medium tracking-wider uppercase text-gray-500">
                The Next-Gen Community Rental Platform
              </p>

              {/* Elegant Minimal Loading Bar */}
              <div className="mt-6 w-36 sm:w-48 h-1 mx-auto bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  className="w-full h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandIntroSplash;
