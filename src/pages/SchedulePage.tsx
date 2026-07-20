import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  CalendarDays,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useCrudStore, generateId } from "@/hooks/use-crud-store";
import {
  CrudModal,
  ConfirmDeleteModal,
  FormField,
  StyledInput,
  StyledSelect,
  StyledTextArea,
  ActionButton,
} from "@/components/CrudModal";

// ── Types ─────────────────────────────────────────────────────────
type EventCategory =
  | "Shoot"
  | "Meeting"
  | "Editing"
  | "Delivery"
  | "Rehearsal"
  | "Personal";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  category: EventCategory;
  location: string;
  description: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<EventCategory, string> = {
  Shoot: "#7c3aed",
  Meeting: "#f59e0b",
  Editing: "#3b82f6",
  Delivery: "#10b981",
  Rehearsal: "#f472b6",
  Personal: "#6366f1",
};

const ALL_CATEGORIES: EventCategory[] = [
  "Shoot",
  "Meeting",
  "Editing",
  "Delivery",
  "Rehearsal",
  "Personal",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_EVENTS: ScheduleEvent[] = [
  {
    id: "ev1",
    title: "Liya & Bereket Wedding Shoot",
    date: "2026-07-01",
    startTime: "09:00",
    endTime: "17:00",
    category: "Shoot",
    location: "Grand Palace Hall",
    description: "Full-day wedding ceremony & reception shoot.",
    color: CATEGORY_COLORS.Shoot,
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
    color: CATEGORY_COLORS.Meeting,
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
    color: CATEGORY_COLORS.Editing,
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
    color: CATEGORY_COLORS.Delivery,
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
    color: CATEGORY_COLORS.Rehearsal,
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
    color: CATEGORY_COLORS.Meeting,
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
    color: CATEGORY_COLORS.Personal,
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
    color: CATEGORY_COLORS.Editing,
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTimeDisplay(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getTimeIcon(t: string) {
  const h = parseInt(t.split(":")[0]);
  if (h < 10) return Sunrise;
  if (h < 17) return Sun;
  return Sunset;
}

function isDateToday(dateStr: string) {
  const today = new Date();
  return (
    dateStr ===
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  );
}

function isDateFuture(dateStr: string) {
  const today = new Date();
  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return dateStr > todayStr;
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SchedulePage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    formatDate(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [filterCategory, setFilterCategory] = useState<EventCategory | "All">(
    "All",
  );

  const {
    items: events,
    create,
    update,
    remove,
  } = useCrudStore<ScheduleEvent>("scheduleEvents", DEFAULT_EVENTS);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    category: "Shoot" as EventCategory,
    location: "",
    description: "",
  });

  // ── Derived data ──────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const monthNameOnly = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long" },
  );

  // Events grouped by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  // Count events in current month
  const monthEventCount = useMemo(() => {
    return events.filter((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;
  }, [events, currentYear, currentMonth]);

  // Events for selected date (for detail view)
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return (eventsByDate[selectedDate] || [])
      .filter((ev) => {
        const matchCat =
          filterCategory === "All" || ev.category === filterCategory;
        return matchCat;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, eventsByDate, filterCategory]);

  // Today's and upcoming events (for the right panel)
  const todayAndUpcomingEvents = useMemo(() => {
    const todayEvents = events
      .filter((ev) => isDateToday(ev.date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const upcomingEvents = events
      .filter((ev) => isDateFuture(ev.date))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5);

    return { todayEvents, upcomingEvents };
  }, [events]);

  // ── Handlers ──────────────────────────────────────────────────
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const handleOpenCreate = (date?: string) => {
    setEditingEvent(null);
    setFormData({
      title: "",
      date: date || selectedDate || todayStr,
      startTime: "09:00",
      endTime: "10:00",
      category: "Shoot",
      location: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      category: ev.category,
      location: ev.location,
      description: ev.description,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const color = CATEGORY_COLORS[formData.category];
    if (editingEvent) {
      update(editingEvent.id, { ...formData, color });
    } else {
      create({
        id: generateId("ev"),
        ...formData,
        color,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setIsDeleteOpen(true);
  };

  // ── Calendar grid cells ───────────────────────────────────────
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  // ── Event Card Component ──────────────────────────────────────
  const EventCard = ({
    ev,
    index = 0,
    compact = false,
    showDate = false,
  }: {
    ev: ScheduleEvent;
    index?: number;
    compact?: boolean;
    showDate?: boolean;
  }) => {
    const TimeIcon = getTimeIcon(ev.startTime);
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="group relative cursor-pointer transition-all duration-200"
        onClick={() => handleOpenEdit(ev)}
        style={{
          background: `linear-gradient(135deg, ${ev.color}08, ${ev.color}04)`,
          border: `1px solid ${ev.color}20`,
          borderRadius: compact ? "10px" : "14px",
          padding: compact ? "12px 14px" : "16px 18px",
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-4 bottom-4 w-[4px] rounded-full"
          style={{ background: ev.color }}
        />

        <div className="flex items-start justify-between gap-2 pl-2">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4
              className="font-semibold text-foreground leading-tight"
              style={{ fontSize: compact ? "13px" : "15px" }}
            >
              {ev.title}
            </h4>

            {/* Time row */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <TimeIcon
                  size={compact ? 11 : 12}
                  className="text-muted-foreground"
                />
                <span
                  className="text-muted-foreground font-medium"
                  style={{ fontSize: compact ? "11px" : "12px" }}
                >
                  {formatTimeDisplay(ev.startTime)} –{" "}
                  {formatTimeDisplay(ev.endTime)}
                </span>
              </div>
            </div>

            {/* Location */}
            {ev.location && !compact && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin
                  size={11}
                  className="text-muted-foreground flex-shrink-0"
                />
                <span className="text-[11px] text-muted-foreground truncate">
                  {ev.location}
                </span>
              </div>
            )}

            {/* Date badge (for upcoming) */}
            {showDate && (
              <div className="flex items-center gap-1 mt-2">
                <Calendar size={10} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {formatShortDate(ev.date)}
                </span>
              </div>
            )}

            {/* Category + Location row for compact */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  background: ev.color + "18",
                  color: ev.color,
                  border: `1px solid ${ev.color}25`,
                }}
              >
                {ev.category}
              </span>
              {ev.location && compact && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin size={9} />
                  {ev.location}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(ev);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer bg-transparent border-none"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ev);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer bg-transparent border-none"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      className="w-full min-h-full p-4 flex flex-col bg-background text-foreground"
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[160px]"
          style={{ background: "rgba(34, 197, 94, 0.05)" }}
        />
        <div
          className="absolute right-[-100px] top-[30%] h-[400px] w-[400px] rounded-full blur-[140px]"
          style={{ background: "rgba(245, 158, 11, 0.04)" }}
        />
      </div>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 z-10 relative mb-6">
        <div>
          <h1 className="text-[40px] md:text-[48px] font-bold leading-none tracking-tight text-foreground">
            Schedule
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Plan your shoots, meetings, and production schedule
          </p>
        </div>
        <button
          onClick={() => handleOpenCreate()}
          className="flex items-center gap-2 text-[12px] font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer border-none hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(34, 197, 94, 0.25)",
          }}
        >
          <Plus size={14} strokeWidth={3} />
          New Event
        </button>
      </header>

      {/* ── MAIN LAYOUT: Calendar + Right Panel ──────────── */}
      <div className="flex-1 flex gap-4 z-10 relative min-h-0">
        {/* ── LEFT: Calendar Section ────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Calendar Control Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-bold text-foreground tracking-tight">
                {monthNameOnly}
              </h2>
              <span className="text-[20px] font-light text-muted-foreground">
                {currentYear}
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full ml-1"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                }}
              >
                {monthEventCount} events
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border border-border/40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={goToToday}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-border/40"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 mb-4">
            {(["All", ...ALL_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat as EventCategory | "All")}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg capitalize transition-all border cursor-pointer ${
                  filterCategory === cat
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-muted/30 text-muted-foreground border-border/40 hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                {cat === "All" ? (
                  <span className="flex items-center gap-1.5">
                    All
                    <span className="text-[9px] font-bold px-1.5 rounded bg-green-500/15 text-green-500">
                      {events.length}
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[cat] }}
                    />
                    {cat}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="rounded-xl overflow-hidden border border-border/50 glass-card flex-shrink-0">
            {/* Weekday header */}
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[13px] font-bold uppercase tracking-[0.08em] text-muted-foreground border-b border-border/30"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-[90px]"
                      style={{
                        background: "rgba(0,0,0,0.15)",
                        borderBottom:
                          idx < calendarCells.length - 7
                            ? "1px solid rgba(255,255,255,0.03)"
                            : "none",
                        borderRight:
                          (idx + 1) % 7 !== 0
                            ? "1px solid rgba(255,255,255,0.03)"
                            : "none",
                      }}
                    />
                  );
                }

                const dateStr = formatDate(currentYear, currentMonth, day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const dayEvents = eventsByDate[dateStr] || [];
                const filteredDayEvents =
                  filterCategory === "All"
                    ? dayEvents
                    : dayEvents.filter((e) => e.category === filterCategory);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className="h-[90px] p-2 cursor-pointer relative transition-all duration-150 group"
                    style={{
                      background: isSelected
                        ? "rgba(34, 197, 94, 0.06)"
                        : isToday
                          ? "rgba(34, 197, 94, 0.03)"
                          : "transparent",
                      borderBottom:
                        idx < calendarCells.length - 7
                          ? "1px solid rgba(255,255,255,0.03)"
                          : "none",
                      borderRight:
                        (idx + 1) % 7 !== 0
                          ? "1px solid rgba(255,255,255,0.03)"
                          : "none",
                    }}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[14px] font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                          isToday
                            ? "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                            : isSelected
                              ? "text-green-400 font-black"
                              : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      {filteredDayEvents.length > 0 && !isToday && (
                        <span className="text-[11px] font-bold text-muted-foreground/60">
                          {filteredDayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event dots/pills */}
                    <div className="flex flex-col gap-[3px]">
                      {filteredDayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md cursor-pointer transition-all hover:brightness-125"
                          style={{
                            background: ev.color + "20",
                            color: ev.color,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(ev);
                          }}
                          title={`${ev.title} — ${formatTimeDisplay(ev.startTime)}`}
                        >
                          <span
                            className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                            style={{ background: ev.color }}
                          />
                          <span className="truncate leading-tight">
                            {ev.title}
                          </span>
                        </div>
                      ))}
                      {filteredDayEvents.length > 2 && (
                        <span className="text-[10px] pl-2 text-muted-foreground/60 font-semibold">
                          +{filteredDayEvents.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="schedule-selected-day"
                        className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full"
                        style={{ background: "#22c55e" }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SELECTED DATE DETAIL ─────────────────────── */}
          {selectedDate && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 rounded-xl glass-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34, 197, 94, 0.1)" }}
                  >
                    <CalendarDays size={16} style={{ color: "#22c55e" }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-foreground">
                      {formatDisplayDate(selectedDate)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedDateEvents.length} event
                      {selectedDateEvents.length !== 1 ? "s" : ""} scheduled
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenCreate(selectedDate)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-xl cursor-pointer border-none transition-all hover:opacity-80"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "#22c55e",
                  }}
                >
                  <Plus size={12} strokeWidth={3} />
                  Add
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {selectedDateEvents.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center gap-2 py-8"
                    >
                      <Calendar
                        size={24}
                        className="text-muted-foreground/20"
                      />
                      <p className="text-[12px] font-medium text-muted-foreground">
                        No events on this day
                      </p>
                      <button
                        onClick={() => handleOpenCreate(selectedDate)}
                        className="text-[11px] font-semibold transition-colors text-green-500 hover:text-green-400 bg-transparent border-none cursor-pointer"
                      >
                        + Create an event
                      </button>
                    </motion.div>
                  ) : (
                    selectedDateEvents.map((ev, i) => (
                      <EventCard key={ev.id} ev={ev} index={i} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT PANEL: Today & Upcoming ─────────────── */}
        <div className="w-[320px] flex-shrink-0 flex flex-col gap-4 min-h-0 hidden xl:flex">
          {/* Today's Schedule */}
          <div className="rounded-xl glass-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34, 197, 94, 0.1)" }}
                >
                  <Clock size={16} style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">Today</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  color: "#22c55e",
                }}
              >
                {todayAndUpcomingEvents.todayEvents.length} tasks
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px] pr-1">
              <AnimatePresence mode="popLayout">
                {todayAndUpcomingEvents.todayEvents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2 py-6"
                  >
                    <Sun size={22} className="text-muted-foreground/20" />
                    <p className="text-[11px] text-muted-foreground text-center">
                      No events today
                    </p>
                    <button
                      onClick={() => handleOpenCreate(todayStr)}
                      className="text-[10px] font-semibold transition-colors text-green-500 hover:text-green-400 bg-transparent border-none cursor-pointer"
                    >
                      + Schedule something
                    </button>
                  </motion.div>
                ) : (
                  todayAndUpcomingEvents.todayEvents.map((ev, i) => (
                    <EventCard key={ev.id} ev={ev} index={i} compact />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="rounded-2xl glass-card p-5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(245, 158, 11, 0.1)" }}
                >
                  <ArrowRight size={16} style={{ color: "#f59e0b" }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">
                    Upcoming
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Next {todayAndUpcomingEvents.upcomingEvents.length} events
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
              <AnimatePresence mode="popLayout">
                {todayAndUpcomingEvents.upcomingEvents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2 py-6"
                  >
                    <Calendar size={22} className="text-muted-foreground/20" />
                    <p className="text-[11px] text-muted-foreground text-center">
                      No upcoming events
                    </p>
                  </motion.div>
                ) : (
                  todayAndUpcomingEvents.upcomingEvents.map((ev, i) => (
                    <EventCard key={ev.id} ev={ev} index={i} compact showDate />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Stats Mini Card */}
          <div className="rounded-2xl glass-card p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              This month
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATEGORIES.slice(0, 3).map((cat) => {
                const count = events.filter(
                  (ev) =>
                    ev.category === cat &&
                    new Date(ev.date + "T00:00:00").getFullYear() ===
                      currentYear &&
                    new Date(ev.date + "T00:00:00").getMonth() === currentMonth,
                ).length;
                return (
                  <div
                    key={cat}
                    className="text-center rounded-xl p-2.5 transition-all"
                    style={{
                      background: CATEGORY_COLORS[cat] + "08",
                      border: `1px solid ${CATEGORY_COLORS[cat]}15`,
                    }}
                  >
                    <p
                      className="text-[16px] font-bold"
                      style={{ color: CATEGORY_COLORS[cat] }}
                    >
                      {count}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                      {cat}s
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── CRUD MODALS ──────────────────────────────────── */}
      <CrudModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? "Edit Event" : "New Event"}
        subtitle="Schedule a production event, meeting, or personal task."
        accentColor="#22c55e"
      >
        <div className="space-y-4">
          <FormField label="Event Title">
            <StyledInput
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Wedding Ceremony Shoot"
              accentColor="#22c55e"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date">
              <StyledInput
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, date: e.target.value }))
                }
                accentColor="#22c55e"
              />
            </FormField>
            <FormField label="Category">
              <StyledSelect
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    category: e.target.value as EventCategory,
                  }))
                }
                accentColor="#22c55e"
                options={ALL_CATEGORIES.map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time">
              <StyledInput
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, startTime: e.target.value }))
                }
                accentColor="#22c55e"
              />
            </FormField>
            <FormField label="End Time">
              <StyledInput
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, endTime: e.target.value }))
                }
                accentColor="#22c55e"
              />
            </FormField>
          </div>

          <FormField label="Location">
            <StyledInput
              value={formData.location}
              onChange={(e) =>
                setFormData((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="e.g. Grand Palace Hall"
              accentColor="#22c55e"
            />
          </FormField>

          <FormField label="Description">
            <StyledTextArea
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Optional notes about this event..."
              accentColor="#22c55e"
            />
          </FormField>

          <div className="flex items-center gap-3 pt-2">
            <ActionButton
              onClick={() => setIsModalOpen(false)}
              label="Cancel"
              variant="secondary"
              className="flex-1"
            />
            <ActionButton
              onClick={handleSave}
              label={editingEvent ? "Save Changes" : "Create Event"}
              variant="primary"
              accentColor="#22c55e"
              className="flex-1"
              disabled={!formData.title.trim() || !formData.date}
            />
          </div>
        </div>
      </CrudModal>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (editingEvent) remove(editingEvent.id);
        }}
        title="Delete Event"
        itemName={editingEvent?.title}
        message="This event will be permanently removed from your schedule."
      />
    </div>
  );
}
