import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
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
    color: "#7c3aed",
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
    color: "#f59e0b",
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
    color: "#3b82f6",
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
    color: "#10b981",
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
    color: "#f472b6",
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
    color: "#f59e0b",
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
    color: "#6366f1",
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
    color: "#3b82f6",
  },
];

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD CONTENT
   ═══════════════════════════════════════════════════ */

export function DashboardContent() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();

  const displayName = currentUser?.fullName || "User";
  const userFirstName = displayName.split(" ")[0];
  const displayRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "Member";
  const userAvatar = currentUser?.avatar || "/profile.webp";
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
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  } as const;

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full min-h-full px-3 py-3 md:px-4 md:py-4 flex flex-col bg-background text-foreground"
    >
      {/* ──── AMBIENT BACKGROUND MESH ──── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] blur-[160px]" />
        <div className="absolute right-[10%] top-[15%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.03] dark:bg-cyan-500/[0.04] blur-[140px]" />
        <div className="absolute -bottom-32 right-[5%] h-[450px] w-[450px] rounded-full bg-amber-500/[0.03] dark:bg-amber-500/[0.03] blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full space-y-3">
        {/* ═══════════ ROW 1: HERO + PROFILE ═══════════ */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
          {/* ── HERO WELCOME CARD ── */}
          <motion.div variants={itemVariants} className="h-full lg:col-span-8">
            <div className="group relative h-full overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl">
              {/* Decorative gradient border shimmer */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

              {/* Mesh gradient bg */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-[80px]" />
                <div className="absolute bottom-0 left-[20%] h-40 w-40 rounded-full bg-cyan-500/[0.04] blur-[60px]" />
              </div>

              <div className="relative z-10 flex h-full min-h-[380px] flex-col justify-between p-5 sm:p-6 lg:min-h-full lg:p-7">
                <div className="space-y-5">
                  {/* Status badge */}
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                      Studio Online
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-2.5">
                    <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold leading-[1.08] tracking-[-0.035em] text-foreground">
                      Welcome back,{" "}
                      <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                        {userFirstName}
                      </span>
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                      Your wedding film production console — manage crews, gear,
                      schedules, and finances from one place.
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                      {todayLabel}
                    </p>
                  </div>

                  {/* Studio snapshot */}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 backdrop-blur-sm">
                      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/10 bg-emerald-500/[0.08]">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-base font-extrabold leading-tight text-foreground tabular-nums">
                        ${netBalance.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Net Balance
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 backdrop-blur-sm">
                      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-md border border-violet-500/10 bg-violet-500/[0.08]">
                        <Calendar className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <p className="text-base font-extrabold leading-tight text-foreground tabular-nums">
                        {todayEvents.length}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Today&apos;s Events
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 backdrop-blur-sm">
                      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-md border border-blue-500/10 bg-blue-500/[0.08]">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <p className="text-base font-extrabold leading-tight text-foreground tabular-nums">
                        {teamInField.length}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Crew In Field
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5 backdrop-blur-sm">
                      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-md border border-amber-500/10 bg-amber-500/[0.08]">
                        <Camera className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <p className="text-base font-extrabold leading-tight text-foreground tabular-nums">
                        {gearAvailabilityRate}%
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Gear Ready
                      </p>
                    </div>
                  </div>

                  {/* Focus + quick actions */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/50 bg-background/40 p-3.5 backdrop-blur-sm">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {todayEvents.length > 0 ? "Today's Focus" : "Up Next"}
                        </p>
                        {nextEvent && (
                          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                            {nextEvent.startTime}
                          </span>
                        )}
                      </div>
                      {nextEvent ? (
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {nextEvent.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {nextEvent.location || nextEvent.category}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No upcoming events — your schedule is clear.
                        </p>
                      )}
                      {gearMaintenanceCount > 0 && (
                        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {gearMaintenanceCount} gear item
                          {gearMaintenanceCount > 1 ? "s" : ""} need attention
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-border/50 bg-background/40 p-3.5 backdrop-blur-sm">
                      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLocation("/dashboard/schedule")}
                          className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground cursor-pointer"
                        >
                          <Calendar className="h-3 w-3 text-violet-500" />
                          Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocation("/dashboard/team")}
                          className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground cursor-pointer"
                        >
                          <Users className="h-3 w-3 text-blue-500" />
                          Team
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocation("/dashboard/gears")}
                          className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground cursor-pointer"
                        >
                          <Camera className="h-3 w-3 text-amber-500" />
                          Gear
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocation("/dashboard/wallet")}
                          className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground cursor-pointer"
                        >
                          <DollarSign className="h-3 w-3 text-emerald-500" />
                          Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom metrics strip */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3">
                  {/* User pill */}
                  <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm px-3.5 py-2.5">
                    <div className="relative">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md overflow-hidden border border-border/40 shadow-sm">
                        <img
                          src={userAvatar}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background border border-border/60">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {displayRole}
                      </p>
                    </div>
                  </div>

                  {/* Stat pills */}
                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm px-3.5 py-2.5">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {activeCrewCount}
                      </span>{" "}
                      crew active
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm px-3.5 py-2.5">
                    <Camera className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {gearInUseCount}
                      </span>{" "}
                      kits deployed
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm px-3.5 py-2.5">
                    <Calendar className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {scheduleEvents.length}
                      </span>{" "}
                      events
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── PROFILE CARD ── */}
          <motion.div variants={itemVariants} className="h-full lg:col-span-4">
            <div className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-border/50 bg-card lg:min-h-full">
              {/* ── Banner: emerald aurora + cinema-curtain pleats ── */}
              <div className="relative h-[38%] min-h-[110px] overflow-hidden">
                {/* Aurora base */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-600" />
                {/* Pleated curtain texture */}
                <div
                  className="absolute inset-0 opacity-60 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0px, transparent 6px, rgba(0,0,0,0.35) 12px, transparent 18px)",
                  }}
                />
                {/* Corner glow */}
                <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-lime-400/40 blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Pro badge — floating on banner */}
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 backdrop-blur-md">
                  <Zap className="h-3 w-3 fill-emerald-300 text-emerald-300" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-white">
                    Pro
                  </span>
                </div>
              </div>

              {/* ── Avatar: overlapping the banner seam ── */}
              <div className="relative z-10 -mt-9 px-5">
                <div className="relative inline-block">
                  <div className="rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 p-[3px] shadow-lg shadow-emerald-500/25">
                    <img
                      src={userAvatar}
                      alt={displayName}
                      className="h-[72px] w-[72px] rounded-full border-[3px] border-card object-cover"
                    />
                  </div>
                  {/* Role glyph, tucked on the avatar */}
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-card shadow-sm">
                    <Film className="h-3 w-3 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* ── Identity ── */}
              <div className="flex flex-1 flex-col justify-between px-5 pb-5 pt-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-foreground">
                      {displayName}
                      <BadgeCheck className="h-4 w-4 fill-emerald-500 text-card" />
                    </h3>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Online
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {displayRole}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {/* ── User info ── */}
                  <div className="space-y-2.5 rounded-lg border border-border/50 bg-muted/50 px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/60">
                        <Mail className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Email
                        </p>
                        <p className="truncate text-xs font-medium text-foreground">
                          {currentUser?.email || "—"}
                        </p>
                      </div>
                    </div>

                    {currentUser?.phone && (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/60">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Phone
                          </p>
                          <p className="truncate text-xs font-medium text-foreground">
                            {currentUser.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {memberSince && (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/60">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Member Since
                          </p>
                          <p className="text-xs font-medium text-foreground">
                            {memberSince}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Social links ── */}
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href="https://www.instagram.com/brana_films/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-border hover:text-foreground"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.youtube.com/@branafilmproduction9795"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="YouTube"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-border hover:text-foreground"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                    <a
                      href="https://vimeo.com/user227192980"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Vimeo"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-border hover:text-foreground"
                    >
                      <Video className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@bokersalah"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="TikTok"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-muted/50 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-border hover:text-foreground"
                    >
                      <Music2 className="h-4 w-4" />
                    </a>
                  </div>

                  {/* ── Other info ── */}
                  <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0 text-emerald-500" />
                      <span>Addis Ababa, Ethiopia · Brana Films Studio</span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                      Wedding film production · Cinematography · Post-production
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════ ROW 2: KPI METRIC CARDS ═══════════ */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {/* Total Revenue */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/wallet")}
              className="w-full text-left group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/[0.08] border border-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Revenue
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                ${totalIncome.toLocaleString()}
              </p>
            </button>
          </motion.div>

          {/* Total Expenses */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/wallet")}
              className="w-full text-left group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500/[0.08] border border-red-500/10">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Expenses
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                ${totalExpenses.toLocaleString()}
              </p>
            </button>
          </motion.div>

          {/* Active Crew */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/team")}
              className="w-full text-left group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/[0.08] border border-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Active Crew
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {activeCrewCount}
                <span className="text-sm font-semibold text-muted-foreground ml-1">
                  / {teamMembers.length}
                </span>
              </p>
            </button>
          </motion.div>

          {/* Gear Status */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setLocation("/dashboard/gears")}
              className="w-full text-left group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/[0.08] border border-amber-500/10">
                  <Camera className="h-4 w-4 text-amber-500" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Gear Ready
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {gearAvailabilityRate}%
                <span className="text-sm font-semibold text-muted-foreground ml-1">
                  ({gearAvailableCount}/{totalGearCount})
                </span>
              </p>
            </button>
          </motion.div>
        </div>

        {/* ═══════════ ROW 3: FINANCE CHART + SCHEDULE ═══════════ */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* ── FINANCE OVERVIEW ── */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-500/[0.02] to-transparent" />
              <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full bg-emerald-500/[0.04] blur-[70px]" />

              <div className="relative z-10 flex flex-col p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {isBalanceToggled ? "Net Balance" : "Total Revenue"}
                    </p>
                    <motion.p
                      key={displayedFinancial}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="mt-2 text-3xl sm:text-4xl font-extrabold leading-none tracking-[-0.03em] text-foreground"
                    >
                      ${" "}
                      {displayedFinancial.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </motion.p>
                  </div>

                  <div className="flex rounded-md bg-muted/40 p-1 border border-border/50">
                    <button
                      type="button"
                      onClick={() => setIsBalanceToggled(true)}
                      className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
                        isBalanceToggled
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Balance
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBalanceToggled(false)}
                      className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
                        !isBalanceToggled
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Revenue
                    </button>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="relative mt-4 h-[160px] sm:h-[180px]">
                  <svg
                    viewBox="0 0 400 180"
                    className="absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="chartFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgba(16, 185, 129, 0.18)"
                        />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                      </linearGradient>
                      <linearGradient
                        id="chartStroke"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite
                          in="SourceGraphic"
                          in2="blur"
                          operator="over"
                        />
                      </filter>
                    </defs>
                    <path
                      d="M0 150 C40 120 55 135 90 105 C125 75 140 70 175 74 C215 78 225 72 260 42 C300 5 340 40 400 12 L400 180 L0 180 Z"
                      fill="url(#chartFill)"
                    />
                    <motion.path
                      d="M0 150 C40 120 55 135 90 105 C125 75 140 70 175 74 C215 78 225 72 260 42 C300 5 340 40 400 12"
                      fill="none"
                      stroke="url(#chartStroke)"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      filter="url(#glow)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                    <motion.circle
                      cx="260"
                      cy="42"
                      r="4.5"
                      fill="#34d399"
                      stroke="var(--color-card, #111)"
                      strokeWidth="3"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 1.6,
                        type: "spring",
                        stiffness: 200,
                      }}
                    />
                  </svg>

                  {/* Income / Expense overlay strip */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-muted-foreground font-medium px-3 py-2 rounded-lg bg-background/50 border border-border/40 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>
                        Income:{" "}
                        <span className="font-bold text-foreground">
                          ${totalIncome.toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>
                        Expenses:{" "}
                        <span className="font-bold text-foreground">
                          ${totalExpenses.toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={() => setLocation("/dashboard/wallet")}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-[11px] font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground hover:border-border active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Record
                  </button>
                  <button
                    onClick={() => setLocation("/dashboard/wallet")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-[11px] font-semibold text-white shadow-md shadow-emerald-500/15 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Open Ledger
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── SCHEDULE OVERVIEW ── */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

              <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {todayEvents.length > 0 ? "Today's Plan" : "Upcoming"}
                    </p>
                    <h3 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">
                      Schedule
                    </h3>
                  </div>
                  <button
                    onClick={() => setLocation("/dashboard/schedule")}
                    className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer"
                  >
                    <Calendar className="h-3 w-3 text-violet-500" />
                    Calendar
                  </button>
                </div>

                {/* Events list */}
                <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1">
                  {displayedPlanEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <Calendar className="w-9 h-9 text-muted-foreground/20 mb-2" />
                      <p className="text-xs font-semibold text-muted-foreground">
                        No events scheduled
                      </p>
                      <button
                        onClick={() => setLocation("/dashboard/schedule")}
                        className="text-[11px] text-emerald-500 hover:text-emerald-400 mt-1.5 font-bold cursor-pointer"
                      >
                        + Create event
                      </button>
                    </div>
                  ) : (
                    displayedPlanEvents.map((item: any, i: number) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 * i,
                          duration: 0.35,
                          ease: "easeOut",
                        }}
                        className="group/ev flex items-start gap-3.5 p-3 rounded-lg border border-border/30 bg-background/30 hover:bg-muted/30 hover:border-border/50 transition-all duration-200 text-left cursor-pointer w-full"
                        onClick={() => setLocation("/dashboard/schedule")}
                      >
                        {/* Color dot + line */}
                        <div className="flex flex-col items-center pt-1 shrink-0">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
                            style={{
                              background: `${item.color || "#22c55e"}10`,
                              borderColor: `${item.color || "#22c55e"}25`,
                              color: item.color || "#22c55e",
                            }}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate group-hover/ev:text-emerald-500 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                            <span
                              className="w-1 h-1 rounded-full inline-block shrink-0"
                              style={{ background: item.color || "#22c55e" }}
                            />
                            {item.category}
                            {item.location ? ` · ${item.location}` : ""}
                          </p>
                        </div>

                        {/* Time */}
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground tabular-nums mt-0.5">
                          {item.startTime}
                        </span>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
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
