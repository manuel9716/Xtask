import { useState } from "react";
import { Users, UserPlus, ShieldCheck, UserCog, Search, Filter, Eye, Lock, Mail, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("users");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter users by role and search query
  const filteredUsers = users?.filter(user => {
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    const searchMatch = !searchQuery || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatch && searchMatch;
  });

  // Get unique roles for role filter
  const roles = users ? [...new Set(users.map(user => user.role))] : [];

  // Calculate user metrics
  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter(user => user.role === "admin").length || 0;
  const recentUsers = users?.filter(user => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(user.createdAt) > oneMonthAgo;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage users, roles, and permissions in your organization</p>
        </div>
        <Button className="md:self-start" size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>
      
      {/* User Management Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="bg-primary-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{adminUsers}</div>
              <div className="bg-amber-100 p-2 rounded-full">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">New Users (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{recentUsers}</div>
              <div className="bg-green-100 p-2 rounded-full">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                  ))}
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
                    <TableHead className="font-medium">User</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Created</TableHead>
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
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers?.length ? (
                    filteredUsers.map((user) => {
                      const createdDate = new Date(user.createdAt).toLocaleDateString();
                      const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
                      
                      // Role badge styling
                      const roleBadge = user.role === "admin" 
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-100 text-blue-800 border-blue-200";
                      
                      return (
                        <TableRow key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary-100 text-primary-700">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{user.fullName}</p>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={roleBadge}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span>Active</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">{createdDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Lock className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-red-500">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No users found. Adjust your filters or add a new user.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Admin Role Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-medium">Administrator</CardTitle>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">System Role</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Full access to all system features and settings</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-users" defaultChecked disabled />
                          <Label htmlFor="admin-users">User Management</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-projects" defaultChecked disabled />
                          <Label htmlFor="admin-projects">Projects</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-finance" defaultChecked disabled />
                          <Label htmlFor="admin-finance">Finances</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-hr" defaultChecked disabled />
                          <Label htmlFor="admin-hr">Human Resources</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-suppliers" defaultChecked disabled />
                          <Label htmlFor="admin-suppliers">Suppliers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-settings" defaultChecked disabled />
                          <Label htmlFor="admin-settings">System Settings</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* User Role Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-medium">Regular User</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Default Role</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Limited access to system features based on assigned permissions</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="user-users" />
                          <Label htmlFor="user-users">User Management</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="user-projects" defaultChecked />
                          <Label htmlFor="user-projects">Projects</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="user-finance" />
                          <Label htmlFor="user-finance">Finances</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="user-hr" />
                          <Label htmlFor="user-hr">Human Resources</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="user-suppliers" defaultChecked />
                          <Label htmlFor="user-suppliers">Suppliers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="user-settings" />
                          <Label htmlFor="user-settings">System Settings</Label>
                        </div>
                      </div>
                      <Button className="mt-4" variant="outline">Save Changes</Button>
                    </CardContent>
                  </Card>
                  
                  {/* Custom Role Button */}
                  <Button className="w-full py-8 border-dashed" variant="outline">
                    <UserCog className="mr-2 h-5 w-5" /> Create Custom Role
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-8">
                <div className="relative pl-6 pb-6 border-l border-gray-200">
                  <div className="absolute left-[-8px] top-0 bg-green-500 w-4 h-4 rounded-full border-4 border-white"></div>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">User Login</p>
                      <p className="text-sm text-gray-500">User John Doe logged into the system</p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Today, 10:45 AM</Badge>
                  </div>
                </div>
                
                <div className="relative pl-6 pb-6 border-l border-gray-200">
                  <div className="absolute left-[-8px] top-0 bg-amber-500 w-4 h-4 rounded-full border-4 border-white"></div>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Password Changed</p>
                      <p className="text-sm text-gray-500">User Sarah Johnson changed their password</p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Yesterday, 2:30 PM</Badge>
                  </div>
                </div>
                
                <div className="relative pl-6 pb-6 border-l border-gray-200">
                  <div className="absolute left-[-8px] top-0 bg-blue-500 w-4 h-4 rounded-full border-4 border-white"></div>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">User Added</p>
                      <p className="text-sm text-gray-500">Administrator added new user Michael Foster</p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Sep 15, 9:15 AM</Badge>
                  </div>
                </div>
                
                <div className="relative pl-6 pb-6 border-l border-gray-200">
                  <div className="absolute left-[-8px] top-0 bg-red-500 w-4 h-4 rounded-full border-4 border-white"></div>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">User Removed</p>
                      <p className="text-sm text-gray-500">Administrator removed user Tom Wilson</p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Sep 12, 4:25 PM</Badge>
                  </div>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute left-[-8px] top-0 bg-purple-500 w-4 h-4 rounded-full border-4 border-white"></div>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Role Modified</p>
                      <p className="text-sm text-gray-500">Administrator updated permissions for role 'Project Manager'</p>
                    </div>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Sep 10, 11:05 AM</Badge>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-6">Load More Activity</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
