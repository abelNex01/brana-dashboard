import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from "react";
import type { FinanceState, FinanceAction, DeletedItem } from "@/types/finance";
import { loadFinanceState, saveFinanceState, subscribeToSync } from "@/services/financeService";
import { generateNotifications } from "@/utils/financeCalculations";
import { defaultFilters } from "@/utils/financeSeed";

interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
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

    // ─── EDITOR PAYMENTS ─────────────────────────────────────
    case "CREATE_EDITOR_PAYMENT":
      return {
        ...state,
        editorPayments: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.editorPayments],
      };
    case "UPDATE_EDITOR_PAYMENT":
      return {
        ...state,
        editorPayments: state.editorPayments.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_EDITOR_PAYMENT": {
      const item = state.editorPayments.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        editorPayments: state.editorPayments.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "editorPayments", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_EDITOR_PAYMENT":
      return {
        ...state,
        editorPayments: state.editorPayments.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "editorPayments" && (d.item as any).id === action.payload)
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

    // ─── INVOICES ────────────────────────────────────────────
    case "CREATE_INVOICE":
      return {
        ...state,
        invoices: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.invoices],
      };
    case "UPDATE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_INVOICE": {
      const item = state.invoices.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        invoices: state.invoices.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "invoices", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "invoices" && (d.item as any).id === action.payload)
        ),
      };

    // ─── BUDGETS ─────────────────────────────────────────────
    case "CREATE_BUDGET":
      return {
        ...state,
        budgets: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.budgets],
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_BUDGET": {
      const item = state.budgets.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        budgets: state.budgets.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "budgets", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "budgets" && (d.item as any).id === action.payload)
        ),
      };

    // ─── GEAR MAINTENANCE ────────────────────────────────────
    case "CREATE_GEAR":
      return {
        ...state,
        gearMaintenance: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.gearMaintenance],
      };
    case "UPDATE_GEAR":
      return {
        ...state,
        gearMaintenance: state.gearMaintenance.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_GEAR": {
      const item = state.gearMaintenance.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        gearMaintenance: state.gearMaintenance.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "gearMaintenance", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_GEAR":
      return {
        ...state,
        gearMaintenance: state.gearMaintenance.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "gearMaintenance" && (d.item as any).id === action.payload)
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

    // ─── TAX RECORDS ─────────────────────────────────────────
    case "CREATE_TAX":
      return {
        ...state,
        taxRecords: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.taxRecords],
      };
    case "UPDATE_TAX":
      return {
        ...state,
        taxRecords: state.taxRecords.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_TAX": {
      const item = state.taxRecords.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        taxRecords: state.taxRecords.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "taxRecords", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_TAX":
      return {
        ...state,
        taxRecords: state.taxRecords.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "taxRecords" && (d.item as any).id === action.payload)
        ),
      };

    // ─── SAVINGS GOALS ───────────────────────────────────────
    case "CREATE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.savingsGoals],
      };
    case "UPDATE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_SAVINGS_GOAL": {
      const item = state.savingsGoals.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "savingsGoals", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "savingsGoals" && (d.item as any).id === action.payload)
        ),
      };

    // ─── FINANCIAL GOALS ─────────────────────────────────────
    case "CREATE_FINANCIAL_GOAL":
      return {
        ...state,
        financialGoals: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.financialGoals],
      };
    case "UPDATE_FINANCIAL_GOAL":
      return {
        ...state,
        financialGoals: state.financialGoals.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_FINANCIAL_GOAL": {
      const item = state.financialGoals.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        financialGoals: state.financialGoals.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "financialGoals", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_FINANCIAL_GOAL":
      return {
        ...state,
        financialGoals: state.financialGoals.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "financialGoals" && (d.item as any).id === action.payload)
        ),
      };

    // ─── ACCOUNTS PAYABLE ────────────────────────────────────
    case "CREATE_AP":
      return {
        ...state,
        accountsPayable: [{ ...action.payload, createdAt: nowStr(), updatedAt: nowStr() }, ...state.accountsPayable],
      };
    case "UPDATE_AP":
      return {
        ...state,
        accountsPayable: state.accountsPayable.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates, updatedAt: nowStr() }
            : item
        ),
      };
    case "DELETE_AP": {
      const item = state.accountsPayable.find((x) => x.id === action.payload);
      if (!item) return state;
      return {
        ...state,
        accountsPayable: state.accountsPayable.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: true, updatedAt: nowStr() } : x
        ),
        deletedItems: [
          ...state.deletedItems,
          { type: "accountsPayable", item: { ...item }, deletedAt: Date.now() },
        ],
      };
    }
    case "RESTORE_AP":
      return {
        ...state,
        accountsPayable: state.accountsPayable.map((x) =>
          x.id === action.payload ? { ...x, isDeleted: false, updatedAt: nowStr() } : x
        ),
        deletedItems: state.deletedItems.filter(
          (d) => !(d.type === "accountsPayable" && (d.item as any).id === action.payload)
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

      if (entityType === "invoices" && "invoiceNumber" in duplicated) {
        duplicated.invoiceNumber = `${duplicated.invoiceNumber}-DUP`;
      }

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
  const [state, dispatch] = useReducer(financeReducer, null as any, () => {
    return loadFinanceState();
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveFinanceState(state);
  }, [state]);

  // Sync state between tabs
  useEffect(() => {
    const unsubscribe = subscribeToSync((newState) => {
      if (JSON.stringify(newState) !== JSON.stringify(state)) {
        dispatch({ type: "HYDRATE", payload: newState });
      }
    });
    return unsubscribe;
  }, [state]);

  // Periodically check/generate background alerts/notifications based on state
  useEffect(() => {
    if (!state) return;
    const computedNotifs = generateNotifications(state);
    
    // Check if we have new notifications that are not in the current state list
    const existingNotifKeys = new Set(state.notifications.map(n => `${n.type}-${n.entityId}`));
    const newNotifs = computedNotifs.filter(n => !existingNotifKeys.has(`${n.type}-${n.entityId}`));
    
    if (newNotifs.length > 0) {
      newNotifs.forEach(notif => {
        dispatch({ type: "ADD_NOTIFICATION", payload: notif });
      });
    }
  }, [state?.income, state?.expenses, state?.subscriptions, state?.payroll, state?.gearMaintenance]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinanceContext must be used within a FinanceProvider");
  }
  return context;
}
