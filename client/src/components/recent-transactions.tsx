import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { MoreHorizontal, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface RecentTransactionsProps {
  className?: string;
  limit?: number;
}

export function RecentTransactions({ className, limit = 4 }: RecentTransactionsProps) {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Filter to approved transactions only and sort by date (newest first)
  const approvedTransactions = transactions
    ?.filter(tx => tx.status === "approved")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-lg text-gray-900">Recent Transactions</h2>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))
        ) : approvedTransactions?.length ? (
          approvedTransactions.map((transaction) => {
            const isIncome = transaction.type === "income";
            const amount = parseFloat(transaction.amount.toString());
            const formattedDate = format(new Date(transaction.date), "MMM d, h:mm a");
            
            return (
              <div key={transaction.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{transaction.category}</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>
                </div>
                <p className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}${amount.toLocaleString()}
                </p>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
}
