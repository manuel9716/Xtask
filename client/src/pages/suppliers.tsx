import { useState } from "react";
import { Store, ShoppingBag, Truck, FileCheck, Plus, Filter, Eye, FileText, PackageCheck, ArrowUpDown } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Supplier, Product, PurchaseOrder } from "@shared/schema";
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
import { Input } from "@/components/ui/input";

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState("suppliers");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: suppliers, isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: purchaseOrders, isLoading: ordersLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  // Filter suppliers by category
  const filteredSuppliers = suppliers?.filter(supplier => {
    return categoryFilter === "all" || supplier.category === categoryFilter;
  });

  // Filter products
  const filteredProducts = products?.filter(product => {
    return statusFilter === "all" || product.status === statusFilter;
  });

  // Get unique categories for filter
  const categories = [...new Set(suppliers?.map(s => s.category) || [])];

  // Calculate supplier metrics
  const totalSuppliers = suppliers?.length || 0;
  const activeSuppliers = suppliers?.filter(s => s.status === "active").length || 0;
  const totalProducts = products?.length || 0;
  const pendingOrders = purchaseOrders?.filter(po => po.status === "pending").length || 0;

  // Status badge color mapping
  const statusColorMap: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    available: "bg-green-100 text-green-800 border-green-200",
    discontinued: "bg-gray-100 text-gray-800 border-gray-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500">Manage your suppliers, products, and purchase orders</p>
        </div>
        <Button className="md:self-start" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>
      
      {/* Supplier Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Suppliers"
          value={totalSuppliers.toString()}
          icon={Store}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          change={{ value: "2", isPositive: true, text: "new this month" }}
        />
        
        <StatCard
          title="Active Suppliers"
          value={activeSuppliers.toString()}
          icon={FileCheck}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change={{ value: "1", isPositive: true, text: "more than last month" }}
        />
        
        <StatCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={ShoppingBag}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          change={{ value: "7", isPositive: true, text: "new products" }}
        />
        
        <StatCard
          title="Pending Orders"
          value={pendingOrders?.toString() || "0"}
          icon={Truck}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          change={{ value: "3", isPositive: false, text: "awaiting approval" }}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="suppliers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suppliers" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  className="pl-10"
                />
              </div>
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
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Category</TableHead>
                    <TableHead className="font-medium">Contact</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliersLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredSuppliers?.length ? (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium text-gray-900">{supplier.name}</TableCell>
                        <TableCell className="capitalize">{supplier.category}</TableCell>
                        <TableCell>{supplier.contactPerson || "—"}</TableCell>
                        <TableCell>{supplier.email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColorMap[supplier.status]}>
                            {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <ShoppingBag className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No suppliers found. Adjust your filters or add a new supplier.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Product Name</TableHead>
                    <TableHead className="font-medium">Supplier</TableHead>
                    <TableHead className="font-medium">Category</TableHead>
                    <TableHead className="font-medium">Price</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredProducts?.length ? (
                    filteredProducts.map((product) => {
                      const price = product.price ? parseFloat(product.price.toString()) : null;
                      const supplier = suppliers?.find(s => s.id === product.supplierId);
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                          <TableCell>{supplier?.name || `Supplier #${product.supplierId}`}</TableCell>
                          <TableCell className="capitalize">{product.category || "Uncategorized"}</TableCell>
                          <TableCell>{price ? `$${price.toLocaleString()}` : "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColorMap[product.status]}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <ShoppingBag className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No products found. Adjust your filters or add a new product.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Purchase Orders</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> New Order
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {ordersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="p-4 flex justify-between items-center border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full mt-3" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : purchaseOrders?.length ? (
                <div className="space-y-4">
                  {purchaseOrders.map((order) => {
                    const supplier = suppliers?.find(s => s.id === order.supplierId);
                    const totalAmount = parseFloat(order.totalAmount.toString());
                    const createdDate = new Date(order.createdAt).toLocaleDateString();
                    
                    return (
                      <Card key={order.id} className="overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <p className="text-sm text-gray-500">Supplier: {supplier?.name || `Supplier #${order.supplierId}`}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={statusColorMap[order.status]}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Total Amount</p>
                              <p className="font-medium">${totalAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Created On</p>
                              <p className="font-medium">{createdDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Project</p>
                              <p className="font-medium">{order.projectId ? `#${order.projectId}` : "—"}</p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4 space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Button>
                            {order.status === "pending" && (
                              <Button size="sm">
                                <PackageCheck className="mr-2 h-4 w-4" /> Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Truck className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders</h3>
                  <p>Create your first purchase order to start tracking supplier orders</p>
                  <Button className="mt-4">Create Purchase Order</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Search icon component
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
