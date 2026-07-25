import React, { useState, useMemo } from "react";
import {
  useIncome,
  useExpenses,
  usePayroll,
  useSubscriptions,
} from "@/hooks/useFinance";
import { useFinanceFilters } from "@/hooks/useFinanceFilters";
import {
  formatCurrency,
  formatShortDate,
  humanize,
} from "@/utils/formatters";
import {
  CrudModal,
  ConfirmDeleteModal,
  FormField,
  StyledInput,
  StyledSelect,
  StyledTextArea,
  ActionButton,
} from "@/components/CrudModal";
import { DetailsModal } from "@/components/DetailsModal";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  Briefcase,
  Calendar,
  CreditCard,
  Tag,
  Package,
  Activity,
  Clock,
} from "lucide-react";

const DOMAINS = [
  {
    id: "income",
    label: "Income",
    icon: DollarSign,
    color: "hsl(142 70% 45%)",
  },
  { id: "expenses", label: "Expenses", icon: TrendingDown, color: "#ef4444" },
  { id: "payroll", label: "Payroll", icon: Briefcase, color: "#ec4899" },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: Layers,
    color: "#06b6d4",
  },
];

export function FinancialLedgerView() {
  const [activeDomain, setActiveDomain] = useState("income");
  const [search, setSearch] = useState("");
  const { filterItems, setFilters } = useFinanceFilters();

  // Update filters when search changes
  React.useEffect(() => {
    setFilters({ searchQuery: search });
  }, [search, setFilters]);

  // Load hooks
  const incomeHook = useIncome();
  const expensesHook = useExpenses();
  const payrollHook = usePayroll();
  const subscriptionsHook = useSubscriptions();

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form states (common fields)
  const [formFields, setFormFields] = useState<any>({});

  // Active items selector
  const activeData = useMemo(() => {
    switch (activeDomain) {
      case "income":
        return incomeHook.items;
      case "expenses":
        return expensesHook.items;
      case "payroll":
        return payrollHook.items;
      case "subscriptions":
        return subscriptionsHook.items;
      default:
        return [];
    }
  }, [
    activeDomain,
    incomeHook.items,
    expensesHook.items,
    payrollHook.items,
    subscriptionsHook.items,
  ]);

  // Calculate totals
  const totalIncome = useMemo(() => {
    return incomeHook.items.reduce(
      (sum: number, item: any) => sum + (Number(item.amount) || 0),
      0,
    );
  }, [incomeHook.items]);

  const totalExpenses = useMemo(() => {
    const expensesTotal = expensesHook.items.reduce(
      (sum: number, item: any) => sum + (Number(item.amount) || 0),
      0,
    );
    const payrollTotal = payrollHook.items.reduce(
      (sum: number, item: any) => sum + (Number(item.totalPay) || 0),
      0,
    );
    const subscriptionsTotal = subscriptionsHook.items.reduce(
      (sum: number, item: any) => sum + (Number(item.monthlyAmount) || 0),
      0,
    );
    return expensesTotal + payrollTotal + subscriptionsTotal;
  }, [expensesHook.items, payrollHook.items, subscriptionsHook.items]);

  // Filter & Search
  const filteredItems = useMemo(() => {
    return filterItems(activeData as any[]);
  }, [activeData, filterItems]);

  const activeColor =
    DOMAINS.find((d) => d.id === activeDomain)?.color || "#10b981";

  // CRUD Actions
  const handleOpenAdd = () => {
    setFormFields({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (rec: any) => {
    setSelectedRecord(rec);
    setFormFields({ ...rec });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (rec: any) => {
    setSelectedRecord(rec);
    setIsDeleteOpen(true);
  };

  const handleOpenDetails = (rec: any) => {
    setSelectedRecord(rec);
    setIsDetailsOpen(true);
  };

  const handleConfirmAdd = () => {
    if (activeDomain === "income") {
      incomeHook.create({
        clientName: formFields.clientName || "New Client",
        eventName: formFields.eventName || "Wedding Event",
        category: formFields.category || "WeddingPackage",
        description: formFields.description || "",
        amount: Number(formFields.amount) || 0,
        currency: formFields.currency || "USD",
        paymentMethod: formFields.paymentMethod || "BankTransfer",
        status: formFields.status || "Pending",
        invoiceId: formFields.invoiceId || "",
        date: formFields.date || new Date().toISOString(),
        notes: formFields.notes || "",
        tags: formFields.tags || [],
        isFavorite: formFields.isFavorite || false,
        isPinned: formFields.isPinned || false,
      });
    } else if (activeDomain === "expenses") {
      expensesHook.create({
        category: formFields.category || "Miscellaneous",
        subCategory: formFields.subCategory || "",
        vendor: formFields.vendor || "",
        amount: Number(formFields.amount) || 0,
        quantity: Number(formFields.quantity) || 1,
        date: formFields.date || new Date().toISOString(),
        paymentMethod: formFields.paymentMethod || "CreditCard",
        receiptImage: formFields.receiptImage || "",
        description: formFields.description || "",
        notes: formFields.notes || "",
        currency: formFields.currency || "USD",
        isRecurring: formFields.isRecurring || false,
        recurringInterval: formFields.recurringInterval || "Monthly",
        tags: formFields.tags || [],
        isFavorite: formFields.isFavorite || false,
        isPinned: formFields.isPinned || false,
      });
    } else if (activeDomain === "payroll") {
      payrollHook.create({
        employeeId: formFields.employeeId || `emp_${Date.now()}`,
        name: formFields.name || "",
        role: formFields.role || "",
        baseSalary: Number(formFields.baseSalary) || 0,
        bonus: Number(formFields.bonus) || 0,
        commission: Number(formFields.commission) || 0,
        allowance: Number(formFields.allowance) || 0,
        overtime: Number(formFields.overtime) || 0,
        deductions: Number(formFields.deductions) || 0,
        totalPay:
          Number(formFields.totalPay) || Number(formFields.baseSalary) || 0,
        period: formFields.period || new Date().toISOString().slice(0, 7),
        status: formFields.status || "Pending",
        paymentDate: formFields.paymentDate || "",
        currency: formFields.currency || "USD",
        notes: formFields.notes || "",
      });
    } else if (activeDomain === "subscriptions") {
      subscriptionsHook.create({
        name: formFields.name || "",
        provider: formFields.provider || "",
        category: formFields.category || "",
        billingCycle: formFields.billingCycle || "Monthly",
        renewalDate: formFields.renewalDate || new Date().toISOString(),
        monthlyAmount: Number(formFields.monthlyAmount) || 0,
        annualAmount: (Number(formFields.monthlyAmount) || 0) * 12,
        status: formFields.status || "Active",
        currency: formFields.currency || "USD",
        notes: formFields.notes || "",
      });
    }
    setIsAddOpen(false);
  };

  const handleConfirmEdit = () => {
    const id = selectedRecord.id;
    if (activeDomain === "income") {
      incomeHook.update(id, formFields);
    } else if (activeDomain === "expenses") {
      expensesHook.update(id, formFields);
    } else if (activeDomain === "payroll") {
      payrollHook.update(id, {
        ...formFields,
        totalPay:
          (Number(formFields.baseSalary) || 0) +
          (Number(formFields.bonus) || 0) +
          (Number(formFields.commission) || 0) +
          (Number(formFields.allowance) || 0) +
          (Number(formFields.overtime) || 0) -
          (Number(formFields.deductions) || 0),
      });
    } else if (activeDomain === "subscriptions") {
      subscriptionsHook.update(id, {
        ...formFields,
        annualAmount: (Number(formFields.monthlyAmount) || 0) * 12,
      });
    }
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    const id = selectedRecord.id;
    if (activeDomain === "income") incomeHook.remove(id);
    if (activeDomain === "expenses") expensesHook.remove(id);
    if (activeDomain === "payroll") payrollHook.remove(id);
    if (activeDomain === "subscriptions") subscriptionsHook.remove(id);
    setIsDeleteOpen(false);
  };

  // Render details modal content
  const getDetailsModalProps = () => {
    if (!selectedRecord) return { title: "", subtitle: "", details: [] };

    switch (activeDomain) {
      case "income":
        return {
          title: selectedRecord.clientName,
          subtitle: selectedRecord.eventName,
          status: {
            label: selectedRecord.status,
            color: activeColor,
            bg: `${activeColor}20`,
          },
          details: [
            {
              label: "Amount",
              value: formatCurrency(
                selectedRecord.amount,
                selectedRecord.currency,
              ),
              icon: DollarSign,
            },
            {
              label: "Category",
              value: humanize(selectedRecord.category),
              icon: Tag,
            },
            {
              label: "Payment Method",
              value: humanize(selectedRecord.paymentMethod),
              icon: CreditCard,
            },
            {
              label: "Date",
              value: formatShortDate(selectedRecord.date),
              icon: Calendar,
            },
            {
              label: "Invoice ID",
              value: selectedRecord.invoiceId || "—",
              icon: FileText,
            },
            {
              label: "Description",
              value: selectedRecord.description || "—",
              icon: FileText,
            },
            {
              label: "Notes",
              value: selectedRecord.notes || "—",
              icon: FileText,
            },
          ],
          description: selectedRecord.description,
        };

      case "expenses":
        return {
          title: selectedRecord.vendor,
          subtitle: humanize(selectedRecord.category),
          status: {
            label: "Expense",
            color: "#ef4444",
            bg: "#ef444420",
          },
          details: [
            {
              label: "Amount",
              value: formatCurrency(
                selectedRecord.amount,
                selectedRecord.currency,
              ),
              icon: DollarSign,
            },
            {
              label: "Subcategory",
              value: selectedRecord.subCategory || "—",
              icon: Tag,
            },
            {
              label: "Quantity",
              value: selectedRecord.quantity?.toString() || "1",
              icon: Package,
            },
            {
              label: "Date",
              value: formatShortDate(selectedRecord.date),
              icon: Calendar,
            },
            {
              label: "Payment Method",
              value: humanize(selectedRecord.paymentMethod),
              icon: CreditCard,
            },
            {
              label: "Recurring",
              value: selectedRecord.isRecurring ? "Yes" : "No",
              icon: Activity,
            },
            {
              label: "Description",
              value: selectedRecord.description || "—",
              icon: FileText,
            },
            {
              label: "Notes",
              value: selectedRecord.notes || "—",
              icon: FileText,
            },
          ],
          description: selectedRecord.description,
        };

      case "payroll":
        return {
          title: selectedRecord.name,
          subtitle: selectedRecord.role,
          status: {
            label: selectedRecord.status,
            color: activeColor,
            bg: `${activeColor}20`,
          },
          details: [
            {
              label: "Total Pay",
              value: formatCurrency(
                selectedRecord.totalPay,
                selectedRecord.currency,
              ),
              icon: DollarSign,
            },
            {
              label: "Base Salary",
              value: formatCurrency(
                selectedRecord.baseSalary,
                selectedRecord.currency,
              ),
              icon: TrendingDown,
            },
            {
              label: "Bonus",
              value: formatCurrency(
                selectedRecord.bonus || 0,
                selectedRecord.currency,
              ),
              icon: DollarSign,
            },
            {
              label: "Commission",
              value: formatCurrency(
                selectedRecord.commission || 0,
                selectedRecord.currency,
              ),
              icon: Tag,
            },
            {
              label: "Allowance",
              value: formatCurrency(
                selectedRecord.allowance || 0,
                selectedRecord.currency,
              ),
              icon: Package,
            },
            {
              label: "Overtime",
              value: formatCurrency(
                selectedRecord.overtime || 0,
                selectedRecord.currency,
              ),
              icon: Clock,
            },
            {
              label: "Deductions",
              value: formatCurrency(
                selectedRecord.deductions || 0,
                selectedRecord.currency,
              ),
              icon: TrendingDown,
            },
            { label: "Period", value: selectedRecord.period, icon: Calendar },
            {
              label: "Payment Date",
              value: selectedRecord.paymentDate
                ? formatShortDate(selectedRecord.paymentDate)
                : "—",
              icon: Calendar,
            },
            {
              label: "Notes",
              value: selectedRecord.notes || "—",
              icon: FileText,
            },
          ],
          description: `Payroll entry for ${selectedRecord.name}`,
        };

      case "subscriptions":
        return {
          title: selectedRecord.name,
          subtitle: selectedRecord.provider,
          status: {
            label: selectedRecord.status,
            color: activeColor,
            bg: `${activeColor}20`,
          },
          details: [
            {
              label: "Monthly Amount",
              value: formatCurrency(
                selectedRecord.monthlyAmount,
                selectedRecord.currency,
              ),
              icon: DollarSign,
            },
            {
              label: "Annual Amount",
              value: formatCurrency(
                selectedRecord.annualAmount,
                selectedRecord.currency,
              ),
              icon: TrendingDown,
            },
            {
              label: "Billing Cycle",
              value: selectedRecord.billingCycle,
              icon: Calendar,
            },
            {
              label: "Renewal Date",
              value: formatShortDate(selectedRecord.renewalDate),
              icon: Clock,
            },
            {
              label: "Category",
              value: selectedRecord.category || "—",
              icon: Tag,
            },
            {
              label: "Notes",
              value: selectedRecord.notes || "—",
              icon: FileText,
            },
          ],
          description: `Subscription for ${selectedRecord.name}`,
        };

      default:
        return { title: "", subtitle: "", details: [] };
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-[48px] md:text-[56px] font-black leading-none tracking-tight text-foreground">
          Financial Vault
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Securely Track And Manage All Your Financial Transactions
        </p>
      </header>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* TOTAL INCOME */}
        <div className="overflow-hidden rounded-[26px] border border-border/50 bg-card shadow-sm">
          <div className="flex items-start justify-between px-5 pb-4 pt-5">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Total Income
              </h3>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                {incomeHook.items.length} income records
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-500/15 dark:text-emerald-300">
              <DollarSign className="h-3.5 w-3.5" />
              Income
            </div>
          </div>

          <div className="relative m-2 mt-0 h-44 overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-700 dark:from-emerald-700 dark:via-emerald-500 dark:to-green-800">
            <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-lime-300/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 left-10 h-40 w-40 rounded-full bg-teal-300/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/25" />

            <div className="absolute bottom-4 left-5">
              <p className="text-3xl font-black tracking-tight text-white">
                {formatCurrency(totalIncome)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/80">
                Total Income
              </p>
            </div>
          </div>
        </div>

        {/* TOTAL EXPENSES */}
        <div className="overflow-hidden rounded-[26px] border border-border/50 bg-card shadow-sm">
          <div className="flex items-start justify-between px-5 pb-4 pt-5">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Total Expenses
              </h3>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                {expensesHook.items.length +
                  payrollHook.items.length +
                  subscriptionsHook.items.length}{" "}
                expense records
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold text-rose-600 dark:border-rose-400/25 dark:bg-rose-500/15 dark:text-rose-300">
              <TrendingDown className="h-3.5 w-3.5" />
              Expenses
            </div>
          </div>

          <div className="relative m-2 mt-0 h-44 overflow-hidden rounded-[20px] bg-gradient-to-br from-rose-600 via-red-500 to-rose-800 dark:from-rose-700 dark:via-red-500 dark:to-rose-900">
            <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-orange-300/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 left-10 h-40 w-40 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/25" />

            <div className="absolute bottom-4 left-5">
              <p className="text-3xl font-black tracking-tight text-white">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/80">
                Total Expenses
              </p>
            </div>
          </div>
        </div>

        {/* NET BALANCE */}
        <div className="overflow-hidden rounded-[26px] border border-border/50 bg-card shadow-sm">
          <div className="flex items-start justify-between px-5 pb-4 pt-5">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Net Balance
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Activity className="h-3 w-3" />
                {totalIncome - totalExpenses >= 0 ? "Profit" : "Loss"}
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                totalIncome - totalExpenses >= 0
                  ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/25 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/25 dark:bg-amber-500/15 dark:text-amber-300"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              {totalIncome - totalExpenses >= 0 ? "Profit" : "Loss"}
            </div>
          </div>

          <div
            className={`relative m-2 mt-0 h-44 overflow-hidden rounded-[20px] bg-gradient-to-br ${
              totalIncome - totalExpenses >= 0
                ? "from-indigo-700 via-blue-600 to-violet-800 dark:from-indigo-800 dark:via-blue-600 dark:to-violet-900"
                : "from-amber-600 via-orange-500 to-amber-800 dark:from-amber-700 dark:via-orange-500 dark:to-amber-900"
            }`}
          >
            <div
              className={`pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full blur-3xl ${
                totalIncome - totalExpenses >= 0
                  ? "bg-cyan-300/40"
                  : "bg-yellow-300/40"
              }`}
            />
            <div
              className={`pointer-events-none absolute -bottom-14 left-10 h-40 w-40 rounded-full blur-3xl ${
                totalIncome - totalExpenses >= 0
                  ? "bg-violet-300/30"
                  : "bg-red-300/30"
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/25" />

            <div className="absolute bottom-4 left-5">
              <p className="text-3xl font-black tracking-tight text-white">
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/80">
                Net Balance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="flex items-center justify-between gap-4 mb-2 z-10 relative">
        {/* Search */}
        <div className="relative flex-1 max-w-2xl">
          <div className="group flex items-center gap-2 px-4 h-12 rounded-lg bg-muted/50 border border-border/60 focus-within:border-primary/50 transition-colors w-full">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search for transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Add New */}
        <button
          onClick={handleOpenAdd}
          className="w-14 h-14 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors bg-muted/50 dark:bg-zinc-800 border border-border/40 dark:border-zinc-700/50 shadow-sm hover:shadow-md"
          title="Add New Transaction"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Domain navigation rail */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
        {DOMAINS.map((d) => {
          const Icon = d.icon;
          const isActive = d.id === activeDomain;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDomain(d.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                isActive
                  ? "bg-muted/60 text-foreground border-border/80 shadow-md"
                  : "bg-muted/20 text-muted-foreground border-border/20 hover:border-border/40 hover:text-foreground"
              }`}
              style={isActive ? { borderLeft: `3px solid ${d.color}` } : {}}
            >
              <Icon className="w-4 h-4" style={{ color: d.color }} />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Table Panel */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-xl border border-border/30 bg-card/65 backdrop-blur-md custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/30 bg-muted/10 text-muted-foreground font-bold text-[10px] uppercase tracking-wider sticky top-0">
              {activeDomain === "income" && (
                <>
                  <th className="p-4">Date</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </>
              )}
              {activeDomain === "expenses" && (
                <>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Actions</th>
                </>
              )}
              {activeDomain === "payroll" && (
                <>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Total Pay</th>
                  <th className="p-4">Period</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </>
              )}
              {activeDomain === "subscriptions" && (
                <>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Billing</th>
                  <th className="p-4 text-right">Monthly Cost</th>
                  <th className="p-4">Renewal Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-12 text-center text-muted-foreground font-medium"
                >
                  No records found. Click "+" to add a new record.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  {activeDomain === "income" && (
                    <>
                      <td className="p-4 font-medium">
                        {formatShortDate(item.date)}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        <div>{item.clientName}</div>
                        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                          {item.eventName}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg bg-muted/40 border border-border/20 text-muted-foreground text-[10px]">
                          {humanize(item.category)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-foreground">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.status === "Paid"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : item.status === "Pending"
                                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </>
                  )}

                  {activeDomain === "expenses" && (
                    <>
                      <td className="p-4 font-medium">
                        {formatShortDate(item.date)}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg bg-muted/40 border border-border/20 text-muted-foreground text-[10px]">
                          {humanize(item.category)}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {item.vendor}
                      </td>
                      <td className="p-4 text-right font-black text-red-500">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-[200px] truncate">
                        {item.description}
                      </td>
                    </>
                  )}

                  {activeDomain === "payroll" && (
                    <>
                      <td className="p-4 font-bold text-foreground">
                        {item.name}
                      </td>
                      <td className="p-4 text-muted-foreground">{item.role}</td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        {formatCurrency(item.totalPay, item.currency)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {item.period}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.status === "Paid"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </>
                  )}

                  {activeDomain === "subscriptions" && (
                    <>
                      <td className="p-4 font-bold text-foreground">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                          {item.provider}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {item.billingCycle}
                      </td>
                      <td className="p-4 text-right font-semibold text-red-500">
                        {formatCurrency(item.monthlyAmount, item.currency)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatShortDate(item.renewalDate)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.status === "Active"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </>
                  )}

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetails(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/20 border border-border/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
                        title="View properties details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/20 border border-border/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
                        title="Edit record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-500 transition-all"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      <CrudModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add ${humanize(activeDomain)} Record`}
        accentColor={activeColor}
      >
        <div className="space-y-4">
          {activeDomain === "income" && (
            <>
              <FormField label="Client Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Dawit & Selam"
                  value={formFields.clientName || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, clientName: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Event Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Wedding Cinematic Shoot"
                  value={formFields.eventName || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, eventName: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "WeddingPackage", label: "Wedding Package" },
                      { value: "DepositPayment", label: "Deposit Payment" },
                      { value: "FinalPayment", label: "Final Payment" },
                      { value: "AdditionalServices", label: "Additional Services" },
                      { value: "DroneServices", label: "Drone Services" },
                      { value: "EngagementShoot", label: "Engagement Shoot" },
                      { value: "LivestreamServices", label: "Livestream Services" },
                      { value: "TravelFees", label: "Travel Fees" },
                      { value: "AlbumSales", label: "Album Sales" },
                      { value: "ExtraHours", label: "Extra Hours" },
                      { value: "RushDeliveryFees", label: "Rush Delivery Fees" },
                    ]}
                    value={formFields.category || "WeddingPackage"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 4500"
                    value={formFields.amount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, amount: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Currency">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "USD", label: "USD ($)" },
                      { value: "ETB", label: "ETB (Br)" },
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                    ]}
                    value={formFields.currency || "USD"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, currency: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                      { value: "PartiallyPaid", label: "Partially Paid" },
                      { value: "Overdue", label: "Overdue" },
                      { value: "Cancelled", label: "Cancelled" },
                    ]}
                    value={formFields.status || "Pending"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, date: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Payment Method">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "BankTransfer", label: "Bank Transfer" },
                      { value: "Cash", label: "Cash" },
                      { value: "CreditCard", label: "Credit Card" },
                      { value: "Mobile", label: "Mobile Payment" },
                      { value: "PayPal", label: "PayPal" },
                      { value: "Stripe", label: "Stripe" },
                    ]}
                    value={formFields.paymentMethod || "BankTransfer"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentMethod: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Invoice ID">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="INV-001"
                  value={formFields.invoiceId || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, invoiceId: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Description">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Event details..."
                  value={formFields.description || ""}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      description: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
            </>
          )}

          {activeDomain === "expenses" && (
            <>
              <FormField label="Vendor">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. B&H Photo"
                  value={formFields.vendor || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, vendor: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "EquipmentPurchases", label: "Equipment Purchases" },
                      { value: "CameraAccessories", label: "Camera Accessories" },
                      { value: "Lighting", label: "Lighting" },
                      { value: "AudioGear", label: "Audio Gear" },
                      { value: "LensPurchases", label: "Lens Purchases" },
                      { value: "StorageDevices", label: "Storage Devices" },
                      { value: "SoftwareSubscriptions", label: "Software Subscriptions" },
                      { value: "OfficeExpenses", label: "Office Expenses" },
                      { value: "InternetBills", label: "Internet Bills" },
                      { value: "Transportation", label: "Transportation" },
                      { value: "Accommodation", label: "Accommodation" },
                      { value: "Marketing", label: "Marketing" },
                      { value: "Advertising", label: "Advertising" },
                      { value: "Rent", label: "Rent" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Taxes", label: "Taxes" },
                      { value: "Fuel", label: "Fuel" },
                      { value: "Food", label: "Food" },
                      { value: "Freelancers", label: "Freelancer Fees" },
                      { value: "Miscellaneous", label: "Miscellaneous" },
                    ]}
                    value={formFields.category || "EquipmentPurchases"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 500"
                    value={formFields.amount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, amount: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Quantity">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="1"
                    value={formFields.quantity || 1}
                    onChange={(e) =>
                      setFormFields({ ...formFields, quantity: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Currency">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "USD", label: "USD ($)" },
                      { value: "ETB", label: "ETB (Br)" },
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                    ]}
                    value={formFields.currency || "USD"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, currency: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, date: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Payment Method">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "BankTransfer", label: "Bank Transfer" },
                      { value: "Cash", label: "Cash" },
                      { value: "CreditCard", label: "Credit Card" },
                      { value: "Mobile", label: "Mobile Payment" },
                      { value: "PayPal", label: "PayPal" },
                      { value: "Stripe", label: "Stripe" },
                    ]}
                    value={formFields.paymentMethod || "CreditCard"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentMethod: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Subcategory">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="Additional category details"
                  value={formFields.subCategory || ""}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      subCategory: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Description">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Purchase details..."
                  value={formFields.description || ""}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      description: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Recurring">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                    value={formFields.isRecurring ? "true" : "false"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        isRecurring: e.target.value === "true",
                      })
                    }
                  />
                </FormField>
                {formFields.isRecurring && (
                  <FormField label="Recurring Interval">
                    <StyledSelect
                      accentColor={activeColor}
                      options={[
                        { value: "Weekly", label: "Weekly" },
                        { value: "Monthly", label: "Monthly" },
                        { value: "Quarterly", label: "Quarterly" },
                        { value: "Yearly", label: "Yearly" },
                      ]}
                      value={formFields.recurringInterval || "Monthly"}
                      onChange={(e) =>
                        setFormFields({
                          ...formFields,
                          recurringInterval: e.target.value,
                        })
                      }
                    />
                  </FormField>
                )}
              </div>
            </>
          )}

          {activeDomain === "payroll" && (
            <>
              <FormField label="Employee Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Abi Salah"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Role">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Lead Videographer"
                  value={formFields.role || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, role: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Base Salary">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 3000"
                    value={formFields.baseSalary || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, baseSalary: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Bonus">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 500"
                    value={formFields.bonus || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, bonus: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Commission">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 200"
                    value={formFields.commission || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, commission: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Allowance">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 150"
                    value={formFields.allowance || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, allowance: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Overtime">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 0"
                    value={formFields.overtime || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, overtime: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Deductions">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 100"
                    value={formFields.deductions || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, deductions: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Period (YYYY-MM)">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. 2025-05"
                    value={formFields.period || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, period: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Pending", label: "Pending" },
                      { value: "Paid", label: "Paid" },
                      { value: "Upcoming", label: "Upcoming" },
                    ]}
                    value={formFields.status || "Pending"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
            </>
          )}

          {activeDomain === "subscriptions" && (
            <>
              <FormField label="Subscription Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Adobe Creative Cloud"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Provider">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Adobe"
                  value={formFields.provider || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, provider: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. Editing Software"
                    value={formFields.category || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Monthly Cost">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 54.99"
                    value={formFields.monthlyAmount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, monthlyAmount: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Billing Cycle">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Monthly", label: "Monthly" },
                      { value: "Quarterly", label: "Quarterly" },
                      { value: "Yearly", label: "Yearly" },
                    ]}
                    value={formFields.billingCycle || "Monthly"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, billingCycle: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Cancelled", label: "Cancelled" },
                      { value: "Expiring", label: "Expiring" },
                    ]}
                    value={formFields.status || "Active"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Renewal Date">
                <StyledInput
                  accentColor={activeColor}
                  type="date"
                  value={formFields.renewalDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, renewalDate: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 mt-5">
          <ActionButton
            onClick={() => setIsAddOpen(false)}
            label="Cancel"
            variant="secondary"
          />
          <ActionButton
            onClick={handleConfirmAdd}
            label="Add Record"
            variant="primary"
            accentColor={activeColor}
          />
        </div>
      </CrudModal>

      {/* EDIT MODAL */}
      <CrudModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${humanize(activeDomain)} Record`}
        accentColor={activeColor}
      >
        <div className="space-y-4">
          {activeDomain === "income" && (
            <>
              <FormField label="Client Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Dawit & Selam"
                  value={formFields.clientName || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, clientName: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Event Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Wedding Cinematic Shoot"
                  value={formFields.eventName || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, eventName: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "WeddingPackage", label: "Wedding Package" },
                      { value: "DepositPayment", label: "Deposit Payment" },
                      { value: "FinalPayment", label: "Final Payment" },
                      { value: "AdditionalServices", label: "Additional Services" },
                      { value: "DroneServices", label: "Drone Services" },
                      { value: "EngagementShoot", label: "Engagement Shoot" },
                      { value: "LivestreamServices", label: "Livestream Services" },
                      { value: "TravelFees", label: "Travel Fees" },
                      { value: "AlbumSales", label: "Album Sales" },
                      { value: "ExtraHours", label: "Extra Hours" },
                      { value: "RushDeliveryFees", label: "Rush Delivery Fees" },
                    ]}
                    value={formFields.category || "WeddingPackage"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 4500"
                    value={formFields.amount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, amount: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Currency">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "USD", label: "USD ($)" },
                      { value: "ETB", label: "ETB (Br)" },
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                    ]}
                    value={formFields.currency || "USD"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, currency: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                      { value: "PartiallyPaid", label: "Partially Paid" },
                      { value: "Overdue", label: "Overdue" },
                      { value: "Cancelled", label: "Cancelled" },
                    ]}
                    value={formFields.status || "Pending"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, date: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Payment Method">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "BankTransfer", label: "Bank Transfer" },
                      { value: "Cash", label: "Cash" },
                      { value: "CreditCard", label: "Credit Card" },
                      { value: "Mobile", label: "Mobile Payment" },
                      { value: "PayPal", label: "PayPal" },
                      { value: "Stripe", label: "Stripe" },
                    ]}
                    value={formFields.paymentMethod || "BankTransfer"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentMethod: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Invoice ID">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="INV-001"
                  value={formFields.invoiceId || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, invoiceId: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Description">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Event details..."
                  value={formFields.description || ""}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      description: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
            </>
          )}

          {activeDomain === "expenses" && (
            <>
              <FormField label="Vendor">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. B&H Photo"
                  value={formFields.vendor || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, vendor: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "EquipmentPurchases", label: "Equipment Purchases" },
                      { value: "CameraAccessories", label: "Camera Accessories" },
                      { value: "Lighting", label: "Lighting" },
                      { value: "AudioGear", label: "Audio Gear" },
                      { value: "LensPurchases", label: "Lens Purchases" },
                      { value: "StorageDevices", label: "Storage Devices" },
                      { value: "SoftwareSubscriptions", label: "Software Subscriptions" },
                      { value: "OfficeExpenses", label: "Office Expenses" },
                      { value: "InternetBills", label: "Internet Bills" },
                      { value: "Transportation", label: "Transportation" },
                      { value: "Accommodation", label: "Accommodation" },
                      { value: "Marketing", label: "Marketing" },
                      { value: "Advertising", label: "Advertising" },
                      { value: "Rent", label: "Rent" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Taxes", label: "Taxes" },
                      { value: "Fuel", label: "Fuel" },
                      { value: "Food", label: "Food" },
                      { value: "Freelancers", label: "Freelancer Fees" },
                      { value: "Miscellaneous", label: "Miscellaneous" },
                    ]}
                    value={formFields.category || "EquipmentPurchases"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 500"
                    value={formFields.amount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, amount: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Quantity">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="1"
                    value={formFields.quantity || 1}
                    onChange={(e) =>
                      setFormFields({ ...formFields, quantity: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Currency">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "USD", label: "USD ($)" },
                      { value: "ETB", label: "ETB (Br)" },
                      { value: "EUR", label: "EUR (€)" },
                      { value: "GBP", label: "GBP (£)" },
                    ]}
                    value={formFields.currency || "USD"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, currency: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, date: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Payment Method">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "BankTransfer", label: "Bank Transfer" },
                      { value: "Cash", label: "Cash" },
                      { value: "CreditCard", label: "Credit Card" },
                      { value: "Mobile", label: "Mobile Payment" },
                      { value: "PayPal", label: "PayPal" },
                      { value: "Stripe", label: "Stripe" },
                    ]}
                    value={formFields.paymentMethod || "CreditCard"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentMethod: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Subcategory">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="Additional category details"
                  value={formFields.subCategory || ""}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      subCategory: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Description">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Purchase details..."
                  value={formFields.description || ""}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      description: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Recurring">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                    value={formFields.isRecurring ? "true" : "false"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        isRecurring: e.target.value === "true",
                      })
                    }
                  />
                </FormField>
                {formFields.isRecurring && (
                  <FormField label="Recurring Interval">
                    <StyledSelect
                      accentColor={activeColor}
                      options={[
                        { value: "Weekly", label: "Weekly" },
                        { value: "Monthly", label: "Monthly" },
                        { value: "Quarterly", label: "Quarterly" },
                        { value: "Yearly", label: "Yearly" },
                      ]}
                      value={formFields.recurringInterval || "Monthly"}
                      onChange={(e) =>
                        setFormFields({
                          ...formFields,
                          recurringInterval: e.target.value,
                        })
                      }
                    />
                  </FormField>
                )}
              </div>
            </>
          )}

          {activeDomain === "payroll" && (
            <>
              <FormField label="Employee Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Abi Salah"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Role">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Lead Videographer"
                  value={formFields.role || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, role: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Base Salary">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 3000"
                    value={formFields.baseSalary || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, baseSalary: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Bonus">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 500"
                    value={formFields.bonus || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, bonus: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Commission">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 200"
                    value={formFields.commission || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, commission: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Allowance">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 150"
                    value={formFields.allowance || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, allowance: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Overtime">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 0"
                    value={formFields.overtime || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, overtime: Number(e.target.value) })
                    }
                  />
                </FormField>
                <FormField label="Deductions">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 100"
                    value={formFields.deductions || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, deductions: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Period (YYYY-MM)">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. 2025-05"
                    value={formFields.period || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, period: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Pending", label: "Pending" },
                      { value: "Paid", label: "Paid" },
                      { value: "Upcoming", label: "Upcoming" },
                    ]}
                    value={formFields.status || "Pending"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
            </>
          )}

          {activeDomain === "subscriptions" && (
            <>
              <FormField label="Subscription Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Adobe Creative Cloud"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Provider">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Adobe"
                  value={formFields.provider || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, provider: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. Editing Software"
                    value={formFields.category || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Monthly Cost">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 54.99"
                    value={formFields.monthlyAmount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, monthlyAmount: Number(e.target.value) })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Billing Cycle">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Monthly", label: "Monthly" },
                      { value: "Quarterly", label: "Quarterly" },
                      { value: "Yearly", label: "Yearly" },
                    ]}
                    value={formFields.billingCycle || "Monthly"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, billingCycle: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Status">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Cancelled", label: "Cancelled" },
                      { value: "Expiring", label: "Expiring" },
                    ]}
                    value={formFields.status || "Active"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <FormField label="Renewal Date">
                <StyledInput
                  accentColor={activeColor}
                  type="date"
                  value={formFields.renewalDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, renewalDate: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Notes">
                <StyledTextArea
                  accentColor={activeColor}
                  placeholder="Additional notes..."
                  value={formFields.notes || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, notes: e.target.value })
                  }
                />
              </FormField>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 mt-5">
          <ActionButton
            onClick={() => setIsEditOpen(false)}
            label="Cancel"
            variant="secondary"
          />
          <ActionButton
            onClick={handleConfirmEdit}
            label="Save Changes"
            variant="primary"
            accentColor={activeColor}
          />
        </div>
      </CrudModal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${humanize(activeDomain)} Record`}
        message={`Are you sure you want to delete this ${activeDomain} record? This action cannot be undone.`}
        itemName={selectedRecord?.clientName || selectedRecord?.vendor || selectedRecord?.name}
      />

      {/* DETAILS MODAL */}
      <DetailsModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={getDetailsModalProps().title}
        subtitle={getDetailsModalProps().subtitle}
        status={getDetailsModalProps().status}
        details={getDetailsModalProps().details}
        accentColor={activeColor}
        description={getDetailsModalProps().description}
      />
    </div>
  );
}
