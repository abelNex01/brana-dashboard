import { FinancialLedgerView } from "@/components/FinancialLedgerView";
import { useFinanceContext } from "@/contexts/FinanceContext";

export default function WalletPage() {
  const { isFinanceReady } = useFinanceContext();

  if (!isFinanceReady) {
    return (
      <div className="w-full min-h-full p-4 flex items-center justify-center bg-background text-muted-foreground">
        Loading financial data...
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-4 flex flex-col bg-background text-foreground gap-4">
      <FinancialLedgerView />
    </div>
  );
}
