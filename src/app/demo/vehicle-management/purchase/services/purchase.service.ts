import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { VehiclePurchase } from '../models/vehicle-purchase.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/vehicle-purchases`;
  private localStorageKey = 'vehiclePurchases';

  constructor(private http: HttpClient) {}

  // Add purchase
  addPurchase(purchase: VehiclePurchase): Observable<VehiclePurchase> {
    // Create a copy without slNo for backend (auto-generated)
    const { slNo, ...purchaseData } = purchase;

    return new Observable(observer => {
      this.http.post<VehiclePurchase>(this.apiUrl, purchaseData).subscribe({
        next: (result) => {
          console.log('Purchase added to backend successfully:', result);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          console.error('Backend error, falling back to localStorage:', error);
          // Fallback to local storage
          purchase.slNo = Date.now(); // Assign a temporary ID
          this.addPurchaseLocally(purchase);
          console.log('Purchase saved to localStorage:', purchase);
          observer.next(purchase);
          observer.complete();
        }
      });
    });
  }

  // Get all purchases
  getAllPurchases(): Observable<VehiclePurchase[]> {
    return new Observable(observer => {
      this.http.get<VehiclePurchase[]>(`${this.apiUrl}`).subscribe({
        next: (purchases) => observer.next(purchases),
        error: () => {
          // Fallback to local storage
          const localPurchases = this.getAllPurchasesLocally();
          observer.next(localPurchases);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Update purchase
  updatePurchase(purchase: VehiclePurchase): Observable<VehiclePurchase> {
    return new Observable(observer => {
      this.http.put<VehiclePurchase>(`${this.apiUrl}/${purchase.slNo}`, purchase).subscribe({
        next: (updatedPurchase) => observer.next(updatedPurchase),
        error: () => {
          // Fallback to local storage
          this.updatePurchaseLocally(purchase);
          observer.next(purchase);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Delete purchase
  deletePurchase(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
        next: () => observer.next(),
        error: () => {
          // Fallback to local storage
          this.deletePurchaseLocally(id);
          observer.next();
        },
        complete: () => observer.complete()
      });
    });
  }

  private getAllPurchasesLocally(): VehiclePurchase[] {
    const stored = localStorage.getItem(this.localStorageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private addPurchaseLocally(purchase: VehiclePurchase): void {
    const purchases = this.getAllPurchasesLocally();
    purchases.push(purchase);
    localStorage.setItem(this.localStorageKey, JSON.stringify(purchases));
  }

  private updatePurchaseLocally(purchase: VehiclePurchase): void {
    const purchases = this.getAllPurchasesLocally();
    const index = purchases.findIndex(p => p.slNo === purchase.slNo);
    if (index !== -1) {
      purchases[index] = purchase;
      localStorage.setItem(this.localStorageKey, JSON.stringify(purchases));
    }
  }

  private deletePurchaseLocally(id: number): void {
    const purchases = this.getAllPurchasesLocally();
    const filtered = purchases.filter(p => p.slNo !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
  }
}
