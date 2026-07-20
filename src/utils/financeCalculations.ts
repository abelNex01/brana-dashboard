/**
 * financeCalculations.ts
 * ─────────────────────────────────────────────────────────────
 * Pure calculation functions for all KPIs, analytics, and
 * financial metrics. No side effects — easily testable.
 * ─────────────────────────────────────────────────────────────
 */

import type {
  IncomeTransaction,
  ExpenseRecord,
  Invoice,
  PayrollEntry,
  EditorPayment,
  GearMaintenanceRecord,
  Subscription,
  ProjectBudget,
  AccountPayable,
  TaxRecord,
  DashboardKPIs,
  CashFlowSummary,
  CashFlowEntry,
  CashFlowPeriod,
  ProfitAnalytics,
  ChartDataPoint,
  FinanceNotification,
  FinanceState,
  AccountsReceivableSummary,
  BudgetHealth,
  ReportData,
  ReportPeriod,
} from "@/types/finance";
import { generateId } from "@/utils/formatters";
import {
  parseISO,
  isAfter,
  isBefore,
  differenceInDays,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  subMonths,
  isWithinInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  subDays,
} from "date-fns";

// ─── HELPERS ─────────────────────────────────────────────────

const active = <T extends { isDeleted: boolean }>(items: T[]) =>
  items.filter((i) => !i.isDeleted);

function sumBy<T>(items: T[], key: keyof T): number {
  return items.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const item of items) {
    const k = keyFn(item);
    (map[k] ??= []).push(item);
  }
  return map;
}

function getDateRange(period: CashFlowPeriod, refDate: Date = new Date()) {
  switch (period) {
    case "Daily":
      return { start: subDays(refDate, 30), end: refDate };
    case "Weekly":
      return { start: startOfWeek(subMonths(refDate, 3)), end: endOfWeek(refDate) };
    case "Monthly":
      return { start: startOfYear(refDate), end: endOfYear(refDate) };
    case "Quarterly":
      return { start: startOfYear(refDate), end: endOfYear(refDate) };
    case "Yearly":
      return { start: startOfYear(subMonths(refDate, 24)), end: endOfYear(refDate) };
  }
}

// ─── CORE KPIs ───────────────────────────────────────────────

export function calculateTotalRevenue(income: IncomeTransaction[]): number {
  return sumBy(
    active(income).filter((i) => i.status === "Paid" || i.status === "PartiallyPaid"),
    "amount"
  );
}

export function calculateTotalExpenses(expenses: ExpenseRecord[]): number {
  return sumBy(active(expenses), "amount");
}

export function calculateNetProfit(income: IncomeTransaction[], expenses: ExpenseRecord[]): number {
  return calculateTotalRevenue(income) - calculateTotalExpenses(expenses);
}

export function calculateGrossProfit(income: IncomeTransaction[], expenses: ExpenseRecord[]): number {
  const rev = calculateTotalRevenue(income);
  // Gross profit excludes operating expenses (rent, utilities, internet, marketing)
  const operatingCategories = ["Rent", "Utilities", "InternetBills", "Marketing", "Advertising", "OfficeExpenses"];
  const directCosts = sumBy(
    active(expenses).filter((e) => !operatingCategories.includes(e.category)),
    "amount"
  );
  return rev - directCosts;
}

export function calculateProfitMargin(income: IncomeTransaction[], expenses: ExpenseRecord[]): number {
  const rev = calculateTotalRevenue(income);
  if (rev === 0) return 0;
  return (calculateNetProfit(income, expenses) / rev) * 100;
}

export function calculateAccountsReceivable(invoices: Invoice[]): number {
  return sumBy(
    active(invoices).filter((inv) => inv.status !== "Paid" && inv.status !== "Cancelled" && inv.status !== "Draft"),
    "grandTotal"
  );
}

export function calculateAccountsPayableTotal(ap: AccountPayable[]): number {
  return sumBy(
    active(ap).filter((item) => item.status !== "Paid"),
    "amount"
  );
}

export function calculateMonthlyGrowth(income: IncomeTransaction[]): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthIncome = active(income)
    .filter((i) => {
      const d = parseISO(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && (i.status === "Paid" || i.status === "PartiallyPaid");
    })
    .reduce((s, i) => s + i.amount, 0);

  const lastMonth = subMonths(now, 1);
  const lastMonthIncome = active(income)
    .filter((i) => {
      const d = parseISO(i.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear() && (i.status === "Paid" || i.status === "PartiallyPaid");
    })
    .reduce((s, i) => s + i.amount, 0);

  if (lastMonthIncome === 0) return thisMonthIncome > 0 ? 100 : 0;
  return ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
}

export function calculateAverageWeddingValue(income: IncomeTransaction[]): number {
  const weddingIncome = active(income).filter(
    (i) => i.category === "WeddingPackage" && (i.status === "Paid" || i.status === "PartiallyPaid")
  );
  if (weddingIncome.length === 0) return 0;
  return sumBy(weddingIncome, "amount") / weddingIncome.length;
}

export function calculateOutstandingInvoices(invoices: Invoice[]): { count: number; total: number } {
  const outstanding = active(invoices).filter(
    (inv) => inv.status !== "Paid" && inv.status !== "Cancelled" && inv.status !== "Draft"
  );
  return { count: outstanding.length, total: sumBy(outstanding, "grandTotal") };
}

export function calculatePayrollCost(payroll: PayrollEntry[]): number {
  return sumBy(
    active(payroll).filter((p) => p.status === "Paid"),
    "totalPay"
  );
}

export function calculateGearMaintenanceCost(gear: GearMaintenanceRecord[]): number {
  return active(gear).reduce(
    (sum, g) => sum + g.totalRepairCost + g.totalMaintenanceCost,
    0
  );
}

export function calculateSubscriptionCost(subscriptions: Subscription[]): number {
  return sumBy(
    active(subscriptions).filter((s) => s.status === "Active"),
    "monthlyAmount"
  );
}

// ─── DASHBOARD KPIs ──────────────────────────────────────────

export function calculateDashboardKPIs(state: FinanceState): DashboardKPIs {
  const totalRevenue = calculateTotalRevenue(state.income);
  const totalExpenses = calculateTotalExpenses(state.expenses);
  const netProfit = totalRevenue - totalExpenses;
  const accountsReceivable = calculateAccountsReceivable(state.invoices);
  const accountsPayable = calculateAccountsPayableTotal(state.accountsPayable);
  const profitMargin = calculateProfitMargin(state.income, state.expenses);
  const monthlyGrowth = calculateMonthlyGrowth(state.income);
  const averageWeddingValue = calculateAverageWeddingValue(state.income);
  const { count: outstandingInvoices } = calculateOutstandingInvoices(state.invoices);
  const payrollCost = calculatePayrollCost(state.payroll);
  const gearMaintenanceCost = calculateGearMaintenanceCost(state.gearMaintenance);
  const subscriptionCost = calculateSubscriptionCost(state.subscriptions);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    accountsReceivable,
    accountsPayable,
    cashFlow: totalRevenue - totalExpenses - accountsPayable,
    profitMargin,
    monthlyGrowth,
    averageWeddingValue,
    outstandingInvoices,
    payrollCost,
    gearMaintenanceCost,
    subscriptionCost,
  };
}

// ─── CASH FLOW ───────────────────────────────────────────────

export function calculateCashFlow(
  income: IncomeTransaction[],
  expenses: ExpenseRecord[],
  period: CashFlowPeriod = "Monthly"
): CashFlowSummary {
  const totalIncome = calculateTotalRevenue(income);
  const totalExpenses_ = calculateTotalExpenses(expenses);
  const operatingCategories = ["Rent", "Utilities", "InternetBills", "Marketing", "Advertising", "OfficeExpenses"];
  const operatingExpenses = sumBy(
    active(expenses).filter((e) => operatingCategories.includes(e.category)),
    "amount"
  );

  const { start, end } = getDateRange(period);
  const activeIncome = active(income);
  const activeExpenses = active(expenses);

  let intervals: Date[];
  let labelFormat: string;

  switch (period) {
    case "Daily":
      intervals = eachDayOfInterval({ start, end });
      labelFormat = "MMM d";
      break;
    case "Weekly":
      intervals = eachWeekOfInterval({ start, end });
      labelFormat = "MMM d";
      break;
    case "Monthly":
      intervals = eachMonthOfInterval({ start, end });
      labelFormat = "MMM";
      break;
    case "Quarterly":
      intervals = [startOfYear(start), startOfQuarter(subMonths(end, 6)), startOfQuarter(subMonths(end, 3)), startOfQuarter(end)];
      labelFormat = "QQQ yyyy";
      break;
    case "Yearly":
      intervals = eachMonthOfInterval({ start, end }).filter((d) => d.getMonth() === 0);
      labelFormat = "yyyy";
      break;
  }

  const entries: CashFlowEntry[] = intervals.map((date) => {
    const periodEnd = period === "Monthly" ? endOfMonth(date) : period === "Weekly" ? endOfWeek(date) : period === "Quarterly" ? endOfQuarter(date) : period === "Yearly" ? endOfYear(date) : date;
    const cashIn = activeIncome
      .filter((i) => {
        const d = parseISO(i.date);
        return isWithinInterval(d, { start: date, end: periodEnd }) && (i.status === "Paid" || i.status === "PartiallyPaid");
      })
      .reduce((s, i) => s + i.amount, 0);
    const cashOut = activeExpenses
      .filter((e) => {
        const d = parseISO(e.date);
        return isWithinInterval(d, { start: date, end: periodEnd });
      })
      .reduce((s, e) => s + e.amount, 0);
    return {
      period: format(date, labelFormat),
      cashIn,
      cashOut,
      netFlow: cashIn - cashOut,
    };
  });

  return {
    totalIncome,
    totalExpenses: totalExpenses_,
    netProfit: totalIncome - totalExpenses_,
    grossProfit: calculateGrossProfit(income, expenses),
    operatingExpenses,
    cashIn: totalIncome,
    cashOut: totalExpenses_,
    entries,
  };
}

// ─── PROFIT ANALYTICS ────────────────────────────────────────

export function calculateProfitAnalytics(
  income: IncomeTransaction[],
  expenses: ExpenseRecord[]
): ProfitAnalytics {
  const paidIncome = active(income).filter((i) => i.status === "Paid" || i.status === "PartiallyPaid");

  // Best performing months
  const byMonth = groupBy(paidIncome, (i) => format(parseISO(i.date), "yyyy-MM"));
  const expByMonth = groupBy(active(expenses), (e) => format(parseISO(e.date), "yyyy-MM"));

  const bestPerformingMonths = Object.entries(byMonth)
    .map(([month, items]) => ({
      month: format(parseISO(`${month}-01`), "MMMM yyyy"),
      profit: sumBy(items, "amount") - (expByMonth[month] ? sumBy(expByMonth[month], "amount") : 0),
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);

  // Highest expense categories
  const byCat = groupBy(active(expenses), (e) => e.category);
  const highestExpenseCategories = Object.entries(byCat)
    .map(([category, items]) => ({ category, total: sumBy(items, "amount") }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Top revenue categories
  const byIncomeCat = groupBy(paidIncome, (i) => i.category);
  const topRevenueCategories = Object.entries(byIncomeCat)
    .map(([category, items]) => ({ category, total: sumBy(items, "amount") }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Wedding average
  const weddingPackages = paidIncome.filter((i) => i.category === "WeddingPackage");
  const averageIncomePerWedding = weddingPackages.length > 0 ? sumBy(weddingPackages, "amount") / weddingPackages.length : 0;

  return {
    profitMargin: calculateProfitMargin(income, expenses),
    averageProjectProfit: bestPerformingMonths.length > 0 ? bestPerformingMonths.reduce((s, m) => s + m.profit, 0) / bestPerformingMonths.length : 0,
    bestPerformingMonths,
    highestExpenseCategories,
    topRevenueCategories,
    averageIncomePerWedding,
  };
}

// ─── ACCOUNTS RECEIVABLE ─────────────────────────────────────

export function calculateAccountsReceivableSummary(invoices: Invoice[]): AccountsReceivableSummary {
  const activeInvoices = active(invoices);
  const now = new Date();

  const pendingInvoices = activeInvoices.filter(
    (inv) => inv.status === "Sent" || inv.status === "Viewed"
  );
  const overdueInvoices = activeInvoices.filter(
    (inv) => inv.status === "Overdue" || (inv.status !== "Paid" && inv.status !== "Cancelled" && inv.status !== "Draft" && isBefore(parseISO(inv.dueDate), now))
  );

  const totalOutstanding = sumBy(pendingInvoices, "grandTotal") + sumBy(overdueInvoices, "grandTotal");
  const totalOverdue = sumBy(overdueInvoices, "grandTotal");

  const averageDaysOverdue = overdueInvoices.length > 0
    ? overdueInvoices.reduce((s, inv) => s + differenceInDays(now, parseISO(inv.dueDate)), 0) / overdueInvoices.length
    : 0;

  const totalInvoiced = sumBy(activeInvoices.filter((i) => i.status !== "Draft"), "grandTotal");
  const totalPaid = sumBy(activeInvoices.filter((i) => i.status === "Paid"), "grandTotal");
  const collectionProgress = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

  return {
    pendingInvoices,
    overdueInvoices,
    totalOutstanding,
    totalOverdue,
    averageDaysOverdue,
    collectionProgress,
  };
}

// ─── BUDGET HEALTH ───────────────────────────────────────────

export function calculateBudgetHealth(budget: ProjectBudget): BudgetHealth {
  if (budget.actualCost > budget.expectedCost * 1.1 || budget.profit < 0) return "critical";
  if (budget.actualCost > budget.expectedCost * 0.9 || budget.profitMargin < 20) return "warning";
  return "healthy";
}

export function getRemainingBudget(budget: ProjectBudget): number {
  return budget.expectedCost - budget.actualCost;
}

// ─── CHART DATA GENERATORS ──────────────────────────────────

export function getRevenueTrends(income: IncomeTransaction[], period: CashFlowPeriod = "Monthly"): ChartDataPoint[] {
  const paidIncome = active(income).filter((i) => i.status === "Paid" || i.status === "PartiallyPaid");
  const { start, end } = getDateRange(period);
  const months = eachMonthOfInterval({ start, end });

  return months.map((date) => {
    const monthEnd = endOfMonth(date);
    const total = paidIncome
      .filter((i) => isWithinInterval(parseISO(i.date), { start: date, end: monthEnd }))
      .reduce((s, i) => s + i.amount, 0);
    return { label: format(date, "MMM"), value: total };
  });
}

export function getExpenseTrends(expenses: ExpenseRecord[], period: CashFlowPeriod = "Monthly"): ChartDataPoint[] {
  const activeExp = active(expenses);
  const { start, end } = getDateRange(period);
  const months = eachMonthOfInterval({ start, end });

  return months.map((date) => {
    const monthEnd = endOfMonth(date);
    const total = activeExp
      .filter((e) => isWithinInterval(parseISO(e.date), { start: date, end: monthEnd }))
      .reduce((s, e) => s + e.amount, 0);
    return { label: format(date, "MMM"), value: total };
  });
}

export function getRevenueComparisonData(income: IncomeTransaction[]): { day: string; year2023: number; year2024: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const paidIncome = active(income).filter((i) => i.status === "Paid" || i.status === "PartiallyPaid");

  // Group by day of week, simulate YoY comparison from actual data
  const totalByDay: Record<string, number> = {};
  for (const i of paidIncome) {
    const dayIdx = parseISO(i.date).getDay();
    const dayLabel = days[dayIdx === 0 ? 6 : dayIdx - 1]; // Mon=0
    totalByDay[dayLabel] = (totalByDay[dayLabel] || 0) + i.amount;
  }

  return days.map((day) => ({
    day,
    year2023: Math.round((totalByDay[day] || 800) * 0.65), // simulate prior year
    year2024: totalByDay[day] || 800,
  }));
}

export function getWeeklyActivityData(income: IncomeTransaction[]): { day: string; height: string; color: string; label?: string }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const paidIncome = active(income).filter((i) => i.status === "Paid" || i.status === "PartiallyPaid");

  const totalByDay: Record<string, number> = {};
  for (const i of paidIncome) {
    const dayIdx = parseISO(i.date).getDay();
    const dayLabel = days[dayIdx === 0 ? 6 : dayIdx - 1];
    totalByDay[dayLabel] = (totalByDay[dayLabel] || 0) + i.amount;
  }

  const maxVal = Math.max(...Object.values(totalByDay), 1);

  return days.map((day) => {
    const val = totalByDay[day] || 0;
    const pct = Math.max(15, Math.round((val / maxVal) * 100));
    const isMax = val === maxVal && val > 0;
    return {
      day,
      height: `${pct}%`,
      color: isMax ? "#a3e635" : "var(--border)",
      ...(isMax ? { label: new Intl.NumberFormat("en-US").format(val) } : {}),
    };
  });
}

export function getSpendChartData(expenses: ExpenseRecord[]): { day: string; value: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activeExp = active(expenses);

  const totalByDay: Record<string, number> = {};
  for (const e of activeExp) {
    const dayIdx = parseISO(e.date).getDay();
    const dayLabel = days[dayIdx === 0 ? 6 : dayIdx - 1];
    totalByDay[dayLabel] = (totalByDay[dayLabel] || 0) + e.amount;
  }

  return days.map((day) => ({
    day,
    value: totalByDay[day] || 0,
  }));
}

// ─── TAX CALCULATIONS ────────────────────────────────────────

export function calculateTaxLiabilities(taxRecords: TaxRecord[]): {
  totalOwed: number;
  totalPaid: number;
  totalPending: number;
  byType: { type: string; amount: number }[];
} {
  const activeRecords = active(taxRecords);
  const totalPaid = sumBy(activeRecords.filter((t) => t.status === "Paid"), "amount");
  const totalPending = sumBy(activeRecords.filter((t) => t.status === "Pending"), "amount");

  const byType = Object.entries(groupBy(activeRecords, (t) => t.type)).map(([type, items]) => ({
    type,
    amount: sumBy(items, "amount"),
  }));

  return {
    totalOwed: totalPaid + totalPending,
    totalPaid,
    totalPending,
    byType,
  };
}

// ─── BUDGET AGGREGATES ───────────────────────────────────────

export function calculateBudgetAllocation(budgets: ProjectBudget[]): {
  totalExpected: number;
  totalActualCost: number;
  totalActualRevenue: number;
  usagePercent: number;
  weddingBudgetSpent: number;
  weddingBudgetTotal: number;
  gearBudgetSpent: number;
  gearBudgetTotal: number;
} {
  const activeBudgets = active(budgets);
  const totalExpected = sumBy(activeBudgets, "expectedCost");
  const totalActualCost = sumBy(activeBudgets, "actualCost");
  const totalActualRevenue = sumBy(activeBudgets, "actualRevenue");

  // Split: first budget is "wedding", rest is "gear/operations" for demo
  const weddingBudgets = activeBudgets.slice(0, Math.ceil(activeBudgets.length / 2));
  const gearBudgets = activeBudgets.slice(Math.ceil(activeBudgets.length / 2));

  return {
    totalExpected,
    totalActualCost,
    totalActualRevenue,
    usagePercent: totalExpected > 0 ? (totalActualCost / totalExpected) * 100 : 0,
    weddingBudgetSpent: sumBy(weddingBudgets, "actualCost"),
    weddingBudgetTotal: sumBy(weddingBudgets, "expectedCost"),
    gearBudgetSpent: sumBy(gearBudgets, "actualCost"),
    gearBudgetTotal: sumBy(gearBudgets, "expectedCost"),
  };
}

// ─── NOTIFICATION GENERATION ─────────────────────────────────

export function generateNotifications(state: FinanceState): FinanceNotification[] {
  const notifications: FinanceNotification[] = [];
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Overdue invoices
  for (const inv of active(state.invoices)) {
    if (inv.status === "Overdue" || (inv.status !== "Paid" && inv.status !== "Cancelled" && inv.status !== "Draft" && isBefore(parseISO(inv.dueDate), now))) {
      notifications.push({
        id: generateId("notif"), type: "OverdueInvoice", title: "Overdue Invoice",
        message: `Invoice ${inv.invoiceNumber} for ${inv.clientName} is overdue (${differenceInDays(now, parseISO(inv.dueDate))} days)`,
        severity: "error", date: now.toISOString(), read: false, actionUrl: "", entityId: inv.id, entityType: "invoice",
      });
    }
  }

  // Upcoming subscription renewals (within 7 days)
  for (const sub of active(state.subscriptions)) {
    if (sub.status === "Active" && isBefore(parseISO(sub.renewalDate), in7days) && isAfter(parseISO(sub.renewalDate), now)) {
      notifications.push({
        id: generateId("notif"), type: "SubscriptionRenewal", title: "Subscription Renewal",
        message: `${sub.name} renews in ${differenceInDays(parseISO(sub.renewalDate), now)} days ($${sub.monthlyAmount}/mo)`,
        severity: "warning", date: now.toISOString(), read: false, actionUrl: "", entityId: sub.id, entityType: "subscription",
      });
    }
  }

  // Upcoming payroll
  for (const p of active(state.payroll)) {
    if (p.status === "Upcoming") {
      notifications.push({
        id: generateId("notif"), type: "UpcomingSalary", title: "Upcoming Payroll",
        message: `${p.name} — $${p.totalPay.toLocaleString()} due for ${p.period}`,
        severity: "info", date: now.toISOString(), read: false, actionUrl: "", entityId: p.id, entityType: "payroll",
      });
    }
  }

  // Gear maintenance due
  for (const gear of active(state.gearMaintenance)) {
    if (gear.nextServiceDate && isBefore(parseISO(gear.nextServiceDate), in7days)) {
      notifications.push({
        id: generateId("notif"), type: "MaintenanceReminder", title: "Maintenance Due",
        message: `${gear.name} needs servicing (due ${format(parseISO(gear.nextServiceDate), "MMM d, yyyy")})`,
        severity: "warning", date: now.toISOString(), read: false, actionUrl: "", entityId: gear.id, entityType: "gear",
      });
    }
  }

  // Low cash warning
  const cashFlow = calculateTotalRevenue(state.income) - calculateTotalExpenses(state.expenses);
  const monthlyExpenses = calculateTotalExpenses(state.expenses) / 6; // rough monthly avg
  if (cashFlow < monthlyExpenses * 2) {
    notifications.push({
      id: generateId("notif"), type: "LowCashWarning", title: "Low Cash Reserve",
      message: `Cash reserve ($${cashFlow.toLocaleString()}) is below 2 months of expenses`,
      severity: "error", date: now.toISOString(), read: false, actionUrl: "", entityId: "", entityType: "",
    });
  }

  return notifications;
}

// ─── REPORT GENERATION ───────────────────────────────────────

export function generateReport(state: FinanceState, period: ReportPeriod): ReportData {
  const cashFlow = calculateCashFlow(state.income, state.expenses, period);
  const { total: outstandingTotal } = calculateOutstandingInvoices(state.invoices);
  const payrollTotal = calculatePayrollCost(state.payroll);

  const now = new Date();
  let start: Date, end: Date;
  switch (period) {
    case "Daily": start = subDays(now, 1); end = now; break;
    case "Weekly": start = startOfWeek(now); end = endOfWeek(now); break;
    case "Monthly": start = startOfMonth(now); end = endOfMonth(now); break;
    case "Quarterly": start = startOfQuarter(now); end = endOfQuarter(now); break;
    case "Yearly": start = startOfYear(now); end = endOfYear(now); break;
  }

  return {
    period,
    dateRange: { start: start.toISOString(), end: end.toISOString() },
    revenue: cashFlow.totalIncome,
    expenses: cashFlow.totalExpenses,
    profit: cashFlow.netProfit,
    cashFlow,
    outstandingInvoices: outstandingTotal,
    payrollTotal,
    generatedAt: now.toISOString(),
  };
}
