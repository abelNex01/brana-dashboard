import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  Upload,
  Timer,
  TimerOff,
  ArrowUpDown,
  BarChart3,
  Check,
  X,
  Star,
  Building2,
  IdCard,
  CalendarDays,
  Globe,
  Pencil,
  StickyNote,
  Target,
  Paperclip,
  TrendingUp,
  Download,
  Circle,
  CircleCheck,
  AlertTriangle,
  Activity as ActivityIcon,
  ListChecks,
  Flag,
  Award,
} from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import {
  CrudModal,
  ConfirmDeleteModal,
  FormField,
  StyledInput,
  StyledSelect,
  ActionButton,
} from "@/components/CrudModal";
import CloudinaryImage from "@/components/ui/CloudinaryImage";

/* ════════════════════════════════════════════════════════════════════════
   WORKSPACE DATA LAYER
   Tasks, time tracking, notes, goals, activity log, files, profile extras
   — all local state persisted to localStorage, seeded with believable
   starter data per member so the page isn't empty on first load.
   ════════════════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────────────────── */

/** Minimal shape TeamPage's real TeamMember is expected to satisfy.
 *  Loosely typed on purpose — we don't have visibility into TeamContext's
 *  real type, so we only assert the fields this file actually touches. */
interface TeamMemberLike {
  id: string;
  name: string;
  role?: string;
  status?: string;
  phone?: string;
  email?: string;
  location?: string;
  skills?: string[];
  currentProject?: string;
  image?: string;
  avatar?: string;
  accentColor?: string;
  statusColor?: string;
  completedProjects?: number;
}

type TaskStatus = "todo" | "in-progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type ActivityType = "task" | "note" | "status" | "clock" | "goal" | "profile" | "file";

interface WorkTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
  completedAt?: string; // ISO
}

interface WorkNote {
  id: string;
  text: string;
  author: string;
  createdAt: string; // ISO
}

interface TimeEntry {
  date: string; // YYYY-MM-DD
  hours: number;
}

interface Goal {
  id: string;
  title: string;
  progress: number; // 0-100
  createdAt: string; // ISO
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  text: string;
  timestamp: string; // ISO
}

interface MemberFile {
  id: string;
  name: string;
  size: number; // bytes
  uploadedAt: string; // ISO
}

interface MemberProfileExtra {
  department: string;
  employeeId: string;
  joinDate: string; // YYYY-MM-DD
  timezone: string;
  bio: string;
  tags: string[];
  weeklyCapacityHours: number;
  rating: number; // 1-5
  productivityScore: number; // 0-100
}

interface MemberExtras {
  profile: MemberProfileExtra;
  tasks: WorkTask[];
  notes: WorkNote[];
  timeEntries: TimeEntry[];
  goals: Goal[];
  activity: ActivityItem[];
  files: MemberFile[];
  isClockedIn: boolean;
  clockInAt: string | null;
}

interface Workload {
  hoursThisWeek: number;
  capacity: number;
  percent: number;
}

interface MemberStats {
  activeTasks: number;
  completedTasks: number;
  onTimeRate: number;
}

/* ────────────────────────────────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────────────────────────────────── */

const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "review", "done"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "In Review",
  done: "Done",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#999999",
  medium: "#666666",
  high: "#444444",
  urgent: "#000000",
};

const DEPARTMENT_POOL = ["Production", "Post-Production", "Camera", "Audio", "Operations", "Management"];
const TIMEZONE_POOL = ["GMT+3 (EAT)", "GMT+0 (UTC)", "GMT-5 (EST)", "GMT+1 (CET)"];
const STARTER_TASK_POOL = [
  "Review latest cut with director",
  "Log footage from field shoot",
  "Color grade opening sequence",
  "Prep gear for tomorrow's shoot",
  "Sync audio tracks",
  "Deliver rough cut to client",
  "Scout next location",
  "Backup raw footage to archive",
  "Write shot list for next scene",
  "Calibrate camera rig",
];

const STORAGE_KEY = "team-workspace-extras-v1";

/* ────────────────────────────────────────────────────────────────────────
   SMALL HELPERS
   ──────────────────────────────────────────────────────────────────────── */

let idCounter = 0;
function genId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function isTaskOverdue(task: WorkTask): boolean {
  if (task.status === "done") return false;
  return new Date(task.dueDate + "T23:59:59").getTime() < Date.now();
}

/** Triggers a browser download of a plain text/CSV file. Pure client-side, no dependency. */
function downloadTextFile(filename: string, content: string, mime = "text/plain"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ────────────────────────────────────────────────────────────────────────
   SEED DATA (deterministic per member id, so the page looks populated
   immediately without ever calling Math.random on every render)
   ──────────────────────────────────────────────────────────────────────── */

function createDefaultExtras(member: TeamMemberLike): MemberExtras {
  const rand = seededRandom(hashString(member.id));
  const today = new Date();

  const taskCount = 3 + Math.floor(rand() * 3);
  const tasks: WorkTask[] = Array.from({ length: taskCount }).map((_, idx) => {
    const due = new Date(today);
    due.setDate(due.getDate() + Math.floor(rand() * 12) - 4);
    const roll = rand();
    const status: TaskStatus = roll < 0.3 ? "done" : roll < 0.55 ? "in-progress" : roll < 0.72 ? "review" : "todo";
    const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
    return {
      id: genId("t"),
      title: STARTER_TASK_POOL[(idx + Math.floor(rand() * STARTER_TASK_POOL.length)) % STARTER_TASK_POOL.length],
      status,
      priority: priorities[Math.floor(rand() * priorities.length)],
      dueDate: toDateKey(due),
      createdAt: new Date(today.getTime() - Math.floor(rand() * 5) * 86400000).toISOString(),
      completedAt: status === "done" ? new Date(today.getTime() - Math.floor(rand() * 2) * 86400000).toISOString() : undefined,
    };
  });

  const timeEntries: TimeEntry[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const hours = isWeekend ? Math.round(rand() * 2 * 10) / 10 : Math.round((4 + rand() * 5) * 10) / 10;
    return { date: toDateKey(d), hours };
  });

  return {
    profile: {
      department: DEPARTMENT_POOL[Math.floor(rand() * DEPARTMENT_POOL.length)],
      employeeId: `EMP-${1000 + Math.floor(rand() * 8999)}`,
      joinDate: toDateKey(
        new Date(today.getFullYear() - Math.floor(rand() * 4), Math.floor(rand() * 12), 1 + Math.floor(rand() * 27))
      ),
      timezone: TIMEZONE_POOL[Math.floor(rand() * TIMEZONE_POOL.length)],
      bio: "",
      tags: [],
      weeklyCapacityHours: 40,
      rating: 3 + Math.round(rand() * 2),
      productivityScore: 55 + Math.floor(rand() * 40),
    },
    tasks,
    notes: [],
    timeEntries,
    goals: [
      {
        id: genId("g"),
        title: "Complete onboarding checklist",
        progress: Math.floor(rand() * 100),
        createdAt: new Date().toISOString(),
      },
    ],
    activity: [
      {
        id: genId("a"),
        type: "profile",
        text: "Workspace initialized",
        timestamp: new Date(today.getTime() - Math.floor(rand() * 6) * 86400000).toISOString(),
      },
    ],
    files: [],
    isClockedIn: false,
    clockInAt: null,
  };
}

/* ────────────────────────────────────────────────────────────────────────
   PERSISTENCE (localStorage, guarded for SSR — this is real app code,
   not a sandboxed artifact, so localStorage is safe as long as we only
   touch it on the client)
   ──────────────────────────────────────────────────────────────────────── */

function loadFromStorage(): Record<string, MemberExtras> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MemberExtras>) : null;
  } catch (e) {
    console.warn("Failed to load team extras:", e);
    return null;
  }
}

function saveToStorage(data: Record<string, MemberExtras>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save team extras:", e);
    // Storage full or unavailable (private browsing, quota) — fail silently,
    // features still work in-memory for the session.
  }
}

/* ────────────────────────────────────────────────────────────────────────
   HOOK
   ──────────────────────────────────────────────────────────────────────── */

function useTeamWorkspace(teamMembers: TeamMemberLike[], notify?: (message: string) => void) {
  const [extras, setExtras] = useState<Record<string, MemberExtras>>({});
  const hydrated = useRef(false);

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setExtras(stored);
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed default extras for any member that doesn't have any yet.
  useEffect(() => {
    if (!teamMembers.length) return;
    setExtras((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const m of teamMembers) {
        if (!next[m.id]) {
          next[m.id] = createDefaultExtras(m);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [teamMembers]);

  // Persist after every change (skip the very first render before hydration
  // finishes, so we don't clobber storage with an empty object).
  useEffect(() => {
    if (!hydrated.current) return;
    saveToStorage(extras);
  }, [extras]);

  const notifyRef = useRef(notify);
  notifyRef.current = notify;
  const say = useCallback((msg: string) => notifyRef.current?.(msg), []);

  const mutate = useCallback((memberId: string, fn: (e: MemberExtras) => MemberExtras) => {
    setExtras((prev) => {
      const current = prev[memberId] ?? createDefaultExtras({ id: memberId, name: "" });
      return { ...prev, [memberId]: fn(current) };
    });
  }, []);

  const logActivity = useCallback((e: MemberExtras, type: ActivityType, text: string): MemberExtras => {
    return {
      ...e,
      activity: [{ id: genId("a"), type, text, timestamp: new Date().toISOString() }, ...e.activity].slice(0, 60),
    };
  }, []);

  /* ── Tasks ────────────────────────────────────────────────────────── */

  const addTask = useCallback(
    (memberId: string, input: { title: string; priority: TaskPriority; dueDate: string }) => {
      if (!input.title.trim()) return;
      mutate(memberId, (e) => {
        const task: WorkTask = {
          id: genId("t"),
          title: input.title.trim(),
          status: "todo",
          priority: input.priority,
          dueDate: input.dueDate || toDateKey(new Date()),
          createdAt: new Date().toISOString(),
        };
        return logActivity({ ...e, tasks: [task, ...e.tasks] }, "task", `Task added: "${task.title}"`);
      });
      say("Task added");
    },
    [mutate, logActivity, say]
  );

  const cycleTaskStatus = useCallback(
    (memberId: string, taskId: string) => {
      mutate(memberId, (e) => {
        let changedTitle = "";
        let changedStatus: TaskStatus = "todo";
        const tasks = e.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const idx = TASK_STATUS_ORDER.indexOf(t.status);
          const nextStatus = TASK_STATUS_ORDER[(idx + 1) % TASK_STATUS_ORDER.length];
          changedTitle = t.title;
          changedStatus = nextStatus;
          return { ...t, status: nextStatus, completedAt: nextStatus === "done" ? new Date().toISOString() : undefined };
        });
        return logActivity(
          { ...e, tasks },
          "task",
          `"${changedTitle}" moved to ${STATUS_LABELS[changedStatus].toLowerCase()}`
        );
      });
    },
    [mutate, logActivity]
  );

  const deleteTask = useCallback(
    (memberId: string, taskId: string) => {
      mutate(memberId, (e) => {
        const task = e.tasks.find((t) => t.id === taskId);
        return logActivity(
          { ...e, tasks: e.tasks.filter((t) => t.id !== taskId) },
          "task",
          task ? `Task removed: "${task.title}"` : "Task removed"
        );
      });
      say("Task removed");
    },
    [mutate, logActivity, say]
  );

  /* ── Notes ────────────────────────────────────────────────────────── */

  const addNote = useCallback(
    (memberId: string, text: string, author: string) => {
      if (!text.trim()) return;
      mutate(memberId, (e) => {
        const note: WorkNote = {
          id: genId("n"),
          text: text.trim(),
          author: author.trim() || "You",
          createdAt: new Date().toISOString(),
        };
        return logActivity({ ...e, notes: [note, ...e.notes] }, "note", `Note added by ${note.author}`);
      });
      say("Note added");
    },
    [mutate, logActivity, say]
  );

  const deleteNote = useCallback(
    (memberId: string, noteId: string) => {
      mutate(memberId, (e) => ({ ...e, notes: e.notes.filter((n) => n.id !== noteId) }));
    },
    [mutate]
  );

  /* ── Time tracking ────────────────────────────────────────────────── */

  const clockIn = useCallback(
    (memberId: string) => {
      mutate(memberId, (e) => {
        if (e.isClockedIn) return e;
        return logActivity({ ...e, isClockedIn: true, clockInAt: new Date().toISOString() }, "clock", "Clocked in");
      });
      say("Clocked in");
    },
    [mutate, logActivity, say]
  );

  const clockOut = useCallback(
    (memberId: string) => {
      mutate(memberId, (e) => {
        if (!e.isClockedIn || !e.clockInAt) return e;
        const start = new Date(e.clockInAt).getTime();
        const hours = Math.max(0.01, (Date.now() - start) / 3600000);
        const today = toDateKey(new Date());
        const existing = e.timeEntries.find((te) => te.date === today);
        const timeEntries = existing
          ? e.timeEntries.map((te) => (te.date === today ? { ...te, hours: Math.round((te.hours + hours) * 100) / 100 } : te))
          : [...e.timeEntries, { date: today, hours: Math.round(hours * 100) / 100 }];
        return logActivity(
          { ...e, isClockedIn: false, clockInAt: null, timeEntries },
          "clock",
          `Clocked out after ${hours.toFixed(1)}h`
        );
      });
      say("Clocked out");
    },
    [mutate, logActivity, say]
  );

  /* ── Goals ────────────────────────────────────────────────────────── */

  const addGoal = useCallback(
    (memberId: string, title: string) => {
      if (!title.trim()) return;
      mutate(memberId, (e) => {
        const goal: Goal = { id: genId("g"), title: title.trim(), progress: 0, createdAt: new Date().toISOString() };
        return logActivity({ ...e, goals: [goal, ...e.goals] }, "goal", `Goal set: "${goal.title}"`);
      });
      say("Goal added");
    },
    [mutate, logActivity, say]
  );

  const updateGoalProgress = useCallback(
    (memberId: string, goalId: string, progress: number) => {
      mutate(memberId, (e) => {
        const clamped = Math.max(0, Math.min(100, progress));
        const goals = e.goals.map((g) => (g.id === goalId ? { ...g, progress: clamped } : g));
        const goal = goals.find((g) => g.id === goalId);
        if (clamped === 100 && goal) {
          return logActivity({ ...e, goals }, "goal", `Goal completed: "${goal.title}"`);
        }
        return { ...e, goals };
      });
    },
    [mutate, logActivity]
  );

  const deleteGoal = useCallback(
    (memberId: string, goalId: string) => {
      mutate(memberId, (e) => ({ ...e, goals: e.goals.filter((g) => g.id !== goalId) }));
    },
    [mutate]
  );

  /* ── Profile / rating ─────────────────────────────────────────────── */

  const setRating = useCallback(
    (memberId: string, rating: number) => {
      mutate(memberId, (e) =>
        logActivity(
          { ...e, profile: { ...e.profile, rating: Math.max(1, Math.min(5, rating)) } },
          "profile",
          `Rating set to ${rating}/5`
        )
      );
    },
    [mutate, logActivity]
  );

  const updateProfile = useCallback(
    (memberId: string, patch: Partial<MemberProfileExtra>) => {
      mutate(memberId, (e) => logActivity({ ...e, profile: { ...e.profile, ...patch } }, "profile", "Profile details updated"));
      say("Profile updated");
    },
    [mutate, logActivity, say]
  );

  const addTag = useCallback(
    (memberId: string, tag: string) => {
      if (!tag.trim()) return;
      mutate(memberId, (e) => {
        if (e.profile.tags.includes(tag.trim())) return e;
        return { ...e, profile: { ...e.profile, tags: [...e.profile.tags, tag.trim()] } };
      });
    },
    [mutate]
  );

  const removeTag = useCallback(
    (memberId: string, tag: string) => {
      mutate(memberId, (e) => ({ ...e, profile: { ...e.profile, tags: e.profile.tags.filter((t) => t !== tag) } }));
    },
    [mutate]
  );

  /* ── Files ────────────────────────────────────────────────────────── */

  const addFile = useCallback(
    (memberId: string, file: { name: string; size: number }) => {
      mutate(memberId, (e) => {
        const entry: MemberFile = { id: genId("f"), name: file.name, size: file.size, uploadedAt: new Date().toISOString() };
        return logActivity({ ...e, files: [entry, ...e.files] }, "file", `File attached: "${entry.name}"`);
      });
      say("File attached");
    },
    [mutate, logActivity, say]
  );

  const removeFile = useCallback(
    (memberId: string, fileId: string) => {
      mutate(memberId, (e) => ({ ...e, files: e.files.filter((f) => f.id !== fileId) }));
    },
    [mutate]
  );

  /* ── External event logging (e.g. status changed from the main grid) ─ */

  const logStatusChange = useCallback(
    (memberId: string, status: string) => {
      mutate(memberId, (e) => logActivity(e, "status", `Status changed to "${status}"`));
    },
    [mutate, logActivity]
  );

  /* ── Getters / computed values ────────────────────────────────────── */

  const getExtras = useCallback(
    (memberId: string): MemberExtras => extras[memberId] ?? createDefaultExtras({ id: memberId, name: "" }),
    [extras]
  );

  const computeWorkload = useCallback(
    (memberId: string): Workload => {
      const e = getExtras(memberId);
      const cutoff = Date.now() - 6 * 86400000;
      const hoursThisWeek = e.timeEntries
        .filter((te) => new Date(te.date).getTime() >= cutoff)
        .reduce((sum, te) => sum + te.hours, 0);
      const capacity = e.profile.weeklyCapacityHours || 40;
      const percent = capacity > 0 ? Math.round((hoursThisWeek / capacity) * 100) : 0;
      return { hoursThisWeek: Math.round(hoursThisWeek * 10) / 10, capacity, percent };
    },
    [getExtras]
  );

  const computeStats = useCallback(
    (memberId: string): MemberStats => {
      const e = getExtras(memberId);
      const active = e.tasks.filter((t) => t.status !== "done").length;
      const done = e.tasks.filter((t) => t.status === "done");
      const onTime = done.filter((t) => t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate + "T23:59:59"));
      const onTimeRate = done.length ? Math.round((onTime.length / done.length) * 100) : 100;
      return { activeTasks: active, completedTasks: done.length, onTimeRate };
    },
    [getExtras]
  );

  return useMemo(
    () => ({
      extras,
      getExtras,
      addTask,
      cycleTaskStatus,
      deleteTask,
      addNote,
      deleteNote,
      clockIn,
      clockOut,
      addGoal,
      updateGoalProgress,
      deleteGoal,
      setRating,
      updateProfile,
      addTag,
      removeTag,
      addFile,
      removeFile,
      logStatusChange,
      computeWorkload,
      computeStats,
    }),
    [extras, getExtras]
  );
}

type TeamWorkspace = ReturnType<typeof useTeamWorkspace>;

/* ════════════════════════════════════════════════════════════════════════
   MEMBER WORKSPACE MODAL — opens when a card is clicked
   ════════════════════════════════════════════════════════════════════════ */

type TabKey = "overview" | "tasks" | "time" | "performance" | "goals" | "notes" | "activity" | "files";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: Briefcase },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "time", label: "Time", icon: Timer },
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "goals", label: "Goals", icon: Target },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "activity", label: "Activity", icon: ActivityIcon },
  { key: "files", label: "Files", icon: Paperclip },
];

const DEPARTMENT_OPTIONS = [
  "Production",
  "Post-Production",
  "Camera",
  "Audio",
  "Operations",
  "Management",
  "Editorial",
  "Client Relations",
].map((d) => ({ value: d, label: d }));

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface MemberWorkspaceModalProps {
  member: TeamMemberLike;
  workspace: TeamWorkspace;
  statuses: string[];
  statusColors: Record<string, string>;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
}

function MemberWorkspaceModal({
  member,
  workspace,
  statuses,
  statusColors,
  onClose,
  onUpdateStatus,
}: MemberWorkspaceModalProps) {
  const [tab, setTab] = useState<TabKey>("overview");
  
  // Memoize computed values to prevent recalculation on every render
  const extras = useMemo(() => workspace.getExtras(member.id), [workspace, member.id]);
  const workload = useMemo(() => workspace.computeWorkload(member.id), [workspace, member.id]);
  const stats = useMemo(() => workspace.computeStats(member.id), [workspace, member.id]);

  // Close on Escape — small, low-risk affordance that doesn't touch layout.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Live-updating timer while clocked in.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!extras.isClockedIn) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [extras.isClockedIn]);

  const liveElapsed = useMemo(() => {
    if (!extras.isClockedIn || !extras.clockInAt) return null;
    const secs = Math.max(0, Math.floor((Date.now() - new Date(extras.clockInAt).getTime()) / 1000));
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, extras.isClockedIn, extras.clockInAt]);

  // ── Overview tab: editable profile fields ────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<MemberProfileExtra>(extras.profile);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setProfileForm(extras.profile);
    setEditingProfile(false);
    setTab("overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  // ── Tasks tab: add-task form ──────────────────────────────────────────
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDue, setTaskDue] = useState(toDateKey(new Date()));

  // ── Goals tab ──────────────────────────────────────────────────────────
  const [goalTitle, setGoalTitle] = useState("");

  // ── Notes tab ──────────────────────────────────────────────────────────
  const [noteText, setNoteText] = useState("");

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    workspace.addTask(member.id, { title: taskTitle, priority: taskPriority, dueDate: taskDue });
    setTaskTitle("");
    setTaskPriority("medium");
    setTaskDue(toDateKey(new Date()));
  };

  const handleSaveProfile = () => {
    workspace.updateProfile(member.id, profileForm);
    setEditingProfile(false);
  };

  const handleExportReport = () => {
    downloadTextFile(`${member.name.replace(/\s+/g, "-").toLowerCase()}-report.txt`, buildMemberReport(member, workspace));
  };

  const last7 = useMemo(() => {
    const days: { date: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const entry = extras.timeEntries.find((te) => te.date === key);
      days.push({ date: key, hours: entry?.hours || 0 });
    }
    return days;
  }, [extras.timeEntries]);

  const maxHours = Math.max(1, ...last7.map((d) => d.hours));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-[32px] border border-border bg-card shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 pb-0 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
              {member.image ? (
                <CloudinaryImage src={member.image} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-black text-lg"
                  style={{ background: `${member.accentColor || "#f97316"}25`, color: member.accentColor || "#f97316" }}
                >
                  {member.avatar}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tight truncate">{member.name}</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide truncate">{member.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 mt-4 overflow-x-auto scrollbar-hide border-b border-border/60 flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative px-3 py-2.5 text-[12px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors flex-shrink-0"
              style={{ color: tab === t.key ? "var(--color-foreground)" : "var(--color-muted-foreground)" }}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {tab === t.key && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Status changer */}
              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap items-center gap-1 bg-muted rounded-md p-0.5 border border-border dark:bg-zinc-900 dark:border-zinc-800">
                  {statuses
                    .filter((s) => s !== "All")
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => onUpdateStatus(s)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                          member.status === s
                            ? "bg-foreground text-background dark:bg-zinc-800/60 dark:text-zinc-100"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-200"
                        }`}
                      >
                        {s.toLowerCase()}
                      </button>
                    ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-bold hover:bg-muted transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-bold hover:bg-muted transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                )}
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-bold hover:bg-muted transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export report
                </button>
                <button
                  onClick={() => setEditingProfile((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-bold hover:bg-muted transition-colors ml-auto"
                >
                  <Pencil className="w-3.5 h-3.5" /> {editingProfile ? "Cancel edit" : "Edit details"}
                </button>
              </div>

              {/* Profile grid / edit form */}
              {editingProfile ? (
                <div className="space-y-3 p-4 rounded-2xl border border-border/60 bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Department">
                      <StyledSelect
                        value={profileForm.department}
                        onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                        options={DEPARTMENT_OPTIONS}
                      />
                    </FormField>
                    <FormField label="Employee ID">
                      <StyledInput
                        value={profileForm.employeeId}
                        onChange={(e) => setProfileForm((p) => ({ ...p, employeeId: e.target.value }))}
                      />
                    </FormField>
                    <FormField label="Joined (YYYY-MM-DD)">
                      <StyledInput
                        value={profileForm.joinDate}
                        onChange={(e) => setProfileForm((p) => ({ ...p, joinDate: e.target.value }))}
                        placeholder="2024-01-15"
                      />
                    </FormField>
                    <FormField label="Timezone">
                      <StyledInput
                        value={profileForm.timezone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, timezone: e.target.value }))}
                        placeholder="GMT+3 (EAT)"
                      />
                    </FormField>
                    <FormField label="Weekly capacity (hours)">
                      <StyledInput
                        value={String(profileForm.weeklyCapacityHours)}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, weeklyCapacityHours: Number(e.target.value) || 0 }))
                        }
                        placeholder="40"
                      />
                    </FormField>
                  </div>
                  <FormField label="Short bio">
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      rows={2}
                      placeholder="A line or two about this person..."
                      className="w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </FormField>
                  <div className="flex justify-end gap-2 pt-1">
                    <ActionButton label="Cancel" variant="secondary" onClick={() => setEditingProfile(false)} />
                    <ActionButton label="Save details" onClick={handleSaveProfile} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow icon={MapPin} label="Location" value={member.location} />
                  <InfoRow icon={Briefcase} label="Current project" value={member.currentProject} />
                  <InfoRow icon={Building2} label="Department" value={extras.profile.department} />
                  <InfoRow icon={IdCard} label="Employee ID" value={extras.profile.employeeId} />
                  <InfoRow icon={CalendarDays} label="Joined" value={extras.profile.joinDate} />
                  <InfoRow icon={Globe} label="Timezone" value={extras.profile.timezone} />
                </div>
              )}

              {extras.profile.bio && !editingProfile && (
                <p className="text-sm text-muted-foreground leading-relaxed">{extras.profile.bio}</p>
              )}

              {/* Skills & tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(member.skills || []).length === 0 && (
                      <span className="text-xs text-muted-foreground">No skills listed</span>
                    )}
                    {(member.skills || []).map((s: string) => (
                      <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {extras.profile.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-semibold pl-2.5 pr-1.5 py-1 rounded-full bg-muted text-foreground flex items-center gap-1"
                      >
                        {t}
                        <button
                          onClick={() => workspace.removeTag(member.id, t)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-background/60"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          workspace.addTag(member.id, tagInput.trim());
                          setTagInput("");
                        }
                      }}
                      placeholder="+ add tag"
                      className="text-[11px] bg-transparent outline-none w-20 py-1"
                    />
                  </div>
                </div>
              </div>

              {/* Workload meter */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                  <span>Weekly workload</span>
                  <span>
                    {workload.hoursThisWeek}h / {workload.capacity}h
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, workload.percent)}%`,
                      background: workload.percent > 100 ? "#000000" : workload.percent > 80 ? "#444444" : "#999999",
                    }}
                  />
                </div>
                {workload.percent > 100 && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Over capacity this week
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Active" value={stats.activeTasks} />
                <StatBox label="Done" value={stats.completedTasks} />
                <StatBox label="On-time" value={`${stats.onTimeRate}%`} />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                <div className="flex-1">
                  <FormField label="New task">
                    <StyledInput
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Task title..."
                    />
                  </FormField>
                </div>
                <div className="w-full sm:w-32">
                  <FormField label="Priority">
                    <StyledSelect
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                      options={PRIORITY_OPTIONS}
                    />
                  </FormField>
                </div>
                <div className="w-full sm:w-36">
                  <FormField label="Due date">
                    <StyledInput value={taskDue} onChange={(e) => setTaskDue(e.target.value)} placeholder="YYYY-MM-DD" />
                  </FormField>
                </div>
                <ActionButton label="Add" onClick={handleAddTask} disabled={!taskTitle.trim()} />
              </div>

              <div className="space-y-4">
                {TASK_STATUS_ORDER.map((status) => {
                  const list = extras.tasks.filter((t) => t.status === status);
                  if (!list.length) return null;
                  return (
                    <div key={status}>
                      <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2">
                        {STATUS_LABELS[status]} · {list.length}
                      </p>
                      <div className="space-y-1.5">
                        {list.map((task) => {
                          const overdue = isTaskOverdue(task);
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/50 bg-muted/20"
                            >
                              <button
                                onClick={() => workspace.cycleTaskStatus(member.id, task.id)}
                                title="Advance status"
                                className="flex-shrink-0"
                              >
                                {task.status === "done" ? (
                                  <CircleCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <span
                                className={`flex-1 min-w-0 text-sm font-medium truncate ${
                                  task.status === "done" ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {task.title}
                              </span>
                              <span
                                className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0"
                                style={{
                                  background: `${PRIORITY_COLORS[task.priority]}20`,
                                  color: PRIORITY_COLORS[task.priority],
                                }}
                              >
                                <Flag className="w-2.5 h-2.5" />
                                {task.priority}
                              </span>
                              <span
                                className={`text-[10px] font-medium flex-shrink-0 ${
                                  overdue ? "text-red-500 font-bold" : "text-muted-foreground"
                                }`}
                              >
                                {task.dueDate}
                              </span>
                              <button
                                onClick={() => workspace.deleteTask(member.id, task.id)}
                                className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {extras.tasks.length === 0 && <EmptyState text="No tasks yet — add one above." />}
              </div>
            </div>
          )}

          {tab === "time" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/20 gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Status</p>
                  <p className="text-lg font-black truncate">{extras.isClockedIn ? "Clocked in" : "Clocked out"}</p>
                  {liveElapsed && <p className="text-xs text-muted-foreground font-mono">{liveElapsed}</p>}
                </div>
                <button
                  onClick={() => (extras.isClockedIn ? workspace.clockOut(member.id) : workspace.clockIn(member.id))}
                  className="px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 flex-shrink-0 transition-colors"
                  style={{
                    background: extras.isClockedIn ? "#000000" : "var(--color-foreground)",
                    color: extras.isClockedIn ? "#fff" : "var(--color-background)",
                  }}
                >
                  {extras.isClockedIn ? (
                    <>
                      <TimerOff className="w-4 h-4" /> Clock out
                    </>
                  ) : (
                    <>
                      <Timer className="w-4 h-4" /> Clock in
                    </>
                  )}
                </button>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Last 7 days</p>
                <div className="flex items-end gap-2 h-28">
                  {last7.map((entry) => (
                    <div key={entry.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[9px] font-bold text-muted-foreground">{entry.hours || ""}</span>
                      <div
                        className="w-full rounded-t-md bg-primary/70 transition-all duration-500"
                        style={{ height: `${Math.max(3, (entry.hours / maxHours) * 100)}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">
                        {new Date(entry.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                  <span>This week</span>
                  <span>
                    {workload.hoursThisWeek}h / {workload.capacity}h ({workload.percent}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, workload.percent)}%`,
                      background: workload.percent > 100 ? "#000000" : workload.percent > 80 ? "#444444" : "#999999",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "performance" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <RadialGauge value={extras.profile.productivityScore} />
                <div>
                  <p className="text-3xl font-black leading-none">
                    {extras.profile.productivityScore}
                    <span className="text-sm text-muted-foreground font-bold">/100</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wide mt-1">
                    Productivity score
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => workspace.setRating(member.id, n)} title={`${n}/5`}>
                      <Star
                        className="w-6 h-6 transition-colors"
                        style={{
                          fill: n <= extras.profile.rating ? "#666666" : "none",
                          color: n <= extras.profile.rating ? "#666666" : "var(--color-muted-foreground)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Projects" value={member.completedProjects || 0} />
                <StatBox label="Tasks done" value={stats.completedTasks} />
                <StatBox label="On-time rate" value={`${stats.onTimeRate}%`} />
              </div>
            </div>
          )}

          {tab === "goals" && (
            <div className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormField label="New goal">
                    <StyledInput value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. Master DaVinci Resolve" />
                  </FormField>
                </div>
                <ActionButton
                  label="Add"
                  onClick={() => {
                    workspace.addGoal(member.id, goalTitle);
                    setGoalTitle("");
                  }}
                  disabled={!goalTitle.trim()}
                />
              </div>

              <div className="space-y-3">
                {extras.goals.map((g) => (
                  <div key={g.id} className="p-3.5 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex justify-between items-center mb-2 gap-2">
                      <span className="text-sm font-semibold truncate">{g.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-muted-foreground w-9 text-right">{g.progress}%</span>
                        <button
                          onClick={() => workspace.deleteGoal(member.id, g.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={g.progress}
                      onChange={(e) => workspace.updateGoalProgress(member.id, g.id, Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>
                ))}
                {extras.goals.length === 0 && <EmptyState text="No goals set yet." />}
              </div>
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Write a note about this team member..."
                  className="w-full resize-none rounded-xl border border-border/60 bg-background px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex justify-end">
                  <ActionButton
                    label="Add note"
                    onClick={() => {
                      workspace.addNote(member.id, noteText, "You");
                      setNoteText("");
                    }}
                    disabled={!noteText.trim()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {extras.notes.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex justify-between mb-1 gap-2">
                      <span className="text-xs font-bold">{n.author}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                        <button
                          onClick={() => workspace.deleteNote(member.id, n.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                  </div>
                ))}
                {extras.notes.length === 0 && <EmptyState text="No notes yet." />}
              </div>
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-1">
              {extras.activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-muted flex-shrink-0 mt-0.5">
                    <ActivityTypeIcon type={a.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              ))}
              {extras.activity.length === 0 && <EmptyState text="No activity yet." />}
            </div>
          )}

          {tab === "files" && (
            <div className="space-y-4">
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-muted/40 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Attach file</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) workspace.addFile(member.id, { name: f.name, size: f.size });
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="text-[11px] text-muted-foreground">
                Demo only — files are tracked by name and size locally; wire this up to your storage backend to persist
                actual uploads.
              </p>
              <div className="space-y-1.5">
                {extras.files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50">
                    <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatBytes(f.size)}</span>
                    <button
                      onClick={() => workspace.removeFile(member.id, f.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {extras.files.length === 0 && <EmptyState text="No files attached." />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Small local sub-components ──────────────────────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/20">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-xl border border-border/50 bg-muted/20 text-center">
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-1.5">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{text}</p>;
}

function RadialGauge({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;
  const color = clamped >= 80 ? "#999999" : clamped >= 50 ? "#666666" : "#000000";
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="8" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function ActivityTypeIcon({ type }: { type: ActivityType }) {
  const cls = "w-3.5 h-3.5 text-muted-foreground";
  switch (type) {
    case "task":
      return <ListChecks className={cls} />;
    case "note":
      return <StickyNote className={cls} />;
    case "status":
      return <Circle className={cls} />;
    case "clock":
      return <Timer className={cls} />;
    case "goal":
      return <Target className={cls} />;
    case "file":
      return <Paperclip className={cls} />;
    default:
      return <Pencil className={cls} />;
  }
}

function buildMemberReport(member: TeamMemberLike, workspace: TeamWorkspace): string {
  const extras = workspace.getExtras(member.id);
  const stats = workspace.computeStats(member.id);
  const workload = workspace.computeWorkload(member.id);

  const lines = [
    "TEAM MEMBER REPORT",
    "===================",
    `Name: ${member.name}`,
    `Role: ${member.role || "—"}`,
    `Status: ${member.status || "—"}`,
    `Department: ${extras.profile.department}`,
    `Employee ID: ${extras.profile.employeeId}`,
    `Email: ${member.email || "—"}`,
    `Phone: ${member.phone || "—"}`,
    `Location: ${member.location || "—"}`,
    `Joined: ${extras.profile.joinDate}`,
    "",
    "PERFORMANCE",
    `Rating: ${extras.profile.rating}/5`,
    `Productivity score: ${extras.profile.productivityScore}/100`,
    `Completed projects: ${member.completedProjects || 0}`,
    `On-time task rate: ${stats.onTimeRate}%`,
    "",
    "WORKLOAD",
    `Hours this week: ${workload.hoursThisWeek} / ${workload.capacity}`,
    `Active tasks: ${stats.activeTasks}`,
    `Completed tasks: ${stats.completedTasks}`,
    "",
    "TASKS",
    ...(extras.tasks.length
      ? extras.tasks.map((t) => `- [${t.status}] ${t.title} (priority: ${t.priority}, due: ${t.dueDate})`)
      : ["(none)"]),
    "",
    "NOTES",
    ...(extras.notes.length ? extras.notes.map((n) => `- (${n.author}) ${n.text}`) : ["(none)"]),
  ];
  return lines.join("\n");
}

/* ════════════════════════════════════════════════════════════════════════
   TEAM INSIGHTS MODAL — page-level analytics
   ════════════════════════════════════════════════════════════════════════ */

interface TeamInsightsModalProps {
  teamMembers: TeamMemberLike[];
  workspace: TeamWorkspace;
  statusColors: Record<string, string>;
  onClose: () => void;
}

function TeamInsightsModal({ teamMembers, workspace, statusColors, onClose }: TeamInsightsModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const data = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const departmentCounts: Record<string, number> = {};
    let totalActive = 0;
    let totalDone = 0;
    let capacitySum = 0;
    const overloaded: TeamMemberLike[] = [];
    const upcoming: { member: TeamMemberLike; title: string; dueDate: string }[] = [];

    // Cache member extras to avoid repeated getExtras calls
    const memberExtrasCache = new Map<string, ReturnType<typeof workspace.getExtras>>();
    const memberStatsCache = new Map<string, ReturnType<typeof workspace.computeStats>>();
    const memberWorkloadCache = new Map<string, ReturnType<typeof workspace.computeWorkload>>();

    teamMembers.forEach((m) => {
      statusCounts[m.status || "Unknown"] = (statusCounts[m.status || "Unknown"] || 0) + 1;

      // Use cached values or compute once
      const extras = memberExtrasCache.get(m.id) || workspace.getExtras(m.id);
      memberExtrasCache.set(m.id, extras);

      const stats = memberStatsCache.get(m.id) || workspace.computeStats(m.id);
      memberStatsCache.set(m.id, stats);

      const workload = memberWorkloadCache.get(m.id) || workspace.computeWorkload(m.id);
      memberWorkloadCache.set(m.id, workload);

      departmentCounts[extras.profile.department] = (departmentCounts[extras.profile.department] || 0) + 1;
      totalActive += stats.activeTasks;
      totalDone += stats.completedTasks;
      capacitySum += workload.percent;
      if (workload.percent > 100) overloaded.push(m);

      extras.tasks
        .filter((t) => t.status !== "done")
        .forEach((t) => upcoming.push({ member: m, title: t.title, dueDate: t.dueDate }));
    });

    upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const topPerformers = [...teamMembers]
      .map((m) => ({ member: m, score: (memberExtrasCache.get(m.id) || workspace.getExtras(m.id)).profile.productivityScore }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      statusCounts,
      departmentCounts,
      totalActive,
      totalDone,
      avgCapacity: teamMembers.length ? Math.round(capacitySum / teamMembers.length) : 0,
      overloaded,
      upcoming: upcoming.slice(0, 6),
      topPerformers,
    };
  }, [teamMembers, workspace]);

  const handleExport = () => {
    const lines = [
      "TEAM INSIGHTS REPORT",
      "=====================",
      `Team size: ${teamMembers.length}`,
      `Average workload: ${data.avgCapacity}%`,
      `Active tasks: ${data.totalActive}`,
      `Completed tasks: ${data.totalDone}`,
      "",
      "STATUS BREAKDOWN",
      ...Object.entries(data.statusCounts).map(([s, c]) => `- ${s}: ${c}`),
      "",
      "DEPARTMENT BREAKDOWN",
      ...Object.entries(data.departmentCounts).map(([d, c]) => `- ${d}: ${c}`),
      "",
      "TOP PERFORMERS",
      ...data.topPerformers.map((p, i) => `${i + 1}. ${p.member.name} — ${p.score}/100`),
    ];
    downloadTextFile("team-insights-report.txt", lines.join("\n"));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] border border-border bg-card shadow-2xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Team Insights</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {teamMembers.length} member{teamMembers.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 text-center">
            <p className="text-2xl font-black leading-none">{data.avgCapacity}%</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-1.5">Avg workload</p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 text-center">
            <p className="text-2xl font-black leading-none">{data.totalActive}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-1.5">Active tasks</p>
          </div>
          <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 text-center">
            <p className="text-2xl font-black leading-none">{data.totalDone}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-1.5">Completed</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" /> Status breakdown
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.statusCounts).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/40 border border-border/50 text-xs font-semibold"
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[status] || "#94a3b8" }} />
                {status} <span className="text-muted-foreground">· {count}</span>
              </div>
            ))}
          </div>
        </div>

        {data.overloaded.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase text-red-500 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Over capacity this week
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.overloaded.map((m) => (
                <span key={m.id} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500">
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Top performers
          </p>
          <div className="space-y-1.5">
            {data.topPerformers.map((p, i) => (
              <div key={p.member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                <span className="text-xs font-black text-muted-foreground w-4">{i + 1}</span>
                <span className="flex-1 text-sm font-semibold truncate">{p.member.name}</span>
                <span className="text-xs font-bold text-muted-foreground">{p.score}/100</span>
              </div>
            ))}
          </div>
        </div>

        {data.upcoming.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Upcoming deadlines
            </p>
            <div className="space-y-1.5">
              {data.upcoming.map((u, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                  <span className="flex-1 text-sm truncate">
                    {u.title} <span className="text-muted-foreground">— {u.member.name}</span>
                  </span>
                  <span className="text-xs font-bold text-muted-foreground flex-shrink-0">{u.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-2">
          <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Departments
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(data.departmentCounts).map(([dept, count]) => (
              <span key={dept} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted/40 border border-border/50">
                {dept} · {count}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-sm transition-colors"
          style={{ background: "var(--color-foreground)", color: "var(--color-background)" }}
        >
          <Download className="w-4 h-4" /> Export team report
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE (unchanged layout — see comments below for what's new)
   ════════════════════════════════════════════════════════════════════════ */


type SortKey = "name" | "status" | "workload" | "rating" | "projects";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name (A–Z)" },
  { value: "status", label: "Status" },
  { value: "workload", label: "Workload" },
  { value: "rating", label: "Rating" },
  { value: "projects", label: "Projects completed" },
];

const statusColors: Record<string, string> = {
  "In Field": "#444444",
  Editing: "#666666",
  Available: "#999999",
  "Post-Production": "#555555",
  Online: "#999999",
  "Off Duty": "#777777",
};

const cardGradients = [
  "from-rose-400 via-fuchsia-400 to-indigo-500",
  "from-amber-300 via-orange-400 to-rose-400",
  "from-cyan-300 via-blue-400 to-indigo-500",
  "from-emerald-300 via-teal-400 to-cyan-500",
  "from-violet-400 via-purple-400 to-fuchsia-500",
  "from-pink-400 via-rose-400 to-red-500",
  "from-blue-400 via-indigo-400 to-purple-500",
  "from-yellow-300 via-amber-400 to-orange-500",
];

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const {
    teamMembers,
    addTeamMember,
    updateTeamMember: update,
    removeTeamMember: remove,
  } = useTeam();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [workspaceMemberId, setWorkspaceMemberId] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("name");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const workspace = useTeamWorkspace(teamMembers, notify);

  const [formData, setFormData] = useState({
    name: "",
    role: "Lead Cinematographer",
    status: "Available",
    phone: "",
    email: "",
    location: "Studio",
    skills: "",
    currentProject: "—",
    image: "",
  });

  const statuses = [
    "All",
    "In Field",
    "Editing",
    "Available",
    "Post-Production",
    "Online",
    "Off Duty",
  ];

  const cycleableStatuses = statuses.filter((s) => s !== "All");
  const handleCycleStatus = (member: any) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = cycleableStatuses.indexOf(member.status);
    const next = cycleableStatuses[(idx + 1) % cycleableStatuses.length];
    update(member.id, { status: next, statusColor: statusColors[next] || member.statusColor });
    workspace.logStatusChange(member.id, next);
    notify(`${member.name.split(" ")[0]} is now ${next}`);
  };

  const filtered = useMemo(() => {
    // Cache computed values to avoid repeated workspace calls during sorting
    const workloadCache = new Map<string, ReturnType<typeof workspace.computeWorkload>>();
    const extrasCache = new Map<string, ReturnType<typeof workspace.getExtras>>();

    const getWorkload = (id: string) => {
      if (!workloadCache.has(id)) {
        workloadCache.set(id, workspace.computeWorkload(id));
      }
      return workloadCache.get(id)!;
    };

    const getExtras = (id: string) => {
      if (!extrasCache.has(id)) {
        extrasCache.set(id, workspace.getExtras(id));
      }
      return extrasCache.get(id)!;
    };

    const base = teamMembers.filter((m) => {
      const extras = getExtras(m.id);
      const haystack = [m.name, m.role, ...(m.skills || []), extras.profile.department, ...extras.profile.tags]
        .join(" ")
        .toLowerCase();
      const matchSearch = search === "" || haystack.includes(search.toLowerCase());
      const matchStatus = selectedStatus === "All" || m.status === selectedStatus;
      return matchSearch && matchStatus;
    });

    return [...base].sort((a, b) => {
      switch (sortBy) {
        case "status":
          return a.status.localeCompare(b.status);
        case "workload":
          return getWorkload(b.id).percent - getWorkload(a.id).percent;
        case "rating":
          return getExtras(b.id).profile.rating - getExtras(a.id).profile.rating;
        case "projects":
          return (b.completedProjects || 0) - (a.completedProjects || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [teamMembers, search, selectedStatus, sortBy, workspace]);

  const workspaceMember = teamMembers.find((m) => m.id === workspaceMemberId) || null;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "Lead Cinematographer",
      status: "Available",
      phone: "",
      email: "",
      location: "Studio",
      skills: "",
      currentProject: "—",
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      status: item.status,
      phone: item.phone,
      email: item.email,
      location: item.location,
      skills: item.skills.join(", "),
      currentProject: item.currentProject,
      image: item.image || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const roleColorsMap: Record<string, string> = {
      "Lead Cinematographer": "#333333",
      "Senior Editor": "#444444",
      "Drone Operator": "#555555",
      "Editor & Colorist": "#666666",
      "Studio Director": "#222222",
    };

    const roleAccent = roleColorsMap[formData.role] || "#444444";
    const statusAccent = statusColors[formData.status] || "#444444";

    if (editingItem) {
      update(editingItem.id, {
        ...formData,
        avatar: formData.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        skills: formData.skills
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s),
        accentColor: roleAccent,
        statusColor: statusAccent,
        image: formData.image || undefined,
      });
    } else {
      addTeamMember({
        ...formData,
        avatar: formData.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        skills: formData.skills
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s),
        accentColor: roleAccent,
        statusColor: statusAccent,
        image: formData.image || undefined,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="w-full min-h-full p-6 md:p-10 flex flex-col bg-background text-foreground gap-8">
      <div>
      {/* HEADER SECTION */}
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
          Team & Crew
        </h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
          Production Talent • {teamMembers.length} Members
        </p>
      </header>

      {/* ── SEARCH & ADD ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-2 z-10 relative">
        {/* Search */}
        <div className="relative flex-1 max-w-2xl">
          <div className="group flex items-center gap-2 px-4 h-12 rounded-lg bg-muted/50 border border-border/60 focus-within:border-primary/50 transition-colors w-full">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search for crew, role, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <span className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border/60 rounded-md">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border/60 rounded-md">
                F
              </kbd>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="w-14 h-14 rounded-full flex items-center justify-center text-foreground bg-background hover:bg-muted transition-colors border border-border shadow-sm hover:shadow-md dark:text-background dark:bg-foreground"
              title="Sort"
            >
              <ArrowUpDown className="w-6 h-6" />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-16 z-20 w-52 rounded-2xl border border-border bg-card shadow-xl p-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setShowSortMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      {opt.label}
                      {sortBy === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowInsights(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-foreground bg-background hover:bg-muted transition-colors border border-border shadow-sm hover:shadow-md dark:text-background dark:bg-foreground"
            title="Team Insights"
          >
            <BarChart3 className="w-6 h-6" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="w-14 h-14 rounded-full flex items-center justify-center text-foreground bg-background hover:bg-muted transition-colors border border-border shadow-sm hover:shadow-md dark:text-background dark:bg-foreground"
            title="Add New Member"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ── STATUS FILTER ROW ───────────────────────────── */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setSelectedStatus("All")}
            className="relative px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-colors"
            style={{
              color:
                selectedStatus === "All"
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)",
            }}
          >
            All Crew
            {selectedStatus === "All" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary"
              />
            )}
          </button>
        </div>

        {/* Right side: status filter chips */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5 border border-border dark:bg-zinc-900 dark:border-zinc-800 flex-shrink-0">
          {statuses.filter((s) => s !== "All").map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(selectedStatus === s ? "All" : s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                selectedStatus === s
                  ? "bg-foreground text-background dark:bg-zinc-800/60 dark:text-zinc-100"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-200"
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* FOLDER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((member, i) => {
          const memberExtras = workspace.getExtras(member.id);
          return (
          <div
            key={member.id}
            onClick={() => setWorkspaceMemberId(member.id)}
            className="relative aspect-square w-full rounded-[40px] border-[10px] border-border bg-card overflow-hidden group cursor-pointer shadow-2xl"
          >
            {/* Top Gradient Background or Image */}
            {member.image ? (
              <CloudinaryImage
                src={member.image}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} opacity-90 group-hover:opacity-100`}
              />
            )}

            {/* Folder Shape Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[62%] z-10">
              {/* Main Folder Body */}
              <div className="absolute bottom-0 left-0 right-0 h-full bg-muted rounded-b-[30px] dark:bg-[#161617]" />

              {/* Folder Tab */}
              <div className="absolute bottom-full left-0 w-[58%] h-[40px] bg-muted rounded-t-[14px] dark:bg-[#161617]">
                {/* Smoothing curve for the folder tab transition */}
                <div className="absolute bottom-0 left-full w-[30px] h-[30px] bg-transparent rounded-bl-[20px]" style={{ boxShadow: "-15px 15px 0 0 var(--color-muted)" }} />
              </div>

              {/* Text Content Inside Folder Area */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Name & Role (Positioned relative to tab) */}
                <div className="mt-[-34px]">
                  <h3 className="text-lg font-black text-foreground leading-tight truncate">
                    {member.name}
                  </h3>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight truncate mt-1">
                    {member.role}
                  </p>
                </div>

                {/* Bottom Stats */}
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground tracking-tighter">
                      {String(member.completedProjects || 0).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase pb-1">
                      Projects
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={handleCycleStatus(member)}
                      title="Click to update status"
                      className="flex items-center gap-1.5 px-2 py-1 bg-background/5 rounded-md hover:bg-background/10 transition-colors"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: member.statusColor }}
                      />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                        {member.status}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  memberExtras.isClockedIn ? workspace.clockOut(member.id) : workspace.clockIn(member.id);
                }}
                title={memberExtras.isClockedIn ? "Clock out" : "Clock in"}
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors dark:bg-black/50 dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                {memberExtras.isClockedIn ? <TimerOff className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
              </button>
              <a
                href={`mailto:${member.email}`}
                onClick={(e) => e.stopPropagation()}
                title="Email"
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors dark:bg-black/50 dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                <Mail className="w-4 h-4" />
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(member);
                }}
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors dark:bg-black/50 dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingItem(member);
                  setIsDeleteOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* FALLBACK FOR EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-[40px]">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">No team members found</p>
        </div>
      )}

      {/* MODALS */}
      <CrudModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Crew Member" : "New Crew Member"}
      >
        <div className="space-y-4">
          {/* Image Upload */}
          <FormField label="Profile Image">
            <div className="flex flex-col gap-2">
              <div className="w-full h-32 rounded-xl border border-border/40 overflow-hidden bg-muted/30">
                {formData.image ? (
                  <CloudinaryImage
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No image selected
                  </div>
                )}
              </div>
              <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-muted/50 hover:bg-muted/70 cursor-pointer transition-all text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setFormData((p) => ({
                          ...p,
                          image: (event.target?.result as string) || "",
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </FormField>

          <FormField label="Full Name">
            <StyledInput
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role">
              <StyledSelect
                value={formData.role}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, role: e.target.value }))
                }
                options={[
                  {
                    value: "Lead Cinematographer",
                    label: "Lead Cinematographer",
                  },
                  { value: "Senior Editor", label: "Senior Editor" },
                  { value: "Drone Operator", label: "Drone Operator" },
                  { value: "Editor & Colorist", label: "Editor & Colorist" },
                  { value: "Audio Engineer", label: "Audio Engineer" },
                  { value: "Studio Director", label: "Studio Director" },
                ]}
              />
            </FormField>
            <FormField label="Status">
              <StyledSelect
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, status: e.target.value }))
                }
                options={[
                  { value: "Available", label: "Available" },
                  { value: "In Field", label: "In Field" },
                  { value: "Editing", label: "Editing" },
                  { value: "Post-Production", label: "Post-Production" },
                  { value: "Online", label: "Online" },
                  { value: "Off Duty", label: "Off Duty" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <StyledInput
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+251 91 234 5678"
              />
            </FormField>
            <FormField label="Email">
              <StyledInput
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </FormField>
          </div>

          <FormField label="Location">
            <StyledInput
              value={formData.location}
              onChange={(e) =>
                setFormData((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="Studio A"
            />
          </FormField>

          <FormField label="Skills (comma separated)">
            <StyledInput
              value={formData.skills}
              onChange={(e) =>
                setFormData((p) => ({ ...p, skills: e.target.value }))
              }
              placeholder="Sony FX3, Drone Ops, Lighting"
            />
          </FormField>

          <FormField label="Current Project">
            <StyledInput
              value={formData.currentProject}
              onChange={(e) =>
                setFormData((p) => ({ ...p, currentProject: e.target.value }))
              }
              placeholder="Current project name"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-6">
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            />
            <ActionButton
              label="Save Member"
              onClick={handleSave}
              disabled={!formData.name}
            />
          </div>
        </div>
      </CrudModal>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => remove(editingItem?.id)}
        itemName={editingItem?.name}
      />

      {workspaceMember && (
        <MemberWorkspaceModal
          key={workspaceMember.id}
          member={workspaceMember}
          workspace={workspace}
          statuses={statuses}
          statusColors={statusColors}
          onClose={() => setWorkspaceMemberId(null)}
          onUpdateStatus={(status) =>
            update(workspaceMember.id, { status, statusColor: statusColors[status] || workspaceMember.statusColor })
          }
        />
      )}

      {showInsights && (
        <TeamInsightsModal
          teamMembers={teamMembers}
          workspace={workspace}
          statusColors={statusColors}
          onClose={() => setShowInsights(false)}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[200] px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold shadow-xl pointer-events-none"
        >
          {toast}
        </div>
      )}
      </div>
    </div>
  );
}