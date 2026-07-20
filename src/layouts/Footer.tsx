import React, { useState } from "react";
import {
  Youtube,
  Instagram,
  Video,
  Music2,
  X,
  ChevronUp,
  ArrowUpRight,
  Cloud,
} from "lucide-react";

export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-auto w-full flex flex-col items-center">
      {}
      <div
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] w-full w-full px-2 sm:px-6 ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-[#f4f4f5] dark:bg-[#18181B] rounded-[2.5rem] p-8 md:p-14 mb-4 flex flex-col w-full shadow-sm border border-black/5 dark:border-white/5">
            {/* Top Section Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 w-full">
              {/* Bio Section */}
              <div className="md:col-span-4 lg:col-span-5">
                <h2 className="text-xl md:text-2xl font-medium text-zinc-900 dark:text-zinc-100 leading-snug max-w-sm tracking-tight">
                  Brana Films internal operations hub for production, team,
                  gear, and studio finance.
                </h2>
              </div>

              {/* Navigate Section */}
              <div className="md:col-span-2 lg:col-span-2">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                  Navigate
                </h3>
                <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <li>
                    <a
                      href="/"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/gears"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Gear
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/team"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Team
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/schedule"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Schedule
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/wallet"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Wallet
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/messages"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Hall Map
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources Section */}
              <div className="md:col-span-3 lg:col-span-2">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                  Resources
                </h3>
                <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  <li>
                    <a
                      href="https://www.branafilms.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Company website
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/team"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Team directory
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/schedule"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Production calendar
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard/wallet"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Finance & ledger
                    </a>
                  </li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-3 lg:col-span-3 flex flex-col justify-start">
                <a href="/dashboard/schedule" className="group block mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-[#FF3B30] dark:text-[#FF453A]">
                        Production schedule
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Shoot days, deadlines & bookings
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#FF3B30] dark:bg-[#FF453A] text-white flex items-center justify-center transition-transform group-hover:scale-110">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </a>

                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-4" />

                <a href="/dashboard/gears" className="group block">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        Gear inventory
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Equipment, assets & availability
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center transition-transform group-hover:scale-110">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {}
            {/* Huge Typography */}
            <div className="mt-16 md:mt-20 mb-8 md:mb-12 flex justify-center lg:justify-start overflow-hidden">
              <h1 className="text-[25vw] md:text-[14rem] lg:text-[18rem] leading-[0.75] font-black tracking-tighter text-zinc-900 dark:text-zinc-100 select-none">
                brana
              </h1>
            </div>

            {/* Expanded Footer Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/50 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-4">
                <span>Brana Films · Internal</span>
                <span className="text-zinc-400 dark:text-zinc-500">
                  Staff access only
                </span>
              </div>
              <div className="flex items-center gap-2 uppercase tracking-wider">
                <span>Addis Ababa</span>
                <span>3:49 PM</span>
                <span>22°C</span>
                <Cloud className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {/* Existing Small Footer */}
      <footer className="w-full px-6 py-2.5 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <a
              href="https://www.branafilms.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 leading-none text-muted-foreground hover:text-foreground transition-colors"
              title="Brana Films"
            >
              <img
                src="/favicon.svg"
                alt=""
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-90"
              />
              <span className="inline-flex items-baseline gap-1">
                <span className="text-[11px] font-semibold tracking-tight text-foreground/85 group-hover:text-foreground">
                  Brana
                </span>
                <span className="text-[10px] font-light tracking-wide text-muted-foreground">
                  Films
                </span>
              </span>
              <span
                className="inline-flex h-1 w-1 rounded-full bg-emerald-500/70 shadow-[0_0_6px_rgba(16,185,129,0.45)]"
                aria-hidden
              />
              <span className="text-[9px] font-normal normal-case tracking-normal text-muted-foreground/55">
                Studio Hub
              </span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:text-foreground transition-colors"
              title="X"
            >
              <div className="w-4 h-4 rounded bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
              </div>
              @branafilms
            </a>
            <a
              href="https://www.instagram.com/brana_films/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:text-foreground transition-colors"
              title="Instagram"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white flex items-center justify-center">
                <Instagram className="w-2.5 h-2.5" />
              </div>
              @brana_films
            </a>
            <a
              href="https://www.tiktok.com/@bokersalah"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:text-foreground transition-colors"
              title="TikTok"
            >
              <div className="w-4 h-4 rounded-md bg-[#000000] dark:bg-white text-white dark:text-black flex items-center justify-center">
                <Music2 className="w-2.5 h-2.5" />
              </div>
              @bokersalah
            </a>
            <a
              href="https://www.youtube.com/@branafilmproduction9795"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:text-foreground transition-colors"
              title="YouTube"
            >
              <div className="w-4 h-4 rounded-lg bg-[#FF0000] text-white flex items-center justify-center">
                <Youtube className="w-2.5 h-2.5" />
              </div>
              @branafilms
            </a>
            <a
              href="https://vimeo.com/user227192980"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:text-foreground transition-colors"
              title="Vimeo"
            >
              <div className="w-4 h-4 rounded bg-[#1AB7EA] text-white flex items-center justify-center">
                <Video className="w-2.5 h-2.5" />
              </div>
              vimeo
            </a>

            {}
            {/* Vertical Divider */}
            <div className="w-px h-4 bg-border/60 mx-1"></div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-all active:scale-95 ml-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              title={isExpanded ? "Collapse footer" : "Expand footer"}
              aria-expanded={isExpanded}
            >
              <ChevronUp
                className={`w-4 h-4 transition-transform duration-500 ease-in-out ${
                  isExpanded ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
