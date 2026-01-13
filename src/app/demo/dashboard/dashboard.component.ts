import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Chart, registerables } from 'chart.js';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BookingService } from '../vehicle-management/bookings/services/booking.service';
import { DriverService } from '../vehicle-management/drivers/services/driver.service';

Chart.register(...registerables);

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  currentTime: string = '';

  // VEHICLE IMAGE LIST
  vehicleImages: string[] = [
    'assets/images/vehicles/truck-green.png',
    'assets/images/vehicles/loader-yellow.png',
    'assets/images/vehicles/mini-truck-white.png',
    'assets/images/vehicles/pickup-red.png'
  ];

  // ENHANCED STATUS CARDS
  statusCards = [
    { title: 'AVAILABLE VEHICLES', icon: 'icon-fa truck', amount: 128, progress: 60, bg: 'bg-primary', cardClass: 'card-stats-primary' },
    { title: 'IN PROGRESS', icon: 'icon-refresh-ccw text-success', amount: 45, progress: 85, bg: 'bg-success', cardClass: 'card-stats-success' },
    { title: 'MAINTENANCE', icon: 'fa-solid fa-wrench', amount: 7, progress: 40, bg: 'bg-danger', cardClass: 'card-stats-danger' },
    { title: 'PENDING', icon: 'icon-clock text-warning', amount: '10', progress: 75, bg: 'bg-warning', cardClass: 'card-stats-warning' },
    { title: 'OVERDUE', icon: 'icon-alert-triangle text-info', amount: 38, progress: 65, bg: 'bg-info', cardClass: 'card-stats-info' },
    { title: 'COMPLETED', icon: 'icon-check text-success', amount: 83, progress: 90, bg: 'bg-success', cardClass: 'card-stats-success' },
    { title: 'ACTIVE BOOKINGS', icon: 'icon-book text-secondary', amount: '60', progress: 55, bg: 'bg-secondary', cardClass: 'card-stats-secondary' },
    { title: 'DRIVERS AVAILABLE', icon: 'icon-users text-warning', amount: '50', progress: 95, bg: 'bg-warning', cardClass: 'card-stats-warning' },
    { title: 'CUSTOMER SATISFACTION', icon: 'icon-star text-info', amount: '4.8/5', progress: 92, bg: 'bg-info', cardClass: 'card-stats-info' }
  ];


  // Quick actions
  quickActions = [
    { title: 'New Booking', icon: 'icon-plus', url: '/bookings', color: 'btn-primary' },
    { title: 'Booked Vehicles', icon: 'icon-truck', url: '/booked-vehicles', color: 'btn-success' },
    { title: 'Reports', icon: 'icon-bar-chart', url: '/vehicle-booking-reports', color: 'btn-info' },
    { title: 'Manage Drivers', icon: 'icon-users', url: '/drivers', color: 'btn-warning' }
  ];

  // Recent Activities Feed
  recentActivities = [
    { type: 'booking', message: 'New booking created for Truck #T-102', time: '2 minutes ago', icon: 'icon-calendar', color: 'text-primary' },
    { type: 'maintenance', message: 'Oil change completed for Vehicle #V-045', time: '15 minutes ago', icon: 'icon-wrench', color: 'text-success' },
    { type: 'driver', message: 'Driver John Smith completed delivery', time: '1 hour ago', icon: 'icon-truck', color: 'text-info' },
    { type: 'alert', message: 'Vehicle #V-078 due for inspection', time: '2 hours ago', icon: 'icon-alert-triangle', color: 'text-warning' },
    { type: 'booking', message: 'Booking cancelled for Car #C-015', time: '3 hours ago', icon: 'icon-x', color: 'text-danger' }
  ];



  // Fuel Consumption
  fuelData = {
    currentEfficiency: 85,
    targetEfficiency: 90,
    fuelSaved: '1,250 L',
    costSaved: '₹45,000',
    monthlyConsumption: '8,500 L'
  };

  // Maintenance Alerts
  maintenanceAlerts = [
    { vehicle: 'Truck #T-102', type: 'Oil Change', dueIn: '3 days', priority: 'high' },
    { vehicle: 'Car #C-015', type: 'Tire Rotation', dueIn: '1 week', priority: 'medium' },
    { vehicle: 'Van #V-045', type: 'Brake Inspection', dueIn: '2 weeks', priority: 'low' }
  ];



  // Driver Performance
  topDrivers = [
    { name: 'Rajesh Kumar', rating: 4.9, deliveries: 45, efficiency: '98%' },
    { name: 'Priya Singh', rating: 4.8, deliveries: 42, efficiency: '96%' },
    { name: 'Amit Patel', rating: 4.7, deliveries: 38, efficiency: '95%' }
  ];

  // System Alerts
  systemAlerts = [
    { type: 'warning', message: '3 vehicles have low fuel levels', count: 3 },
    { type: 'info', message: '2 drivers on leave this week', count: 2 },
    { type: 'success', message: 'All maintenance schedules up to date', count: 0 }
  ];

  constructor() {
    this.updateTime();
    // Update time every minute
    setInterval(() => this.updateTime(), 60000);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Image hover effects
  onHover(event: any) {
    event.target.style.transform = 'scale(1.1)';
    event.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
  }

  onLeave(event: any) {
    event.target.style.transform = 'scale(1)';
    event.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
  }

  // -------------------------
  // INIT CHARTS ON LOAD
  // -------------------------
  ngAfterViewInit(): void {
    this.loadTaskCompletionChart();
    this.loadVehicleSummaryChart();
  }

  // LINE CHART
  loadTaskCompletionChart() {
    const ctx = document.getElementById('taskChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [{
          label: 'Tasks Completed',
          data: [12, 19, 3, 7, 2],
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78,115,223,0.25)',
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#4e73df'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 20 }
        }
      }
    });
  }

  // DONUT CHART
  loadVehicleSummaryChart() {
    const ctx = document.getElementById('vehicleChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total', 'Priority', 'Completed'],
        datasets: [{
          data: [128, 5, 83],
          backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e'],
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }
}
