import { useState } from "react";
import { ProjectsTable } from "@/components/projects-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Projects() {
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Calculate project metrics
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === "On Track" || p.status === "At Risk").length || 0;
  const delayedProjects = projects?.filter(p => p.status === "Delayed").length || 0;
  const completedProjects = projects?.filter(p => p.status === "Completed").length || 0;
  
  // Calculate total budget
  const totalBudget = projects?.reduce((acc, project) => {
    return acc + parseFloat(project.budget.toString());
  }, 0) || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage and monitor all your company's projects</p>
        </div>
        <Button className="md:self-start" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create New Project
        </Button>
      </div>
      
      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              From all departments
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-3xl">{activeProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Currently in progress
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delayed Projects</CardDescription>
            <CardTitle className="text-3xl text-red-600">{delayedProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Require attention
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budget</CardDescription>
            <CardTitle className="text-3xl">${totalBudget.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              All projects combined
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Projects Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="delayed">Delayed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProjectsTable />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <ProjectsTable />
        </TabsContent>
        
        <TabsContent value="delayed" className="mt-6">
          <ProjectsTable />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <ProjectsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
