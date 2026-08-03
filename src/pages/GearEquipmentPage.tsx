import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  ChevronRight,
  Play,
  Pencil,
  Trash2,
  Info,
  LayoutList,
  Activity,
  User,
  Clock,
  Hash,
  Briefcase,
  Wrench,
  Calendar,
  Package,
  Eye,
  CheckCircle,
  Upload,
  Star,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import type {
  GearStatus,
  GearCategory,
  GearItem,
} from "@/features/gear/gearData";
import { generateId } from "@/hooks/use-crud-store";
import { useGear } from "@/contexts/GearContext";
import {
  CrudModal,
  ConfirmDeleteModal,
  FormField,
  StyledInput,
  StyledSelect,
  ActionButton,
} from "@/components/CrudModal";
import { DetailsModal } from "@/components/DetailsModal";
import CloudinaryImage from "@/components/ui/CloudinaryImage";
import { CloudinaryImages } from "@/data/cloudinary-images";
const defaultGearImg: string = CloudinaryImages.gear.sonyFx3;

// ── Constants ─────────────────────────────────────────────────────
const ALL_CATEGORIES: (GearCategory | "All")[] = [
  "All",
  "Camera",
  "Stabilizer",
  "Lens",
  "Drone",
  "Lighting",
  "Audio",
  "Editing",
];

const ALL_STATUSES: (GearStatus | "All")[] = [
  "All",
  "available",
  "checked-out",
  "maintenance",
  "damaged",
];

const statusStyles = {
  available: {
    text: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-500/10 border border-gray-500/20",
    label: "AVAILABLE",
    dot: "#999999",
  },
  "checked-out": {
    text: "text-gray-600 dark:text-gray-500",
    bg: "bg-gray-600/10 border border-gray-600/20",
    label: "CHECKED OUT",
    dot: "#666666",
  },
  maintenance: {
    text: "text-gray-700 dark:text-gray-600",
    bg: "bg-gray-700/10 border border-gray-700/20",
    label: "MAINTENANCE",
    dot: "#444444",
  },
  damaged: {
    text: "text-gray-900 dark:text-gray-800",
    bg: "bg-gray-900/10 border border-gray-900/20",
    label: "DAMAGED",
    dot: "#000000",
  },
};

const statusBadgeStyles = {
  available: "bg-gray-500 text-white",
  "checked-out": "bg-gray-600 text-white",
  maintenance: "bg-gray-700 text-white",
  damaged: "bg-gray-900 text-white",
};

// Small glyph shown in the card's identity badge + hover overlay, keyed to status
const statusIconMap = {
  available: CheckCircle,
  "checked-out": Clock,
  maintenance: Wrench,
  damaged: AlertTriangle,
};

// ── Helper: Brana brand logo badge on gear cards ───────────────────
function BrandLogoBadge({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-muted dark:bg-[#2a2a2a] border border-border/40 dark:border-[#333] flex items-center justify-center overflow-hidden flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src="/favicon.svg"
        alt="Brana Films"
        className="object-contain"
        style={{ width: size * 0.55, height: size * 0.55 }}
      />
    </div>
  );
}

// ── Helper: single stat row inside the hover-detail overlay ─────────
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <Icon
        size={12}
        strokeWidth={2.25}
        className="text-white/45 mt-[1px] flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="text-[8.5px] font-semibold uppercase tracking-wider text-white/40 leading-none mb-1">
          {label}
        </p>
        <p className="text-[11px] text-white font-medium leading-none truncate">
          {value && value !== "" ? value : "—"}
        </p>
      </div>
    </div>
  );
}

// ── Gear Card — redesigned to match the reference profile-card UI ───
// Resting state mirrors the reference exactly: portrait photo with a
// star-rating pill top-right, then an identity bar (avatar · name ·
// subtitle · pill CTA). Hovering reveals the gear's full detail sheet
// (every field from the old card, plus edit/delete) layered on top —
// nothing from the original data or handlers has been dropped, it's
// just been reorganized into "at a glance" vs "on hover".
function LargeGearCard({
  item,
  index,
  onDetails,
  onEdit,
  onDelete,
}: {
  item: GearItem;
  index: number;
  onDetails: (item: GearItem) => void;
  onEdit: (item: GearItem) => void;
  onDelete: (item: GearItem) => void;
}) {
  const status = statusStyles[item.status] ?? statusStyles.available;
  const badge = statusBadgeStyles[item.status] ?? statusBadgeStyles.available;
  const StatusIcon = statusIconMap[item.status] ?? CheckCircle;

  const shortModel = item.model.split(" ").slice(0, 2).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => onDetails(item)}
      className="group relative w-full rounded-[28px] bg-white dark:bg-[#161616] cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_28px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_28px_-10px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_20px_38px_-10px_rgba(0,0,0,0.24)]"
    >
      {/* Photo, badged with status badge — top-right */}
      <div className="relative m-2 aspect-[5/6] rounded-[20px] overflow-hidden bg-muted dark:bg-[#232323]">
        <CloudinaryImage
          src={item.image ?? defaultGearImg}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 pl-2 pr-2.5 py-[5px] rounded-full bg-black/45 backdrop-blur-md border border-white/10">
          <StatusIcon size={11} className="text-white" />
          <span className="text-[10px] font-bold text-white leading-none uppercase tracking-wide">
            {status.label}
          </span>
        </div>
      </div>

      {/* Identity bar — avatar+status dot, name, category/model, CTA */}
      <div className="flex items-center justify-between gap-2 pt-2.5 pb-3 pl-3.5 pr-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <BrandLogoBadge size={40} />
            {/* Status dot — same colors as the filter chips, styled after
               the reference's online-status indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[2.5px] border-white dark:border-[#161616] flex items-center justify-center"
              style={{ background: status.dot }}
            >
              <StatusIcon size={7.5} strokeWidth={3.5} className="text-white" />
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="text-[14px] font-bold text-foreground leading-tight truncate">
              {item.name}
            </h4>
            <p className="text-[11.5px] text-muted-foreground truncate">
              {item.category} · {shortModel}
            </p>
          </div>
        </div>

        {/* Primary CTA — styled after the reference's black "Connect" pill */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails(item);
          }}
          className="flex-shrink-0 flex items-center gap-1 pl-3.5 pr-3 py-2 rounded-full bg-[#141414] dark:bg-black dark:border dark:border-white/10 text-white text-[12.5px] font-semibold hover:opacity-85 active:scale-95 transition"
        >
          Details
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Hover reveal — the gear's full detail sheet, layered over the
         entire card. Keyboard users can reach it via focus-within, since
         the buttons inside stay in the tab order. */}
      <div className="absolute inset-0 z-10 rounded-[28px] overflow-hidden bg-gradient-to-b from-black/95 via-black/92 to-[#0a0a0a]/96 backdrop-blur-[2px] p-4 flex flex-col opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto transition-opacity duration-300">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-[9px] font-bold tracking-wide px-2.5 py-1 rounded-full ${badge}`}
          >
            {status.label}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title="Edit gear"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#7c3aed]/60 flex items-center justify-center text-white transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              title="Delete gear"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 flex items-center justify-center text-white transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="text-white font-bold text-[15px] leading-tight truncate">
            {item.name}
          </h4>
          <p className="text-white/50 text-[11px] truncate mt-0.5">
            {item.model}
          </p>
        </div>

        <div className="h-px bg-white/10 my-3 flex-shrink-0" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-3 content-start flex-1 min-h-0">
          <DetailRow icon={Package} label="Category" value={item.category} />
          <DetailRow
            icon={Activity}
            label="Condition"
            value={`${item.condition}%`}
          />
          <DetailRow icon={Hash} label="Serial No." value={item.serialNumber} />
          <DetailRow icon={User} label="Assigned To" value={item.assignedTo} />
          <DetailRow
            icon={Briefcase}
            label="Project"
            value={item.currentProject}
          />
          <DetailRow icon={Clock} label="Return Date" value={item.returnDate} />
          <DetailRow
            icon={Wrench}
            label="Last Serviced"
            value={item.lastMaintenance}
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails(item);
          }}
          className="mt-3 w-full flex-shrink-0 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-white text-black text-[12px] font-semibold hover:bg-white/90 active:scale-[0.98] transition"
        >
          Open Full Details
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function GearEquipmentPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GearCategory | "All">(
    "All",
  );
  const [activeStatus, setActiveStatus] = useState<GearStatus | "All">("All");

  const {
    gearItems,
    addGearItem,
    updateGearItem: update,
    removeGearItem: remove,
  } = useGear();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] =
    useState<GearItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    category: "Camera" as GearCategory,
    status: "available" as GearStatus,
    condition: "100",
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    serialNumber: "",
    lastMaintenance: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    image: defaultGearImg,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = (event.target?.result as string) || defaultGearImg;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          setFormData((prev) => ({
            ...prev,
            image: compressed || rawData,
          }));
        };
        img.onerror = () => {
          setFormData((prev) => ({
            ...prev,
            image: rawData,
          }));
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Filtering logic ────────────────────────────────
  const filteredGear = useMemo(() => {
    return gearItems.filter((item) => {
      const matchSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.assignedTo.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "All" || item.category === activeCategory;
      const matchStatus =
        activeStatus === "All" || item.status === activeStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [search, activeCategory, activeStatus, gearItems]);

  // ── Handlers ───────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      model: "",
      category: "Camera",
      status: "available",
      condition: "100",
      assignedTo: "—",
      currentProject: "—",
      returnDate: "—",
      serialNumber: "",
      lastMaintenance: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      image: defaultGearImg,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GearItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      model: item.model,
      category: item.category,
      status: item.status,
      condition: item.condition.toString(),
      assignedTo: item.assignedTo,
      currentProject: item.currentProject,
      returnDate: item.returnDate,
      serialNumber: item.serialNumber,
      lastMaintenance: item.lastMaintenance,
      image: item.image || defaultGearImg,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      update(editingItem.id, {
        ...formData,
        condition: parseInt(formData.condition, 10) || 100,
      });
    } else {
      addGearItem({
        ...formData,
        condition: parseInt(formData.condition, 10) || 100,
      });
    }
    setIsModalOpen(false);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-full p-4 flex flex-col bg-background text-foreground gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <header className="flex flex-col gap-1">
        <h1 className="text-[48px] md:text-[56px] font-black leading-none tracking-tight text-foreground">
          Gear &amp; Equipment
        </h1>
        <p className="text-[13px] text-muted-foreground">
          A Great Way To Track And Manage All The Production Equipment You Need
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
              placeholder="Search for gear, category, serial..."
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
          {/* Add New Equipment */}
          <button
            onClick={handleOpenCreate}
            className="w-14 h-14 rounded-full flex items-center justify-center text-foreground bg-background hover:bg-muted transition-colors border border-border shadow-sm hover:shadow-md dark:text-background dark:bg-foreground"
            title="Add New Equipment"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ── TAB NAVIGATION ROW ───────────────────────────── */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex items-center gap-1 flex-shrink-0">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-colors"
              style={{
                color:
                  activeCategory === cat
                    ? "var(--color-foreground)"
                    : "var(--color-muted-foreground)",
              }}
            >
              {cat === "All" ? "All Gear" : cat}
              {activeCategory === cat && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Right side: status filter chips + list toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5 border border-border dark:bg-zinc-900 dark:border-zinc-800 flex-shrink-0">
          {ALL_STATUSES.filter((s) => s !== "All").map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(activeStatus === s ? "All" : s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                activeStatus === s
                  ? "bg-foreground text-background dark:bg-zinc-800/60 dark:text-zinc-100"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-200"
              }`}
            >
              {s.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── ALERT SECTION ────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        {/* Section header */}

        {/* Cards Grid */}
        {filteredGear.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-2">
            {filteredGear.map((item, i) => (
              <LargeGearCard
                key={item.id}
                item={item}
                index={i}
                onDetails={setSelectedDetailsItem}
                onEdit={handleOpenEdit}
                onDelete={(item) => {
                  setEditingItem(item);
                  setIsDeleteOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full rounded-xl py-12 gap-3 border border-dashed border-border">
            <Search size={28} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              No gear found
            </p>
            <p className="text-xs text-muted-foreground/60">
              Try adjusting your filters
            </p>
          </div>
        )}
      </section>

      {/* ── PRESERVED MODALS ──────────────────────────────── */}
      <CrudModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Equipment" : "Add New Equipment"}
        subtitle="Register new camera gear and accessories to the inventory."
      >
        <div className="space-y-4">
          {/* Image Upload Field */}
          <FormField label="Gear Image">
            <div className="flex flex-col gap-2">
              <div className="w-full h-32 rounded-xl border border-border/40 overflow-hidden bg-muted/30">
                <CloudinaryImage
                  src={formData.image}
                  alt="Gear Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-muted/50 hover:bg-muted/70 cursor-pointer transition-all text-sm font-medium">
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gear Name">
              <StyledInput
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Sony FX3"
              />
            </FormField>
            <FormField label="Full Model">
              <StyledInput
                value={formData.model}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, model: e.target.value }))
                }
                placeholder="e.g. Sony FX3 Cinema Kit"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <StyledSelect
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    category: e.target.value as GearCategory,
                  }))
                }
                options={[
                  { value: "Camera", label: "Camera" },
                  { value: "Stabilizer", label: "Stabilizer" },
                  { value: "Lens", label: "Lens" },
                  { value: "Drone", label: "Drone" },
                  { value: "Lighting", label: "Lighting" },
                  { value: "Audio", label: "Audio" },
                  { value: "Editing", label: "Editing" },
                ]}
              />
            </FormField>
            <FormField label="Status">
              <StyledSelect
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    status: e.target.value as GearStatus,
                  }))
                }
                options={[
                  { value: "available", label: "Available" },
                  { value: "checked-out", label: "Checked Out" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "damaged", label: "Damaged" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Condition (0-100)">
              <StyledInput
                type="number"
                min="0"
                max="100"
                value={formData.condition}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, condition: e.target.value }))
                }
                placeholder="100"
              />
            </FormField>
            <FormField label="Serial Number">
              <StyledInput
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, serialNumber: e.target.value }))
                }
                placeholder="SN-XXX-..."
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assigned To">
              <StyledInput
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, assignedTo: e.target.value }))
                }
                placeholder="e.g. Abi Sala"
              />
            </FormField>
            <FormField label="Current Project">
              <StyledInput
                value={formData.currentProject}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, currentProject: e.target.value }))
                }
                placeholder="e.g. Wedding Shoot"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expected Return Date">
              <StyledInput
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, returnDate: e.target.value }))
                }
                placeholder="e.g. May 22, 2026"
              />
            </FormField>
            <FormField label="Last Maintenance">
              <StyledInput
                value={formData.lastMaintenance}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    lastMaintenance: e.target.value,
                  }))
                }
                placeholder="e.g. Jun 15, 2026"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            />
            <ActionButton
              label={editingItem ? "Save Changes" : "Add Equipment"}
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.model.trim()}
            />
          </div>
        </div>
      </CrudModal>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => remove(editingItem?.id || "")}
        itemName={editingItem?.name}
      />

      {selectedDetailsItem && (
        <DetailsModal
          open={!!selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
          title={selectedDetailsItem.name}
          subtitle={selectedDetailsItem.model}
          image={selectedDetailsItem.image}
          status={{
            label: selectedDetailsItem.status.replace("-", " "),
            color:
              selectedDetailsItem.status === "available"
                ? "#999999"
                : selectedDetailsItem.status === "checked-out"
                  ? "#666666"
                  : selectedDetailsItem.status === "maintenance"
                    ? "#444444"
                    : "#000000",
            bg:
              selectedDetailsItem.status === "available"
                ? "rgba(153,153,153,0.12)"
                : selectedDetailsItem.status === "checked-out"
                  ? "rgba(102,102,102,0.12)"
                  : selectedDetailsItem.status === "maintenance"
                    ? "rgba(68,68,68,0.12)"
                    : "rgba(0,0,0,0.12)",
          }}
          details={[
            { label: "Category", value: selectedDetailsItem.category },
            {
              label: "Condition",
              value: `${selectedDetailsItem.condition}%`,
              icon: Activity,
            },
            {
              label: "Assigned To",
              value: selectedDetailsItem.assignedTo,
              icon: User,
            },
            {
              label: "Current Project",
              value: selectedDetailsItem.currentProject,
              icon: Briefcase,
            },
            {
              label: "Return Date",
              value: selectedDetailsItem.returnDate,
              icon: Clock,
            },
            {
              label: "Serial Number",
              value: selectedDetailsItem.serialNumber,
              icon: Hash,
            },
            {
              label: "Last Maintenance",
              value: selectedDetailsItem.lastMaintenance,
              icon: Wrench,
            },
          ]}
          description={`The ${selectedDetailsItem.name} (${selectedDetailsItem.model}) is currently marked as ${selectedDetailsItem.status.replace(
            "-",
            " ",
          )}. Make sure to update its status when the equipment condition or assignment changes.`}
        />
      )}
      </motion.div>
    </div>
  );
}
