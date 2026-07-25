import { useCallback } from "react";
import { useFinanceContext } from "@/contexts/FinanceContext";
import type { FilterCriteria, SortConfig } from "@/types/finance";
import { parseISO, isWithinInterval } from "date-fns";
import { logger } from "@/utils/logger";
import type { JsonObject } from "@/types/common";

export function useFinanceFilters() {
  const { state, dispatch } = useFinanceContext();

  const setFilters = useCallback(
    (updates: Partial<FilterCriteria>) => {
      dispatch({ type: "SET_FILTERS", payload: updates });
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, [dispatch]);

  const filterItems = useCallback(
    <T extends Record<string, unknown>>(
      items: T[],
      sortConfig?: SortConfig
    ): T[] => {
      const { filters } = state;

      let result = [...items];

      // 1. Date Range Filter
      if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
        const start = parseISO(filters.dateRange.start);
        const end = parseISO(filters.dateRange.end);
        result = result.filter((item) => {
          const itemDateStr = item.date as string || item.issueDate as string || item.createdAt as string || item.paymentDate as string;
          if (!itemDateStr) return true;
          try {
            const itemDate = parseISO(itemDateStr);
            return isWithinInterval(itemDate, { start, end });
          } catch (e) {
            logger.warn("Date interval parsing error", e);
            return true;
          }
        });
      }

      // 2. Client Filter
      if (filters.client) {
        result = result.filter(
          (item) => {
            const clientName = item.clientName as string;
            return clientName && clientName.toLowerCase().includes(filters.client.toLowerCase());
          }
        );
      }

      // 3. Category Filter
      if (filters.category) {
        result = result.filter(
          (item) => {
            const category = item.category as string;
            return category && category.toLowerCase() === filters.category.toLowerCase();
          }
        );
      }

      // 4. Status Filter
      if (filters.status) {
        result = result.filter(
          (item) => {
            const status = item.status as string;
            return status && status.toLowerCase() === filters.status.toLowerCase();
          }
        );
      }

      // 5. Payment Method Filter
      if (filters.paymentMethod) {
        result = result.filter(
          (item) => {
            const paymentMethod = item.paymentMethod as string;
            return paymentMethod && paymentMethod.toLowerCase() === filters.paymentMethod.toLowerCase();
          }
        );
      }

      // 6. Vendor Filter
      if (filters.vendor) {
        result = result.filter(
          (item) => {
            const vendor = item.vendor as string;
            return vendor && vendor.toLowerCase().includes(filters.vendor.toLowerCase());
          }
        );
      }

      // 7. Project Filter
      if (filters.project) {
        result = result.filter(
          (item) => {
            const projectName = item.projectName as string;
            const project = item.project as string;
            const eventName = item.eventName as string;
            return (
              (projectName && projectName.toLowerCase().includes(filters.project.toLowerCase())) ||
              (project && project.toLowerCase().includes(filters.project.toLowerCase())) ||
              (eventName && eventName.toLowerCase().includes(filters.project.toLowerCase()))
            );
          }
        );
      }

      // 8. Global Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter((item) => {
          return Object.entries(item).some(([key, val]) => {
            if (key === "id" || key === "isDeleted" || typeof val === "boolean") return false;
            if (val === null || val === undefined) return false;
            if (typeof val === "object") {
              try {
                return JSON.stringify(val).toLowerCase().includes(query);
              } catch (e) {
                logger.warn("JSON parsing error in search filter", e);
                return false;
              }
            }
            return String(val).toLowerCase().includes(query);
          });
        });
      }

      // 9. Sorting
      if (sortConfig && sortConfig.field) {
        const { field, direction } = sortConfig;
        result.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];

          if (aVal === undefined || aVal === null) return 1;
          if (bVal === undefined || bVal === null) return -1;

          if (typeof aVal === "number" && typeof bVal === "number") {
            return direction === "asc" ? aVal - bVal : bVal - aVal;
          }

          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();

          if (aStr < bStr) return direction === "asc" ? -1 : 1;
          if (aStr > bStr) return direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      return result;
    },
    [state.filters]
  );

  return {
    filters: state.filters,
    setFilters,
    resetFilters,
    filterItems,
  };
}
