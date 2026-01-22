import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from '../../../model/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private apiUrl = 'https://allcity-transport-erp.onrender.com/api';
  private vehiclesUrl = `${this.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Add Vehicle (JSON only)
  addVehicle(vehicle: Vehicle): Observable<any> {
    // For now, send JSON without file upload until backend supports multipart
    const vehicleData = {
      vehicleRegNo: vehicle.vehicleRegNo,
      permitLevel: vehicle.permitLevel,
      driverMob: vehicle.driverMob,
      vehicleType: vehicle.vehicleType,
      price: vehicle.price,
      capacity: vehicle.capacity,
      description: vehicle.description,
      originCity: vehicle.originCity,
      destinationCity: vehicle.destinationCity,
      vehicleStatus: vehicle.vehicleStatus
    };

    return this.http.post<Vehicle>(`${this.vehiclesUrl}/add-vehicle`, vehicleData, { headers: this.getHeaders() });
  }

  // ✅ Add Vehicle with File Upload
  addVehicleWithFile(formData: FormData): Observable<any> {
    // Use different headers for multipart/form-data (don't set Content-Type)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
      // Don't set Content-Type for FormData - let browser set it with boundary
    });

    return this.http.post<any>(`${this.vehiclesUrl}/add-vehicle`, formData, { headers });
  }

  // ✅ Get All Vehicles
  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.vehiclesUrl}/all`, { headers: this.getHeaders() });
  }

  // ✅ Get Vehicle by DB ID
  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.vehiclesUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Get Vehicle by Business Vehicle ID (VH-xxxx)
  getVehicleByVehicleId(vehicleId: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.vehiclesUrl}/by-vehicle-id/${vehicleId}`, { headers: this.getHeaders() });
  }

  // ✅ Update Vehicle
  updateVehicle(id: number, vehicle: Vehicle): Observable<any> {
    const vehicleData = {
      vehicleRegNo: vehicle.vehicleRegNo,
      permitLevel: vehicle.permitLevel,
      driverMob: vehicle.driverMob,
      vehicleType: vehicle.vehicleType,
      price: vehicle.price,
      capacity: vehicle.capacity,
      description: vehicle.description,
      originCity: vehicle.originCity,
      destinationCity: vehicle.destinationCity,
      vehicleStatus: vehicle.vehicleStatus
    };

    return this.http.put<any>(`${this.vehiclesUrl}/update/${id}`, vehicleData, { headers: this.getHeaders() });
  }

  // ✅ Update Vehicle with File Upload
  updateVehicleWithFile(id: number, formData: FormData): Observable<any> {
    // Use different headers for multipart/form-data (don't set Content-Type)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
      // Don't set Content-Type for FormData - let browser set it with boundary
    });

    return this.http.put<any>(`${this.vehiclesUrl}/update/${id}`, formData, { headers });
  }

  // ✅ Delete Vehicle
  deleteVehicle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.vehiclesUrl}/delete/${id}`, { headers: this.getHeaders() });
  }
}
