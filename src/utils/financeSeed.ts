/**
 * financeSeed.ts
 * ─────────────────────────────────────────────────────────────
 * Realistic wedding-videography-industry seed data across all
 * active financial domains. Uses Ethiopian names, real gear models,
 * actual software subscription costs, and plausible financials.
 * ─────────────────────────────────────────────────────────────
 */

import type {
  IncomeTransaction,
  ExpenseRecord,
  PayrollEntry,
  Subscription,
  FinanceState,
  FilterCriteria,
} from "@/types/finance";

// ─── Helpers ─────────────────────────────────────────────────

let _c = 0;
const sid = (prefix: string) => `${prefix}_seed_${++_c}`;
const now = new Date().toISOString();

// ─── SEED: INCOME ────────────────────────────────────────────

export const seedIncome: IncomeTransaction[] = [
  {
    id: sid("inc"), clientName: "Dawit & Selam", eventName: "Dawit-Selam Wedding", category: "WeddingPackage",
    description: "Premium Cinematic Package — Full day coverage", amount: 4500, currency: "USD",
    paymentMethod: "BankTransfer", status: "Paid", invoiceId: "BRN-2025-1001",
    date: "2025-03-15T00:00:00Z", createdAt: now, updatedAt: now, notes: "Referred by Meron", isDeleted: false, tags: ["premium"], isFavorite: true, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Dawit & Selam", eventName: "Dawit-Selam Wedding", category: "DepositPayment",
    description: "50% deposit for wedding package", amount: 2250, currency: "USD",
    paymentMethod: "BankTransfer", status: "Paid", invoiceId: "BRN-2025-1001",
    date: "2025-01-20T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["deposit"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Yohannes & Helen", eventName: "Yohannes-Helen Wedding", category: "WeddingPackage",
    description: "Gold Package — Ceremony + Reception", amount: 3200, currency: "USD",
    paymentMethod: "CreditCard", status: "Paid", invoiceId: "BRN-2025-1002",
    date: "2025-04-22T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["gold"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Meron & Fitsum", eventName: "Meron-Fitsum Wedding", category: "WeddingPackage",
    description: "Platinum Package — 2 videographers + drone", amount: 5800, currency: "USD",
    paymentMethod: "BankTransfer", status: "PartiallyPaid", invoiceId: "BRN-2025-1003",
    date: "2025-05-10T00:00:00Z", createdAt: now, updatedAt: now, notes: "Final payment due June 15", isDeleted: false, tags: ["platinum", "drone"], isFavorite: true, isPinned: true,
  },
  {
    id: sid("inc"), clientName: "Meron & Fitsum", eventName: "Meron-Fitsum Wedding", category: "DroneServices",
    description: "Aerial drone footage add-on", amount: 800, currency: "USD",
    paymentMethod: "Cash", status: "Pending", invoiceId: "BRN-2025-1003",
    date: "2025-05-10T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["drone"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Almaz & Kibrom", eventName: "Almaz-Kibrom Wedding", category: "WeddingPackage",
    description: "Silver Package — Highlight film + ceremony", amount: 2200, currency: "USD",
    paymentMethod: "Mobile", status: "Paid", invoiceId: "BRN-2025-1004",
    date: "2025-02-14T00:00:00Z", createdAt: now, updatedAt: now, notes: "Valentine's Day wedding", isDeleted: false, tags: ["silver"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Almaz & Kibrom", eventName: "Almaz-Kibrom Engagement", category: "EngagementShoot",
    description: "Engagement session — 2 hours on-location", amount: 600, currency: "USD",
    paymentMethod: "Cash", status: "Paid", invoiceId: "BRN-2025-1005",
    date: "2025-01-28T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["engagement"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Semhar & Mussie", eventName: "Semhar-Mussie Wedding", category: "WeddingPackage",
    description: "Ultimate Package — 3-day coverage", amount: 7500, currency: "USD",
    paymentMethod: "BankTransfer", status: "Overdue", invoiceId: "BRN-2025-1006",
    date: "2025-06-01T00:00:00Z", createdAt: now, updatedAt: now, notes: "Follow up for final payment", isDeleted: false, tags: ["ultimate"], isFavorite: true, isPinned: true,
  },
  {
    id: sid("inc"), clientName: "Semhar & Mussie", eventName: "Semhar-Mussie Wedding", category: "LivestreamServices",
    description: "Live stream for remote family members", amount: 400, currency: "USD",
    paymentMethod: "PayPal", status: "Paid", invoiceId: "BRN-2025-1006",
    date: "2025-06-01T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["livestream"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Tedros & Rahel", eventName: "Tedros-Rahel Wedding", category: "WeddingPackage",
    description: "Gold Package + Same Day Edit", amount: 3800, currency: "USD",
    paymentMethod: "Stripe", status: "Pending", invoiceId: "BRN-2025-1007",
    date: "2025-07-20T00:00:00Z", createdAt: now, updatedAt: now, notes: "Upcoming wedding", isDeleted: false, tags: ["gold", "SDE"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Eden & Bereket", eventName: "Eden-Bereket Wedding", category: "AlbumSales",
    description: "Premium leather-bound wedding album", amount: 450, currency: "USD",
    paymentMethod: "Cash", status: "Paid", invoiceId: "BRN-2025-1008",
    date: "2025-04-05T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["album"], isFavorite: false, isPinned: false,
  },
  {
    id: sid("inc"), clientName: "Haben & Saron", eventName: "Haben-Saron Wedding", category: "RushDeliveryFees",
    description: "Rush delivery — 1 week turnaround", amount: 500, currency: "USD",
    paymentMethod: "BankTransfer", status: "Paid", invoiceId: "BRN-2025-1009",
    date: "2025-05-25T00:00:00Z", createdAt: now, updatedAt: now, notes: "", isDeleted: false, tags: ["rush"], isFavorite: false, isPinned: false,
  },
];

// ─── SEED: EXPENSES ──────────────────────────────────────────

export const seedExpenses: ExpenseRecord[] = [
  {
    id: sid("exp"), category: "EquipmentPurchases", subCategory: "Camera Body", vendor: "B&H Photo",
    amount: 3898, quantity: 1, date: "2025-01-15T00:00:00Z", paymentMethod: "CreditCard",
    receiptImage: "", description: "Sony FX3 Cinema Camera", notes: "For primary A-cam",
    currency: "USD", isDeleted: false, tags: ["camera", "sony"], isFavorite: true, isPinned: true,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "LensPurchases", subCategory: "Cinema Lens", vendor: "Adorama",
    amount: 2199, quantity: 1, date: "2025-02-01T00:00:00Z", paymentMethod: "CreditCard",
    receiptImage: "", description: "Sony 24-70mm f/2.8 GM II", notes: "Primary zoom lens",
    currency: "USD", isDeleted: false, tags: ["lens", "sony"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "CameraAccessories", subCategory: "Gimbal", vendor: "DJI Store",
    amount: 549, quantity: 1, date: "2025-02-20T00:00:00Z", paymentMethod: "CreditCard",
    receiptImage: "", description: "DJI RS 3 Pro Gimbal", notes: "",
    currency: "USD", isDeleted: false, tags: ["gimbal", "dji"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "AudioGear", subCategory: "Wireless Mic", vendor: "Amazon",
    amount: 399, quantity: 2, date: "2025-03-05T00:00:00Z", paymentMethod: "CreditCard",
    receiptImage: "", description: "Rode Wireless GO II (x2)", notes: "Backup sets for ceremonies",
    currency: "USD", isDeleted: false, tags: ["audio", "rode"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "StorageDevices", subCategory: "SSD", vendor: "Samsung Direct",
    amount: 189, quantity: 4, date: "2025-01-25T00:00:00Z", paymentMethod: "CreditCard",
    receiptImage: "", description: "Samsung T7 Shield 2TB SSD (x4)", notes: "Field backup drives",
    currency: "USD", isDeleted: false, tags: ["storage", "samsung"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "Lighting", subCategory: "LED Panel", vendor: "Nanlite",
    amount: 699, quantity: 2, date: "2025-04-10T00:00:00Z", paymentMethod: "BankTransfer",
    receiptImage: "", description: "Nanlite Forza 60C (x2)", notes: "Reception lighting",
    currency: "USD", isDeleted: false, tags: ["lighting", "nanlite"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "Transportation", subCategory: "Fuel", vendor: "Various",
    amount: 320, quantity: 1, date: "2025-05-01T00:00:00Z", paymentMethod: "Cash",
    receiptImage: "", description: "Monthly fuel costs — May 2025", notes: "",
    currency: "USD", isDeleted: false, tags: ["fuel"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: true, recurringInterval: "Monthly",
  },
  {
    id: sid("exp"), category: "Rent", subCategory: "Studio Rent", vendor: "Property Mgmt Co",
    amount: 1200, quantity: 1, date: "2025-05-01T00:00:00Z", paymentMethod: "BankTransfer",
    receiptImage: "", description: "Studio office rent — May 2025", notes: "Bole area office",
    currency: "USD", isDeleted: false, tags: ["rent", "office"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: true, recurringInterval: "Monthly",
  },
  {
    id: sid("exp"), category: "InternetBills", subCategory: "Internet", vendor: "Ethio Telecom",
    amount: 85, quantity: 1, date: "2025-05-05T00:00:00Z", paymentMethod: "Mobile",
    receiptImage: "", description: "Office internet — May 2025", notes: "",
    currency: "USD", isDeleted: false, tags: ["internet"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: true, recurringInterval: "Monthly",
  },
  {
    id: sid("exp"), category: "Freelancers", subCategory: "Second Shooter", vendor: "Nahom M.",
    amount: 350, quantity: 1, date: "2025-04-22T00:00:00Z", paymentMethod: "Cash",
    receiptImage: "", description: "Second shooter for Yohannes-Helen wedding", notes: "",
    currency: "USD", isDeleted: false, tags: ["freelancer"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
  {
    id: sid("exp"), category: "Marketing", subCategory: "Social Media Ads", vendor: "Meta Ads",
    amount: 250, quantity: 1, date: "2025-03-15T00:00:00Z", paymentMethod: "CreditCard",
    receiptImage: "", description: "Instagram & Facebook ads — March", notes: "Targeted wedding couples",
    currency: "USD", isDeleted: false, tags: ["marketing", "social"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: true, recurringInterval: "Monthly",
  },
  {
    id: sid("exp"), category: "Food", subCategory: "Team Meals", vendor: "Various",
    amount: 180, quantity: 1, date: "2025-05-10T00:00:00Z", paymentMethod: "Cash",
    receiptImage: "", description: "Team meals during Meron-Fitsum wedding shoot", notes: "",
    currency: "USD", isDeleted: false, tags: ["food"], isFavorite: false, isPinned: false,
    createdAt: now, updatedAt: now, isRecurring: false,
  },
];

// ─── SEED: PAYROLL ───────────────────────────────────────────

export const seedPayroll: PayrollEntry[] = [
  {
    id: sid("pay"), employeeId: "emp_001", name: "Abi Salah", role: "Lead Videographer",
    baseSalary: 3000, bonus: 500, commission: 200, allowance: 150, overtime: 0, deductions: 100,
    totalPay: 3750, period: "2025-05", status: "Paid", paymentDate: "2025-05-30T00:00:00Z",
    currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("pay"), employeeId: "emp_002", name: "Abel Tesfaye", role: "Senior Editor",
    baseSalary: 2200, bonus: 0, commission: 0, allowance: 100, overtime: 150, deductions: 75,
    totalPay: 2375, period: "2025-05", status: "Paid", paymentDate: "2025-05-30T00:00:00Z",
    currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("pay"), employeeId: "emp_003", name: "Kidist Haile", role: "Colorist",
    baseSalary: 1800, bonus: 0, commission: 0, allowance: 100, overtime: 0, deductions: 60,
    totalPay: 1840, period: "2025-05", status: "Paid", paymentDate: "2025-05-30T00:00:00Z",
    currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("pay"), employeeId: "emp_001", name: "Abi Salah", role: "Lead Videographer",
    baseSalary: 3000, bonus: 0, commission: 300, allowance: 150, overtime: 200, deductions: 100,
    totalPay: 3550, period: "2025-06", status: "Upcoming", paymentDate: "2025-06-30T00:00:00Z",
    currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("pay"), employeeId: "emp_002", name: "Abel Tesfaye", role: "Senior Editor",
    baseSalary: 2200, bonus: 200, commission: 0, allowance: 100, overtime: 0, deductions: 75,
    totalPay: 2425, period: "2025-06", status: "Upcoming", paymentDate: "2025-06-30T00:00:00Z",
    currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
];

// ─── SEED: SUBSCRIPTIONS ─────────────────────────────────────

export const seedSubscriptions: Subscription[] = [
  { id: sid("sub"), name: "Adobe Creative Cloud", provider: "Adobe", category: "Editing Software", billingCycle: "Monthly", renewalDate: "2025-07-01T00:00:00Z", monthlyAmount: 54.99, annualAmount: 659.88, status: "Active", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "All apps plan" },
  { id: sid("sub"), name: "Frame.io", provider: "Adobe", category: "Collaboration", billingCycle: "Monthly", renewalDate: "2025-07-01T00:00:00Z", monthlyAmount: 15, annualAmount: 180, status: "Active", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Team plan — review & approval" },
  { id: sid("sub"), name: "Dropbox Business", provider: "Dropbox", category: "Cloud Storage", billingCycle: "Yearly", renewalDate: "2025-12-15T00:00:00Z", monthlyAmount: 20, annualAmount: 240, status: "Active", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Client delivery" },
  { id: sid("sub"), name: "Google Workspace", provider: "Google", category: "Office Suite", billingCycle: "Monthly", renewalDate: "2025-07-05T00:00:00Z", monthlyAmount: 12, annualAmount: 144, status: "Active", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("sub"), name: "Canva Pro", provider: "Canva", category: "Design", billingCycle: "Yearly", renewalDate: "2026-01-10T00:00:00Z", monthlyAmount: 12.99, annualAmount: 119.99, status: "Active", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Social media graphics" },
  { id: sid("sub"), name: "Artlist", provider: "Artlist", category: "Music Licensing", billingCycle: "Yearly", renewalDate: "2025-09-01T00:00:00Z", monthlyAmount: 16.60, annualAmount: 199.20, status: "Active", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Music + SFX bundle" },
];

// ─── DEFAULT FILTERS ─────────────────────────────────────────

export const defaultFilters: FilterCriteria = {
  dateRange: null,
  client: "",
  category: "",
  status: "",
  paymentMethod: "",
  vendor: "",
  project: "",
  searchQuery: "",
};

// ─── INITIAL STATE ───────────────────────────────────────────

export function createInitialFinanceState(): FinanceState {
  return {
    income: seedIncome,
    expenses: seedExpenses,
    payroll: seedPayroll,
    subscriptions: seedSubscriptions,
    notifications: [],
    auditLog: [],
    filters: defaultFilters,
    deletedItems: [],
  };
}
