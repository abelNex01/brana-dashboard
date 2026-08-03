import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useFinanceContext } from "./FinanceContext";
import { useGear } from "./GearContext";
import { useTeam } from "./TeamContext";

export interface SearchResult {
  id: string;
  type: "income" | "expense" | "payroll" | "subscription" | "gear" | "team";
  title: string;
  subtitle: string;
  page: string;
  icon: string;
}

interface SearchContextType {
  searchResults: (query: string) => SearchResult[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const { state: financeState } = useFinanceContext();
  const { gearItems } = useGear();
  const { teamMembers } = useTeam();

  const searchResults = useMemo(() => {
    return (query: string): SearchResult[] => {
      if (!query.trim()) return [];

      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search income
      financeState.income
        .filter((item) => !item.isDeleted)
        .forEach((item) => {
          if (
            item.clientName?.toLowerCase().includes(lowerQuery) ||
            item.eventName?.toLowerCase().includes(lowerQuery) ||
            item.category?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: item.id,
              type: "income",
              title: item.clientName || "Unknown Client",
              subtitle: item.eventName || "Income",
              page: "/dashboard/wallet",
              icon: "💰",
            });
          }
        });

      // Search expenses
      financeState.expenses
        .filter((item) => !item.isDeleted)
        .forEach((item) => {
          if (
            item.vendor?.toLowerCase().includes(lowerQuery) ||
            item.category?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: item.id,
              type: "expense",
              title: item.vendor || "Unknown Vendor",
              subtitle: item.category || "Expense",
              page: "/dashboard/wallet",
              icon: "📤",
            });
          }
        });

      // Search payroll
      financeState.payroll
        .filter((item) => !item.isDeleted)
        .forEach((item) => {
          if (
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.role?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: item.id,
              type: "payroll",
              title: item.name || "Unknown Employee",
              subtitle: item.role || "Payroll",
              page: "/dashboard/wallet",
              icon: "💼",
            });
          }
        });

      // Search subscriptions
      financeState.subscriptions
        .filter((item) => !item.isDeleted)
        .forEach((item) => {
          if (
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.provider?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: item.id,
              type: "subscription",
              title: item.name || "Unknown Subscription",
              subtitle: item.provider || "Subscription",
              page: "/dashboard/wallet",
              icon: "🔄",
            });
          }
        });

      // Search gear
      gearItems.forEach((item) => {
        if (
          item.name?.toLowerCase().includes(lowerQuery) ||
          item.model?.toLowerCase().includes(lowerQuery) ||
          item.category?.toLowerCase().includes(lowerQuery) ||
          item.assignedTo?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: item.id,
            type: "gear",
            title: item.name || "Unknown Gear",
            subtitle: `${item.category} · ${item.model}`,
            page: "/dashboard/gears",
            icon: "🎥",
          });
        }
      });

      // Search team members
      teamMembers.forEach((member) => {
        if (
          member.name?.toLowerCase().includes(lowerQuery) ||
          member.role?.toLowerCase().includes(lowerQuery) ||
          member.currentProject?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: member.id,
            type: "team",
            title: member.name || "Unknown Member",
            subtitle: member.role || "Team Member",
            page: "/dashboard/team",
            icon: "👤",
          });
        }
      });

      return results.slice(0, 10); // Limit to 10 results
    };
  }, [financeState, gearItems, teamMembers]);

  const value = useMemo(() => ({ searchResults }), [searchResults]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
