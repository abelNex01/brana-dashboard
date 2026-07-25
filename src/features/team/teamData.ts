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

export const defaultTeamMembers: TeamMember[] = [];
