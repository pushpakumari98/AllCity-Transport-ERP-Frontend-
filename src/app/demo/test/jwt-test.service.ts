import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JwtTestService {

  private apiUrl = 'https://allcity-transport-erp.onrender.com/api/test';

  constructor(private http: HttpClient) {}

  /**
   * Example PUT request with JWT token (automatically added by AuthInterceptor)
   * @param id The ID of the resource to update
   * @param data The data to update
   * @returns Observable of the updated resource
   */
  updateResource(id: number, data: any): Observable<any> {
    // JWT token will be automatically added by AuthInterceptor
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Example DELETE request with JWT token (automatically added by AuthInterceptor)
   * @param id The ID of the resource to delete
   * @returns Observable of the delete operation result
   */
  deleteResource(id: number): Observable<any> {
    // JWT token will be automatically added by AuthInterceptor
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Example POST request with JWT token (automatically added by AuthInterceptor)
   * @param data The data to create
   * @returns Observable of the created resource
   */
  createResource(data: any): Observable<any> {
    // JWT token will be automatically added by AuthInterceptor
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * Example GET request with JWT token (automatically added by AuthInterceptor)
   * @returns Observable of the resource data
   */
  getResource(): Observable<any> {
    // JWT token will be automatically added by AuthInterceptor
    return this.http.get<any>(this.apiUrl);
  }
}
