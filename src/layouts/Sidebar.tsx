import { memo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Cog,
  Users,
  Calendar,
  Wallet,
  MessageSquare,
  Search,
  ChevronDown,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboard } from "@/hooks/use-dashboard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { ServiceLogos } from "@/components/ServiceLogos";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
  href?: string;
  badge?: number;
}

const mainItems: SidebarItem[] = [
  { icon: LayoutGrid, label: "Overview", id: "dashboard", href: "/" },
  { icon: Calendar, label: "Schedule", id: "schedule", href: "/dashboard/schedule" },
  { icon: Cog, label: "Gear", id: "analytics", href: "/dashboard/gears" },
  { icon: Wallet, label: "Wallet", id: "wallet", href: "/dashboard/wallet" },
  { icon: Users, label: "Team", id: "community", href: "/dashboard/team" },
  { icon: MessageSquare, label: "Chat", id: "messages", href: "/dashboard/messages" },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isSidebarExpanded, toggleSidebar } = useDashboard();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    signOut();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const isActive = (item: SidebarItem) => Boolean(item.href && location === item.href);
  const filterItems = (items: SidebarItem[]) =>
    searchQuery.trim()
      ? items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
      : items;

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col overflow-hidden border-r transition-[width] duration-300 ease-out shadow-[12px_0_35px_rgba(0,0,0,0.12)] ${
        theme === 'dark'
          ? 'border-border bg-card text-muted-foreground'
          : 'border-white/[0.055] bg-[#191919] text-[#a1a1a1]'
      } ${
        isSidebarExpanded ? "w-[254px]" : "w-[68px]"
      }`}
    >
      {isSidebarExpanded && (
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
          theme === 'dark' ? 'bg-border' : 'bg-white/[0.06]'
        }`} />
      )}

      <header className={`pt-5 shrink-0 ${isSidebarExpanded ? "px-4" : "px-2"}`}>
        <div className={`flex ${isSidebarExpanded ? "items-center justify-between" : "flex-col items-center gap-3"}`}>
          <button
            onClick={() => setLocation("/")}
            className="group flex min-w-0 items-center gap-3 rounded-xl text-left outline-none transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Go to overview"
          >
            <div className={`relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border shadow-sm transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-foreground/10 to-transparent border-border group-hover:border-border group-hover:shadow-[0_0_20px_rgba(0,0,0,0.07)]'
                : 'bg-gradient-to-br from-white/10 to-transparent border-white/10 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.07)]'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-tr to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                theme === 'dark' ? 'from-foreground/5' : 'from-white/5'
              }`} />
              <img src="/favicon.svg" alt="" className="relative z-10 size-5 opacity-90 transition-transform duration-500 ease-out group-hover:scale-110" />
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col min-w-0 justify-center">
                <span className={`truncate text-[16px] font-bold tracking-[0.03em] bg-gradient-to-b bg-clip-text text-transparent transition-all duration-300 ${
                  theme === 'dark' ? 'from-foreground to-foreground/60' : 'from-white to-white/60'
                }`}>
                  BRANA
                </span>
                <span className={`truncate text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-foreground ${
                  theme === 'dark' ? 'text-muted-foreground group-hover:text-foreground' : 'text-white/40 group-hover:text-white/60'
                }`}>
                  FILMS
                </span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className={`grid size-7 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                theme === 'dark'
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  : 'text-[#838383] hover:bg-white/[0.07] hover:text-[#ededed] focus-visible:ring-white/30'
              }`}
              aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarExpanded ? <PanelLeftClose className="size-4" strokeWidth={1.7} /> : <PanelLeftOpen className="size-4" strokeWidth={1.7} />}
            </button>
          </div>
        </div>

        {isSidebarExpanded && (
          <label className={`relative mt-5 flex h-9 items-center rounded-lg border shadow-[inset_0_1px_0_rgba(0,0,0,0.025)] transition-colors ${
            theme === 'dark'
              ? 'border-border bg-muted text-muted-foreground focus-within:border-border focus-within:text-foreground'
              : 'border-white/[0.045] bg-[#171717] text-[#707070] focus-within:border-white/[0.13] focus-within:text-[#b6b6b6]'
          }`}>
            <Search className="ml-2.5 size-4 shrink-0" strokeWidth={1.65} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className={`h-full min-w-0 flex-1 bg-transparent px-2 outline-none ${
                theme === 'dark'
                  ? 'text-sm text-foreground placeholder:text-muted-foreground'
                  : 'text-[13px] text-[#dedede] placeholder:text-[#696969]'
              }`}
              aria-label="Search navigation"
            />
            <span className={`mr-2 flex items-center gap-0.5 text-[10px] ${
              theme === 'dark' ? 'text-muted-foreground' : 'text-[#666]'
            }`} aria-hidden="true">
              <Command className="size-3" />K
            </span>
          </label>
        )}
      </header>

      <nav className={`mt-7 flex-1 min-h-0 overflow-y-auto ${isSidebarExpanded ? "px-4" : "px-2"}`} aria-label="Main navigation">
        {isSidebarExpanded && <p className={`mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.02em] ${
          theme === 'dark' ? 'text-muted-foreground' : 'text-[#666]'
        }`}>Workspace</p>}
        <div className="space-y-0.5">
          {filterItems(mainItems).map((item) => (
            <SidebarButton
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isExpanded={isSidebarExpanded}
              onClick={() => item.href && setLocation(item.href)}
              theme={theme}
            />
          ))}
        </div>
      </nav>

      <footer className={`mt-auto border-t pt-4 pb-6 shrink-0 flex flex-col gap-4 ${
        theme === 'dark' ? 'border-border' : 'border-white/[0.045]'
      } ${isSidebarExpanded ? "mx-4" : "mx-2"}`}>
        <ServiceLogos isExpanded={isSidebarExpanded} />
        {isSidebarExpanded ? (
          <div className="flex items-center justify-between w-full">
            <ThemeSwitch theme={theme} setTheme={setTheme} isExpanded={isSidebarExpanded} />
            <button
              onClick={handleLogout}
              className={`grid size-7 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                theme === 'dark'
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  : 'text-[#838383] hover:bg-white/[0.07] hover:text-[#ededed] focus-visible:ring-white/30'
              }`}
              aria-label="Logout"
            >
              <LogOut className="size-4" strokeWidth={1.7} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ThemeSwitch theme={theme} setTheme={setTheme} isExpanded={isSidebarExpanded} />
            <button
              onClick={handleLogout}
              className={`grid size-7 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                theme === 'dark'
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  : 'text-[#838383] hover:bg-white/[0.07] hover:text-[#ededed] focus-visible:ring-white/30'
              }`}
              aria-label="Logout"
            >
              <LogOut className="size-4" strokeWidth={1.7} />
            </button>
          </div>
        )}
      </footer>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence mode="wait">
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/60 dark:bg-[#050505]/80"
              onClick={cancelLogout}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative max-w-sm w-full rounded-2xl overflow-hidden glass-modal"
              style={{
                willChange: "transform, opacity",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: "linear-gradient(90deg, transparent, #ef4444, transparent)",
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                <div>
                  <h2
                    className="text-base font-black text-foreground"
                    style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.2)" }}
                  >
                    Confirm Logout
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Are you sure you want to log out?
                  </p>
                </div>
                <button
                  onClick={cancelLogout}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  style={{
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-muted-foreground mb-6">
                  You will be signed out of your account and redirected to the login page.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelLogout}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}

const SidebarButton = memo(function SidebarButton({
  item,
  isActive,
  isExpanded,
  onClick,
  theme,
}: {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  theme: string | undefined;
}) {
  const Icon = item.icon;
  const button = (
    <button
      id={`sidebar-btn-${item.id}`}
      onClick={onClick}
      className={`group relative flex h-11 w-full items-center  text-left outline-none transition-colors duration-150 focus-visible:ring-2 ${
        isExpanded ? "gap-3 px-3" : "justify-center"
      } ${
        isActive
          ? theme === 'dark'
            ? 'bg-muted text-foreground shadow-[inset_0_1px_0_rgba(0,0,0,0.025)]'
            : 'bg-white/[0.065] text-[#f2f2f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]'
          : theme === 'dark'
            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
            : 'text-[#969696] hover:bg-white/[0.045] hover:text-[#dedede]'
      } ${
        theme === 'dark'
          ? 'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          : 'focus-visible:ring-white/30'
      }`}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.65} />
      {isExpanded && <span className={`min-w-0 flex-1 truncate text-[14px] tracking-[-0.01em] ${isActive ? 'font-sm' : 'font-light'}`}>{item.label}</span>}
      {isExpanded && item.badge ? <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
        theme === 'dark' ? 'bg-muted text-foreground' : 'bg-white/[0.09] text-[#d3d3d3]'
      }`}>{item.badge}</span> : null}
      {!isExpanded && item.badge ? <span className={`absolute right-1.5 top-1.5 size-1.5 rounded-full ${
        theme === 'dark' ? 'bg-foreground' : 'bg-[#f0f0f0]'
      }`} /> : null}
    </button>
  );

  if (isExpanded) return button;
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}><p>{item.label}</p></TooltipContent>
    </Tooltip>
  );
});
