import { useState } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, List, Calendar, Clock, AlertCircle, Plus, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tasks() {
  const [activeTab, setActiveTab] = useState("kanban");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter tasks by priority
  const filteredTasks = tasks?.filter(task => {
    return priorityFilter === "all" || task.priority === priorityFilter;
  });

  // Group tasks by status
  const todoTasks = tasks?.filter(task => task.status === "todo") || [];
  const inProgressTasks = tasks?.filter(task => task.status === "in_progress") || [];
  const completedTasks = tasks?.filter(task => task.status === "completed") || [];

  // Calculate task metrics
  const totalTasks = tasks?.length || 0;
  const completedTasksCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Priority badge color mapping
  const priorityColorMap: Record<string, string> = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };

  const priorityIcon: Record<string, any> = {
    low: <span className="text-green-600">●</span>,
    medium: <span className="text-amber-600">●</span>,
    high: <span className="text-red-600">●</span>,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage and track your team's tasks and projects</p>
        </div>
        <Button className="md:self-start" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create New Task
        </Button>
      </div>
      
      {/* Task Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              {totalTasks}
              <CheckSquare className="ml-2 h-5 w-5 text-primary-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Across all projects
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              {inProgressTasks.length}
              <Clock className="ml-2 h-5 w-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Tasks being worked on
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              {completedTasks.length}
              <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Successfully finished
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle className="text-3xl">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="kanban" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban" className="flex items-center">
            <CheckSquare className="mr-2 h-4 w-4" /> Kanban Board
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <List className="mr-2 h-4 w-4" /> List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" /> Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard />
        </TabsContent>
        
        <TabsContent value="list" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm bg-gray-50">
                    <th className="px-6 py-3 font-medium">Task</th>
                    <th className="px-6 py-3 font-medium">Priority</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Due Date</th>
                    <th className="px-6 py-3 font-medium">Assignee</th>
                    <th className="px-6 py-3 font-medium">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32 mt-1" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-20" />
                        </td>
                      </tr>
                    ))
                  ) : filteredTasks?.length ? (
                    filteredTasks.map((task) => {
                      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline";
                      
                      // Status badge styling
                      const statusBadge = task.status === "todo" 
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : task.status === "in_progress"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-green-100 text-green-800 border-green-200";
                      
                      const statusLabel = task.status === "todo"
                        ? "To Do"
                        : task.status === "in_progress"
                          ? "In Progress"
                          : "Completed";
                      
                      return (
                        <tr key={task.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{task.title}</p>
                              {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={priorityColorMap[task.priority]}>
                              <span className="flex items-center gap-1">
                                {priorityIcon[task.priority]}
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={statusBadge}>
                              {statusLabel}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {dueDate}
                          </td>
                          <td className="px-6 py-4">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary-100 text-primary-700">
                                {task.assigneeId ? task.assigneeId.toString().substring(0, 2) : "UN"}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {task.projectId ? `Project #${task.projectId}` : "—"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-gray-500">
                        No tasks found. Adjust your filters or create a new task.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center min-h-[500px]">
              <div className="text-center text-gray-500">
                <Calendar className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                <p>View your tasks in a calendar format to manage deadlines better</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
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
