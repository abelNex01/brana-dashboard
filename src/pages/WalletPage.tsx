import { FinancialLedgerView } from "@/components/FinancialLedgerView";

export default function WalletPage() {
  return (
    <div className="w-full min-h-full p-4 flex flex-col bg-background text-foreground gap-4">
      {/* Financial Ledger */}
      <FinancialLedgerView />
    </div>
  );
}
