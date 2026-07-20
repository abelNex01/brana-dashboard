import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Atmosphere,
  BRAND,
  EASE_OUT,
  Emblem,
  letterVariants,
  LoadingProgressBar,
  riseVariants,
} from "@/components/loading/shared";

const containerVariants: Variants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    scale: 1.01,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const stageVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  exit: {
    y: -24,
    opacity: 0,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

const INTRO_DELAY_MS = 600;
const PROGRESS_DURATION_MS = 1500;
const HOLD_AT_COMPLETE_MS = 200;
const EXIT_ANIMATION_MS = 300;

const ProgressSection = memo(function ProgressSection({
  progress,
}: {
  progress: number;
}) {
  return (
    <motion.div variants={riseVariants} className="w-full max-w-[300px]">
      <LoadingProgressBar progress={progress} />
    </motion.div>
  );
});

type LoadingScreenProps = {
  onComplete?: () => void;
};

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalTime = 40;
    const step = 100 / (PROGRESS_DURATION_MS / intervalTime);
    let timer: ReturnType<typeof setInterval> | undefined;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    const startDelay = setTimeout(() => {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (timer) clearInterval(timer);
            holdTimer = setTimeout(() => {
              setIsVisible(false);
              sessionStorage.setItem("app_initial_loaded", "true");
              exitTimer = setTimeout(() => {
                onComplete?.();
              }, EXIT_ANIMATION_MS);
            }, HOLD_AT_COMPLETE_MS);
            return 100;
          }
          return prev + step;
        });
      }, intervalTime);
    }, INTRO_DELAY_MS);

    return () => {
      clearTimeout(startDelay);
      if (timer) clearInterval(timer);
      if (holdTimer) clearTimeout(holdTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#fafafa] dark:bg-[#050505] p-6"
        >
          <Atmosphere />

          <motion.div
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 flex w-full max-w-sm flex-col items-center"
          >
            <Emblem />

            <h1
              aria-label={BRAND}
              className="mb-3 flex text-[clamp(1.6rem,4vw,2rem)] font-semibold tracking-[0.22em] text-neutral-900 dark:text-white"
            >
              {BRAND.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  aria-hidden
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h1>

            <motion.p
              variants={riseVariants}
              className="mb-12 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.42em] text-neutral-400 dark:text-neutral-500"
            >
              Studio Management v1.2
            </motion.p>

            <ProgressSection progress={progress} />
          </motion.div>

          <motion.p
            variants={riseVariants}
            initial="initial"
            animate="animate"
            className="absolute bottom-8 text-[9px] uppercase tracking-[0.4em] text-neutral-300 dark:text-neutral-700 select-none"
          >
            Production Hub
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
