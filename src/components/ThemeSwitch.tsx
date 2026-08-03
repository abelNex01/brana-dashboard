import { memo } from "react";

/* ------------------------------------------------------------------ */
/* Theme switch — premium neumorphic capsule toggle                    */
/* Visual only: reads `theme` / calls `setTheme` exactly like the      */
/* two-button picker it replaces, so next-themes wiring is untouched.  */
/* ------------------------------------------------------------------ */

export const ThemeSwitch = memo(function ThemeSwitch({
  theme,
  setTheme,
  isExpanded,
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  isExpanded: boolean;
}) {
  const isDark = theme === "dark";

  // Same proportions (thumb ≈ 87% of track height, identical shadow
  // stack) at two calibrated sizes, so the switch reads correctly in
  // both the expanded and collapsed rail.
  const size = isExpanded
    ? { w: 56, h: 28, pad: 2, thumb: 24, icon: 11 }
    : { w: 44, h: 24, pad: 1.5, thumb: 21, icon: 9 };
  const travel = size.w - size.thumb - size.pad * 2;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative shrink-0 rounded-full transition-all duration-300 ease-out hover:brightness-110 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      style={{
        width: size.w,
        height: size.h,
        background: isDark
          ? "linear-gradient(180deg, #202020 0%, #141414 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)",
        border: isDark ? "1.5px solid #0a0a0a" : "1.5px solid #e0e0e0",
      }}
    >
      {/* glass sheen across the top of the track */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[3px] top-[2px] h-1/2 rounded-full bg-white/[0.05] backdrop-blur-sm"
      />

      {/* track icons — each sits in the space the thumb isn't covering */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-between"
        style={{ padding: `0 ${size.pad + 5}px` }}
      >
        <span
          className={`rounded-full border-[1.5px] transition-all duration-300 ease-out ${
            isDark ? "scale-100 opacity-100 border-white" : "scale-50 opacity-0 border-black"
          }`}
          style={{ width: size.icon, height: size.icon }}
        />
        <span
          className={`rounded-full transition-all duration-300 ease-out ${
            isDark ? "scale-50 opacity-0 bg-white/25" : "scale-100 opacity-100 bg-black/25"
          }`}
          style={{ width: size.icon, height: 2 }}
        />
      </span>

      {/* thumb */}
      <span
        aria-hidden
        className="absolute top-1/2 z-10 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)]"
        style={{
          left: size.pad,
          width: size.thumb,
          height: size.thumb,
          transform: `translateY(-50%) translateX(${isDark ? travel : 0}px)`,
          background:
            "radial-gradient(circle at 32% 26%, #4d4d4d 0%, #262626 55%, #161616 100%)",
          boxShadow: [
            "0 3px 6px rgba(0,0,0,0.55)", // elevation
            "inset 0 1px 0 rgba(255,255,255,0.1)", // top highlight
            "inset 0 -4px 6px rgba(0,0,0,0.45)", // inner shadow
            "0 0 0 1px rgba(0,0,0,0.4)", // edge definition
          ].join(", "),
        }}
      />
    </button>
  );
});
