import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehicleBooking } from '../models/vehicle-booking.model';
import { Vehicle } from '../models/vehicle-booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:8080/api'; 
  private bookingsUrl = `${this.apiUrl}/bookings`;
  private vehiclesUrl = `${this.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  // ✅ Get all bookings
  getAllBookings(): Observable<VehicleBooking[]> {
    return this.http.get<VehicleBooking[]>(`${this.bookingsUrl}/all/bookings`);
  }

  // ✅ Get all bookings (alias for compatibility)
  getBookedVehicles(): Observable<VehicleBooking[]> {
    return this.getAllBookings();
  }

  // ✅ Get booking by ID
  getBookingById(id: number): Observable<VehicleBooking> {
    return this.http.get<VehicleBooking>(`${this.bookingsUrl}/${id}`);
  }

  // ✅ Add booking (matches backend: @PostMapping("/bookvehicle"))
  addBooking(booking: VehicleBooking): Observable<VehicleBooking> {
    return this.http.post<VehicleBooking>(`${this.bookingsUrl}/bookvehicle`, booking);
  }

  // ✅ Update booking (matches backend: @PutMapping("/{id}"))
  updateBooking(booking: VehicleBooking): Observable<VehicleBooking> {
    return this.http.put<VehicleBooking>(`${this.bookingsUrl}/${booking.id}`, booking);
  }

  // ✅ Delete booking by ID
  deleteBooking(id: number): Observable<string> {
    return this.http.delete<string>(`${this.bookingsUrl}/${id}`);
  }

  // ✅ Get bookings by status
  getBookingsByStatus(status: string): Observable<VehicleBooking[]> {
    return this.http.get<VehicleBooking[]>(`${this.bookingsUrl}/status/${status}`);
  }

  // ✅ Get bookings between dates
  getBookingsBetweenDates(startDate: string, endDate: string): Observable<VehicleBooking[]> {
    return this.http.get<VehicleBooking[]>(`${this.bookingsUrl}/dates?startDate=${startDate}&endDate=${endDate}`);
  }

  // ✅ Count pending bookings
  countPendingBookings(): Observable<number> {
    return this.http.get<number>(`${this.bookingsUrl}/count/pending`);
  }

  // ✅ Count completed bookings
  countCompletedBookings(): Observable<number> {
    return this.http.get<number>(`${this.bookingsUrl}/count/completed`);
  }

  // ✅ Update POD file path
  updatePod(id: number, podFilePath: string): Observable<string> {
    return this.http.put<string>(`${this.bookingsUrl}/${id}/pod?podFilePath=${podFilePath}`, {});
  }

  // ✅ VEHICLE ENDPOINTS

  // ✅ Get all vehicles
  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.vehiclesUrl);
  }

  // ✅ Get vehicle by ID
  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.vehiclesUrl}/${id}`);
  }

  // ✅ Get vehicle by business vehicle ID
  getVehicleByVehicleId(vehicleId: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.vehiclesUrl}/by-vehicle-id/${vehicleId}`);
  }

  // ✅ Add vehicle
  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.vehiclesUrl, vehicle);
  }

  // ✅ Update vehicle
  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.vehiclesUrl}/${vehicle.id}`, vehicle);
  }

  // ✅ Delete vehicle
  deleteVehicle(id: number): Observable<string> {
    return this.http.delete<string>(`${this.vehiclesUrl}/${id}`);
  }
}
