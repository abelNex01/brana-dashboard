import { useState, useCallback, useEffect } from "react";

/**
 * Generic CRUD store backed by localStorage.
 * Each store instance manages a typed array of items with a unique `id` field.
 */
export function useCrudStore<T extends { id: string }>(
  storageKey: string,
  defaultItems: T[]
) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as T[];
        // Deduplicate items by id
        const unique = Array.from(new Map(parsed.map(item => [item.id, item])).values());
        return unique;
      }
    } catch { /* ignore */ }
    return defaultItems;
  });

  // Helper to deduplicate items by id
  const deduplicate = (items: T[]) => {
    return Array.from(new Map(items.map(item => [item.id, item])).values());
  };

  // Sync from other components in real time via custom DOM events
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<T[]>;
      if (customEvent.detail) {
        setItems(deduplicate(customEvent.detail));
      } else {
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) setItems(deduplicate(JSON.parse(stored) as T[]));
        } catch { /* ignore */ }
      }
    };

    window.addEventListener(`crud-sync-${storageKey}`, handleSync);
    return () => {
      window.removeEventListener(`crud-sync-${storageKey}`, handleSync);
    };
  }, [storageKey]);

  const create = useCallback((item: T) => {
    setItems((prev) => {
      const next = deduplicate([item, ...prev]);
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(`crud-sync-${storageKey}`, { detail: next }));
      return next;
    });
  }, [storageKey]);

  const update = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) => {
      const next = deduplicate(prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(`crud-sync-${storageKey}`, { detail: next }));
      return next;
    });
  }, [storageKey]);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = deduplicate(prev.filter((item) => item.id !== id));
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(`crud-sync-${storageKey}`, { detail: next }));
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setItems(defaultItems);
    localStorage.removeItem(storageKey);
    window.dispatchEvent(new CustomEvent(`crud-sync-${storageKey}`, { detail: defaultItems }));
  }, [defaultItems, storageKey]);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  return { items, setItems, create, update, remove, reset, getById };
}

/** Generate a cryptographically random unique ID */
export function generateId(prefix = "id") {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const random = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${Date.now()}_${random}`;
}
