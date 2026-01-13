import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehicleSale } from '../models/vehicle-sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private apiUrl = 'http://localhost:8080/api'; // Assuming backend endpoint
  private localStorageKey = 'vehicleSales';

  constructor(private http: HttpClient) {}

  // Add sale
  addSale(sale: any): Observable<any> {
    // Try backend first, fallback to local storage
    console.log('Just before selling vehicle call');

  
      return this.http.post(`${this.apiUrl}/vehicle-sales`, sale);
  

    // this.http.post<VehicleSale>(`${this.apiUrl}`, sale).subscribe({
    //   next: () => {},
    //   error: () => {
    //     // Fallback to local storage
    //     sale.id = Date.now(); // Assign a temporary ID
    //     this.addSaleLocally(sale);
    //   }
    // });
    // // Always return the sale with ID for immediate response
    // sale.id = sale.id || Date.now();
    // this.addSaleLocally(sale);
    // return of(sale);
  }

  // Get all sales
  getAllSales(): Observable<VehicleSale[]> {
    return new Observable(observer => {
      this.http.get<VehicleSale[]>(`${this.apiUrl}/getallsoldvehicle`).subscribe({
        next: (sales) => observer.next(sales),
        error: () => {
          // Fallback to local storage
          const localSales = this.getAllSalesLocally();
          observer.next(localSales);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Update sale
  updateSale(sale: VehicleSale): Observable<VehicleSale> {
    return new Observable(observer => {
      this.http.put<VehicleSale>(`${this.apiUrl}/${sale.id}`, sale).subscribe({
        next: (updatedSale) => observer.next(updatedSale),
        error: () => {
          // Fallback to local storage
          this.updateSaleLocally(sale);
          observer.next(sale);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Delete sale
  deleteSale(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
        next: () => observer.next(),
        error: () => {
          // Fallback to local storage
          this.deleteSaleLocally(id);
          observer.next();
        },
        complete: () => observer.complete()
      });
    });
  }

  private getAllSalesLocally(): VehicleSale[] {
    const stored = localStorage.getItem(this.localStorageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private addSaleLocally(sale: VehicleSale): void {
    const sales = this.getAllSalesLocally();
    sales.push(sale);
    localStorage.setItem(this.localStorageKey, JSON.stringify(sales));
  }

  private updateSaleLocally(sale: VehicleSale): void {
    const sales = this.getAllSalesLocally();
    const index = sales.findIndex(s => s.id === sale.id);
    if (index !== -1) {
      sales[index] = sale;
      localStorage.setItem(this.localStorageKey, JSON.stringify(sales));
    }
  }

  private deleteSaleLocally(id: number): void {
    const sales = this.getAllSalesLocally();
    const filtered = sales.filter(s => s.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
  }
}
