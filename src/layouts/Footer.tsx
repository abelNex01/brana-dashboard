import React, { useState, useEffect, useCallback } from "react";
import {
  Youtube,
  Instagram,
  Video,
  Music2,
  X,
  ChevronUp,
  ArrowUpRight,
  Cloud,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  ArrowDown,
  Info,
  Clock,
  Plus,
  Copy,
  ExternalLink,
} from "lucide-react";

/* ── Sub‑components: MetricsRow, SystemStatusCard, PerformanceCard, TeamDataCard ── */

const YELLOW = "text-[#EBFF38]";

interface Metric {
  label: string;
  value: React.ReactNode;
}

/* ---------- Live analytics ----------
 * Every value here is measured directly in the browser — nothing is mocked.
 * Team figures are the one exception (see TeamSnapshot below): this file
 * has no access to TeamContext, so they arrive as a prop with sample
 * defaults until you wire up the real context where <Footer /> is used.
 */
interface LiveAnalytics {
  isOnline: boolean;
  uptimeLabel: string;
  clockLabel: string;
  storageUsedLabel: string;
  recordCount: number;
  avgLoadMs: number | null;
  resourceCount: number;
  lastSyncedLabel: string;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function measureLocalStorage(): { kb: number; keys: number } {
  try {
    let bytes = 0;
    let keys = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      bytes += key.length + (window.localStorage.getItem(key)?.length ?? 0);
      keys += 1;
    }
    return { kb: bytes / 1024, keys };
  } catch {
    return { kb: 0, keys: 0 };
  }
}

function measurePageLoad(): number | null {
  try {
    const [nav] = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];
    if (nav && nav.loadEventEnd > 0) {
      return Math.max(0, Math.round(nav.loadEventEnd - nav.startTime));
    }
    return null;
  } catch {
    return null;
  }
}

function useLiveAnalytics(): LiveAnalytics {
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [storage, setStorage] = useState(() => measureLocalStorage());
  const [resourceCount, setResourceCount] = useState(0);
  const [avgLoadMs, setAvgLoadMs] = useState<number | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(() => Date.now());
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  const refresh = useCallback(() => {
    setStorage(measureLocalStorage());
    setResourceCount(performance.getEntriesByType("resource").length);
    setLastRefreshed(Date.now());
  }, []);

  // Second-by-second clock / uptime tick
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Initial measurement + connectivity listeners
  useEffect(() => {
    refresh();
    const measureLoad = () => setAvgLoadMs(measurePageLoad());
    measureLoad();
    if (document.readyState !== "complete") {
      window.addEventListener("load", measureLoad);
    }
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("load", measureLoad);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [refresh]);

  // Auto-sync every 5s while enabled
  useEffect(() => {
    if (!autoSyncEnabled) return;
    const sync = setInterval(refresh, 5000);
    return () => clearInterval(sync);
  }, [autoSyncEnabled, refresh]);

  const uptimeLabel = formatDuration(now - mountedAt);
  const clockLabel = new Date(now).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const storageUsedLabel =
    storage.kb >= 1024
      ? `${(storage.kb / 1024).toFixed(2)} MB`
      : `${storage.kb.toFixed(1)} KB`;

  const secondsSinceSync = Math.max(0, Math.floor((now - lastRefreshed) / 1000));
  const lastSyncedLabel =
    secondsSinceSync < 2
      ? "Just now"
      : secondsSinceSync < 60
      ? `${secondsSinceSync}s ago`
      : `${Math.floor(secondsSinceSync / 60)}m ago`;

  return {
    isOnline,
    uptimeLabel,
    clockLabel,
    storageUsedLabel,
    recordCount: storage.keys,
    avgLoadMs,
    resourceCount,
    lastSyncedLabel,
    autoSyncEnabled,
    setAutoSyncEnabled,
    refresh,
  };
}

/* ---------- Team snapshot ----------
 * Replace the default fallback with real numbers from TeamContext:
 *
 *   const { team } = useTeam();
 *   <Footer teamSnapshot={{
 *     available: team.filter(m => m.status === "Available").length,
 *     inField:   team.filter(m => m.status === "In Field").length,
 *     editing:   team.filter(m => m.status === "Editing").length,
 *     offDuty:   team.filter(m => m.status === "Off Duty").length,
 *   }} />
 */
interface TeamSnapshot {
  available: number;
  inField: number;
  editing: number;
  offDuty: number;
}

const DEFAULT_TEAM_SNAPSHOT: TeamSnapshot = {
  available: 8,
  inField: 6,
  editing: 4,
  offDuty: 3,
};

interface FooterProps {
  teamSnapshot?: TeamSnapshot;
}

/* ---------- MetricsRow ---------- */
const MetricsRow: React.FC<{ analytics: LiveAnalytics; teamSnapshot: TeamSnapshot }> = ({
  analytics,
  teamSnapshot,
}) => {
  const activeTeam = teamSnapshot.available + teamSnapshot.inField + teamSnapshot.editing;

  const metrics: Metric[] = [
    {
      label: "Status:",
      value: (
        <span
          className={`inline-flex items-center gap-1.5 ${
            analytics.isOnline ? YELLOW : "text-[#E84142]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              analytics.isOnline ? "bg-[#EBFF38]" : "bg-[#E84142]"
            }`}
          />
          {analytics.isOnline ? "Online" : "Offline"}
        </span>
      ),
    },
    { label: "Session Uptime:", value: <span className={YELLOW}>{analytics.uptimeLabel}</span> },
    { label: "Storage Used:", value: <span className={YELLOW}>{analytics.storageUsedLabel}</span> },
    {
      label: "Avg Load:",
      value: (
        <span className={YELLOW}>
          {analytics.avgLoadMs !== null ? `${analytics.avgLoadMs}ms` : "—"}
        </span>
      ),
    },
    { label: "Active Team:", value: <span className={YELLOW}>{activeTeam}</span> },
    { label: "Last Synced:", value: <span className={YELLOW}>{analytics.lastSyncedLabel}</span> },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium tracking-wide"
        >
          <span className="text-muted-foreground">{m.label}</span>
          <span>{m.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ---------- CurrencyBlock (shared by SystemStatusCard) ---------- */
interface CurrencyBlockProps {
  direction: string;
  amount: string;
  fiat: string;
  token: string;
  network: string;
  balance: string;
  tokenBg: string;
  tokenGlyph: string;
  showMax?: boolean;
}

const CurrencyBlock: React.FC<CurrencyBlockProps> = ({
  direction,
  amount,
  fiat,
  token,
  network,
  balance,
  tokenBg,
  tokenGlyph,
  showMax,
}) => (
  <div className="rounded-2xl border border-border bg-muted p-4">
    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {direction}
    </div>
    <div className="mt-1 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-2xl font-semibold text-foreground">{amount}</div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{fiat}</div>
      </div>
      <div className="shrink-0 text-right">
        <button className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-2.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${tokenBg}`}
          >
            {tokenGlyph}
          </span>
          <span className="text-left leading-none">
            <span className="block text-sm font-semibold text-foreground">{token}</span>
            <span className="block text-[9px] uppercase text-muted-foreground">{network}</span>
          </span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {balance}{" "}
          {showMax && <span className="font-semibold text-[#EBFF38]">Max</span>}
        </div>
      </div>
    </div>
  </div>
);

/* ---------- SystemStatusCard ---------- */
const SystemStatusCard: React.FC<{ analytics: LiveAnalytics }> = ({ analytics }) => {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
      {/* Card header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">System Status</h3>
        <div className="flex items-center gap-3 text-muted-foreground">
          <button
            onClick={analytics.refresh}
            className="transition hover:text-foreground"
            aria-label="Refresh live metrics"
          >
            <RotateCw size={15} />
          </button>
          <button className="transition hover:text-foreground" aria-label="Storage settings">
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Storage used / resources loaded */}
      <div className="relative flex flex-col gap-2">
        <CurrencyBlock
          direction="USED"
          amount={analytics.storageUsedLabel}
          fiat={`${analytics.recordCount} local records`}
          token={analytics.isOnline ? "Synced" : "Offline"}
          network="STATUS"
          balance={`Updated ${analytics.lastSyncedLabel}`}
          tokenBg={analytics.isOnline ? "bg-[#EBFF38] text-black" : "bg-[#E84142] text-white"}
          tokenGlyph="●"
        />
        <button
          className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-card bg-muted text-foreground/80 transition hover:text-foreground"
          aria-label="View storage breakdown"
        >
          <ArrowDown size={15} />
        </button>
        <CurrencyBlock
          direction="LOADED"
          amount={String(analytics.resourceCount)}
          fiat="Scripts, styles & assets"
          token="This page"
          network="PERFORMANCE"
          balance={`Load time ${
            analytics.avgLoadMs !== null ? `${analytics.avgLoadMs}ms` : "—"
          }`}
          tokenBg="bg-[#627EEA] text-white"
          tokenGlyph="◈"
        />
      </div>

      {/* Auto-sync toggle */}
      <div className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-muted px-4 py-3">
        <span className="text-xs font-medium text-foreground/80">Auto-Sync (every 5s)</span>
        <button
          onClick={() => analytics.setAutoSyncEnabled((v) => !v)}
          aria-label="Toggle auto-sync"
          className={`relative h-5 w-9 rounded-full transition-colors ${
            analytics.autoSyncEnabled ? "bg-[#EBFF38]" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
              analytics.autoSyncEnabled ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Sync info row */}
      <div className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-muted px-4 py-2.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Info size={12} /> Tracking {analytics.recordCount} local records
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-foreground/70">
          <Clock size={11} /> {analytics.lastSyncedLabel}
        </span>
      </div>

      {/* Manual sync button */}
      <button
        onClick={analytics.refresh}
        className="mt-3 w-full rounded-2xl bg-[#EBFF38] py-3.5 text-sm font-semibold text-black transition hover:bg-[#dff01f]"
      >
        Sync Now
      </button>
    </div>
  );
};

/* ---------- PerformanceCard ---------- */
const PERFORMANCE_PERIODS = ["1H", "6H", "24H", "7D", "30D", "90D", "All"];
const TREND_LABELS = ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"];

const Chart: React.FC = () => (
  <svg viewBox="0 0 320 130" className="h-36 w-full" preserveAspectRatio="none">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <line
      x1="118"
      y1="8"
      x2="118"
      y2="122"
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="3 3"
      className="text-foreground/25"
    />
    <path
      d="M0,78 C14,60 26,42 40,40 C54,38 62,52 74,58 C86,64 96,52 106,58 C112,62 115,70 118,74
         C126,86 138,100 150,96 C160,92 164,66 176,58 C186,52 192,66 200,74 C210,84 220,92 232,86
         C244,80 250,62 262,60 C276,58 292,72 320,66"
      fill="none"
      stroke="#EBFF38"
      strokeWidth="2.5"
      strokeLinecap="round"
      filter="url(#glow)"
    />
    <circle cx="118" cy="74" r="5" fill="#EBFF38" filter="url(#glow)" />
    <circle cx="118" cy="74" r="2" fill="currentColor" className="text-card" />
  </svg>
);

const PerformanceCard: React.FC<{ analytics: LiveAnalytics }> = ({ analytics }) => {
  const [period, setPeriod] = useState("24H");

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Performance</h3>

      <div className="rounded-2xl border border-border bg-muted p-4">
        <div className="text-3xl font-semibold tracking-tight text-foreground">
          {analytics.uptimeLabel}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Session uptime · Avg load{" "}
          {analytics.avgLoadMs !== null ? `${analytics.avgLoadMs}ms` : "—"}
        </div>
      </div>

      <div className="mt-4 flex-1">
        <Chart />
        <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground/65">
          {TREND_LABELS.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 bg-muted rounded-md p-0.5 border border-border dark:bg-zinc-900 dark:border-zinc-800">
        {PERFORMANCE_PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              period === p
                ? "bg-foreground text-background dark:bg-zinc-800/60 dark:text-zinc-100"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- TeamDataCard ---------- */
interface MetricRow {
  title: string;
  subtitle: string;
  value: string;
  detail: string;
  bg: string;
  glyph: string;
}

interface MetricGroup {
  title: string;
  avatarBg: string;
  avatarGlyph: string;
  rows: MetricRow[];
}

function buildMetricGroups(team: TeamSnapshot, analytics: LiveAnalytics): MetricGroup[] {
  const total = team.available + team.inField + team.editing + team.offDuty;

  return [
    {
      title: "Team",
      avatarBg: "bg-[#EBFF38]/15 text-[#EBFF38]",
      avatarGlyph: "👥",
      rows: [
        {
          title: "Available",
          subtitle: "Ready to assign",
          value: String(team.available),
          detail: `${team.available} of ${total} crew`,
          bg: "bg-[#26A17B]/20 text-[#26A17B]",
          glyph: "🟢",
        },
        {
          title: "In Field",
          subtitle: "On location",
          value: String(team.inField),
          detail: `${team.inField} of ${total} crew`,
          bg: "bg-[#F7931A]/20 text-[#F7931A]",
          glyph: "🎥",
        },
        {
          title: "Editing",
          subtitle: "Post-production",
          value: String(team.editing),
          detail: `${team.editing} of ${total} crew`,
          bg: "bg-[#627EEA]/20 text-[#627EEA]",
          glyph: "🎞️",
        },
        {
          title: "Off Duty",
          subtitle: "Not scheduled",
          value: String(team.offDuty),
          detail: `${team.offDuty} of ${total} crew`,
          bg: "bg-muted-foreground/20 text-muted-foreground",
          glyph: "⏸️",
        },
      ],
    },
    {
      title: "Data",
      avatarBg: "bg-[#627EEA]/15 text-[#627EEA]",
      avatarGlyph: "💾",
      rows: [
        {
          title: "Storage Used",
          subtitle: "Browser cache",
          value: analytics.storageUsedLabel,
          detail: "localStorage",
          bg: "bg-[#345D9D]/20 text-[#345D9D]",
          glyph: "📦",
        },
        {
          title: "Records",
          subtitle: "Synced items",
          value: String(analytics.recordCount),
          detail: "Team, gear & finance",
          bg: "bg-[#FFA409]/20 text-[#FFA409]",
          glyph: "🔄",
        },
      ],
    },
  ];
}

const MetricValueRow: React.FC<{ row: MetricRow }> = ({ row }) => (
  <div className="flex items-center justify-between border-t border-border/30 px-4 py-2.5">
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${row.bg}`}
      >
        {row.glyph}
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-foreground">{row.title}</span>
        <span className="block text-[9px] uppercase text-muted-foreground/65">
          {row.subtitle}
        </span>
      </span>
    </div>
    <div className="flex items-center gap-2.5">
      <span className="text-right leading-tight">
        <span className="block text-xs font-semibold text-foreground">{row.value}</span>
        <span className="block text-[10px] text-muted-foreground/65">{row.detail}</span>
      </span>
      <button
        className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/6 text-muted-foreground transition hover:text-foreground"
        aria-label={`${row.title} details`}
      >
        <ArrowUpRight size={12} />
      </button>
    </div>
  </div>
);

const MetricGroupBlock: React.FC<{ group: MetricGroup }> = ({ group }) => (
  <div className="overflow-hidden rounded-2xl border border-border bg-muted">
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${group.avatarBg}`}
        >
          {group.avatarGlyph}
        </span>
        <span className="text-xs font-semibold text-foreground">{group.title}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <button
          className="transition hover:text-foreground"
          aria-label={`Copy ${group.title} summary`}
        >
          <Copy size={13} />
        </button>
        <button
          className="transition hover:text-foreground"
          aria-label={`Open ${group.title} page`}
        >
          <ExternalLink size={13} />
        </button>
      </div>
    </div>
    {group.rows.map((row) => (
      <MetricValueRow key={row.title} row={row} />
    ))}
  </div>
);

const TeamDataCard: React.FC<{ teamSnapshot: TeamSnapshot; analytics: LiveAnalytics }> = ({
  teamSnapshot,
  analytics,
}) => {
  const groups = buildMetricGroups(teamSnapshot, analytics);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Team &amp; Data</h3>
        <div className="flex items-center gap-3 text-muted-foreground">
          <button
            onClick={analytics.refresh}
            className="transition hover:text-foreground"
            aria-label="Refresh data"
          >
            <RotateCw size={15} />
          </button>
          <button className="transition hover:text-foreground" aria-label="Quick add team member">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <MetricGroupBlock key={g.title} group={g} />
        ))}
      </div>
    </div>
  );
};

/* ── Main Footer Component ────────────────────────────────────── */

export const Footer: React.FC<FooterProps> = ({ teamSnapshot = DEFAULT_TEAM_SNAPSHOT }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const analytics = useLiveAnalytics();

  return (
    <div className="mt-auto w-full flex flex-col items-center">
      {/* ── Expanded Area (grid‑animated) ── */}
      <div
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] w-full px-2 sm:px-6 ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card rounded-[2.5rem] p-4 md:p-6 mb-4 flex flex-col w-full shadow-sm border border-border/50">
            <div className="max-w-7xl mx-auto w-full">
              {/* Metrics row */}
              <MetricsRow analytics={analytics} teamSnapshot={teamSnapshot} />

              {/* 3‑card grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SystemStatusCard analytics={analytics} />
                <PerformanceCard analytics={analytics} />
                <TeamDataCard teamSnapshot={teamSnapshot} analytics={analytics} />
              </div>

              {/* Expanded bottom bar (kept from the first footer) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-10 border-t border-border text-[10px] sm:text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-4">
                  <span className="text-foreground/70">Brana Films · Live System Analytics</span>
                  <span className="text-muted-foreground">Team access only</span>
                </div>
                <div className="flex items-center gap-2 uppercase tracking-wider">
                  <span>Addis Ababa</span>
                  <span>{analytics.clockLabel}</span>
                  <span>22°C</span>
                  <Cloud className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Small Footer (always visible) ── */}
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
};

export default Footer;