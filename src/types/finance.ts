/**
 * finance.ts
 * ─────────────────────────────────────────────────────────────
 * Complete TypeScript interfaces, enums, and type aliases for
 * the active financial domains of a Wedding Videography Studio.
 * ─────────────────────────────────────────────────────────────
 */

// ─── Shared Enums ─────────────────────────────────────────────

export type Currency = "USD" | "ETB" | "EUR" | "GBP";

export type PaymentMethod =
  | "Cash"
  | "BankTransfer"
  | "Check"
  | "CreditCard"
  | "Mobile"
  | "PayPal"
  | "Stripe";

export type CashFlowPeriod =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly";

// ─── 1. INCOME MANAGEMENT ────────────────────────────────────

export type IncomeCategory =
  | "WeddingPackage"
  | "DepositPayment"
  | "FinalPayment"
  | "AdditionalServices"
  | "DroneServices"
  | "EngagementShoot"
  | "LivestreamServices"
  | "TravelFees"
  | "AlbumSales"
  | "ExtraHours"
  | "RushDeliveryFees";

export type IncomeStatus =
  | "Pending"
  | "Paid"
  | "PartiallyPaid"
  | "Overdue"
  | "Cancelled";

export interface IncomeTransaction {
  id: string;
  clientName: string;
  eventName: string;
  category: IncomeCategory;
  description: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  status: IncomeStatus;
  invoiceId: string;
  date: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
  notes: string;
  isDeleted: boolean;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
}

// ─── 2. EXPENSE MANAGEMENT ───────────────────────────────────

export type ExpenseCategory =
  | "EquipmentPurchases"
  | "CameraAccessories"
  | "Lighting"
  | "AudioGear"
  | "LensPurchases"
  | "StorageDevices"
  | "SoftwareSubscriptions"
  | "OfficeExpenses"
  | "InternetBills"
  | "Transportation"
  | "Accommodation"
  | "Marketing"
  | "Advertising"
  | "Rent"
  | "Utilities"
  | "Taxes"
  | "Fuel"
  | "Food"
  | "Freelancers"
  | "Miscellaneous";

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  subCategory: string;
  vendor: string;
  amount: number;
  quantity: number;
  date: string;
  paymentMethod: PaymentMethod;
  receiptImage: string;
  description: string;
  notes: string;
  currency: Currency;
  isDeleted: boolean;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringInterval?: "Weekly" | "Monthly" | "Quarterly" | "Yearly";
}

// ─── 3. TEAM PAYROLL ─────────────────────────────────────────

export type PayrollStatus = "Pending" | "Paid" | "Upcoming";

export interface PayrollEntry {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  baseSalary: number;
  bonus: number;
  commission: number;
  allowance: number;
  overtime: number;
  deductions: number;
  totalPay: number;
  period: string; // e.g. "2025-06"
  status: PayrollStatus;
  paymentDate: string;
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 4. SUBSCRIPTIONS ────────────────────────────────────────

export type BillingCycle = "Monthly" | "Quarterly" | "Yearly";
export type SubscriptionStatus = "Active" | "Cancelled" | "Expiring";

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: string;
  billingCycle: BillingCycle;
  renewalDate: string;
  monthlyAmount: number;
  annualAmount: number;
  status: SubscriptionStatus;
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 5. CASH FLOW (derived) ──────────────────────────────────

export interface CashFlowEntry {
  period: string;
  cashIn: number;
  cashOut: number;
  netFlow: number;
}

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  grossProfit: number;
  operatingExpenses: number;
  cashIn: number;
  cashOut: number;
  entries: CashFlowEntry[];
}

// ─── 6. FILTERS ─────────────────────────────────────────────

export interface FilterCriteria {
  dateRange: { start: string; end: string } | null;
  client: string;
  category: string;
  status: string;
  paymentMethod: string;
  vendor: string;
  project: string;
  searchQuery: string;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

// ─── 7. NOTIFICATIONS ──────────────────────────────────────

export type NotificationSeverity = "info" | "warning" | "error" | "success";

export type NotificationType =
  | "UpcomingInvoice"
  | "OverdueInvoice"
  | "UpcomingSalary"
  | "SubscriptionRenewal"
  | "MaintenanceReminder"
  | "LowCashWarning"
  | "GoalProgress"
  | "BudgetWarning";

export interface FinanceNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  date: string;
  read: boolean;
  actionUrl: string;
  entityId: string;
  entityType: string;
}

// ─── 8. AUDIT LOG ───────────────────────────────────────────

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "BULK_DELETE"
  | "DUPLICATE"
  | "ARCHIVE"
  | "STATUS_CHANGE";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  userId: string;
  previousValue: string;
  newValue: string;
  description: string;
}

// ─── Deleted Items (undo support) ────────────────────────────

export interface DeletedItem {
  type: string;
  item: unknown;
  deletedAt: number;
}

// ─── CENTRAL STATE ───────────────────────────────────────────

export interface FinanceState {
  income: IncomeTransaction[];
  expenses: ExpenseRecord[];
  payroll: PayrollEntry[];
  subscriptions: Subscription[];
  notifications: FinanceNotification[];
  auditLog: AuditEntry[];
  filters: FilterCriteria;
  deletedItems: DeletedItem[];
}

// ─── REDUCER ACTIONS ─────────────────────────────────────────

export type FinanceAction =
  // Income
  | { type: "CREATE_INCOME"; payload: IncomeTransaction }
  | { type: "UPDATE_INCOME"; payload: { id: string; updates: Partial<IncomeTransaction> } }
  | { type: "DELETE_INCOME"; payload: string }
  | { type: "RESTORE_INCOME"; payload: string }
  // Expenses
  | { type: "CREATE_EXPENSE"; payload: ExpenseRecord }
  | { type: "UPDATE_EXPENSE"; payload: { id: string; updates: Partial<ExpenseRecord> } }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "RESTORE_EXPENSE"; payload: string }
  // Payroll
  | { type: "CREATE_PAYROLL"; payload: PayrollEntry }
  | { type: "UPDATE_PAYROLL"; payload: { id: string; updates: Partial<PayrollEntry> } }
  | { type: "DELETE_PAYROLL"; payload: string }
  | { type: "RESTORE_PAYROLL"; payload: string }
  // Subscriptions
  | { type: "CREATE_SUBSCRIPTION"; payload: Subscription }
  | { type: "UPDATE_SUBSCRIPTION"; payload: { id: string; updates: Partial<Subscription> } }
  | { type: "DELETE_SUBSCRIPTION"; payload: string }
  | { type: "RESTORE_SUBSCRIPTION"; payload: string }
  // Notifications
  | { type: "ADD_NOTIFICATION"; payload: FinanceNotification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  // Audit
  | { type: "ADD_AUDIT_ENTRY"; payload: AuditEntry }
  // Filters
  | { type: "SET_FILTERS"; payload: Partial<FilterCriteria> }
  | { type: "RESET_FILTERS" }
  // Bulk Operations
  | { type: "BULK_DELETE"; payload: { entityType: string; ids: string[] } }
  | { type: "BULK_UPDATE_STATUS"; payload: { entityType: string; ids: string[]; status: string } }
  // Duplicate
  | { type: "DUPLICATE_RECORD"; payload: { entityType: string; id: string; newId: string } }
  // Reset
  | { type: "RESET_DATA"; payload: FinanceState }
  | { type: "HYDRATE"; payload: FinanceState };

// ─── ANALYTICS TYPES ─────────────────────────────────────────

export interface ProfitAnalytics {
  profitMargin: number;
  averageProjectProfit: number;
  bestPerformingMonths: { month: string; profit: number }[];
  highestExpenseCategories: { category: string; total: number }[];
  topRevenueCategories: { category: string; total: number }[];
  averageIncomePerWedding: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
