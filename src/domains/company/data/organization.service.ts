import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Employee, Department, OrganizationNode } from '../models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private employees$ = new BehaviorSubject<Employee[]>([]);
  private departments$ = new BehaviorSubject<Department[]>([]);

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@traintiq.com',
        phone: '+1-555-0101',
        position: 'Chief Executive Officer',
        department: 'Executive',
        avatar: 'https://images.unsplash.com/photo-1676054628252-fdcf193f0cb7?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2018-01-15'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Leadership', 'Strategy', 'Business Development'],
        bio: 'Visionary leader with 15+ years of experience in tech industry.',
        location: 'San Francisco, CA'
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@traintiq.com',
        phone: '+1-555-0102',
        position: 'Chief Technology Officer',
        department: 'Technology',
        managerId: '1',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2018-03-20'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Software Architecture', 'AI/ML', 'Team Management'],
        bio: 'Tech innovator passionate about AI and machine learning.',
        location: 'San Francisco, CA'
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@traintiq.com',
        phone: '+1-555-0103',
        position: 'Head of Human Resources',
        department: 'Human Resources',
        managerId: '1',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2019-05-10'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Talent Acquisition', 'Employee Relations', 'Performance Management'],
        bio: 'HR expert focused on building great workplace culture.',
        location: 'San Francisco, CA'
      },
      {
        id: '4',
        name: 'David Wilson',
        email: 'david.wilson@traintiq.com',
        phone: '+1-555-0104',
        position: 'Senior Software Engineer',
        department: 'Technology',
        managerId: '2',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2020-02-15'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Angular', 'Python', 'Cloud Architecture'],
        bio: 'Full-stack developer with expertise in modern web technologies.',
        location: 'Austin, TX'
      },
      {
        id: '5',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@traintiq.com',
        phone: '+1-555-0105',
        position: 'Product Manager',
        department: 'Product',
        managerId: '1',
        avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2019-08-30'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Product Strategy', 'User Research', 'Data Analysis'],
        bio: 'Product strategist focused on user-centered design.',
        location: 'Seattle, WA'
      },
      {
        id: '6',
        name: 'James Anderson',
        email: 'james.anderson@traintiq.com',
        phone: '+1-555-0106',
        position: 'UX Designer',
        department: 'Design',
        managerId: '5',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2020-11-12'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['UI/UX Design', 'Prototyping', 'User Research'],
        bio: 'Creative designer passionate about user experience.',
        location: 'Remote'
      },
      {
        id: '7',
        name: 'Maria Garcia',
        email: 'maria.garcia@traintiq.com',
        phone: '+1-555-0107',
        position: 'Marketing Manager',
        department: 'Marketing',
        managerId: '1',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2021-01-18'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Digital Marketing', 'Content Strategy', 'Brand Management'],
        bio: 'Marketing expert with a passion for brand storytelling.',
        location: 'New York, NY'
      },
      {
        id: '8',
        name: 'Robert Kim',
        email: 'robert.kim@traintiq.com',
        phone: '+1-555-0108',
        position: 'DevOps Engineer',
        department: 'Technology',
        managerId: '2',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        joinDate: new Date('2020-09-22'),
        status: 'active',
        employeeType: 'full-time',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        bio: 'Infrastructure specialist focused on scalable solutions.',
        location: 'Denver, CO'
      }
    ];

    const mockDepartments: Department[] = [
      { id: '1', name: 'Executive', description: 'Executive Leadership', headId: '1', color: '#1a237e', employeeCount: 1 },
      { id: '2', name: 'Technology', description: 'Engineering and Development', headId: '2', color: '#0d47a1', employeeCount: 3 },
      { id: '3', name: 'Human Resources', description: 'People and Culture', headId: '3', color: '#e65100', employeeCount: 1 },
      { id: '4', name: 'Product', description: 'Product Management', headId: '5', color: '#2e7d32', employeeCount: 1 },
      { id: '5', name: 'Design', description: 'User Experience and Design', headId: '6', color: '#7b1fa2', employeeCount: 1 },
      { id: '6', name: 'Marketing', description: 'Marketing and Communications', headId: '7', color: '#c62828', employeeCount: 1 }
    ];

    this.employees$.next(mockEmployees);
    this.departments$.next(mockDepartments);
  }

  getEmployees(): Observable<Employee[]> {
    return this.employees$.asObservable();
  }

  getDepartments(): Observable<Department[]> {
    return this.departments$.asObservable();
  }

  getEmployee(id: string): Observable<Employee | undefined> {
    const employees = this.employees$.value;
    return of(employees.find(emp => emp.id === id));
  }

  buildOrganizationTree(): Observable<OrganizationNode[]> {
    const employees = this.employees$.value;
    const rootEmployees = employees.filter(emp => !emp.managerId);
    
    const buildNode = (employee: Employee, level: number = 0): OrganizationNode => {
      const children = employees
        .filter(emp => emp.managerId === employee.id)
        .map(child => buildNode(child, level + 1));
      
      return {
        employee,
        children,
        level,
        expanded: level < 2
      };
    };

    const tree = rootEmployees.map(emp => buildNode(emp));
    return of(tree);
  }

  addEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString()
    };
    
    const currentEmployees = this.employees$.value;
    this.employees$.next([...currentEmployees, newEmployee]);
    
    return of(newEmployee);
  }

  updateEmployee(id: string, updates: Partial<Employee>): Observable<Employee> {
    const employees = this.employees$.value;
    const index = employees.findIndex(emp => emp.id === id);
    
    if (index >= 0) {
      const updatedEmployee = { ...employees[index], ...updates };
      employees[index] = updatedEmployee;
      this.employees$.next([...employees]);
      return of(updatedEmployee);
    }
    
    throw new Error('Employee not found');
  }

  deleteEmployee(id: string): Observable<boolean> {
    const employees = this.employees$.value;
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    
    // Remove manager reference from direct reports
    const updatedEmployees = filteredEmployees.map(emp => 
      emp.managerId === id ? { ...emp, managerId: undefined } : emp
    );
    
    this.employees$.next(updatedEmployees);
    return of(true);
  }

  searchEmployees(query: string): Observable<Employee[]> {
    const employees = this.employees$.value;
    const filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.position.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase())
    );
    
    return of(filtered);
  }

  getEmployeesByDepartment(departmentName: string): Observable<Employee[]> {
    const employees = this.employees$.value;
    const filtered = employees.filter(emp => emp.department === departmentName);
    return of(filtered);
  }
} 