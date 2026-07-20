/**
 * finance.ts
 * ─────────────────────────────────────────────────────────────
 * 💎 ENTERPRISE FINANCIAL MANAGEMENT — TYPE SYSTEM
 *
 * Complete TypeScript interfaces, enums, and type aliases for
 * all 24 financial domains of a Wedding Videography Studio.
 *
 * Designed for future integration with Supabase / Firebase / Prisma.
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

// ─── 3. EDITOR PAYMENTS ──────────────────────────────────────

export type EditorRole =
  | "VideoEditor"
  | "Colorist"
  | "SoundDesigner"
  | "Photographer"
  | "DroneOperator"
  | "Assistant";

export type EditorPaymentStatus = "Unpaid" | "Partial" | "Paid";

export interface EditorPayment {
  id: string;
  name: string;
  role: EditorRole;
  project: string;
  amount: number;
  paidAmount: number;
  remainingBalance: number;
  status: EditorPaymentStatus;
  paymentDate: string;
  deadline: string;
  notes: string;
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── 4. TEAM PAYROLL ─────────────────────────────────────────

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

// ─── 5. CLIENT INVOICES ──────────────────────────────────────

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  services: InvoiceLineItem[];
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  grandTotal: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  sentDate: string;
  viewedDate: string;
  paidDate: string;
  notes: string;
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── 6. PROJECT BUDGETS ──────────────────────────────────────

export type BudgetHealth = "healthy" | "warning" | "critical";

export interface ProjectBudget {
  id: string;
  projectName: string;
  clientName: string;
  eventDate: string;
  expectedRevenue: number;
  actualRevenue: number;
  expectedCost: number;
  actualCost: number;
  profit: number;
  profitMargin: number;
  budgetHealth: BudgetHealth;
  warnings: string[];
  remainingBudget: number;
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 7. GEAR MAINTENANCE ─────────────────────────────────────

export type GearType =
  | "Camera"
  | "Lens"
  | "Gimbal"
  | "Light"
  | "Microphone"
  | "Computer"
  | "StorageDevice"
  | "Drone"
  | "Monitor"
  | "Tripod";

export interface ServiceHistoryEntry {
  id: string;
  date: string;
  description: string;
  cost: number;
  vendor: string;
}

export interface GearMaintenanceRecord {
  id: string;
  name: string;
  type: GearType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  serviceHistory: ServiceHistoryEntry[];
  totalRepairCost: number;
  totalMaintenanceCost: number;
  nextServiceDate: string;
  condition: "Excellent" | "Good" | "Fair" | "NeedsRepair" | "Retired";
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 8. SUBSCRIPTIONS ────────────────────────────────────────

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

// ─── 9. CASH FLOW (derived) ──────────────────────────────────

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

// ─── 10. PROFIT ANALYTICS (derived) ──────────────────────────

export interface ProfitAnalytics {
  profitMargin: number;
  averageProjectProfit: number;
  bestPerformingMonths: { month: string; profit: number }[];
  highestExpenseCategories: { category: string; total: number }[];
  topRevenueCategories: { category: string; total: number }[];
  averageIncomePerWedding: number;
}

// ─── 11. TAX MANAGEMENT ──────────────────────────────────────

export type TaxType = "VAT" | "ServiceTax" | "IncomeTax";
export type TaxStatus = "Pending" | "Filed" | "Paid";

export interface TaxRecord {
  id: string;
  type: TaxType;
  period: string; // e.g. "Q1-2025"
  taxableAmount: number;
  taxRate: number;
  amount: number;
  dueDate: string;
  filedDate: string;
  paidDate: string;
  status: TaxStatus;
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 12. SAVINGS & EMERGENCY FUND ────────────────────────────

export interface SavingsGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  percentComplete: number;
  deadline: string;
  category: "Emergency" | "GearReplacement" | "StudioExpansion" | "Other";
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 13. FINANCIAL GOALS ─────────────────────────────────────

export type GoalPriority = "Low" | "Medium" | "High" | "Critical";

export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: GoalPriority;
  progress: number; // 0-100
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 14. ACCOUNTS RECEIVABLE (derived from Invoices) ─────────

export interface AccountsReceivableSummary {
  pendingInvoices: Invoice[];
  overdueInvoices: Invoice[];
  totalOutstanding: number;
  totalOverdue: number;
  averageDaysOverdue: number;
  collectionProgress: number; // 0-100
}

// ─── 15. ACCOUNTS PAYABLE ────────────────────────────────────

export type APStatus = "Pending" | "Paid" | "Overdue";

export interface AccountPayable {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: APStatus;
  category: "Supplier" | "Freelancer" | "Subscription" | "Bill" | "Other";
  currency: Currency;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// ─── 16. REPORTING ───────────────────────────────────────────

export type ReportPeriod =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly";

export type ExportFormat = "PDF" | "CSV" | "Excel" | "JSON";

export interface ReportData {
  period: ReportPeriod;
  dateRange: { start: string; end: string };
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: CashFlowSummary;
  outstandingInvoices: number;
  payrollTotal: number;
  generatedAt: string;
}

// ─── 17. FILTERS ─────────────────────────────────────────────

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

// ─── 18. NOTIFICATIONS ──────────────────────────────────────

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

// ─── 21. AUDIT LOG ───────────────────────────────────────────

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

// ─── 19 & 22. KPI & CHART DATA ──────────────────────────────

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashFlow: number;
  profitMargin: number;
  monthlyGrowth: number;
  averageWeddingValue: number;
  outstandingInvoices: number;
  payrollCost: number;
  gearMaintenanceCost: number;
  subscriptionCost: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
}

// ─── CENTRAL STATE ───────────────────────────────────────────

export interface FinanceState {
  income: IncomeTransaction[];
  expenses: ExpenseRecord[];
  editorPayments: EditorPayment[];
  payroll: PayrollEntry[];
  invoices: Invoice[];
  budgets: ProjectBudget[];
  gearMaintenance: GearMaintenanceRecord[];
  subscriptions: Subscription[];
  taxRecords: TaxRecord[];
  savingsGoals: SavingsGoal[];
  financialGoals: FinancialGoal[];
  accountsPayable: AccountPayable[];
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
  // Editor Payments
  | { type: "CREATE_EDITOR_PAYMENT"; payload: EditorPayment }
  | { type: "UPDATE_EDITOR_PAYMENT"; payload: { id: string; updates: Partial<EditorPayment> } }
  | { type: "DELETE_EDITOR_PAYMENT"; payload: string }
  | { type: "RESTORE_EDITOR_PAYMENT"; payload: string }
  // Payroll
  | { type: "CREATE_PAYROLL"; payload: PayrollEntry }
  | { type: "UPDATE_PAYROLL"; payload: { id: string; updates: Partial<PayrollEntry> } }
  | { type: "DELETE_PAYROLL"; payload: string }
  | { type: "RESTORE_PAYROLL"; payload: string }
  // Invoices
  | { type: "CREATE_INVOICE"; payload: Invoice }
  | { type: "UPDATE_INVOICE"; payload: { id: string; updates: Partial<Invoice> } }
  | { type: "DELETE_INVOICE"; payload: string }
  | { type: "RESTORE_INVOICE"; payload: string }
  // Budgets
  | { type: "CREATE_BUDGET"; payload: ProjectBudget }
  | { type: "UPDATE_BUDGET"; payload: { id: string; updates: Partial<ProjectBudget> } }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "RESTORE_BUDGET"; payload: string }
  // Gear Maintenance
  | { type: "CREATE_GEAR"; payload: GearMaintenanceRecord }
  | { type: "UPDATE_GEAR"; payload: { id: string; updates: Partial<GearMaintenanceRecord> } }
  | { type: "DELETE_GEAR"; payload: string }
  | { type: "RESTORE_GEAR"; payload: string }
  // Subscriptions
  | { type: "CREATE_SUBSCRIPTION"; payload: Subscription }
  | { type: "UPDATE_SUBSCRIPTION"; payload: { id: string; updates: Partial<Subscription> } }
  | { type: "DELETE_SUBSCRIPTION"; payload: string }
  | { type: "RESTORE_SUBSCRIPTION"; payload: string }
  // Tax Records
  | { type: "CREATE_TAX"; payload: TaxRecord }
  | { type: "UPDATE_TAX"; payload: { id: string; updates: Partial<TaxRecord> } }
  | { type: "DELETE_TAX"; payload: string }
  | { type: "RESTORE_TAX"; payload: string }
  // Savings Goals
  | { type: "CREATE_SAVINGS_GOAL"; payload: SavingsGoal }
  | { type: "UPDATE_SAVINGS_GOAL"; payload: { id: string; updates: Partial<SavingsGoal> } }
  | { type: "DELETE_SAVINGS_GOAL"; payload: string }
  | { type: "RESTORE_SAVINGS_GOAL"; payload: string }
  // Financial Goals
  | { type: "CREATE_FINANCIAL_GOAL"; payload: FinancialGoal }
  | { type: "UPDATE_FINANCIAL_GOAL"; payload: { id: string; updates: Partial<FinancialGoal> } }
  | { type: "DELETE_FINANCIAL_GOAL"; payload: string }
  | { type: "RESTORE_FINANCIAL_GOAL"; payload: string }
  // Accounts Payable
  | { type: "CREATE_AP"; payload: AccountPayable }
  | { type: "UPDATE_AP"; payload: { id: string; updates: Partial<AccountPayable> } }
  | { type: "DELETE_AP"; payload: string }
  | { type: "RESTORE_AP"; payload: string }
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
