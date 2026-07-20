/**
 * formatters.ts
 * ─────────────────────────────────────────────────────────────
 * Locale-aware formatting utilities for currency, dates,
 * percentages, and IDs used across the finance system.
 * ─────────────────────────────────────────────────────────────
 */

import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import type { Currency } from "@/types/finance";

// ─── Currency ────────────────────────────────────────────────

const CURRENCY_CONFIG: Record<Currency, { locale: string; code: string; symbol: string }> = {
  USD: { locale: "en-US", code: "USD", symbol: "$" },
  ETB: { locale: "en-ET", code: "ETB", symbol: "Br" },
  EUR: { locale: "de-DE", code: "EUR", symbol: "€" },
  GBP: { locale: "en-GB", code: "GBP", symbol: "£" },
};

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  const config = CURRENCY_CONFIG[currency];
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCompactCurrency(amount: number, currency: Currency = "USD"): string {
  const config = CURRENCY_CONFIG[currency];
  if (amount >= 1_000_000) return `${config.symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${config.symbol}${(amount / 1_000).toFixed(1)}k`;
  return `${config.symbol}${amount.toFixed(0)}`;
}

// ─── Dates ───────────────────────────────────────────────────

export function formatDate(dateStr: string, fmt: string = "MMM d, yyyy"): string {
  if (!dateStr) return "—";
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, fmt) : "—";
  } catch {
    return "—";
  }
}

export function formatShortDate(dateStr: string): string {
  return formatDate(dateStr, "dd MMM yyyy");
}

export function formatMonthYear(dateStr: string): string {
  return formatDate(dateStr, "MMMM yyyy");
}

export function getRelativeTime(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "—";
  } catch {
    return "—";
  }
}

export function toISODate(date: Date = new Date()): string {
  return date.toISOString();
}

// ─── Percentages ─────────────────────────────────────────────

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculatePercent(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 10000) / 100;
}

// ─── Invoice Number ──────────────────────────────────────────

let invoiceCounter = 1000;

export function generateInvoiceNumber(prefix: string = "BRN"): string {
  invoiceCounter += 1;
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(invoiceCounter).padStart(4, "0")}`;
}

// ─── ID Generation ───────────────────────────────────────────

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Number Formatting ──────────────────────────────────────

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

// ─── Status Display Labels ──────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  WeddingPackage: "Wedding Package",
  DepositPayment: "Deposit Payment",
  FinalPayment: "Final Payment",
  AdditionalServices: "Additional Services",
  DroneServices: "Drone Services",
  EngagementShoot: "Engagement Shoot",
  LivestreamServices: "Livestream Services",
  TravelFees: "Travel Fees",
  AlbumSales: "Album Sales",
  ExtraHours: "Extra Hours",
  RushDeliveryFees: "Rush Delivery Fees",
  PartiallyPaid: "Partially Paid",
  EquipmentPurchases: "Equipment Purchases",
  CameraAccessories: "Camera Accessories",
  AudioGear: "Audio Gear",
  LensPurchases: "Lens Purchases",
  StorageDevices: "Storage Devices",
  SoftwareSubscriptions: "Software Subscriptions",
  OfficeExpenses: "Office Expenses",
  InternetBills: "Internet Bills",
  BankTransfer: "Bank Transfer",
  CreditCard: "Credit Card",
  VideoEditor: "Video Editor",
  SoundDesigner: "Sound Designer",
  DroneOperator: "Drone Operator",
  NeedsRepair: "Needs Repair",
  StorageDevice: "Storage Device",
  GearReplacement: "Gear Replacement",
  StudioExpansion: "Studio Expansion",
  ServiceTax: "Service Tax",
  IncomeTax: "Income Tax",
};

export function humanize(key: string): string {
  return STATUS_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim();
}
