// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from '../model/event.model';
import { BookingStatus } from '../enums/booking-status.enum';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/all`, { headers: this.getHeaders() });
  }

  createEvent(event: EventModel): Observable<EventModel> {
    return this.http.post<EventModel>(`${this.baseUrl}/create`, event, { headers: this.getHeaders() });
  }

  update(id: number, event: EventModel): Observable<EventModel> {
    return this.http.put<EventModel>(`${this.baseUrl}/update/${id}`, event, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, { headers: this.getHeaders() });
  }

  findById(id: number): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByDepartment(department: string): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/department/${department}`, { headers: this.getHeaders() });
  }

  getByBookingStatus(status: BookingStatus): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/booking-status/${status}`, { headers: this.getHeaders() });
  }

  getByCategory(category: string): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/category/${category}`, { headers: this.getHeaders() });
  }

  getByEventType(eventType: string): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/event-type/${eventType}`, { headers: this.getHeaders() });
  }

  getByVehiclePriority(priority: string): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.baseUrl}/vehicle-priority/${priority}`, { headers: this.getHeaders() });
  }
}

