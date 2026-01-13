import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Driver } from '../models/driver.model';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private storageKey = 'drivers';
  private apiUrl = 'http://localhost:8080/api/drivers'; // Assuming backend endpoint

  constructor(private http: HttpClient) {}

  // Add driver
  addDriver(driver: Driver): Observable<Driver> {
    return new Observable(observer => {
      this.http.post<Driver>(`${this.apiUrl}/create`, driver).subscribe({
        next: (result) => {
          observer.next(result);
          observer.complete();
        },
        error: () => {
          // Fallback to local storage
          driver.id = Date.now();
          this.addDriverLocally(driver);
          observer.next(driver);
          observer.complete();
        }
      });
    });
  }

  // Get all drivers
  getAllDrivers(): Observable<Driver[]> {
    return new Observable(observer => {
      this.http.get<Driver[]>(`${this.apiUrl}`).subscribe({
        next: (drivers) => observer.next(drivers),
        error: () => {
          // Fallback to local storage
          const localDrivers = this.getAllDriversLocally();
          observer.next(localDrivers);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Update driver
  updateDriver(driver: Driver): Observable<Driver> {
    return new Observable(observer => {
      this.http.put<Driver>(`${this.apiUrl}/${driver.id}`, driver).subscribe({
        next: (updatedDriver) => observer.next(updatedDriver),
        error: () => {
          // Fallback to local storage
          this.updateDriverLocally(driver);
          observer.next(driver);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Delete driver
  deleteDriver(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
        next: () => observer.next(),
        error: () => {
          // Fallback to local storage
          this.deleteDriverLocally(id);
          observer.next();
        },
        complete: () => observer.complete()
      });
    });
  }

  private getAllDriversLocally(): Driver[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private addDriverLocally(driver: Driver): void {
    const drivers = this.getAllDriversLocally();
    drivers.push(driver);
    localStorage.setItem(this.storageKey, JSON.stringify(drivers));
  }

  private updateDriverLocally(driver: Driver): void {
    const drivers = this.getAllDriversLocally();
    const index = drivers.findIndex(d => d.id === driver.id);
    if (index !== -1) {
      drivers[index] = driver;
      localStorage.setItem(this.storageKey, JSON.stringify(drivers));
    }
  }

  private deleteDriverLocally(id: number): void {
    const drivers = this.getAllDriversLocally();
    const filtered = drivers.filter(d => d.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
}
