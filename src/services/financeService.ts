import type { FinanceState } from "@/types/finance";
import { createInitialFinanceState, defaultFilters } from "@/utils/financeSeed";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import type { JsonObject } from "@/types/common";

const SYNC_EVENT = "brana-finance-sync";
const FINANCE_ROW_ID = "single_instance";

export function createEmptyFinanceState(): FinanceState {
  return {
    income: [],
    expenses: [],
    payroll: [],
    subscriptions: [],
    notifications: [],
    auditLog: [],
    filters: defaultFilters,
    deletedItems: [],
  };
}

function mergeFinanceState(parsed: Partial<FinanceState>): FinanceState {
  const defaults = createInitialFinanceState();
  return {
    income: parsed.income ?? [],
    expenses: parsed.expenses ?? [],
    payroll: parsed.payroll ?? [],
    subscriptions: parsed.subscriptions ?? [],
    notifications: parsed.notifications ?? defaults.notifications,
    auditLog: parsed.auditLog ?? defaults.auditLog,
    filters: parsed.filters ?? defaults.filters,
    deletedItems: parsed.deletedItems ?? defaults.deletedItems,
  };
}

// ─── Persistence ─────────────────────────────────────────────

export async function loadFinanceState(): Promise<FinanceState> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      logger.warn("[FinanceService] No active session, using empty finance state");
      return createEmptyFinanceState();
    }

    const { data, error } = await supabase
      .from("finance_state")
      .select("state_blob")
      .eq("id", FINANCE_ROW_ID)
      .maybeSingle();

    if (error) {
      logger.error("[FinanceService] Error fetching finance state", error);
      return createEmptyFinanceState();
    }

    if (data?.state_blob) {
      const parsed = data.state_blob as Partial<FinanceState>;
      return mergeFinanceState(parsed);
    }

    // No row yet — seed demo data once and persist it.
    const initial = createInitialFinanceState();
    await persistFinanceState(initial);
    return initial;
  } catch (e) {
    logger.warn("Failed to load finance state from Supabase, falling back to empty data", e);
    return createEmptyFinanceState();
  }
}

let _saveTimer: ReturnType<typeof setTimeout> | null = null;
let _pendingState: FinanceState | null = null;

async function persistFinanceState(state: FinanceState): Promise<boolean> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      logger.warn("[FinanceService] No active session, skipping save");
      return false;
    }

    const { error } = await supabase.from("finance_state").upsert(
      {
        id: FINANCE_ROW_ID,
        state_blob: state as unknown as JsonObject,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      logger.error("[FinanceService] Error saving to Supabase", error);
      return false;
    }

    logger.debug("[FinanceService] Finance state saved to Supabase");
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: state }));
    return true;
  } catch (e) {
    logger.warn("[FinanceService] Failed to save state to Supabase", e);
    return false;
  }
}

export async function flushFinanceStateSave(): Promise<void> {
  if (_saveTimer) {
    clearTimeout(_saveTimer);
    _saveTimer = null;
  }

  if (!_pendingState) return;

  const stateToSave = _pendingState;
  _pendingState = null;
  await persistFinanceState(stateToSave);
}

export async function saveFinanceState(state: FinanceState): Promise<void> {
  _pendingState = state;

  if (_saveTimer) {
    clearTimeout(_saveTimer);
  }

  return new Promise((resolve) => {
    _saveTimer = setTimeout(async () => {
      _saveTimer = null;
      if (_pendingState) {
        const stateToSave = _pendingState;
        _pendingState = null;
        await persistFinanceState(stateToSave);
      }
      resolve();
    }, 400);
  });
}

export function clearFinanceState(): void {
  // Can delete from Supabase if needed, but not recommended for client-side
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
  
  // Realtime subscription via Supabase
  const channel = supabase.channel('finance_state_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_state' }, payload => {
       const newPayload = payload.new as JsonObject;
       if (newPayload && newPayload.state_blob) {
         callback(newPayload.state_blob as FinanceState);
       }
    })
    .subscribe();
    
  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    supabase.removeChannel(channel);
  };
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
