import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  Settings2,
  Home,
  Layers,
  Video,
  Users,
  Settings,
  Moon,
  HelpCircle,
  Zap,
  Sun,
  Star,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Calendar,
  DollarSign,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { AuthSlides } from "@/data/cloudinary-images";
import { useSearch, SearchResult } from "@/contexts/SearchContext";

export function Navbar() {
  const { toggleNotification } = useDashboard();
  const [, setLocation] = useLocation();
  const { currentUser, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { searchResults } = useSearch();

  // Dialog popups states
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setResults(searchResults(searchQuery));
      setShowSearchResults(true);
    } else {
      setResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, searchResults]);

  // Handle search result click
  const handleResultClick = (result: SearchResult) => {
    setLocation(result.page);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = currentUser?.fullName || "User";
  const displayRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "Member";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="flex items-center justify-between py-2 px-6 border-b border-border/40 bg-background/50 backdrop-blur-sm relative z-50">
      {/* Search Section */}
      <div className="flex items-center gap-3 search-container relative">
        <div className="group flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/50 border border-border/60 focus-within:border-primary/50 transition-colors w-80">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            placeholder="Search everything..."
            className="flex-1 min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="flex items-center gap-1 shrink-0">
            <kbd className="px-1 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted border border-border/60 rounded-md">
              ⌘
            </kbd>
            <kbd className="px-1 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted border border-border/60 rounded-md">
              K
            </kbd>
          </span>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && results.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl border border-border/60 bg-popover shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
            <div className="p-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                {results.length} results found
              </p>
              <div className="mt-1 space-y-0.5">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-lg">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {result.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSearchResults && results.length === 0 && (
          <div className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-border/60 bg-popover shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
            <div className="p-4 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">No results found</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Try a different search term
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Tools & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 border-l border-border/40 pl-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNotification}
            className="text-muted-foreground hover:text-foreground rounded-lg h-8 w-8"
          >
            <Bell className="w-3.5 h-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-auto px-2 hover:bg-muted/50 rounded-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[11px] font-bold text-foreground leading-tight tracking-tight">
                      {displayName}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,127,0.5)] animate-pulse" />
                      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                        {displayRole}
                      </span>
                    </div>
                  </div>
                  <Avatar className="h-8 w-8 border border-border/40 shadow-inner">
                    <AvatarImage
                      src={currentUser?.avatar || AuthSlides.avatar}
                      alt={displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-72 mt-2 bg-popover text-popover-foreground dark:bg-[#0d0d0f] border border-border/80 dark:border-border/40 shadow-2xl rounded-2xl p-2.5 animate-in fade-in-0 zoom-in-95"
              align="end"
            >
              {/* Header profile block */}
              <div className="flex items-center justify-between p-2.5 bg-muted/40 dark:bg-zinc-900/40 rounded-xl mb-2.5 border border-border/20 dark:border-border/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-border/40 shadow-inner">
                      <AvatarImage
                        src={currentUser?.avatar || AuthSlides.avatar}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-popover dark:border-[#0d0d0f] shadow-sm animate-pulse" />
                  </div>
                  <div className="flex flex-col text-left min-w-0 max-w-[130px]">
                    <span className="text-[12px] font-bold text-foreground truncate leading-tight">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                      {currentUser?.email || "user@branafilms.com"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full select-none shrink-0 tracking-wider">
                  <Zap className="w-2.5 h-2.5 fill-current stroke-none" />
                  <span>PRO</span>
                </div>
              </div>

              {/* Navigation Section */}
              <div className="space-y-0.5">
                <DropdownMenuItem
                  onClick={() => {
                    setLocation("/");
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">Home</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActivePopup("pages")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">Pages</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActivePopup("stream")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">Active stream</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActivePopup("people")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">People</span>
                </DropdownMenuItem>
              </div>

              <div className="h-px bg-border/40 my-2" />

              {/* Settings Section */}
              <div className="space-y-0.5">
                <DropdownMenuItem
                  onClick={() => setActivePopup("settings")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">Site settings</span>
                </DropdownMenuItem>

                {/* Dark/Light mode toggle item */}
                <div className="px-3 py-2">
                  <ThemeSwitch theme={theme} setTheme={setTheme} isExpanded={true} />
                </div>

                <DropdownMenuItem
                  onClick={() => setActivePopup("profile")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">My profile & preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActivePopup("help")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/60 dark:hover:bg-zinc-800/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-[12px] font-medium">Help center</span>
                </DropdownMenuItem>
              </div>

              <div className="h-px bg-border/40 my-2" />

              {/* Footer Block */}
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  type="button"
                  onClick={() => setActivePopup("feedback")}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer pl-1.5 focus:outline-none"
                >
                  Feedback
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    signOut();
                  }}
                  className="bg-muted hover:bg-muted/80 text-foreground border border-border/20 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-border/25 dark:hover:border-border/60 text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ─── POPUP MODAL DIALOGS ─── */}

      {/* 1. Pages Directory Popup */}
      <Dialog open={activePopup === "pages"} onOpenChange={(open) => !open && setActivePopup(null)}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Application Pages Directory
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Directly jump to any active section inside the Brana Films Console.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3.5 mt-4">
            <Button
              variant="outline"
              className="flex items-center gap-2.5 justify-start py-5 cursor-pointer text-xs font-semibold hover:border-primary/50 transition-colors"
              onClick={() => {
                setLocation("/");
                setActivePopup(null);
              }}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-500 shrink-0" />
              Dashboard Overview
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2.5 justify-start py-5 cursor-pointer text-xs font-semibold hover:border-primary/50 transition-colors"
              onClick={() => {
                setLocation("/dashboard/gears");
                setActivePopup(null);
              }}
            >
              <Video className="h-4 w-4 text-orange-500 shrink-0" />
              Gear Inventory Roster
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2.5 justify-start py-5 cursor-pointer text-xs font-semibold hover:border-primary/50 transition-colors"
              onClick={() => {
                setLocation("/dashboard/team");
                setActivePopup(null);
              }}
            >
              <Users className="h-4 w-4 text-blue-500 shrink-0" />
              Team Crew roster
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2.5 justify-start py-5 cursor-pointer text-xs font-semibold hover:border-primary/50 transition-colors"
              onClick={() => {
                setLocation("/dashboard/schedule");
                setActivePopup(null);
              }}
            >
              <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
              Shoots & Calendars
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2.5 justify-start py-5 cursor-pointer text-xs font-semibold hover:border-primary/50 transition-colors"
              onClick={() => {
                setLocation("/dashboard/wallet");
                setActivePopup(null);
              }}
            >
              <DollarSign className="h-4 w-4 text-yellow-500 shrink-0" />
              Bento Wallet Ledger
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2.5 justify-start py-5 cursor-pointer text-xs font-semibold hover:border-primary/50 transition-colors"
              onClick={() => {
                setLocation("/dashboard/messages");
                setActivePopup(null);
              }}
            >
              <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
              Hall Layout Seating
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Active Stream Popup */}
      <Dialog open={activePopup === "stream"} onOpenChange={(open) => !open && setActivePopup(null)}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              Active Production Stream
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Monitor live broadcast nodes, bitrate limits, and encoder states.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 text-left">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex items-center gap-3">
                <span className={`relative flex h-3.5 w-3.5 ${isStreaming ? "animate-pulse" : ""}`}>
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isStreaming ? "bg-red-500 animate-ping" : "bg-zinc-500"}`} />
                  <span className={`relative inline-flex h-3.5 w-3.5 rounded-full ${isStreaming ? "bg-red-500" : "bg-zinc-500"}`} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isStreaming ? "Broadcasting Live" : "Stream Suspended"}
                </span>
              </div>
              <Button
                size="sm"
                variant={isStreaming ? "destructive" : "default"}
                onClick={() => setIsStreaming(!isStreaming)}
                className="text-xs px-4 font-bold cursor-pointer"
              >
                {isStreaming ? "Stop Live" : "Start Live"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Video Resolution</span>
                <p className="text-sm font-black text-foreground mt-0.5">4K UHD (3840x2160)</p>
              </div>
              <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Target Bitrate</span>
                <p className="text-sm font-black text-foreground mt-0.5">{isStreaming ? "12,450 kbps" : "0 kbps"}</p>
              </div>
              <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Framerate (FPS)</span>
                <p className="text-sm font-black text-foreground mt-0.5">{isStreaming ? "59.94 fps" : "0 fps"}</p>
              </div>
              <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Broadcaster Node</span>
                <p className="text-sm font-black text-foreground mt-0.5">US-EAST-04 (AWS)</p>
              </div>
            </div>

            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">RTMP Endpoint:</span>
                <span className="font-mono text-[11px] font-bold text-foreground">rtmp://live.branafilms.com/app</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Secret Key:</span>
                <span className="font-mono text-[11px] font-bold text-foreground">••••••••••••••••••••••••</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. People Popup */}
      <Dialog open={activePopup === "people"} onOpenChange={(open) => !open && setActivePopup(null)}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Crew & Operators Status
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Current activity monitor for registered studio crew members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 mt-4 text-left">
            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Abi Sala</h4>
                  <span className="text-[10px] text-muted-foreground">Lead Director</span>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500">
                  SC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Sophia Chen</h4>
                  <span className="text-[10px] text-muted-foreground">Editor / Colorist</span>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                Editing
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-xs font-bold text-orange-500">
                  MA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Marcus Aurelius</h4>
                  <span className="text-[10px] text-muted-foreground">Gaffer / DP</span>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                In Field
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-xs font-bold text-zinc-500">
                  EG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Eliana Gomez</h4>
                  <span className="text-[10px] text-muted-foreground">Camerawoman</span>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Off Duty
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Site Settings Popup */}
      <Dialog open={activePopup === "settings"} onOpenChange={(open) => !open && setActivePopup(null)}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-500" />
              Studio Control Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update global system constants and storage paths.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Encoder Target Bitrate (kbps)</label>
              <input
                type="number"
                defaultValue={12450}
                className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-muted/20 outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Storage Destination Path</label>
              <input
                type="text"
                defaultValue="/mnt/studio/drives/primary"
                className="w-full text-xs h-9 px-3 rounded-lg border border-border bg-muted/20 outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Database Auto-Backup Frequency</label>
              <select className="w-full text-xs h-9 px-2 rounded-lg border border-border bg-popover outline-none focus:border-primary/50">
                <option value="daily">Every 24 hours (Daily)</option>
                <option value="weekly">Every 7 days (Weekly)</option>
                <option value="monthly">Every 30 days (Monthly)</option>
              </select>
            </div>
            <div className="flex justify-end pt-3">
              <Button
                onClick={() => setActivePopup(null)}
                className="text-xs px-5 font-bold cursor-pointer"
              >
                Save Configurations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. My Profile & Preferences Popup */}
      <Dialog open={activePopup === "profile"} onOpenChange={(open) => !open && setActivePopup(null)}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" />
              Profile Details & Preferences
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Personal registration details and notification settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 mt-4 text-left">
            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border/60 rounded-xl">
              <Avatar className="h-14 w-14 border border-border/40">
                <AvatarImage src={currentUser?.avatar || AuthSlides.avatar} alt={displayName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-black text-foreground">{displayName}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{displayRole}</p>
              </div>
            </div>

            <div className="p-3 bg-muted/10 border border-border/40 rounded-xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User Email:</span>
                <span className="font-semibold text-foreground">{currentUser?.email}</span>
              </div>
              {currentUser?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="font-semibold text-foreground">{currentUser.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Created:</span>
                <span className="font-semibold text-foreground">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "2026-07-14"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">UI Theme preferences</label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1 text-xs cursor-pointer"
                >
                  Light Theme
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1 text-xs cursor-pointer"
                >
                  Dark Theme
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. Help Center Popup */}
      <Dialog open={activePopup === "help"} onOpenChange={(open) => !open && setActivePopup(null)}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-500" />
              Studio Help Center & FAQs
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Common operational guidelines for managing studio workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4 text-left max-h-[350px] overflow-y-auto pr-1">
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <h4 className="text-xs font-bold text-foreground">How do I checkout production gear?</h4>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Go to the <strong>Gear Inventory</strong> page, click on any equipment card, select checked-out status, and allocate it to the active operator.
              </p>
            </div>
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <h4 className="text-xs font-bold text-foreground">Where are database backups stored?</h4>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Backups are automatically serialized to the destination storage directory configured in the Site Settings configurations dashboard.
              </p>
            </div>
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
              <h4 className="text-xs font-bold text-foreground">How do I change the seating setup?</h4>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Go to the <strong>Hall Seating Planner</strong> page. Click and drag shapes onto the grid. Seating limits automatically update on the right inspector.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. Feedback Popup */}
      <Dialog open={activePopup === "feedback"} onOpenChange={(open) => {
        !open && setActivePopup(null);
        if (!open) {
          setFeedbackSubmitted(false);
          setFeedbackText("");
        }
      }}>
        <DialogContent className="max-w-md bg-background text-foreground border-border/80 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Provide Platform Feedback
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Help us improve the operations dashboard console.
            </DialogDescription>
          </DialogHeader>
          {feedbackSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Thank you for your feedback!</h4>
              <p className="text-xs text-muted-foreground">Your response was successfully saved.</p>
              <Button size="sm" onClick={() => setActivePopup(null)} className="text-xs mt-2 cursor-pointer">
                Close Modal
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4 text-left">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Rate your experience</span>
                <div className="flex gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 transition-all duration-150 ${
                          rating >= star ? "text-yellow-500 fill-yellow-500 scale-105" : "text-zinc-500 hover:text-yellow-500/80"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Comments & Suggestions</label>
                <textarea
                  placeholder="Share details of your experience..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full text-xs h-24 p-3 rounded-lg border border-border bg-muted/20 outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setFeedbackSubmitted(true)}
                  disabled={!feedbackText.trim()}
                  className="text-xs px-5 font-bold cursor-pointer"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
}
