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

export const gearItems: GearItem[] = [
  {
    id: "g1",
    name: "Sony FX3",
    model: "Sony FX3 Cinema Kit",
    category: "Camera",
    status: "available",
    condition: 95,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/camera1.webp",
    serialNumber: "SN-FX3-2024-001",
    lastMaintenance: "Apr 10, 2026",
  },
  {
    id: "g2",
    name: "Canon EOS R5",
    model: "Canon R5 Full Frame",
    category: "Camera",
    status: "available",
    condition: 98,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/camera2.webp",
    serialNumber: "SN-R5-2024-002",
    lastMaintenance: "May 05, 2026",
  },
  {
    id: "g3",
    name: "Sony A7 IV",
    model: "Sony A7 IV Mirrorless Camera",
    category: "Camera",
    status: "checked-out",
    condition: 92,
    assignedTo: "Abi Sala",
    currentProject: "Wedding Shoot",
    returnDate: "May 22, 2026",
    image: "/gear/camera3.webp",
    serialNumber: "SN-A74-2024-003",
    lastMaintenance: "May 08, 2026",
  },
  {
    id: "g4",
    name: "DJI Mavic 3 Pro",
    model: "DJI Mavic 3 Pro Drone",
    category: "Drone",
    status: "available",
    condition: 94,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/drone1.webp",
    serialNumber: "SN-MAV3-2024-004",
    lastMaintenance: "May 14, 2026",
  },
  {
    id: "g5",
    name: "DJI Air 2S",
    model: "DJI Air 2S Drone",
    category: "Drone",
    status: "maintenance",
    condition: 75,
    assignedTo: "Tech Team",
    currentProject: "Maintenance",
    returnDate: "May 18, 2026",
    image: "/gear/drone2.webp",
    serialNumber: "SN-AIR2-2024-005",
    lastMaintenance: "May 02, 2026",
  },
  {
    id: "g6",
    name: "Sigma 24-70mm",
    model: "Sigma Art 24-70 f/2.8",
    category: "Lens",
    status: "available",
    condition: 96,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/lens1.webp",
    serialNumber: "SN-SIGMA-2024-006",
    lastMaintenance: "Mar 28, 2026",
  },
  {
    id: "g7",
    name: "Canon RF 50mm",
    model: "Canon RF 50mm f/1.2L USM",
    category: "Lens",
    status: "checked-out",
    condition: 88,
    assignedTo: "Hana Girma",
    currentProject: "Portrait Session",
    returnDate: "May 20, 2026",
    image: "/gear/lens2.webp",
    serialNumber: "SN-RF50-2024-007",
    lastMaintenance: "May 12, 2026",
  },
  {
    id: "g8",
    name: "Sony 70-200mm",
    model: "Sony FE 70-200mm f/2.8 GM II",
    category: "Lens",
    status: "available",
    condition: 99,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/lens3.webp",
    serialNumber: "SN-70200-2024-008",
    lastMaintenance: "May 15, 2026",
  },
  {
    id: "g9",
    name: "Tamron 17-28mm",
    model: "Tamron 17-28mm f/2.8 Di III RXD",
    category: "Lens",
    status: "checked-out",
    condition: 91,
    assignedTo: "David Tekle",
    currentProject: "Architecture Shoot",
    returnDate: "May 26, 2026",
    image: "/gear/lens4.webp",
    serialNumber: "SN-1728-2024-009",
    lastMaintenance: "Apr 30, 2026",
  },
  {
    id: "g10",
    name: "Sigma 85mm",
    model: "Sigma 85mm f/1.4 DG DN Art",
    category: "Lens",
    status: "available",
    condition: 97,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/lens5.webp",
    serialNumber: "SN-8514-2024-010",
    lastMaintenance: "May 09, 2026",
  },
  {
    id: "g11",
    name: "Sony 35mm",
    model: "Sony FE 35mm f/1.4 GM",
    category: "Lens",
    status: "damaged",
    condition: 45,
    assignedTo: "Tech Team",
    currentProject: "Repair",
    returnDate: "Jun 01, 2026",
    image: "/gear/lens6.webp",
    serialNumber: "SN-3514-2024-011",
    lastMaintenance: "May 13, 2026",
  },
  {
    id: "g12",
    name: "Aputure 600D",
    model: "Aputure 600D Pro Light",
    category: "Lighting",
    status: "available",
    condition: 100,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/light1.webp",
    serialNumber: "SN-AP600-2024-012",
    lastMaintenance: "Apr 22, 2026",
  },
  {
    id: "g13",
    name: "Godox V1",
    model: "Godox V1 Flash",
    category: "Lighting",
    status: "checked-out",
    condition: 89,
    assignedTo: "Lydia Abraham",
    currentProject: "Studio Session",
    returnDate: "May 23, 2026",
    image: "/gear/light2.webp",
    serialNumber: "SN-V1-2024-013",
    lastMaintenance: "Apr 25, 2026",
  },
  {
    id: "g14",
    name: "Aputure Light Dome",
    model: "Aputure Light Dome SE",
    category: "Lighting",
    status: "available",
    condition: 95,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/light3.webp",
    serialNumber: "SN-LDSE-2024-014",
    lastMaintenance: "Apr 28, 2026",
  },
  {
    id: "g15",
    name: "Amaran 200x",
    model: "Amaran 200x Bi-Color LED",
    category: "Lighting",
    status: "maintenance",
    condition: 72,
    assignedTo: "Tech Team",
    currentProject: "Maintenance",
    returnDate: "May 25, 2026",
    image: "/gear/light4.webp",
    serialNumber: "SN-AM200-2024-015",
    lastMaintenance: "May 04, 2026",
  },
  {
    id: "g16",
    name: "Rode Wireless Pro",
    model: "Rode Wireless Pro Mic",
    category: "Audio",
    status: "available",
    condition: 93,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/mic1.webp",
    serialNumber: "SN-RODE-2024-016",
    lastMaintenance: "Apr 15, 2026",
  },
  {
    id: "g17",
    name: "Sennheiser MKH 416",
    model: "Sennheiser MKH 416 Shotgun Mic",
    category: "Audio",
    status: "checked-out",
    condition: 87,
    assignedTo: "Mikael Tadesse",
    currentProject: "Interview Shoot",
    returnDate: "May 19, 2026",
    image: "/gear/mic2.webp",
    serialNumber: "SN-MKH-2024-017",
    lastMaintenance: "May 03, 2026",
  },
  {
    id: "g18",
    name: "DJI Ronin RS4",
    model: "DJI Ronin RS4 Pro Gimbal",
    category: "Stabilizer",
    status: "available",
    condition: 96,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/stablizer1.webp",
    serialNumber: "SN-RS4-2024-018",
    lastMaintenance: "May 01, 2026",
  },
  {
    id: "g19",
    name: "DJI Ronin-S",
    model: "DJI Ronin-S Stabilizer",
    category: "Stabilizer",
    status: "checked-out",
    condition: 84,
    assignedTo: "Yohannes Bekele",
    currentProject: "Engagement Shoot",
    returnDate: "May 21, 2026",
    image: "/gear/stablizer2.webp",
    serialNumber: "SN-RON-2024-019",
    lastMaintenance: "Apr 20, 2026",
  },
  {
    id: "g20",
    name: "Zhiyun Crane 3S",
    model: "Zhiyun Crane 3S Stabilizer",
    category: "Stabilizer",
    status: "available",
    condition: 90,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/stablizer3.webp",
    serialNumber: "SN-CR3-2024-020",
    lastMaintenance: "May 06, 2026",
  },
  {
    id: "g21",
    name: "DaVinci Resolve",
    model: "Blackmagic Design DaVinci Resolve Studio",
    category: "Editing",
    status: "available",
    condition: 100,
    assignedTo: "—",
    currentProject: "—",
    returnDate: "—",
    image: "/gear/editor.webp",
    serialNumber: "SN-DRS-2024-021",
    lastMaintenance: "May 15, 2026",
  },
];

export const gearActivities: GearActivity[] = [
  {
    id: "a1",
    user: "Abi Sala",
    avatar: "AS",
    action: "Checked out",
    gear: "Sony FX3 Cinema Kit",
    time: "2 hours ago",
    status: "checked-out",
  },
  {
    id: "a2",
    user: "Hana Girma",
    avatar: "HG",
    action: "Returned",
    gear: "Canon EOS R5",
    time: "5 hours ago",
    status: "returned",
  },
  {
    id: "a3",
    user: "Tech Team",
    avatar: "TT",
    action: "Sent for maintenance",
    gear: "DJI Mavic 3 Pro",
    time: "Yesterday",
    status: "maintenance",
  },
  {
    id: "a4",
    user: "Mikael Tadesse",
    avatar: "MT",
    action: "Overdue return",
    gear: "Sigma 24-70mm",
    time: "3 days ago",
    status: "overdue",
  },
  {
    id: "a5",
    user: "Sara Wolde",
    avatar: "SW",
    action: "Checked out",
    gear: "MacBook Pro M3",
    time: "Today, 8 AM",
    status: "checked-out",
  },
];

export const gearReservations: GearReservation[] = [
  {
    id: "r1",
    project: "Dawit & Meron Wedding",
    equipment: ["Sony FX3", "DJI Ronin RS4", "Aputure 600D"],
    dueDate: "May 25, 2026",
    client: "Dawit Bekele",
    urgency: "high",
  },
  {
    id: "r2",
    project: "Garden Ceremony Shoot",
    equipment: ["Canon R5", "Sigma 24-70mm", "Rode Wireless Pro"],
    dueDate: "May 28, 2026",
    client: "Liya Haile",
    urgency: "medium",
  },
  {
    id: "r3",
    project: "Rooftop Golden Hour",
    equipment: ["DJI Mavic 3 Pro", "Aputure 600D"],
    dueDate: "Jun 02, 2026",
    client: "Samuel Tesfaye",
    urgency: "low",
  },
];

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
