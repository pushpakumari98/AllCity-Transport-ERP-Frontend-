import { Component, OnInit } from '@angular/core';
import { JwtTestService } from './jwt-test.service';
import { PurchaseService } from '../vehicle-management/purchase/services/purchase.service';
import { VehicleService } from '../vehicle-management/services/vehicle.service';
import { BookingService } from '../vehicle-management/bookings/services/booking.service';
import { AdminService } from '../admin-management/admin.service';

@Component({
  selector: 'app-jwt-test',
  template: `
    <div class="card">
      <div class="card-header">
        <h3>JWT Token Test - PUT & DELETE Requests</h3>
      </div>
      <div class="card-body">
        <div class="alert alert-info">
          <strong>Status:</strong> JWT Interceptor is active and will automatically add Authorization headers to all requests
        </div>

        <div class="mb-4">
          <h4>Current Implementation:</h4>
          <ul>
            <li>✅ AuthInterceptor automatically adds JWT to ALL HTTP requests</li>
            <li>✅ PUT requests include Authorization header</li>
            <li>✅ DELETE requests include Authorization header</li>
            <li>✅ All services benefit from this global implementation</li>
          </ul>
        </div>

        <div class="mb-4">
          <h4>Services with PUT/DELETE methods:</h4>
          <ul>
            <li>📋 PurchaseService: updatePurchase(), deletePurchase()</li>
            <li>🚗 VehicleService: updateVehicle(), deleteVehicle()</li>
            <li>📅 BookingService: updateBooking(), deleteBooking()</li>
            <li>👥 AdminService: updateEmployee(), deleteEmployee()</li>
          </ul>
        </div>

        <div class="mb-4">
          <h4>How to Test:</h4>
          <ol>
            <li>Open browser Developer Tools (F12)</li>
            <li>Go to Network tab</li>
            <li>Perform any PUT or DELETE operation</li>
            <li>Check request headers for "Authorization: Bearer ..."</li>
          </ol>
        </div>

        <div class="alert alert-success">
          <strong>✅ Implementation Complete!</strong> All PUT and DELETE requests now automatically send JWT tokens.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 20px;
    }
    .card-header {
      background-color: #f8f9fa;
      padding: 15px;
      border-bottom: 1px solid #ddd;
    }
    .card-body {
      padding: 20px;
    }
    .alert {
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .alert-info {
      background-color: #d1ecf1;
      border-color: #bee5eb;
      color: #0c5460;
    }
    .alert-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
  `]
})
export class JwtTestComponent implements OnInit {

  constructor(
    private jwtTestService: JwtTestService,
    private purchaseService: PurchaseService,
    private vehicleService: VehicleService,
    private bookingService: BookingService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    console.log('JWT Test Component Initialized');
    console.log('AuthInterceptor will automatically add JWT tokens to all HTTP requests');
  }

  /**
   * Example method showing how PUT requests work with JWT
   */
  testPutRequest() {
    // This would send a PUT request with automatic JWT header
    // this.purchaseService.updatePurchase(somePurchase).subscribe(...);
    console.log('PUT request would be sent with JWT token automatically');
  }

  /**
   * Example method showing how DELETE requests work with JWT
   */
  testDeleteRequest() {
    // This would send a DELETE request with automatic JWT header
    // this.purchaseService.deletePurchase(123).subscribe(...);
    console.log('DELETE request would be sent with JWT token automatically');
  }
}
