import React, { createContext, useContext, useMemo } from "react";
import { useCrudStore, generateId } from "@/hooks/use-crud-store";
import { defaultTeamMembers, type TeamMember } from "@/features/team/teamData";

interface TeamContextType {
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, "id" | "projects" | "completedProjects" | "rating" | "joined">) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  resetTeamMembers: () => void;
  getTeamMemberById: (id: string) => TeamMember | undefined;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { items: teamMembers, create, update, remove, reset, getById } = useCrudStore<TeamMember>("teamMembers", defaultTeamMembers);

  const addTeamMember = (member: Omit<TeamMember, "id" | "projects" | "completedProjects" | "rating" | "joined">) => {
    create({
      ...member,
      id: generateId("member"),
      projects: 0,
      completedProjects: 0,
      rating: 5.0,
      joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  };

  const value = useMemo(() => ({
    teamMembers,
    addTeamMember,
    updateTeamMember: update,
    removeTeamMember: remove,
    resetTeamMembers: reset,
    getTeamMemberById: getById,
  }), [teamMembers, update, remove, reset, getById]);

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeam must be used within a TeamProvider");
  return context;
}
