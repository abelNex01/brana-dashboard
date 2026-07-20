// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
  statusColor: string;
  accentColor: string;
  projects: number;
  completedProjects: number;
  rating: number;
  skills: string[];
  currentProject: string;
  location: string;
  phone: string;
  email: string;
  joined: string;
  avatar: string;
  image?: string;
}

export const defaultTeamMembers: TeamMember[] = [
  {
    id: "t1",
    name: "Abi Sala",
    role: "Lead Cinematographer",
    status: "In Field",
    statusColor: "#f97316",
    accentColor: "#f97316",
    projects: 3,
    completedProjects: 47,
    rating: 4.9,
    skills: ["Sony FX3", "Drone Ops", "Lighting"],
    currentProject: "Liya & Bereket Wedding",
    location: "Hilton Hotel, AA",
    phone: "+251 91 234 5678",
    email: "abi@branafilms.com",
    joined: "Jan 2022",
    avatar: "AS",
  },
  {
    id: "t2",
    name: "Hana Girma",
    role: "Senior Editor",
    status: "Editing",
    statusColor: "#a78bfa",
    accentColor: "#a78bfa",
    projects: 2,
    completedProjects: 63,
    rating: 4.8,
    skills: ["Premiere Pro", "DaVinci", "Color Grade"],
    currentProject: "Dawit & Meron — Final Cut",
    location: "Studio A",
    phone: "+251 92 345 6789",
    email: "hana@branafilms.com",
    joined: "Mar 2021",
    avatar: "HG",
  },
  {
    id: "t3",
    name: "Mikael Tadesse",
    role: "Drone Operator",
    status: "Available",
    statusColor: "#22c55e",
    accentColor: "#60a5fa",
    projects: 1,
    completedProjects: 29,
    rating: 4.7,
    skills: ["DJI Mavic", "Aerial Comp", "FPV"],
    currentProject: "Rooftop Shoot — Prep",
    location: "Studio B",
    phone: "+251 93 456 7890",
    email: "mikael@branafilms.com",
    joined: "Jun 2022",
    avatar: "MT",
  },
  {
    id: "t4",
    name: "Sara Wolde",
    role: "Editor & Colorist",
    status: "Post-Production",
    statusColor: "#fb923c",
    accentColor: "#fb923c",
    projects: 2,
    completedProjects: 38,
    rating: 4.9,
    skills: ["DaVinci", "Resolve FX", "Sound Mix"],
    currentProject: "Sunrise Ceremony — Export",
    location: "Remote",
    phone: "+251 94 567 8901",
    email: "sara@branafilms.com",
    joined: "Sep 2021",
    avatar: "SW",
  },
  {
    id: "t5",
    name: "John Brana",
    role: "Studio Director",
    status: "Online",
    statusColor: "#22c55e",
    accentColor: "#22c55e",
    projects: 5,
    completedProjects: 120,
    rating: 5.0,
    skills: ["Direction", "Client Mgmt", "Strategy"],
    currentProject: "Studio Operations",
    location: "HQ",
    phone: "+251 95 678 9012",
    email: "john@branafilms.com",
    joined: "Jan 2018",
    avatar: "JB",
  },
  {
    id: "t6",
    name: "Lemi Bekele",
    role: "Audio Engineer",
    status: "Off Duty",
    statusColor: "#94a3b8",
    accentColor: "#94a3b8",
    projects: 0,
    completedProjects: 22,
    rating: 4.6,
    skills: ["Rode Wireless", "Boom Ops", "Mix & Master"],
    currentProject: "—",
    location: "—",
    phone: "+251 96 789 0123",
    email: "lemi@branafilms.com",
    joined: "Nov 2023",
    avatar: "LB",
  },
];
