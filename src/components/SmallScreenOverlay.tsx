import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X, Maximize2 } from "lucide-react";

const MIN_WIDTH = 1024;

export function SmallScreenOverlay() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < MIN_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isSmallScreen) setDismissed(false);
  }, [isSmallScreen]);

  const show = isSmallScreen && !dismissed;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-white/90 dark:bg-[#050505]/92"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[150px] bg-green-500/[0.06] dark:bg-green-500/[0.08]"
            />
            <div
              className="absolute bottom-[10%] left-[30%] w-[300px] h-[300px] rounded-full blur-[120px] bg-purple-500/[0.04] dark:bg-purple-500/[0.06]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-[380px] rounded-3xl overflow-hidden bg-white/80 dark:bg-[#141418]/85 border border-black/[0.08] dark:border-white/[0.08] shadow-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.5), transparent)",
              }}
            />

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all text-black/25 hover:text-black/60 dark:text-white/30 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer bg-transparent border-none z-10"
            >
              <X size={16} />
            </button>

            <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="relative mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-500/[0.08] dark:bg-green-500/[0.15] border border-green-500/20"
                  style={{ boxShadow: "0 8px 32px rgba(34, 197, 94, 0.1)" }}
                >
                  <Monitor
                    size={28}
                    className="text-green-600 dark:text-green-500"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-[20px] font-bold tracking-tight mb-2 text-gray-900 dark:text-white/[0.92]">
                Desktop Experience
              </h2>

              {/* Description */}
              <p className="text-[13px] leading-relaxed mb-6 text-gray-500 dark:text-white/[0.45]">
                This dashboard is optimized for larger screens. For the full
                experience with all features, please open on a desktop or laptop
                browser.
              </p>

              {/* Screen size indicator */}
              <div className="flex items-center gap-3 mb-7 w-full">
                {/* Small screen (current) */}
                <div className="flex-1 rounded-xl p-3 bg-red-500/[0.06] dark:bg-red-500/[0.08] border border-red-500/[0.12] dark:border-red-500/[0.15]">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <div className="w-4 h-3 rounded-[2px] border border-red-400/40" />
                    <span className="text-[9px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                      Current
                    </span>
                  </div>
                  <p className="text-[10px] text-red-500/60 dark:text-red-400/70 font-medium">
                    Limited view
                  </p>
                </div>

                {/* Arrow */}
                <Maximize2
                  size={14}
                  className="flex-shrink-0 text-black/15 dark:text-white/20"
                />

                {/* Large screen (recommended) */}
                <div className="flex-1 rounded-xl p-3 bg-green-500/[0.06] dark:bg-green-500/[0.08] border border-green-500/[0.12] dark:border-green-500/[0.15]">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <div className="w-6 h-4 rounded-[3px] border border-green-500/40 dark:border-green-400/40" />
                    <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                      Best
                    </span>
                  </div>
                  <p className="text-[10px] text-green-600/60 dark:text-green-400/70 font-medium">
                    Full experience
                  </p>
                </div>
              </div>

              {/* Minimum requirement note */}
              <p className="text-[10px] font-medium mb-5 text-black/25 dark:text-white/25">
                Minimum recommended width: 1024px
              </p>

              {/* Continue anyway button */}
              <button
                onClick={() => setDismissed(true)}
                className="w-full py-3 rounded-xl text-[12px] font-semibold cursor-pointer transition-all border bg-black/[0.03] dark:bg-white/[0.06] text-black/40 dark:text-white/50 border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] hover:text-black/60 dark:hover:text-white/70"
              >
                Continue anyway →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
