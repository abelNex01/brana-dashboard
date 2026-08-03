import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import type { JsonObject } from "@/types/common";

// Helper to convert snake_case object to camelCase
function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(v => toCamelCase(v));
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as JsonObject).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamelCase((obj as JsonObject)[key]);
      return result;
    }, {} as JsonObject);
  }
  return obj;
}

// Helper to convert camelCase object to snake_case
function toSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(v => toSnakeCase(v));
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as JsonObject).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase((obj as JsonObject)[key]);
      return result;
    }, {} as JsonObject);
  }
  return obj;
}

// Allowed column names for live Supabase tables to prevent PGRST204 errors
const TABLE_SCHEMA_COLUMNS: Record<string, string[]> = {
  gear_items: [
    "id",
    "name",
    "model",
    "category",
    "status",
    "condition",
    "image",
    "serial_number",
    "created_at",
  ],
  team_members: [
    "id",
    "name",
    "role",
    "status",
    "status_color",
    "accent_color",
    "projects",
    "completed_projects",
    "rating",
    "skills",
    "current_project",
    "location",
    "phone",
    "email",
    "joined",
    "avatar",
    "image",
    "created_at",
  ],
  chat_messages: ["id", "sender_id", "content", "created_at"],
  finance_state: ["id", "state_blob", "created_at", "updated_at"],
  schedule_events: [
    "id",
    "title",
    "date",
    "start_time",
    "end_time",
    "category",
    "location",
    "description",
    "color",
    "created_at",
  ],
};

function sanitizeDbPayload(
  tableName: string,
  obj: Record<string, unknown>
): Record<string, unknown> {
  const allowed = TABLE_SCHEMA_COLUMNS[tableName];
  if (!allowed) return obj;

  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (allowed.includes(key) && obj[key] !== undefined) {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
}

/**
 * Generic CRUD store backed by Supabase.
 * Automatically converts camelCase storage keys (e.g., 'teamMembers') 
 * to snake_case table names (e.g., 'team_members').
 */
export function useCrudStore<T extends { id: string }>(
  storageKey: string,
  defaultItems: T[]
) {
  const [items, setItems] = useState<T[]>(defaultItems);
  
  // Convert camelCase to snake_case (teamMembers -> team_members)
  const tableName = storageKey.replace(/([A-Z])/g, "_$1").toLowerCase();

  // Helper to deduplicate items by id
  const deduplicate = (list: T[]) => {
    return Array.from(new Map(list.map(item => [item.id, item])).values());
  };

  // Fetch initial data from Supabase
  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (cancelled) return;
      if (error) {
        logger.error(`Error fetching from ${tableName}`, error);
        return;
      }
      if (data && data.length > 0) {
        // Convert fetched snake_case rows into frontend camelCase
        const fetchedItems = toCamelCase(data) as T[];
        
        // Merge with default items to preserve default UI fields if table missing optional columns
        const defaultMap = new Map(defaultItems.map(i => [i.id, i]));
        const mergedItems = fetchedItems.map(item => ({
          ...(defaultMap.get(item.id) || {}),
          ...item,
        })) as T[];

        // Combine fetched items with remaining default items not present in DB
        const fetchedIds = new Set(fetchedItems.map(i => i.id));
        const remainingDefaults = defaultItems.filter(i => !fetchedIds.has(i.id));

        if (!cancelled) {
          setItems(deduplicate([...mergedItems, ...remainingDefaults]));
        }
      }
    };
    
    fetchItems();

    // Subscribe to realtime changes (inserts, updates, deletes)
    const channel = supabase.channel(`crud_sync_${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
        if (cancelled) return;
        if (payload.eventType === 'INSERT') {
          const newCamelItem = toCamelCase(payload.new) as T;
          setItems(prev => deduplicate([newCamelItem, ...prev]));
        } else if (payload.eventType === 'UPDATE') {
          const updatedCamelItem = toCamelCase(payload.new) as T;
          setItems(prev => deduplicate(prev.map(item => item.id === updatedCamelItem.id ? { ...item, ...updatedCamelItem } : item)));
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [tableName]);

  const create = useCallback(async (item: T) => {
    // Optimistic UI update
    setItems((prev) => deduplicate([item, ...prev]));
    
    // Convert to snake_case and sanitize payload for Supabase
    const dbItem = sanitizeDbPayload(tableName, toSnakeCase(item) as Record<string, unknown>);
    
    // Insert into Supabase
    const { error } = await supabase.from(tableName).insert([dbItem]);
    if (error) {
      logger.error(`Error inserting into ${tableName}`, error);
      // If error is unauthorized or RLS, warn user, but keep local item if user wants to see it
      if (error.code === "42501") {
        logger.warn(`RLS error inserting into ${tableName}. Ensure user is logged in.`);
      }
    }
  }, [tableName]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    // Save original item for rollback
    let originalItem: T | undefined;
    
    // Optimistic UI update
    setItems((prev) => deduplicate(prev.map((item) => {
      if (item.id === id) {
        originalItem = item;
        return { ...item, ...updates };
      }
      return item;
    })));
    
    // Convert to snake_case and sanitize updates for Supabase
    const dbUpdates = sanitizeDbPayload(tableName, toSnakeCase(updates) as Record<string, unknown>);
    
    if (Object.keys(dbUpdates).length > 0) {
      // Update in Supabase
      const { error } = await supabase.from(tableName).update(dbUpdates).eq('id', id);
      if (error) {
        logger.error(`Error updating ${tableName}`, error);
      }
    }
  }, [tableName]);

  const remove = useCallback(async (id: string) => {
    // Save original item for rollback
    let itemToRestore: T | undefined;
    
    // Optimistic UI update
    setItems((prev) => {
      itemToRestore = prev.find((item) => item.id === id);
      return prev.filter((item) => item.id !== id);
    });
    
    // Delete in Supabase
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      logger.error(`Error deleting from ${tableName}`, error);
      // Rollback optimistic update if database deletion explicitly failed
      if (itemToRestore && error.code !== "42501") {
        const toRestore = itemToRestore;
        setItems((prev) => deduplicate([...prev, toRestore]));
      }
    }
  }, [tableName]);

  const reset = useCallback(async () => {
    setItems(defaultItems);
    logger.warn(`Reset called on ${tableName}, ignoring remote reset for safety.`);
  }, [defaultItems, tableName]);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  return { items, setItems, create, update, remove, reset, getById };
}

/** Generate a UUID string suitable for Supabase UUID columns */
export function generateId(prefix = "") {
  return crypto.randomUUID();
}
