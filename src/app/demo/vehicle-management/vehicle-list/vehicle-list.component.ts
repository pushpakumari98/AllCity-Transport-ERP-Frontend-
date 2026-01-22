import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Vehicle } from '../../../model/vehicle.model';
import { SharedModule } from '../../../theme/shared/shared.module';
import { VehicleService } from '../services/vehicle.service';
import { ConfirmationDialogComponent } from '../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { VehicleModalComponent } from '../vehicle-modal/vehicle-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehicle-list',
  imports: [SharedModule, CommonModule, ConfirmationDialogComponent, VehicleModalComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss']
})
export class VehicleListComponent implements OnInit {

  vehicles: Vehicle[] = [];
  loading = false;
  showConfirmationDialog = false;
  showVehicleModal = false;
  editMode = false;
  vehicleToDelete?: Vehicle;
  selectedVehicle?: Vehicle;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Add a small delay to ensure any recent additions are loaded
    setTimeout(() => {
      this.loadVehicles();
    }, 500);
  }

  loadVehicles(): void {
    this.loading = true;
    console.log('Loading vehicles from backend...');
    console.log('Calling API endpoint:', this.vehicleService['vehiclesUrl'] + '/all');

    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => {
        console.log('Raw response from backend:', data);
        console.log('Response type:', typeof data);
        console.log('Response is array:', Array.isArray(data));

        if (Array.isArray(data)) {
          this.vehicles = data;
          console.log(`Successfully loaded ${data.length} vehicles`);
        } else {
          console.error('Response is not an array:', data);
          this.vehicles = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        console.error('Error status:', error.status);
        console.error('Error status text:', error.statusText);
        console.error('Error URL:', error.url);
        console.error('Full error:', error);

        // Show error message to user
        this.snackBar.open('Failed to load vehicles. Please check backend connection.', '', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'error-snackbar'
        });

        this.vehicles = [];
        this.loading = false;
      }
    });
  }

  addNewVehicle(): void {
    this.router.navigate(['/app/add-vehicle']);
  }

  editVehicle(vehicle: Vehicle): void {
    this.editMode = true;
    this.selectedVehicle = vehicle;
    this.showVehicleModal = true;
  }

  deleteVehicle(vehicle: Vehicle): void {
    this.vehicleToDelete = vehicle;
    this.showConfirmationDialog = true;
  }

  // Confirmation dialog event handlers
  onConfirmDelete(): void {
    if (this.vehicleToDelete) {
      this.showConfirmationDialog = false;
      this.vehicleService.deleteVehicle(this.vehicleToDelete.id!).subscribe({
        next: () => {
          this.loadVehicles(); // Reload the list
          this.vehicleToDelete = undefined;
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          this.vehicleToDelete = undefined;
        }
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmationDialog = false;
    this.vehicleToDelete = undefined;
  }

  // Vehicle modal event handlers
  closeVehicleModal(): void {
    this.showVehicleModal = false;
    this.selectedVehicle = undefined;
    this.editMode = false;
  }

  onVehicleSaved(vehicle: any): void {
    // Small delay to ensure backend has processed the image
    setTimeout(() => {
      this.loadVehicles(); // Refresh the list
    }, 1000);
  }

  getStatusBadgeClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'in_progress':
        return 'bg-warning';
      case 'completed':
        return 'bg-info';
      case 'pending':
        return 'bg-secondary';
      case 'overdue':
        return 'bg-danger';
      case 'maintenance':
        return 'bg-dark';
      default:
        return 'bg-success'; // Default to available
    }
  }

  // Export methods
  exportToCSV() {
    console.log('Export to CSV called', this.vehicles.length);
    const data = this.vehicles.map(vehicle => [
      vehicle.vehicleId || '',
      vehicle.vehicleRegNo || '',
      vehicle.vehicleType || '',
      vehicle.permitLevel || '',
      vehicle.driverMob || '',
      vehicle.price || '',
      vehicle.capacity || '',
      vehicle.originCity || '',
      vehicle.destinationCity || '',
      vehicle.description || ''
    ]);

    const headers = ['Vehicle ID', 'Registration No', 'Vehicle Type', 'Permit Level', 'Driver Mobile', 'Price', 'Capacity', 'Origin City', 'Destination City', 'Description'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-list.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.target = '_blank';
    link.click();
    document.body.removeChild(link);
    console.log('CSV download triggered');
  }

  exportToExcel() {
    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.vehicles);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Vehicles');
      writeFile(workbook, 'vehicle-list.xlsx');
    });
  }

  exportToPDF() {
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Vehicle List', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Vehicle ID | Reg No | Type | Permit | Mobile | Price', 20, y);
      y += 20;
      this.vehicles.forEach(vehicle => {
        pdf.text(`${vehicle.vehicleId} | ${vehicle.vehicleRegNo} | ${vehicle.vehicleType} | ${vehicle.permitLevel} | ${vehicle.driverMob} | ${vehicle.price}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('vehicle-list.pdf');
    });
  }

  exportToDocx() {
    const htmlContent = `
      <html>
        <head><title>AllCity Transport - Vehicle List</title></head>
        <body>
          <h1>AllCity Transport - Vehicle Report</h1>
          <table border="1" style="border-collapse: collapse;">
            <tr>
              <th>Vehicle ID</th><th>Registration No</th><th>Vehicle Type</th><th>Permit Level</th><th>Driver Mobile</th><th>Price</th><th>Capacity</th><th>Origin City</th><th>Destination City</th><th>Description</th>
            </tr>
            ${this.vehicles.map(v => `<tr><td>${v.vehicleId}</td><td>${v.vehicleRegNo}</td><td>${v.vehicleType}</td><td>${v.permitLevel}</td><td>${v.driverMob}</td><td>${v.price}</td><td>${v.capacity}</td><td>${v.originCity || '-'}</td><td>${v.destinationCity || '-'}</td><td>${v.description || '-'}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-list.doc';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printVehicles() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Vehicle List</h1>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle ID</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Registration No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle Type</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Permit Level</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Driver Mobile</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Price</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Capacity</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Origin City</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Destination City</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Description</th>
              </tr>
            </thead>
            <tbody>
              ${this.vehicles.map(v => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${v.vehicleId}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.vehicleRegNo}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.vehicleType}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.permitLevel}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.driverMob}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.price}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.capacity}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.originCity || '-'}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.destinationCity || '-'}</td><td style="border: 1px solid #ddd; padding: 8px;">${v.description || '-'}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
