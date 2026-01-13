import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Appservice {

  private baseUrl = 'http://localhost:8080/api/bookings';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // USER REGISTRATION
  registerUser(data: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/auth/register`, data);
  }

  // USER LOGIN
  login(data: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/auth/login`, data);
  }

  // Snackbar for login error
  showAutoCloseAlert() {
    this.snackBar.open('Login failed!', '', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  // VEHICLE BOOKING
  bookVehicle(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bookvehicle`, data);
  }

  // FETCH ALL BOOKINGS
  getBookedVehicles() {
  return this.http.get<any[]>('http://localhost:8080/all/bookings');
}





}
