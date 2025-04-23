import { useState } from "react";
import { DollarSign, BarChart3, CreditCard, FileText, Plus, ArrowUpRight, Filter } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { RecentTransactions } from "@/components/recent-transactions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/financial-summary";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Finances() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Filter transactions by status and type
  const filteredTransactions = transactions?.filter(tx => {
    const statusMatch = statusFilter === "all" || tx.status === statusFilter;
    const typeMatch = typeFilter === "all" || tx.type === typeFilter;
    return statusMatch && typeMatch;
  });

  // Calculate financial metrics
  const totalIncome = transactions
    ?.filter(t => t.type === "income" && t.status === "approved")
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
  
  const totalExpenses = transactions
    ?.filter(t => t.type === "expense" && t.status === "approved")
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
  
  const pendingApprovals = transactions
    ?.filter(t => t.status === "pending")
    .length || 0;
  
  const balance = totalIncome - totalExpenses;

  // Status badge color mapping
  const statusColorMap: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  // Type badge color mapping
  const typeColorMap: Record<string, string> = {
    income: "bg-blue-100 text-blue-800 border-blue-200",
    expense: "bg-violet-100 text-violet-800 border-violet-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Finances</h1>
          <p className="text-gray-500">Manage your company's financial transactions and budgets</p>
        </div>
        <Button className="md:self-start" size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Transaction
        </Button>
      </div>
      
      {/* Financial Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={`$${totalIncome.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change={{ value: "8.2%", isPositive: true, text: "from last month" }}
        />
        
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          icon={CreditCard}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          change={{ value: "3.1%", isPositive: false, text: "from last month" }}
        />
        
        <StatCard
          title="Net Balance"
          value={`$${balance.toLocaleString()}`}
          icon={BarChart3}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          change={{ value: "12.5%", isPositive: true, text: "from last month" }}
        />
        
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.toString()}
          icon={FileText}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          change={{ value: "2", isPositive: false, text: "since yesterday" }}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                    <p>Financial chart visualization would appear here</p>
                    <p className="text-sm mt-2">Showing monthly comparison for the current year</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <FinancialSummary />
            </div>
          </div>
          
          <RecentTransactions limit={5} />
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Advanced Filters
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Category</TableHead>
                    <TableHead className="font-medium">Type</TableHead>
                    <TableHead className="font-medium">Amount</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Date</TableHead>
                    <TableHead className="font-medium">Project</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredTransactions?.length ? (
                    filteredTransactions.map((transaction) => {
                      const amount = parseFloat(transaction.amount.toString());
                      const date = new Date(transaction.date).toLocaleDateString();
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">#{transaction.id}</TableCell>
                          <TableCell className="capitalize">{transaction.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={typeColorMap[transaction.type]}>
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell className={transaction.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {transaction.type === 'income' ? '+' : '-'}${amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColorMap[transaction.status]}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{date}</TableCell>
                          <TableCell>{transaction.projectId || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                        No transactions found. Adjust your filters or create a new transaction.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="budgets" className="mt-6">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-500">
                <DollarSign className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project Budgets</h3>
                <p>Budget tracking and allocation would appear here</p>
                <Button className="mt-4">Set Up Budgets</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-500">
                <FileText className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Reports</h3>
                <p>Generate and download financial reports for your business</p>
                <Button className="mt-4">Generate Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
