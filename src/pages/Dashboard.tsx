import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Mail,
  Phone,
  Youtube,
  Instagram,
  Video,
  Music2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Film,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
  Activity,
  Wrench,
  DollarSign,
  TrendingDown,
  Layers,
  Shield,
  MapPin,
  AlertTriangle,
  Zap,
  Eye,
  BarChart3,
  Search,
  ChevronDown,
  FolderOpen
} from "lucide-react";
import { useGear } from "@/contexts/GearContext";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useIncome,
  useExpenses,
  usePayroll,
  useSubscriptions,
} from "@/hooks/useFinance";
import { useCrudStore } from "@/hooks/use-crud-store";
import CloudinaryImage from "@/components/ui/CloudinaryImage";
import { AuthSlides } from "@/data/cloudinary-images";

// ── Schedule Event Default Data for Fallback/Sync ──────────────────
const DEFAULT_EVENTS = [
  {
    id: "ev1",
    title: "Liya & Bereket Wedding Shoot",
    date: "2026-07-01",
    startTime: "09:00",
    endTime: "17:00",
    category: "Shoot",
    location: "Grand Palace Hall",
    description: "Full-day wedding ceremony & reception shoot.",
    color: "#000000",
  },
  {
    id: "ev2",
    title: "Client Review — Dawit",
    date: "2026-07-01",
    startTime: "14:00",
    endTime: "15:30",
    category: "Meeting",
    location: "Office — Room 3",
    description: "Review rough-cut edit with client for feedback.",
    color: "#333333",
  },
  {
    id: "ev3",
    title: "Color Grading Session",
    date: "2026-07-02",
    startTime: "10:00",
    endTime: "13:00",
    category: "Editing",
    location: "Edit Suite A",
    description: "DaVinci Resolve color grading for Haile project.",
    color: "#666666",
  },
  {
    id: "ev4",
    title: "Final Delivery — Sunrise Ceremony",
    date: "2026-07-04",
    startTime: "11:00",
    endTime: "12:00",
    category: "Delivery",
    location: "Online — Google Drive",
    description: "Upload final 4K files and share delivery link.",
    color: "#999999",
  },
  {
    id: "ev5",
    title: "Rehearsal — Garden Setup",
    date: "2026-07-06",
    startTime: "07:00",
    endTime: "09:00",
    category: "Rehearsal",
    location: "Botanical Garden",
    description: "Equipment setup walkthrough for weekend shoot.",
    color: "#444444",
  },
  {
    id: "ev6",
    title: "Team Sync-up",
    date: "2026-07-03",
    startTime: "09:30",
    endTime: "10:00",
    category: "Meeting",
    location: "Office",
    description: "Weekly standup with production crew.",
    color: "#333333",
  },
  {
    id: "ev7",
    title: "Gym & Stretching",
    date: "2026-07-05",
    startTime: "06:00",
    endTime: "07:30",
    category: "Personal",
    location: "Fitness Center",
    description: "Morning workout routine.",
    color: "#777777",
  },
  {
    id: "ev8",
    title: "Drone Footage Edit",
    date: "2026-07-07",
    startTime: "14:00",
    endTime: "18:00",
    category: "Editing",
    location: "Edit Suite B",
    description: "Aerial footage post-production for rooftop project.",
    color: "#666666",
  },
];

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD CONTENT
   ═══════════════════════════════════════════════════ */

export function DashboardContent() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const displayName = currentUser?.fullName || "User";
  const userFirstName = displayName.split(" ")[0];
  const displayRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "Member";
  const userAvatar = currentUser?.avatar || AuthSlides.avatar;
  const memberSince = useMemo(() => {
    if (!currentUser?.createdAt) return null;
    return new Date(currentUser.createdAt).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }, [currentUser?.createdAt]);

  // Load real synced context data
  const { gearItems } = useGear();
  const { teamMembers } = useTeam();
  const { items: scheduleEvents } = useCrudStore<any>(
    "scheduleEvents",
    DEFAULT_EVENTS,
  );

  // Load real synced wallet/finances hooks
  const incomeHook = useIncome();
  const expensesHook = useExpenses();
  const payrollHook = usePayroll();
  const subscriptionsHook = useSubscriptions();

  const [isBalanceToggled, setIsBalanceToggled] = useState(true); // true = Net Balance, false = Revenue

  // Calculations for Wallet/Finances Overview
  const totalIncome = useMemo(() => {
    return incomeHook.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
  }, [incomeHook.items]);

  const totalExpenses = useMemo(() => {
    const expensesTotal = expensesHook.items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const payrollTotal = payrollHook.items.reduce(
      (sum, item) => sum + (Number(item.totalPay) || 0),
      0,
    );
    const subscriptionsTotal = subscriptionsHook.items.reduce(
      (sum, item) => sum + (Number(item.monthlyAmount) || 0),
      0,
    );
    return expensesTotal + payrollTotal + subscriptionsTotal;
  }, [expensesHook.items, payrollHook.items, subscriptionsHook.items]);

  const netBalance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );
  const displayedFinancial = isBalanceToggled ? netBalance : totalIncome;

  // Calculations for Team Overview
  const activeCrewCount = useMemo(
    () => teamMembers.filter((m) => m.status !== "Off Duty").length,
    [teamMembers],
  );

  const teamInField = useMemo(
    () =>
      teamMembers.filter(
        (m) => m.status === "In Field" || m.status === "Editing",
      ),
    [teamMembers],
  );

  // Calculations for Gear Overview
  const totalGearCount = useMemo(() => gearItems.length, [gearItems]);

  const gearInUseCount = useMemo(
    () => gearItems.filter((g) => g.status === "checked-out").length,
    [gearItems],
  );

  const gearAvailableCount = useMemo(
    () => gearItems.filter((g) => g.status === "available").length,
    [gearItems],
  );

  const gearMaintenanceCount = useMemo(
    () =>
      gearItems.filter(
        (g) => g.status === "maintenance" || g.status === "damaged",
      ).length,
    [gearItems],
  );

  const gearAvailabilityRate = useMemo(() => {
    if (!totalGearCount) return 100;
    return Math.round((gearAvailableCount / totalGearCount) * 100);
  }, [gearAvailableCount, totalGearCount]);

  // Calculations for Schedule Overview (Today's / Upcoming Plan)
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, []);

  const todayEvents = useMemo(() => {
    return scheduleEvents
      .filter((ev: any) => ev.date === todayStr)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  }, [scheduleEvents, todayStr]);

  const upcomingEvents = useMemo(() => {
    return scheduleEvents
      .filter((ev: any) => ev.date > todayStr)
      .sort((a: any, b: any) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 4);
  }, [scheduleEvents, todayStr]);

  const displayedPlanEvents = useMemo(() => {
    if (todayEvents.length > 0) return todayEvents.slice(0, 4);
    return upcomingEvents;
  }, [todayEvents, upcomingEvents]);

  const nextEvent = displayedPlanEvents[0] ?? null;

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen bg-background text-foreground font-sans p-6 md:p-10 dark:bg-[#09090b] dark:text-zinc-100"
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-8">
        
        {/* ═══════════ HEADER ═══════════ */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground font-medium dark:text-zinc-500">Dashboard</span>
            <span className="mx-2 text-muted-foreground/70 dark:text-zinc-700">/</span>
            <span className="text-foreground font-medium dark:text-zinc-200">Your Studio Analysis</span>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search your today's report" 
                className="w-full bg-muted border border-border rounded-full pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-muted-foreground/50 transition-colors placeholder:text-muted-foreground/50 dark:bg-[#141416] dark:border-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-600 dark:placeholder:text-zinc-600"
              />
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="flex -space-x-2">
                <CloudinaryImage src={userAvatar} alt="User" className="w-8 h-8 rounded-full border-2 border-background object-cover dark:border-[#09090b]" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-gray-500 flex items-center justify-center text-[10px] font-bold dark:border-[#09090b]">
                  PRO
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground font-medium hover:bg-muted/70 transition-colors dark:bg-[#141416] dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
                Export <ChevronDown className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setLocation("/dashboard/schedule")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.2)] cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Event
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ ROW 1: KPI CARDS ═══════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/wallet")}
              className="w-full text-left group relative bg-card border border-border rounded-2xl p-5 hover:border-muted-foreground/30 transition-all duration-300 cursor-pointer dark:bg-[#121214] dark:border-[#27272a] dark:hover:border-zinc-600"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-xs font-medium dark:text-zinc-400">Total Revenue</span>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border/50 group-hover:bg-muted/80 transition-colors dark:bg-[#1a1a1c] dark:border-zinc-800/50 dark:group-hover:bg-zinc-800">
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-zinc-200" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-gray-600 tracking-tight mb-2 dark:text-gray-400">
                $ {totalIncome >= 1000 ? (totalIncome / 1000).toFixed(2) + 'k' : totalIncome}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 dark:bg-zinc-600"></span>
                Payout
              </div>
              <div className="mt-3 text-[11px] text-gray-600 font-medium flex items-center gap-1 dark:text-gray-500">
                <TrendingUp className="w-3 h-3" />
                Available in active balance
              </div>
            </button>
          </motion.div>

          {/* Expenses */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/wallet")}
              className="w-full text-left group relative bg-card border border-border rounded-2xl p-5 hover:border-muted-foreground/30 transition-all duration-300 cursor-pointer dark:bg-[#121214] dark:border-[#27272a] dark:hover:border-zinc-600"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-xs font-medium dark:text-zinc-400">Total Expenses</span>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border/50 group-hover:bg-muted/80 transition-colors dark:bg-[#1a1a1c] dark:border-zinc-800/50 dark:group-hover:bg-zinc-800">
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-zinc-200" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-gray-600 tracking-tight mb-2 dark:text-gray-400">
                $ {totalExpenses >= 1000 ? (totalExpenses / 1000).toFixed(2) + 'k' : totalExpenses}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 dark:bg-zinc-600"></span>
                Outgoing
              </div>
              <div className="mt-3 text-[11px] text-gray-700 font-medium flex items-center gap-1 dark:text-gray-600">
                <TrendingDown className="w-3 h-3" />
                From operational costs
              </div>
            </button>
          </motion.div>

          {/* Active Crew */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/team")}
              className="w-full text-left group relative bg-card border border-border rounded-2xl p-5 hover:border-muted-foreground/30 transition-all duration-300 cursor-pointer dark:bg-[#121214] dark:border-[#27272a] dark:hover:border-zinc-600"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-xs font-medium dark:text-zinc-400">Active Crew</span>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border/50 group-hover:bg-muted/80 transition-colors dark:bg-[#1a1a1c] dark:border-zinc-800/50 dark:group-hover:bg-zinc-800">
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-zinc-200" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-foreground tracking-tight mb-2 dark:text-zinc-100">
                {activeCrewCount}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 dark:bg-zinc-600"></span>
                Team Members
              </div>
              <div className="mt-3 text-[11px] text-gray-600 font-medium flex items-center gap-1 dark:text-gray-500">
                <Users className="w-3 h-3" />
                {teamMembers.length} total staff registered
              </div>
            </button>
          </motion.div>

          {/* Gear Ready */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/gears")}
              className="w-full text-left group relative bg-card border border-border rounded-2xl p-5 hover:border-muted-foreground/30 transition-all duration-300 cursor-pointer dark:bg-[#121214] dark:border-[#27272a] dark:hover:border-zinc-600"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-muted-foreground text-xs font-medium dark:text-zinc-400">Gear Status</span>
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border/50 group-hover:bg-muted/80 transition-colors dark:bg-[#1a1a1c] dark:border-zinc-800/50 dark:group-hover:bg-zinc-800">
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-zinc-200" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-foreground tracking-tight mb-2 dark:text-zinc-100">
                {gearAvailabilityRate}%
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 dark:bg-zinc-600"></span>
                Availability
              </div>
              <div className="mt-3 text-[11px] text-gray-600 font-medium flex items-center gap-1 dark:text-gray-500">
                <Camera className="w-3 h-3" />
                {gearAvailableCount} of {totalGearCount} items ready
              </div>
            </button>
          </motion.div>
        </div>

        {/* ═══════════ ROW 2: MAIN ANALYTICS & PROFILE ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ── FINANCE / SALES FUNNEL CHART (Span 8) ── */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="bg-card border border-border rounded-[24px] p-6 h-full flex flex-col relative overflow-hidden dark:bg-[#121214] dark:border-[#27272a]">
              <div className="flex justify-between items-start z-10 mb-8">
                <div>
                  <h3 className="text-foreground font-semibold text-lg flex items-center gap-2 dark:text-zinc-100">
                    Financial Overview <span className="w-2 h-2 rounded-full bg-gray-500 shadow-[0_0_8px_#666666]"></span>
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1 dark:text-zinc-500">Comparison to previous periods</p>
                </div>
                <div className="flex items-center bg-muted border border-border rounded-lg p-1 dark:bg-[#1a1a1c] dark:border-zinc-800">
                  <button
                    onClick={() => setIsBalanceToggled(true)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      isBalanceToggled ? "bg-muted text-gray-600 dark:bg-[#252528] dark:text-gray-400" : "text-muted-foreground hover:text-foreground dark:text-zinc-500 dark:hover:text-zinc-300"
                    }`}
                  >
                    Net Balance
                  </button>
                  <button
                    onClick={() => setIsBalanceToggled(false)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      !isBalanceToggled ? "bg-muted text-gray-600 dark:bg-[#252528] dark:text-gray-400" : "text-muted-foreground hover:text-foreground dark:text-zinc-500 dark:hover:text-zinc-300"
                    }`}
                  >
                    Revenue
                  </button>
                </div>
              </div>

              {/* Glowing Crosshair Chart Design */}
              <div className="flex-1 relative w-full min-h-[300px] rounded-xl border border-border/40 bg-muted/30 overflow-hidden flex items-center justify-center dark:border-zinc-800/40 dark:bg-[#0c0c0e]">
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Glow Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gradient-to-b from-transparent via-gray-500/50 to-transparent shadow-[0_0_15px_#666666]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-full bg-gradient-to-r from-transparent via-gray-500/50 to-transparent shadow-[0_0_15px_#666666]"></div>
                
                {/* Center Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 shadow-[0_0_20px_4px_#666666]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-500/20 rounded-full blur-[60px] pointer-events-none"></div>

                {/* Data Popup */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-1/2 left-1/2 translate-x-4 translate-y-4 bg-muted/80 backdrop-blur-md border border-gray-500/20 rounded-xl p-3 shadow-xl dark:bg-[#1a1a1c]/80"
                >
                  <p className="text-muted-foreground text-xs mb-1 dark:text-zinc-400">Current Total</p>
                  <p className="text-gray-600 font-semibold text-sm dark:text-gray-400">
                    $ {displayedFinancial.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-[10px] mt-1 dark:text-zinc-500">+ Active Cycle</p>
                </motion.div>
                
                {/* Axis Labels */}
                <div className="absolute bottom-4 left-0 w-full flex justify-between px-8 text-[10px] text-muted-foreground font-medium dark:text-zinc-600">
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3</span>
                  <span>Q4</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── PROFILE & BALANCE (Span 4) ── */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Top Widget: Net Balance Statement */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-foreground dark:text-zinc-100">Your Balance</h3>
                <button className="flex items-center gap-1 bg-muted border border-border rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground dark:bg-[#1a1a1c] dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
                  Today <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <p className="text-muted-foreground text-xs mb-3 dark:text-zinc-500">The sum of all operations</p>
              <div className="text-4xl font-bold text-gray-600 tracking-tight flex items-baseline gap-2 dark:text-gray-400">
                $ {netBalance >= 1000 ? (netBalance / 1000).toFixed(2) + 'k' : netBalance} <span className="text-sm font-medium text-muted-foreground dark:text-zinc-500">USD</span>
              </div>
            </div>

            {/* Bottom Widget: Smooth Area Chart representation */}
            <div className="bg-card border border-border rounded-[24px] p-5 flex-1 relative overflow-hidden flex flex-col dark:bg-[#121214] dark:border-[#27272a]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-4 bg-foreground rounded-full dark:bg-zinc-200"></div>
                <h4 className="text-foreground text-sm font-medium dark:text-zinc-200">Details Observation</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 dark:text-zinc-500">Events</p>
                  <p className="text-xl font-semibold text-foreground dark:text-zinc-100">{scheduleEvents.length}</p>
                  <p className="text-[10px] text-gray-700/80 mt-1 flex items-center bg-gray-700/10 w-fit px-1.5 py-0.5 rounded dark:text-gray-600/80">
                    <TrendingDown className="w-2.5 h-2.5 mr-1" /> MTD
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 dark:text-zinc-500">Income</p>
                  <p className="text-xl font-semibold text-foreground dark:text-zinc-100">{totalIncome >= 1000 ? (totalIncome / 1000).toFixed(0) + 'k' : totalIncome}</p>
                  <p className="text-[10px] text-gray-600 mt-1 flex items-center bg-gray-500/10 w-fit px-1.5 py-0.5 rounded dark:text-gray-500">
                    <TrendingUp className="w-2.5 h-2.5 mr-1" /> MTD
                  </p>
                </div>
              </div>

              {/* Mini Area Chart Design */}
              <div className="mt-auto h-24 relative w-full">
                <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible preserve-3d">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,60 L0,45 C20,40 30,55 50,30 C70,5 80,45 100,25 C120,5 130,50 150,15 C170,-20 185,25 200,10 L200,60 Z" 
                    fill="url(#areaGradient)" 
                  />
                  <path 
                    d="M0,45 C20,40 30,55 50,30 C70,5 80,45 100,25 C120,5 130,50 150,15 C170,-20 185,25 200,10" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  {/* Tooltip point */}
                  <circle cx="150" cy="15" r="3" fill="currentColor" stroke="#10b981" strokeWidth="2" className="text-background dark:text-[#09090b]" />
                  <g transform="translate(130, -10)">
                     <rect width="40" height="18" rx="4" fill="white" className="dark:fill-[#1a1a1c]" />
                     <text x="20" y="12" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle" className="dark:fill-zinc-200">+{gearInUseCount}</text>
                  </g>
                </svg>
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-[8px] text-muted-foreground font-medium dark:text-zinc-600">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════ ROW 3: SCHEDULE / RECENT PROJECTS TABLE ═══════════ */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="bg-card border border-border rounded-[24px] p-6 dark:bg-[#121214] dark:border-[#27272a]">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-foreground font-semibold text-lg dark:text-zinc-200">
                {todayEvents.length > 0 ? "Today's Schedule" : "Upcoming Events"}
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground dark:text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-muted border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-muted-foreground/50 dark:bg-[#1a1a1c] dark:border-zinc-800 dark:text-zinc-300 dark:focus:border-zinc-600"
                  />
                </div>
                <button className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/70 dark:bg-[#1a1a1c] dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
                  Filters <ChevronDown className="w-3.5 h-3.5 text-muted-foreground dark:text-zinc-500" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="pb-3 pt-2 text-muted-foreground font-normal text-xs border-b border-border/60 w-1/3 dark:text-zinc-500 dark:border-zinc-800/60">Project</th>
                    <th className="pb-3 pt-2 text-muted-foreground font-normal text-xs border-b border-border/60 w-1/4 dark:text-zinc-500 dark:border-zinc-800/60">Assignee</th>
                    <th className="pb-3 pt-2 text-muted-foreground font-normal text-xs border-b border-border/60 w-1/4 dark:text-zinc-500 dark:border-zinc-800/60">Due date</th>
                    <th className="pb-3 pt-2 text-muted-foreground font-normal text-xs border-b border-border/60 w-1/12 dark:text-zinc-500 dark:border-zinc-800/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPlanEvents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm dark:text-zinc-600">
                        No scheduled events found.
                      </td>
                    </tr>
                  ) : (
                    displayedPlanEvents.map((item: any, idx: number) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        key={item.id} 
                        className="group hover:bg-muted/40 transition-colors cursor-pointer dark:hover:bg-[#1a1a1c]/40"
                        onClick={() => setLocation("/dashboard/schedule")}
                      >
                        <td className="py-4 border-b border-border/40 dark:border-zinc-800/40">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors dark:text-zinc-500 dark:group-hover:text-emerald-500" />
                            <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors truncate max-w-[200px] sm:max-w-[250px] dark:text-zinc-300 dark:group-hover:text-zinc-100">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 border-b border-border/40 dark:border-zinc-800/40">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border border-border text-muted-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                              {item.category.charAt(0)}
                            </div>
                            <span className="text-sm text-muted-foreground dark:text-zinc-400">{item.category}</span>
                          </div>
                        </td>
                        <td className="py-4 border-b border-border/40 dark:border-zinc-800/40">
                          <span className="text-sm text-muted-foreground tabular-nums dark:text-zinc-400">
                            {item.date} • {item.startTime}
                          </span>
                        </td>
                        <td className="py-4 border-b border-border/40 dark:border-zinc-800/40">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || "#10b981" }}></div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => setLocation("/dashboard/schedule")}
                className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                View all projects
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   DEFAULT EXPORT
   ═══════════════════════════════════════════════════ */

export default function Dashboard() {
  return <DashboardContent />;
}