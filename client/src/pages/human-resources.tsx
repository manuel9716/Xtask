import { useState } from "react";
import { Users, UserPlus, Award, Calendar, Plus, Filter, Eye, File, UserCheck, Mail } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMembers } from "@/components/team-members";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@shared/schema";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function HumanResources() {
  const [activeTab, setActiveTab] = useState("employees");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Filter employees by department
  const filteredEmployees = employees?.filter(emp => {
    return departmentFilter === "all" || emp.department === departmentFilter;
  });

  // Get unique departments for filter
  const departments = [...new Set(employees?.map(emp => emp.department) || [])];

  // Calculate HR metrics
  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(emp => emp.contractStatus === "active").length || 0;
  const departmentCounts = employees?.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Human Resources</h1>
          <p className="text-gray-500">Manage your company's employees and HR functions</p>
        </div>
        <Button className="md:self-start" size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>
      
      {/* HR Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees.toString()}
          icon={Users}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          change={{ value: "3", isPositive: true, text: "new this month" }}
        />
        
        <StatCard
          title="Active Contracts"
          value={activeEmployees.toString()}
          icon={UserCheck}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change={{ value: "2", isPositive: true, text: "more than last month" }}
        />
        
        <StatCard
          title="Departments"
          value={Object.keys(departmentCounts).length.toString()}
          icon={Award}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          change={{ value: "1", isPositive: true, text: "new department" }}
        />
        
        <StatCard
          title="Upcoming Reviews"
          value="8"
          icon={Calendar}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          change={{ value: "5", isPositive: false, text: "due this week" }}
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees..."
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
                    <TableHead className="font-medium">Employee</TableHead>
                    <TableHead className="font-medium">Position</TableHead>
                    <TableHead className="font-medium">Department</TableHead>
                    <TableHead className="font-medium">Hire Date</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredEmployees?.length ? (
                    filteredEmployees.map((employee) => {
                      const hireDate = new Date(employee.hireDate).toLocaleDateString();
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary-100 text-primary-700">
                                  {employee.userId.toString().substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">Employee #{employee.id}</p>
                                <p className="text-xs text-gray-500">User ID: {employee.userId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{hireDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              employee.contractStatus === "active" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-red-100 text-red-800 border-red-200"
                            }>
                              {employee.contractStatus.charAt(0).toUpperCase() + employee.contractStatus.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <File className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No employees found. Adjust your filters or add a new employee.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(departmentCounts).map(([department, count]) => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between">
                    <span>{department}</span>
                    <Badge variant="outline" className="ml-2">{count} employees</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Department Head</p>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary-100 text-primary-700">
                            DH
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Department Head TBD</p>
                          <p className="text-xs text-gray-500">Role: Department Manager</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">View Department</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="contracts" className="mt-6">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-500">
                <File className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Contracts</h3>
                <p>Generate, view, and manage employee contracts</p>
                <Button className="mt-4">Create New Contract</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="onboarding" className="mt-6">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-500">
                <UserPlus className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Onboarding</h3>
                <p>Create and manage onboarding processes for new employees</p>
                <Button className="mt-4">Start Onboarding Process</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for the search icon
function Search(props: React.SVGProps<SVGSVGElement>) {
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
