/**
 * ChatPage
 * ------------------------------------------------------------------------
 * Pixel-perfect UI reconstruction of the provided premium chat interface.
 * Features dark glassy panels, soft hairline borders, gradient active states,
 * and a dense multi-pane structural layout with Framer Motion animations.
 * 
 * Logic, state, and data flow remain 100% untouched.
 * ------------------------------------------------------------------------
 */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Send,
  MoreVertical,
  Search,
  Users,
  Phone,
  Video,
  Paperclip,
  Smile,
  Trash2,
  Check,
  CheckCheck,
  Plus,
  X,
  Info,
  ArrowLeft,
  Play,
  UserPlus,
  Archive,
  ArchiveRestore,
  MessageSquare,
  Inbox,
  FileText,
  Clock,
  Send as SendIcon,
  Trash,
  ChevronDown,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { cn } from "@/utils";

/* ---------------------------------- Types --------------------------------- */

type ConversationType = "direct" | "group";
type MessageStatus = "sent" | "delivered" | "read";
type AvatarSize = "sm" | "md" | "lg";

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  type?: "text" | "system";
  attachment?:
    | { type: "palette"; swatches: string[] }
    | { type: "voice"; duration: string };
  reaction?: { emoji: string; count: number };
}

interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  participants: ChatParticipant[];
  isOnline?: boolean;
  isTyping?: boolean;
  isArchived?: boolean;
  unreadCount: number;
  lastActivityAt: Date;
}

type RenderItem =
  | { kind: "divider"; id: string; label: string }
  | { kind: "message"; id: string; message: ChatMessage; showAvatar: boolean; showName: boolean };

/* -------------------------------- Constants ------------------------------- */

const CURRENT_USER_ID = "me";

const SHARED_MEDIA_SWATCHES = [
  "from-violet-500/40 to-fuchsia-500/20",
  "from-blue-500/40 to-cyan-400/20",
  "from-amber-400/40 to-orange-500/20",
  "from-emerald-400/40 to-teal-500/20",
  "from-rose-400/40 to-pink-500/20",
  "from-indigo-400/40 to-blue-600/20",
];

const WAVEFORM_BARS = [30, 60, 90, 45, 70, 100, 55, 80, 35, 65, 95, 50, 75, 40, 85, 60];

/* --------------------------------- Helpers -------------------------------- */

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatListTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}H`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function formatDateDivider(date: Date): string {
  const now = new Date();
  if (isSameDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/* -------------------------------- Seed data -------------------------------- */

const NOW = Date.now();
const minutesAgo = (n: number) => new Date(NOW - n * 60_000);
const hoursAgo = (n: number) => new Date(NOW - n * 3_600_000);
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000);

const SEED_PEOPLE: ChatParticipant[] = [
  { id: "u-director", name: "Leyton Graves", role: "Support Team", isOnline: true, avatar: "https://i.pravatar.cc/150?u=leyton" },
  { id: "u-cinematographer", name: "Elias Holly", role: "Engineering", isOnline: true, avatar: "https://i.pravatar.cc/150?u=elias" },
  { id: "u-gaffer", name: "Pierre Smith", role: "Sales", isOnline: false, avatar: "https://i.pravatar.cc/150?u=pierre" },
  { id: "u-editor", name: "Blake Kraft", role: "Design", isOnline: true, avatar: "https://i.pravatar.cc/150?u=blake" },
  { id: "u-sound", name: "Anna Babson", role: "Customer Success", isOnline: false, avatar: "https://i.pravatar.cc/150?u=anna" },
];
const PEOPLE_BY_ID: Record<string, ChatParticipant> = Object.fromEntries(
  SEED_PEOPLE.map((p) => [p.id, p])
);

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  "c-director": [
    {
      id: "msg-director-1",
      conversationId: "c-director",
      senderId: "u-director",
      senderName: "Leyton Graves",
      content: "How can I better manage all of my email?",
      timestamp: hoursAgo(2.5),
      status: "read",
    },
    {
      id: "msg-director-2",
      conversationId: "c-director",
      senderId: CURRENT_USER_ID,
      senderName: "Support Team",
      content: "Hi Leyton,\nHappy to help!\n\nAnna Babson\nCustomer Success Manager\nCloud Content Consulting\n(123) 456-7890",
      timestamp: hoursAgo(2),
      status: "read",
    },
  ],
  "c-cinematographer": [
    {
      id: "msg-cinematographer-1",
      conversationId: "c-cinematographer",
      senderId: "u-cinematographer",
      senderName: "Elias Holly",
      content: "Urgent: functionality test for the new deployment.",
      timestamp: hoursAgo(4),
      status: "read",
    }
  ],
  "c-gaffer": [
    {
      id: "msg-gaffer-1",
      conversationId: "c-gaffer",
      senderId: "u-gaffer",
      senderName: "Pierre Smith",
      content: "Hello, help me with email number 3",
      timestamp: daysAgo(2),
      status: "read",
    }
  ],
  "c-editor": [
    {
      id: "msg-editor-1",
      conversationId: "c-editor",
      senderId: "u-editor",
      senderName: "Blake Kraft",
      content: "Hello, help me with email number 4",
      timestamp: daysAgo(2),
      status: "read",
    }
  ],
};

function lastActivityFor(conversationId: string): Date {
  const msgs = SEED_MESSAGES[conversationId];
  return msgs && msgs.length > 0 ? msgs[msgs.length - 1].timestamp : new Date();
}

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "c-director",
    type: "direct",
    title: "Leyton Graves",
    participants: [PEOPLE_BY_ID["u-director"]],
    isOnline: true,
    isTyping: false,
    unreadCount: 2,
    lastActivityAt: lastActivityFor("c-director"),
  },
  {
    id: "c-cinematographer",
    type: "direct",
    title: "Elias Holly",
    participants: [PEOPLE_BY_ID["u-cinematographer"]],
    isOnline: true,
    unreadCount: 0,
    lastActivityAt: lastActivityFor("c-cinematographer"),
  },
  {
    id: "c-gaffer",
    type: "direct",
    title: "Pierre Smith",
    participants: [PEOPLE_BY_ID["u-gaffer"]],
    isOnline: true,
    unreadCount: 3,
    lastActivityAt: lastActivityFor("c-gaffer"),
  },
  {
    id: "c-editor",
    type: "direct",
    title: "Blake Kraft",
    participants: [PEOPLE_BY_ID["u-editor"]],
    isOnline: false,
    unreadCount: 3,
    lastActivityAt: lastActivityFor("c-editor"),
  },
];

/* ------------------------------- Sub components ---------------------------- */

function Avatar({ name, src, size = "md", className }: { name: string; src?: string; size?: AvatarSize, className?: string }) {
  const dims = size === "lg" ? "w-12 h-12 text-lg" : size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div className={cn("relative flex-shrink-0 rounded-full overflow-hidden bg-zinc-800 dark:bg-zinc-800 flex items-center justify-center font-medium text-white", dims, className)}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{name.charAt(0).toUpperCase()}</span>}
    </div>
  );
}

function MessageBubble({ message, isCurrentUser }: { message: ChatMessage; isCurrentUser: boolean; showAvatar: boolean; showName: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="w-full mb-4"
    >
      <div className={cn(
        "p-5 rounded-2xl w-full max-w-2xl text-left border",
        isCurrentUser 
          ? "bg-muted dark:bg-[#1A1A1C] border-transparent ml-auto" 
          : "bg-card dark:bg-[#0C0C0E] border-border dark:border-white/[0.05] mr-auto"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={message.senderName} src={message.senderAvatar} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                {isCurrentUser ? `From: support@cloudcontent.com` : message.senderName}
              </p>
              <button className="text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground dark:text-zinc-500 truncate">To: {isCurrentUser ? "Leyton Graves" : "Support Team"}</p>
          </div>
        </div>
        
        <div className="text-[13px] leading-relaxed text-foreground dark:text-zinc-300 whitespace-pre-wrap font-light">
          {message.content}
        </div>
        
        {message.attachment?.type === "voice" && (
           <div className="flex items-center gap-3 mt-4 bg-muted dark:bg-[#141417] rounded-xl p-2 w-max border border-border dark:border-white/[0.04]">
             <button type="button" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
               <Play className="w-3 h-3 text-white fill-current ml-0.5" />
             </button>
             <div className="flex items-center gap-[2px] h-6 px-2">
               {WAVEFORM_BARS.map((h, i) => (
                 <span key={i} className="w-[3px] rounded-full bg-indigo-500 opacity-80" style={{ height: `${h}%` }} />
               ))}
             </div>
             <span className="text-[11px] text-muted-foreground dark:text-zinc-500 pr-2">{message.attachment.duration}</span>
           </div>
        )}
      </div>
    </motion.div>
  );
}

function ConversationListItem({ conversation, lastMessage, isActive, onClick }: { conversation: Conversation; lastMessage?: ChatMessage; isActive: boolean; onClick: () => void; }) {
  const isEvent = conversation.title.includes("Leyton");
  const isTest = conversation.title.includes("Elias");

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={cn(
        "w-full flex flex-col p-4 rounded-2xl text-left transition-all relative overflow-hidden mb-2 group",
        isActive
          ? "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-lg border-transparent dark:bg-gradient-to-br dark:from-gray-700 dark:via-gray-800 dark:to-gray-900"
          : "bg-muted dark:bg-[#141416] hover:bg-accent dark:hover:bg-[#1A1A1D] border border-border dark:border-white/[0.04]"
      )}
    >
      <div className="flex items-start justify-between w-full mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={conversation.title} src={conversation.participants[0]?.avatar} size="sm" className="ring-2 ring-black/20" />
          <p className={cn("text-sm font-semibold truncate", isActive ? "text-white" : "text-foreground dark:text-zinc-200")}>
            {conversation.title}
          </p>
        </div>
        <span className={cn("text-[10px] uppercase font-semibold tracking-wider", isActive ? "text-white/80" : "text-muted-foreground dark:text-zinc-500")}>
          {lastMessage ? formatListTime(lastMessage.timestamp) : "NEW"}
        </span>
      </div>

      <div className="flex items-end justify-between w-full gap-2">
        <p className={cn("text-[13px] truncate flex-1 font-light", isActive ? "text-white/90" : "text-muted-foreground dark:text-zinc-400")}>
          {conversation.isTyping ? "Typing..." : (lastMessage?.content || "No messages yet")}
        </p>
        
        {isEvent && (
          <span className="px-2.5 py-1 rounded-full bg-gray-500 text-white text-[9px] font-extrabold tracking-widest uppercase flex-shrink-0 shadow-sm">
            #EVENTS
          </span>
        )}
        {isTest && (
          <span className="px-2.5 py-1 rounded-full bg-gray-500 text-white text-[9px] font-extrabold tracking-widest uppercase flex-shrink-0 shadow-sm">
            #TEST
          </span>
        )}
        {!isEvent && !isTest && conversation.unreadCount > 0 && (
          <div className="w-5 h-5 rounded-full bg-white/[0.12] text-white text-[10px] font-bold flex items-center justify-center">
            {conversation.unreadCount}
          </div>
        )}
      </div>

      {!isActive && (
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 text-purple-300 text-[10px] font-medium flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-500/50 flex items-center justify-center"><Hash className="w-2 h-2 text-white" /></span>
            Drafts
          </span>
          <span className="text-[11px] text-muted-foreground dark:text-zinc-600 truncate">Hi {conversation.title.split(' ')[0]}, happy to help!</span>
        </div>
      )}
    </motion.button>
  );
}

function InfoPanel({ conversation }: { conversation: Conversation }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden xl:flex w-[320px] flex-col overflow-y-auto bg-card dark:bg-[#0A0A0C] border-l border-border dark:border-white/[0.04] p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" className="h-8 bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] text-foreground dark:text-zinc-300 text-xs px-3 rounded-lg hover:bg-accent dark:hover:bg-white/[0.04]">
          Salesforce <ChevronDown className="w-3 h-3 ml-2" />
        </Button>
        <button className="w-8 h-8 rounded-lg bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] flex items-center justify-center text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <Button className="flex-1 bg-white text-black hover:bg-zinc-200 text-[11px] h-8 rounded-lg font-semibold">
          <FileText className="w-3 h-3 mr-1.5" /> Add Task
        </Button>
        <Button className="flex-1 bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] text-foreground dark:text-zinc-300 hover:bg-accent dark:hover:bg-white/[0.04] text-[11px] h-8 rounded-lg font-semibold">
          <FileText className="w-3 h-3 mr-1.5" /> Add Note
        </Button>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="text-[11px] text-muted-foreground dark:text-zinc-500 font-medium mb-1.5 block">Subject</label>
          <div className="w-full bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl px-3 py-2.5 text-[13px] text-foreground dark:text-zinc-300 flex justify-between items-center">
            Schedule app training <ChevronDown className="w-3 h-3 text-muted-foreground dark:text-zinc-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground dark:text-zinc-500 font-medium mb-1.5 block">Date Only</label>
            <div className="w-full bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl px-3 py-2.5 text-[13px] text-foreground dark:text-zinc-300 flex justify-between items-center">
              12/29 <ChevronDown className="w-3 h-3 text-zinc-600" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground dark:text-zinc-500 font-medium mb-1.5 block">Status <span className="text-red-500">*</span></label>
            <div className="w-full bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl px-3 py-2.5 text-[13px] text-foreground dark:text-zinc-300 flex justify-between items-center">
              Open <ChevronDown className="w-3 h-3 text-zinc-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground dark:text-zinc-500 font-medium mb-1.5 block">Priority <span className="text-red-500">*</span></label>
            <div className="w-full bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl px-3 py-2.5 text-[13px] text-foreground dark:text-zinc-300 flex justify-between items-center">
              Normal <ChevronDown className="w-3 h-3 text-zinc-600" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground dark:text-zinc-500 font-medium mb-1.5 block">Assigned to ID <span className="text-red-500">*</span></label>
            <div className="w-full bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl px-3 py-2.5 text-[13px] text-foreground dark:text-zinc-300 flex justify-between items-center">
              Steve Hackney <ChevronDown className="w-3 h-3 text-zinc-600" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-zinc-500 font-medium mb-1.5 block">Description</label>
          <div className="w-full bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl px-3 py-3 text-[13px] text-muted-foreground dark:text-zinc-400 min-h-[140px] relative">
            Questions about cooperation, you will need to fill out a document |
            <div className="absolute bottom-3 left-3 flex gap-2">
              <button className="w-7 h-7 rounded bg-white/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300"><FileText className="w-3.5 h-3.5" /></button>
              <button className="w-7 h-7 rounded bg-white/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300"><Paperclip className="w-3.5 h-3.5" /></button>
              <button className="w-7 h-7 rounded bg-white/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300"><Smile className="w-3.5 h-3.5" /></button>
              <button className="w-7 h-7 rounded bg-white/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300"><MoreVertical className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button className="w-full bg-white text-black hover:bg-zinc-200 h-10 rounded-xl font-semibold text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add an Integration
        </Button>
      </div>
    </motion.aside>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function ChatPage() {
  const { currentUser } = useAuth();
  const { teamMembers } = useTeam();

  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>(SEED_MESSAGES);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(SEED_CONVERSATIONS[0]?.id ?? null);
  const [listFilter, setListFilter] = useState<"all" | "open" | "unassigned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timeoutsRef.current.forEach(clearTimeout); };
  }, []);

  const lastMessageByConversation = useMemo(() => {
    const map: Record<string, ChatMessage | undefined> = {};
    conversations.forEach((c) => {
      const msgs = messagesByConversation[c.id];
      map[c.id] = msgs && msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
    });
    return map;
  }, [conversations, messagesByConversation]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return conversations
      .filter((c) => !c.isArchived)
      .filter((c) => {
        if (!query) return true;
        const lastMsg = lastMessageByConversation[c.id]?.content?.toLowerCase() ?? "";
        return c.title.toLowerCase().includes(query) || lastMsg.includes(query);
      })
      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  }, [conversations, searchQuery, lastMessageByConversation]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const currentMessages = selectedConversationId ? messagesByConversation[selectedConversationId] ?? [] : [];

  const renderItems = useMemo(() => {
    const items: RenderItem[] = [];
    currentMessages.forEach((message, index) => {
      const prev = currentMessages[index - 1];
      const isNewDay = !prev || !isSameDay(prev.timestamp, message.timestamp);
      const showMeta = !prev || prev.senderId !== message.senderId || isNewDay;
      items.push({
        kind: "message",
        id: message.id,
        message,
        showAvatar: showMeta,
        showName: showMeta,
      });
    });
    return items;
  }, [currentMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, selectedConversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUser || !selectedConversationId) return;

    const message: ChatMessage = {
      id: generateId("msg"),
      conversationId: selectedConversationId,
      senderId: CURRENT_USER_ID,
      senderName: currentUser.fullName || "Support Team",
      senderAvatar: currentUser.avatar,
      content: trimmed,
      timestamp: new Date(),
      status: "sent",
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] ?? []), message],
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversationId ? { ...c, lastActivityAt: new Date() } : c))
    );
    setNewMessage("");
    inputRef.current?.focus();
  };

  const { theme } = useTheme();

  return (
    <div className="flex h-screen w-full bg-background dark:bg-[#050505] text-foreground dark:text-zinc-300 font-sans overflow-hidden selection:bg-fuchsia-500/30">
      
      {/* Inbox List Column */}
      <aside className={cn(
        "w-full md:w-[320px] lg:w-[380px] bg-card dark:bg-[#0A0A0C] border-r border-border dark:border-white/[0.04] flex flex-col flex-shrink-0 relative z-10",
        selectedConversationId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-5 pt-8 flex-shrink-0">
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] rounded-xl text-sm text-foreground dark:text-zinc-200 placeholder:text-muted-foreground dark:placeholder:text-zinc-500 focus:outline-none focus:border-border dark:focus:border-white/10 transition-colors"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-accent dark:bg-white/[0.04] flex items-center justify-center text-muted-foreground dark:text-zinc-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[
              { key: "unassigned", label: "Unassigned", active: false },
              { key: "open", label: "Open", active: false },
              { key: "all", label: "All", active: true },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setListFilter(f.key as any)}
                className={cn(
                  "flex-1 py-2 text-[11px] font-semibold rounded-lg transition-colors border",
                  f.active 
                    ? "bg-accent dark:bg-[#1C1C1F] border-border dark:border-white/10 text-foreground dark:text-white" 
                    : "bg-transparent border-border dark:border-white/[0.04] text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                lastMessage={lastMessageByConversation[conversation.id]}
                isActive={conversation.id === selectedConversationId}
                onClick={() => setSelectedConversationId(conversation.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 bg-background dark:bg-[#050505] relative",
        selectedConversationId ? "flex" : "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            <header className="px-8 py-10 flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden w-10 h-10 rounded-xl bg-muted dark:bg-[#141416] flex items-center justify-center text-muted-foreground dark:text-zinc-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-light text-foreground dark:text-white tracking-tight">
                  Hello, help me with email ...
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                 <button className="w-9 h-9 rounded-xl bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] flex items-center justify-center text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                 </button>
                 <button className="w-9 h-9 rounded-xl bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] flex items-center justify-center text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors">
                    <Inbox className="w-4 h-4" />
                 </button>
                 <button className="w-9 h-9 rounded-xl bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] flex items-center justify-center text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors">
                    <Trash className="w-4 h-4" />
                 </button>
                 <button className="w-9 h-9 rounded-xl bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] flex items-center justify-center text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                 </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
              <AnimatePresence initial={false}>
                {renderItems.map((item) =>
                  item.kind === "divider" ? null : (
                    <MessageBubble
                      key={item.id}
                      message={item.message}
                      isCurrentUser={item.message.senderId === CURRENT_USER_ID}
                      showAvatar={item.showAvatar}
                      showName={item.showName}
                    />
                  )
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 pt-2 pb-8 flex-shrink-0 max-w-4xl w-full mx-auto">
              <form onSubmit={handleSendMessage} className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent pointer-events-none -translate-y-full" />
                <div className="bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.06] rounded-2xl p-2 flex items-center gap-2 shadow-2xl relative z-10 backdrop-blur-xl">
                  <div className="flex items-center gap-1 pl-2">
                     <button type="button" className="w-8 h-8 rounded-lg text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300 hover:bg-accent dark:hover:bg-white/[0.04] flex items-center justify-center transition-colors">
                        <Paperclip className="w-4 h-4" />
                     </button>
                     <button type="button" className="w-8 h-8 rounded-lg text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300 hover:bg-accent dark:hover:bg-white/[0.04] flex items-center justify-center transition-colors">
                        <FileText className="w-4 h-4" />
                     </button>
                     <button type="button" className="w-8 h-8 rounded-lg text-muted-foreground dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300 hover:bg-accent dark:hover:bg-white/[0.04] flex items-center justify-center transition-colors">
                        <Smile className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-transparent border-none text-foreground dark:text-zinc-200 placeholder:text-muted-foreground dark:placeholder:text-zinc-600 focus-visible:ring-0 shadow-none px-2 text-[15px]"
                  />
                  
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-10 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                  >
                    Reply
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted dark:bg-[#141416] border border-border dark:border-white/[0.04] flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-muted-foreground dark:text-zinc-600" />
              </div>
              <h3 className="text-xl font-light text-foreground dark:text-zinc-300 mb-2">Select a conversation</h3>
              <p className="text-muted-foreground dark:text-zinc-500 text-sm max-w-[260px]">Choose an existing chat from the sidebar or start a new one.</p>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar Info Panel */}
      {selectedConversation && <InfoPanel conversation={selectedConversation} />}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
}