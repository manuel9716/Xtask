import { useQuery } from "@tanstack/react-query";
import { Employee } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, MessageSquare, UserPlus, ArrowRight } from "lucide-react";

interface TeamMembersProps {
  className?: string;
  limit?: number;
}

export function TeamMembers({ className, limit = 4 }: TeamMembersProps) {
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const displayEmployees = limit ? employees?.slice(0, limit) : employees;
  const totalEmployees = employees?.length || 0;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-lg text-gray-900">Team Members</h2>
        <Button variant="ghost" className="text-primary-600 hover:text-primary-700 text-sm gap-1">
          <UserPlus className="h-4 w-4 mr-1" /> Add Member
        </Button>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center text-gray-400 space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))
          ) : displayEmployees?.length ? (
            displayEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {employee.userId.toString().substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">Employee ID: {employee.id}</p>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 space-x-2">
                  <Button variant="ghost" size="icon" className="hover:text-gray-600">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-gray-600">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No team members found
            </div>
          )}
        </div>
        
        {limit && totalEmployees > limit && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-700 px-0 flex items-center gap-1">
              View All Team Members <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
