import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface FinancialSummaryProps {
  className?: string;
}

export function FinancialSummary({ className }: FinancialSummaryProps) {
  const [timeframe, setTimeframe] = useState("this-month");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate financial totals
  const income = transactions
    ?.filter(t => t.type === "income" && t.status === "approved")
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
  
  const expenses = transactions
    ?.filter(t => t.type === "expense" && t.status === "approved")
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;

  // Group expenses by category
  const expensesByCategory = transactions
    ?.filter(t => t.type === "expense" && t.status === "approved")
    .reduce((acc, tx) => {
      const category = tx.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(tx.amount.toString());
      return acc;
    }, {} as Record<string, number>) || {};

  // Sort categories by amount
  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Calculate total for percentage
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-lg text-gray-900">Financial Summary</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="This Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Income</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mb-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900">${income.toLocaleString()}</p>
            )}
            <p className="text-xs text-green-600 flex items-center mt-1">
              ↑ 18.2% from last month
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mb-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900">${expenses.toLocaleString()}</p>
            )}
            <p className="text-xs text-red-600 flex items-center mt-1">
              ↑ 5.4% from last month
            </p>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : sortedCategories.length > 0 ? (
            sortedCategories.map(([category, amount], index) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const barColors = [
                "bg-primary-500",
                "bg-orange-500",
                "bg-indigo-500"
              ];
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-700 capitalize">{category}</p>
                    <p className="text-sm font-medium text-gray-900">${amount.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`${barColors[index % barColors.length]} h-2 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-3 text-gray-500">
              No transaction data available
            </div>
          )}
        </div>
        
        <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-700 px-0 flex items-center gap-1">
          View Detailed Report <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
