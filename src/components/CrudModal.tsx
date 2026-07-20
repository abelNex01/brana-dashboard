import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

/* ─── Shared Modal Shell ───────────────────────────────────────────────────── */

interface CrudModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
  width?: string;
}

export function CrudModal({
  open,
  onClose,
  title,
  subtitle,
  accentColor = "hsl(152 100% 50%)",
  children,
  width = "max-w-lg",
}: CrudModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence mode="wait">
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 dark:bg-[#050505]/80"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative ${width} w-full rounded-2xl overflow-hidden glass-modal`}
            style={{
              willChange: "transform, opacity",
              border: `1px solid ${accentColor}25`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.1)`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
              <div>
                <h2
                  className="text-base font-black text-foreground"
                  style={{ textShadow: `0 0 20px ${accentColor}20` }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                style={{
                  border: "1px solid var(--color-border)",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Confirm Delete Modal ─────────────────────────────────────────────────── */

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
}: ConfirmDeleteProps) {
  return (
    <CrudModal
      open={open}
      onClose={onClose}
      title={title}
      accentColor="#ef4444"
      width="max-w-sm"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20"
        >
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        {itemName && (
          <p
            className="text-sm font-bold text-foreground px-4 py-2 rounded-xl bg-muted/50 border border-border"
          >
            "{itemName}"
          </p>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>

        <div className="flex items-center gap-3 w-full pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </CrudModal>
  );
}

/* ─── Styled Form Field ────────────────────────────────────────────────────── */

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, children, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Styled Input ─────────────────────────────────────────────────────────── */

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accentColor?: string;
}

export function StyledInput({
  accentColor = "hsl(152 100% 50%)",
  className = "",
  ...props
}: StyledInputProps) {
  return (
    <input
      {...props}
      className={`w-full h-9 px-3.5 rounded-xl text-xs outline-none transition-all duration-200 glass-input ${className}`}
      onFocus={(e) => {
        (e.target as HTMLElement).style.borderColor = `${accentColor}50`;
        (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${accentColor}10`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.borderColor = "";
        (e.target as HTMLElement).style.boxShadow = "";
        props.onBlur?.(e);
      }}
    />
  );
}

/* ─── Styled Select ────────────────────────────────────────────────────────── */

interface StyledSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  accentColor?: string;
  options: { value: string; label: string }[];
}

export function StyledSelect({
  accentColor = "hsl(152 100% 50%)",
  options,
  className = "",
  ...props
}: StyledSelectProps) {
  return (
    <select
      {...props}
      className={`w-full h-9 px-3.5 rounded-xl text-xs outline-none transition-all duration-200 appearance-none cursor-pointer glass-input ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.borderColor = `${accentColor}50`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.borderColor = "";
        props.onBlur?.(e);
      }}
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ background: "var(--color-card)", color: "var(--color-card-foreground)" }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/* ─── Styled TextArea ──────────────────────────────────────────────────────── */

interface StyledTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  accentColor?: string;
}

export function StyledTextArea({
  accentColor = "hsl(152 100% 50%)",
  className = "",
  ...props
}: StyledTextAreaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all duration-200 resize-none glass-input ${className}`}
      style={{
        minHeight: "80px",
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.borderColor = `${accentColor}50`;
        (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${accentColor}10`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.borderColor = "";
        (e.target as HTMLElement).style.boxShadow = "";
        props.onBlur?.(e);
      }}
    />
  );
}

/* ─── Action Button ────────────────────────────────────────────────────────── */

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  accentColor?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function ActionButton({
  onClick,
  label,
  variant = "primary",
  accentColor = "hsl(152 100% 50%)",
  className = "",
  icon,
  disabled = false,
}: ActionButtonProps) {
  const styles =
    variant === "primary"
      ? {
          background: accentColor,
          color: "black",
          boxShadow: `0 0 20px ${accentColor}35`,
        }
      : variant === "danger"
        ? {
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            boxShadow: "0 0 20px rgba(239,68,68,0.2)",
          }
        : {
            background: "var(--color-muted)",
            color: "var(--color-muted-foreground)",
            border: "1px solid var(--color-border)",
          };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`h-10 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]"} ${className}`}
      style={styles}
    >
      {icon}
      {label}
    </button>
  );
}

