import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

interface DashboardContextType {
  isNotificationOpen: boolean;
  toggleNotification: () => void;
  setNotificationOpen: (open: boolean) => void;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleNotification = useCallback(() => setNotificationOpen((prev) => !prev), []);
  const toggleSidebar = useCallback(() => setSidebarExpanded((prev) => !prev), []);

  const value = useMemo(
    () => ({
      isNotificationOpen,
      toggleNotification,
      setNotificationOpen,
      isSidebarExpanded,
      toggleSidebar,
    }),
    [isNotificationOpen, toggleNotification, isSidebarExpanded, toggleSidebar]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
