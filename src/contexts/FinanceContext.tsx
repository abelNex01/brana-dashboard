import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from "react";
import { logger } from "@/utils/logger";
import type { FinanceState, FinanceAction, DeletedItem } from "@/types/finance";
import {
  loadFinanceState,
  saveFinanceState,
  subscribeToSync,
  createEmptyFinanceState,
  flushFinanceStateSave,
} from "@/services/financeService";
import { generateNotifications } from "@/utils/financeCalculations";
import { defaultFilters } from "@/utils/financeSeed";
import { useAuth } from "@/contexts/AuthContext";

interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  isFinanceReady: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  const nowStr = () => new Date().toISOString();

  switch (action.type) {
    // ─── INCOME ──────────────────────────────────────────────
    case "CREATE_INCOME":
      return {
        ...state,
        income: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.income],
      };
    case "UPDATE_INCOME":
      return {
        ...state,
        income: state.income.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_INCOME": {
      const item = state.income.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        income: state.income.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "income", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_INCOME":
      return {
        ...state,
        income: state.income.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "income" && (d.item as any).id === action.payload)
        ),
      };

    // ─── EXPENSES ────────────────────────────────────────────
    case "CREATE_EXPENSE":
      return {
        ...state,
        expenses: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.expenses],
      };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_EXPENSE": {
      const item = state.expenses.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        expenses: state.expenses.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "expenses", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "expenses" && (d.item as any).id === action.payload)
        ),
      };

    // ─── PAYROLL ─────────────────────────────────────────────
    case "CREATE_PAYROLL":
      return {
        ...state,
        payroll: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.payroll],
      };
    case "UPDATE_PAYROLL":
      return {
        ...state,
        payroll: state.payroll.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_PAYROLL": {
      const item = state.payroll.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        payroll: state.payroll.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "payroll", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_PAYROLL":
      return {
        ...state,
        payroll: state.payroll.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "payroll" && (d.item as any).id === action.payload)
        ),
      };

    // ─── SUBSCRIPTIONS ───────────────────────────────────────
    case "CREATE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.subscriptions],
      };
    case "UPDATE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: state.subscriptions.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_SUBSCRIPTION": {
      const item = state.subscriptions.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        subscriptions: state.subscriptions.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "subscriptions", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: state.subscriptions.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "subscriptions" && (d.item as any).id === action.payload)
        ),
      };

    // ─── NOTIFICATIONS ────────────────────────────────────────
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      };

    // ─── AUDIT ───────────────────────────────────────────────
    case "ADD_AUDIT_ENTRY":
      return {
        ...state,
        auditLog: [action.payload, ...state.auditLog],
      };

    // ─── FILTERS ─────────────────────────────────────────────
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case "RESET_FILTERS":
      return {
        ...state,
        filters: defaultFilters,
      };

    // ─── BULK OPERATIONS ─────────────────────────────────────
    case "BULK_DELETE": {
      const { entityType, ids } = action.payload;
      const targetKey = entityType as keyof FinanceState;
      if (!Array.isArray(state[targetKey])) return state;

      const newDeleted: DeletedItem[] = [];
      const updatedArray = (state[targetKey] as any[]).map((item) => {
        if (ids.includes(item.id)) {
          newDeleted.push({ type: entityType, item: { ...item }, deletedAt: Date.now() });
          return { ...item, isDeleted: true, updatedAt: nowStr() };
        }
        return item;
      });

      return {
        ...state,
        [targetKey]: updatedArray,
        deletedItems: [...state.deletedItems, ...newDeleted],
      };
    }

    case "BULK_UPDATE_STATUS": {
      const { entityType, ids, status } = action.payload;
      const targetKey = entityType as keyof FinanceState;
      if (!Array.isArray(state[targetKey])) return state;

      const updatedArray = (state[targetKey] as any[]).map((item) => {
        if (ids.includes(item.id)) {
          return { ...item, status, updatedAt: nowStr() };
        }
        return item;
      });

      return {
        ...state,
        [targetKey]: updatedArray,
      };
    }

    // ─── DUPLICATE RECORD ────────────────────────────────────
    case "DUPLICATE_RECORD": {
      const { entityType, id, newId } = action.payload;
      const targetKey = entityType as keyof FinanceState;
      if (!Array.isArray(state[targetKey])) return state;

      const original = (state[targetKey] as any[]).find((x) => x.id === id);
      if (!original) return state;

      const duplicated = {
        ...original,
        id: newId,
        createdAt: nowStr(),
        updatedAt: nowStr(),
        isDeleted: false,
      };

      return {
        ...state,
        [targetKey]: [duplicated, ...(state[targetKey] as any[])],
      };
    }

    // ─── RESET & HYDRATE ─────────────────────────────────────
    case "RESET_DATA":
      return action.payload;
    case "HYDRATE":
      return action.payload;

    default:
      return state;
  }
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(financeReducer, createEmptyFinanceState());
  const [isFinanceReady, setIsFinanceReady] = React.useState(false);

  // Track whether the current state change is a hydration (load from DB) vs. a user action.
  const isHydrating = React.useRef(false);
  const lastSavedAt = React.useRef(0);

  // Load or reset finance state when auth status changes
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      isHydrating.current = true;
      dispatch({ type: "HYDRATE", payload: createEmptyFinanceState() });
      setIsFinanceReady(true);
      return;
    }

    setIsFinanceReady(false);
    isHydrating.current = true;

    loadFinanceState().then((initialState) => {
      if (cancelled) return;
      dispatch({ type: "HYDRATE", payload: initialState });
      setIsFinanceReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Save state to Supabase whenever it changes — but skip hydration writes
  useEffect(() => {
    if (!isAuthenticated || !isFinanceReady) return;

    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }

    lastSavedAt.current = Date.now();
    saveFinanceState(state).catch((err) =>
      logger.warn("Failed to save finance state", err),
    );
  }, [state, isAuthenticated, isFinanceReady]);

  // Flush pending saves when the tab is hidden or closed
  useEffect(() => {
    const handleFlush = () => {
      void flushFinanceStateSave();
    };

    window.addEventListener("pagehide", handleFlush);
    window.addEventListener("beforeunload", handleFlush);

    return () => {
      window.removeEventListener("pagehide", handleFlush);
      window.removeEventListener("beforeunload", handleFlush);
    };
  }, []);

  // Sync state between tabs via custom event / realtime channel
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribeToSync((newState) => {
      // Ignore stale realtime events that arrive right after our own save
      if (Date.now() - lastSavedAt.current < 1000) return;

      isHydrating.current = true;
      dispatch({ type: "HYDRATE", payload: newState });
    });

    return unsubscribe;
  }, [isAuthenticated]);

  // Periodically check/generate background alerts/notifications based on state
  useEffect(() => {
    if (!isFinanceReady) return;

    const computedNotifs = generateNotifications(state);
    const existingNotifKeys = new Set(state.notifications.map((n) => `${n.type}-${n.entityId}`));
    const newNotifs = computedNotifs.filter(
      (n) => !existingNotifKeys.has(`${n.type}-${n.entityId}`),
    );

    if (newNotifs.length > 0) {
      newNotifs.forEach((notif) => {
        dispatch({ type: "ADD_NOTIFICATION", payload: notif });
      });
    }
  }, [isFinanceReady, state.income, state.expenses, state.subscriptions, state.payroll]);

  const value = useMemo(
    () => ({ state, dispatch, isFinanceReady }),
    [state, isFinanceReady],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinanceContext must be used within a FinanceProvider");
  }
  return context;
}
