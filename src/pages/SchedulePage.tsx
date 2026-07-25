import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  ArrowRight,
  Search,
  Filter,
  MoreHorizontal,
  AlignLeft,
  Command
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
  date: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  location: string;
  description: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<EventCategory, string> = {
  Shoot: "#000000",
  Meeting: "#333333",
  Editing: "#666666",
  Delivery: "#999999",
  Rehearsal: "#444444",
  Personal: "#777777",
};

const ALL_CATEGORIES: EventCategory[] = [
  "Shoot",
  "Meeting",
  "Editing",
  "Delivery",
  "Rehearsal",
  "Personal",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_EVENTS: ScheduleEvent[] = [];

// ── Helpers ───────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Adjust for Monday start
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
    today.getDate()
  );
  return dateStr > todayStr;
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SchedulePage() {
  const { theme } = useTheme();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [filterCategory, setFilterCategory] = useState<EventCategory | "All">("All");

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
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const monthNameOnly = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long" }
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const monthEventCount = useMemo(() => {
    return events.filter((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;
  }, [events, currentYear, currentMonth]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return (eventsByDate[selectedDate] || [])
      .filter((ev) => filterCategory === "All" || ev.category === filterCategory)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, eventsByDate, filterCategory]);

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
      .slice(0, 4);

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

  // ── Event Card Component (Redesigned for Right Panel) ───────
  const TimelineCard = ({ ev, index = 0, showDate = false }: { ev: ScheduleEvent; index?: number; showDate?: boolean }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        onClick={() => handleOpenEdit(ev)}
        className="group relative flex gap-4 cursor-pointer p-3 rounded-xl hover:bg-muted/40 transition-colors duration-200 border border-transparent hover:border-border dark:hover:bg-zinc-800/40 dark:hover:border-zinc-800"
      >
        <div className="flex flex-col items-center min-w-[48px] pt-1">
          <span className="text-xs font-medium text-foreground dark:text-zinc-300">{ev.startTime}</span>
          <span className="text-[10px] text-muted-foreground font-medium dark:text-zinc-600">{ev.endTime}</span>
        </div>
        
        <div 
          className="w-0.5 h-full absolute left-[60px] top-3 bottom-3 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: ev.color }}
        />

        <div className="flex-1 min-w-0 pl-2">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-foreground truncate group-hover:text-foreground transition-colors dark:text-zinc-100 dark:group-hover:text-white">{ev.title}</h4>
          </div>
          
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span 
              className="text-[10px] font-medium px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${ev.color}15`, color: ev.color, border: `1px solid ${ev.color}25` }}
            >
              {ev.category}
            </span>
            {ev.location && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 dark:text-zinc-500">
                <MapPin size={10} /> {ev.location}
              </span>
            )}
            {showDate && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto dark:text-zinc-500">
                <Calendar size={10} /> {formatShortDate(ev.date)}
              </span>
            )}
          </div>
        </div>

        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenEdit(ev); }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-700"
          >
            <Pencil size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(ev); }}
            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors dark:text-zinc-400 dark:hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </motion.div>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-emerald-500/30 dark:bg-[#09090b] dark:text-zinc-100">
      
      {/* ── MAIN WORKSPACE: Calendar Grid ───────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted dark:bg-[#0c0c0e]">
        {/* Command Header */}
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-muted/80 backdrop-blur-md sticky top-0 z-10 dark:bg-[#0c0c0e]/80 dark:border-zinc-800/60">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
              {monthNameOnly} <span className="text-muted-foreground dark:text-zinc-500">{currentYear}</span>
            </h2>
            <div className="flex items-center bg-muted rounded-md p-0.5 border border-border dark:bg-zinc-900 dark:border-zinc-800">
              <button onClick={goToPrevMonth} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800">
                <ChevronLeft size={16} />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors dark:text-zinc-300 dark:hover:text-white">
                Today
              </button>
              <button onClick={goToNextMonth} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5 border border-border dark:bg-zinc-900 dark:border-zinc-800">
              {(["All", ...ALL_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as EventCategory | "All")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterCategory === cat 
                      ? "bg-foreground text-background dark:bg-zinc-800/60 dark:text-zinc-100" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-200"
                  }`}
                >
                  {cat === "All" ? (
                    <span className="flex items-center gap-1.5">
                      <AlignLeft size={12} className={filterCategory === "All" ? "text-background dark:text-zinc-100" : "text-muted-foreground dark:text-zinc-500"} />
                      All
                    </span>
                  ) : (
                    <span>{cat}</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-md text-muted-foreground text-sm w-64 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
              <Search size={14} />
              <span className="flex-1">Search events...</span>
              <div className="flex items-center gap-0.5 text-[10px] bg-muted px-1.5 py-0.5 rounded dark:bg-zinc-800">
                <Command size={10} /> K
              </div>
            </div>
            
            <button
              onClick={() => handleOpenCreate()}
              className="flex items-center gap-2 px-4 py-2 bg-foreground hover:bg-foreground/90 text-background text-sm font-medium rounded-lg transition-all shadow-sm dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </header>

        {/* Calendar Grid Container */}
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-2xl dark:bg-[#09090b] dark:border-zinc-800/60 dark:shadow-black/50">
            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/20 dark:border-zinc-800/60 dark:bg-zinc-900/20">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-2.5 text-center text-[11px] font-semibold text-muted-foreground tracking-wider dark:text-zinc-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
              {calendarCells.map((day, idx) => {
                const isLastRow = idx >= calendarCells.length - 7;
                const isLastCol = (idx + 1) % 7 === 0;
                
                if (day === null) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      className={`bg-muted/30 dark:bg-zinc-950/30 ${!isLastRow ? 'border-b border-border/40 dark:border-zinc-800/40' : ''} ${!isLastCol ? 'border-r border-border/40 dark:border-zinc-800/40' : ''}`}
                    />
                  );
                }

                const dateStr = formatDate(currentYear, currentMonth, day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const dayEvents = eventsByDate[dateStr] || [];
                const filteredDayEvents = filterCategory === "All" 
                  ? dayEvents 
                  : dayEvents.filter((e) => e.category === filterCategory);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative min-h-[100px] p-2 cursor-pointer transition-colors group ${!isLastRow ? 'border-b border-border/40 dark:border-zinc-800/40' : ''} ${!isLastCol ? 'border-r border-border/40 dark:border-zinc-800/40' : ''} ${isSelected ? 'bg-muted/20 dark:bg-zinc-800/20' : 'hover:bg-muted/10 dark:hover:bg-zinc-900/30'}`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full z-10 ${
                        isToday 
                          ? "bg-black text-white shadow-sm" 
                          : isSelected 
                            ? "text-foreground dark:text-white" 
                            : "text-muted-foreground group-hover:text-foreground dark:text-gray-500 dark:group-hover:text-gray-300"
                      }`}>
                        {day}
                      </span>
                    </div>

                    {/* Events Display */}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-32px)] no-scrollbar relative z-10">
                      {filteredDayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(ev); }}
                          className="px-2 py-1 text-[11px] font-medium rounded truncate transition-opacity hover:opacity-80"
                          style={{ backgroundColor: `${ev.color}15`, color: ev.color }}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {filteredDayEvents.length > 3 && (
                        <div className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:text-zinc-500">
                          {filteredDayEvents.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Selection Highlight (Framer Motion) */}
                    {isSelected && (
                      <motion.div
                        layoutId="active-date"
                        className="absolute inset-0 border border-border/80 rounded-sm pointer-events-none z-0 dark:border-zinc-700/80"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL: Agenda & Timeline ──────────────────── */}
      <aside className="w-80 border-l border-border bg-muted flex flex-col hidden xl:flex dark:bg-[#0c0c0e] dark:border-zinc-800/60">
        
        {/* Selected Date Header */}
        <div className="p-6 border-b border-border dark:border-zinc-800/60">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-lg font-semibold text-foreground tracking-tight dark:text-zinc-100">
              {selectedDate ? formatShortDate(selectedDate) : "Select a date"}
            </h3>
            <span className="text-xs text-muted-foreground font-medium dark:text-zinc-500">
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-muted-foreground dark:text-zinc-500">Daily timeline & agenda</p>
        </div>

        {/* Selected Date Timeline */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {selectedDateEvents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-12 px-4"
              >
                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-3 dark:bg-zinc-900 dark:border-zinc-800">
                  <Clock size={20} className="text-muted-foreground dark:text-zinc-600" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1 dark:text-zinc-300">Schedule is clear</p>
                <p className="text-xs text-muted-foreground mb-4 dark:text-zinc-500">No events scheduled for this day.</p>
                <button 
                  onClick={() => handleOpenCreate(selectedDate!)}
                  className="text-xs font-medium text-black hover:text-gray-700 transition-colors dark:text-white dark:hover:text-gray-300"
                >
                  Add Event +
                </button>
              </motion.div>
            ) : (
              <div className="space-y-1 relative before:absolute before:inset-0 before:ml-[34px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent dark:before:via-zinc-800">
                {selectedDateEvents.map((ev, i) => (
                  <TimelineCard key={ev.id} ev={ev} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Upcoming Brief */}
        <div className="h-1/3 min-h-[250px] border-t border-border bg-card flex flex-col dark:bg-[#09090b] dark:border-zinc-800/60">
          <div className="p-4 border-b border-border/40 flex items-center justify-between dark:border-zinc-800/40">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-zinc-400">Upcoming</h3>
            <button className="text-muted-foreground hover:text-foreground transition-colors dark:text-zinc-500 dark:hover:text-zinc-300">
              <MoreHorizontal size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
             {todayAndUpcomingEvents.upcomingEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 dark:text-zinc-600">No upcoming events.</p>
             ) : (
               todayAndUpcomingEvents.upcomingEvents.map((ev, i) => (
                 <TimelineCard key={ev.id} ev={ev} index={i} showDate />
               ))
             )}
          </div>
        </div>
      </aside>

      {/* ── MODALS ────────────────────────────────────────── */}
      <CrudModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? "Edit Event" : "New Event"}
        subtitle="Schedule a production event, meeting, or personal task."
        accentColor="#000000"
      >
        <div className="space-y-4">
          <FormField label="Event Title">
            <StyledInput
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Platform Architecture Review"
              accentColor="#000000"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date">
              <StyledInput
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                accentColor="#000000"
              />
            </FormField>
            <FormField label="Category">
              <StyledSelect
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as EventCategory }))}
                accentColor="#000000"
                options={ALL_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time">
              <StyledInput
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))}
                accentColor="#000000"
              />
            </FormField>
            <FormField label="End Time">
              <StyledInput
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((p) => ({ ...p, endTime: e.target.value }))}
                accentColor="#000000"
              />
            </FormField>
          </div>

          <FormField label="Location">
            <StyledInput
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g. Remote / Zoom link"
              accentColor="#000000"
            />
          </FormField>

          <FormField label="Description">
            <StyledTextArea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional notes or agenda for this event..."
              accentColor="#000000"
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
              accentColor="#000000"
              className="flex-1"
              disabled={!formData.title.trim() || !formData.date}
            />
          </div>
        </div>
      </CrudModal>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => { if (editingEvent) remove(editingEvent.id); }}
        title="Delete Event"
        itemName={editingEvent?.title}
        message="This event will be permanently removed from your workspace."
      />
      
    </div>
  );
}