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
  ChevronDown,
  Command,
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
import { ThemeSwitch } from "@/components/ThemeSwitch";

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
  { icon: Users, label: "Team", id: "community", href: "/dashboard/team", badge: 12 },
  { icon: MessageSquare, label: "Chat", id: "messages", href: "/dashboard/messages" },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isSidebarExpanded, toggleSidebar } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (item: SidebarItem) => Boolean(item.href && location === item.href);
  const filterItems = (items: SidebarItem[]) =>
    searchQuery.trim()
      ? items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
      : items;

  return (
    <aside
      className={`relative flex h-dvh shrink-0 flex-col overflow-hidden border-r border-white/[0.055] bg-[#191919] text-[#a1a1a1] shadow-[12px_0_35px_rgba(0,0,0,0.12)] transition-[width] duration-300 ease-out ${
        isSidebarExpanded ? "w-[254px]" : "w-[68px]"
      }`}
    >
      {isSidebarExpanded && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
      )}

      <header className={`pt-5 shrink-0 ${isSidebarExpanded ? "px-4" : "px-2"}`}>
        <div className={`flex ${isSidebarExpanded ? "items-center justify-between" : "flex-col items-center gap-3"}`}>
          <button
            onClick={() => setLocation("/")}
            className="group flex min-w-0 items-center gap-3 rounded-xl text-left outline-none transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Go to overview"
          >
            <div className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-sm transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.07)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <img src="/favicon.svg" alt="" className="relative z-10 size-5 opacity-90 transition-transform duration-500 ease-out group-hover:scale-110" />
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col min-w-0 justify-center">
                <span className="truncate text-[16px] font-bold tracking-[0.03em] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent transition-all duration-300">
                  BRANA
                </span>
                <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors duration-300 group-hover:text-white/60">
                  FILMS
                </span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className="grid size-7 place-items-center rounded-md text-[#838383] transition-colors hover:bg-white/[0.07] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarExpanded ? <PanelLeftClose className="size-4" strokeWidth={1.7} /> : <PanelLeftOpen className="size-4" strokeWidth={1.7} />}
            </button>
          </div>
        </div>

        {isSidebarExpanded && (
          <label className="relative mt-5 flex h-9 items-center rounded-lg border border-white/[0.045] bg-[#171717] text-[#707070] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-colors focus-within:border-white/[0.13] focus-within:text-[#b6b6b6]">
            <Search className="ml-2.5 size-4 shrink-0" strokeWidth={1.65} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] text-[#dedede] outline-none placeholder:text-[#696969]"
              aria-label="Search navigation"
            />
            <span className="mr-2 flex items-center gap-0.5 text-[10px] text-[#666]" aria-hidden="true">
              <Command className="size-3" />K
            </span>
          </label>
        )}
      </header>

      <nav className={`mt-7 flex-1 min-h-0 overflow-y-auto ${isSidebarExpanded ? "px-4" : "px-2"}`} aria-label="Main navigation">
        {isSidebarExpanded && <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.02em] text-[#666]">Workspace</p>}
        <div className="space-y-0.5">
          {filterItems(mainItems).map((item) => (
            <SidebarButton
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isExpanded={isSidebarExpanded}
              onClick={() => item.href && setLocation(item.href)}
            />
          ))}
        </div>
      </nav>

      <footer className={`mt-auto border-t border-white/[0.045] pt-4 pb-6 shrink-0 flex justify-center ${isSidebarExpanded ? "mx-4 justify-start" : "mx-2"}`}>
        <ThemeSwitch theme={theme} setTheme={setTheme} isExpanded={isSidebarExpanded} />
      </footer>
    </aside>
  );
}

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
  const button = (
    <button
      id={`sidebar-btn-${item.id}`}
      onClick={onClick}
      className={`group relative flex h-11 w-full items-center rounded-lg text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/30 ${
        isExpanded ? "gap-3 px-3" : "justify-center"
      } ${
        isActive
          ? "bg-white/[0.065] text-[#f2f2f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
          : "text-[#969696] hover:bg-white/[0.045] hover:text-[#dedede]"
      }`}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.65} />
      {isExpanded && <span className="min-w-0 flex-1 truncate text-[14px] font-medium tracking-[-0.01em]">{item.label}</span>}
      {isExpanded && item.badge ? <span className="rounded-full bg-white/[0.09] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#d3d3d3]">{item.badge}</span> : null}
      {!isExpanded && item.badge ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#f0f0f0]" /> : null}
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
