import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, Department } from './admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private base = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // EMPLOYEES
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.base}/employees`);
  }

  createEmployee(data: any): Observable<Employee> {
    return this.http.post<Employee>(`${this.base}/employees`, data);
  }

  updateEmployee(id: number, data: any): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/employees/${id}`);
  }

  // DEPARTMENTS
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.base}/departments`);
  }

  createDepartment(data: any): Observable<Department> {
    return this.http.post<Department>(`${this.base}/departments`, data);
  }
}
export { Employee, Department };

