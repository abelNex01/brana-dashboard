/// <reference types="vitest" />
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrudStore, generateId } from "../hooks/use-crud-store";

interface TestItem {
  id: string;
  name: string;
}

describe("useCrudStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default items when localStorage is empty", () => {
    const defaults: TestItem[] = [{ id: "1", name: "Test" }];
    const { result } = renderHook(() => useCrudStore<TestItem>("test-key", defaults));
    expect(result.current.items).toEqual(defaults);
  });

  it("loads items from localStorage", () => {
    const stored: TestItem[] = [{ id: "2", name: "Stored" }];
    localStorage.setItem("test-load", JSON.stringify(stored));
    const { result } = renderHook(() => useCrudStore<TestItem>("test-load", []));
    expect(result.current.items).toEqual(stored);
  });

  it("creates a new item", () => {
    const { result } = renderHook(() => useCrudStore<TestItem>("test-create", []));
    const newItem: TestItem = { id: "3", name: "New" };
    act(() => {
      result.current.create(newItem);
    });
    expect(result.current.items).toContainEqual(newItem);
  });

  it("updates an existing item", () => {
    const defaults: TestItem[] = [{ id: "4", name: "Original" }];
    const { result } = renderHook(() => useCrudStore<TestItem>("test-update", defaults));
    act(() => {
      result.current.update("4", { name: "Updated" });
    });
    const stored = JSON.parse(localStorage.getItem("test-update") || "[]");
    expect(stored[0].name).toBe("Updated");
  });

  it("removes an item", () => {
    const defaults: TestItem[] = [{ id: "5", name: "ToDelete" }];
    const { result } = renderHook(() => useCrudStore<TestItem>("test-remove", defaults));
    act(() => {
      result.current.remove("5");
    });
    const stored = JSON.parse(localStorage.getItem("test-remove") || "[]");
    expect(stored).toHaveLength(0);
  });

  it("deduplicates items by id", () => {
    const stored = [
      { id: "6", name: "First" },
      { id: "6", name: "Duplicate" },
    ];
    localStorage.setItem("test-dedup", JSON.stringify(stored));
    const { result } = renderHook(() => useCrudStore<TestItem>("test-dedup", []));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Duplicate");
  });
});

describe("generateId", () => {
  it("generates unique IDs", () => {
    const id1 = generateId("test");
    const id2 = generateId("test");
    expect(id1).not.toBe(id2);
  });

  it("uses the provided prefix", () => {
    const id = generateId("custom");
    expect(id).toMatch(/^custom_/);
  });

  it("generates IDs with sufficient randomness", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
