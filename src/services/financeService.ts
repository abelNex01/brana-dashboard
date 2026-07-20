/**
 * financeService.ts
 * ─────────────────────────────────────────────────────────────
 * Repository-pattern service layer for financial data.
 *
 * Currently backed by localStorage. Designed so swapping to
 * Supabase / Firebase / Prisma requires changing only this file.
 * ─────────────────────────────────────────────────────────────
 */

import type { FinanceState } from "@/types/finance";
import { createInitialFinanceState } from "@/utils/financeSeed";

const STORAGE_KEY = "brana_finance_state";
const SYNC_EVENT = "brana-finance-sync";

// ─── Persistence ─────────────────────────────────────────────

export function loadFinanceState(): FinanceState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<FinanceState>;
      // Merge with defaults to handle schema migrations
      const defaults = createInitialFinanceState();
      return {
        ...defaults,
        ...parsed,
        // Ensure new arrays exist even if stored data was from an older schema
        income: parsed.income ?? defaults.income,
        expenses: parsed.expenses ?? defaults.expenses,
        editorPayments: parsed.editorPayments ?? defaults.editorPayments,
        payroll: parsed.payroll ?? defaults.payroll,
        invoices: parsed.invoices ?? defaults.invoices,
        budgets: parsed.budgets ?? defaults.budgets,
        gearMaintenance: parsed.gearMaintenance ?? defaults.gearMaintenance,
        subscriptions: parsed.subscriptions ?? defaults.subscriptions,
        taxRecords: parsed.taxRecords ?? defaults.taxRecords,
        savingsGoals: parsed.savingsGoals ?? defaults.savingsGoals,
        financialGoals: parsed.financialGoals ?? defaults.financialGoals,
        accountsPayable: parsed.accountsPayable ?? defaults.accountsPayable,
        notifications: parsed.notifications ?? defaults.notifications,
        auditLog: parsed.auditLog ?? defaults.auditLog,
        filters: parsed.filters ?? defaults.filters,
        deletedItems: parsed.deletedItems ?? defaults.deletedItems,
      };
    }
  } catch {
    /* corrupted data — fall through to defaults */
  }
  return createInitialFinanceState();
}

export function saveFinanceState(state: FinanceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Cross-tab / cross-component sync
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: state }));
  } catch {
    console.warn("[FinanceService] Failed to save state to localStorage");
  }
}

export function clearFinanceState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Sync Listener (for cross-tab) ──────────────────────────

export function subscribeToSync(callback: (state: FinanceState) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<FinanceState>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };
  window.addEventListener(SYNC_EVENT, handler);
  return () => window.removeEventListener(SYNC_EVENT, handler);
}

// ─── Export Utilities ────────────────────────────────────────

export function exportToJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: (keyof T)[]
): string {
  const headerRow = headers.join(",");
  const rows = data.map((item) =>
    headers
      .map((h) => {
        const val = item[h];
        const str = val === null || val === undefined ? "" : String(val);
        // Escape commas and quotes
        return str.includes(",") || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(",")
  );
  return [headerRow, ...rows].join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Future API Integration Points ──────────────────────────
//
// When migrating to Supabase/Firebase/Prisma, replace the
// loadFinanceState() and saveFinanceState() functions with
// async API calls. The rest of the application code (contexts,
// hooks, components) will remain unchanged.
//
// Example:
//
// export async function loadFinanceState(): Promise<FinanceState> {
//   const { data } = await supabase.from('finance_state').select('*').single();
//   return data as FinanceState;
// }
//
// export async function saveFinanceState(state: FinanceState): Promise<void> {
//   await supabase.from('finance_state').upsert(state);
// }
