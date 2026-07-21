/**
 * ChatPage
 * ------------------------------------------------------------------------
 * Redesigned team chat experience — dark, glassy panels with soft hairline
 * borders and colorful accent gradients, restyled after the reference chat
 * UI kit. Supports both direct (1:1) conversations and group conversations
 * from a single inbox, with the ability to start new chats of either kind.
 *
 * Data note: the previous `useChat()` (ChatContext) only exposed a single
 * flat message list, which can't represent multiple conversations. Until
 * ChatContext grows a conversation-aware API, this page manages
 * conversations + messages in local state, seeded with sample data (and
 * uses real `teamMembers` from TeamContext for the "start new chat" roster
 * whenever it's available). Swap SEED_CONVERSATIONS / SEED_MESSAGES and the
 * state setters below for real API calls when the backend is ready.
 * ------------------------------------------------------------------------
 */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useTheme } from "next-themes";
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

const AVATAR_GRADIENTS = [
  "from-violet-500/30 to-fuchsia-500/10",
  "from-blue-500/30 to-cyan-500/10",
  "from-emerald-500/30 to-teal-500/10",
  "from-amber-500/30 to-orange-500/10",
  "from-rose-500/30 to-pink-500/10",
  "from-indigo-500/30 to-sky-500/10",
];

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

function getAvatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
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
  if (diffHours < 24) return `${diffHours}h`;
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
  { id: "u-director", name: "Abebe Bikila", role: "Director", isOnline: true },
  { id: "u-cinematographer", name: "Dawit Ibrahim", role: "Cinematographer", isOnline: true },
  { id: "u-gaffer", name: "Kaleb Tesfaye", role: "Gaffer", isOnline: false },
  { id: "u-editor", name: "Hanna Solomon", role: "Editor", isOnline: true },
  { id: "u-sound", name: "Mikael Alemu", role: "Sound Engineer", isOnline: false },
  { id: "u-producer", name: "Sara Bekele", role: "Producer", isOnline: true },
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
      senderName: "Abebe Bikila",
      content: "Hey! Did you get a chance to review the storyboard for the upcoming commercial?",
      timestamp: minutesAgo(42),
      status: "read",
    },
    {
      id: "msg-director-2",
      conversationId: "c-director",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "Just reviewed it — the opening sequence looks fantastic",
      timestamp: minutesAgo(38),
      status: "read",
    },
    {
      id: "msg-director-3",
      conversationId: "c-director",
      senderId: "u-director",
      senderName: "Abebe Bikila",
      content: "Great! I'm thinking we should adjust the lighting setup for scene 3",
      timestamp: minutesAgo(35),
      status: "read",
    },
    {
      id: "msg-director-4",
      conversationId: "c-director",
      senderId: "u-director",
      senderName: "Abebe Bikila",
      content: "Here's the color palette I'm considering for the mood",
      timestamp: minutesAgo(33),
      status: "read",
      attachment: { type: "palette", swatches: SHARED_MEDIA_SWATCHES.slice(0, 4) },
      reaction: { emoji: "🎬", count: 1 },
    },
    {
      id: "msg-director-5",
      conversationId: "c-director",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "These work perfectly, the warm tones match our vision",
      timestamp: minutesAgo(30),
      status: "read",
    },
    {
      id: "msg-director-6",
      conversationId: "c-director",
      senderId: "u-director",
      senderName: "Abebe Bikila",
      content: "",
      timestamp: minutesAgo(20),
      status: "read",
      attachment: { type: "voice", duration: "0:47" },
    },
    {
      id: "msg-director-7",
      conversationId: "c-director",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "Sending you the revised shot list in a sec",
      timestamp: minutesAgo(5),
      status: "sent",
    },
  ],
  "c-production-team": [
    {
      id: "msg-production-1",
      conversationId: "c-production-team",
      senderId: "system",
      senderName: "System",
      content: "Sara created the group",
      timestamp: daysAgo(2),
      status: "read",
      type: "system",
    },
    {
      id: "msg-production-2",
      conversationId: "c-production-team",
      senderId: "u-producer",
      senderName: "Sara Bekele",
      content: "Starting production coordination for the documentary shoot �",
      timestamp: daysAgo(2),
      status: "read",
    },
    {
      id: "msg-production-3",
      conversationId: "c-production-team",
      senderId: "u-cinematographer",
      senderName: "Dawit Ibrahim",
      content: "I'll prepare the camera equipment checklist today",
      timestamp: hoursAgo(46),
      status: "read",
    },
    {
      id: "msg-production-4",
      conversationId: "c-production-team",
      senderId: "u-producer",
      senderName: "Sara Bekele",
      content: "Let's aim to have all gear ready by Friday",
      timestamp: hoursAgo(24),
      status: "read",
    },
    {
      id: "msg-production-5",
      conversationId: "c-production-team",
      senderId: "u-cinematographer",
      senderName: "Dawit Ibrahim",
      content: "Camera package is ready for pickup",
      timestamp: hoursAgo(18),
      status: "read",
    },
    {
      id: "msg-production-6",
      conversationId: "c-production-team",
      senderId: "u-producer",
      senderName: "Sara Bekele",
      content: "Perfect! Let's do this 🎥",
      timestamp: hoursAgo(17),
      status: "read",
    },
  ],
  "c-cinematographer": [
    {
      id: "msg-cinematographer-1",
      conversationId: "c-cinematographer",
      senderId: "u-cinematographer",
      senderName: "Dawit Ibrahim",
      content: "Hey, are you free for a quick call about the lens selection?",
      timestamp: hoursAgo(3),
      status: "read",
    },
    {
      id: "msg-cinematographer-2",
      conversationId: "c-cinematographer",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "Yeah, give me 10 minutes",
      timestamp: hoursAgo(3),
      status: "read",
    },
    {
      id: "msg-cinematographer-3",
      conversationId: "c-cinematographer",
      senderId: "u-cinematographer",
      senderName: "Dawit Ibrahim",
      content: "Sounds good 👍",
      timestamp: hoursAgo(3),
      status: "read",
    },
  ],
  "c-post-production": [
    {
      id: "msg-post-1",
      conversationId: "c-post-production",
      senderId: "u-editor",
      senderName: "Hanna Solomon",
      content: "First edit of the commercial is ready for review",
      timestamp: hoursAgo(26),
      status: "read",
    },
    {
      id: "msg-post-2",
      conversationId: "c-post-production",
      senderId: "u-sound",
      senderName: "Mikael Alemu",
      content: "I'll add the sound design this afternoon",
      timestamp: hoursAgo(20),
      status: "read",
    },
  ],
  "c-editor": [
    {
      id: "msg-editor-1",
      conversationId: "c-editor",
      senderId: "u-editor",
      senderName: "Hanna Solomon",
      content: "Thanks for the quick turnaround on the footage!",
      timestamp: daysAgo(5),
      status: "read",
    },
    {
      id: "msg-editor-2",
      conversationId: "c-editor",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "Anytime! Let me know if you need anything else",
      timestamp: daysAgo(5),
      status: "read",
    },
  ],
  "c-gaffer": [
    {
      id: "msg-gaffer-1",
      conversationId: "c-gaffer",
      senderId: "u-gaffer",
      senderName: "Kaleb Tesfaye",
      content: "Lighting setup for the studio shoot is complete",
      timestamp: daysAgo(7),
      status: "read",
    },
    {
      id: "msg-gaffer-2",
      conversationId: "c-gaffer",
      senderId: "u-gaffer",
      senderName: "Kaleb Tesfaye",
      content: "Also tested the backup generators",
      timestamp: daysAgo(7),
      status: "read",
    },
    {
      id: "msg-gaffer-3",
      conversationId: "c-gaffer",
      senderId: "u-gaffer",
      senderName: "Kaleb Tesfaye",
      content: "Let me know if you need any adjustments",
      timestamp: daysAgo(6),
      status: "read",
    },
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
    title: "Abebe Bikila",
    participants: [PEOPLE_BY_ID["u-director"]],
    isOnline: true,
    isTyping: true,
    unreadCount: 0,
    lastActivityAt: lastActivityFor("c-director"),
  },
  {
    id: "c-production-team",
    type: "group",
    title: "Production Team",
    participants: [PEOPLE_BY_ID["u-producer"], PEOPLE_BY_ID["u-cinematographer"], PEOPLE_BY_ID["u-director"]],
    unreadCount: 2,
    lastActivityAt: lastActivityFor("c-production-team"),
  },
  {
    id: "c-cinematographer",
    type: "direct",
    title: "Dawit Ibrahim",
    participants: [PEOPLE_BY_ID["u-cinematographer"]],
    isOnline: true,
    unreadCount: 0,
    lastActivityAt: lastActivityFor("c-cinematographer"),
  },
  {
    id: "c-post-production",
    type: "group",
    title: "Post-Production",
    participants: [PEOPLE_BY_ID["u-editor"], PEOPLE_BY_ID["u-sound"]],
    unreadCount: 1,
    lastActivityAt: lastActivityFor("c-post-production"),
  },
  {
    id: "c-editor",
    type: "direct",
    title: "Hanna Solomon",
    participants: [PEOPLE_BY_ID["u-editor"]],
    isOnline: false,
    unreadCount: 0,
    lastActivityAt: lastActivityFor("c-editor"),
  },
  {
    id: "c-gaffer",
    type: "direct",
    title: "Kaleb Tesfaye",
    participants: [PEOPLE_BY_ID["u-gaffer"]],
    isOnline: true,
    unreadCount: 3,
    lastActivityAt: lastActivityFor("c-gaffer"),
  },
];

/* ------------------------------- Sub components ---------------------------- */

const AVATAR_SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

function Avatar({
  name,
  src,
  size = "md",
  gradient = "from-primary/20 to-primary/5",
  online,
}: {
  name: string;
  src?: string;
  size?: AvatarSize;
  gradient?: string;
  online?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          "rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br font-semibold ring-1",
          AVATAR_SIZE_CLASSES[size],
          gradient,
          theme === "dark" ? "text-zinc-100 ring-white/10" : "text-zinc-900 ring-zinc-200"
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2",
            size === "lg" ? "w-4 h-4" : "w-2.5 h-2.5",
            online ? "bg-emerald-500" : "bg-zinc-600",
            theme === "dark" ? "border-zinc-950" : "border-white"
          )}
        />
      )}
    </div>
  );
}

function GroupAvatar({ participants, size = "md" }: { participants: ChatParticipant[]; size?: AvatarSize }) {
  const shown = participants.slice(0, 2);
  const dims = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const innerDims = size === "lg" ? "w-10 h-10 text-sm" : size === "sm" ? "w-5 h-5 text-[9px]" : "w-6 h-6 text-[10px]";

  if (shown.length === 0) {
    return (
      <div className={cn("rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0", dims)}>
        <Users className="w-1/2 h-1/2 text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("relative flex-shrink-0", dims)}>
      {shown.map((p, i) => (
        <div
          key={p.id}
          className={cn(
            "absolute rounded-full ring-2 ring-zinc-950 overflow-hidden bg-gradient-to-br flex items-center justify-center font-semibold text-zinc-100",
            innerDims,
            getAvatarGradient(p.id),
            i === 0 ? "top-0 left-0 z-10" : "bottom-0 right-0"
          )}
        >
          {p.avatar ? (
            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <span>{p.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TypingBubble({ participant }: { participant?: ChatParticipant }) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2.5 mr-auto max-w-[85%] sm:max-w-md"
    >
      <div className="w-8 flex-shrink-0 self-end">
        <Avatar
          name={participant?.name ?? "?"}
          src={participant?.avatar}
          size="sm"
          gradient={getAvatarGradient(participant?.id ?? "typing")}
        />
      </div>
      <div className={cn(
        "px-4 py-3.5 rounded-2xl rounded-bl-md flex items-center gap-1",
        theme === "dark" ? "bg-white/[0.06] border border-white/[0.08]" : "bg-zinc-100 border border-zinc-200"
      )}>
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
      </div>
    </motion.div>
  );
}

function MessageBubble({
  message,
  isCurrentUser,
  showAvatar,
  showName,
}: {
  message: ChatMessage;
  isCurrentUser: boolean;
  showAvatar: boolean;
  showName: boolean;
}) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn("flex gap-2.5 max-w-[85%] sm:max-w-md", isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto")}
    >
      <div className="w-8 flex-shrink-0 self-end">
        {showAvatar && !isCurrentUser && (
          <Avatar
            name={message.senderName}
            src={message.senderAvatar}
            size="sm"
            gradient={getAvatarGradient(message.senderId)}
          />
        )}
      </div>
      <div className={cn("flex flex-col min-w-0", isCurrentUser ? "items-end" : "items-start")}>
        {showName && <p className="text-xs font-semibold text-primary mb-1 px-1">{message.senderName}</p>}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl",
            isCurrentUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : theme === "dark" ? "bg-white/[0.06] border border-white/[0.08] text-zinc-100 rounded-bl-md" : "bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-bl-md"
          )}
        >
          {message.attachment && message.attachment.type === "palette" && (
            <div className="grid grid-cols-4 gap-1.5 w-40 mb-2">
              {message.attachment.swatches.map((gradient, i) => (
                <div key={i} className={cn("aspect-square rounded-lg bg-gradient-to-br", gradient)} />
              ))}
            </div>
          )}
          {message.attachment && message.attachment.type === "voice" && (
            <div className="flex items-center gap-2 w-44">
              <button
                type="button"
                aria-label="Play voice message"
                className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
              <div className="flex items-center gap-0.5 flex-1 h-5">
                {WAVEFORM_BARS.map((h, i) => (
                  <span key={i} className="w-0.5 rounded-full bg-current opacity-60" style={{ height: `${h}%` }} />
                ))}
              </div>
              <span className="text-[10px] opacity-70 flex-shrink-0">{message.attachment.duration}</span>
            </div>
          )}
          {message.content && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>}
        </div>
        {message.reaction && (
          <span className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
            theme === "dark" ? "bg-white/[0.06] border border-white/[0.08] text-zinc-300" : "bg-zinc-100 border border-zinc-200 text-zinc-600"
          )}>
            <span>{message.reaction.emoji}</span>
            {message.reaction.count > 1 && <span>{message.reaction.count}</span>}
          </span>
        )}
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-zinc-500">{formatMessageTime(message.timestamp)}</span>
          {isCurrentUser &&
            (message.status === "read" ? (
              <CheckCheck className="w-3 h-3 text-primary" />
            ) : (
              <Check className="w-3 h-3 text-zinc-500" />
            ))}
        </div>
      </div>
    </motion.div>
  );
}

function ConversationListItem({
  conversation,
  lastMessage,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  lastMessage?: ChatMessage;
  isActive: boolean;
  onClick: () => void;
}) {
  const { theme } = useTheme();
  const isGroup = conversation.type === "group";
  const attachmentLabel =
    lastMessage?.attachment?.type === "voice"
      ? "🎤 Voice message"
      : lastMessage?.attachment?.type === "palette"
      ? "🎨 Shared a palette"
      : "";
  const preview = conversation.isTyping
    ? "Typing…"
    : lastMessage
    ? `${lastMessage.senderId === CURRENT_USER_ID ? "You: " : ""}${lastMessage.content || attachmentLabel}`
    : "No messages yet";

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
        isActive ? "bg-primary/10 border border-primary/20" : theme === "dark" ? "hover:bg-white/[0.04] border border-transparent" : "hover:bg-zinc-100 border border-transparent"
      )}
    >
      {isGroup ? (
        <GroupAvatar participants={conversation.participants} />
      ) : (
        <Avatar
          name={conversation.title}
          src={conversation.participants[0]?.avatar}
          online={conversation.isOnline}
          gradient={getAvatarGradient(conversation.id)}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-medium truncate", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>{conversation.title}</p>
          {lastMessage && (
            <span className={cn("text-[10px] flex-shrink-0", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{formatListTime(lastMessage.timestamp)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn("text-xs truncate", conversation.isTyping ? "text-primary italic" : theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>
            {preview}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function InfoPanel({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  const { theme } = useTheme();
  const isGroup = conversation.type === "group";
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "hidden lg:flex w-80 border-l flex-col overflow-y-auto flex-shrink-0",
        theme === "dark" ? "border-white/[0.06] bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"
      )}
    >
      <div className={cn("p-4 border-b flex items-center justify-between flex-shrink-0", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
        <h3 className={cn("text-sm font-semibold", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>{isGroup ? "Group info" : "Contact info"}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close info panel"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={cn("p-6 flex flex-col items-center text-center border-b", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
        {isGroup ? (
          <GroupAvatar participants={conversation.participants} size="lg" />
        ) : (
          <Avatar
            name={conversation.title}
            src={conversation.participants[0]?.avatar}
            gradient={getAvatarGradient(conversation.id)}
            online={conversation.isOnline}
            size="lg"
          />
        )}
        <h4 className={cn("mt-3 text-base font-semibold", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>{conversation.title}</h4>
        {!isGroup && conversation.participants[0]?.role && (
          <p className={cn("text-xs mt-0.5", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{conversation.participants[0].role}</p>
        )}
        {isGroup && <p className={cn("text-xs mt-0.5", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{conversation.participants.length} members</p>}
        {!isGroup && (
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 text-xs",
              conversation.isOnline ? "text-emerald-500" : theme === "dark" ? "text-zinc-500" : "text-zinc-400"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", conversation.isOnline ? "bg-emerald-500" : "bg-zinc-600")} />
            {conversation.isOnline ? "Active now" : "Offline"}
          </span>
        )}
      </div>

      {isGroup && (
        <div className={cn("p-4 border-b", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
          <h5 className={cn("text-xs font-semibold uppercase tracking-wider mb-3", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>
            Members — {conversation.participants.length}
          </h5>
          <div className="space-y-1">
            {conversation.participants.map((p) => (
              <div key={p.id} className={cn("flex items-center gap-3 p-2 rounded-lg", theme === "dark" ? "hover:bg-white/[0.04]" : "hover:bg-zinc-100")}>
                <Avatar name={p.name} src={p.avatar} online={p.isOnline} size="sm" gradient={getAvatarGradient(p.id)} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm truncate", theme === "dark" ? "text-zinc-200" : "text-zinc-700")}>{p.name}</p>
                  {p.role && <p className={cn("text-xs truncate", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{p.role}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <h5 className={cn("text-xs font-semibold uppercase tracking-wider mb-3", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>Shared media</h5>
        <div className="grid grid-cols-3 gap-2">
          {SHARED_MEDIA_SWATCHES.map((gradient, i) => (
            <div key={i} className={cn("aspect-square rounded-xl bg-gradient-to-br", gradient)} />
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

function NewChatModal({
  people,
  onClose,
  onCreateDirect,
  onCreateGroup,
}: {
  people: ChatParticipant[];
  onClose: () => void;
  onCreateDirect: (person: ChatParticipant) => void;
  onCreateGroup: (name: string, members: ChatParticipant[]) => void;
}) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const filteredPeople = people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreateGroupClick = () => {
    const members = people.filter((p) => selectedIds.includes(p.id));
    if (members.length < 2) return;
    onCreateGroup(groupName, members);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]",
          theme === "dark" ? "bg-zinc-900 border-white/[0.08]" : "bg-white border-zinc-200"
        )}
      >
        <div className={cn("p-4 border-b flex items-center justify-between flex-shrink-0", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
          <h3 className={cn("text-sm font-semibold", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>New conversation</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn("w-7 h-7 rounded-lg flex items-center justify-center", theme === "dark" ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={cn("p-4 space-y-3 flex-shrink-0 border-b", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
          <div className={cn("flex items-center gap-1.5 p-1 rounded-xl", theme === "dark" ? "bg-white/[0.03]" : "bg-zinc-100")}>
            <button
              type="button"
              onClick={() => setMode("direct")}
              className={cn(
                "flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors",
                mode === "direct" ? "bg-primary text-primary-foreground" : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              Direct message
            </button>
            <button
              type="button"
              onClick={() => setMode("group")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-colors",
                mode === "group" ? "bg-primary text-primary-foreground" : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              New group
            </button>
          </div>

          {mode === "group" && (
            <Input
              placeholder="Group name (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={cn(
                "h-9 text-sm placeholder:text-zinc-500",
                theme === "dark" ? "bg-white/[0.03] border-white/[0.08] text-zinc-200" : "bg-white border-zinc-200 text-zinc-900"
              )}
            />
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "pl-9 h-9 text-sm placeholder:text-zinc-500",
                theme === "dark" ? "bg-white/[0.03] border-white/[0.08] text-zinc-200" : "bg-white border-zinc-200 text-zinc-900"
              )}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredPeople.length === 0 ? (
            <p className={cn("text-center text-sm py-8", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>No people found</p>
          ) : (
            filteredPeople.map((person) => {
              const isSelected = selectedIds.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => (mode === "direct" ? onCreateDirect(person) : toggleSelected(person.id))}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left",
                    theme === "dark" ? "hover:bg-white/[0.04]" : "hover:bg-zinc-100"
                  )}
                >
                  <Avatar
                    name={person.name}
                    src={person.avatar}
                    online={person.isOnline}
                    gradient={getAvatarGradient(person.id)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>{person.name}</p>
                    {person.role && <p className={cn("text-xs truncate", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{person.role}</p>}
                  </div>
                  {mode === "group" && (
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-primary border-primary" : theme === "dark" ? "border-white/20" : "border-zinc-300"
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {mode === "group" && (
          <div className={cn("p-4 border-t flex-shrink-0", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
            <Button
              onClick={handleCreateGroupClick}
              disabled={selectedIds.length < 2}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
            >
              Create group {selectedIds.length > 0 && `(${selectedIds.length})`}
            </Button>
            {selectedIds.length === 1 && (
              <p className={cn("text-xs text-center mt-2", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>Select at least one more person</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function EmptyConversationState({ onNewChat }: { onNewChat: () => void }) {
  const { theme } = useTheme();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
      <div className={cn(
        "w-20 h-20 rounded-3xl flex items-center justify-center mb-5",
        theme === "dark" ? "bg-white/[0.03] border border-white/[0.06]" : "bg-zinc-100 border border-zinc-200"
      )}>
        <MessageSquare className={cn("w-9 h-9", theme === "dark" ? "text-zinc-600" : "text-zinc-400")} />
      </div>
      <h3 className={cn("text-lg font-semibold mb-2", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>Your messages</h3>
      <p className={cn("text-sm max-w-xs mb-5", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>
        Select a conversation from the list, or start a new one to get chatting.
      </p>
      <Button onClick={onNewChat} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Plus className="w-4 h-4 mr-2" />
        New conversation
      </Button>
    </div>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function ChatPage() {
  const { currentUser } = useAuth();
  const { teamMembers } = useTeam();
  const { theme } = useTheme();

  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>(SEED_MESSAGES);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(SEED_CONVERSATIONS[0]?.id ?? null);
  const [listFilter, setListFilter] = useState<"all" | "direct" | "group">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen]);

  const roster: ChatParticipant[] = useMemo(() => {
    if (teamMembers && teamMembers.length > 0) {
      return teamMembers
        .filter((m) => m.id !== currentUser?.id)
        .map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: m.role,
          isOnline: m.status === "Available",
        }));
    }
    return SEED_PEOPLE;
  }, [teamMembers, currentUser?.id]);

  const onlineCount =
    teamMembers && teamMembers.length > 0
      ? teamMembers.filter((m) => m.status === "Available").length
      : SEED_PEOPLE.filter((p) => p.isOnline).length;

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
      .filter((c) => Boolean(c.isArchived) === showArchived)
      .filter((c) => listFilter === "all" || c.type === listFilter)
      .filter((c) => {
        if (!query) return true;
        const lastMsg = lastMessageByConversation[c.id]?.content?.toLowerCase() ?? "";
        return (
          c.title.toLowerCase().includes(query) ||
          lastMsg.includes(query) ||
          c.participants.some((p) => p.name.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
  }, [conversations, listFilter, searchQuery, showArchived, lastMessageByConversation]);

  const archivedCount = conversations.filter((c) => c.isArchived).length;
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const isGroup = selectedConversation?.type === "group";
  const currentMessages = selectedConversationId ? messagesByConversation[selectedConversationId] ?? [] : [];

  const renderItems = useMemo(() => {
    const items: RenderItem[] = [];
    currentMessages.forEach((message, index) => {
      const prev = currentMessages[index - 1];
      const isNewDay = !prev || !isSameDay(prev.timestamp, message.timestamp);
      if (isNewDay) {
        items.push({ kind: "divider", id: `divider-${message.id}`, label: formatDateDivider(message.timestamp) });
      }
      const showMeta = !prev || prev.senderId !== message.senderId || isNewDay;
      items.push({
        kind: "message",
        id: message.id,
        message,
        showAvatar: showMeta,
        showName: showMeta && Boolean(isGroup) && message.senderId !== CURRENT_USER_ID,
      });
    });
    return items;
  }, [currentMessages, isGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, selectedConversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUser || !selectedConversationId) return;

    const message: ChatMessage = {
      id: generateId("msg"),
      conversationId: selectedConversationId,
      senderId: CURRENT_USER_ID,
      senderName: currentUser.fullName,
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

    const timeoutId = setTimeout(() => {
      setMessagesByConversation((prev) => {
        const list = prev[selectedConversationId];
        if (!list) return prev;
        return {
          ...prev,
          [selectedConversationId]: list.map((m) => (m.id === message.id ? { ...m, status: "read" } : m)),
        };
      });
    }, 1600);
    timeoutsRef.current.push(timeoutId);
  };

  const handleCreateDirect = (person: ChatParticipant) => {
    const existing = conversations.find((c) => c.type === "direct" && c.participants[0]?.id === person.id);
    if (existing) {
      setConversations((prev) => prev.map((c) => (c.id === existing.id ? { ...c, isArchived: false } : c)));
      setSelectedConversationId(existing.id);
    } else {
      const conv: Conversation = {
        id: generateId("conv"),
        type: "direct",
        title: person.name,
        participants: [person],
        isOnline: person.isOnline,
        unreadCount: 0,
        lastActivityAt: new Date(),
      };
      setConversations((prev) => [conv, ...prev]);
      setMessagesByConversation((prev) => ({ ...prev, [conv.id]: [] }));
      setSelectedConversationId(conv.id);
    }
    setIsNewChatOpen(false);
  };

  const handleCreateGroup = (name: string, members: ChatParticipant[]) => {
    if (members.length === 0) return;
    const title = name.trim() || members.map((m) => m.name.split(" ")[0]).join(", ");
    const conv: Conversation = {
      id: generateId("conv"),
      type: "group",
      title,
      participants: members,
      unreadCount: 0,
      lastActivityAt: new Date(),
    };
    const systemMessage: ChatMessage = {
      id: generateId("msg"),
      conversationId: conv.id,
      senderId: "system",
      senderName: "System",
      content: `You created the group "${title}"`,
      timestamp: new Date(),
      status: "read",
      type: "system",
    };
    setConversations((prev) => [conv, ...prev]);
    setMessagesByConversation((prev) => ({ ...prev, [conv.id]: [systemMessage] }));
    setSelectedConversationId(conv.id);
    setIsNewChatOpen(false);
  };

  const handleArchiveToggle = () => {
    if (!selectedConversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversationId ? { ...c, isArchived: !c.isArchived } : c))
    );
    setIsMenuOpen(false);
    setSelectedConversationId(null);
  };

  const handleClearConversation = () => {
    if (!selectedConversationId) return;
    if (confirm("Clear all messages in this conversation?")) {
      setMessagesByConversation((prev) => ({ ...prev, [selectedConversationId]: [] }));
    }
    setIsMenuOpen(false);
  };

  const subtitle = !selectedConversation
    ? ""
    : isGroup
    ? `${selectedConversation.participants.length} members${
        selectedConversation.participants.some((p) => p.isOnline)
          ? ` · ${selectedConversation.participants.filter((p) => p.isOnline).length} online`
          : ""
      }`
    : [selectedConversation.participants[0]?.role, selectedConversation.isOnline ? "Active now" : "Offline"]
        .filter(Boolean)
        .join(" · ");

  return (
    <div className={cn("flex h-full overflow-hidden", theme === "dark" ? "bg-zinc-950" : "bg-zinc-50")}>
      {/* Conversation list */}
      <aside
        className={cn(
          "w-full md:w-80 lg:w-96 border-r flex-col flex-shrink-0",
          theme === "dark" ? "border-white/[0.06] bg-zinc-950/50" : "border-zinc-200 bg-white",
          selectedConversationId ? "hidden md:flex" : "flex"
        )}
      >
        <div className={cn("p-4 border-b flex-shrink-0", theme === "dark" ? "border-white/[0.06]" : "border-zinc-200")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn("text-lg font-semibold", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>Chats</h2>
            <div className="flex items-center gap-3">
              <span className={cn("hidden sm:flex items-center gap-1.5 text-xs", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount} online
              </span>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(true)}
                aria-label="New chat"
                className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative mb-3">
            <div className="group flex items-center gap-2 px-3 h-10 rounded-lg bg-muted/50 border border-border/60 focus-within:border-primary/50 transition-colors w-full">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <span className="flex items-center gap-1 shrink-0">
                <kbd className="px-1 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted border border-border/60 rounded-md">
                  ⌘
                </kbd>
                <kbd className="px-1 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted border border-border/60 rounded-md">
                  K
                </kbd>
              </span>
            </div>
          </div>
          {!showArchived && (
            <div className={cn("flex items-center gap-1.5 p-1 rounded-xl", theme === "dark" ? "bg-white/[0.03]" : "bg-zinc-100")}>
              {(
                [
                  { key: "all", label: "All" },
                  { key: "direct", label: "Direct" },
                  { key: "group", label: "Groups" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setListFilter(f.key)}
                  className={cn(
                    "flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors",
                    listFilter === f.key ? "bg-primary text-primary-foreground" : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
                theme === "dark" ? "bg-white/[0.03] border border-white/[0.06]" : "bg-zinc-100 border border-zinc-200"
              )}>
                <MessageSquare className={cn("w-6 h-6", theme === "dark" ? "text-zinc-600" : "text-zinc-400")} />
              </div>
              <p className={cn("text-sm", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{showArchived ? "No archived chats" : "No conversations found"}</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  lastMessage={lastMessageByConversation[conversation.id]}
                  isActive={conversation.id === selectedConversationId}
                  onClick={() => handleSelectConversation(conversation.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {archivedCount > 0 && (
          <div className="p-3 pt-0 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-colors",
                theme === "dark" ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              )}
            >
              {showArchived ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to chats
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" /> Archived ({archivedCount})
                </>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Main chat area */}
      <main className={cn(
        "flex-1 flex-col min-w-0",
        theme === "dark" ? "bg-zinc-950" : "bg-white",
        selectedConversationId ? "flex" : "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            <header className={cn(
              "h-16 border-b backdrop-blur-xl px-4 md:px-6 flex items-center justify-between gap-3 flex-shrink-0",
              theme === "dark" ? "border-white/[0.06] bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"
            )}>
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedConversationId(null)}
                  aria-label="Back to chats"
                  className={cn(
                    "md:hidden -ml-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    theme === "dark" ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {isGroup ? (
                  <GroupAvatar participants={selectedConversation.participants} />
                ) : (
                  <Avatar
                    name={selectedConversation.title}
                    src={selectedConversation.participants[0]?.avatar}
                    online={selectedConversation.isOnline}
                    gradient={getAvatarGradient(selectedConversation.id)}
                  />
                )}
                <div className="min-w-0">
                  <h1 className={cn("text-base font-semibold truncate", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>{selectedConversation.title}</h1>
                  <p className={cn("text-xs truncate", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" aria-label="Call" className={cn("h-9 w-9", theme === "dark" ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}>
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Video call" className={cn("h-9 w-9", theme === "dark" ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}>
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle chat info"
                  onClick={() => setShowInfoPanel((v) => !v)}
                  className={cn(
                    "hidden lg:inline-flex h-9 w-9",
                    showInfoPanel ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]"
                  )}
                >
                  <Info className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="More options"
                    onClick={() => setIsMenuOpen((v) => !v)}
                    className={cn("h-9 w-9", theme === "dark" ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "absolute right-0 top-11 w-52 border rounded-xl shadow-2xl p-1 z-20",
                          theme === "dark" ? "bg-zinc-900 border-white/[0.08]" : "bg-white border-zinc-200"
                        )}
                      >
                        <button
                          type="button"
                          onClick={handleArchiveToggle}
                          className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors", theme === "dark" ? "text-zinc-300 hover:bg-white/[0.06]" : "text-zinc-700 hover:bg-zinc-100")}
                        >
                          {selectedConversation.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          {selectedConversation.isArchived ? "Unarchive chat" : "Archive chat"}
                        </button>
                        <button
                          type="button"
                          onClick={handleClearConversation}
                          className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors", theme === "dark" ? "text-zinc-300 hover:bg-white/[0.06]" : "text-zinc-700 hover:bg-zinc-100")}
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear conversation
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                    theme === "dark" ? "bg-white/[0.03] border border-white/[0.06]" : "bg-zinc-100 border border-zinc-200"
                  )}>
                    {isGroup ? <Users className={cn("w-8 h-8", theme === "dark" ? "text-zinc-600" : "text-zinc-400")} /> : <MessageSquare className={cn("w-8 h-8", theme === "dark" ? "text-zinc-600" : "text-zinc-400")} />}
                  </div>
                  <h3 className={cn("text-lg font-semibold mb-2", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>No messages yet</h3>
                  <p className={cn("text-sm max-w-xs", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>
                    {isGroup ? `Say hello to ${selectedConversation.title}!` : `Start the conversation with ${selectedConversation.title}.`}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {renderItems.map((item) =>
                    item.kind === "divider" ? (
                      <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-2">
                        <span className={cn(
                          "text-[11px] font-medium px-3 py-1 rounded-full",
                          theme === "dark" ? "text-zinc-500 bg-white/[0.04]" : "text-zinc-400 bg-zinc-100"
                        )}>{item.label}</span>
                      </motion.div>
                    ) : item.message.type === "system" ? (
                      <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-1">
                        <span className={cn("text-[11px] text-center px-4", theme === "dark" ? "text-zinc-500" : "text-zinc-400")}>{item.message.content}</span>
                      </motion.div>
                    ) : (
                      <MessageBubble
                        key={item.id}
                        message={item.message}
                        isCurrentUser={item.message.senderId === CURRENT_USER_ID}
                        showAvatar={item.showAvatar}
                        showName={item.showName}
                      />
                    )
                  )}
                  {selectedConversation.isTyping && (
                    <TypingBubble key="typing-indicator" participant={selectedConversation.participants[0]} />
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={cn(
              "p-4 border-t backdrop-blur-xl flex-shrink-0",
              theme === "dark" ? "border-white/[0.06] bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"
            )}>
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" aria-label="Attach file" className={cn("h-10 w-10 flex-shrink-0", theme === "dark" ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}>
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative min-w-0">
                  <Input
                    ref={inputRef}
                    placeholder={`Message ${selectedConversation.title}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={cn(
                      "h-10 text-sm placeholder:text-zinc-500 pr-10",
                      theme === "dark" ? "bg-white/[0.03] border-white/[0.08] text-zinc-200" : "bg-white border-zinc-200 text-zinc-900"
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" aria-label="Emoji" className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8", theme === "dark" ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900")}>
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  aria-label="Send message"
                  className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <EmptyConversationState onNewChat={() => setIsNewChatOpen(true)} />
        )}
      </main>

      {/* Info panel */}
      <AnimatePresence>
        {showInfoPanel && selectedConversation && (
          <InfoPanel key="info-panel" conversation={selectedConversation} onClose={() => setShowInfoPanel(false)} />
        )}
      </AnimatePresence>

      {/* New chat modal */}
      <AnimatePresence>
        {isNewChatOpen && (
          <NewChatModal
            key="new-chat-modal"
            people={roster}
            onClose={() => setIsNewChatOpen(false)}
            onCreateDirect={handleCreateDirect}
            onCreateGroup={handleCreateGroup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}