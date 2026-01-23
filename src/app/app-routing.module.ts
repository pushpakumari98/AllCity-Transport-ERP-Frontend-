import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layouts
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

// Guards
import { AuthGuard, GuestGuard } from './shared/services/auth.guard';

// Components
import { AdminComponent as AdminManagementComponent } from './demo/admin-management/admin.component'; // <-- Your AdminManagement page
import { EventComponent } from './demo/event-management/events/event/event.component';

const routes: Routes = [
  // Default route - redirect to login
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Guest layout (login/register) - accessible only to non-authenticated users
  {
    path: 'auth',
    component: GuestComponent,
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-signin/auth-signin.component').then(c => c.AuthSigninComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/auth-signup/auth-signup.component').then(c => c.AuthSignupComponent)
      }
    ]
  },

  // Authenticated routes - protected by AuthGuard
  {
    path: 'app',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./demo/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then(m => m.UiBasicModule)
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/pages/tables/tbl-bootstrap/tbl-bootstrap.component').then(c => c.TblBootstrapComponent)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component').then(c => c.ApexChartComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component').then(c => c.SamplePageComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./demo/vehicle-management/bookings/booking/booking').then(c => c.Booking)
      },
      {
        path: 'sale',
        loadComponent: () => import('./demo/vehicle-management/sales/sale/sale').then(c => c.SaleComponent)
      },
      {
        path: 'vehicle-sales-list',
        loadComponent: () => import('./demo/vehicle-management/sales/sales-list/sales-list.component').then(c => c.SalesListComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./demo/vehicle-management/drivers/driver').then(c => c.DriverComponent)
      },
      {
        path: 'drivers-list',
        loadComponent: () => import('./demo/vehicle-management/drivers/drivers-list/drivers-list.component').then(c => c.DriversListComponent)
      },
      {
        path: 'purchases',
        loadComponent: () => import('./demo/vehicle-management/purchase/purchase').then(c => c.PurchaseComponent)
      },
      {
        path: 'purchase-list',
        loadComponent: () => import('./demo/vehicle-management/purchase/purchase-list/purchase-list.component').then(c => c.PurchaseListComponent)
      },
      {
        path: 'add-vehicle',
        loadComponent: () => import('./demo/vehicle-management/add-vehicle/add-vehicle.component').then(c => c.AddVehicleComponent)
      },
      {
        path: 'vehicle-list',
        loadComponent: () => import('./demo/vehicle-management/vehicle-list/vehicle-list.component').then(c => c.VehicleListComponent)
      },
      {
        path: 'vehicle-booking-reports',
        loadComponent: () => import('./demo/reports/vehicle-booking-reports/vehicle-booking-reports.component').then(c => c.VehicleBookingReportsComponent)
      },
      {
        path: 'vehicle-sales-reports',
        loadComponent: () => import('./demo/reports/vehicle-sales-reports/vehicle-sales-reports.component').then(c => c.VehicleSalesReportsComponent)
      },
      {
        path: 'driver-reports',
        loadComponent: () => import('./demo/reports/driver-reports/driver-reports.component').then(c => c.DriverReportsComponent)
      },
      {
        path: 'employee-reports',
        loadComponent: () => import('./demo/reports/employee-reports/employee-reports.component').then(c => c.EmployeeReportsComponent)
      },
      {
        path: 'booked-vehicles',
     loadComponent: () =>
  import('./demo/vehicle-management/bookings/booked-vehicles-list/booked-vehicles-list.component')
  .then(c => c.BookedVehiclesListComponent)

  },
      { path: 'events', component: EventComponent },

      // ✅ Admin Management Page
      { path: 'admin-management', component: AdminManagementComponent },

      // ✅ Employee Management Page (Dedicated HR component)
      {
        path: 'employee-management',
        loadComponent: () => import('./demo/employee-management/employee-management').then(c => c.EmployeeManagement)
      },


      // ✅ HR Payroll Management Page
      {
        path: 'hr-payroll-management',
        loadComponent: () => import('./demo/hr-payroll-management/hr-payroll-management').then(c => c.HrPayrollManagement)
      },

      // ✅ Vehicle Purchase Reports Page
      {
        path: 'vehicle-purchase-reports',
        loadComponent: () => import('./demo/reports/vehicle-purchase-reports/vehicle-purchase-reports.component').then(c => c.VehiclePurchaseReportsComponent)
      }
    ]
  },

  // Catch-all redirect to login
  { path: '**', redirectTo: '/auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
