/**
 * financeSeed.ts
 * ─────────────────────────────────────────────────────────────
 * Realistic wedding-videography-industry seed data across all
 * financial domains. Uses Ethiopian names, real gear models,
 * actual software subscription costs, and plausible financials.
 * ─────────────────────────────────────────────────────────────
 */

import type {
  IncomeTransaction,
  ExpenseRecord,
  EditorPayment,
  PayrollEntry,
  Invoice,
  InvoiceLineItem,
  ProjectBudget,
  GearMaintenanceRecord,
  Subscription,
  TaxRecord,
  SavingsGoal,
  FinancialGoal,
  AccountPayable,
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

// ─── SEED: EDITOR PAYMENTS ───────────────────────────────────

export const seedEditorPayments: EditorPayment[] = [
  {
    id: sid("ed"), name: "Abel Tesfaye", role: "VideoEditor", project: "Dawit-Selam Wedding",
    amount: 800, paidAmount: 800, remainingBalance: 0, status: "Paid",
    paymentDate: "2025-04-01T00:00:00Z", deadline: "2025-03-28T00:00:00Z",
    notes: "Delivered ahead of deadline", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("ed"), name: "Kidist Haile", role: "Colorist", project: "Dawit-Selam Wedding",
    amount: 400, paidAmount: 400, remainingBalance: 0, status: "Paid",
    paymentDate: "2025-04-05T00:00:00Z", deadline: "2025-04-10T00:00:00Z",
    notes: "", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("ed"), name: "Solomon Girma", role: "SoundDesigner", project: "Yohannes-Helen Wedding",
    amount: 350, paidAmount: 175, remainingBalance: 175, status: "Partial",
    paymentDate: "2025-05-10T00:00:00Z", deadline: "2025-05-20T00:00:00Z",
    notes: "Second payment after delivery", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("ed"), name: "Nahom Mekonnen", role: "DroneOperator", project: "Meron-Fitsum Wedding",
    amount: 500, paidAmount: 0, remainingBalance: 500, status: "Unpaid",
    paymentDate: "", deadline: "2025-06-15T00:00:00Z",
    notes: "Pending drone footage delivery", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("ed"), name: "Tsion Alemu", role: "VideoEditor", project: "Semhar-Mussie Wedding",
    amount: 1000, paidAmount: 0, remainingBalance: 1000, status: "Unpaid",
    paymentDate: "", deadline: "2025-07-01T00:00:00Z",
    notes: "3-day wedding edit", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("ed"), name: "Bereket Tadesse", role: "Assistant", project: "Almaz-Kibrom Wedding",
    amount: 200, paidAmount: 200, remainingBalance: 0, status: "Paid",
    paymentDate: "2025-02-28T00:00:00Z", deadline: "2025-02-25T00:00:00Z",
    notes: "", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
];

// ─── SEED: PAYROLL ───────────────────────────────────────────

export const seedPayroll: PayrollEntry[] = [
  {
    id: sid("pay"), employeeId: "emp_001", name: "Abi Sala", role: "Lead Videographer",
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
    id: sid("pay"), employeeId: "emp_001", name: "Abi Sala", role: "Lead Videographer",
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

// ─── SEED: INVOICES ──────────────────────────────────────────

const makeLineItems = (items: [string, number, number][]): InvoiceLineItem[] =>
  items.map(([desc, qty, price], i) => ({
    id: sid("li"),
    description: desc,
    quantity: qty,
    unitPrice: price,
    total: qty * price,
  }));

export const seedInvoices: Invoice[] = [
  {
    id: sid("inv"), invoiceNumber: "BRN-2025-1001", clientName: "Dawit & Selam", clientEmail: "dawit@example.com", clientPhone: "+251-911-123456",
    services: makeLineItems([["Premium Cinematic Package", 1, 4500], ["Engagement Shoot", 1, 600]]),
    taxRate: 5, taxAmount: 255, discountRate: 0, discountAmount: 0, subtotal: 5100, grandTotal: 5355,
    status: "Paid", issueDate: "2025-01-10T00:00:00Z", dueDate: "2025-02-10T00:00:00Z",
    sentDate: "2025-01-10T00:00:00Z", viewedDate: "2025-01-11T00:00:00Z", paidDate: "2025-01-25T00:00:00Z",
    notes: "", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("inv"), invoiceNumber: "BRN-2025-1003", clientName: "Meron & Fitsum", clientEmail: "meron@example.com", clientPhone: "+251-922-987654",
    services: makeLineItems([["Platinum Package — 2 videographers + drone", 1, 5800], ["Drone Add-on", 1, 800]]),
    taxRate: 5, taxAmount: 330, discountRate: 0, discountAmount: 0, subtotal: 6600, grandTotal: 6930,
    status: "Sent", issueDate: "2025-04-20T00:00:00Z", dueDate: "2025-05-20T00:00:00Z",
    sentDate: "2025-04-20T00:00:00Z", viewedDate: "2025-04-21T00:00:00Z", paidDate: "",
    notes: "Partial payment received", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("inv"), invoiceNumber: "BRN-2025-1006", clientName: "Semhar & Mussie", clientEmail: "semhar@example.com", clientPhone: "+251-933-456789",
    services: makeLineItems([["Ultimate 3-Day Package", 1, 7500], ["Livestream", 1, 400]]),
    taxRate: 5, taxAmount: 395, discountRate: 5, discountAmount: 395, subtotal: 7900, grandTotal: 7900,
    status: "Overdue", issueDate: "2025-05-15T00:00:00Z", dueDate: "2025-06-01T00:00:00Z",
    sentDate: "2025-05-15T00:00:00Z", viewedDate: "", paidDate: "",
    notes: "Client hasn't responded — follow up", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
  {
    id: sid("inv"), invoiceNumber: "BRN-2025-1007", clientName: "Tedros & Rahel", clientEmail: "tedros@example.com", clientPhone: "+251-944-111222",
    services: makeLineItems([["Gold Package + Same Day Edit", 1, 3800]]),
    taxRate: 5, taxAmount: 190, discountRate: 0, discountAmount: 0, subtotal: 3800, grandTotal: 3990,
    status: "Draft", issueDate: "2025-06-10T00:00:00Z", dueDate: "2025-07-10T00:00:00Z",
    sentDate: "", viewedDate: "", paidDate: "",
    notes: "Awaiting event date confirmation", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now,
  },
];

// ─── SEED: BUDGETS ───────────────────────────────────────────

export const seedBudgets: ProjectBudget[] = [
  {
    id: sid("bud"), projectName: "Dawit-Selam Wedding", clientName: "Dawit & Selam", eventDate: "2025-03-15T00:00:00Z",
    expectedRevenue: 5100, actualRevenue: 5100, expectedCost: 2200, actualCost: 1950,
    profit: 3150, profitMargin: 61.8, budgetHealth: "healthy", warnings: [],
    remainingBudget: 250, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("bud"), projectName: "Meron-Fitsum Wedding", clientName: "Meron & Fitsum", eventDate: "2025-05-10T00:00:00Z",
    expectedRevenue: 6600, actualRevenue: 3300, expectedCost: 3000, actualCost: 2800,
    profit: 500, profitMargin: 15.2, budgetHealth: "warning", warnings: ["Only 50% revenue collected", "Costs approaching limit"],
    remainingBudget: 200, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("bud"), projectName: "Semhar-Mussie Wedding", clientName: "Semhar & Mussie", eventDate: "2025-06-01T00:00:00Z",
    expectedRevenue: 7900, actualRevenue: 400, expectedCost: 4500, actualCost: 3200,
    profit: -2800, profitMargin: -700, budgetHealth: "critical", warnings: ["Invoice overdue", "Most revenue uncollected", "Over budget risk"],
    remainingBudget: 1300, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
];

// ─── SEED: GEAR MAINTENANCE ──────────────────────────────────

export const seedGearMaintenance: GearMaintenanceRecord[] = [
  {
    id: sid("gear"), name: "Sony FX3", type: "Camera", manufacturer: "Sony", model: "ILME-FX3",
    serialNumber: "SN-FX3-2025001", purchaseDate: "2025-01-15T00:00:00Z", purchasePrice: 3898,
    warrantyExpiry: "2027-01-15T00:00:00Z",
    serviceHistory: [{ id: sid("sh"), date: "2025-04-10T00:00:00Z", description: "Sensor cleaning", cost: 80, vendor: "Sony Service Center" }],
    totalRepairCost: 0, totalMaintenanceCost: 80, nextServiceDate: "2025-10-10T00:00:00Z",
    condition: "Excellent", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Primary A-cam",
  },
  {
    id: sid("gear"), name: "DJI RS 3 Pro", type: "Gimbal", manufacturer: "DJI", model: "RS 3 Pro",
    serialNumber: "SN-RS3-2025002", purchaseDate: "2025-02-20T00:00:00Z", purchasePrice: 549,
    warrantyExpiry: "2026-02-20T00:00:00Z",
    serviceHistory: [],
    totalRepairCost: 0, totalMaintenanceCost: 0, nextServiceDate: "2025-08-20T00:00:00Z",
    condition: "Good", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "",
  },
  {
    id: sid("gear"), name: "DJI Mavic 3 Cine", type: "Drone", manufacturer: "DJI", model: "Mavic 3 Cine",
    serialNumber: "SN-MAV3-2024010", purchaseDate: "2024-06-15T00:00:00Z", purchasePrice: 4999,
    warrantyExpiry: "2025-06-15T00:00:00Z",
    serviceHistory: [
      { id: sid("sh"), date: "2024-12-01T00:00:00Z", description: "Propeller replacement + calibration", cost: 120, vendor: "DJI Support" },
      { id: sid("sh"), date: "2025-05-20T00:00:00Z", description: "Gimbal motor replacement", cost: 350, vendor: "DJI Support" },
    ],
    totalRepairCost: 350, totalMaintenanceCost: 120, nextServiceDate: "2025-11-20T00:00:00Z",
    condition: "Fair", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Warranty expiring soon",
  },
  {
    id: sid("gear"), name: "Rode Wireless GO II", type: "Microphone", manufacturer: "Rode", model: "Wireless GO II",
    serialNumber: "SN-RODE-2025003", purchaseDate: "2025-03-05T00:00:00Z", purchasePrice: 299,
    warrantyExpiry: "2027-03-05T00:00:00Z",
    serviceHistory: [],
    totalRepairCost: 0, totalMaintenanceCost: 0, nextServiceDate: "2026-03-05T00:00:00Z",
    condition: "Excellent", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Set A — primary",
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

// ─── SEED: TAX RECORDS ───────────────────────────────────────

export const seedTaxRecords: TaxRecord[] = [
  { id: sid("tax"), type: "VAT", period: "Q1-2025", taxableAmount: 10500, taxRate: 15, amount: 1575, dueDate: "2025-04-30T00:00:00Z", filedDate: "2025-04-15T00:00:00Z", paidDate: "2025-04-20T00:00:00Z", status: "Paid", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("tax"), type: "IncomeTax", period: "Q1-2025", taxableAmount: 8000, taxRate: 25, amount: 2000, dueDate: "2025-04-30T00:00:00Z", filedDate: "2025-04-15T00:00:00Z", paidDate: "2025-04-22T00:00:00Z", status: "Paid", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("tax"), type: "VAT", period: "Q2-2025", taxableAmount: 15200, taxRate: 15, amount: 2280, dueDate: "2025-07-31T00:00:00Z", filedDate: "", paidDate: "", status: "Pending", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Due end of July" },
];

// ─── SEED: SAVINGS GOALS ─────────────────────────────────────

export const seedSavingsGoals: SavingsGoal[] = [
  { id: sid("sav"), name: "Emergency Reserve", description: "3-month operating expenses buffer", targetAmount: 15000, currentAmount: 8500, percentComplete: 56.7, deadline: "2025-12-31T00:00:00Z", category: "Emergency", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("sav"), name: "Gear Replacement Fund", description: "Annual camera & lens upgrade budget", targetAmount: 10000, currentAmount: 3200, percentComplete: 32, deadline: "2025-12-31T00:00:00Z", category: "GearReplacement", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("sav"), name: "Studio Expansion", description: "Larger studio space deposit", targetAmount: 25000, currentAmount: 6000, percentComplete: 24, deadline: "2026-06-30T00:00:00Z", category: "StudioExpansion", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
];

// ─── SEED: FINANCIAL GOALS ───────────────────────────────────

export const seedFinancialGoals: FinancialGoal[] = [
  { id: sid("goal"), title: "Buy Sony FX6", description: "Upgrade to Sony FX6 as B-cam", targetAmount: 5998, currentAmount: 2400, deadline: "2025-10-01T00:00:00Z", priority: "High", progress: 40, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("goal"), title: "DJI Inspire 3", description: "Premium cinema drone for aerial coverage", targetAmount: 16499, currentAmount: 3000, deadline: "2026-03-01T00:00:00Z", priority: "Medium", progress: 18.2, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("goal"), title: "Build Color Suite", description: "Dedicated grading room with reference monitor", targetAmount: 8000, currentAmount: 1500, deadline: "2026-01-01T00:00:00Z", priority: "Medium", progress: 18.8, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("goal"), title: "Hire Full-time Editor", description: "Full-time editor salary reserve (6 months)", targetAmount: 18000, currentAmount: 5000, deadline: "2025-12-01T00:00:00Z", priority: "High", progress: 27.8, currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
];

// ─── SEED: ACCOUNTS PAYABLE ──────────────────────────────────

export const seedAccountsPayable: AccountPayable[] = [
  { id: sid("ap"), vendor: "B&H Photo", description: "Lighting rig balance", amount: 450, dueDate: "2025-06-30T00:00:00Z", paidDate: "", status: "Pending", category: "Supplier", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("ap"), vendor: "Nahom Mekonnen", description: "Drone operator — Meron wedding", amount: 500, dueDate: "2025-06-15T00:00:00Z", paidDate: "", status: "Pending", category: "Freelancer", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("ap"), vendor: "Artlist", description: "Annual music license renewal", amount: 199.20, dueDate: "2025-09-01T00:00:00Z", paidDate: "", status: "Pending", category: "Subscription", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "" },
  { id: sid("ap"), vendor: "Property Mgmt Co", description: "Studio rent — June 2025", amount: 1200, dueDate: "2025-06-01T00:00:00Z", paidDate: "", status: "Overdue", category: "Bill", currency: "USD", isDeleted: false, createdAt: now, updatedAt: now, notes: "Overdue!" },
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
    editorPayments: seedEditorPayments,
    payroll: seedPayroll,
    invoices: seedInvoices,
    budgets: seedBudgets,
    gearMaintenance: seedGearMaintenance,
    subscriptions: seedSubscriptions,
    taxRecords: seedTaxRecords,
    savingsGoals: seedSavingsGoals,
    financialGoals: seedFinancialGoals,
    accountsPayable: seedAccountsPayable,
    notifications: [],
    auditLog: [],
    filters: defaultFilters,
    deletedItems: [],
  };
}
