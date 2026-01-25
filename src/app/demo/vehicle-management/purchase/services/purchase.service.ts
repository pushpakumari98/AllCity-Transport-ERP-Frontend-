import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehiclePurchase } from '../models/vehicle-purchase.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private apiUrl = `${environment.apiUrl}/api/vehicle-purchases`;

  constructor(private http: HttpClient) {}

  // ✅ Add purchase
  addPurchase(purchase: VehiclePurchase): Observable<VehiclePurchase> {
    return this.http.post<VehiclePurchase>(this.apiUrl, purchase);
  }

  // ✅ Get all purchases
  getAllPurchases(): Observable<VehiclePurchase[]> {
    return this.http.get<VehiclePurchase[]>(this.apiUrl);
  }

  // ✅ Update purchase (by backend ID)
  updatePurchase(purchase: VehiclePurchase): Observable<VehiclePurchase> {
    return this.http.put<VehiclePurchase>(
      `${this.apiUrl}/${purchase.id}`,
      purchase
    );
  }

  // ✅ Delete purchase
  deletePurchase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
