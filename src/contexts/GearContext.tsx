import React, { createContext, useContext, useMemo } from "react";
import { useCrudStore, generateId } from "@/hooks/use-crud-store";
import { gearItems as defaultGearItems, type GearItem } from "@/features/gear/gearData";

interface GearContextType {
  gearItems: GearItem[];
  addGearItem: (item: Omit<GearItem, "id" | "lastMaintenance">) => void;
  updateGearItem: (id: string, updates: Partial<GearItem>) => void;
  removeGearItem: (id: string) => void;
  getGearItemById: (id: string) => GearItem | undefined;
}

const GearContext = createContext<GearContextType | undefined>(undefined);

export function GearProvider({ children }: { children: React.ReactNode }) {
  const { items: gearItems, create, update, remove, getById } = useCrudStore<GearItem>("gearItems", defaultGearItems);

  const addGearItem = (item: Omit<GearItem, "id" | "lastMaintenance">) => {
    create({
      ...item,
      id: generateId("gear"),
      lastMaintenance: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    });
  };

  const value = useMemo(() => ({
    gearItems,
    addGearItem,
    updateGearItem: update,
    removeGearItem: remove,
    getGearItemById: getById,
  }), [gearItems, update, remove, getById]);

  return (
    <GearContext.Provider value={value}>
      {children}
    </GearContext.Provider>
  );
}

export function useGear() {
  const context = useContext(GearContext);
  if (!context) throw new Error("useGear must be used within a GearProvider");
  return context;
}
