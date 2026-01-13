import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { VehicleBooking } from 'src/app/demo/vehicle-management/bookings/models/vehicle-booking.model';
import { BookingService } from 'src/app/demo/vehicle-management/bookings/services/booking.service';
import { ConfirmationDialogComponent } from '../../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';

@Component({
  selector: 'app-booked-vehicles-list',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, BookingModalComponent, ConfirmationDialogComponent],
  templateUrl: './booked-vehicles-list.component.html',
  styleUrls: ['./booked-vehicles-list.component.scss']
})
export class BookedVehiclesListComponent implements OnInit {

  bookings: VehicleBooking[] = [];
  loading = false;
  showBookingModal = false;
  showConfirmationDialog = false;
  editMode = false;
  selectedBooking?: VehicleBooking;
  bookingToDelete?: VehicleBooking;
  hasLocalUpdates = false;

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  addBooking() {
    this.router.navigate(['/bookings']);
  }

  loadBookings() {
    this.loading = true;

    // Try to load from backend API first
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        console.log("BACKEND RESPONSE - All bookings:", res);
        this.bookings = res || [];
        this.hasLocalUpdates = false;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching bookings from backend, using localStorage:", err);

        // Fallback: Load bookings from localStorage (created by booking form)
        const localBookings = this.getBookingsFromStorage();
        this.bookings = localBookings;
        this.loading = false;

        if (this.bookings.length === 0) {
          this.snackBar.open('No bookings found. Backend not available and no local bookings exist.', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        } else {
          this.snackBar.open(`Loaded ${this.bookings.length} bookings from local storage`, '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        }
      }
    });
  }

  private getBookingsFromStorage(): VehicleBooking[] {
    const stored = localStorage.getItem('newBookings');
    return stored ? JSON.parse(stored) : [];
  }



  updateBooking(booking: VehicleBooking) {
    this.editMode = true;
    this.selectedBooking = booking;
    this.showBookingModal = true;
  }

  deleteBooking(booking: VehicleBooking) {
    this.bookingToDelete = booking;
    this.showConfirmationDialog = true;
  }

  // Event handlers
  closeBookingModal() {
    this.showBookingModal = false;
  }

  onConfirmDelete() {
    if (this.bookingToDelete) {
      this.showConfirmationDialog = false;
      this.bookingService.deleteBooking(this.bookingToDelete.id).subscribe({
        next: () => {
          this.removeBookingFromList(this.bookingToDelete!.id);
          this.bookingToDelete = undefined;
        },
        error: (err) => {
          console.error('Error deleting booking:', err);
          this.removeBookingFromList(this.bookingToDelete!.id); // Remove anyway for demo
          this.bookingToDelete = undefined;
        }
      });
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.bookingToDelete = undefined;
  }

  onBookingSaved(updatedBooking: any) {
    if (!this.hasLocalUpdates) {
      this.bookings = [...this.bookings];
      this.hasLocalUpdates = true;
    }

    const index = this.bookings.findIndex(b => b.id === updatedBooking.id);
    if (index !== -1) {
      // Update existing booking
      this.bookings[index] = { ...this.bookings[index], ...updatedBooking };
    } else {
      // Add new booking
      const newId = Date.now();
      this.bookings.push({ id: newId, ...updatedBooking });
    }
    this.bookings = [...this.bookings]; // Trigger change detection
  }

  private removeBookingFromList(bookingId: number) {
    if (!this.hasLocalUpdates) {
      this.bookings = [...this.bookings];
      this.hasLocalUpdates = true;
    }
    this.bookings = this.bookings.filter(b => b.id !== bookingId);

    // Also update localStorage
    const localBookings = this.getBookingsFromStorage();
    const updatedLocalBookings = localBookings.filter(b => b.id !== bookingId);
    localStorage.setItem('newBookings', JSON.stringify(updatedLocalBookings));
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'completed':
        return 'badge-info';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  trackByBookingId(index: number, booking: VehicleBooking): string {
    return booking.bookingId;
  }

  // Export methods
  exportToCSV() {
    console.log('Export to CSV called', this.bookings.length);
    const data = this.bookings.map(booking => [booking.bookingId || '', booking.vehicleId || '', booking.vehicleType || '', booking.driverName || '', booking.startedFrom || '', booking.destination || '', booking.bookingStatus || '', booking.vehicleStatus || '']);

    const headers = ['Booking ID', 'Vehicle ID', 'Vehicle Type', 'Driver Name', 'Started From', 'Destination', 'Booking Status', 'Vehicle Status'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]); // Removed charset to ensure browser compatibility
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'booked-vehicles-list.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.target = '_blank'; // Added target
    link.click();
    document.body.removeChild(link);
    console.log('CSV download triggered');
  }

  exportToExcel() {
    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.bookings);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Booked Vehicles');
      writeFile(workbook, 'booked-vehicles-list.xlsx');
    });
  }

  exportToPDF() {
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Booked Vehicles List', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Booking ID | Vehicle Type | Driver | Status', 20, y);
      y += 20;
      this.bookings.forEach(booking => {
        pdf.text(`${booking.bookingId} | ${booking.vehicleType} | ${booking.driverName} | ${booking.bookingStatus}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('booked-vehicles-list.pdf');
    });
  }

  exportToDocx() {
    // Simple HTML to Docx implementation
    const htmlContent = `
      <html>
        <head><title>AllCity Transport - Booked Vehicles List</title></head>
        <body>
          <h1>AllCity Transport - Booked Vehicles Report</h1>
          <table border="1" style="border-collapse: collapse;">
            <tr>
              <th>Booking ID</th><th>Vehicle ID</th><th>Vehicle Type</th><th>Driver Name</th><th>Started From</th><th>Destination</th><th>Booking Status</th><th>Vehicle Status</th>
            </tr>
            ${this.bookings.map(b => `<tr><td>${b.bookingId}</td><td>${b.vehicleId}</td><td>${b.vehicleType}</td><td>${b.driverName}</td><td>${b.startedFrom}</td><td>${b.destination}</td><td>${b.bookingStatus}</td><td>${b.vehicleStatus}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'booked-vehicles-list.doc';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printBookedVehicles() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Booked Vehicles List</h1>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Booking ID</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle ID</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle Type</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Driver Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Started From</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Destination</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Booking Status</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.bookings.map(b => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingId}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicleId}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicleType}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.driverName}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.startedFrom}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.destination}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingStatus}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicleStatus}</td></tr>`).join('')}
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
