import { memo } from "react";
import { motion, type Variants } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const BRAND = "BRANA FILMS";

export const riseVariants: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

export const letterVariants: Variants = {
  initial: { opacity: 0, y: "0.5em" },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 + i * 0.02, ease: EASE_OUT },
  }),
};

export const Atmosphere = memo(function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute -top-[20%] left-1/2 h-[50vmax] w-[50vmax] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(128,128,128,0.14), rgba(128,128,128,0.05) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-[25%] -left-[10%] h-[40vmax] w-[40vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(128,128,128,0.10), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.18] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(115,115,115,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(115,115,115,0.10) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.04)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
});

type EmblemProps = {
  compact?: boolean;
};

export const Emblem = memo(function Emblem({ compact = false }: EmblemProps) {
  const size = compact ? "h-16 w-16 rounded-[18px]" : "h-24 w-24 rounded-[24px]";
  const iconSize = compact ? "h-8 w-8" : "h-12 w-12";
  const ringInset = compact ? "-inset-2 rounded-[20px]" : "-inset-3 rounded-[28px]";
  const haloInset = compact ? "-inset-5" : "-inset-8";
  const margin = compact ? "mb-6" : "mb-10";

  return (
    <motion.div variants={riseVariants} className={`relative ${margin}`}>
      <div
        aria-hidden
        className={`absolute ${haloInset} rounded-full bg-neutral-500/15 blur-2xl`}
      />

      <motion.div
        aria-hidden
        className={`absolute ${ringInset}`}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(128,128,128,0.8) 12%, rgba(128,128,128,0.6) 20%, transparent 32%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: 1.5,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div
        className={`relative flex ${size} items-center justify-center overflow-hidden border border-white/50 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]`}
        style={{
          boxShadow:
            "0 24px 60px -12px rgba(128,128,128,0.25), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-neutral-300/80 to-transparent" />

        <img
          src="/favicon.svg"
          alt="Brana Films"
          className={`relative ${iconSize} drop-shadow-[0_4px_16px_rgba(128,128,128,0.45)]`}
        />
      </div>

      <div
        aria-hidden
        className="absolute -bottom-4 left-1/2 h-2.5 w-16 -translate-x-1/2 rounded-full bg-neutral-500/25 blur-md"
      />
    </motion.div>
  );
});

type LoadingProgressBarProps = {
  progress: number;
  label?: string;
  compact?: boolean;
};

export const LoadingProgressBar = memo(function LoadingProgressBar({
  progress,
  label = "Initializing",
  compact = false,
}: LoadingProgressBarProps) {
  const rounded = Math.floor(progress);
  const percentSize = compact ? "text-2xl" : "text-3xl";

  return (
    <div className="w-full max-w-[300px]">
      <div
        className="relative h-[2px] w-full overflow-hidden rounded-full bg-black/[0.04] dark:bg-white/[0.05]"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute inset-0 origin-left rounded-full bg-black dark:bg-white"
          style={{
            transform: `scaleX(${progress / 100})`,
          }}
        />
      </div>

      <div className="mt-5 flex items-end justify-between select-none">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
          {label}
        </span>

        <span className="flex items-baseline gap-0.5 font-mono tabular-nums leading-none">
          <span
            className={`bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text font-light text-transparent dark:from-white dark:to-neutral-400 ${percentSize}`}
          >
            {String(rounded).padStart(2, "0")}
          </span>
          <span className="text-xs text-neutral-500/80">%</span>
        </span>
      </div>
    </div>
  );
});
