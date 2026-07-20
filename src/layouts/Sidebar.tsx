import { memo, useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutGrid,
  Cog,
  Users,
  Calendar,
  Wallet,
  MessageSquare,
  Search,
  ChevronUp,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
  href?: string;
  badge?: number;
}

/* ------------------------------------------------------------------ */
/* Data — preserved from the original component                        */
/* ------------------------------------------------------------------ */

const mainItems: SidebarItem[] = [
  { icon: LayoutGrid, label: "Overview", id: "dashboard", href: "/" },
  {
    icon: Calendar,
    label: "Schedule",
    id: "schedule",
    href: "/dashboard/schedule",
  },
  { icon: Cog, label: "Gear", id: "analytics", href: "/dashboard/gears" },
  { icon: Wallet, label: "Wallet", id: "wallet", href: "/dashboard/wallet" },
  { icon: Users, label: "Team", id: "community", href: "/dashboard/team", badge: 12 },
  {
    icon: MessageSquare,
    label: "Chat",
    id: "messages",
    href: "/dashboard/messages",
  },
];

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isSidebarExpanded, toggleSidebar } = useDashboard();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (item: SidebarItem) => {
    if (item.href) return location === item.href;
    return false;
  };

  const filterItems = (items: SidebarItem[]) =>
    searchQuery.trim()
      ? items.filter((i) =>
          i.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
      : items;

  return (
    <aside
      className={`${
        isSidebarExpanded ? "w-56" : "w-16"
      } shrink-0 bg-sidebar border-r border-border flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* ---------- Header: logo + collapse toggle ---------- */}
      <div className="px-4 pt-5 pb-4">
        <div
          className={`flex ${
            isSidebarExpanded
              ? "items-center justify-between"
              : "flex-col items-center gap-3"
          }`}
        >
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <img src="/favicon.svg" alt="Logo" className="h-6 w-6" />
            
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg border border-sidebar-border text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarExpanded ? (
              <PanelLeftClose className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ---------- Search ---------- */}
      <div className={`${isSidebarExpanded ? "px-4" : "px-3"} pb-2`}>
        {isSidebarExpanded ? (
          <div className="group flex items-center gap-2 px-2.5 h-9 rounded-lg bg-sidebar-accent border border-sidebar-border focus-within:border-sidebar-primary transition-colors">
            <Search className="w-3.5 h-3.5 text-sidebar-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 min-w-0 bg-transparent text-xs text-foreground placeholder:text-sidebar-foreground outline-none"
            />
            <span className="flex items-center gap-1 shrink-0">
              <kbd className="px-1 py-0.5 text-[9px] font-medium text-sidebar-foreground bg-sidebar-accent border border-sidebar-border rounded-md">
                ⌘
              </kbd>
              <kbd className="px-1 py-0.5 text-[9px] font-medium text-sidebar-foreground bg-sidebar-accent border border-sidebar-border rounded-md">
                F
              </kbd>
            </span>
          </div>
        ) : (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center h-10 rounded-xl bg-sidebar-accent border border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-sidebar-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              <p>Search</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ---------- Main navigation ---------- */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {filterItems(mainItems).map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            isActive={isActive(item)}
            isExpanded={isSidebarExpanded}
            onClick={() => {
              if (item.href) setLocation(item.href);
            }}
          />
        ))}

      </div>


      {/* ---------- Theme toggle (logic preserved, UI redesigned) ---------- */}
      <div
        className={`${
          isSidebarExpanded ? "px-3" : "px-2"
        } pb-3 flex items-center justify-center`}
      >
        <ThemeSwitch
          theme={theme}
          setTheme={setTheme}
          isExpanded={isSidebarExpanded}
        />
      </div>

    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Nav button — glowing indigo active pill like the reference          */
/* ------------------------------------------------------------------ */

const SidebarButton = memo(function SidebarButton({
  item,
  isActive,
  isExpanded,
  onClick,
}: {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const ButtonContent = (
    <button
      id={`sidebar-btn-${item.id}`}
      onClick={onClick}
      className={`relative w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-sidebar-accent via-sidebar-accent to-sidebar-primary/60 text-sidebar-primary-foreground shadow-[inset_0_1px_0_rgba(0,0,0,0.08)]"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
      } ${isExpanded ? "" : "justify-center"}`}
      aria-label={item.label}
    >
      {/* Right-edge glow bar on the active item */}
      {isActive && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.9)]" />
      )}
      <Icon className="w-4 h-4 flex-shrink-0" />
      {isExpanded && (
        <span className="flex-1 text-xs font-medium text-left truncate">
          {item.label}
        </span>
      )}
      {isExpanded && item.badge && (
        <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary/300 border border-primary/30 rounded-full">
          {item.badge}
        </span>
      )}
      {/* Collapsed badge dot */}
      {!isExpanded && item.badge && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.9)]" />
      )}
    </button>
  );

  if (isExpanded) {
    return ButtonContent;
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  );
});

/* ------------------------------------------------------------------ */
/* Theme switch — premium neumorphic capsule toggle                    */
/* Visual only: reads `theme` / calls `setTheme` exactly like the      */
/* two-button picker it replaces, so next-themes wiring is untouched.  */
/* ------------------------------------------------------------------ */

const ThemeSwitch = memo(function ThemeSwitch({
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
        background: "linear-gradient(180deg, #202020 0%, #141414 100%)",
        border: "1.5px solid #0a0a0a",
        boxShadow: [
          "0 8px 18px -4px rgba(0,0,0,0.55)", // outer shadow
          "0 1px 0 rgba(255,255,255,0.04)", // outer bevel edge
          "inset 0 1px 1px rgba(255,255,255,0.08)", // top highlight
          "inset 0 -8px 12px rgba(0,0,0,0.6)", // inner shadow (recess)
          "inset 0 2px 4px rgba(0,0,0,0.35)", // inner shadow (top)
          "0 0 22px rgba(255,255,255,0.035)", // soft ambient glow
        ].join(", "),
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
          className={`rounded-full border-[1.5px] border-white transition-all duration-300 ease-out ${
            isDark ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          style={{ width: size.icon, height: size.icon }}
        />
        <span
          className={`rounded-full bg-white/25 transition-all duration-300 ease-out ${
            isDark ? "scale-50 opacity-0" : "scale-100 opacity-100"
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