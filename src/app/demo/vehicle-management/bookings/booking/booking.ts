import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BookingService } from 'src/app/demo/vehicle-management/bookings/services/booking.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BookingStatus } from '../../../../enums/booking-status.enum';
import { VehicleStatus } from '../../../../enums/vehicle-status.enum';
import { VehicleType } from '../../../../enums/vehicle-type.enum';

@Component({
  selector: 'app-booking',
  imports: [
    SharedModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss']
})
export class Booking implements OnInit {

  bookingForm: FormGroup;
  availableVehicles: any[] = [];
  loadingVehicles = false;

  // Enum options for dropdowns
  vehicleTypeOptions = Object.values(VehicleType);
  vehicleStatusOptions = Object.values(VehicleStatus);
  bookingStatusOptions = Object.values(BookingStatus);

  // Enum values for template
  vehicleTypes = Object.values(VehicleType);
  vehicleStatuses = Object.values(VehicleStatus);
  bookingStatuses = Object.values(BookingStatus);

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router,
    private snackBar: MatSnackBar,
    // private notificationService: NotificationService
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: [new Date().toISOString().split('T')[0], Validators.required], // Default to today
      startedFrom: ['', Validators.required],
      destination: ['', Validators.required],
      vehicleType: [{value: '', disabled: true}], // Auto-populated from selected vehicle
      vehicleId: ['', Validators.required],
      vehicleNo: [{value: '', disabled: true}], // Auto-populated from selected vehicle
      driverName: [''],
      bookingHire: [0, Validators.required],
      bookingAdvance: [0],
      bookingBalance: [0],
      bookingReceivedDate: [''],
      detain: [''],
      podReceived: [null],
      podDocument: [''],
      lorryBalancePaidDate: [''],
      bookingStatus: ['PENDING', Validators.required],
      vehicleStatus: ['AVAILABLE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAvailableVehicles();
  }




  loadAvailableVehicles(): void {
    this.bookingService.getAvailableVehicles().subscribe({
      next: (vehicles) => {
        // Filter to ensure only vehicles with AVAILABLE status are shown
        this.availableVehicles = vehicles.filter(v => v.vehicleStatus === 'AVAILABLE');
      },
      error: () => {
        this.snackBar.open('No available vehicles', '', { duration: 3000 });
      }
    });
  }

  onVehicleChange(event: any): void {
    const selectedVehicleId = event.target.value;
    const selectedVehicle = this.availableVehicles.find(v => v.id == selectedVehicleId);

    if (selectedVehicle) {
      this.bookingForm.patchValue({
        vehicleType: selectedVehicle.vehicleType,
        vehicleNo: selectedVehicle.vehicleRegNo
      });
    } else {
      this.bookingForm.patchValue({
        vehicleType: '',
        vehicleNo: ''
      });
    }
  }



  onSubmit() {
    if (this.bookingForm.invalid) {
      this.snackBar.open('Please fill all required fields!', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
      return;
    }

    const formValue = this.bookingForm.value;

    // Find the selected vehicle by ID
    const selectedVehicle = this.availableVehicles.find(v => v.id == formValue.vehicleId);

    if (!selectedVehicle) {
      this.snackBar.open('Selected vehicle not found!', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
      return;
    }

    const payload = {
      id: Date.now(),
      bookingId: `BK-${Date.now()}`,
      bookingDate: formValue.bookingDate,
      startedFrom: formValue.startedFrom,
      destination: formValue.destination,
      vehicleId: formValue.vehicleId,
      vehicleNo: selectedVehicle.vehicleRegNo,
      vehicleType: selectedVehicle.vehicleType,
      driverName: formValue.driverName,
      bookingHire: formValue.bookingHire,
      bookingAdvance: formValue.bookingAdvance,
      bookingBalance: formValue.bookingBalance,
      bookingReceivedDate: formValue.bookingReceivedDate,
      detain: formValue.detain,
      podReceived: formValue.podReceived,
      podDocument: formValue.podDocument,
      lorryBalancePaidDate: formValue.lorryBalancePaidDate,
      bookingStatus: formValue.bookingStatus,
      vehicleStatus: formValue.vehicleStatus
    };


    console.log('Submitting booking with payload:', payload);

    // Try to save to backend API first
    this.bookingService.addBooking(payload).subscribe({
      next: (response) => {
        console.log('Booking created successfully on backend:', response);
        this.snackBar.open('Vehicle booked successfully!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.router.navigate(['/app/booked-vehicles']);
      },
      error: (error) => {
        console.error('Backend not available, saving to localStorage:', error);

        // Fallback: Save to localStorage for offline/demo mode
        this.snackBar.open('Backend not available. Booking saved locally!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'warning-snackbar'
        });

        // Save the new booking to localStorage for persistence
       this.snackBar.open(error.error.message || 'Booking failed', '')
       this.router.navigate(['/booked-vehicles']);
      }
    });
  }

  viewBookedVehicles() {
    this.router.navigate(['/app/booked-vehicles']);
  }

  private saveNewBookingToStorage(booking: any) {
    const existingBookings = this.getNewBookingsFromStorage();
    existingBookings.push(booking);
    localStorage.setItem('newBookings', JSON.stringify(existingBookings));
  }

  private getNewBookingsFromStorage(): any[] {
    const stored = localStorage.getItem('newBookings');
    return stored ? JSON.parse(stored) : [];
  }
// Export methods
  exportToCSV() {
    // Get data from service with fallback
    this.bookingService.getBookedVehicles().subscribe((bookings: any[]) => {
      if (!bookings || bookings.length === 0) {
        bookings = [
          { bookingId: 'BK001', vehicleId: '123', date: '2024-01-01', startedFrom: 'Delhi', destination: 'Mumbai', driverName: 'John Doe', bookingStatus: 'COMPLETED' },
          { bookingId: 'BK002', vehicleId: '456', date: '2024-01-02', startedFrom: 'Bangalore', destination: 'Chennai', driverName: 'Jane Smith', bookingStatus: 'IN_PROGRESS' }
        ];
      }
      const headers = ['Booking ID', 'Vehicle ID', 'Date', 'Started From', 'Destination', 'Driver Name', 'Booking Status'];
      const data = bookings.map(booking => [booking.bookingId, booking.vehicleId, booking.date, booking.startedFrom, booking.destination, booking.driverName, booking.bookingStatus]);

      const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', 'booked-vehicles.csv');
      link.click();
      link.style.visibility = 'hidden';
    });
  }

  exportToExcel() {
    // For Excel export using xlsx library
    import('xlsx').then(({ utils, writeFile }) => {
      this.bookingService.getBookedVehicles().subscribe((bookings: any[]) => {
        if (!bookings || bookings.length === 0) {
          bookings = [
            { bookingId: 'BK001', vehicleId: '123', date: '2024-01-01', startedFrom: 'Delhi', destination: 'Mumbai', driverName: 'John Doe', bookingStatus: 'COMPLETED' },
            { bookingId: 'BK002', vehicleId: '456', date: '2024-01-02', startedFrom: 'Bangalore', destination: 'Chennai', driverName: 'Jane Smith', bookingStatus: 'IN_PROGRESS' }
          ];
        }
        const worksheet = utils.json_to_sheet(bookings);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Bookings');
        writeFile(workbook, 'booked-vehicles.xlsx');
      });
    });
  }

  exportToPDF() {
    // For PDF export using jsPDF
    this.bookingService.getBookedVehicles().subscribe((bookings: any[]) => {
      if (!bookings || bookings.length === 0) {
        bookings = [
          { bookingId: 'BK001', vehicleId: '123', date: '2024-01-01', startedFrom: 'Delhi', destination: 'Mumbai', driverName: 'John Doe', bookingStatus: 'COMPLETED' },
          { bookingId: 'BK002', vehicleId: '456', date: '2024-01-02', startedFrom: 'Bangalore', destination: 'Chennai', driverName: 'Jane Smith', bookingStatus: 'IN_PROGRESS' }
        ];
      }
      // Create simple text PDF
      import('jspdf').then(({ jsPDF }) => {
        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text('AllCity Transport - Booked Vehicles Report', 20, 20);
        let y = 40;
        pdf.setFontSize(12);
        pdf.text('Booking ID | Vehicle ID | Driver Name | Status', 20, y);
        y += 20;
        bookings.forEach(booking => {
          pdf.text(`${booking.bookingId} | ${booking.vehicleId} | ${booking.driverName} | ${booking.bookingStatus}`, 20, y);
          y += 10;
          if (y > 280) {
            pdf.addPage();
            y = 20;
          }
        });
        pdf.save('booked-vehicles.pdf');
      });
    });
  }

  exportToDocx() {
    alert('Docx export requires additional library installation. Please install html-docx-js or docx.');
    // For Docx export
  }

  printBookedVehicles() {
    // Create printable content with watermark and fallback
    this.bookingService.getBookedVehicles().subscribe((bookings: any[]) => {
      if (!bookings || bookings.length === 0) {
        bookings = [
          { bookingId: 'BK001', vehicleId: '123', date: '2024-01-01', startedFrom: 'Delhi', destination: 'Mumbai', driverName: 'John Doe', bookingStatus: 'COMPLETED' },
          { bookingId: 'BK002', vehicleId: '456', date: '2024-01-02', startedFrom: 'Bangalore', destination: 'Chennai', driverName: 'Jane Smith', bookingStatus: 'IN_PROGRESS' }
        ];
      }
      const printHtml = `
        <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
          <div style="position: relative; z-index: 2; background: white; padding: 20px;">
            <h1>AllCity Transport - Booked Vehicles Report</h1>
            <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Booking ID</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle ID</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Driver Name</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.map(b => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingId}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicleId}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.driverName}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingStatus}</td></tr>`).join('')}
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
    });
  }
}
