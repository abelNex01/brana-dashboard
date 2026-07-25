import { useMemo } from "react";
import { useFinanceContext } from "@/contexts/FinanceContext";
import type {
  IncomeTransaction,
  ExpenseRecord,
  PayrollEntry,
  Subscription,
  FinanceNotification,
  AuditEntry,
  CashFlowPeriod,
} from "@/types/finance";
import { generateId } from "@/utils/formatters";
import {
  calculateCashFlow,
  calculateProfitAnalytics,
} from "@/utils/financeCalculations";

// Generic helper to create CRUD selectors for state fields
function createCrudHook<T extends { id: string; isDeleted: boolean }, TCreatePayload, TUpdatePayload>(
  field: keyof import("@/types/finance").FinanceState,
  createActionType: string,
  updateActionType: string,
  deleteActionType: string,
  restoreActionType: string,
  idPrefix: string
) {
  return () => {
    const { state, dispatch } = useFinanceContext();
    const items = useMemo(() => {
      const arr = (state[field] as any) as T[];
      return arr.filter((x) => !x.isDeleted);
    }, [state[field]]);

    const allItems = (state[field] as any) as T[];

    const create = (data: TCreatePayload) => {
      const id = generateId(idPrefix);
      const payload = {
        id,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      dispatch({ type: createActionType as any, payload } as any);
      return payload;
    };

    const update = (id: string, updates: TUpdatePayload) => {
      dispatch({
        type: updateActionType as any,
        payload: { id, updates },
      } as any);
    };

    const remove = (id: string) => {
      dispatch({ type: deleteActionType as any, payload: id } as any);
    };

    const restore = (id: string) => {
      dispatch({ type: restoreActionType as any, payload: id } as any);
    };

    return { items, allItems, create, update, remove, restore };
  };
}

export const useIncome = createCrudHook<
  IncomeTransaction,
  Omit<IncomeTransaction, "id" | "isDeleted" | "createdAt" | "updatedAt">,
  Partial<IncomeTransaction>
>("income", "CREATE_INCOME", "UPDATE_INCOME", "DELETE_INCOME", "RESTORE_INCOME", "inc");

export const useExpenses = createCrudHook<
  ExpenseRecord,
  Omit<ExpenseRecord, "id" | "isDeleted" | "createdAt" | "updatedAt">,
  Partial<ExpenseRecord>
>("expenses", "CREATE_EXPENSE", "UPDATE_EXPENSE", "DELETE_EXPENSE", "RESTORE_EXPENSE", "exp");

export const usePayroll = createCrudHook<
  PayrollEntry,
  Omit<PayrollEntry, "id" | "isDeleted" | "createdAt" | "updatedAt">,
  Partial<PayrollEntry>
>("payroll", "CREATE_PAYROLL", "UPDATE_PAYROLL", "DELETE_PAYROLL", "RESTORE_PAYROLL", "pay");

export const useSubscriptions = createCrudHook<
  Subscription,
  Omit<Subscription, "id" | "isDeleted" | "createdAt" | "updatedAt">,
  Partial<Subscription>
>("subscriptions", "CREATE_SUBSCRIPTION", "UPDATE_SUBSCRIPTION", "DELETE_SUBSCRIPTION", "RESTORE_SUBSCRIPTION", "sub");

export const useNotifications = () => {
  const { state, dispatch } = useFinanceContext();

  const items = state.notifications;

  const markRead = (id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  };

  const clear = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

  const add = (data: Omit<FinanceNotification, "id" | "date" | "read">) => {
    const id = generateId("notif");
    const payload: FinanceNotification = {
      id,
      date: new Date().toISOString(),
      read: false,
      ...data,
    };
    dispatch({ type: "ADD_NOTIFICATION", payload });
  };

  return { items, markRead, clear, add };
};

export const useAuditLog = () => {
  const { state, dispatch } = useFinanceContext();

  const items = state.auditLog;

  const logAction = (
    action: import("@/types/finance").AuditAction,
    entityType: string,
    entityId: string,
    entityName: string,
    previousValue: string = "",
    newValue: string = "",
    description: string = ""
  ) => {
    const id = generateId("audit");
    const payload: AuditEntry = {
      id,
      action,
      entityType,
      entityId,
      entityName,
      timestamp: new Date().toISOString(),
      userId: "user_admin", // Demo default
      previousValue,
      newValue,
      description,
    };
    dispatch({ type: "ADD_AUDIT_ENTRY", payload });
  };

  return { items, logAction };
};

export const useCashFlow = (period: CashFlowPeriod) => {
  const { state } = useFinanceContext();
  return useMemo(() => calculateCashFlow(state.income, state.expenses, period), [state.income, state.expenses, period]);
};

export const useProfitAnalytics = () => {
  const { state } = useFinanceContext();
  return useMemo(() => calculateProfitAnalytics(state.income, state.expenses), [state.income, state.expenses]);
};
