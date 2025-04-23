import { useState } from "react";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const priorityColorMap: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

interface KanbanBoardProps {
  projectId?: number;
  className?: string;
}

export function KanbanBoard({ projectId, className }: KanbanBoardProps) {
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", projectId ? { projectId } : null],
  });

  // Group tasks by status
  const todoTasks = tasks?.filter((task) => task.status === "todo") || [];
  const inProgressTasks = tasks?.filter((task) => task.status === "in_progress") || [];
  const completedTasks = tasks?.filter((task) => task.status === "completed") || [];

  // Render a skeleton loader for a task card
  const TaskCardSkeleton = () => (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full mt-2 mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );

  // Render a task card
  const TaskCard = ({ task }: { task: Task }) => {
    const priorityClass = priorityColorMap[task.priority] || "bg-gray-100 text-gray-800";
    const dueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No deadline';
    
    // Format relative time (today, yesterday, or date)
    const formattedDate = task.dueDate 
      ? format(new Date(task.dueDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        ? 'Today'
        : format(new Date(task.dueDate), 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
          ? 'Yesterday'
          : dueDate
      : 'No deadline';
    
    return (
      <Card className="mb-3">
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={`${priorityClass} border-none px-2 py-1 text-xs font-medium rounded-full`}>
              {task.priority === "low" ? "Low" : task.priority === "medium" ? "Medium" : "High"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <h4 className="font-medium mt-2 mb-1">{task.title}</h4>
          <p className="text-sm text-gray-500 mb-3">{task.description}</p>
          <div className="flex justify-between items-center">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                {task.assigneeId ? "A" + task.assigneeId : "UN"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render a column
  const KanbanColumn = ({ title, count, tasks, isLoading }: { title: string; count: number; tasks: Task[]; isLoading: boolean }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-700 mb-3 flex items-center justify-between">
        <span>{title}</span>
        <Badge variant="outline" className="bg-gray-200 text-gray-600 border-none text-xs font-medium px-2 py-0.5 rounded-full">
          {count}
        </Badge>
      </h3>
      
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => <TaskCardSkeleton key={index} />)
        ) : tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <Card className="border border-dashed text-center p-6">
            <p className="text-gray-500 text-sm">No tasks in this column</p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-lg text-gray-900">Tasks</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="corporate-website">Corporate Website</SelectItem>
              <SelectItem value="mobile-app">Mobile App</SelectItem>
              <SelectItem value="data-center">Data Center</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" className="text-primary-600 hover:text-primary-700 text-sm gap-1">
            <PlusCircle className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KanbanColumn
            title="To Do"
            count={todoTasks.length}
            tasks={todoTasks}
            isLoading={isLoading}
          />
          
          <KanbanColumn
            title="In Progress"
            count={inProgressTasks.length}
            tasks={inProgressTasks}
            isLoading={isLoading}
          />
          
          <KanbanColumn
            title="Completed"
            count={completedTasks.length}
            tasks={completedTasks}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
