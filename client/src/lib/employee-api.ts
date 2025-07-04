import { apiRequest } from "./queryClient";
import type { Employee, InsertEmployee, UpdateEmployee } from "@shared/schema";

export const employeeApi = {
  getAll: () => fetch("/api/employees", { credentials: "include" }).then(res => res.json()) as Promise<Employee[]>,
  
  getById: (id: number) => 
    fetch(`/api/employees/${id}`, { credentials: "include" }).then(res => res.json()) as Promise<Employee>,
  
  create: (employee: InsertEmployee) => 
    apiRequest("POST", "/api/employees", employee).then(res => res.json()) as Promise<Employee>,
  
  update: (id: number, updates: UpdateEmployee) => 
    apiRequest("PUT", `/api/employees/${id}`, updates).then(res => res.json()) as Promise<Employee>,
  
  delete: (id: number) => 
    apiRequest("DELETE", `/api/employees/${id}`),
  
  updateLocation: (id: number, latitude: number, longitude: number, location?: string) =>
    apiRequest("PUT", `/api/employees/${id}/location`, { latitude, longitude, location }).then(res => res.json()) as Promise<Employee>,
  
  updateStatus: (id: number, status: string) =>
    apiRequest("PUT", `/api/employees/${id}/status`, { status }).then(res => res.json()) as Promise<Employee>,
  
  assignToCustomer: (id: number, customerId: string, customerName: string) =>
    apiRequest("PUT", `/api/employees/${id}/assign`, { customerId, customerName }).then(res => res.json()) as Promise<Employee>,
  
  getByStatus: (status: string) =>
    fetch(`/api/employees/status/${status}`, { credentials: "include" }).then(res => res.json()) as Promise<Employee[]>,
};
