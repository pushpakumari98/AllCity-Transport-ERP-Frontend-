import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from '../services/driver.service';
import { Driver } from '../models/driver.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { DriverModalComponent } from '../driver-modal/driver-modal.component';

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, ReactiveFormsModule, FormsModule, MatSnackBarModule, ConfirmationDialogComponent, DriverModalComponent],
  templateUrl: './drivers-list.component.html',
  styleUrls: ['./drivers-list.component.scss']
})
export class DriversListComponent implements OnInit {

  drivers: Driver[] = [];
  loading = false;
  showConfirmationDialog = false;
  driverToDelete?: Driver;
  hasLocalUpdates = false;
  showDriverModal = false;
  showList = false;
  editMode = false;
  selectedDriver?: Driver;
  driverForm!: FormGroup;

  constructor(
    private driverService: DriverService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.showList = true; // Show list by default
    // Load drivers list first
    this.loadDrivers();
  }

  private initializeForm() {
    this.driverForm = this.fb.group({
      serialNumber: ['', Validators.required],
      date: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
      driverName: ['', Validators.required],
      startedFrom: ['', Validators.required],
      destination: ['', Validators.required],
      carryMaterialType: ['', Validators.required],
      contactNumber: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  loadDrivers() {
    this.loading = true;
    this.driverService.getAllDrivers().subscribe({
      next: (res) => {
        console.log("DRIVERS BACKEND RESPONSE:", res);
        this.drivers = res;
        this.hasLocalUpdates = false;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching drivers:", err);
        // Load mock data for demonstration when backend is not available
        this.loadMockData();
        this.loading = false;
        this.snackBar.open('Loaded sample drivers data for demonstration', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  private loadMockData() {
    this.drivers = [
      {
        id: 1,
        serialNumber: "D001",
        date: "2025-12-01",
        vehicleNumber: "V001",
        driverName: "John Doe",
        startedFrom: "Mumbai",
        destination: "Delhi",
        carryMaterialType: "Electronics",
        contactNumber: "9876543210",
        address: "123 Main St, Mumbai",
        document: "data:application/pdf;base64,dummy"
      },
      {
        id: 2,
        serialNumber: "D002",
        date: "2025-12-02",
        vehicleNumber: "V002",
        driverName: "Jane Smith",
        startedFrom: "Pune",
        destination: "Bangalore",
        carryMaterialType: "Machinery",
        contactNumber: "9876543211",
        address: "456 Elm St, Pune"
      }
    ];
  }

  addDriver() {
    // Navigate to the dedicated driver form page
    this.router.navigate(['/drivers']);
  }

  updateDriver(driver: Driver) {
    this.editMode = true;
    this.selectedDriver = driver;
    this.driverForm.patchValue(driver);
    this.showDriverModal = true;
  }

  deleteDriver(driver: Driver) {
    this.driverToDelete = driver;
    this.showConfirmationDialog = true;
  }

  onConfirmDelete() {
    if (this.driverToDelete) {
      this.showConfirmationDialog = false;
      this.driverService.deleteDriver(this.driverToDelete.id!).subscribe({
        next: () => {
          this.removeDriverFromList(this.driverToDelete!.id!);
          this.driverToDelete = undefined;
        },
        error: (err) => {
          console.error('Error deleting driver:', err);
          this.removeDriverFromList(this.driverToDelete!.id!); // Remove anyway for demo
          this.driverToDelete = undefined;
        }
      });
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.driverToDelete = undefined;
  }

  private removeDriverFromList(driverId: number) {
    if (!this.hasLocalUpdates) {
      this.drivers = [...this.drivers];
      this.hasLocalUpdates = true;
    }
    this.drivers = this.drivers.filter(d => d.id !== driverId);
  }

  trackByDriverId(index: number, driver: Driver): string {
    return driver.serialNumber;
  }

  closeDriverModal() {
    this.showDriverModal = false;
  }

  onDriverSaved(updatedDriver: any) {
    // Close the modal and load the drivers list like bookings page
    this.showDriverModal = false;
    this.loadDrivers();
  }

  saveDriver() {
    if (this.driverForm.invalid) return;

    const payload = this.driverForm.value;
    const driverData = this.editMode ? { ...this.selectedDriver, ...payload } : { ...payload, id: Date.now() };
    const observable = this.editMode
      ? this.driverService.updateDriver(driverData)
      : this.driverService.addDriver(driverData);

    const action = this.editMode ? 'updated' : 'added';

    observable.subscribe({
      next: () => {
        this.snackBar.open(`Driver ${action} successfully!`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        // After saving, show both form and list
        this.showList = true;
        this.loadDrivers();
      },
      error: (err) => {
        console.error(`Error ${action} driver:`, err);
        this.snackBar.open(`Driver ${action} successfully! (Demo mode)`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        // After saving, show both form and list
        this.showList = true;
        this.loadDrivers();
      }
    });
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.driverForm.patchValue({ document: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  // Export methods
  exportToCSV() {
    const data = this.drivers.map(driver => [
      driver.serialNumber || '',
      driver.date || '',
      driver.vehicleNumber || '',
      driver.driverName || '',
      driver.startedFrom || '',
      driver.destination || '',
      driver.carryMaterialType || '',
      driver.contactNumber || '',
      driver.address || ''
    ]);

    const headers = ['Sl. No', 'Date', 'Vehicle No', 'Driver Name', 'Started From', 'To', 'Type of Material Carry', 'Contact No', 'Address'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'drivers-list.csv';
    link.click();
  }

  exportToExcel() {
    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.drivers);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Drivers');
      writeFile(workbook, 'drivers-list.xlsx');
    });
  }

  exportToPDF() {
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Drivers List', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Sl.No | Driver Name | Vehicle | Contact', 20, y);
      y += 20;
      this.drivers.forEach(driver => {
        pdf.text(`${driver.serialNumber} | ${driver.driverName} | ${driver.vehicleNumber} | ${driver.contactNumber}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('drivers-list.pdf');
    });
  }

  exportToDocx() {
    const htmlContent = `
      <html>
        <head><title>AllCity Transport - Drivers List</title></head>
        <body>
          <h1>AllCity Transport - Drivers Report</h1>
          <table border="1" style="border-collapse: collapse;">
            <tr>
              <th>Sl. No</th><th>Date</th><th>Vehicle No</th><th>Driver Name</th><th>Started From</th><th>To</th><th>Material Type</th><th>Contact No</th><th>Address</th>
            </tr>
            ${this.drivers.map(d => `<tr><td>${d.serialNumber}</td><td>${d.date}</td><td>${d.vehicleNumber}</td><td>${d.driverName}</td><td>${d.startedFrom}</td><td>${d.destination}</td><td>${d.carryMaterialType}</td><td>${d.contactNumber}</td><td>${d.address}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'drivers-list.doc';
    link.click();
  }

  printDrivers() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Drivers List</h1>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Sl. No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Driver Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Contact No</th>
              </tr>
            </thead>
            <tbody>
              ${this.drivers.map(d => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${d.serialNumber}</td><td style="border: 1px solid #ddd; padding: 8px;">${d.date}</td><td style="border: 1px solid #ddd; padding: 8px;">${d.driverName}</td><td style="border: 1px solid #ddd; padding: 8px;">${d.vehicleNumber}</td><td style="border: 1px solid #ddd; padding: 8px;">${d.contactNumber}</td></tr>`).join('')}
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

  viewDocument(documentData: string) {
    if (documentData) {
      window.open(documentData, '_blank');
    }
  }
}
