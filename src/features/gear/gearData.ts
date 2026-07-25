// ─── Types ────────────────────────────────────────────────────────────

export type GearStatus =
  | "available"
  | "checked-out"
  | "maintenance"
  | "damaged";
export type GearCategory =
  | "Camera"
  | "Stabilizer"
  | "Lens"
  | "Drone"
  | "Lighting"
  | "Audio"
  | "Editing";

export interface GearItem {
  id: string;
  name: string;
  model: string;
  category: GearCategory;
  status: GearStatus;
  condition: number; // 0-100
  assignedTo: string;
  currentProject: string;
  returnDate: string;
  image: string;
  serialNumber: string;
  lastMaintenance: string;
}

export interface GearActivity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  gear: string;
  time: string;
  status: "returned" | "checked-out" | "overdue" | "maintenance";
}

export interface GearReservation {
  id: string;
  project: string;
  equipment: string[];
  dueDate: string;
  client: string;
  urgency: "high" | "medium" | "low";
}

export interface WorkflowApp {
  name: string;
  icon: string;
  status: "synced" | "pending" | "offline";
  lastSync: string;
}

export const heroGearImage = "/gear/camera1.webp";

export const gearItems: GearItem[] = [];
export const gearActivities: GearActivity[] = [];
export const gearReservations: GearReservation[] = [];

export const workflowApps: WorkflowApp[] = [
  {
    name: "Premiere Pro",
    icon: "Pr",
    status: "synced",
    lastSync: "2 min ago",
  },
  {
    name: "DaVinci Resolve",
    icon: "DV",
    status: "synced",
    lastSync: "15 min ago",
  },
  {
    name: "Frame.io",
    icon: "Fr",
    status: "pending",
    lastSync: "1 hr ago",
  },
  {
    name: "Google Drive",
    icon: "GD",
    status: "synced",
    lastSync: "5 min ago",
  },
];

export const gearStats = {
  total: 21,
  available: 12,
  checkedOut: 6,
  maintenance: 2,
  damaged: 1,
};
