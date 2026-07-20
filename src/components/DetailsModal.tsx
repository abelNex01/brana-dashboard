import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Tag } from "lucide-react";

export interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  image?: string;
  status?: { label: string; color: string; bg: string };
  details: { label: string; value: string | number; icon?: React.ElementType }[];
  accentColor?: string;
  description?: string;
}

export function DetailsModal({
  open,
  onClose,
  title,
  subtitle,
  image,
  status,
  details,
  accentColor = "hsl(152 100% 50%)",
  description
}: DetailsModalProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 dark:bg-[#050505]/80"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] glass-modal"
            style={{
              willChange: "transform, opacity",
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 20px 80px rgba(0,0,0,0.2)`,
            }}
          >
            {/* Header Image or Gradient */}
            <div className="relative h-48 sm:h-64 w-full shrink-0">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}20, rgba(0,0,0,0))` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors bg-background/60 backdrop-blur-md border border-border/40 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-10">
                <div className="min-w-0 pr-4">
                  <h2 className="text-3xl font-black text-foreground tracking-tight truncate" style={{ textShadow: `0 0 30px ${accentColor}30` }}>{title}</h2>
                  {subtitle && <p className="text-sm font-medium text-muted-foreground mt-1 truncate">{subtitle}</p>}
                </div>
                {status && (
                  <div className="px-3 py-1.5 rounded-full flex items-center gap-2 border shrink-0" style={{ background: status.bg, borderColor: `${status.color}30`, color: status.color }}>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: status.color }}></span>
                    <span className="text-xs font-bold uppercase tracking-wider">{status.label}</span>
                  </div>
                )}
              </div>
            </div>
 
            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              {description && (
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Description</h3>
                  <p className="text-sm text-foreground leading-relaxed">{description}</p>
                </div>
              )}
 
              <div>
                 <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">Properties & Details</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {details.map((detail, idx) => {
                     const Icon = detail.icon || Tag;
                     return (
                       <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl transition-colors bg-muted/30 hover:bg-muted/50 border border-border/40">
                         <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}15`, color: accentColor }}>
                           <Icon className="w-4 h-4" />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">{detail.label}</p>
                           <p className="text-sm font-semibold text-foreground truncate">{detail.value || "—"}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
