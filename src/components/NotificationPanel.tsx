import {
  Bell,
  UserPlus,
  Box,
  DollarSign,
  Mail,
  MessageSquare,
  Phone,
  MoreHorizontal,
  X,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboard } from "@/hooks/use-dashboard";
import { motion } from "framer-motion";

export function NotificationPanel() {
  const { setNotificationOpen } = useDashboard();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-[280px] sm:w-[300px] bg-card/95 backdrop-blur-md border-l border-border flex flex-col h-full relative z-20 dark:bg-[#050505]/95"
      style={{ willChange: "transform" }}
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-sm font-black text-foreground tracking-widest uppercase">
          Studio Activity
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationOpen(false)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 pt-2 space-y-5">
          {/* Notifications Section */}
          <section>
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
              Urgent Alerts
            </h3>
            <div className="space-y-3">
              <NotificationItem
                icon={<Video className="w-3 h-3" />}
                title="New booking: Liya & Bereket Wedding"
                time="Just now"
              />
              <NotificationItem
                icon={<Box className="w-3 h-3" />}
                title="Sony FX3 checked out by Abi Sala"
                time="12m ago"
              />
              <NotificationItem
                icon={<DollarSign className="w-3 h-3" />}
                title="Payment received: ETB 45,000"
                time="2h ago"
              />
              <NotificationItem
                icon={<MessageSquare className="w-3 h-3" />}
                title="Client feedback on ceremony teaser"
                time="4h ago"
              />
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* Activities Section */}
          <section>
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
              Production Log
            </h3>
            <div className="relative space-y-5 pl-2">
              <div className="absolute left-[0.85rem] top-2 bottom-2 w-[1px] bg-border/40" />
              <ActivityItem
                avatar="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150"
                title="Abi updated 'Bethel & Yared' edit"
                time="Just now"
              />
              <ActivityItem
                avatar="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"
                title="Hana started DaVinci color grading"
                time="47m ago"
              />
              <ActivityItem
                avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                title="Sara exported wedding teaser master"
                time="1d ago"
              />
            </div>
          </section>

          <div className="border-t border-border/40" />

          {/* Contacts Section */}
          <section>
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
              Direct Links
            </h3>
            <div className="space-y-1.5">
              <ContactItem
                name="John Brana"
                role="Studio Director"
                avatar="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
                active
              />
              <ContactItem
                name="Abi Sala"
                role="Lead Cinematographer"
                avatar="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150"
              />
              <ContactItem
                name="Hana Girma"
                role="Senior Editor"
                avatar="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"
              />
              <ContactItem
                name="Sara Wolde"
                role="Editor & Colorist"
                avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
              />
            </div>
          </section>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

function NotificationItem({
  icon,
  title,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-2.5 group cursor-pointer">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 transition-colors group-hover:border-emerald-500/40">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-[9px] text-gray-500 mt-1 font-medium">{time}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  avatar,
  title,
  time,
}: {
  avatar: string;
  title: string;
  time: string;
}) {
  return (
    <div className="relative flex items-start gap-2.5">
      <Avatar className="w-6 h-6 border border-background shrink-0 z-10 shadow-sm ring-1 ring-border/40">
        <AvatarImage src={avatar} className="object-cover" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="pt-0.5">
        <p className="text-[11px] font-medium text-foreground/90 leading-tight">
          {title}
        </p>
        <p className="text-[9px] text-gray-500 mt-1 font-medium">{time}</p>
      </div>
    </div>
  );
}

function ContactItem({
  name,
  role,
  avatar,
  active,
}: {
  name: string;
  role: string;
  avatar: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${active ? "bg-[#BEF264] text-black shadow-lg scale-[1.02]" : "hover:bg-muted"}`}
    >
      <div className="flex items-center gap-2">
        <Avatar
          className={`w-7 h-7 border shadow-sm ${active ? "border-black/10" : "border-border"}`}
        >
          <AvatarImage src={avatar} className="object-cover" />
          <AvatarFallback className="font-bold text-[9px]">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span
            className={`text-[10px] font-bold tracking-tight leading-none ${active ? "text-black" : "text-foreground"}`}
          >
            {name}
          </span>
          <span
            className={`text-[8px] mt-0.5 ${active ? "text-black/60" : "text-muted-foreground"}`}
          >
            {role}
          </span>
        </div>
      </div>
      {active ? (
        <div className="flex items-center gap-1 pr-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full bg-black/5 hover:bg-black/10 text-black border border-black/5"
          >
            <Mail className="w-2.5 h-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full bg-black/5 hover:bg-black/10 text-black border border-black/5"
          >
            <Phone className="w-2.5 h-2.5" />
          </Button>
        </div>
      ) : (
        <MoreHorizontal className="w-3 h-3 text-muted-foreground mr-1 cursor-pointer hover:text-foreground transition-colors" />
      )}
    </div>
  );
}
