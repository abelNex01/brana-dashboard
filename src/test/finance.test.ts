import { describe, it, expect } from "vitest";
import {
  calculateTotalExpenses,
  calculateTotalRevenue,
  calculateNetProfit,
} from "../utils/financeCalculations";
import type { IncomeTransaction, ExpenseRecord } from "../types/finance";

describe("Finance Calculations", () => {
  const mockExpenses: ExpenseRecord[] = [
    {
      id: "1",
      category: "EquipmentPurchases",
      subCategory: "Camera",
      description: "Camera rental",
      amount: 500,
      quantity: 1,
      date: "2026-01-15",
      vendor: "Rentals Inc",
      paymentMethod: "BankTransfer",
      receiptImage: "",
      notes: "",
      currency: "USD",
      tags: [],
      createdAt: "2026-01-15",
      updatedAt: "2026-01-15",
      isDeleted: false,
      isFavorite: false,
      isPinned: false,
      isRecurring: false,
    },
    {
      id: "2",
      category: "Transportation",
      subCategory: "Flights",
      description: "Flight tickets",
      amount: 300,
      quantity: 1,
      date: "2026-01-20",
      vendor: "Airlines",
      paymentMethod: "CreditCard",
      receiptImage: "",
      notes: "",
      currency: "USD",
      tags: [],
      createdAt: "2026-01-20",
      updatedAt: "2026-01-20",
      isDeleted: false,
      isFavorite: false,
      isPinned: false,
      isRecurring: false,
    },
  ];

  const mockIncome: IncomeTransaction[] = [
    {
      id: "1",
      clientName: "John Doe",
      eventName: "Wedding Shoot",
      category: "WeddingPackage",
      description: "Wedding shoot",
      amount: 2000,
      currency: "USD",
      paymentMethod: "BankTransfer",
      status: "Paid",
      invoiceId: "INC-001",
      date: "2026-01-10",
      createdAt: "2026-01-10",
      updatedAt: "2026-01-10",
      notes: "",
      isDeleted: false,
      tags: [],
      isFavorite: false,
      isPinned: false,
    },
  ];

  it("calculates total expenses", () => {
    const total = calculateTotalExpenses(mockExpenses);
    expect(total).toBe(800);
  });

  it("calculates total revenue", () => {
    const total = calculateTotalRevenue(mockIncome);
    expect(total).toBe(2000);
  });

  it("calculates net profit", () => {
    const profit = calculateNetProfit(mockIncome, mockExpenses);
    expect(profit).toBe(1200);
  });

  it("returns 0 for empty arrays", () => {
    expect(calculateTotalExpenses([])).toBe(0);
    expect(calculateTotalRevenue([])).toBe(0);
    expect(calculateNetProfit([], [])).toBe(0);
  });
});
