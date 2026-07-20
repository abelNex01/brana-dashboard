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
  generateId,
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
  Settings,
  DollarSign,
  TrendingDown,
  Layers,
  Shield,
  Briefcase,
  PenTool,
  Calendar,
  User,
  Hash,
  Clock,
  CreditCard,
  Tag,
  Package,
  Activity,
  Printer,
  Mail,
  Phone,
  MapPin,
  DollarSign as Dollar,
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
  const { filterItems, filters, setFilters } = useFinanceFilters();

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
        employeeId: formFields.employeeId || generateId("emp"),
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
              icon: Hash,
            },
            {
              label: "Description",
              value: selectedRecord.description || "—",
              icon: FileText,
            },
            {
              label: "Notes",
              value: selectedRecord.notes || "—",
              icon: PenTool,
            },
            {
              label: "Favorite",
              value: selectedRecord.isFavorite ? "Yes" : "No",
              icon: Heart,
            },
            {
              label: "Pinned",
              value: selectedRecord.isPinned ? "Yes" : "No",
              icon: Pin,
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
              icon: PenTool,
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
              icon: PenTool,
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
              icon: PenTool,
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

      {/* Overview Section — Wallet-style cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* ── CARD 1 · TOTAL INCOME · Emerald aurora ── */}
        <div className="overflow-hidden rounded-[26px] border border-border/50 bg-card shadow-sm">
          {/* Header */}
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

          {/* Aurora panel */}
          <div className="relative m-2 mt-0 h-44 overflow-hidden rounded-[20px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-700 dark:from-emerald-700 dark:via-emerald-500 dark:to-green-800">
            <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-lime-300/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 left-10 h-40 w-40 rounded-full bg-teal-300/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/25" />

            {/* Toggle-style glass chip */}
            <div className="absolute left-4 top-4 flex h-8 w-14 items-center rounded-full bg-white/20 backdrop-blur-md dark:bg-white/15">
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
                <TrendingDown className="h-3.5 w-3.5 rotate-180 text-emerald-600" />
              </span>
            </div>

            {/* Amount */}
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

        {/* ── CARD 2 · TOTAL EXPENSES · Rose aurora ── */}
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

            <div className="absolute left-4 top-4 flex h-8 w-14 items-center rounded-full bg-white/20 backdrop-blur-md dark:bg-white/15">
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
                <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              </span>
            </div>

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

        {/* ── CARD 3 · NET BALANCE · Indigo aurora (amber when loss) ── */}
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

            <div className="absolute left-4 top-4 flex h-8 w-14 items-center rounded-full bg-white/20 backdrop-blur-md dark:bg-white/15">
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
                <Package
                  className={`h-3.5 w-3.5 ${
                    totalIncome - totalExpenses >= 0
                      ? "text-indigo-600"
                      : "text-amber-600"
                  }`}
                />
              </span>
            </div>

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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-full text-[14px] glass-input outline-none"
          />
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

      {/* Scrollable domain navigation rail */}
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
              {activeDomain === "invoices" && (
                <>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-center">Actions</th>
                </>
              )}
              {activeDomain === "editorPayments" && (
                <>
                  <th className="p-4">Editor</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Remaining</th>
                  <th className="p-4 text-center">Status</th>
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
              {activeDomain === "gear" && (
                <>
                  <th className="p-4">Gear Item</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4">Next Service</th>
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
              {activeDomain === "audit" && (
                <>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Description</th>
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
                  No records found. Click "Add Record" to seed data or adjust
                  your search filter.
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

                  {activeDomain === "invoices" && (
                    <>
                      <td className="p-4 font-bold text-primary">
                        {item.invoiceNumber}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {item.clientName}
                      </td>
                      <td className="p-4 text-right font-black text-foreground">
                        {formatCurrency(item.grandTotal, item.currency)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.status === "Paid"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : item.status === "Sent"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatShortDate(item.dueDate)}
                      </td>
                    </>
                  )}

                  {activeDomain === "editorPayments" && (
                    <>
                      <td className="p-4 font-bold text-foreground">
                        {item.name}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {humanize(item.role)}
                      </td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="p-4 text-right font-semibold text-red-500">
                        {formatCurrency(item.remainingBalance, item.currency)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.status === "Paid"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
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

                  {activeDomain === "gear" && (
                    <>
                      <td className="p-4 font-bold text-foreground">
                        {item.name}
                      </td>
                      <td className="p-4 text-muted-foreground">{item.type}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.condition === "Excellent" ||
                            item.condition === "Good"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        {formatCurrency(item.purchasePrice, item.currency)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatShortDate(item.nextServiceDate)}
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

                  {activeDomain === "audit" && (
                    <>
                      <td className="p-4 text-muted-foreground">
                        {formatShortDate(item.timestamp)}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {item.action}
                      </td>
                      <td className="p-4 font-semibold text-muted-foreground">
                        {item.entityType}
                      </td>
                      <td className="p-4 text-foreground">
                        {item.description}
                      </td>
                    </>
                  )}

                  {activeDomain !== "audit" && (
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
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── ADD MODAL ─── */}
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
                      {
                        value: "AdditionalServices",
                        label: "Additional Services",
                      },
                      { value: "DroneServices", label: "Drone Services" },
                      { value: "EngagementShoot", label: "Engagement Shoot" },
                      {
                        value: "LivestreamServices",
                        label: "Livestream Services",
                      },
                      { value: "TravelFees", label: "Travel Fees" },
                      { value: "AlbumSales", label: "Album Sales" },
                      { value: "ExtraHours", label: "Extra Hours" },
                      {
                        value: "RushDeliveryFees",
                        label: "Rush Delivery Fees",
                      },
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Favorite">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                    value={formFields.isFavorite ? "true" : "false"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        isFavorite: e.target.value === "true",
                      })
                    }
                  />
                </FormField>
                <FormField label="Pinned">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                    value={formFields.isPinned ? "true" : "false"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        isPinned: e.target.value === "true",
                      })
                    }
                  />
                </FormField>
              </div>
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
                      {
                        value: "EquipmentPurchases",
                        label: "Equipment Purchases",
                      },
                      {
                        value: "CameraAccessories",
                        label: "Camera Accessories",
                      },
                      { value: "Lighting", label: "Lighting" },
                      { value: "AudioGear", label: "Audio Gear" },
                      { value: "LensPurchases", label: "Lens Purchases" },
                      { value: "StorageDevices", label: "Storage Devices" },
                      {
                        value: "SoftwareSubscriptions",
                        label: "Software Subscriptions",
                      },
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
                      setFormFields({ ...formFields, quantity: e.target.value })
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

          {activeDomain === "invoices" && (
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Client Email">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. client@example.com"
                    value={formFields.clientEmail || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        clientEmail: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Client Phone">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. +1 555-1234"
                    value={formFields.clientPhone || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        clientPhone: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Subtotal">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.subtotal || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        subtotal: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Tax Rate (%)">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.taxRate || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        taxRate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Tax Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.taxAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        taxAmount: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Discount Rate (%)">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.discountRate || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        discountRate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Discount Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.discountAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        discountAmount: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Grand Total">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 5000"
                    value={formFields.grandTotal || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        grandTotal: e.target.value,
                      })
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
                      { value: "Draft", label: "Draft" },
                      { value: "Sent", label: "Sent" },
                      { value: "Viewed", label: "Viewed" },
                      { value: "Paid", label: "Paid" },
                      { value: "Overdue", label: "Overdue" },
                      { value: "Cancelled", label: "Cancelled" },
                    ]}
                    value={formFields.status || "Draft"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Issue Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.issueDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        issueDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Due Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.dueDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, dueDate: e.target.value })
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

          {activeDomain === "editorPayments" && (
            <>
              <FormField label="Editor Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Solomon Girma"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Role">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "VideoEditor", label: "Video Editor" },
                      { value: "Colorist", label: "Colorist" },
                      { value: "SoundDesigner", label: "Sound Designer" },
                      { value: "Photographer", label: "Photographer" },
                      { value: "DroneOperator", label: "Drone Operator" },
                      { value: "Assistant", label: "Assistant" },
                    ]}
                    value={formFields.role || "VideoEditor"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, role: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Project">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="Project name..."
                    value={formFields.project || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, project: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Total Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="Total pay..."
                    value={formFields.amount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, amount: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Paid Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="Paid so far..."
                    value={formFields.paidAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paidAmount: e.target.value,
                      })
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
                      { value: "Unpaid", label: "Unpaid" },
                      { value: "Partial", label: "Partial" },
                      { value: "Paid", label: "Paid" },
                    ]}
                    value={formFields.status || "Unpaid"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Payment Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.paymentDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Deadline">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.deadline?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, deadline: e.target.value })
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

          {activeDomain === "payroll" && (
            <>
              <FormField label="Employee Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Abi Sala"
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
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Base Salary">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 3000"
                    value={formFields.baseSalary || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        baseSalary: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Bonus">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.bonus || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        bonus: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Commission">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.commission || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        commission: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Allowance">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.allowance || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        allowance: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Overtime">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.overtime || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        overtime: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Deductions">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.deductions || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        deductions: e.target.value,
                      })
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Period">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. 2026-06"
                    value={formFields.period || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, period: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Payment Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.paymentDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentDate: e.target.value,
                      })
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

          {activeDomain === "gear" && (
            <>
              <FormField label="Gear Item Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Sony FX3 Camera"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Type">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Camera", label: "Camera" },
                      { value: "Lens", label: "Lens" },
                      { value: "Gimbal", label: "Gimbal" },
                      { value: "Light", label: "Light" },
                      { value: "Microphone", label: "Microphone" },
                      { value: "Computer", label: "Computer" },
                      { value: "StorageDevice", label: "Storage Device" },
                      { value: "Drone", label: "Drone" },
                      { value: "Monitor", label: "Monitor" },
                      { value: "Tripod", label: "Tripod" },
                    ]}
                    value={formFields.type || "Camera"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, type: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Manufacturer">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. Sony"
                    value={formFields.manufacturer || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        manufacturer: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Model">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. FX3"
                    value={formFields.model || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, model: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Condition">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Excellent", label: "Excellent" },
                      { value: "Good", label: "Good" },
                      { value: "Fair", label: "Fair" },
                      { value: "NeedsRepair", label: "Needs Repair" },
                      { value: "Retired", label: "Retired" },
                    ]}
                    value={formFields.condition || "Excellent"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        condition: e.target.value,
                      })
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
                <FormField label="Purchase Price">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    value={formFields.purchasePrice || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        purchasePrice: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Serial Number">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="SN-XXX-..."
                    value={formFields.serialNumber || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        serialNumber: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Purchase Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.purchaseDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        purchaseDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Warranty Expiry">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.warrantyExpiry?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        warrantyExpiry: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Next Service Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.nextServiceDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        nextServiceDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Total Maintenance Cost">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.totalMaintenanceCost || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        totalMaintenanceCost: e.target.value,
                      })
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
              <div className="grid grid-cols-2 gap-3">
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
                <FormField label="Category">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. Video Editing"
                    value={formFields.category || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Monthly Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 54.99"
                    value={formFields.monthlyAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        monthlyAmount: e.target.value,
                      })
                    }
                  />
                </FormField>
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
                      setFormFields({
                        ...formFields,
                        billingCycle: e.target.value,
                      })
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
                    setFormFields({
                      ...formFields,
                      renewalDate: e.target.value,
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

          <div className="flex justify-end gap-3 pt-3">
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={() => setIsAddOpen(false)}
            />
            <ActionButton
              label="Save Record"
              variant="primary"
              accentColor={activeColor}
              onClick={handleConfirmAdd}
            />
          </div>
        </div>
      </CrudModal>

      {/* ─── EDIT MODAL ─── */}
      <CrudModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${humanize(activeDomain)}`}
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
                      {
                        value: "AdditionalServices",
                        label: "Additional Services",
                      },
                      { value: "DroneServices", label: "Drone Services" },
                      { value: "EngagementShoot", label: "Engagement Shoot" },
                      {
                        value: "LivestreamServices",
                        label: "Livestream Services",
                      },
                      { value: "TravelFees", label: "Travel Fees" },
                      { value: "AlbumSales", label: "Album Sales" },
                      { value: "ExtraHours", label: "Extra Hours" },
                      {
                        value: "RushDeliveryFees",
                        label: "Rush Delivery Fees",
                      },
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Favorite">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                    value={formFields.isFavorite ? "true" : "false"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        isFavorite: e.target.value === "true",
                      })
                    }
                  />
                </FormField>
                <FormField label="Pinned">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "false", label: "No" },
                      { value: "true", label: "Yes" },
                    ]}
                    value={formFields.isPinned ? "true" : "false"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        isPinned: e.target.value === "true",
                      })
                    }
                  />
                </FormField>
              </div>
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
                      {
                        value: "EquipmentPurchases",
                        label: "Equipment Purchases",
                      },
                      {
                        value: "CameraAccessories",
                        label: "Camera Accessories",
                      },
                      { value: "Lighting", label: "Lighting" },
                      { value: "AudioGear", label: "Audio Gear" },
                      { value: "LensPurchases", label: "Lens Purchases" },
                      { value: "StorageDevices", label: "Storage Devices" },
                      {
                        value: "SoftwareSubscriptions",
                        label: "Software Subscriptions",
                      },
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
                      setFormFields({ ...formFields, quantity: e.target.value })
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

          {activeDomain === "invoices" && (
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Client Email">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. client@example.com"
                    value={formFields.clientEmail || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        clientEmail: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Client Phone">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. +1 555-1234"
                    value={formFields.clientPhone || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        clientPhone: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Subtotal">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.subtotal || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        subtotal: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Tax Rate (%)">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.taxRate || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        taxRate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Tax Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.taxAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        taxAmount: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Discount Rate (%)">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.discountRate || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        discountRate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Discount Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.discountAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        discountAmount: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Grand Total">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 5000"
                    value={formFields.grandTotal || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        grandTotal: e.target.value,
                      })
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
                      { value: "Draft", label: "Draft" },
                      { value: "Sent", label: "Sent" },
                      { value: "Viewed", label: "Viewed" },
                      { value: "Paid", label: "Paid" },
                      { value: "Overdue", label: "Overdue" },
                      { value: "Cancelled", label: "Cancelled" },
                    ]}
                    value={formFields.status || "Draft"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Issue Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.issueDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        issueDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Due Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.dueDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, dueDate: e.target.value })
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

          {activeDomain === "editorPayments" && (
            <>
              <FormField label="Editor Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Solomon Girma"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Role">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "VideoEditor", label: "Video Editor" },
                      { value: "Colorist", label: "Colorist" },
                      { value: "SoundDesigner", label: "Sound Designer" },
                      { value: "Photographer", label: "Photographer" },
                      { value: "DroneOperator", label: "Drone Operator" },
                      { value: "Assistant", label: "Assistant" },
                    ]}
                    value={formFields.role || "VideoEditor"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, role: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Project">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="Project name..."
                    value={formFields.project || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, project: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Total Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="Total pay..."
                    value={formFields.amount || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, amount: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Paid Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="Paid so far..."
                    value={formFields.paidAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paidAmount: e.target.value,
                      })
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
                      { value: "Unpaid", label: "Unpaid" },
                      { value: "Partial", label: "Partial" },
                      { value: "Paid", label: "Paid" },
                    ]}
                    value={formFields.status || "Unpaid"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, status: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Payment Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.paymentDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Deadline">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.deadline?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, deadline: e.target.value })
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

          {activeDomain === "payroll" && (
            <>
              <FormField label="Employee Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Abi Sala"
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
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Base Salary">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 3000"
                    value={formFields.baseSalary || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        baseSalary: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Bonus">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.bonus || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        bonus: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Commission">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.commission || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        commission: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Allowance">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.allowance || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        allowance: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Overtime">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.overtime || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        overtime: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Deductions">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.deductions || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        deductions: e.target.value,
                      })
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Period">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. 2026-06"
                    value={formFields.period || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, period: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Payment Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.paymentDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        paymentDate: e.target.value,
                      })
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

          {activeDomain === "gear" && (
            <>
              <FormField label="Gear Item Name">
                <StyledInput
                  accentColor={activeColor}
                  placeholder="e.g. Sony FX3 Camera"
                  value={formFields.name || ""}
                  onChange={(e) =>
                    setFormFields({ ...formFields, name: e.target.value })
                  }
                />
              </FormField>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Type">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Camera", label: "Camera" },
                      { value: "Lens", label: "Lens" },
                      { value: "Gimbal", label: "Gimbal" },
                      { value: "Light", label: "Light" },
                      { value: "Microphone", label: "Microphone" },
                      { value: "Computer", label: "Computer" },
                      { value: "StorageDevice", label: "Storage Device" },
                      { value: "Drone", label: "Drone" },
                      { value: "Monitor", label: "Monitor" },
                      { value: "Tripod", label: "Tripod" },
                    ]}
                    value={formFields.type || "Camera"}
                    onChange={(e) =>
                      setFormFields({ ...formFields, type: e.target.value })
                    }
                  />
                </FormField>
                <FormField label="Manufacturer">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. Sony"
                    value={formFields.manufacturer || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        manufacturer: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Model">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. FX3"
                    value={formFields.model || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, model: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Condition">
                  <StyledSelect
                    accentColor={activeColor}
                    options={[
                      { value: "Excellent", label: "Excellent" },
                      { value: "Good", label: "Good" },
                      { value: "Fair", label: "Fair" },
                      { value: "NeedsRepair", label: "Needs Repair" },
                      { value: "Retired", label: "Retired" },
                    ]}
                    value={formFields.condition || "Excellent"}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        condition: e.target.value,
                      })
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
                <FormField label="Purchase Price">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    value={formFields.purchasePrice || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        purchasePrice: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Serial Number">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="SN-XXX-..."
                    value={formFields.serialNumber || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        serialNumber: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Purchase Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.purchaseDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        purchaseDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Warranty Expiry">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.warrantyExpiry?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        warrantyExpiry: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Next Service Date">
                  <StyledInput
                    accentColor={activeColor}
                    type="date"
                    value={formFields.nextServiceDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        nextServiceDate: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Total Maintenance Cost">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="0"
                    value={formFields.totalMaintenanceCost || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        totalMaintenanceCost: e.target.value,
                      })
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
              <div className="grid grid-cols-2 gap-3">
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
                <FormField label="Category">
                  <StyledInput
                    accentColor={activeColor}
                    placeholder="e.g. Video Editing"
                    value={formFields.category || ""}
                    onChange={(e) =>
                      setFormFields({ ...formFields, category: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Monthly Amount">
                  <StyledInput
                    accentColor={activeColor}
                    type="number"
                    placeholder="e.g. 54.99"
                    value={formFields.monthlyAmount || ""}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        monthlyAmount: e.target.value,
                      })
                    }
                  />
                </FormField>
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
                      setFormFields({
                        ...formFields,
                        billingCycle: e.target.value,
                      })
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
                    setFormFields({
                      ...formFields,
                      renewalDate: e.target.value,
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

          <div className="flex justify-end gap-3 pt-3">
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={() => setIsEditOpen(false)}
            />
            <ActionButton
              label="Save Changes"
              variant="primary"
              accentColor={activeColor}
              onClick={handleConfirmEdit}
            />
          </div>
        </div>
      </CrudModal>

      {/* ─── DETAILS MODAL ─── */}
      <DetailsModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={
          selectedRecord?.clientName ||
          selectedRecord?.name ||
          selectedRecord?.vendor ||
          ""
        }
        subtitle={
          selectedRecord?.eventName ||
          selectedRecord?.role ||
          selectedRecord?.category ||
          ""
        }
        status={
          selectedRecord?.status
            ? {
                label: selectedRecord.status,
                color: activeColor,
                bg: `${activeColor}20`,
              }
            : undefined
        }
        details={getDetailsModalProps().details}
        accentColor={activeColor}
        description={
          activeDomain === "income"
            ? selectedRecord?.description
            : activeDomain === "expenses"
              ? selectedRecord?.description
              : activeDomain === "invoices"
                ? `Invoice for ${selectedRecord?.clientName}`
                : activeDomain === "editorPayments"
                  ? `Payment for ${selectedRecord?.name}`
                  : activeDomain === "payroll"
                    ? `Payroll entry for ${selectedRecord?.name}`
                    : activeDomain === "gear"
                      ? `Gear maintenance record for ${selectedRecord?.name}`
                      : activeDomain === "subscriptions"
                        ? `Subscription for ${selectedRecord?.name}`
                        : undefined
        }
      />

      {/* ─── DELETE MODAL ─── */}
      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={
          activeDomain === "income"
            ? selectedRecord?.eventName
            : activeDomain === "expenses"
              ? selectedRecord?.vendor
              : activeDomain === "invoices"
                ? `Invoice #${selectedRecord?.invoiceNumber}`
                : activeDomain === "editorPayments"
                  ? selectedRecord?.name
                  : activeDomain === "payroll"
                    ? selectedRecord?.name
                    : activeDomain === "gear"
                      ? selectedRecord?.name
                      : activeDomain === "subscriptions"
                        ? selectedRecord?.name
                        : ""
        }
      />
    </div>
  );
}

// Add missing imports
const Heart = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m12.1 21.35l-.1.1l-.11-.1C7.14 18.24 3 15.36 3 10.5C3 7.77 5.24 5.5 8 5.5c1.64 0 3.14.98 3.76 2.44C12.87 6.47 14.36 5.5 16 5.5c2.76 0 5 2.27 5 5c0 4.86-4.14 7.74-8.9 10.85"
    ></path>
  </svg>
);
const Pin = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M17 4V2H7v2H5l2 2.18V12l3 3v7h4v-7l3-3V6.18L19 4zm-3 4.71L13 12v6h-2v-6L10 8.71V6h4z"
    ></path>
  </svg>
);
