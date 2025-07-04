export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  managerId?: string;
  avatar?: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'on-leave';
  employeeType: 'full-time' | 'part-time' | 'contractor' | 'intern';
  skills?: string[];
  bio?: string;
  location?: string;
  directReports?: Employee[];
  isManager?: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  color?: string;
  employeeCount: number;
}

export interface OrganizationNode {
  employee: Employee;
  children: OrganizationNode[];
  level: number;
  expanded?: boolean;
  x?: number;
  y?: number;
}

export interface OrganizationViewMode {
  chart: 'tree' | 'compact' | 'branch';
  directory: 'list' | 'grid' | 'table';
} 