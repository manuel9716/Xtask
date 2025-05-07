import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProcessCount {
  module: string;
  moduleName: string;
  count: number;
  icon: string;
  color: string;
  route: string;
}

export interface DashboardReportData {
  processCounts: ProcessCount[];
  totalEmployees: number;
  totalProjects: number;
  totalBudgets: number;
  totalTransactions: number;
  activeProjects: number;
  pendingBudgets: number;
}

export function useDashboardReports() {
  // Consultar datos de proyectos
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Consultar datos de presupuestos
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['/api/presupuestos'],
  });

  // Consultar datos de empleados
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Consultar datos de transacciones
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Consultar datos de tareas
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Calcular conteos de proceso
  const processCounts: ProcessCount[] = [
    {
      module: 'projects',
      moduleName: 'Proyectos',
      count: projects?.length || 0,
      icon: 'Briefcase',
      color: 'bg-primary-100 text-primary-700',
      route: '/admin/proyectos'
    },
    {
      module: 'budgets',
      moduleName: 'Presupuestos',
      count: budgets?.length || 0,
      icon: 'DollarSign',
      color: 'bg-amber-100 text-amber-700',
      route: '/admin/presupuestos'
    },
    {
      module: 'employees',
      moduleName: 'Empleados',
      count: employees?.length || 0,
      icon: 'Users',
      color: 'bg-indigo-100 text-indigo-700',
      route: '/recursos-humanos/empleados'
    },
    {
      module: 'tasks',
      moduleName: 'Tareas',
      count: tasks?.length || 0,
      icon: 'CheckSquare',
      color: 'bg-green-100 text-green-700',
      route: '/admin/tareas'
    },
    {
      module: 'transactions',
      moduleName: 'Transacciones',
      count: transactions?.length || 0,
      icon: 'Receipt',
      color: 'bg-blue-100 text-blue-700',
      route: '/admin/finanzas/transacciones'
    }
  ];

  // Calcular proyectos activos
  const activeProjects = projects?.filter(
    (project: any) => project.status === 'active' || project.estado === 'ACTIVO'
  ).length || 0;

  // Calcular presupuestos pendientes
  const pendingBudgets = budgets?.filter(
    (budget: any) => budget.estado === 'PENDIENTE'
  ).length || 0;

  // Datos consolidados del dashboard
  const dashboardData: DashboardReportData = {
    processCounts,
    totalEmployees: employees?.length || 0,
    totalProjects: projects?.length || 0,
    totalBudgets: budgets?.length || 0,
    totalTransactions: transactions?.length || 0,
    activeProjects,
    pendingBudgets
  };

  const isLoading = 
    projectsLoading || 
    budgetsLoading || 
    employeesLoading || 
    transactionsLoading ||
    tasksLoading;

  return {
    data: dashboardData,
    isLoading
  };
}