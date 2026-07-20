import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/components/loading/shared";

export function PageTransitionLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalTime = 40;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev + (100 - prev) * 0.04;
        return prev + (96 - prev) * 0.07;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const rounded = Math.floor(progress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center">
        <img
          src="/favicon.svg"
          alt="Brana Films"
          className="mb-6 h-12 w-12"
        />

        <div className="w-[200px]">
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-foreground/10"
            role="progressbar"
            aria-valuenow={rounded}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full origin-left rounded-full bg-foreground/60"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
