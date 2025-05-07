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
  // Consultar datos
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['/api/presupuestos'],
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Convertir a arrays y manejar valores nulos/indefinidos
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const budgets = Array.isArray(budgetsData) ? budgetsData : [];
  const employees = Array.isArray(employeesData) ? employeesData : [];
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];
  const tasks = Array.isArray(tasksData) ? tasksData : [];

  // Calcular conteos de proceso
  const processCounts: ProcessCount[] = [
    {
      module: 'projects',
      moduleName: 'Proyectos',
      count: projects.length,
      icon: 'Briefcase',
      color: 'bg-primary-100 text-primary-700',
      route: '/projects'
    },
    {
      module: 'budgets',
      moduleName: 'Presupuestos',
      count: budgets.length,
      icon: 'DollarSign',
      color: 'bg-amber-100 text-amber-700',
      route: '/finances'
    },
    {
      module: 'employees',
      moduleName: 'Empleados',
      count: employees.length,
      icon: 'Users',
      color: 'bg-indigo-100 text-indigo-700',
      route: '/nomina'
    },
    {
      module: 'tasks',
      moduleName: 'Tareas',
      count: tasks.length,
      icon: 'CheckSquare',
      color: 'bg-green-100 text-green-700',
      route: '/tasks'
    },
    {
      module: 'transactions',
      moduleName: 'Transacciones',
      count: transactions.length,
      icon: 'Receipt',
      color: 'bg-blue-100 text-blue-700',
      route: '/finances'
    }
  ];

  // Calcular proyectos activos
  const activeProjects = projects.filter(
    (project: any) => project.status === 'active' || project.estado === 'ACTIVO'
  ).length;

  // Calcular presupuestos pendientes
  const pendingBudgets = budgets.filter(
    (budget: any) => budget.estado === 'PENDIENTE'
  ).length;

  // Datos consolidados del dashboard
  const dashboardData: DashboardReportData = {
    processCounts,
    totalEmployees: employees.length,
    totalProjects: projects.length,
    totalBudgets: budgets.length,
    totalTransactions: transactions.length,
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